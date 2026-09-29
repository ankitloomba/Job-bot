"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function SignupPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    const r = await fetch("/api/auth/signup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const d = await r.json();
    setLoading(false);
    if (!r.ok) { setError(d.error || "Could not create account."); return; }
    setDone(true);
  }

  if (done) return (
    <main className="auth-shell signup-shell">
      <section className="auth-card signup-card">
        <img src="/logo-primary.svg" alt="JobHuntPro" className="auth-logo" />
        <div className="success-icon">✓</div>
        <h1>Check your email</h1>
        <p className="sub">We sent a verification link to <strong>{form.email}</strong>. Verify your email to continue to account setup.</p>
        <Link className="primary link-button" href="/login">Go to login</Link>
      </section>
    </main>
  );

  return (
    <main className="auth-shell signup-shell">
      <section className="auth-card signup-card">
        <div className="signup-brand-wrap"><img src="/logo-primary.svg" alt="JobHuntPro" className="auth-logo" /></div>
        <div className="signup-heading">
          <span className="auth-eyebrow">✦ START YOUR JOB SEARCH</span>
          <h1>Create your account</h1>
          <p className="sub">Build your profile and start finding jobs that fit you.</p>
        </div>

        <form onSubmit={submit} className="signup-form">
          <div className="signup-form-grid">
            <label>Full name<input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Your name" required /></label>
            <label>Phone number<input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+91 98765 43210" required /></label>
          </div>
          <label>Email address<input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@example.com" required /></label>
          <div className="signup-form-grid">
            <label>Password<input type="password" value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="At least 8 characters" required minLength={8} /></label>
            <label>Confirm password<input type="password" value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} placeholder="Repeat your password" required /></label>
          </div>
          {error && <div className="error">{error}</div>}
          <button className="primary signup-submit" disabled={loading}>{loading ? "Creating account…" : "Create account"}</button>
        </form>

        <div className="divider"><span>OR</span></div>
        <div className="signup-social-grid">
          <button className="social-login" type="button" onClick={() => signIn("google", { callbackUrl: "/dashboard" })}>Continue with Google</button>
          <button className="social-login" type="button" onClick={() => signIn("linkedin", { callbackUrl: "/dashboard" })}>Continue with LinkedIn</button>
        </div>
        <p className="switch">Already have an account? <Link href="/login">Log in</Link></p>
      </section>
    </main>
  );
}