import { useEffect, useState } from "react";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

import {
  getWishlist,
  removeFromWishlist,
} from "../services/wishlistService";

import { formatCurrency } from "../utils/formatCurrency";

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadWishlist = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getWishlist();

        setWishlist(data);
      } catch (err) {
        console.error(
          "Failed to load wishlist:",
          err
        );

        setError(
          err.message ||
            "Unable to load your wishlist."
        );
      } finally {
        setLoading(false);
      }
    };

    loadWishlist();
  }, []);

  const handleRemove = async (productId) => {
    if (removingId === productId) {
      return;
    }

    try {
      setRemovingId(productId);

      await removeFromWishlist(productId);

      setWishlist((currentWishlist) =>
        currentWishlist.filter(
          (item) =>
            item.productId !== productId
        )
      );
    } catch (err) {
      console.error(
        "Failed to remove wishlist item:",
        err
      );

      alert(
        err.message ||
          "Unable to remove product from wishlist."
      );
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <main className="page-container">
        <div className="page-header">
          <p className="eyebrow">YOUR COLLECTION</p>
          <h1>My Wishlist</h1>
          <p>
            Products you've saved for later.
          </p>
        </div>

        <div className="empty-state">
          Loading wishlist...
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="page-container">
        <div className="page-header">
          <p className="eyebrow">YOUR COLLECTION</p>
          <h1>My Wishlist</h1>
        </div>

        <div className="empty-state">
          <p>{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="page-container">
      <div className="page-header">
        <p className="eyebrow">YOUR COLLECTION</p>

        <h1>
          My Wishlist
          <span className="wishlist-count">
            {" "}
            ({wishlist.length})
          </span>
        </h1>

        <p>
          Products you've saved for later.
        </p>
      </div>

      {wishlist.length === 0 ? (
        <div className="empty-state">
          <Heart size={48} />

          <h2>Your wishlist is empty</h2>

          <p>
            Save products you love and find
            them here later.
          </p>

          <Link
            to="/products"
            className="primary-button"
          >
            Explore Products
          </Link>
        </div>
      ) : (
        <div className="wishlist-grid">
          {wishlist.map((item) => {
            const isOutOfStock =
              Number(item.stockQuantity || 0) <= 0;

            return (
              <article
                className="wishlist-card"
                key={item.id}
              >
                <Link
                  to={`/products/${item.productId}`}
                  className="wishlist-image-wrapper"
                >
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                      className="wishlist-image"
                    />
                  ) : (
                    <ShoppingCart size={48} />
                  )}
                </Link>

                <div className="wishlist-info">
                  <p className="wishlist-category">
                    {item.categoryName ||
                      "Uncategorized"}
                  </p>

                  <Link
                    to={`/products/${item.productId}`}
                    className="wishlist-name"
                  >
                    {item.productName}
                  </Link>

                  <p className="wishlist-brand">
                    {item.brand ||
                      "Brand unavailable"}
                  </p>

                  <p className="wishlist-price">
                    {formatCurrency(item.price)}
                  </p>

                  <p
                    className={
                      isOutOfStock
                        ? "wishlist-stock wishlist-stock-out"
                        : "wishlist-stock"
                    }
                  >
                    {isOutOfStock
                      ? "Out of stock"
                      : `${item.stockQuantity} in stock`}
                  </p>

                  <button
                    type="button"
                    className="wishlist-remove-button"
                    onClick={() =>
                      handleRemove(
                        item.productId
                      )
                    }
                    disabled={
                      removingId ===
                      item.productId
                    }
                  >
                    <Trash2 size={16} />

                    {removingId ===
                    item.productId
                      ? "Removing..."
                      : "Remove"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}

export default Wishlist;