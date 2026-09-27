"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const r = await signIn("credentials", { email, password, redirect: false });
    if (r?.error) setError("Email or password is incorrect.");
    else window.location.href = "/dashboard";
    setLoading(false);
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <img src="/logo-primary.svg" alt="JobHuntPro" className="auth-logo" />
        <h1>Welcome back</h1>
        <p className="sub">Find the right jobs. Faster.</p>

        <form onSubmit={submit}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </label>

          {error && <div className="error">{error}</div>}

          <button className="primary" disabled={loading}>
            {loading ? "Signing in…" : "Log in"}
          </button>
        </form>

        <Link className="forgot" href="/forgot-password">
          Forgot password?
        </Link>

        <div className="divider"><span>or continue with</span></div>

        <div className="social-buttons">
          <button
            className="google"
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          >
            Continue with Google
          </button>

          <button
            className="linkedin"
            type="button"
            onClick={() => signIn("linkedin", { callbackUrl: "/dashboard" })}
          >
            Continue with LinkedIn
          </button>
        </div>

        <p className="switch">
          New to JobHuntPro? <Link href="/signup">Create an account</Link>
        </p>
      </section>
    </main>
  );
}
