from rest_framework import serializers
from .models import Cart, CartItem, Category, Product
from django.contrib.auth.models import User


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
    product_image = serializers.SerializerMethodField()
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = CartItem
        # 'product' is the foreign key. It must be in fields to be writeable.
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

    def get_product_image(self, obj):
        if obj.product and obj.product.image:
            return obj.product.image.url
        return None


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total = serializers.SerializerMethodField()
    user = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ["id", "user", "created_at", "items", "total"]

    def get_total(self, obj):
        return sum(item.subtotal for item in obj.items.all())

    def get_user(self, obj):
        return obj.user.username if obj.user else "Guest"


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
