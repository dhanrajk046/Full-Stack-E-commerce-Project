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
      alert("Failed to reach the server to cancel the order.");
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 animate-pulse mt-8">
        {/* Skeleton Header */}
        <div className="mb-6 md:mb-8">
          <div className="h-8 bg-gray-200 rounded-md w-48 mb-3"></div>
          <div className="h-4 bg-gray-200 rounded-md w-3/4 sm:w-96"></div>
        </div>

        {/* Skeleton Order Cards */}
        <div className="space-y-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
              <div className="bg-gray-50 h-16 border-b border-gray-100"></div>
              <div className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4">
                <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0"></div>
                <div className="flex-1 space-y-3 py-2 w-full">
                  <div className="h-4 bg-gray-200 rounded w-3/4 sm:w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
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
      <div className="text-center py-12 px-4">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-700">
          No orders found
        </h2>
        <p className="text-gray-500 mt-2 text-sm md:text-base">
          Looks like you haven't placed any orders yet.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
          My Orders
        </h1>
        <p className="mt-2 text-xs md:text-sm text-gray-500">
          Check the status of recent orders, manage returns, and download invoices.
        </p>
      </div>

      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md"
          >
            {/* Order Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gray-50 p-4 sm:px-6 border-b border-gray-200 text-xs md:text-sm text-gray-600">
              <div className="grid grid-cols-2 gap-4 sm:flex sm:gap-8">
                <div>
                  <p className="font-medium text-gray-400 uppercase tracking-wider text-[10px]">
                    Order Placed
                  </p>
                  <p className="font-semibold text-gray-800 mt-0.5">
                    {order.date || new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-gray-400 uppercase tracking-wider text-[10px]">
                    Total Amount
                  </p>
                  <p className="font-semibold text-gray-800 mt-0.5">
                    ₹{Number(order.total_price).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
              <div className="flex justify-between sm:block text-right">
                <p className="font-medium text-gray-400 uppercase tracking-wider text-[10px] block sm:hidden">
                  Order ID
                </p>
                <p className="font-mono font-medium text-gray-900 bg-gray-200/60 px-2 py-1 rounded sm:bg-transparent sm:p-0">
                  {order.id}
                </p>
              </div>
            </div>

            {/* Order Items */}
            <div className="divide-y divide-gray-100">
              {order.items &&
                order.items.map((item, index) => {
                  
                  // ✅ Bulletproof Image Extraction Logic
                  let rawImage = item.image || item.product_image || item.image_url || (item.product && item.product.image);
                  let finalImageUrl = "https://placehold.co/150x150/f3f4f6/a1a1aa?text=No+Image";

                  if (rawImage) {
                    if (rawImage.startsWith("http")) {
                      // It's already a full, valid URL
                      finalImageUrl = rawImage;
                    } else {
                      // It's a relative path, so we safely combine BASEURL and the image path
                      const cleanBaseUrl = BASEURL.replace(/\/$/, ""); // Remove trailing slash if it exists
                      const cleanImagePath = rawImage.startsWith("/") ? rawImage : `/${rawImage}`; // Add leading slash if missing
                      finalImageUrl = `${cleanBaseUrl}${cleanImagePath}`;
                    }
                  }

                  return (
                    <div
                      key={index}
                      className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      {/* Product Details */}
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <img
                          src={finalImageUrl}
                          alt={item.product_name || "Product"}
                          // Added object-contain so phone images aren't cropped weirdly
                          className="w-20 h-20 md:w-24 md:h-24 object-contain rounded-lg border border-gray-100 p-1 flex-shrink-0 bg-white" 
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm md:text-base font-medium text-gray-950 truncate sm:whitespace-normal">
                            {item.product_name}
                          </h3>
                          <p className="text-xs md:text-sm text-gray-500 mt-1">
                            Qty: {item.quantity}
                          </p>
                          <p className="text-sm font-semibold text-gray-900 mt-1 sm:hidden">
                            ₹{Number(item.price).toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>

                      {/* Desktop Price */}
                      <div className="hidden sm:block text-right">
                        <p className="text-base font-semibold text-gray-900">
                          ₹{Number(item.price).toLocaleString("en-IN")}
                        </p>
                      </div>

                      {/* Status and Actions */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 w-full sm:w-auto border-t sm:border-0 pt-3 sm:pt-0 border-gray-100 mt-2 sm:mt-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${
                              order.status === "Delivered"
                                ? "bg-green-500"
                                : order.status === "Cancelled"
                                ? "bg-red-500"
                                : "bg-yellow-500 animate-pulse"
                            }`}
                          ></span>
                          <span
                            className={`text-xs md:text-sm font-medium ${
                              order.status === "Cancelled"
                                ? "text-red-600 line-through decoration-red-300"
                                : "text-gray-800"
                            }`}
                          >
                            {order.status || "Processing"}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 sm:mt-2">
                          {order.status !== "Delivered" &&
                            order.status !== "Cancelled" && (
                              <button
                                onClick={() => handleCancelOrder(order.id)}
                                className="text-xs md:text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 sm:bg-transparent sm:hover:bg-transparent px-3 py-1.5 sm:p-0 rounded-lg transition-colors block text-center"
                              >
                                Cancel
                              </button>
                            )}

                          <Link
                            to={`/order/${order.id}`}
                            className="text-xs md:text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 sm:bg-transparent sm:hover:bg-transparent px-3 py-1.5 sm:p-0 rounded-lg transition-colors block text-center"
                          >
                            View details
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyOrders;