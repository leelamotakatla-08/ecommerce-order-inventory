import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  MapPin,
  Package,
  Truck,
} from "lucide-react";

import { useOrders } from "../../context/OrderContext";
import { getProductById } from "../../services/productService";
import { getOrderById as fetchOrderById } from "../../services/orderService";
import { formatCurrency } from "../../utils/formatCurrency";

function OrderDetails() {
  const { id } = useParams();
  const { getOrderById: getLocalOrderById } = useOrders();

  const localOrder = getLocalOrderById(id);

  const [order, setOrder] = useState(null);
  const [itemsWithProducts, setItemsWithProducts] = useState([]);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [orderError, setOrderError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadOrder = async () => {
      setLoadingOrder(true);
      setOrderError("");
      setOrder(null);

      try {
        // Uses the existing service, which sends the JWT token.
        const backendOrder = await fetchOrderById(id);

        if (cancelled) return;

        if (!backendOrder || backendOrder.id == null) {
          throw new Error("The server returned an invalid order.");
        }

        const totalAmount = Number(
          backendOrder.totalAmount ?? backendOrder.total ?? 0
        );

        setOrder({
          ...localOrder,
          ...backendOrder,
          id: String(backendOrder.id),
          createdAt:
            backendOrder.createdAt ??
            backendOrder.orderDate ??
            localOrder?.createdAt,
          status: backendOrder.status,
          items: backendOrder.items ?? [],
          subtotal: Number(
            backendOrder.subtotal ?? totalAmount
          ),
          total: totalAmount,
          shipping: Number(
            backendOrder.shippingAmount ??
              localOrder?.shipping ??
              0
          ),
        });
      } catch (error) {
        console.error("Failed to load order:", error);

        if (!cancelled) {
          setOrderError(
            error.message || "Unable to load this order."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingOrder(false);
        }
      }
    };

    loadOrder();

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    let cancelled = false;

    if (!order?.items?.length) {
      setItemsWithProducts([]);
      setLoadingProducts(false);
      return () => {
        cancelled = true;
      };
    }

    const loadProductDetails = async () => {
      setLoadingProducts(true);

      try {
        const enrichedItems = await Promise.all(
          order.items.map(async (item) => {
            try {
              const product = await getProductById(item.productId);

              return {
                ...item,
                productId: item.productId,
                name:
                  product?.name ||
                  item.productName ||
                  item.name ||
                  "Product",
                category:
                  product?.category?.name ||
                  product?.category ||
                  item.category ||
                  "",
                imageUrl:
                  product?.imageUrl ||
                  product?.image ||
                  item.imageUrl ||
                  item.image ||
                  "/placeholder-product.png",
                price: Number(
                  item.unitPrice ??
                    item.price ??
                    product?.price ??
                    0
                ),
                quantity: Number(item.quantity ?? 0),
                subtotal: Number(
                  item.subtotal ??
                    Number(item.unitPrice ?? item.price ?? 0) *
                      Number(item.quantity ?? 0)
                ),
              };
            } catch (error) {
              console.error(
                `Failed to load product ${item.productId}:`,
                error
              );

              return {
                ...item,
                name:
                  item.productName ||
                  item.name ||
                  "Product",
                imageUrl:
                  item.imageUrl ||
                  item.image ||
                  "/placeholder-product.png",
                price: Number(
                  item.unitPrice ?? item.price ?? 0
                ),
                quantity: Number(item.quantity ?? 0),
                subtotal: Number(
                  item.subtotal ??
                    Number(item.unitPrice ?? item.price ?? 0) *
                      Number(item.quantity ?? 0)
                ),
              };
            }
          })
        );

        if (!cancelled) {
          setItemsWithProducts(enrichedItems);
        }
      } catch (error) {
        console.error("Failed to load product details:", error);

        if (!cancelled) {
          setItemsWithProducts(order.items);
        }
      } finally {
        if (!cancelled) {
          setLoadingProducts(false);
        }
      }
    };

    loadProductDetails();

    return () => {
      cancelled = true;
    };
  }, [order]);

  if (loadingOrder) {
    return (
      <main className="order-details-page">
        <section className="order-details-header">
          <div className="order-details-heading">
            <Link to="/orders" className="order-back-link">
              <ArrowLeft size={17} />
              Back to My Orders
            </Link>

            <p className="section-label">ORDER DETAILS</p>
            <h1>Loading...</h1>
          </div>
        </section>
      </main>
    );
  }

  if (orderError || !order) {
    return (
      <main className="orders-page">
        <section className="orders-empty">
          <div className="orders-empty-icon">
            <Package size={32} />
          </div>

          <p className="section-label">ORDER</p>
          <h1>Unable to Load Order</h1>

          <p>
            {orderError ||
              "We couldn't find the order you're looking for."}
          </p>

          <Link to="/orders" className="orders-shop-button">
            <ArrowLeft size={18} />
            Back to My Orders
          </Link>
        </section>
      </main>
    );
  }

  const totalItems = itemsWithProducts.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0
  );

  const createdAt = order.createdAt
    ? new Date(order.createdAt)
    : null;

  const validCreatedAt =
    createdAt && !Number.isNaN(createdAt.getTime());

  return (
    <main className="order-details-page">
      <section className="order-details-header">
        <div className="order-details-heading">
          <Link to="/orders" className="order-back-link">
            <ArrowLeft size={17} />
            Back to My Orders
          </Link>

          <p className="section-label">ORDER DETAILS</p>
          <h1>#{order.id}</h1>

          <p className="order-created-text">
            Placed on{" "}
            {validCreatedAt
              ? createdAt.toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })
              : "Date unavailable"}
          </p>
        </div>

        <div
          className={`order-status-large ${
            order.status?.toLowerCase() || ""
          }`}
        >
          <CheckCircle2 size={18} />
          {order.status || "UNKNOWN"}
        </div>
      </section>

      <section className="order-details-layout">
        <div className="order-details-main">
          <div className="order-details-card">
            <div className="order-details-card-header">
              <div>
                <h2>Order Items</h2>
                <p>
                  {totalItems} {totalItems === 1 ? "item" : "items"} in
                  this order
                </p>
              </div>

              <div className="order-details-header-icon">
                <Package size={22} />
              </div>
            </div>

            <div className="order-detail-items">
              {loadingProducts ? (
                <div
                  style={{
                    padding: "30px 24px",
                    color: "#71717a",
                    fontSize: "14px",
                  }}
                >
                  Loading product details...
                </div>
              ) : itemsWithProducts.length === 0 ? (
                <div style={{ padding: "24px" }}>
                  No items were found for this order.
                </div>
              ) : (
                itemsWithProducts.map((item, index) => (
                  <div
                    className="order-detail-item"
                    key={item.id ?? item.productId ?? index}
                  >
                    <div className="order-detail-item-image">
                      <img
                        src={
                          item.imageUrl ||
                          item.image ||
                          "/placeholder-product.png"
                        }
                        alt={item.name || "Product"}
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src =
                            "/placeholder-product.png";
                        }}
                      />
                    </div>

                    <div className="order-detail-item-info">
                      {item.category && <span>{item.category}</span>}
                      <h3>{item.name || "Product"}</h3>
                      <p>Quantity: {item.quantity}</p>
                    </div>

                    <div className="order-detail-item-price">
                      <strong>
                        {formatCurrency(
                          Number(item.price || 0) *
                            Number(item.quantity || 0)
                        )}
                      </strong>

                      <span>
                        {formatCurrency(Number(item.price || 0))} each
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="order-details-card">
            <div className="order-details-card-header">
              <div>
                <h2>Delivery Address</h2>
                <p>Your order will be delivered here.</p>
              </div>

              <div className="order-details-header-icon">
                <MapPin size={22} />
              </div>
            </div>

            <div className="delivery-address">
              <strong>
                {order.customer?.fullName || "Customer"}
              </strong>

              <p>
                {order.shippingAddress?.address ||
                  "Address unavailable"}
              </p>

              <p>
                {order.shippingAddress?.city || ""}
                {order.shippingAddress?.city &&
                order.shippingAddress?.state
                  ? ", "
                  : ""}
                {order.shippingAddress?.state || ""}
                {order.shippingAddress?.pincode
                  ? ` - ${order.shippingAddress.pincode}`
                  : ""}
              </p>

              <p>
                Phone: {order.customer?.phone || "Unavailable"}
              </p>
            </div>
          </div>

          <div className="order-details-card">
            <div className="order-details-card-header">
              <div>
                <h2>Payment Information</h2>
                <p>Payment details for this order.</p>
              </div>

              <div className="order-details-header-icon">
                <CreditCard size={22} />
              </div>
            </div>

            <div className="payment-detail">
              <div>
                <span>Payment Method</span>
                <strong>
                  {order.payment?.method ||
                    order.paymentMethod ||
                    "Unavailable"}
                </strong>
              </div>

              <div>
                <span>Payment Status</span>
                <strong
                  className={
                    order.payment?.status === "SUCCESS"
                      ? "payment-paid"
                      : "payment-pending"
                  }
                >
                  {order.payment?.status ||
                    order.paymentStatus ||
                    "Unavailable"}
                </strong>
              </div>
            </div>
          </div>
        </div>

        <aside className="order-details-sidebar">
          <div className="order-summary-card">
            <h2>Order Summary</h2>

            <div className="summary-row">
              <span>Subtotal</span>
              <span>
                {formatCurrency(Number(order.subtotal || 0))}
              </span>
            </div>

            <div className="summary-row">
              <span>Shipping</span>
              <span>
                {Number(order.shipping || 0) === 0
                  ? "FREE"
                  : formatCurrency(Number(order.shipping))}
              </span>
            </div>

            <div className="summary-divider" />

            <div className="summary-total">
              <span>Total</span>
              <strong>
                {formatCurrency(Number(order.total || 0))}
              </strong>
            </div>

            <Link
              to={`/orders/${order.id}/tracking`}
              className="track-order-button"
            >
              <Truck size={18} />
              Track Order
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="order-date-card">
            <div className="order-date-icon">
              <CalendarDays size={20} />
            </div>

            <div className="order-date-content">
              <span>Order placed</span>
              <strong>
                {validCreatedAt
                  ? createdAt.toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Date unavailable"}
              </strong>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

export default OrderDetails;
