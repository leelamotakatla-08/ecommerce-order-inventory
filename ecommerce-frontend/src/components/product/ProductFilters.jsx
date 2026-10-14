function ProductFilters({
  categories,
  selectedCategory,
  setSelectedCategory,
  availability,
  setAvailability,
  visible,
}) {
  return (
    <aside
      className={`product-filters ${visible ? "show" : ""}`}
    >
      <div className="filter-section">
        <h3>Category</h3>

        <div className="category-options">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={
                selectedCategory === category
                  ? "category-option active"
                  : "category-option"
              }
              onClick={() =>
                setSelectedCategory(category)
              }
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h3>Availability</h3>

        <div className="category-options">
          <button
            type="button"
            className={
              availability === null
                ? "category-option active"
                : "category-option"
            }
            onClick={() => setAvailability(null)}
          >
            All
          </button>

          <button
            type="button"
            className={
              availability === true
                ? "category-option active"
                : "category-option"
            }
            onClick={() => setAvailability(true)}
          >
            Available
          </button>

          <button
            type="button"
            className={
              availability === false
                ? "category-option active"
                : "category-option"
            }
            onClick={() => setAvailability(false)}
          >
            Out of Stock
          </button>
        </div>
      </div>
    </aside>
  );
}

export default ProductFilters;