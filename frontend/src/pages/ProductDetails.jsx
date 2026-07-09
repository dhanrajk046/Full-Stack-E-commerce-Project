import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const BASEURL = import.meta.env.VITE_DJANGO_BASE_URL || "http://127.0.0.1:8000";

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const { addToCart } = useCart();
  const toast = useToast();

  useEffect(() => {
    fetch(`${BASEURL}/api/products/${id}/`)
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch product details");
        return response.json();
      })
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }, [id, BASEURL]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-start py-10 px-4">
        <div className="bg-white shadow-sm rounded-2xl p-6 sm:p-8 max-w-4xl w-full border border-gray-100">
          <div className="flex flex-col md:flex-row gap-8 animate-pulse">
            <div className="skeleton md:w-1/2 aspect-square rounded-xl" />
            <div className="flex-1 space-y-4 py-2">
              <div className="skeleton h-8 w-3/4 rounded" />
              <div className="skeleton h-4 w-full rounded" />
              <div className="skeleton h-4 w-5/6 rounded" />
              <div className="skeleton h-10 w-1/3 rounded" />
              <div className="skeleton h-12 w-full rounded-xl mt-4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-red-600 mb-2">Failed to load product</h2>
          <p className="text-gray-500 text-sm mb-6">{error}</p>
          <Link to="/" className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">No product found</p>
      </div>
    );
  }

  const imageUrl = product.image
    ? product.image.startsWith("http")
      ? product.image
      : new URL(product.image, BASEURL).href
    : "https://placehold.co/600x500/f3f4f6/9ca3af?text=No+Image";

  const handleAddToCart = async () => {
    if (isAdding) return;

    const token = localStorage.getItem("access_token") || localStorage.getItem("access");
    if (!token) {
      toast.warning("Please log in to add items to your cart.");
      navigate("/login");
      return;
    }

    setIsAdding(true);
    try {
      await addToCart(product.id);
    } catch (err) {
      console.error("Cart error:", err);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-10 px-4">
      {/* Breadcrumb */}
      <div className="max-w-5xl mx-auto mb-4">
        <nav className="flex items-center gap-2 text-sm text-gray-500" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-800 font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>
      </div>

      {/* Product Card */}
      <div className="max-w-5xl mx-auto bg-white shadow-sm rounded-2xl border border-gray-100 overflow-hidden animate-scale-in">
        <div className="flex flex-col md:flex-row">

          {/* Image Section */}
          <div className="md:w-[45%] bg-gray-50 flex justify-center items-center p-6 sm:p-10 border-b md:border-b-0 md:border-r border-gray-100 min-h-[280px] sm:min-h-[380px]">
            <img
              src={imageUrl}
              alt={product.name}
              onError={(e) => { e.target.src = "https://placehold.co/600x500/f3f4f6/9ca3af?text=No+Image"; }}
              className="w-full max-h-80 sm:max-h-96 object-contain mix-blend-multiply"
            />
          </div>

          {/* Details Section */}
          <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              {/* Category badge placeholder */}
              <span className="inline-block bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                In Stock
              </span>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3 leading-tight">
                {product.name}
              </h1>

              {/* Star Rating */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-yellow-400 text-base tracking-tighter">★★★★<span className="text-gray-300">★</span></span>
                <span className="text-sm text-gray-500">(4.0) · 128 reviews</span>
              </div>

              <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-6">
                {product.description || "No description available for this product."}
              </p>
            </div>

            <div>
              {/* Price */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                  ₹{parseFloat(product.price).toLocaleString("en-IN")}
                </span>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-sm font-medium text-gray-700">Quantity:</span>
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors font-bold text-lg leading-none"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="px-4 py-2 text-sm font-semibold text-gray-900 bg-white min-w-[3rem] text-center border-x border-gray-300">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(q => q + 1)}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors font-bold text-lg leading-none"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={isAdding}
                className={`w-full flex justify-center items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-base text-white transition-all duration-200 shadow-md
                  ${isAdding
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 active:scale-95 hover:shadow-lg"
                  }`}
              >
                {isAdding ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Adding to Cart...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Add to Cart
                  </>
                )}
              </button>

              {/* Delivery Info */}
              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Free delivery on orders over ₹500
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  30-day easy returns
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;