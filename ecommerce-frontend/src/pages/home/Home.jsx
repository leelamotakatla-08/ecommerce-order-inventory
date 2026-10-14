import {
  ArrowRight,
  Truck,
  ShieldCheck,
  RotateCcw,
  Headphones,
  Smartphone,
  Shirt,
  Home as HomeIcon,
  Watch,
} from "lucide-react";

import { Link } from "react-router-dom";

function Home() {
  const categories = [
    {
      name: "Electronics",
      icon: Smartphone,
      description: "Latest gadgets & devices",
    },
    {
      name: "Fashion",
      icon: Shirt,
      description: "Style for every occasion",
    },
    {
      name: "Home & Living",
      icon: HomeIcon,
      description: "Make your space better",
    },
    {
      name: "Accessories",
      icon: Watch,
      description: "Complete your look",
    },
  ];

  const featuredProducts = [
    {
      id: 1,
      name: "Wireless Headphones",
      category: "Electronics",
      price: "₹2,499",
      rating: "4.8",
      badge: "Best Seller",
    },
    {
      id: 2,
      name: "Smart Watch",
      category: "Electronics",
      price: "₹3,999",
      rating: "4.7",
      badge: "Popular",
    },
    {
      id: 3,
      name: "Premium Backpack",
      category: "Accessories",
      price: "₹1,799",
      rating: "4.6",
      badge: "New",
    },
    {
      id: 4,
      name: "Running Shoes",
      category: "Fashion",
      price: "₹2,999",
      rating: "4.9",
      badge: "Top Rated",
    },
  ];

  return (
    <main className="home-page">

      {/* ================= HERO ================= */}
      <section className="hero-section">
        <div className="hero-content">

          <span className="hero-label">
            PREMIUM ONLINE SHOPPING
          </span>

          <h1>
            Everything you need,
            <span> all in one place.</span>
          </h1>

          <p>
            Discover quality products across electronics, fashion,
            accessories and more — delivered right to your doorstep.
          </p>

          <div className="hero-actions">
            <Link to="/products" className="primary-button">
              Shop Now
              <ArrowRight size={18} />
            </Link>

            <Link to="/products" className="secondary-button">
              Explore Products
            </Link>
          </div>

          <div className="hero-stats">
            <div>
              <strong>10K+</strong>
              <span>Products</span>
            </div>

            <div>
              <strong>5K+</strong>
              <span>Happy Customers</span>
            </div>

            <div>
              <strong>4.8</strong>
              <span>Average Rating</span>
            </div>
          </div>

        </div>

        <div className="hero-visual">

          <div className="hero-circle"></div>

          <div className="hero-product-card">
            <div className="hero-product-image">
              🛍️
            </div>

            <div className="hero-product-info">
              <span>Featured Collection</span>
              <strong>Shop smarter. Live better.</strong>
            </div>
          </div>

          <div className="floating-card floating-card-one">
            <Truck size={18} />
            <div>
              <strong>Fast Delivery</strong>
              <span>Across India</span>
            </div>
          </div>

          <div className="floating-card floating-card-two">
            <ShieldCheck size={18} />
            <div>
              <strong>Secure Shopping</strong>
              <span>100% Protected</span>
            </div>
          </div>

        </div>
      </section>

      {/* ================= CATEGORIES ================= */}
      <section className="section-container">

        <div className="section-heading">
          <div>
            <span className="section-label">EXPLORE</span>
            <h2>Shop by Category</h2>
          </div>

          <Link to="/products" className="view-all">
            View all
            <ArrowRight size={17} />
          </Link>
        </div>

        <div className="category-grid">

          {categories.map((category) => {
            const Icon = category.icon;

            return (
              <Link
                to="/products"
                className="category-card"
                key={category.name}
              >
                <div className="category-icon">
                  <Icon size={27} />
                </div>

                <div>
                  <h3>{category.name}</h3>
                  <p>{category.description}</p>
                </div>

                <ArrowRight
                  className="category-arrow"
                  size={18}
                />
              </Link>
            );
          })}

        </div>
      </section>

      {/* ================= FEATURED PRODUCTS ================= */}
      <section className="featured-section">

        <div className="section-container">

          <div className="section-heading">
            <div>
              <span className="section-label">CURATED FOR YOU</span>
              <h2>Featured Products</h2>
            </div>

            <Link to="/products" className="view-all">
              View all
              <ArrowRight size={17} />
            </Link>
          </div>

          <div className="product-preview-grid">

            {featuredProducts.map((product) => (
              <Link
                to={`/products/${product.id}`}
                className="preview-product-card"
                key={product.id}
              >

                <div className="preview-image">

                  <span className="product-badge">
                    {product.badge}
                  </span>

                  <div className="product-placeholder">
                    {product.id === 1 && "🎧"}
                    {product.id === 2 && "⌚"}
                    {product.id === 3 && "🎒"}
                    {product.id === 4 && "👟"}
                  </div>

                </div>

                <div className="preview-product-info">

                  <span className="product-category">
                    {product.category}
                  </span>

                  <h3>{product.name}</h3>

                  <div className="product-bottom">

                    <strong>{product.price}</strong>

                    <span className="product-rating">
                      ★ {product.rating}
                    </span>

                  </div>

                </div>

              </Link>
            ))}

          </div>

        </div>

      </section>

      {/* ================= BENEFITS ================= */}
      <section className="section-container">

        <div className="benefits-grid">

          <div className="benefit-card">
            <div className="benefit-icon">
              <Truck size={23} />
            </div>

            <div>
              <h3>Fast Delivery</h3>
              <p>Quick and reliable delivery to your doorstep.</p>
            </div>
          </div>

          <div className="benefit-card">
            <div className="benefit-icon">
              <ShieldCheck size={23} />
            </div>

            <div>
              <h3>Secure Payments</h3>
              <p>Your payment information stays protected.</p>
            </div>
          </div>

          <div className="benefit-card">
            <div className="benefit-icon">
              <RotateCcw size={23} />
            </div>

            <div>
              <h3>Easy Returns</h3>
              <p>Simple returns for eligible products.</p>
            </div>
          </div>

          <div className="benefit-card">
            <div className="benefit-icon">
              <Headphones size={23} />
            </div>

            <div>
              <h3>Customer Support</h3>
              <p>We're here whenever you need assistance.</p>
            </div>
          </div>

        </div>

      </section>

      {/* ================= CTA ================= */}
      <section className="cta-section">

        <div className="cta-content">

          <span className="section-label">
            START SHOPPING
          </span>

          <h2>
            Ready to find something
            <span> you'll love?</span>
          </h2>

          <p>
            Explore our collection and discover your next
            favorite product.
          </p>

          <Link to="/products" className="primary-button">
            Browse Products
            <ArrowRight size={18} />
          </Link>

        </div>

      </section>

    </main>
  );
}

export default Home;