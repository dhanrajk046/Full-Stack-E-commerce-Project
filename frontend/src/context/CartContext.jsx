import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

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
    console.error("Token expired or invalid. Clearing session.");
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
          "Authorization": `Bearer ${token}`
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
      alert("You are not logged in! Please log in to add items to your cart.");
      window.location.href = "/login";
      return;
    }

    try {
      const response = await fetch(`${BASEURL}/api/cart/add/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ product_id: productId }),
      });
      
      if (response.ok) {
        fetchCart(); // Refresh the cart instantly
        alert("Product added to cart successfully! 🛒");
      } else if (response.status === 401) {
        handleUnauthorized();
        alert("Your session has expired. Please log in again.");
        window.location.href = "/login";
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Backend rejected the request:", errorData);
        alert(`Failed to add: ${errorData.error || "Something went wrong."}`);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
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
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchCart();
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
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ item_id: itemId, quantity }),
      });

      if (response.ok) {
        fetchCart();
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
      alert("You must be logged in to place an order.");
      window.location.href = "/login";
      return false;
    }

    try {
      const response = await fetch(`${BASEURL}/api/orders/create/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(orderData),
      });
      
      if (response.ok) {
        clearCart(); 
        alert("Order placed successfully! 🎉");
        // 🌟 FIX: Removed the hard redirect here. We just return true now!
        return true; 
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Failed to place order: ${errorData.error || "Cart is empty."}`);
        return false;
      }
    } catch (error) {
      console.error("Error placing order:", error);
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