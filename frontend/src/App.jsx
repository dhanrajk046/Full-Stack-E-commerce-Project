import { BrowserRouter as Router, Route, Routes, Navigate, Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import './App.css';
import { useToast } from './context/ToastContext';

// Pages & Components
import ProductList from "./pages/ProductList";
import ProductDetails from "./pages/ProductDetails";
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PrivateRouter from './components/PrivateRouter';
import OrderSuccess from "./pages/OrderSucces";
import MyOrders from "./pages/MyOrders";
import OrderDetails from "./pages/OrderDetails";

// Bridge: listens to custom events from CartContext and fires toasts/navigation
function EventBridge() {
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const handleToast = (e) => {
      const { message, type } = e.detail;
      if (toast[type]) toast[type](message);
      else toast.info(message);
    };

    const handleNavigate = (e) => {
      navigate(e.detail.path);
    };

    window.addEventListener('app:toast', handleToast);
    window.addEventListener('app:navigate', handleNavigate);

    return () => {
      window.removeEventListener('app:toast', handleToast);
      window.removeEventListener('app:navigate', handleNavigate);
    };
  }, [navigate, toast]);

  return null;
}

// 404 Not Found Page
function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center animate-fade-in">
      <div className="text-8xl mb-6 select-none">🔍</div>
      <h1 className="text-4xl font-extrabold text-gray-800 mb-3">404 – Page Not Found</h1>
      <p className="text-gray-500 mb-8 max-w-sm">
        Oops! The page you're looking for doesn't exist or may have been moved.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-md"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        Back to Home
      </Link>
    </div>
  );
}

function App() {
  return (
    <Router>
      <EventBridge />
      <Navbar />

      <main className="page-content pt-16">
        <Routes>
          {/* 🔓 Public Routes */}
          <Route path="/" element={<ProductList />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* 🔒 Protected Routes (Only for logged-in users) */}
          <Route element={<PrivateRouter />}>
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-success" element={<OrderSuccess />} />

            {/* ✅ Standard Orders Route */}
            <Route path="/orders" element={<MyOrders />} />

            {/* ✅ Redirects old URL to the new one */}
            <Route path="/my-orders" element={<Navigate to="/orders" replace />} />

            <Route path="/order/:id" element={<OrderDetails />} />
          </Route>

          {/* 🚨 Catch-all 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
    </Router>
  );
}

export default App;