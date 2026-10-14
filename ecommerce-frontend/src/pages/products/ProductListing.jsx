
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  useSearchParams,
} from "react-router-dom";
import {
  SlidersHorizontal,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

import ProductGrid from "../../components/product/ProductGrid";
import ProductFilters from "../../components/product/ProductFilters";
import { getProducts } from "../../services/productService";

function ProductListing() {
  const [searchParams] = useSearchParams();

  const initialSearch =
    searchParams.get("search") || "";

  const [products, setProducts] = useState([]);

  const [searchTerm, setSearchTerm] =
    useState(initialSearch);

  const [category, setCategory] =
    useState("All");

  const [availability, setAvailability] =
    useState(null);

  const [sortBy, setSortBy] =
    useState("featured");

  const [showFilters, setShowFilters] =
    useState(false);

  const [page, setPage] = useState(0);

  const pageSize = 10;

  const [totalPages, setTotalPages] =
    useState(0);

  const [totalElements, setTotalElements] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] = useState("");

  // Category IDs must match the MySQL database.
  const categoryMap = {
    Electronics: 1,
    Fashion: 2,
    "Home & Kitchen": 3,
    Beauty: 4,
    Sports: 5,
    Books: 6,
    Grocery: 7,
    Toys: 8,
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      let backendSortBy = "id";
      let direction = "asc";

      if (sortBy === "price-low") {
        backendSortBy = "price";
        direction = "asc";
      }

      if (sortBy === "price-high") {
        backendSortBy = "price";
        direction = "desc";
      }

      const data = await getProducts({
        page,
        size: pageSize,
        sortBy: backendSortBy,
        direction,
        keyword: searchTerm,
        categoryId:
          category === "All"
            ? null
            : categoryMap[category],
        available: availability,
      });

      setProducts(data?.content || []);
      setTotalPages(data?.totalPages || 0);
      setTotalElements(
        data?.totalElements || 0
      );
    } catch (err) {
      console.error(
        "Failed to load products:",
        err
      );

      setProducts([]);
      setTotalPages(0);
      setTotalElements(0);

      setError(
        "Unable to load products. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadProducts();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [
    page,
    sortBy,
    searchTerm,
    category,
    availability,
  ]);

  const categories = useMemo(() => {
    return [
      "All",
      "Electronics",
      "Fashion",
      "Home & Kitchen",
      "Beauty",
      "Sports",
      "Books",
      "Grocery",
      "Toys",
    ];
  }, []);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setPage(0);
  };

  const handleCategoryChange = (
    selectedCategory
  ) => {
    setCategory(selectedCategory);
    setPage(0);
  };

  const handleAvailabilityChange = (
    value
  ) => {
    setAvailability(value);
    setPage(0);
  };

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
    setPage(0);
  };

  const handlePreviousPage = () => {
    setPage((currentPage) =>
      Math.max(currentPage - 1, 0)
    );
  };

  const handleNextPage = () => {
    setPage((currentPage) =>
      Math.min(
        currentPage + 1,
        Math.max(totalPages - 1, 0)
      )
    );
  };

  const handleRetry = () => {
    loadProducts();
  };

  return (
    <main className="products-page">
      <section className="products-header">
        <div>
          <p className="section-label">
            OUR COLLECTION
          </p>

          <h1>Discover Products</h1>

          <p>
            Explore our carefully selected collection
            of products.
          </p>
        </div>

        <div className="products-count">
          {totalElements} products
        </div>
      </section>

      <section className="products-toolbar">
        <div className="product-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={handleSearchChange}
          />

          {searchTerm && (
            <button
              type="button"
              className="search-clear"
              onClick={handleClearSearch}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <button
          type="button"
          className="filter-button"
          onClick={() =>
            setShowFilters(
              (visible) => !visible
            )
          }
        >
          <SlidersHorizontal size={18} />
          Filters
        </button>

        <div className="sort-container">
          <span>Sort by</span>

          <div className="sort-select">
            <select
              value={sortBy}
              onChange={handleSortChange}
              aria-label="Sort products"
            >
              <option value="featured">
                Featured
              </option>

              <option value="price-low">
                Price: Low to High
              </option>

              <option value="price-high">
                Price: High to Low
              </option>
            </select>

            <ChevronDown size={16} />
          </div>
        </div>
      </section>

      <div className="products-content">
        <ProductFilters
          categories={categories}
          selectedCategory={category}
          setSelectedCategory={
            handleCategoryChange
          }
          availability={availability}
          setAvailability={
            handleAvailabilityChange
          }
          visible={showFilters}
        />

        <div className="products-results">
          {loading && (
            <div className="products-loading">
              <div className="loading-spinner" />

              <p>Loading products...</p>
            </div>
          )}

          {error && !loading && (
            <div className="products-error">
              <h2>Something went wrong</h2>

              <p>{error}</p>

              <button
                type="button"
                onClick={handleRetry}
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && (
            <>
              {products.length > 0 ? (
                <ProductGrid
                  products={products}
                />
              ) : (
                <div className="products-empty">
                  <h2>No products found</h2>

                  <p>
                    Try changing your search
                    or filter options.
                  </p>

                  {(searchTerm ||
                    category !== "All" ||
                    availability !== null) && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchTerm("");
                        setCategory("All");
                        setAvailability(null);
                        setPage(0);
                      }}
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              )}

              {totalPages > 1 &&
                products.length > 0 && (
                  <div className="pagination">
                    <button
                      type="button"
                      onClick={handlePreviousPage}
                      disabled={page === 0}
                    >
                      <ChevronLeft size={18} />
                      Previous
                    </button>

                    <span>
                      Page {page + 1} of{" "}
                      {totalPages}
                    </span>

                    <button
                      type="button"
                      onClick={handleNextPage}
                      disabled={
                        page >= totalPages - 1
                      }
                    >
                      Next
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}

export default ProductListing;
