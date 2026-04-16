from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    # Products
    path("register/", views.register_view),
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("products/", views.get_products),
    path("products/<int:pk>/", views.get_product_details),
    # Categories
    path("categories/", views.get_categories),
    # Cart
    path("cart/", views.get_cart),
    path("cart/add/", views.add_to_cart),
    path("cart/update/", views.update_cart_quantity),
    # Remove item
    path("cart/items/<int:pk>/delete/", views.remove_from_cart),
    path("orders/create/", views.create_order),
]
