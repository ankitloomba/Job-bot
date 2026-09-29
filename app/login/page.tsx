"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

function GoogleIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" className="social-icon"><path fill="#4285F4" d="M21.35 12.23c0-.72-.06-1.42-.18-2.09H12v3.95h5.23a4.47 4.47 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.92-4.18 2.92-7.25Z"/><path fill="#34A853" d="M12 21.65c2.63 0 4.84-.87 6.45-2.35l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.52A9.74 9.74 0 0 0 12 21.65Z"/><path fill="#FBBC05" d="M6.54 13.74A5.85 5.85 0 0 1 6.23 12c0-.61.11-1.2.31-1.74V7.74H3.3A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.06 1.05 4.26l3.24-2.52Z"/><path fill="#EA4335" d="M12 6.23c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.84 3.27 14.63 2.35 12 2.35a9.74 9.74 0 0 0-8.7 5.39l3.24 2.52c.77-2.31 2.92-4.03 5.46-4.03Z"/></svg>;
}
function LinkedInIcon() {
  return <span className="linkedin-icon" aria-hidden="true">in</span>;
}

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
          <label>Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" /></label>
          <label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" /></label>
          {error && <div className="error">{error}</div>}
          <button className="primary" disabled={loading}>{loading ? "Signing in…" : "Log in"}</button>
        </form>
        <Link className="forgot" href="/forgot-password">Forgot password?</Link>
        <div className="divider"><span>or continue with</span></div>
        <div className="social-buttons">
          <button className="google social-login-branded" type="button" onClick={() => signIn("google", { callbackUrl: "/dashboard" })}><GoogleIcon /><span>Continue with Google</span></button>
          <button className="linkedin social-login-branded" type="button" onClick={() => signIn("linkedin", { callbackUrl: "/dashboard" })}><LinkedInIcon /><span>Continue with LinkedIn</span></button>
        </div>
        <p className="switch">New to JobHuntPro? <Link href="/signup">Create an account</Link></p>
      </section>
    </main>
  );
}
