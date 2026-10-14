import { Link } from "react-router-dom";
import {
  CheckCircle,
  Package,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";

function OrderSuccess() {
  const orderId = "ORD-" + Date.now().toString().slice(-8);

  return (
    <main className="order-success-page">

      <section className="order-success-card">

        {/* Success Icon */}

        <div className="success-icon">
          <CheckCircle size={54} />
        </div>

        {/* Heading */}

        <p className="success-label">
          ORDER CONFIRMED
        </p>

        <h1>
          Thank You for Your Order!
        </h1>

        <p className="success-message">
          Your order has been placed successfully.
          We've received your order and will
          start preparing it for delivery.
        </p>

        {/* Order ID */}

        <div className="order-id-box">

          <span>
            Order ID
          </span>

          <strong>
            {orderId}
          </strong>

        </div>

        {/* Delivery Info */}

        <div className="success-info">

          <div className="success-info-item">

            <div className="success-info-icon">
              <Package size={22} />
            </div>

            <div>
              <strong>
                Order Processing
              </strong>

              <span>
                Your order is being prepared.
              </span>
            </div>

          </div>

          <div className="success-info-item">

            <div className="success-info-icon">
              <ShoppingBag size={22} />
            </div>

            <div>
              <strong>
                Track Your Order
              </strong>

              <span>
                You can track your order from
                My Orders.
              </span>
            </div>

          </div>

        </div>

        {/* Actions */}

        <div className="success-actions">

          <Link
            to="/orders"
            className="view-orders-button"
          >
            View My Orders
            <ArrowRight size={18} />
          </Link>

          <Link
            to="/products"
            className="continue-shopping-success"
          >
            Continue Shopping
          </Link>

        </div>

      </section>

    </main>
  );
}

export default OrderSuccess;