import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const MyOrders = () => {
  // Use the exact key name we set in Vercel: VITE_DJANGO_BASE_URL
  const BASEURL =
    import.meta.env.VITE_DJANGO_BASE_URL || "http://127.0.0.1:8000";
  console.log("DEBUG: MyOrders BASEURL is currently:", BASEURL); // ADD THIS

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Helper function to grab the token
  const getToken = () => {
    let token =
      localStorage.getItem("access_token") || localStorage.getItem("access");
    // Clean up quotes if they exist in the stored string
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
        // Optional: Redirect to login if not authenticated
        // navigate("/login");
        return;
      }

      try {
        const response = await fetch(`${BASEURL}/api/orders/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Key part for Authentication
          },
        });

        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        } else if (response.status === 401) {
          setError("Session expired. Please login again.");
        } else {
          setError("Failed to fetch orders.");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("An error occurred while connecting to the server.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [BASEURL, navigate]);

  if (loading)
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        Loading your orders...
      </div>
    );
  if (error)
    return (
      <div style={{ color: "red", textAlign: "center", marginTop: "20px" }}>
        {error}
      </div>
    );

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <h2 style={{ fontSize: "24px", marginBottom: "20px" }}>My Orders</h2>

      {orders.length === 0 ? (
        <p>You haven't placed any orders yet.</p>
      ) : (
        orders.map((order) => (
          <div
            key={order.id}
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "15px",
              marginBottom: "20px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                borderBottom: "1px solid #eee",
                paddingBottom: "10px",
                marginBottom: "10px",
              }}
            >
              <strong>Order #{order.id}</strong>
              <span>
                {order.created_at
                  ? new Date(order.created_at).toLocaleDateString()
                  : "Date unavailable"}
              </span>
            </div>

            <ul style={{ listStyleType: "none", padding: 0 }}>
              {(order.items || []).map((item) => (
                <li
                  key={item.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    margin: "5px 0",
                  }}
                >
                  <span>
                    {item.quantity}x {item.product_name || "Unknown Product"}
                  </span>
                  <span>₹{item.price}</span>
                </li>
              ))}
            </ul>

            <div
              style={{
                textAlign: "right",
                marginTop: "15px",
                fontWeight: "bold",
                borderTop: "1px solid #eee",
                paddingTop: "10px",
              }}
            >
              Total: ₹{order.total_price}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MyOrders;
