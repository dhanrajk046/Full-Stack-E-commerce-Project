import { Link } from "react-router-dom";

function OrderSuccess() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-green-100 text-green-600 rounded-full p-4">
            {/* Checkmark SVG */}
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Order Successful!</h2>
        <p className="text-gray-600 mb-6">
          Thank you for your purchase. Your order has been placed successfully and will be delivered soon.
        </p>
        <Link
          to="/"
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition w-full inline-block"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

export default OrderSuccess;