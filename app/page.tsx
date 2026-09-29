"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (result?.error) {
      setError("Email or password is incorrect.");
      setLoading(false);
      return;
    }
    window.location.href = "/dashboard";
  }

  return (
    <main className="home-page">
      <header className="site-header">
        <div className="nav-wrap">
          <Link href="/" className="brand" aria-label="JobHuntPro home">
            <img src="/logo-primary.svg" alt="JobHuntPro" className="brand-logo" />
          </Link>
          <nav className="nav-links">
            <a href="#how">How it works</a>
            <a href="#features">Features</a>
            <a href="#platforms">Platforms</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className="nav-actions">
            <a href="#home-login" className="btn btn-ghost">Sign in</a>
            <Link href="/signup" className="btn btn-primary">Get Started Free</Link>
          </div>
        </div>
      </header>

      <section className="home-hero">
        <div className="home-hero-inner">
          <div className="home-hero-copy">
            <span className="eyebrow">✦ AI-POWERED JOB SEARCH</span>
            <h1>Find Jobs That <span>Actually Fit You</span></h1>
            <p>Upload your resume and let JobHuntPro find the best matching jobs from LinkedIn, Naukri, Indeed, Glassdoor and more — all in one place.</p>
            <div className="hero-proof">
              <span>AI-powered job matching</span>
              <span>Search multiple platforms</span>
              <span>Track applications</span>
            </div>
            <div className="hero-actions">
              <Link href="/signup" className="btn btn-primary">Get Started Free <span>→</span></Link>
            </div>
            <small className="hero-note">No credit card required</small>
          </div>

          <div className="home-visual">
            <div className="match-float linkedin-float"><b>in</b><span>Project Manager</span><small>Toronto, ON · $100K–120K</small></div>
            <div className="match-float naukri-float"><b>×</b><span>Sr. Salesforce Consultant</span><small>Gurugram · ₹25L–50L</small></div>
            <div className="match-score-float">94%<small>Match</small></div>
            <div className="person-placeholder"><span>AI</span></div>
            <div className="match-float indeed-float"><b>indeed</b><span>Digital Marketing Manager</span><small>Remote · $80K–110K</small></div>
          </div>

          <section className="home-login-card" id="home-login">
            <div className="login-card-heading">
              <h2>Welcome Back</h2>
              <p>Sign in to continue to JobHuntPro</p>
            </div>
            <form onSubmit={submit} className="home-login-form">
              <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" required /></label>
              <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required /></label>
              <div className="login-options">
                <label className="remember"><input type="checkbox" /> <span>Keep me signed in</span></label>
                <Link href="/forgot-password">Forgot password?</Link>
              </div>
              {error && <div className="error">{error}</div>}
              <button className="primary home-login-submit" disabled={loading}>{loading ? "Signing in…" : "Sign In"}</button>
            </form>
            <div className="divider"><span>OR</span></div>
            <button className="social-login" type="button" onClick={() => signIn("google", { callbackUrl: "/dashboard" })}>Continue with Google</button>
            <button className="social-login" type="button" onClick={() => signIn("linkedin", { callbackUrl: "/dashboard" })}>Continue with LinkedIn</button>
            <p className="login-signup">Don&apos;t have an account? <Link href="/signup">Get started free</Link></p>
          </section>
        </div>
      </section>

      <section className="platform-strip" id="platforms">
        <span>Search jobs from top platforms</span>
        <b>in</b><strong>naukri</strong><strong>indeed</strong><strong>glassdoor</strong><strong>MONSTER</strong><span>and more...</span>
      </section>

      <section className="section home-how" id="how">
        <div className="section-inner">
          <div className="section-title"><span className="eyebrow">✦ HOW IT WORKS</span><h2>Get Started in 3 Simple Steps</h2><p>Go from resume to relevant jobs in minutes.</p></div>
          <div className="feature-grid">
            <article className="feature-card"><div className="feature-icon">1</div><h3>Upload Your Resume</h3><p>Securely upload your resume and let our AI analyze your skills and experience.</p></article>
            <article className="feature-card"><div className="feature-icon">2</div><h3>Set Your Preferences</h3><p>Tell us your preferred roles, locations and job type.</p></article>
            <article className="feature-card"><div className="feature-icon">3</div><h3>Find &amp; Apply</h3><p>Get personalized job matches from multiple platforms and start applying.</p></article>
          </div>
        </div>
      </section>

      <section className="section" id="features">
        <div className="section-inner">
          <div className="section-title"><h2>Everything you need to job hunt smarter.</h2><p>Less time searching. More time on opportunities that actually fit.</p></div>
          <div className="feature-grid">
            <article className="feature-card"><div className="feature-icon">✦</div><h3>AI job matching</h3><p>Compare your experience, skills and preferences against each opportunity.</p></article>
            <article className="feature-card"><div className="feature-icon">⌕</div><h3>One job feed</h3><p>Bring opportunities from the platforms you use into one focused experience.</p></article>
            <article className="feature-card"><div className="feature-icon">✓</div><h3>Track &amp; apply</h3><p>Save jobs, track application progress and open the original listing when ready.</p></article>
          </div>
        </div>
      </section>
    </main>
  );
}