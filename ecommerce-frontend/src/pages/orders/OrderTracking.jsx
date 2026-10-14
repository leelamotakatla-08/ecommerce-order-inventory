import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  ArrowLeft,
  Check,
  ChevronRight,
  MapPin,
  Package,
  ShoppingCart,
  Truck,
} from "lucide-react";

import { useOrders } from "../../context/OrderContext";
import { getProductById } from "../../services/productService";
import { formatCurrency } from "../../utils/formatCurrency";

import "./OrderTracking.css";

const API_BASE_URL = "http://localhost:8080/api";

function OrderTracking() {
  const { id } = useParams();
  const { getOrderById } = useOrders();

  const localOrder = getOrderById(id);

  const [order, setOrder] = useState(localOrder);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/orders/${id}`
        );

        if (!response.ok) {
          throw new Error(
            `Failed to load order: ${response.status}`
          );
        }

        const backendOrder = await response.json();

        setOrder({
          ...localOrder,
          ...backendOrder,
          id: String(backendOrder.id),
          items: backendOrder.items || [],
          total: Number(
            backendOrder.totalAmount || 0
          ),
        });
      } catch (error) {
        console.error(
          "Failed to load order:",
          error
        );

        setOrder(localOrder);
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [id]);

  useEffect(() => {
    const loadProduct = async () => {
      const productId =
        order?.items?.[0]?.productId;

      if (!productId) {
        return;
      }

      try {
        const data =
          await getProductById(productId);

        setProduct(data);
      } catch (error) {
        console.error(
          "Failed to load product:",
          error
        );
      }
    };

    loadProduct();
  }, [order]);

  if (loading) {
    return (
      <main className="ot-page">
        <div className="ot-loading">
          Loading order...
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="ot-page">
        <div className="ot-empty">
          <Package size={40} />

          <h1>Order Not Found</h1>

          <p>
            We couldn't find the order you're
            looking for.
          </p>

          <Link
            to="/orders"
            className="ot-back-button"
          >
            <ArrowLeft size={18} />
            Back to My Orders
          </Link>
        </div>
      </main>
    );
  }

  const status =
    order.status?.toUpperCase() || "CONFIRMED";

  const steps = [
    {
      key: "PLACED",
      title: "Order Placed",
      description:
        "Your order has been successfully placed.",
      icon: Package,
    },
    {
      key: "CONFIRMED",
      title: "Order Confirmed",
      description:
        "Your order has been confirmed and is being prepared.",
      icon: Check,
    },
    {
      key: "SHIPPED",
      title: "Shipped",
      description:
        "Your package has been handed over for delivery.",
      icon: Truck,
    },
    {
      key: "OUT_FOR_DELIVERY",
      title: "Out for Delivery",
      description:
        "Your package is on its way to your address.",
      icon: Truck,
    },
    {
      key: "DELIVERED",
      title: "Delivered",
      description:
        "Your order has been delivered successfully.",
      icon: Check,
    },
  ];

  let currentStep = steps.findIndex(
    (step) => step.key === status
  );

  if (currentStep < 0) {
    currentStep = 1;
  }

  const totalItems =
    order.items?.reduce(
      (total, item) =>
        total + Number(item.quantity || 0),
      0
    ) || 0;

  const firstItem = order.items?.[0];

  const productName =
    product?.name ||
    firstItem?.productName ||
    "Product";

  const productImage =
    product?.imageUrl ||
    product?.image ||
    "/placeholder-product.png";

  const productPrice = Number(
    firstItem?.unitPrice ||
      product?.price ||
      0
  );

  const quantity = Number(
    firstItem?.quantity || 1
  );

  const paymentMethod =
    order.payment?.method || "UPI";

  return (
    <main className="ot-page">
      <div className="ot-container">

        <div className="ot-topbar">
          <Link
            to={`/orders/${order.id}`}
            className="ot-back-link"
          >
            <ArrowLeft size={18} />
            <span>Back to Order Details</span>
          </Link>

          <Link
            to="/cart"
            className="ot-cart-link"
          >
            <ShoppingCart size={20} />
          </Link>
        </div>

        <div className="ot-header">
          <div className="ot-header-left">
            <div className="ot-label">
              ORDER TRACKING
            </div>

            <h1>Track Your Order</h1>

            <p>
              Order ID:{" "}
              <strong>#{order.id}</strong>
            </p>
          </div>

          <div className="ot-status">
            <Check size={16} />
            {status.replaceAll("_", " ")}
          </div>
        </div>

        <section className="ot-card ot-status-card">
          <div className="ot-card-header">
            <div>
              <h2>Delivery Status</h2>

              <p>
                Follow your order's progress from
                placement to delivery.
              </p>
            </div>
          </div>

          <div className="ot-timeline">
            {steps.map((step, index) => {
              const Icon = step.icon;

              const completed =
                index <= currentStep;

              const current =
                index === currentStep;

              return (
                <div
                  className={`ot-step ${
                    completed
                      ? "ot-step-completed"
                      : ""
                  } ${
                    current
                      ? "ot-step-current"
                      : ""
                  }`}
                  key={step.key}
                >
                  <div className="ot-step-marker-column">
                    <div className="ot-step-marker">
                      {completed ? (
                        <Icon size={17} />
                      ) : (
                        <span />
                      )}
                    </div>

                    {index <
                      steps.length - 1 && (
                      <div
                        className={`ot-step-line ${
                          index <
                          currentStep
                            ? "ot-step-line-active"
                            : ""
                        }`}
                      />
                    )}
                  </div>

                  <div className="ot-step-content">
                    <div className="ot-step-title-row">
                      <h3>
                        {step.title}
                      </h3>

                      {current && (
                        <span className="ot-current">
                          Current
                        </span>
                      )}
                    </div>

                    <p>
                      {step.description}
                    </p>

                    {current &&
                      order.createdAt && (
                        <span className="ot-time">
                          {new Date(
                            order.createdAt
                          ).toLocaleString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month:
                                "short",
                              year:
                                "numeric",
                              hour:
                                "2-digit",
                              minute:
                                "2-digit",
                            }
                          )}
                        </span>
                      )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="ot-card ot-summary-card">
          <div className="ot-summary-header">
            <div>
              <div className="ot-label">
                ORDER SUMMARY
              </div>

              <h2>Order #{order.id}</h2>
            </div>
          </div>

          <div className="ot-product">
            <div className="ot-product-image">
              <img
                src={productImage}
                alt={productName}
                onError={(event) => {
                  event.currentTarget.onerror =
                    null;

                  event.currentTarget.src =
                    "/placeholder-product.png";
                }}
              />
            </div>

            <div className="ot-product-info">
              <h3>{productName}</h3>

              <p>
                Quantity: {quantity}
              </p>
            </div>

            <strong>
              {formatCurrency(
                productPrice * quantity
              )}
            </strong>
          </div>

          <div className="ot-divider" />

          <div className="ot-summary-row">
            <span>Items</span>
            <strong>{totalItems}</strong>
          </div>

          <div className="ot-summary-row">
            <span>Total</span>
            <strong>
              {formatCurrency(
                Number(order.total || 0)
              )}
            </strong>
          </div>

          <div className="ot-summary-row">
            <span>Payment</span>
            <strong>
              {paymentMethod}
            </strong>
          </div>
        </section>

        <section className="ot-card ot-address-card">
          <div className="ot-address-icon">
            <MapPin size={20} />
          </div>

          <div className="ot-address-content">
            <h2>Delivery Address</h2>

            <strong>
              {order.customer?.fullName ||
                "Leela Motakatla"}
            </strong>

            <p>
              {order.shippingAddress?.address ||
                "Address unavailable"}
            </p>

            <p>
              {order.shippingAddress?.city ||
                ""}
              {order.shippingAddress?.city &&
              order.shippingAddress?.state
                ? ", "
                : ""}
              {order.shippingAddress?.state ||
                ""}
              {order.shippingAddress?.pincode
                ? ` - ${order.shippingAddress.pincode}`
                : ""}
            </p>
          </div>

          <ChevronRight
            size={20}
            className="ot-address-arrow"
          />
        </section>

      </div>
    </main>
  );
}

export default OrderTracking;