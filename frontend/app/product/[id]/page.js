"use client";

import { use, useEffect, useState } from "react";
import { apiRequest } from "../../../lib/api";
import { clearAuth, getToken } from "../../../lib/auth";
import { addToLocalCart } from "../../../lib/cart";

function isAuthFailure(err) {
  return (
    Number(err?.status) === 401 ||
    String(err?.code || "").startsWith("TOKEN_") ||
    String(err?.code || "").startsWith("AUTH_")
  );
}

export default function ProductDetailsPage({ params }) {
  const resolvedParams = use(params);
  const productId = resolvedParams?.id;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function run() {
      setLoading(true);
      setError("");
      try {
        const data = await apiRequest(`/products/${productId}`);
        setProduct(data.product);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    run();
  }, [productId]);

  const onAddToCart = async () => {
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

  if (loading) return <div className="card">Loading...</div>;
  if (error) return <div className="card">{error}</div>;
  if (!product) return <div className="card">No product found.</div>;

  return (
    <section className="card">
      <h1>{product.name}</h1>
      <img
        src={product.image}
        alt={product.name}
        style={{ maxWidth: "420px", width: "100%", borderRadius: "10px" }}
      />
      <p>{product.description}</p>
      <p>Category: {product.category}</p>
      <p>Price: ${product.price}</p>
      <button data-testid="product-details-add-cart-button" className="btn" onClick={onAddToCart}>
        Add to cart
      </button>
    </section>
  );
}
