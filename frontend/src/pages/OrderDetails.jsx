import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { authFetch } from "../utils/auth";

function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const BASEURL = import.meta.env.VITE_DJANGO_BASE_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await authFetch(`${BASEURL}/api/orders/${id}/`);
        if (response.ok) {
          const data = await response.json();
          setOrder(data);
        }
      } catch (error) {
        console.error("Error fetching order details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetails();
  }, [id, BASEURL]);

  if (loading) return <div className="text-center mt-20 text-xl font-semibold">Loading order details...</div>;
  if (!order) return <div className="text-center mt-20 text-red-500 text-xl font-bold">Order not found.</div>;

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
        
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-3xl font-extrabold text-gray-800">Order #{order.id}</h2>
          <Link to="/my-orders" className="text-blue-600 hover:text-blue-800 hover:underline font-medium">
            ← Back to Orders
          </Link>
        </div>

        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Items in this order:</h3>
          
          <div className="space-y-4">
            {order.items && order.items.map((item) => (
              <div key={item.id} className="flex justify-between items-center border-b border-gray-200 pb-3">
                <div className="flex items-center gap-3">
                  <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-bold">
                    {item.quantity}x
                  </span>
                  <span className="text-gray-800 font-medium text-lg">{item.product_name}</span>
                </div>
                <span className="text-gray-900 font-bold text-lg">₹ {item.price}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t-2 border-gray-200 flex justify-between items-center">
            <span className="text-xl font-bold text-gray-600">Total Paid:</span>
            <span className="text-3xl font-extrabold text-green-600">₹ {order.total_price}</span>
          </div>
        </div>

      </div>
    </div>
  );
}

export default OrderDetails;