import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { authFetch } from "../utils/auth";

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const BASEURL = import.meta.env.VITE_DJANGO_BASE_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await authFetch(`${BASEURL}/api/orders/`);
        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        } else {
          console.error("Failed to fetch orders. Status:", response.status);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [BASEURL]);

  const handleCancelOrder = async (orderId) => {
    const isConfirmed = window.confirm("Are you sure you want to cancel this order?");
    if (!isConfirmed) return;

    try {
      const response = await authFetch(`${BASEURL}/api/orders/${orderId}/cancel/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: "Cancelled" } : order
        )
      );

      if (!response.ok) {
        console.warn("UI updated locally, but the backend returned an error.");
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      // Show a non-blocking toast-style message
      window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: 'Failed to cancel order. Please try again.', type: 'error' } }));
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
        {/* Skeleton Header */}
        <div className="mb-8">
          <div className="skeleton h-8 w-40 rounded mb-3" />
          <div className="skeleton h-4 w-72 rounded" />
        </div>

        {/* Skeleton Order Cards */}
        <div className="space-y-5">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-gray-50 h-14 border-b border-gray-100" />
              <div className="p-5 flex gap-4">
                <div className="skeleton w-20 h-20 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2 py-2">
                  <div className="skeleton h-4 w-2/3 rounded" />
                  <div className="skeleton h-3 w-1/4 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center animate-fade-in">
        <div className="text-6xl mb-5 select-none">📦</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">No orders yet</h2>
        <p className="text-gray-500 text-sm mb-8 max-w-sm">
          Looks like you haven't placed any orders yet. Start shopping to see your orders here!
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-md"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          Start Shopping
        </Link>
      </div>
    );
  }

  const statusConfig = {
    Delivered: { dot: "bg-green-500", badge: "bg-green-50 text-green-700", label: "Delivered" },
    Cancelled: { dot: "bg-red-500", badge: "bg-red-50 text-red-700 line-through decoration-red-400", label: "Cancelled" },
    Processing: { dot: "bg-yellow-400 animate-pulse", badge: "bg-yellow-50 text-yellow-700", label: "Processing" },
    Shipped: { dot: "bg-blue-500", badge: "bg-blue-50 text-blue-700", label: "Shipped" },
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8 animate-fade-in">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">My Orders</h1>
          <p className="mt-1 text-sm text-gray-500">
            {orders.length} order{orders.length !== 1 ? 's' : ''} · Check status, view details, or cancel orders
          </p>
        </div>

        <div className="space-y-4 sm:space-y-5">
          {orders.map((order) => {
            const status = order.status || "Processing";
            const cfg = statusConfig[status] || statusConfig.Processing;

            return (
              <div
                key={order.id}
                className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden transition-shadow duration-200 hover:shadow-md"
              >
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gray-50 px-4 sm:px-6 py-4 border-b border-gray-100">
                  <div className="grid grid-cols-2 gap-4 sm:flex sm:gap-8 text-xs sm:text-sm">
                    <div>
                      <p className="font-medium text-gray-400 uppercase tracking-wider text-[10px] mb-0.5">Order Placed</p>
                      <p className="font-semibold text-gray-800">
                        {order.date || new Date(order.created_at).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric"
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-400 uppercase tracking-wider text-[10px] mb-0.5">Total</p>
                      <p className="font-semibold text-gray-800">
                        ₹{Number(order.total_price).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.badge}`}>
                        {status}
                      </span>
                    </div>
                    <span className="font-mono text-gray-400 text-[11px] hidden sm:block">
                      Order #{order.id}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="divide-y divide-gray-50">
                  {order.items && order.items.map((item, index) => {
                    let rawImage = item.image || item.product_image || item.image_url || (item.product && item.product.image);
                    let finalImageUrl = "https://placehold.co/100x100/f3f4f6/9ca3af?text=No+Image";

                    if (rawImage) {
                      if (rawImage.startsWith("http")) {
                        finalImageUrl = rawImage;
                      } else {
                        const cleanBaseUrl = BASEURL.replace(/\/$/, "");
                        const cleanImagePath = rawImage.startsWith("/") ? rawImage : `/${rawImage}`;
                        finalImageUrl = `${cleanBaseUrl}${cleanImagePath}`;
                      }
                    }

                    return (
                      <div
                        key={index}
                        className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        {/* Product Info */}
                        <div className="flex items-center gap-4 w-full sm:w-auto flex-1 min-w-0">
                          <img
                            src={finalImageUrl}
                            alt={item.product_name || "Product"}
                            onError={(e) => { e.target.src = "https://placehold.co/100x100/f3f4f6/9ca3af?text=No+Image"; }}
                            className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-xl border border-gray-100 p-1 bg-white flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-gray-900 truncate sm:whitespace-normal">
                              {item.product_name}
                            </h3>
                            <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity}</p>
                            {/* Mobile price */}
                            <p className="text-sm font-bold text-gray-800 mt-1 sm:hidden">
                              ₹{Number(item.price).toLocaleString("en-IN")}
                            </p>
                          </div>
                        </div>

                        {/* Desktop Price + Actions */}
                        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 w-full sm:w-auto border-t sm:border-0 pt-3 sm:pt-0 border-gray-50 mt-1 sm:mt-0">
                          <p className="hidden sm:block text-sm font-bold text-gray-900 text-right mb-1">
                            ₹{Number(item.price).toLocaleString("en-IN")}
                          </p>

                          <div className="flex items-center gap-2">
                            {status !== "Delivered" && status !== "Cancelled" && (
                              <button
                                onClick={() => handleCancelOrder(order.id)}
                                className="text-xs font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                              >
                                Cancel
                              </button>
                            )}
                            <Link
                              to={`/order/${order.id}`}
                              className="text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              View Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default MyOrders;