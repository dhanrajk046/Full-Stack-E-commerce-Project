import { Link } from "react-router-dom";

function ProductCard({ product }) {
  const BASEURL =
    import.meta.env.VITE_BASE_URL ||
    import.meta.env.VITE_DJANGO_BASE_URL ||
    "http://127.0.0.1:8000";

  const imageUrl = product.image
    ? product.image.startsWith("http")
      ? product.image
      : new URL(product.image, BASEURL).href
    : "https://placehold.co/400x300/f3f4f6/9ca3af?text=No+Image";

  return (
    <Link
      to={`/product/${product.id}`}
      className="group block bg-white rounded-2xl shadow-sm hover:shadow-lg border border-gray-100 hover:border-blue-100 transition-all duration-300 overflow-hidden"
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-gray-50 aspect-[4/3]">
        <img
          src={imageUrl}
          alt={product.name || "Product image"}
          onError={(e) => {
            e.target.src = "https://placehold.co/400x300/f3f4f6/9ca3af?text=No+Image";
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Quick View Badge */}
        <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/5 transition-colors duration-300 flex items-end justify-center pb-3 opacity-0 group-hover:opacity-100">
          <span className="bg-white/90 backdrop-blur-sm text-blue-700 text-xs font-semibold px-3 py-1 rounded-full shadow-sm translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            View Details →
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h2 className="text-sm sm:text-base font-semibold text-gray-800 truncate group-hover:text-blue-700 transition-colors duration-200">
          {product.name}
        </h2>

        <div className="flex items-center justify-between mt-2">
          <p className="text-base sm:text-lg font-bold text-blue-600">
            ₹{parseFloat(product.price).toLocaleString("en-IN")}
          </p>
          <span className="inline-flex items-center gap-0.5 text-yellow-500 text-xs font-medium">
            ★★★★<span className="text-gray-300">★</span>
            <span className="text-gray-400 ml-1">(4.0)</span>
          </span>
        </div>
      </div>
    </Link>
  );
}

export default ProductCard;
