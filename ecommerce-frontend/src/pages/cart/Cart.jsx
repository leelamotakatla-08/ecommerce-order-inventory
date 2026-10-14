
import { Link } from "react-router-dom";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";

import { useCart } from "../../context/CartContext";
import { formatCurrency } from "../../utils/formatCurrency";

function Cart() {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    subtotal,
    shipping,
    total,
    cartLoading,
  } = useCart();

  if (cartLoading) {
    return (
      <main className="cart-page">
        <div className="empty-cart">
          <div className="empty-cart-icon">
            <ShoppingBag size={42} />
          </div>

          <h1>Loading your cart...</h1>

          <p>Please wait while we load your items.</p>
        </div>
      </main>
    );
  }

  if (cartItems.length === 0) {
    return (
      <main className="cart-page">
        <div className="empty-cart">
          <div className="empty-cart-icon">
            <ShoppingBag size={42} />
          </div>

          <h1>Your Cart is Empty</h1>

          <p>
            Looks like you haven't added anything to
            your cart yet.
          </p>

          <Link
            to="/products"
            className="continue-shopping"
          >
            Continue Shopping
            <ArrowRight size={18} />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="cart-page">
      {/* Header */}
      <section className="cart-header">
        <div>
          <p className="section-label">
            SHOPPING CART
          </p>

          <h1>Your Cart</h1>

          <p>
            {cartItems.length}{" "}
            {cartItems.length === 1 ? "item" : "items"}{" "}
            in your cart
          </p>
        </div>
      </section>

      <section className="cart-layout">
        {/* Cart Items */}
        <div className="cart-items">
          {cartItems.map((item) => (
            <article
              className="cart-item"
              key={item.id}
            >
              {/* Product Image */}
              <div className="cart-item-image">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                />
              </div>

              {/* Product Details */}
              <div className="cart-item-details">
                <p className="cart-item-category">
                  {item.category?.name ||
                    item.category ||
                    "Product"}
                </p>

                <h2>{item.name}</h2>

                <p className="cart-item-price">
                  {formatCurrency(item.price)}
                </p>

                {/* Quantity + Remove */}
                <div className="cart-item-actions">
                  <div className="quantity-control">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(
                          item.id,
                          item.quantity - 1
                        )
                      }
                      aria-label={`Decrease quantity of ${item.name}`}
                      disabled={item.quantity <= 1}
                    >
                      <Minus size={15} />
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(
                          item.id,
                          item.quantity + 1
                        )
                      }
                      aria-label={`Increase quantity of ${item.name}`}
                    >
                      <Plus size={15} />
                    </button>
                  </div>

                  <button
                    type="button"
                    className="remove-item"
                    onClick={() =>
                      removeFromCart(item.id)
                    }
                  >
                    <Trash2 size={17} />
                    Remove
                  </button>
                </div>
              </div>

              {/* Item Total */}
              <div className="cart-item-total">
                {formatCurrency(
                  Number(item.price || 0) *
                    item.quantity
                )}
              </div>
            </article>
          ))}
        </div>

        {/* Order Summary */}
        <aside className="cart-summary">
          <h2>Order Summary</h2>

          <div className="summary-row">
            <span>Subtotal</span>

            <span>
              {formatCurrency(subtotal)}
            </span>
          </div>

          <div className="summary-row">
            <span>Shipping</span>

            <span>
              {shipping === 0
                ? "FREE"
                : formatCurrency(shipping)}
            </span>
          </div>

          <div className="summary-divider" />

          <div className="summary-total">
            <span>Total</span>

            <strong>
              {formatCurrency(total)}
            </strong>
          </div>

          <Link
            to="/checkout"
            className="checkout-button"
          >
            Proceed to Checkout
            <ArrowRight size={18} />
          </Link>

          <Link
            to="/products"
            className="continue-shopping-link"
          >
            Continue Shopping
          </Link>
        </aside>
      </section>
    </main>
  );
}

export default Cart;

