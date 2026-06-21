import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

// Pages & Components
import ProductList from "./pages/ProductList";
import ProductDetails from "./pages/ProductDetails";
import Navbar from './components/Navbar'; 
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PrivateRouter from './components/PrivateRouter';
import OrderSuccess from "./pages/OrderSucces"; 
import MyOrders from "./pages/MyOrders";
import OrderDetails from "./pages/OrderDetails";

function App() {
    return (
        <Router>
            <Navbar /> 

            <div className="pt-24">
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
                        
                        {/* ✅ Redirects old URL to the new one so you never get a 404 */}
                        <Route path="/my-orders" element={<Navigate to="/orders" replace />} />
                        
                        <Route path="/order/:id" element={<OrderDetails />} />
                    </Route>

                    {/* 🚨 Catch-all route to prevent blank screens on bad URLs */}
                    <Route path="*" element={<div className="text-center mt-10 text-xl font-bold text-gray-700">404 - Page Not Found</div>} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;