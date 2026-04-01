"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiRequest } from "../../lib/api";
import { clearAuth, getToken } from "../../lib/auth";
import { formatLocalCartForPage, removeFromLocalCart, updateLocalCartQuantity } from "../../lib/cart";

function isAuthFailure(err) {
  return (
    Number(err?.status) === 401 ||
    String(err?.code || "").startsWith("TOKEN_") ||
    String(err?.code || "").startsWith("AUTH_")
  );
}

export default function CartPage() {
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchCart() {
    const token = getToken();
    setLoading(true);
    setError("");
    try {
      if (token) {
        const data = await apiRequest("/cart", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setCart(data);
      } else {
        setCart(formatLocalCartForPage());
      }
    } catch (err) {
      if (token && isAuthFailure(err)) {
        clearAuth();
        setCart(formatLocalCartForPage());
        setError("Session expired. Showing local cart.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCart();
  }, []);

  const onRemove = async (productId) => {
    const token = getToken();
    try {
      if (token) {
        await apiRequest(`/cart/${productId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      } else {
        removeFromLocalCart(productId);
      }
      fetchCart();
    } catch (err) {
      alert(err.message);
    }
  };

  const onUpdateQuantity = async (productId, quantity) => {
    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty <= 0) {
      alert("Quantity must be a positive integer.");
      return;
    }

    const token = getToken();
    try {
      if (token) {
        await apiRequest(`/cart/${productId}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ quantity: qty })
        });
      } else {
        updateLocalCartQuantity(productId, qty);
      }
      fetchCart();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="card">Loading...</div>;
  if (error) return <div className="card">{error}</div>;

  return (
    <section className="grid">
      <div className="card">
        <h1>Your Cart</h1>
        {!cart.items.length ? (
          <p data-testid="cart-empty-label">Cart is empty.</p>
        ) : (
          cart.items.map((item) => (
            <div key={item.productId} className="between" style={{ marginBottom: "0.8rem" }}>
              <div>
                <strong>{item.product.name}</strong>
                <div>${item.lineTotal}</div>
              </div>
              <div className="row">
                <input
                  data-testid={`cart-quantity-${item.productId}`}
                  className="input"
                  type="number"
                  min={1}
                  defaultValue={item.quantity}
                  style={{ maxWidth: "90px" }}
                />
                <button
                  data-testid={`cart-update-${item.productId}`}
                  className="btn secondary"
                  onClick={(event) => {
                    const input = event.currentTarget.parentElement?.querySelector("input");
                    onUpdateQuantity(item.productId, input?.value);
                  }}
                >
                  Update
                </button>
                <button
                  data-testid={`cart-remove-${item.productId}`}
                  className="btn danger"
                  onClick={() => onRemove(item.productId)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
        <hr />
        <div className="between">
          <strong>Total:</strong>
          <strong data-testid="cart-total-value">${cart.total}</strong>
        </div>
      </div>

      <div>
        <Link data-testid="cart-checkout-link" className="btn" href="/checkout">
          Proceed to checkout
        </Link>
      </div>
    </section>
  );
}
