import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { authFetch } from "../utils/auth";
import { useToast } from '../context/ToastContext';

function CancelOrder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const BASEURL = import.meta.env.VITE_DJANGO_BASE_URL || "http://127.0.0.1:8000";

  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    if (!reason) {
      toast.warning("Please select a reason for cancellation.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await authFetch(`${BASEURL}/api/orders/${id}/cancel/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });

      if (response.ok) {
        toast.success(`Order #${id} successfully cancelled.`);
        navigate('/orders');
      } else {
        toast.error("Failed to cancel order. Please try again.");
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Network error. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 animate-fade-in">
      <div className="max-w-xl mx-auto">

        {/* Back link */}
        <Link
          to={`/order/${id}`}
          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium mb-5 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Order Details
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Header */}
          <div className="bg-red-50 border-b border-red-100 px-6 py-5">
            <h1 className="text-xl font-extrabold text-gray-900">Cancel Order</h1>
            <p className="text-gray-500 mt-0.5 text-sm">
              Order <span className="font-mono font-semibold text-gray-700">#{id}</span>
            </p>
          </div>

          <div className="p-6">
            {/* Warning Banner */}
            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-sm mb-6 flex items-start gap-3">
              <svg className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              <p>
                <strong>This action cannot be undone.</strong> Once cancelled, your refund will be processed according to our return policy within 5-7 business days.
              </p>
            </div>

            <form onSubmit={handleCancelSubmit}>
              <div className="mb-6">
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for cancellation <span className="text-red-500">*</span>
                </label>
                <select
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white text-sm text-gray-800"
                >
                  <option value="" disabled>Select a reason...</option>
                  <option value="Changed my mind">I changed my mind</option>
                  <option value="Found a better price">Found a better price elsewhere</option>
                  <option value="Ordered by mistake">Ordered by mistake</option>
                  <option value="Delivery taking too long">Delivery is taking too long</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-gray-100">
                <Link
                  to={`/order/${id}`}
                  className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl text-center transition-colors"
                >
                  Keep Order
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-5 py-2.5 text-sm font-semibold text-white rounded-xl text-center transition-all flex justify-center items-center gap-2 shadow-sm
                    ${isSubmitting ? 'bg-red-300 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 active:scale-95'}`}
                >
                  {isSubmitting ? (
                    <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  Confirm Cancellation
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CancelOrder;