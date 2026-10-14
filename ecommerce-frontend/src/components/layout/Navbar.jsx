import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  User,
  Menu,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

function Navbar() {
  const navigate = useNavigate();

  const { user, isAuthenticated, logout } = useAuth();
  const { cartItems } = useCart();

  const cartCount = cartItems?.length || 0;

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="navbar">
      <div className="navbar-container">

        {/* Logo */}
        <Link to="/" className="logo">
          Shop<span>Sphere</span>
        </Link>

        {/* Search */}
        <div className="navbar-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search products..."
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                navigate(
                  `/products?search=${encodeURIComponent(
                    event.target.value
                  )}`
                );
              }
            }}
          />
        </div>

        {/* Navigation */}
        <nav className="navbar-links">

          <Link to="/">
            Home
          </Link>

          <Link to="/products">
            Products
          </Link>

          {isAuthenticated && (
            <>
              <Link to="/orders">
                My Orders
              </Link>

              <Link to="/wishlist">
                Wishlist
              </Link>
            </>
          )}

        </nav>

        {/* Actions */}
        <div className="navbar-actions">

          {/* Authentication */}
          {isAuthenticated ? (
            <>
              <div
                className="navbar-user"
                title={user?.email}
              >
                <User size={18} />

                <span>
                  Hi, {user?.name?.split(" ")[0] || "User"}
                </span>
              </div>

              <button
                type="button"
                className="navbar-auth-button"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="navbar-auth-button"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="navbar-register-button"
              >
                Register
              </Link>
            </>
          )}

          {/* Cart */}
          <Link
            to="/cart"
            className="navbar-icon"
            aria-label="Shopping cart"
          >
            <ShoppingCart size={20} />

            {cartCount > 0 && (
              <span className="cart-count">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Mobile menu */}
          <button
            type="button"
            className="navbar-menu"
            aria-label="Open menu"
          >
            <Menu size={21} />
          </button>

        </div>

      </div>
    </header>
  );
}

export default Navbar;