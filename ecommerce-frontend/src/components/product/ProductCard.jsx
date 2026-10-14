import { useEffect, useState } from "react";
import { Check, Heart, ShoppingCart, Star } from "lucide-react";
import { Link } from "react-router-dom";

import { useCart } from "../../context/CartContext";
import {
  addToWishlist,
  isInWishlist,
  removeFromWishlist,
} from "../../services/wishlistService";

import { formatCurrency } from "../../utils/formatCurrency";

function ProductCard({ product }) {
  const { addToCart } = useCart();

  const [liked, setLiked] = useState(false);
  const [added, setAdded] = useState(false);
  const [adding, setAdding] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const [stockQuantity, setStockQuantity] = useState(
    Number(product.stockQuantity || 0)
  );

  const isOutOfStock =
    stockQuantity <= 0 ||
    product.status !== "ACTIVE";

  useEffect(() => {
    let mounted = true;

    const checkWishlist = async () => {
      try {
        const exists = await isInWishlist(product.id);

        if (mounted) {
          setLiked(exists);
        }
      } catch (error) {
        console.error(
          "Failed to check wishlist:",
          error
        );
      }
    };

    checkWishlist();

    return () => {
      mounted = false;
    };
  }, [product.id]);

  const handleAddToCart = async () => {
    if (isOutOfStock || adding) {
      return;
    }

    try {
      setAdding(true);

      await addToCart(product, 1);

      setStockQuantity((currentStock) =>
        Math.max(0, currentStock - 1)
      );

      setAdded(true);

      setTimeout(() => {
        setAdded(false);
      }, 1800);
    } catch (error) {
      console.error(
        "Failed to add product to cart:",
        error
      );

      alert(
        error.message ||
          "Unable to add product to cart."
      );
    } finally {
      setAdding(false);
    }
  };

  const handleWishlist = async () => {
    if (wishlistLoading) {
      return;
    }

    try {
      setWishlistLoading(true);

      if (liked) {
        await removeFromWishlist(product.id);
        setLiked(false);
      } else {
        await addToWishlist(product.id);
        setLiked(true);
      }
    } catch (error) {
      console.error(
        "Failed to update wishlist:",
        error
      );

      alert(
        error.message ||
          "Unable to update wishlist."
      );
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <article className="product-card">
      <div className="product-image-wrapper">
        <span
          className={
            isOutOfStock
              ? "product-badge product-badge-out"
              : "product-badge"
          }
        >
          {isOutOfStock
            ? "Out of Stock"
            : "Available"}
        </span>

        <button
          className={
            liked
              ? "wishlist-button wishlist-active"
              : "wishlist-button"
          }
          type="button"
          aria-label={
            liked
              ? "Remove from wishlist"
              : "Add to wishlist"
          }
          onClick={handleWishlist}
          disabled={wishlistLoading}
        >
          <Heart
            size={18}
            fill={
              liked
                ? "currentColor"
                : "none"
            }
          />
        </button>

        <Link
          to={`/products/${product.id}`}
          className="product-image-link"
        >
          <div className="product-image-placeholder">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="product-image"
              />
            ) : (
              <ShoppingCart
                size={48}
                color="#a1a1aa"
              />
            )}
          </div>
        </Link>
      </div>

      <div className="product-info">
        <p className="product-category">
          {product.categoryName ||
            "Uncategorized"}
        </p>

        <Link
          to={`/products/${product.id}`}
          className="product-name"
        >
          {product.name}
        </Link>

        <p className="product-brand">
          {product.brand ||
            "Brand unavailable"}
        </p>

        <div className="product-rating">
          <Star
            size={15}
            fill="currentColor"
          />
          <span>Featured</span>
        </div>

        <p
          className={
            isOutOfStock
              ? "product-stock product-stock-out"
              : "product-stock"
          }
        >
          {isOutOfStock
            ? "Currently unavailable"
            : `${stockQuantity} in stock`}
        </p>

        <div className="product-bottom">
          <span className="product-price">
            {formatCurrency(product.price)}
          </span>

          <button
            className={
              added
                ? "add-cart-button added"
                : "add-cart-button"
            }
            type="button"
            onClick={handleAddToCart}
            disabled={
              isOutOfStock || adding
            }
          >
            {added ? (
              <>
                <Check size={17} />
                Added
              </>
            ) : adding ? (
              <>
                <ShoppingCart size={17} />
                Adding...
              </>
            ) : (
              <>
                <ShoppingCart size={17} />
                {isOutOfStock
                  ? "Unavailable"
                  : "Add"}
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;