import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  Minus,
  Plus,
  ShoppingCart,
  Star,
  Truck,
  ShieldCheck,
  RotateCcw,
  Check,
} from "lucide-react";

import { getProductById } from "../../services/productService";
import { getInventoryByProductId } from "../../services/inventoryService";
import {
  addToWishlist,
  isInWishlist,
  removeFromWishlist,
} from "../../services/wishlistService";

import { formatCurrency } from "../../utils/formatCurrency";
import { useCart } from "../../context/CartContext";

function ProductDetails() {
  const { addToCart } = useCart();
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [stockQuantity, setStockQuantity] = useState(0);

  const [loading, setLoading] = useState(true);
  const [inventoryLoading, setInventoryLoading] =
    useState(true);

  const [error, setError] = useState("");
  const [inventoryError, setInventoryError] =
    useState("");

  const [quantity, setQuantity] = useState(1);
  const [liked, setLiked] = useState(false);
  const [wishlistLoading, setWishlistLoading] =
    useState(false);

  const [added, setAdded] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        setError("");

        const data = await getProductById(id);

        setProduct(data);
      } catch (err) {
        console.error(
          "Failed to load product:",
          err
        );

        setError(
          "Unable to load this product."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [id]);

  useEffect(() => {
    async function loadInventory() {
      try {
        setInventoryLoading(true);
        setInventoryError("");

        const inventory =
          await getInventoryByProductId(id);

        const availableQuantity = Number(
          inventory.availableQuantity || 0
        );

        setStockQuantity(
          availableQuantity
        );

        setQuantity((currentQuantity) => {
          if (availableQuantity <= 0) {
            return 1;
          }

          return Math.min(
            currentQuantity,
            availableQuantity
          );
        });
      } catch (err) {
        console.error(
          "Failed to load inventory:",
          err
        );

        setInventoryError(
          "Unable to load stock information."
        );

        setStockQuantity(0);
      } finally {
        setInventoryLoading(false);
      }
    }

    loadInventory();
  }, [id]);

  useEffect(() => {
    let mounted = true;

    async function loadWishlistStatus() {
      try {
        const exists = await isInWishlist(id);

        if (mounted) {
          setLiked(exists);
        }
      } catch (err) {
        console.log(
          "Wishlist status unavailable:",
          err.message
        );

        if (mounted) {
          setLiked(false);
        }
      }
    }

    loadWishlistStatus();

    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <main
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "100px 30px",
          textAlign: "center",
        }}
      >
        <h1>Loading Product...</h1>

        <p
          style={{
            color: "#71717a",
            marginTop: "12px",
          }}
        >
          Please wait while we load the product
          details.
        </p>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "100px 30px",
          textAlign: "center",
        }}
      >
        <h1>Product Not Found</h1>

        <p
          style={{
            color: "#666",
            marginTop: "12px",
          }}
        >
          {error ||
            "The product you're looking for doesn't exist."}
        </p>

        <Link
          to="/products"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            marginTop: "25px",
            padding: "13px 22px",
            borderRadius: "10px",
            background: "#6366f1",
            color: "#fff",
            textDecoration: "none",
            fontWeight: "600",
          }}
        >
          <ArrowLeft size={18} />
          Back to Products
        </Link>
      </main>
    );
  }

  const isOutOfStock =
    inventoryLoading ||
    stockQuantity <= 0 ||
    product.status !== "ACTIVE";

  const increaseQuantity = () => {
    setQuantity((current) =>
      current < stockQuantity
        ? current + 1
        : current
    );
  };

  const decreaseQuantity = () => {
    setQuantity((current) =>
      current > 1 ? current - 1 : 1
    );
  };

  const handleWishlist = async () => {
    if (wishlistLoading) {
      return;
    }

    try {
      setWishlistLoading(true);

      if (liked) {
        await removeFromWishlist(id);
        setLiked(false);
      } else {
        await addToWishlist(id);
        setLiked(true);
      }
    } catch (err) {
      console.error(
        "Failed to update wishlist:",
        err
      );

      alert(
        err.message ||
          "Please login before using the wishlist."
      );
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (
      isOutOfStock ||
      quantity > stockQuantity
    ) {
      return;
    }

    try {
      await addToCart(product, quantity);

      const inventory =
        await getInventoryByProductId(id);

      const availableQuantity = Number(
        inventory.availableQuantity || 0
      );

      setStockQuantity(
        availableQuantity
      );

      setQuantity((currentQuantity) => {
        if (availableQuantity <= 0) {
          return 1;
        }

        return Math.min(
          currentQuantity,
          availableQuantity
        );
      });

      setAdded(true);

      setTimeout(() => {
        setAdded(false);
      }, 2000);
    } catch (error) {
      console.error(
        "Failed to add product to cart:",
        error
      );

      alert(
        error.message ||
          "Unable to add product to cart."
      );
    }
  };

  return (
    <main
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "40px 30px 80px",
      }}
    >
      {/* Breadcrumb */}
      <div
        style={{
          marginBottom: "30px",
          fontSize: "14px",
          color: "#71717a",
        }}
      >
        <Link
          to="/products"
          style={{
            color: "#6366f1",
            textDecoration: "none",
            fontWeight: "600",
          }}
        >
          Products
        </Link>

        <span style={{ margin: "0 8px" }}>
          /
        </span>

        <span>{product.name}</span>
      </div>

      {/* Main Product Section */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns:
            "minmax(0, 1.05fr) minmax(0, 0.95fr)",
          gap: "60px",
          alignItems: "start",
        }}
      >
        {/* Product Image */}
        <div>
          <div
            style={{
              position: "relative",
              background: "#f4f4f5",
              borderRadius: "24px",
              overflow: "hidden",
              minHeight: "520px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                position: "absolute",
                top: "20px",
                left: "20px",
                zIndex: 2,
                background: isOutOfStock
                  ? "#71717a"
                  : "#6366f1",
                color: "#fff",
                padding: "8px 14px",
                borderRadius: "20px",
                fontSize: "13px",
                fontWeight: "700",
              }}
            >
              {inventoryLoading
                ? "Checking Stock"
                : isOutOfStock
                ? "Out of Stock"
                : "Available"}
            </span>

            {/* Wishlist */}
            <button
              type="button"
              onClick={handleWishlist}
              disabled={wishlistLoading}
              aria-label={
                liked
                  ? "Remove from wishlist"
                  : "Add to wishlist"
              }
              title={
                liked
                  ? "Remove from wishlist"
                  : "Add to wishlist"
              }
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                zIndex: 2,
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                border:
                  "1px solid #e4e4e7",
                background: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: wishlistLoading
                  ? "not-allowed"
                  : "pointer",
                opacity: wishlistLoading
                  ? 0.6
                  : 1,
              }}
            >
              <Heart
                size={20}
                fill={
                  liked
                    ? "#6366f1"
                    : "none"
                }
                color={
                  liked
                    ? "#6366f1"
                    : "#27272a"
                }
              />
            </button>

            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                style={{
                  width: "100%",
                  height: "520px",
                  objectFit: "contain",
                  padding: "35px",
                  display: "block",
                }}
              />
            ) : (
              <ShoppingCart
                size={100}
                color="#a1a1aa"
              />
            )}
          </div>
        </div>

        {/* Product Information */}
        <div style={{ paddingTop: "10px" }}>
          <p
            style={{
              color: "#6366f1",
              fontSize: "13px",
              fontWeight: "800",
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              marginBottom: "12px",
            }}
          >
            {product.categoryName}
          </p>

          <h1
            style={{
              fontSize: "44px",
              lineHeight: "1.1",
              margin: "0 0 18px",
              color: "#18181b",
            }}
          >
            {product.name}
          </h1>

          {/* Brand */}
          <p
            style={{
              margin: "0 0 18px",
              color: "#71717a",
              fontSize: "15px",
            }}
          >
            Brand:{" "}
            <strong
              style={{
                color: "#27272a",
              }}
            >
              {product.brand || "N/A"}
            </strong>
          </p>

          {/* Featured Product */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "22px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                color: "#f59e0b",
              }}
            >
              <Star
                size={18}
                fill="currentColor"
              />

              <strong>
                Featured Product
              </strong>
            </div>
          </div>

          {/* Price */}
          <div
            style={{
              fontSize: "32px",
              fontWeight: "800",
              color: "#18181b",
              marginBottom: "24px",
            }}
          >
            {formatCurrency(product.price)}
          </div>

          <div
            style={{
              height: "1px",
              background: "#e4e4e7",
              marginBottom: "25px",
            }}
          />

          {/* Description */}
          <p
            style={{
              color: "#52525b",
              fontSize: "16px",
              lineHeight: "1.7",
              marginBottom: "28px",
            }}
          >
            {product.description ||
              `Experience quality, style, and everyday convenience with the ${product.name}.`}
          </p>

          {/* Stock */}
          <p
            style={{
              marginBottom: "20px",
              color:
                inventoryLoading
                  ? "#71717a"
                  : isOutOfStock
                  ? "#dc2626"
                  : "#16a34a",
              fontWeight: "700",
            }}
          >
            {inventoryLoading
              ? "Checking stock..."
              : inventoryError
              ? inventoryError
              : isOutOfStock
              ? "Currently out of stock"
              : `${stockQuantity} items available`}
          </p>

          {/* Quantity */}
          {!isOutOfStock && (
            <div
              style={{
                marginBottom: "20px",
              }}
            >
              <p
                style={{
                  fontWeight: "700",
                  marginBottom: "10px",
                }}
              >
                Quantity
              </p>

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  border:
                    "1px solid #d4d4d8",
                  borderRadius: "10px",
                  overflow: "hidden",
                }}
              >
                <button
                  type="button"
                  onClick={
                    decreaseQuantity
                  }
                  disabled={quantity <= 1}
                  style={{
                    width: "42px",
                    height: "42px",
                    border: "none",
                    background: "#fff",
                    cursor:
                      quantity <= 1
                        ? "not-allowed"
                        : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent:
                      "center",
                    opacity:
                      quantity <= 1
                        ? 0.4
                        : 1,
                  }}
                >
                  <Minus size={16} />
                </button>

                <span
                  style={{
                    width: "42px",
                    textAlign: "center",
                    fontWeight: "700",
                  }}
                >
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={
                    increaseQuantity
                  }
                  disabled={
                    quantity >=
                    stockQuantity
                  }
                  style={{
                    width: "42px",
                    height: "42px",
                    border: "none",
                    background: "#fff",
                    cursor:
                      quantity >=
                      stockQuantity
                        ? "not-allowed"
                        : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent:
                      "center",
                    opacity:
                      quantity >=
                      stockQuantity
                        ? 0.4
                        : 1,
                  }}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Cart Buttons */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              marginBottom: "15px",
            }}
          >
            <button
              type="button"
              onClick={
                handleAddToCart
              }
              disabled={
                isOutOfStock ||
                inventoryLoading
              }
              style={{
                flex: 1,
                minHeight: "52px",
                border: "none",
                borderRadius: "11px",
                background:
                  isOutOfStock ||
                  inventoryLoading
                    ? "#a1a1aa"
                    : added
                    ? "#16a34a"
                    : "#6366f1",
                color: "#fff",
                fontSize: "16px",
                fontWeight: "700",
                cursor:
                  isOutOfStock ||
                  inventoryLoading
                    ? "not-allowed"
                    : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent:
                  "center",
                gap: "9px",
                transition: "0.2s",
              }}
            >
              {inventoryLoading ? (
                "Checking Stock..."
              ) : isOutOfStock ? (
                "Out of Stock"
              ) : added ? (
                <>
                  <Check size={19} />
                  Added to Cart
                </>
              ) : (
                <>
                  <ShoppingCart size={19} />
                  Add to Cart
                </>
              )}
            </button>

            {/* Wishlist Button */}
            <button
              type="button"
              onClick={handleWishlist}
              disabled={wishlistLoading}
              aria-label={
                liked
                  ? "Remove from wishlist"
                  : "Add to wishlist"
              }
              title={
                liked
                  ? "Remove from wishlist"
                  : "Add to wishlist"
              }
              style={{
                width: "54px",
                border:
                  "1px solid #d4d4d8",
                borderRadius: "11px",
                background: "#fff",
                cursor: wishlistLoading
                  ? "not-allowed"
                  : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent:
                  "center",
                opacity: wishlistLoading
                  ? 0.6
                  : 1,
              }}
            >
              <Heart
                size={20}
                fill={
                  liked
                    ? "#6366f1"
                    : "none"
                }
                color={
                  liked
                    ? "#6366f1"
                    : "#27272a"
                }
              />
            </button>
          </div>

          {/* Cart Confirmation */}
          {added && (
            <p
              style={{
                color: "#16a34a",
                fontSize: "14px",
                fontWeight: "600",
                marginBottom: "20px",
              }}
            >
              {quantity} ×{" "}
              {product.name} added to
              your cart.
            </p>
          )}

          {/* Benefits */}
          <div
            style={{
              display: "grid",
              gap: "16px",
              marginTop: added
                ? "0"
                : "20px",
            }}
          >
            {/* Fast Delivery */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
              }}
            >
              <Truck
                size={22}
                color="#6366f1"
              />

              <div>
                <strong
                  style={{
                    display: "block",
                  }}
                >
                  Fast Delivery
                </strong>

                <span
                  style={{
                    color: "#71717a",
                    fontSize: "14px",
                  }}
                >
                  Quick and reliable delivery
                </span>
              </div>
            </div>

            {/* Secure Payment */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
              }}
            >
              <ShieldCheck
                size={22}
                color="#6366f1"
              />

              <div>
                <strong
                  style={{
                    display: "block",
                  }}
                >
                  Secure Payment
                </strong>

                <span
                  style={{
                    color: "#71717a",
                    fontSize: "14px",
                  }}
                >
                  Safe and secure checkout
                </span>
              </div>
            </div>

            {/* Easy Returns */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
              }}
            >
              <RotateCcw
                size={22}
                color="#6366f1"
              />

              <div>
                <strong
                  style={{
                    display: "block",
                  }}
                >
                  Easy Returns
                </strong>

                <span
                  style={{
                    color: "#71717a",
                    fontSize: "14px",
                  }}
                >
                  Simple return experience
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default ProductDetails;