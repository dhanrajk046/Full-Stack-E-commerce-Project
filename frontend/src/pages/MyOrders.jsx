import { useState, useEffect } from "react";

const MyOrders = () => {
  const BASEURL = import.meta.env.VITE_BASE_URL || "http://127.0.0.1:8000";
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to safely grab the token (reused from CartContext)
  const getToken = () => {
    let token = localStorage.getItem("access_token") || localStorage.getItem("access");
    if (token && token.startsWith('"') && token.endsWith('"')) {
      token = token.slice(1, -1);
    }
    return token;
  };

  useEffect(() => {
    const fetchOrders = async () => {
      const token = getToken();
      if (!token) {
        setError("You must be logged in to view your orders.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${BASEURL}/api/orders/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        } else {
          setError("Failed to fetch orders.");
        }
      } catch (err) {
        setError("An error occurred while fetching orders.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <div style={{ textAlign: "center", marginTop: "50px" }}>Loading your orders...</div>;
  if (error) return <div style={{ color: "red", textAlign: "center" }}>{error}</div>;

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <h2>My Orders</h2>
      
      {orders.length === 0 ? (
        <p>You haven't placed any orders yet.</p>
      ) : (
        orders.map((order) => (
          <div 
            key={order.id} 
            style={{ border: "1px solid #ccc", borderRadius: "8px", padding: "15px", marginBottom: "20px" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #eee", paddingBottom: "10px", marginBottom: "10px" }}>
              <strong>Order #{order.id}</strong>
              {/* Added a safety check for the date just in case! */}
              <span>{order.created_at ? new Date(order.created_at).toLocaleDateString() : "Date unavailable"}</span>
            </div>
            
            <ul style={{ listStyleType: "none", padding: 0 }}>
              {(order.items || []).map((item) => (
                <li key={item.id} style={{ display: "flex", justifyContent: "space-between", margin: "5px 0" }}>
                  {/* 🌟 FIX: Changed item.product?.name to item.product_name */}
                  <span>{item.quantity}x {item.product_name || "Unknown Product"}</span>
                  <span>₹{item.price}</span>
                </li>
              ))}
            </ul>
            
            <div style={{ textAlign: "right", marginTop: "15px", fontWeight: "bold" }}>
              Total: ₹{order.total_price}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MyOrders;