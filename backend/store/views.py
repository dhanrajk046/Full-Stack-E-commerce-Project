import json
import re

from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from django.contrib.auth.models import User
from .serializers import UserSerializer, RegisterSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Product, Category, Cart, CartItem, Order, OrderItem
from .serializers import CategorySerializer, ProductSerializer, CartSerializer


# ✅ Get all products
@api_view(["GET"])
@permission_classes([AllowAny])
def get_products(request):
    products = Product.objects.all()
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)


# ✅ Get single product
@api_view(["GET"])
@permission_classes([AllowAny])
def get_product_details(request, pk):
    try:
        product = Product.objects.get(id=pk)
        serializer = ProductSerializer(product)
        return Response(serializer.data)
    except Product.DoesNotExist:
        return Response({"error": "Product not found"}, status=404)


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
    cart, _ = Cart.objects.get_or_create(
        user=request.user if request.user.is_authenticated else None
    )
    serializer = CartSerializer(cart)
    return Response(serializer.data)


# ✅ Add to cart
@api_view(["POST"])
@permission_classes([AllowAny])
def add_to_cart(request):
    product_id = request.data.get("product_id")

    if product_id is None:
        return Response({"error": "product_id is required"}, status=400)

    try:
        product = Product.objects.get(id=product_id)
    except (Product.DoesNotExist, ValueError):
        return Response({"error": "Product not found"}, status=404)

    cart, _ = Cart.objects.get_or_create(
        user=request.user if request.user.is_authenticated else None
    )

    item, created = CartItem.objects.get_or_create(cart=cart, product=product)

    if not created:
        item.quantity += 1
        item.save()

    return Response(
        {"message": "Product added to cart", "cart": CartSerializer(cart).data}
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def update_cart_quantity(request):
    item_id = request.data.get("item_id")
    quantity = request.data.get("quantity")

    if not item_id or quantity is None:
        return Response({"error": "item_id and quantity are required"}, status=400)

    try:
        item = CartItem.objects.get(id=item_id)
        # cart = item.cart

        if int(quantity) < 1:
            item.delete()
            return Response(
                {"error": "Quantity must be at least 1. Item removed from cart."},
                status=400,
            )

        item.quantity = quantity
        item.save()
        # message = "Cart updated"
        serializer = CartSerializer(item.cart)
        return Response({"message": "Cart updated", "cart": serializer.data})

    except CartItem.DoesNotExist:
        return Response({"error": "Item not found"}, status=404)


# ✅ Remove from cart
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def remove_from_cart(request, pk):
    try:
        item = CartItem.objects.get(id=pk)
        cart = item.cart
        item.delete()

        return Response({"message": "Item removed", "cart": CartSerializer(cart).data})

    except CartItem.DoesNotExist:
        return Response({"error": "Item not found"}, status=404)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_order(request):
    try:
        data = request.data
        if isinstance(data, str):
            try:
                data = json.loads(data)
            except json.JSONDecodeError:
                return Response({"error": "Invalid JSON body"}, status=400)

        name = data.get("name")
        address = data.get("address")
        phone = str(data.get("phone", "")).strip()
        payment_method = data.get("payment_method", "COD")

        digits = re.sub(r"\D", "", phone)
        if not digits or len(digits) < 7:
            return Response({"error": "Invalid phone number"}, status=400)

        cart, created = Cart.objects.get_or_create(
            user=request.user if request.user.is_authenticated else None
        )

        if not cart.items.exists():
            return Response({"error": "Cart is empty"}, status=400)

        total = sum(
            float(item.product.price) * item.quantity for item in cart.items.all()
        )

        # Create Order - only assign user if authenticated
        user = request.user if request.user.is_authenticated else None
        order = Order.objects.create(user=user, total_price=total)

        # Create OrderItems
        for item in cart.items.all():
            OrderItem.objects.create(
                order=order,
                product=item.product,
                quantity=item.quantity,
                price=item.product.price,
            )

        # Clear cart
        cart.items.all().delete()

        return Response({"message": "Order created successfully", "order_id": order.id})

    except Exception as e:
        return Response({"error": str(e)}, status=500)


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


# {
#   "username": "myuser",
#   "email": "me@example.com",
#   "password": "123456",
#   "password2": "123456"
# }
