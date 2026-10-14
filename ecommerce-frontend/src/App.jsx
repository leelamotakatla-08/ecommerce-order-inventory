import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Navbar from "./components/layout/Navbar";

import Home from "./pages/home/Home";

import ProductListing from "./pages/products/ProductListing";
import ProductDetails from "./pages/products/ProductDetails";

import Cart from "./pages/cart/Cart";
import Checkout from "./pages/checkout/Checkout";
import OrderSuccess from "./pages/checkout/OrderSuccess";

import MyOrders from "./pages/orders/MyOrders";
import OrderDetails from "./pages/orders/OrderDetails";
import OrderTracking from "./pages/orders/OrderTracking";

import Wishlist from "./pages/Wishlist";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

import { CartProvider } from "./context/CartContext";
import { OrderProvider } from "./context/OrderContext";

function App() {
  return (
    <OrderProvider>
      <CartProvider>
        <BrowserRouter>

          <Navbar />

          <Routes>

            {/* Home */}
            <Route
              path="/"
              element={<Home />}
            />

            {/* Products */}
            <Route
              path="/products"
              element={<ProductListing />}
            />

            <Route
              path="/products/:id"
              element={<ProductDetails />}
            />

            {/* Cart & Checkout */}
            <Route
              path="/cart"
              element={<Cart />}
            />

            <Route
              path="/checkout"
              element={<Checkout />}
            />

            <Route
              path="/order-success"
              element={<OrderSuccess />}
            />

            {/* Orders */}
            <Route
              path="/orders"
              element={<MyOrders />}
            />

            <Route
              path="/orders/:id"
              element={<OrderDetails />}
            />

            <Route
              path="/orders/:id/tracking"
              element={<OrderTracking />}
            />

            {/* Wishlist */}
            <Route
              path="/wishlist"
              element={<Wishlist />}
            />

            {/* Authentication */}
            <Route
              path="/login"
              element={<Login />}
            />

            <Route
              path="/register"
              element={<Register />}
            />

            <Route
              path="/forgot-password"
              element={<ForgotPassword />}
            />

            <Route
              path="/reset-password"
              element={<ResetPassword />}
            />

          </Routes>

        </BrowserRouter>
      </CartProvider>
    </OrderProvider>
  );
}

export default App;