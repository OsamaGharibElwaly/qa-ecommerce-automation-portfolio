"use client";

import { useState } from "react";
import { apiRequest } from "../../lib/api";
import { setAuth } from "../../lib/auth";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await apiRequest("/auth/login", {
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
      <h1>Login</h1>
      <form onSubmit={onSubmit} className="grid">
        <input
          data-testid="login-email-input"
          className="input"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          required
        />
        <input
          data-testid="login-password-input"
          className="input"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
          required
        />
        <button data-testid="login-submit-button" className="btn" disabled={loading} type="submit">
          {loading ? "Loading..." : "Login"}
        </button>
      </form>
      {error ? <p>{error}</p> : null}
    </section>
  );
}
