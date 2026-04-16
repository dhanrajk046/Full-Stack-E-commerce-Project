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
    : "https://via.placeholder.com/250";

  return (
    <Link
      to={`/product/${product.id}`} // ✅ match App.jsx route
      className="block bg-white rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-transform duration-300 p-4"
    >
      <img
        src={imageUrl}
        alt={product.name || "Product image"}
        onError={(e) => (e.target.src = "https://via.placeholder.com/250")}
        className="w-full h-56 object-cover rounded-lg mb-4"
      />

      <h2 className="text-xl font-semibold text-gray-800 truncate">
        {product.name}
      </h2>

      <p className="text-gray-600 font-medium">₹ {product.price}</p>
    </Link>
  );
}

export default ProductCard;
