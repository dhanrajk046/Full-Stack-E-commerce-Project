import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";

function CartPage() {
  const { cartItems, removeFromCart, updateQuantity } = useCart();

  const BASEURL =
    import.meta.env.VITE_BASE_URL ||
    import.meta.env.VITE_DJANGO_BASE_URL ||
    "http://127.0.0.1:8000";

  const getImageUrl = (image) => {
    if (!image) return "https://placehold.co/150x150/f3f4f6/9ca3af?text=No+Image";
    if (image.startsWith("http")) return image;
    const normalizedBase = BASEURL.replace(/\/$/, "");
    const normalizedPath = image.replace(/^\//, "");
    return `${normalizedBase}/${normalizedPath}`;
  };

  const total = cartItems.reduce(
    (sum, item) => sum + item.product_price * item.quantity,
    0,
  );

  // Empty Cart State
  if (cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center animate-fade-in">
        <div className="text-7xl mb-6 select-none">🛒</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 text-sm mb-8 max-w-sm">
          Looks like you haven't added anything yet. Start exploring our products!
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

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8 px-4 animate-fade-in">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Shopping Cart</h1>
          <p className="text-gray-500 text-sm mt-1">
            {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your cart
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">

          {/* Cart Items */}
          <div className="flex-1 space-y-3">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-shadow hover:shadow-md"
              >
                {/* Image */}
                <div className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                  <img
                    src={getImageUrl(item.product_image)}
                    alt={item.product_name}
                    onError={(e) => (e.target.src = "https://placehold.co/150x150/f3f4f6/9ca3af?text=No+Image")}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm sm:text-base font-semibold text-gray-800 truncate">
                    {item.product_name}
                  </h2>
                  <p className="text-blue-600 font-bold text-sm mt-0.5">
                    ₹{parseFloat(item.product_price).toLocaleString("en-IN")}
                  </p>

                  {/* Mobile: subtotal */}
                  <p className="text-xs text-gray-400 mt-0.5 sm:hidden">
                    Subtotal: ₹{(item.product_price * item.quantity).toLocaleString("en-IN")}
                  </p>
                </div>

                {/* Quantity + Actions */}
                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      className="px-2.5 py-1.5 text-gray-600 hover:bg-gray-100 transition-colors font-semibold text-sm leading-none"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="px-3 py-1.5 text-sm font-semibold text-gray-900 bg-white border-x border-gray-200 min-w-[2.5rem] text-center">
                      {item.quantity}
                    </span>
                    <button
                      className="px-2.5 py-1.5 text-gray-600 hover:bg-gray-100 transition-colors font-semibold text-sm leading-none"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  {/* Subtotal (desktop) */}
                  <span className="hidden sm:block text-sm font-bold text-gray-800 min-w-[5rem] text-right">
                    ₹{(item.product_price * item.quantity).toLocaleString("en-IN")}
                  </span>

                  {/* Remove */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                    aria-label="Remove item"
                    title="Remove item"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:w-80">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-20">
              <h3 className="text-base font-bold text-gray-900 mb-4">Order Summary</h3>

              <div className="space-y-2 mb-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm text-gray-600">
                    <span className="truncate max-w-[60%]">{item.product_name} × {item.quantity}</span>
                    <span className="font-medium text-gray-800">₹{(item.product_price * item.quantity).toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2 mb-5">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium">₹{total.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Delivery</span>
                  <span className="text-green-600 font-medium">{total >= 500 ? 'Free' : '₹50'}</span>
                </div>
                <div className="border-t border-gray-100 pt-2 flex justify-between text-base font-bold text-gray-900">
                  <span>Total</span>
                  <span>₹{(total >= 500 ? total : total + 50).toLocaleString("en-IN")}</span>
                </div>
              </div>

              <Link
                to="/checkout"
                className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors shadow-md text-sm"
              >
                Proceed to Checkout →
              </Link>

              <Link
                to="/"
                className="block w-full text-center text-gray-500 hover:text-blue-600 text-sm mt-3 transition-colors"
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default CartPage;
