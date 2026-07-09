import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

// Custom event to trigger navigation from outside React Router
const navigateTo = (path) => {
  window.dispatchEvent(new CustomEvent('app:navigate', { detail: { path } }));
};

// Custom event to trigger toast from outside React component
const showToast = (message, type = 'info') => {
  window.dispatchEvent(new CustomEvent('app:toast', { detail: { message, type } }));
};

export const CartProvider = ({ children }) => {
  const BASEURL =
    import.meta.env.VITE_BASE_URL ||
    import.meta.env.VITE_DJANGO_BASE_URL ||
    "http://127.0.0.1:8000";

  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);

  // Helper function to safely grab and clean the token
  const getToken = () => {
    let token = localStorage.getItem("access_token") || localStorage.getItem("access");
    // Fix for tokens accidentally stored with literal string quotes
    if (token && token.startsWith('"') && token.endsWith('"')) {
      token = token.slice(1, -1);
    }
    return token;
  };

  // Helper function to handle expired sessions
  const handleUnauthorized = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("access");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("refresh");
    setCartItems([]);
    setTotal(0);
  };

  // ✅ Fetch Cart
  const fetchCart = async () => {
    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch(`${BASEURL}/api/cart/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCartItems(data.items || []);
        setTotal(data.total_price || data.total || 0);
      } else if (response.status === 401) {
        handleUnauthorized();
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  // ✅ Load cart on mount
  useEffect(() => {
    fetchCart();
  }, []);

  // ✅ Add to Cart
  const addToCart = async (productId) => {
    const token = getToken();

    if (!token) {
      showToast("Please log in to add items to your cart.", "warning");
      navigateTo("/login");
      return;
    }

    try {
      const response = await fetch(`${BASEURL}/api/cart/add/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ product_id: productId }),
      });

      if (response.ok) {
        await fetchCart();
        showToast("Added to cart! 🛒", "success");
      } else if (response.status === 401) {
        handleUnauthorized();
        showToast("Session expired. Please log in again.", "error");
        navigateTo("/login");
      } else {
        const errorData = await response.json().catch(() => ({}));
        showToast(errorData.error || "Failed to add to cart.", "error");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      showToast("Network error. Please try again.", "error");
    }
  };

  // ✅ Remove from Cart
  const removeFromCart = async (itemId) => {
    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch(`${BASEURL}/api/cart/items/${itemId}/delete/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await fetchCart();
      } else if (response.status === 401) {
        handleUnauthorized();
      }
    } catch (error) {
      console.error("Error removing from cart:", error);
    }
  };

  // ✅ Update Quantity
  const updateQuantity = async (itemId, quantity) => {
    if (quantity < 1) return removeFromCart(itemId);

    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch(`${BASEURL}/api/cart/update/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ item_id: itemId, quantity }),
      });

      if (response.ok) {
        await fetchCart();
      } else if (response.status === 401) {
        handleUnauthorized();
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  // ✅ Clear Cart (Local state clear)
  const clearCart = () => {
    setCartItems([]);
    setTotal(0);
  };

  // ✅ Place Order
  const placeOrder = async (orderData = {}) => {
    const token = getToken();

    if (!token) {
      showToast("You must be logged in to place an order.", "warning");
      navigateTo("/login");
      return false;
    }

    try {
      const response = await fetch(`${BASEURL}/api/orders/create/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        clearCart();
        showToast("Order placed successfully! 🎉", "success");
        return true;
      } else {
        const errorData = await response.json().catch(() => ({}));
        showToast(errorData.error || "Cart is empty or order failed.", "error");
        return false;
      }
    } catch (error) {
      console.error("Error placing order:", error);
      showToast("Network error. Please try again.", "error");
      return false;
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        total,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        placeOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Hook
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};