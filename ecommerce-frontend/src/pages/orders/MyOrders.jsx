import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import {
  Package,
  ArrowRight,
  ShoppingBag,
  CalendarDays,
  CreditCard,
  ChevronRight,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

import { getOrdersByUserId } from "../../services/orderService";
import { getProductById } from "../../services/productService";

import { formatCurrency } from "../../utils/formatCurrency";

function MyOrders() {
  const { user, isAuthenticated } = useAuth();

  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOrders() {
      if (!isAuthenticated || !user?.userId) {
        setOrders([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError("");

        const backendOrders =
          await getOrdersByUserId(user.userId);

        const mappedOrders = await Promise.all(
          backendOrders.map(async (order) => {
            const mappedItems = await Promise.all(
              order.items.map(async (item) => {
                let image =
                  "/placeholder-product.png";

                try {
                  const product =
                    await getProductById(
                      item.productId
                    );

                  image =
                    product.imageUrl ||
                    product.image ||
                    "/placeholder-product.png";
                } catch (productError) {
                  console.error(
                    `Failed to load product ${item.productId}:`,
                    productError
                  );
                }

                return {
                  id: item.id,
                  productId: item.productId,
                  name: item.productName,
                  quantity: item.quantity,
                  price: item.unitPrice,
                  subtotal: item.subtotal,
                  image,
                };
              })
            );

            return {
              id: String(order.id),
              status: order.status,
              createdAt: order.createdAt,
              total: order.totalAmount,
              items: mappedItems,
              payment: {
                method: "COD",
              },
            };
          })
        );

        setOrders(mappedOrders);
      } catch (err) {
        console.error(
          "Failed to load orders:",
          err
        );

        setError(
          err.message ||
            "Unable to load your orders."
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadOrders();
  }, [user?.userId, isAuthenticated]);

  if (isLoading) {
    return (
      <main className="orders-page">
        <section className="orders-empty">
          <div className="orders-empty-icon">
            <Package size={32} />
          </div>

          <p className="section-label">
            MY ACCOUNT
          </p>

          <h1>Loading Orders...</h1>

          <p>
            Please wait while we load your
            recent orders.
          </p>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="orders-page">
        <section className="orders-empty">
          <div className="orders-empty-icon">
            <Package size={32} />
          </div>

          <p className="section-label">
            MY ACCOUNT
          </p>

          <h1>Unable to Load Orders</h1>

          <p>{error}</p>

          <Link
            to="/products"
            className="orders-shop-button"
          >
            Continue Shopping
            <ArrowRight size={18} />
          </Link>
        </section>
      </main>
    );
  }

  if (orders.length === 0) {
    return (
      <main className="orders-page">
        <section className="orders-empty">
          <div className="orders-empty-icon">
            <ShoppingBag size={32} />
          </div>

          <p className="section-label">
            MY ORDERS
          </p>

          <h1>No Orders Yet</h1>

          <p>
            You haven't placed any orders yet.
            Start shopping and your orders will
            appear here.
          </p>

          <Link
            to="/products"
            className="orders-shop-button"
          >
            Start Shopping
            <ArrowRight size={18} />
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="orders-page">
      <section className="orders-header">
        <div className="orders-header-content">
          <p className="section-label">
            MY ACCOUNT
          </p>

          <h1>My Orders</h1>

          <p>
            View and track all your recent orders.
          </p>
        </div>

        <div className="orders-count">
          <Package size={18} />

          <span>
            {orders.length}{" "}
            {orders.length === 1
              ? "Order"
              : "Orders"}
          </span>
        </div>
      </section>

      <section className="orders-list">
        {orders.map((order) => {
          const itemCount = order.items.reduce(
            (total, item) =>
              total + item.quantity,
            0
          );

          const formattedDate = new Date(
            order.createdAt
          ).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });

          return (
            <article
              className="order-card"
              key={order.id}
            >
              <div className="order-card-header">
                <div className="order-id-section">
                  <span className="order-label">
                    ORDER ID
                  </span>

                  <div className="order-id-row">
                    <h2>#{order.id}</h2>

                    <ChevronRight
                      size={17}
                      className="order-id-arrow"
                    />
                  </div>
                </div>

                <span
                  className={`order-status ${order.status.toLowerCase()}`}
                >
                  <span className="status-dot" />
                  {order.status}
                </span>
              </div>

              <div className="order-card-info">
                <div className="order-info-item">
                  <div className="order-info-icon">
                    <CalendarDays size={17} />
                  </div>

                  <div>
                    <span>Order Date</span>

                    <strong>
                      {formattedDate}
                    </strong>
                  </div>
                </div>

                <div className="order-info-item">
                  <div className="order-info-icon">
                    <Package size={17} />
                  </div>

                  <div>
                    <span>Items</span>

                    <strong>
                      {itemCount}{" "}
                      {itemCount === 1
                        ? "item"
                        : "items"}
                    </strong>
                  </div>
                </div>

                <div className="order-info-item amount">
                  <div>
                    <span>Total Amount</span>

                    <strong>
                      {formatCurrency(
                        order.total
                      )}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="order-products-section">
                <div className="order-products-heading">
                  <span>ORDER ITEMS</span>

                  {order.items.length > 3 && (
                    <span>
                      +{order.items.length - 3} more
                    </span>
                  )}
                </div>

                <div className="order-products-preview">
                  {order.items
                    .slice(0, 3)
                    .map((item) => (
                      <div
                        className="order-product-preview"
                        key={item.id}
                      >
                        <div className="order-product-image">
                          <img
                            src={
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

                        <div className="order-product-details">
                          <strong>
                            {item.name}
                          </strong>

                          <span>
                            Qty: {item.quantity}
                          </span>
                        </div>

                        <span className="order-product-price">
                          {formatCurrency(
                            item.subtotal
                          )}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              <div className="order-card-footer">
                <div className="order-payment">
                  <div className="order-payment-icon">
                    <CreditCard size={16} />
                  </div>

                  <div>
                    <span>
                      Payment Method
                    </span>

                    <strong>
                      {order.payment.method}
                    </strong>
                  </div>
                </div>

                <Link
                  to={`/orders/${order.id}`}
                  className="view-order-button"
                >
                  View Order
                  <ArrowRight size={17} />
                </Link>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}

export default MyOrders;