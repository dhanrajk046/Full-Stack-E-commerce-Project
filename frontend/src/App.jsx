import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// Pages & Components
import ProductList from "./pages/ProductList";
import ProductDetails from "./pages/ProductDetails";
import Navbar from './components/Navbar'; // ✅ Fixed 'Nabvar' typo
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
            <Navbar /> {/* ✅ Fixed typo here as well */}

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
                        <Route path="/orders" element={<MyOrders />} /> {/* ✅ Unified route */}
                        <Route path="/order/:id" element={<OrderDetails />} />
                    </Route>
                </Routes>
            </div>
        </Router>
    );
}

export default App;