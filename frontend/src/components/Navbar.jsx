import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // ✅ Added useNavigate

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate(); // ✅ Initialize navigate hook

  // ✅ Created the logout function
  const handleLogout = () => {
    // 1. Clear the authentication token/user data from local storage.
    // (If you named your token differently in your login function, update 'token' below)
    localStorage.removeItem('token'); 
    localStorage.removeItem('user'); 

    // 2. Redirect the user to the login page
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo / Brand */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-bold text-blue-600 flex items-center gap-2">
              🛍️ SonuCart
            </Link>
          </div>

          {/* Desktop Navigation (Hidden on mobile, visible on medium screens and up) */}
          <div className="hidden md:flex space-x-8 items-center">
            <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
              Home
            </Link>
            <Link to="/orders" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
              My Orders
            </Link>
            <Link to="/cart" className="text-gray-600 hover:text-blue-600 font-medium transition-colors flex items-center gap-1">
              🛒 Cart
              <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                3 {/* Replace with dynamic cart count */}
              </span>
            </Link>
            
            <div className="border-l border-gray-300 h-6 mx-2"></div>
            
            {/* ✅ Attached handleLogout to the Desktop button */}
            <button 
              onClick={handleLogout}
              className="text-gray-600 hover:text-red-600 font-medium transition-colors"
            >
              Logout
            </button>
          </div>

          {/* Mobile Menu Button (Visible on mobile, hidden on medium screens and up) */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-gray-900 focus:outline-none p-2"
              aria-label="Toggle menu"
            >
              {/* Hamburger Icon changes to an X when open */}
              {isOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown (Toggled by the button above) */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg absolute w-full">
          <div className="px-4 pt-2 pb-6 space-y-2 flex flex-col">
            <Link 
              to="/" 
              onClick={() => setIsOpen(false)}
              className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
            >
              Home
            </Link>
            <Link 
              to="/orders" 
              onClick={() => setIsOpen(false)}
              className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
            >
              My Orders
            </Link>
            <Link 
              to="/cart" 
              onClick={() => setIsOpen(false)}
              className="flex justify-between items-center px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
            >
              <span>🛒 Cart</span>
              <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">3</span>
            </Link>
            
            <hr className="my-2 border-gray-200" />
            
            {/* ✅ Attached handleLogout to the Mobile button and close the menu */}
            <button 
              onClick={() => {
                setIsOpen(false);
                handleLogout();
              }}
              className="w-full text-left px-3 py-3 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;