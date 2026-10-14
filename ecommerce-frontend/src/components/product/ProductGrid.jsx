import ProductCard from "./ProductCard";
import EmptyState from "../common/EmptyState";

function ProductGrid({ products }) {
  if (!products || products.length === 0) {
    return (
      <EmptyState
        title="No products found"
        message="Try changing your search or filters."
      />
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
        />
      ))}
    </div>
  );
}

export default ProductGrid;