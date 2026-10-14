
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CreditCard,
  MapPin,
  ShieldCheck,
  Check,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useOrders } from "../../context/OrderContext";

import { checkoutOrder } from "../../services/orderService";
import { createPayment } from "../../services/paymentService";

import { formatCurrency } from "../../utils/formatCurrency";

function Checkout() {
  const navigate = useNavigate();

  const { user, isAuthenticated } = useAuth();

  const {
    cartItems,
    subtotal,
    shipping,
    total,
    clearCart,
  } = useCart();

  const { addOrder } = useOrders();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [paymentMethod, setPaymentMethod] =
    useState("UPI");

  const [errors, setErrors] = useState({});
  const [isPlacingOrder, setIsPlacingOrder] =
    useState(false);
  const [orderError, setOrderError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: "",
    }));

    setOrderError("");
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName =
        "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email =
        "Email address is required";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        formData.email
      )
    ) {
      newErrors.email =
        "Enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone =
        "Phone number is required";
    } else if (
      !/^\d{10}$/.test(formData.phone)
    ) {
      newErrors.phone =
        "Enter a valid 10-digit phone number";
    }

    if (!formData.address.trim()) {
      newErrors.address =
        "Delivery address is required";
    }

    if (!formData.city.trim()) {
      newErrors.city =
        "City is required";
    }

    if (!formData.state.trim()) {
      newErrors.state =
        "State is required";
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode =
        "Pincode is required";
    } else if (
      !/^\d{6}$/.test(formData.pincode)
    ) {
      newErrors.pincode =
        "Enter a valid 6-digit pincode";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    if (!isAuthenticated || !user?.userId) {
      setOrderError(
        "Please login before placing your order."
      );
      return;
    }

    setIsPlacingOrder(true);
    setOrderError("");

    try {
      /*
       * Create backend order using
       * the currently logged-in user.
       */
      const backendOrder = await checkoutOrder(
        user.userId,
        1
      );

      /*
       * Create payment.
       */
      const payment = await createPayment(
        backendOrder.id,
        paymentMethod
      );

      const finalOrderStatus =
        payment.status === "SUCCESS"
          ? "CONFIRMED"
          : backendOrder.status;

      /*
       * Backend order items contain:
       *
       * id
       * productId
       * productName
       * quantity
       * subtotal
       * unitPrice
       *
       * The image is not returned by the backend.
       *
       * CartContext already contains the complete
       * product returned by /api/products/{id},
       * including imageUrl.
       *
       * Therefore we match backendOrder.items
       * with cartItems using productId.
       */
      const orderItems =
        backendOrder.items.map((backendItem) => {
          const cartItem = cartItems.find(
            (cartProduct) =>
              Number(cartProduct.id) ===
              Number(backendItem.productId)
          );

          return {
            id: backendItem.id,

            productId:
              backendItem.productId,

            name:
              backendItem.productName ||
              cartItem?.name ||
              "Product",

            category:
              cartItem?.category?.name ||
              cartItem?.category ||
              "",

            imageUrl:
              cartItem?.imageUrl ||
              cartItem?.image ||
              "/placeholder-product.png",

            image:
              cartItem?.imageUrl ||
              cartItem?.image ||
              "/placeholder-product.png",

            price: Number(
              backendItem.unitPrice
            ),

            quantity:
              backendItem.quantity,

            subtotal: Number(
              backendItem.subtotal
            ),
          };
        });

      /*
       * Create frontend order object.
       */
      const order = {
        id: String(backendOrder.id),

        createdAt:
          backendOrder.createdAt,

        status: finalOrderStatus,

        customer: {
          fullName:
            formData.fullName,

          email:
            formData.email,

          phone:
            formData.phone,
        },

        shippingAddress: {
          address:
            formData.address,

          city:
            formData.city,

          state:
            formData.state,

          pincode:
            formData.pincode,
        },

        payment: {
          method:
            payment.paymentMethod,

          status:
            payment.status,

          transactionId:
            payment.transactionId,

          amount:
            payment.amount,
        },

        items: orderItems,

        subtotal: Number(
          backendOrder.totalAmount
        ),

        shipping: 0,

        total: Number(
          backendOrder.totalAmount
        ),

        statusHistory: [
          {
            status: "PENDING",

            timestamp:
              backendOrder.createdAt,

            message:
              "Order created successfully.",
          },

          {
            status:
              finalOrderStatus,

            timestamp:
              payment.createdAt ||
              backendOrder.updatedAt ||
              backendOrder.createdAt,

            message:
              "Payment processed successfully. Order confirmed.",
          },
        ],
      };

      /*
       * Save order to frontend OrderContext.
       */
      addOrder(order);

      /*
       * Clear backend + frontend cart.
       */
      await clearCart();

      /*
       * Navigate to order success page.
       */
      navigate("/order-success", {
        state: {
          orderId: String(
            backendOrder.id
          ),
        },
      });
    } catch (error) {
      console.error(
        "Checkout failed:",
        error
      );

      setOrderError(
        error.message ||
          "Unable to place order. Please try again."
      );
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <main className="checkout-page">
        <div className="checkout-empty">
          <div className="checkout-empty-icon">
            <ShoppingBagIcon />
          </div>

          <h1>
            Your Cart is Empty
          </h1>

          <p>
            Add products to your cart
            before proceeding to
            checkout.
          </p>

          <Link
            to="/products"
            className="checkout-button"
          >
            Continue Shopping
            <ArrowRight size={18} />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      {/* =========================
          HEADER
      ========================== */}

      <section className="checkout-header">
        <div>
          <p className="section-label">
            SECURE CHECKOUT
          </p>

          <h1>
            Checkout
          </h1>

          <p>
            Complete your details to
            place your order.
          </p>
        </div>

        <Link
          to="/cart"
          className="back-to-cart"
        >
          <ArrowLeft size={17} />
          Back to Cart
        </Link>
      </section>

      {/* =========================
          CHECKOUT LAYOUT
      ========================== */}

      <section className="checkout-layout">
        {/* =========================
            LEFT SIDE
        ========================== */}

        <div className="checkout-main">
          {/* =========================
              DELIVERY INFORMATION
          ========================== */}

          <div className="checkout-card">
            <div className="checkout-card-title">
              <div className="checkout-title-icon">
                <MapPin size={20} />
              </div>

              <div>
                <h2>
                  Delivery Information
                </h2>

                <p>
                  Where should we deliver
                  your order?
                </p>
              </div>
            </div>

            <div className="checkout-form">
              {/* FULL NAME */}

              <div className="form-group">
                <label htmlFor="fullName">
                  Full Name
                  <span>*</span>
                </label>

                <input
                  id="fullName"
                  type="text"
                  name="fullName"
                  placeholder="Enter your full name"
                  value={
                    formData.fullName
                  }
                  onChange={
                    handleChange
                  }
                />

                {errors.fullName && (
                  <span className="form-error">
                    {errors.fullName}
                  </span>
                )}
              </div>

              {/* EMAIL + PHONE */}

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">
                    Email Address
                    <span>*</span>
                  </label>

                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={
                      formData.email
                    }
                    onChange={
                      handleChange
                    }
                  />

                  {errors.email && (
                    <span className="form-error">
                      {errors.email}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="phone">
                    Phone Number
                    <span>*</span>
                  </label>

                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    inputMode="numeric"
                    maxLength="10"
                    placeholder="10-digit phone number"
                    value={
                      formData.phone
                    }
                    onChange={
                      handleChange
                    }
                  />

                  {errors.phone && (
                    <span className="form-error">
                      {errors.phone}
                    </span>
                  )}
                </div>
              </div>

              {/* ADDRESS */}

              <div className="form-group">
                <label htmlFor="address">
                  Address
                  <span>*</span>
                </label>

                <textarea
                  id="address"
                  name="address"
                  rows="3"
                  placeholder="House number, street, area"
                  value={
                    formData.address
                  }
                  onChange={
                    handleChange
                  }
                />

                {errors.address && (
                  <span className="form-error">
                    {errors.address}
                  </span>
                )}
              </div>

              {/* CITY / STATE / PINCODE */}

              <div className="form-row checkout-location-row">
                <div className="form-group">
                  <label htmlFor="city">
                    City
                    <span>*</span>
                  </label>

                  <input
                    id="city"
                    type="text"
                    name="city"
                    placeholder="City"
                    value={
                      formData.city
                    }
                    onChange={
                      handleChange
                    }
                  />

                  {errors.city && (
                    <span className="form-error">
                      {errors.city}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="state">
                    State
                    <span>*</span>
                  </label>

                  <input
                    id="state"
                    type="text"
                    name="state"
                    placeholder="State"
                    value={
                      formData.state
                    }
                    onChange={
                      handleChange
                    }
                  />

                  {errors.state && (
                    <span className="form-error">
                      {errors.state}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="pincode">
                    Pincode
                    <span>*</span>
                  </label>

                  <input
                    id="pincode"
                    type="text"
                    name="pincode"
                    inputMode="numeric"
                    maxLength="6"
                    placeholder="6-digit pincode"
                    value={
                      formData.pincode
                    }
                    onChange={
                      handleChange
                    }
                  />

                  {errors.pincode && (
                    <span className="form-error">
                      {errors.pincode}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* =========================
              PAYMENT
          ========================== */}

          <div className="checkout-card">
            <div className="checkout-card-title">
              <div className="checkout-title-icon">
                <CreditCard size={20} />
              </div>

              <div>
                <h2>
                  Payment Method
                </h2>

                <p>
                  Choose your preferred
                  payment method.
                </p>
              </div>
            </div>

            <div className="payment-options">
              {/* UPI */}

              <button
                type="button"
                className={
                  paymentMethod === "UPI"
                    ? "payment-option active"
                    : "payment-option"
                }
                onClick={() =>
                  setPaymentMethod("UPI")
                }
              >
                <div className="payment-method-icon upi-icon">
                  UPI
                </div>

                <div className="payment-method-content">
                  <strong>
                    UPI Payment
                  </strong>

                  <span>
                    Pay securely using
                    UPI
                  </span>
                </div>

                {paymentMethod === "UPI" && (
                  <div className="payment-selected">
                    <Check size={16} />
                  </div>
                )}
              </button>

              {/* CARD */}

              <button
                type="button"
                className={
                  paymentMethod === "CARD"
                    ? "payment-option active"
                    : "payment-option"
                }
                onClick={() =>
                  setPaymentMethod("CARD")
                }
              >
                <div className="payment-method-icon">
                  <CreditCard size={21} />
                </div>

                <div className="payment-method-content">
                  <strong>
                    Card Payment
                  </strong>

                  <span>
                    Credit or debit
                    card
                  </span>
                </div>

                {paymentMethod === "CARD" && (
                  <div className="payment-selected">
                    <Check size={16} />
                  </div>
                )}
              </button>

              {/* COD */}

              <button
                type="button"
                className={
                  paymentMethod === "COD"
                    ? "payment-option active"
                    : "payment-option"
                }
                onClick={() =>
                  setPaymentMethod("COD")
                }
              >
                <div className="payment-method-icon cod-icon">
                  ₹
                </div>

                <div className="payment-method-content">
                  <strong>
                    Cash on Delivery
                  </strong>

                  <span>
                    Pay when your order
                    arrives
                  </span>
                </div>

                {paymentMethod === "COD" && (
                  <div className="payment-selected">
                    <Check size={16} />
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* =========================
            RIGHT SIDE
        ========================== */}

        <aside className="checkout-summary">
          <h2>
            Order Summary
          </h2>

          <div className="checkout-products">
            {cartItems.map((item) => (
              <div
                className="checkout-product"
                key={item.id}
              >
                <div className="checkout-product-image">
                  <img
                    src={
                      item.imageUrl ||
                      item.image ||
                      "/placeholder-product.png"
                    }
                    alt={item.name}
                    onError={(event) => {
                      event.currentTarget.onerror =
                        null;

                      event.currentTarget.src =
                        "/placeholder-product.png";
                    }}
                  />
                </div>

                <div className="checkout-product-info">
                  <strong>
                    {item.name}
                  </strong>

                  <span>
                    {item.quantity} ×{" "}
                    {formatCurrency(
                      item.price
                    )}
                  </span>
                </div>

                <strong className="checkout-product-price">
                  {formatCurrency(
                    Number(
                      item.price || 0
                    ) * item.quantity
                  )}
                </strong>
              </div>
            ))}
          </div>

          {/* SUBTOTAL */}

          <div className="summary-row">
            <span>
              Subtotal
            </span>

            <span>
              {formatCurrency(subtotal)}
            </span>
          </div>

          {/* SHIPPING */}

          <div className="summary-row">
            <span>
              Shipping
            </span>

            <span className="shipping-value">
              {shipping === 0
                ? "FREE"
                : formatCurrency(shipping)}
            </span>
          </div>

          <div className="summary-divider" />

          {/* TOTAL */}

          <div className="summary-total">
            <span>
              Total
            </span>

            <strong>
              {formatCurrency(total)}
            </strong>
          </div>

          {/* ERROR */}

          {orderError && (
            <div className="checkout-order-error">
              {orderError}
            </div>
          )}

          {/* PLACE ORDER */}

          <button
            type="button"
            className="place-order-button"
            onClick={handlePlaceOrder}
            disabled={isPlacingOrder}
          >
            {isPlacingOrder
              ? "Processing Order..."
              : "Place Order"}

            {!isPlacingOrder && (
              <ArrowRight size={19} />
            )}
          </button>

          {/* SECURITY */}

          <div className="checkout-security">
            <ShieldCheck size={17} />

            <span>
              Secure checkout ·
              Your information is
              protected
            </span>
          </div>
        </aside>
      </section>
    </main>
  );
}

function ShoppingBagIcon() {
  return (
    <svg
      width="42"
      height="42"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 8h12l1 13H5L6 8Z" />
      <path d="M9 8a3 3 0 0 1 6 0" />
    </svg>
  );
}

export default Checkout;

