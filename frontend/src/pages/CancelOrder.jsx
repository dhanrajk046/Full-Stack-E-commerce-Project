import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
// import { authFetch } from "../utils/auth"; // Uncomment when connecting to backend

function CancelOrder() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    if (!reason) {
      alert("Please select a reason for cancellation.");
      return;
    }

    setIsSubmitting(true);

    // 🛑 TEMPORARY FIX: Simulate an API call
    setTimeout(() => {
      setIsSubmitting(false);
      alert(`Order ${id} successfully cancelled!`);
      navigate('/orders'); // Redirect back to orders list
    }, 800);

    /* // 🚀 REAL API CALL (Uncomment and update when backend is ready)
    try {
      const response = await authFetch(`http://127.0.0.1:8000/api/orders/${id}/cancel/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });

      if (response.ok) {
        navigate('/orders');
      } else {
        console.error("Failed to cancel order");
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Error:", error);
      setIsSubmitting(false);
    }
    */
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6">
      <div className="max-w-xl mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
        
        <div className="mb-6">
          <h2 className="text-2xl font-extrabold text-gray-900">Cancel Order</h2>
          <p className="text-gray-500 mt-1">Order <span className="font-mono font-medium text-gray-800">#{id}</span></p>
        </div>

        <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm mb-6 border border-red-100">
          <strong>Warning:</strong> This action cannot be undone. Once cancelled, your refund will be processed according to our policy.
        </div>

        <form onSubmit={handleCancelSubmit}>
          <div className="mb-6">
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
              Why are you cancelling this order? <span className="text-red-500">*</span>
            </label>
            <select 
              id="reason" 
              value={reason} 
              onChange={(e) => setReason(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
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
              className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg text-center transition-colors"
            >
              Go Back
            </Link>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className={`px-5 py-2.5 text-sm font-medium text-white rounded-lg text-center transition-colors flex justify-center items-center gap-2
                ${isSubmitting ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
            >
              {isSubmitting ? (
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : null}
              Confirm Cancellation
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

export default CancelOrder;