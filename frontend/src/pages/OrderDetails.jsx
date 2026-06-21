import React, { useEffect, useState } from "react";
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
        } else {
          console.error("Failed to fetch order details, status:", response.status);
        }
      } catch (error) {
        console.error("Error fetching order details:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [id, BASEURL]);

  // Inline Cancel Function for the Details Page
  const handleCancelOrder = async () => {
    const isConfirmed = window.confirm("Are you sure you want to cancel this order?");
    if (!isConfirmed) return;

    try {
      // Send request to Django to cancel the order
      const response = await authFetch(`${BASEURL}/api/orders/${id}/cancel/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      // Update the UI instantly so the user sees it change to "Cancelled"
      setOrder((prevOrder) => ({ ...prevOrder, status: "Cancelled" }));

      if (!response.ok) {
        console.warn("UI updated locally, but the backend returned an error.");
      }
      
    } catch (error) {
      console.error("Error cancelling order:", error);
      alert("Failed to reach the server to cancel the order.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center mt-20">
        <h2 className="text-red-500 text-2xl font-bold">Order not found.</h2>
        <p className="text-gray-500 mt-2 mb-6">We couldn't find the details for this order.</p>
        <Link to="/orders" className="text-blue-600 font-medium hover:underline">
          &larr; Return to My Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 border-b border-gray-100 pb-4 gap-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Order <span className="text-blue-600">#{order.id}</span>
          </h2>
          <Link to="/orders" className="text-blue-600 hover:text-blue-800 transition-colors font-medium flex items-center gap-2">
            &larr; Back to Orders
          </Link>
        </div>

        {/* Order Items Container */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Items in this order</h3>
            {/* Displaying the dynamic status */}
            {order.status && (
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 
                order.status === 'Cancelled' ? 'bg-red-100 text-red-700 line-through decoration-red-400' : 
                'bg-yellow-100 text-yellow-700'
              }`}>
                {order.status}
              </span>
            )}
          </div>
          
          <div className="space-y-4">
            {order.items && order.items.map((item) => (
              <div key={item.id} className="flex justify-between items-center border-b border-gray-200 last:border-0 pb-3 last:pb-0">
                <div className="flex items-center gap-3 md:gap-4">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                    {item.quantity}x
                  </span>
                  <span className="text-gray-800 font-medium text-base sm:text-lg">
                    {item.product_name}
                  </span>
                </div>
                <span className="text-gray-900 font-bold text-base sm:text-lg">
                  ₹ {Number(item.price).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>

          {/* Total Summary */}
          <div className="mt-6 pt-5 border-t-2 border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <span className="text-lg font-bold text-gray-600 uppercase tracking-wide">Total Paid</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-green-600">
              ₹ {Number(order.total_price).toLocaleString('en-IN')}
            </span>
          </div>

          {/* INLINE CANCEL BUTTON */}
          {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
            <div className="mt-8 pt-4 flex justify-end">
              <button 
                onClick={handleCancelOrder}
                className="text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors border border-red-100"
              >
                Cancel this Order
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default OrderDetails;