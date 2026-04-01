"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { clearAuth, getStoredUser } from "../lib/auth";

export default function NavBar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  const onLogout = () => {
    clearAuth();
    setUser(null);
    window.location.href = "/";
  };

  return (
    <header style={{ background: "#111827", color: "#fff" }}>
      <div className="container between">
        <div className="row">
          <Link data-testid="nav-home-link" href="/">
            Store
          </Link>
          <Link data-testid="nav-cart-link" href="/cart">
            Cart
          </Link>
          <Link data-testid="nav-orders-link" href="/checkout">
            Checkout
          </Link>
        </div>
        <div className="row">
          {user ? (
            <>
              <span data-testid="nav-user-label">{user.name}</span>
              <button data-testid="nav-logout-button" className="btn secondary" onClick={onLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link data-testid="nav-login-link" href="/login">
                Login
              </Link>
              <Link data-testid="nav-register-link" href="/register">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
