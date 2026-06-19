import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate(); // Faster routing than window.location.href
  const BASEURL = import.meta.env.VITE_DJANGO_BASE_URL || "http://127.0.0.1:8000";

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // ⚡ NEW: Local loading state specifically for the button click
  const [isAdding, setIsAdding] = useState(false); 

  const { addToCart } = useCart();

  useEffect(() => {
    fetch(`${BASEURL}/api/products/${id}/`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch product details");
        }
        return response.json();
      })
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setError(error.message);
        setLoading(false);
      });
  }, [id, BASEURL]);

  if (loading) {
    return <div className="text-center mt-10 text-lg font-semibold text-gray-600">Loading...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-600 font-semibold">Error: {error}</div>;
  }

  if (!product) {
    return <div className="text-center mt-10 text-lg">No product found</div>;
  }

  const imageUrl = product.image
    ? product.image.startsWith("http")
      ? product.image
      : new URL(product.image, BASEURL).href
    : "https://via.placeholder.com/400";

  // ⚡ OPTIMIZED: Asynchronous handler with immediate UI feedback
  const handleAddToCart = async () => {
    if (isAdding) return; // Prevent spam-clicking

    const token = localStorage.getItem("access_token") || localStorage.getItem("access");
    if (!token) {
      navigate("/login"); // ⚡ Faster than window.location.href
      return;
    }
    
    setIsAdding(true); // Trigger UI loading spinner instantly
    
    try {
      // Assuming your context function returns a promise or handles the fetch
      await addToCart(product.id); 
    } catch (err) {
      console.error("Cart error:", err);
    } finally {
      setIsAdding(false); // Reset button instantly when done
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center py-10 px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-4xl w-full">
        <div className="flex flex-col md:flex-row gap-10">
          
          {/* Image Section */}
          <div className="md:w-1/2 flex justify-center items-center bg-gray-50 rounded-xl p-4">
            <img
              src={imageUrl}
              alt={product.name}
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/400";
              }}
              className="w-full h-96 object-contain mix-blend-multiply"
            />
          </div>

          {/* Details Section */}
          <div className="flex-1 flex flex-col justify-center">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
              {product.name}
            </h1>

            <p className="text-gray-600 mb-6 leading-relaxed">
              {product.description || "No description available."}
            </p>

            <p className="text-4xl font-bold text-green-600 mb-8">
              ₹ {parseFloat(product.price).toFixed(2)}
            </p>

            {/* ⚡ OPTIMIZED BUTTON UI */}
            <button
              onClick={handleAddToCart}
              disabled={isAdding}
              className={`flex justify-center items-center px-6 py-4 rounded-xl font-bold text-lg text-white transition-all duration-200 
                ${isAdding 
                  ? "bg-blue-400 cursor-not-allowed" 
                  : "bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-md hover:shadow-lg"
                }`}
            >
              {isAdding ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  Adding to Cart...
                </>
              ) : (
                "Add to Cart 🛒"
              )}
            </button>

            {/* ⚡ OPTIMIZED: React Router Link prevents slow full-page reloads */}
            <Link
              to="/"
              className="mt-6 inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Back to Home
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

export default ProductDetails;