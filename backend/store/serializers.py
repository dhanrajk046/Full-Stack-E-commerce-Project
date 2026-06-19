from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Cart, CartItem, Category, Product, Order, OrderItem

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"


class ProductSerializer(serializers.ModelSerializer):
    # Nesting category for GET requests
    category = CategorySerializer(read_only=True)

    class Meta:
        model = Product
        fields = "__all__"


class CartItemSerializer(serializers.ModelSerializer):
    # Display fields (read-only)
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_price = serializers.DecimalField(
        source="product.price", max_digits=10, decimal_places=2, read_only=True
    )
    # ⚡ OPTIMIZATION: Replaced SerializerMethodField with a native ImageField.
    # Native fields run through DRF's optimized C-level bindings rather than 
    # firing a Python method for every single item in a list.
    product_image = serializers.ImageField(source="product.image", read_only=True)
    
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = CartItem
        fields = [
            "id",
            "cart",
            "product",
            "product_name",
            "product_price",
            "product_image",
            "quantity",
            "subtotal",
        ]


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total = serializers.SerializerMethodField()
    
    # ⚡ OPTIMIZATION: Replaced SerializerMethodField with a native CharField.
    # This avoids function call overhead and handles missing users safely.
    user = serializers.CharField(source="user.username", default="Guest", read_only=True)

    class Meta:
        model = Cart
        fields = ["id", "user", "created_at", "items", "total"]

    def get_total(self, obj):
        # Note: This is fast ONLY IF you use prefetch_related in your views.
        # Otherwise, this loops through the DB once per item.
        return sum(item.subtotal for item in obj.items.all())


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password", "password2"]

    def validate(self, data):
        if data["password"] != data["password2"]:
            raise serializers.ValidationError("Passwords do not match.")
        return data

    def create(self, validated_data):
        validated_data.pop("password2", None)
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
        )
        return user


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product_name', 'quantity', 'price']


class OrderSerializer(serializers.ModelSerializer):
    # 🌟 FIX 1: Removed source='orderitem_set' since your related_name is just 'items'
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        # 🌟 FIX 2: Added 'created_at' to the fields list!
        fields = ['id', 'total_price', 'created_at', 'items']