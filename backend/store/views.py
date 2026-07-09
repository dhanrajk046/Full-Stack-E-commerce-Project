import json
import re
from django.db.models import Q

from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Product, Category, Cart, CartItem, Order, OrderItem
from .serializers import (
    UserSerializer, 
    RegisterSerializer, 
    CategorySerializer, 
    ProductSerializer, 
    CartSerializer,
    OrderSerializer
)

# ⚡ Helper Function to fetch a fully optimized Cart
def get_optimized_cart(cart_id):
    return Cart.objects.select_related("user").prefetch_related("items__product").get(id=cart_id)


# ✅ Get all products (with optional search)
@api_view(["GET"])
@permission_classes([AllowAny])
def get_products(request):
    search = request.GET.get("search", "").strip()
    
    # ⚡ OPTIMIZED: Added select_related for category
    products = Product.objects.select_related("category").all()

    if search:
        products = products.filter(
            Q(name__icontains=search)
        )

    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)


# ✅ Get single product
@api_view(["GET"])
@permission_classes([AllowAny])
def get_product_details(request, pk):
    try:
        # ⚡ OPTIMIZED: Added select_related for category
        product = Product.objects.select_related("category").get(id=pk)
        serializer = ProductSerializer(product)
        return Response(serializer.data)
    except Product.DoesNotExist:
        return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)


# ✅ Get categories
@api_view(["GET"])
@permission_classes([AllowAny])
def get_categories(request):
    categories = Category.objects.all()
    serializer = CategorySerializer(categories, many=True)
    return Response(serializer.data)


# ✅ Get cart
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_cart(request):
    # IsAuthenticated guarantees request.user is a valid user
    cart, _ = Cart.objects.get_or_create(user=request.user)
    
    # ⚡ OPTIMIZED: Fetch the cart with prefetched items to avoid N+1 serialization
    optimized_cart = get_optimized_cart(cart.id)
    serializer = CartSerializer(optimized_cart)
    return Response(serializer.data)


# ✅ Add to cart
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_to_cart(request):
    product_id = request.data.get("product_id")

    if not product_id:
        return Response(
            {"error": "product_id is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return Response(
            {"error": "Product not found"},
            status=status.HTTP_404_NOT_FOUND,
        )

    cart, _ = Cart.objects.get_or_create(user=request.user)

    cart_item, created = CartItem.objects.get_or_create(
        cart=cart,
        product=product,
    )

    if not created:
        cart_item.quantity += 1
        cart_item.save()

    # ⚡ OPTIMIZED: Re-fetch cart with prefetch before serialization
    optimized_cart = get_optimized_cart(cart.id)
    serializer = CartSerializer(optimized_cart)

    return Response(
        {
            "message": "Product added to cart successfully",
            "cart": serializer.data,
        },
        status=status.HTTP_200_OK,
    )


# ✅ Update cart quantity
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def update_cart_quantity(request):
    item_id = request.data.get("item_id")
    quantity = request.data.get("quantity")

    if not item_id or quantity is None:
        return Response({"error": "item_id and quantity are required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # ⚡ OPTIMIZED: select_related on cart to prevent an extra query
        item = CartItem.objects.select_related("cart").get(id=item_id)

        if int(quantity) < 1:
            cart_id = item.cart.id
            item.delete()
            return Response(
                {"error": "Quantity must be at least 1. Item removed from cart."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        item.quantity = quantity
        item.save()
        
        # ⚡ OPTIMIZED: Fetch optimized cart
        optimized_cart = get_optimized_cart(item.cart.id)
        serializer = CartSerializer(optimized_cart)
        return Response({"message": "Cart updated", "cart": serializer.data})

    except CartItem.DoesNotExist:
        return Response({"error": "Item not found"}, status=status.HTTP_404_NOT_FOUND)


# ✅ Remove from cart
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def remove_from_cart(request, pk):
    try:
        # ⚡ OPTIMIZED: select_related on cart
        item = CartItem.objects.select_related("cart").get(id=pk)
        cart_id = item.cart.id
        item.delete()

        # ⚡ OPTIMIZED: Fetch optimized cart
        optimized_cart = get_optimized_cart(cart_id)
        return Response({"message": "Item removed", "cart": CartSerializer(optimized_cart).data})

    except CartItem.DoesNotExist:
        return Response({"error": "Item not found"}, status=status.HTTP_404_NOT_FOUND)


# ✅ Create order
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_order(request):
    try:
        data = request.data
        if isinstance(data, str):
            try:
                data = json.loads(data)
            except json.JSONDecodeError:
                return Response({"error": "Invalid JSON body"}, status=status.HTTP_400_BAD_REQUEST)

        name = data.get("name")
        address = data.get("address")
        phone = str(data.get("phone", "")).strip()
        payment_method = data.get("payment_method", "COD")

        digits = re.sub(r"\D", "", phone)
        if not digits or len(digits) < 7:
            return Response({"error": "Invalid phone number"}, status=status.HTTP_400_BAD_REQUEST)

        # ⚡ OPTIMIZED: Use get_or_create to guarantee we target the identical active cart,
        # then apply prefetch so we don't query the database inside the loop.
        cart, _ = Cart.objects.get_or_create(user=request.user)
        
        # Pull items out into memory. Checking the length leverages the cache safely.
        cart_items = list(cart.items.select_related("product").all())

        if len(cart_items) == 0:
            return Response({"error": "Cart is empty"}, status=status.HTTP_400_BAD_REQUEST)

        total = sum(
            float(item.product.price) * item.quantity for item in cart_items
        )

        order = Order.objects.create(user=request.user, total_price=total)

        # Create OrderItems - bulk_create is much faster here!
        # ⚡ OPTIMIZED: Replaced loop with bulk_create for massive speed increase
        order_items_to_create = [
            OrderItem(
                order=order,
                product=item.product,
                quantity=item.quantity,
                price=item.product.price,
            ) for item in cart_items
        ]
        OrderItem.objects.bulk_create(order_items_to_create)

        # Clear cart efficiently
        cart.items.all().delete()

        return Response({"message": "Order created successfully", "order_id": order.id})

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ✅ User Registration
@api_view(["POST"])
@permission_classes([AllowAny])
def register_view(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "user": UserSerializer(user).data,
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "message": "User registered successfully",
            },
            status=status.HTTP_201_CREATED,
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ✅ Get all orders for the logged-in user
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user_orders(request):
    orders = Order.objects.filter(user=request.user).prefetch_related('items__product').order_by('-id')
    # ✅ Pass request context so OrderItemSerializer can build absolute image URLs
    serializer = OrderSerializer(orders, many=True, context={'request': request})
    return Response(serializer.data)


# ✅ Get details for a specific order
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_order_details(request, pk):
    try:
        order = Order.objects.prefetch_related('items__product').get(id=pk, user=request.user)
        # ✅ Pass request context so OrderItemSerializer can build absolute image URLs
        serializer = OrderSerializer(order, context={'request': request})
        return Response(serializer.data)
    except Order.DoesNotExist:
        return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)