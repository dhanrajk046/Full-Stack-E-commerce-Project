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
      const response = await authFetch(`${BASEURL}/api/orders/${id}/cancel/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      setOrder((prevOrder) => ({ ...prevOrder, status: "Cancelled" }));

      if (!response.ok) {
        console.warn("UI updated locally, but the backend returned an error.");
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: 'Failed to cancel order. Please try again.', type: 'error' } }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 animate-pulse">
          <div className="flex justify-between mb-6 pb-4 border-b border-gray-100">
            <div className="skeleton h-8 w-48 rounded" />
            <div className="skeleton h-6 w-32 rounded" />
          </div>
          <div className="space-y-4">
            {[1, 2].map(n => (
              <div key={n} className="flex items-center gap-4">
                <div className="skeleton w-12 h-5 rounded-full" />
                <div className="skeleton h-5 flex-1 rounded" />
                <div className="skeleton h-5 w-20 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center animate-fade-in">
          <div className="text-5xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-red-600 mb-2">Order not found</h2>
          <p className="text-gray-500 text-sm mb-6">We couldn't find the details for this order.</p>
          <Link to="/orders" className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
            ← Return to My Orders
          </Link>
        </div>
      </div>
    );
  }

  const statusConfig = {
    Delivered: { badge: "bg-green-100 text-green-700", dot: "bg-green-500" },
    Cancelled: { badge: "bg-red-100 text-red-700 line-through decoration-red-400", dot: "bg-red-500" },
  };
  const cfg = statusConfig[order.status] || { badge: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-400 animate-pulse" };

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-10 px-4 animate-fade-in">
      <div className="max-w-3xl mx-auto">

        {/* Back link */}
        <Link
          to="/orders"
          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium mb-5 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to My Orders
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-5 sm:p-6 border-b border-gray-100">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">
                Order <span className="text-blue-600">#{order.id}</span>
              </h1>
              {order.created_at && (
                <p className="text-xs text-gray-400 mt-0.5">
                  Placed on {new Date(order.created_at).toLocaleDateString("en-IN", {
                    day: "numeric", month: "long", year: "numeric"
                  })}
                </p>
              )}
            </div>
            {order.status && (
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${cfg.dot}`} />
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${cfg.badge}`}>
                  {order.status}
                </span>
              </div>
            )}
          </div>

          {/* Items */}
          <div className="p-5 sm:p-6">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Items in this order</h2>

            <div className="space-y-3 mb-6">
              {order.items && order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <span className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full text-xs font-bold shadow-sm shrink-0">
                      {item.quantity}×
                    </span>
                    <span className="text-gray-800 font-medium text-sm sm:text-base">
                      {item.product_name}
                    </span>
                  </div>
                  <span className="text-gray-900 font-bold text-sm sm:text-base shrink-0">
                    ₹{Number(item.price).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-4 border-t-2 border-gray-100 mb-5">
              <span className="text-sm font-bold text-gray-500 uppercase tracking-wide">Total Paid</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-green-600">
                ₹{Number(order.total_price).toLocaleString("en-IN")}
              </span>
            </div>

            {/* Delivery info placeholder */}
            {order.address && (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Delivery Address</p>
                <p className="text-sm text-gray-700">{order.address}</p>
              </div>
            )}

            {/* Cancel Button */}
            {order.status !== "Delivered" && order.status !== "Cancelled" && (
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleCancelOrder}
                  className="text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl transition-colors border border-red-100"
                >
                  Cancel this Order
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetails;