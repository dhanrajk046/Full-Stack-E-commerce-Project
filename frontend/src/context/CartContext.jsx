import { createContext, useContext, useState, useEffect } from "react";
import { authFetch } from "../utils/auth";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const BASEURL =
    import.meta.env.VITE_BASE_URL ||
    import.meta.env.VITE_DJANGO_BASE_URL ||
    "http://127.0.0.1:8000";

  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);

  const fetchCart = async () => {
    try {
      const response = await authFetch(`${BASEURL}/api/cart/`);
      const data = await response.json();

      setCartItems(data.items || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const addToCart = async (productId) => {
    try {
      await authFetch(`${BASEURL}/api/cart/add/`, {
        method: "POST",
        body: JSON.stringify({ product_id: productId }),
      });
      fetchCart();
    } catch (error) {
      console.error(error);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      await authFetch(`${BASEURL}/api/cart/items/${itemId}/delete/`, {
        method: "POST",
      });
      fetchCart();
    } catch (error) {
      console.error(error);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (quantity < 1) return removeFromCart(itemId);

    try {
      await authFetch(`${BASEURL}/api/cart/update/`, {
        method: "POST",
        body: JSON.stringify({ item_id: itemId, quantity }),
      });
      fetchCart();
    } catch (error) {
      console.error(error);
    }
  };

  const clearCart = () => {
    setCartItems([]);
    setTotal(0);
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