"use client";

import { useState } from "react";
import { apiRequest } from "../../lib/api";
import { setAuth } from "../../lib/auth";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify(form)
      });
      setAuth(data.token, data.user);
      window.location.href = "/";
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card" style={{ maxWidth: "450px", margin: "0 auto" }}>
      <h1>Register</h1>
      <form onSubmit={onSubmit} className="grid">
        <input
          data-testid="register-name-input"
          className="input"
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          required
        />
        <input
          data-testid="register-email-input"
          className="input"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          required
        />
        <input
          data-testid="register-password-input"
          className="input"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
          required
        />
        <button data-testid="register-submit-button" className="btn" disabled={loading} type="submit">
          {loading ? "Loading..." : "Create account"}
        </button>
      </form>
      {error ? <p>{error}</p> : null}
    </section>
  );
}
