"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../lib/api";
import { clearAuth, getToken } from "../lib/auth";
import { addToLocalCart } from "../lib/cart";

function isAuthFailure(err) {
  return (
    Number(err?.status) === 401 ||
    String(err?.code || "").startsWith("TOKEN_") ||
    String(err?.code || "").startsWith("AUTH_")
  );
}

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");

  const categories = useMemo(
    () => Array.from(new Set(products.map((item) => item.category))).sort(),
    [products]
  );

  async function fetchProducts() {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (search) params.set("q", search);
      if (category) params.set("category", category);
      const query = params.toString() ? `?${params.toString()}` : "";
      const data = await apiRequest(`/products${query}`);
      setProducts(data.products || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  const onFilter = (event) => {
    event.preventDefault();
    fetchProducts();
  };

  const onAddToCart = async (product) => {
    const token = getToken();
    try {
      if (token) {
        await apiRequest("/cart", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ productId: product.id, quantity: 1 })
        });
      } else {
        addToLocalCart(product, 1);
      }
      alert("Added to cart.");
    } catch (err) {
      // If backend token is stale/invalid, fall back to local cart.
      if (token && isAuthFailure(err)) {
        clearAuth();
        addToLocalCart(product, 1);
        alert("Session expired. Added to local cart.");
        return;
      }
      alert(err.message);
    }
  };

  return (
    <div className="grid">
      <section className="card">
        <h1>Products</h1>
        <form className="row" onSubmit={onFilter}>
          <input
            data-testid="products-search-input"
            className="input"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products..."
          />
          <select
            data-testid="products-category-select"
            className="select"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <button data-testid="products-filter-button" className="btn" type="submit">
            Search
          </button>
        </form>
      </section>

      {error ? <div className="card">{error}</div> : null}
      {loading ? (
        <div className="card">Loading...</div>
      ) : (
        <section className="grid products-grid">
          {products.map((product) => (
            <article className="card" key={product.id}>
              <img
                src={product.image}
                alt={product.name}
                style={{ width: "100%", borderRadius: "8px" }}
              />
              <h3>{product.name}</h3>
              <p>{product.category}</p>
              <p>${product.price}</p>
              <div className="row">
                <Link data-testid={`product-view-${product.id}`} className="btn secondary" href={`/product/${product.id}`}>
                  View
                </Link>
                <button
                  data-testid={`product-add-cart-${product.id}`}
                  className="btn"
                  onClick={() => onAddToCart(product)}
                >
                  Add to cart
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
