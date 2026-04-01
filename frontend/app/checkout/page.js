"use client";

import { useState } from "react";
import { apiRequest } from "../../lib/api";
import { getToken } from "../../lib/auth";

export default function CheckoutPage() {
  const [message, setMessage] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  const onCheckout = async () => {
    const token = getToken();
    if (!token) {
      window.location.href = "/login";
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const data = await apiRequest("/orders/checkout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setOrder(data.order);
      setMessage(data.message);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card">
      <h1>Checkout</h1>
      <p>No real payment is required. Click confirm to place your order.</p>
      <button data-testid="checkout-confirm-button" className="btn" onClick={onCheckout} disabled={loading}>
        {loading ? "Processing..." : "Confirm order"}
      </button>
      {message ? <p data-testid="checkout-message">{message}</p> : null}
      {order ? (
        <div data-testid="checkout-order-confirmation">
          <h3>Order #{order.id}</h3>
          <p>Status: {order.status}</p>
          <p>Total: ${order.total}</p>
        </div>
      ) : null}
    </section>
  );
}
