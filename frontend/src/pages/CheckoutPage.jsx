import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authFetch } from "../utils/auth";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";

function CheckoutPage() {
  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    payment_method: "COD",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const nav = useNavigate();
  const { clearCart, cartItems } = useCart();
  const toast = useToast();
  const BASEURL = import.meta.env.VITE_DJANGO_BASE_URL;

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    // Basic phone validation
    if (!/^\d{10}$/.test(form.phone.replace(/\s/g, ''))) {
      setFormError("Please enter a valid 10-digit phone number.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await authFetch(`${BASEURL}/api/orders/create/`, {
        method: "POST",
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        clearCart();
        toast.success("Order placed successfully! 🎉");
        nav("/orders");
      } else {
        setFormError(data.error || "Failed to place order. Please try again.");
        toast.error(data.error || "Order failed.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setFormError("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm text-gray-900 placeholder-gray-400 transition-shadow";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 animate-fade-in">
      <div className="max-w-lg mx-auto">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
          <Link to="/cart" className="hover:text-blue-600 transition-colors">Cart</Link>
          <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-800 font-medium">Checkout</span>
        </nav>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5">
            <h1 className="text-xl font-bold text-white">Complete Your Order</h1>
            <p className="text-blue-100 text-sm mt-0.5">
              {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your order
            </p>
          </div>

          <div className="p-6">
            {/* Form Error */}
            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5 flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Full Name */}
              <div>
                <label htmlFor="name" className={labelClass}>
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                  className={inputClass}
                  autoComplete="name"
                />
              </div>

              {/* Delivery Address */}
              <div>
                <label htmlFor="address" className={labelClass}>
                  Delivery Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="House No., Street, City, State, PIN"
                  required
                  rows={3}
                  className={`${inputClass} resize-none`}
                  autoComplete="street-address"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label htmlFor="phone" className={labelClass}>
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500 text-sm font-medium pointer-events-none">
                    +91
                  </span>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="9876543210"
                    required
                    maxLength={10}
                    className={`${inputClass} pl-12`}
                    autoComplete="tel"
                    inputMode="numeric"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className={labelClass}>Payment Method</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: "COD", label: "Cash on Delivery", icon: "💵" },
                    { value: "ONLINE", label: "Online Payment", icon: "💳" },
                  ].map(({ value, label, icon }) => (
                    <label
                      key={value}
                      htmlFor={`payment_${value}`}
                      className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all ${
                        form.payment_method === value
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        id={`payment_${value}`}
                        name="payment_method"
                        value={value}
                        checked={form.payment_method === value}
                        onChange={handleChange}
                        className="text-blue-600 accent-blue-600"
                      />
                      <div>
                        <div className="text-base leading-none">{icon}</div>
                        <div className="text-xs font-medium text-gray-700 mt-0.5">{label}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100 pt-2" />

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex justify-center items-center gap-2 py-3.5 rounded-xl font-bold text-white text-sm transition-all shadow-md
                  ${isSubmitting
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 active:scale-95 hover:shadow-lg"
                  }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Placing Order...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Place Order
                  </>
                )}
              </button>

              {/* Trust signals */}
              <div className="flex items-center justify-center gap-4 pt-1 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  Secure Checkout
                </span>
                <span>·</span>
                <span>Easy Returns</span>
                <span>·</span>
                <span>24/7 Support</span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;