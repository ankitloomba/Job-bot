"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";

type FormState = {
  name: string;
  email: string;
  countryCode: string;
  phone: string;
  address1: string;
  address2: string;
  pinCode: string;
  city: string;
  state: string;
  password: string;
  confirmPassword: string;
};

const initialForm: FormState = {
  name: "",
  email: "",
  countryCode: "+91",
  phone: "",
  address1: "",
  address2: "",
  pinCode: "",
  city: "",
  state: "",
  password: "",
  confirmPassword: "",
};

const countries = [
  ["🇮🇳", "+91", "India"],
  ["🇨🇦", "+1", "Canada"],
  ["🇺🇸", "+1", "United States"],
  ["🇬🇧", "+44", "United Kingdom"],
  ["🇦🇪", "+971", "UAE"],
  ["🇦🇺", "+61", "Australia"],
];

function validateEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function getPasswordChecks(password: string) {
  return {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
}

function getStrength(password: string) {
  const checks = getPasswordChecks(password);
  const score = Object.values(checks).filter(Boolean).length;
  if (!password) return { label: "", score: 0 };
  if (score <= 2) return { label: "Weak", score };
  if (score <= 4) return { label: "Good", score };
  return { label: "Strong", score };
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="social-icon">
      <path fill="#4285F4" d="M21.35 12.23c0-.72-.06-1.42-.18-2.09H12v3.95h5.23a4.47 4.47 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.92-4.18 2.92-7.25Z"/>
      <path fill="#34A853" d="M12 21.65c2.63 0 4.84-.87 6.45-2.35l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.52A9.74 9.74 0 0 0 12 21.65Z"/>
      <path fill="#FBBC05" d="M6.54 13.74A5.85 5.85 0 0 1 6.23 12c0-.61.11-1.2.31-1.74V7.74H3.3A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.06 1.05 4.26l3.24-2.52Z"/>
      <path fill="#EA4335" d="M12 6.23c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.84 3.27 14.63 2.35 12 2.35a9.74 9.74 0 0 0-8.7 5.39l3.24 2.52c.77-2.31 2.92-4.03 5.46-4.03Z"/>
    </svg>
  );
}

function LinkedInIcon() {
  return <span className="linkedin-icon" aria-hidden="true">in</span>;
}

export default function SignupPage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pinLoading, setPinLoading] = useState(false);

  const strength = useMemo(() => getStrength(form.password), [form.password]);
  const checks = useMemo(() => getPasswordChecks(form.password), [form.password]);

  const update = (key: keyof FormState, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
    setServerError("");
  };

  async function lookupPin(pin: string) {
    update("pinCode", pin);
    if (!pin) return;

    if (!/^\d{6}$/.test(pin)) {
      setErrors((e) => ({ ...e, pinCode: "Enter a valid 6-digit PIN code." }));
      return;
    }

    setPinLoading(true);
    setErrors((e) => ({ ...e, pinCode: "", city: "", state: "" }));

    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await response.json();
      const offices = data?.[0]?.PostOffice;

      if (!Array.isArray(offices) || !offices.length) {
        setErrors((e) => ({ ...e, pinCode: "PIN code not found. Please check it." }));
        setForm((f) => ({ ...f, city: "", state: "" }));
        return;
      }

      const office = offices[0];
      setForm((f) => ({
        ...f,
        city: office.District || office.Block || "",
        state: office.State || "",
      }));
    } catch {
      setErrors((e) => ({ ...e, pinCode: "We couldn't verify the PIN code. Please try again." }));
    } finally {
      setPinLoading(false);
    }
  }

  function validate() {
    const next: Record<string, string> = {};

    if (!form.name.trim() || form.name.trim().length < 2) {
      next.name = "Enter your full name.";
    } else if (!/^[A-Za-zÀ-ÿ' .-]+$/.test(form.name.trim())) {
      next.name = "Use letters, spaces, apostrophes or hyphens only.";
    }

    if (!validateEmail(form.email)) next.email = "Enter a valid email address.";
    if (!/^\d{7,15}$/.test(form.phone)) next.phone = "Enter a valid phone number.";
    if (!form.address1.trim()) next.address1 = "Enter your address.";
    if (!/^\d{6}$/.test(form.pinCode)) next.pinCode = "Enter a valid 6-digit PIN code.";
    if (!form.city) next.city = "Enter a valid PIN code to fetch the city.";
    if (!form.state) next.state = "Enter a valid PIN code to fetch the state.";

    const passwordChecks = getPasswordChecks(form.password);
    if (Object.values(passwordChecks).filter(Boolean).length < 4) {
      next.password = "Use 8+ characters with upper/lowercase letters, a number and a special character.";
    }

    if (form.password !== form.confirmPassword) {
      next.confirmPassword = "Passwords do not match.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;

    setLoading(true);
    const r = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const d = await r.json();
    setLoading(false);

    if (!r.ok) {
      setServerError(d.error || "Could not create account.");
      return;
    }
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

        <form onSubmit={submit} className="signup-form" noValidate>
          <div className="signup-form-grid">
            <label>Full name
              <input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Your full name" autoComplete="name" aria-invalid={!!errors.name} />
              {errors.name && <small className="field-error">{errors.name}</small>}
            </label>
            <label>Email address
              <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@example.com" autoComplete="email" aria-invalid={!!errors.email} />
              {errors.email && <small className="field-error">{errors.email}</small>}
            </label>
          </div>

          <label>Phone number
            <div className="phone-input">
              <div className="country-code">
                <span>{countries.find(([, code]) => code === form.countryCode)?.[0] || "🌐"}</span>
                <select value={form.countryCode} onChange={(e) => update("countryCode", e.target.value)} aria-label="Country code">
                  {countries.map(([flag, code, country]) => <option key={country + code} value={code}>{flag} {code}</option>)}
                </select>
              </div>
              <input type="tel" inputMode="numeric" value={form.phone} onChange={(e) => update("phone", e.target.value.replace(/\D/g, "").slice(0, 15))} placeholder="98765 43210" autoComplete="tel-national" aria-invalid={!!errors.phone} />
            </div>
            {errors.phone && <small className="field-error">{errors.phone}</small>}
          </label>

          <div className="address-heading">Address</div>
          <div className="signup-form-grid">
            <label>Address line 1
              <input value={form.address1} onChange={(e) => update("address1", e.target.value)} placeholder="House / flat, street, area" autoComplete="address-line1" aria-invalid={!!errors.address1} />
              {errors.address1 && <small className="field-error">{errors.address1}</small>}
            </label>
            <label>Address line 2 <span className="optional">(optional)</span>
              <input value={form.address2} onChange={(e) => update("address2", e.target.value)} placeholder="Apartment, landmark, etc." autoComplete="address-line2" />
            </label>
          </div>

          <div className="signup-form-grid">
            <label>PIN code
              <div className="pin-wrap">
                <input type="text" inputMode="numeric" value={form.pinCode} onChange={(e) => lookupPin(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="110001" autoComplete="postal-code" aria-invalid={!!errors.pinCode} />
                {pinLoading && <span className="pin-status">Checking…</span>}
                {!pinLoading && form.city && form.state && <span className="pin-status pin-success">✓ Found</span>}
              </div>
              {errors.pinCode && <small className="field-error">{errors.pinCode}</small>}
            </label>
            <label>City
              <input value={form.city} readOnly placeholder="Auto-filled from PIN" aria-invalid={!!errors.city} />
              {errors.city && <small className="field-error">{errors.city}</small>}
            </label>
          </div>

          <label>State
            <input value={form.state} readOnly placeholder="Auto-filled from PIN" aria-invalid={!!errors.state} />
            {errors.state && <small className="field-error">{errors.state}</small>}
          </label>

          <div className="signup-form-grid">
            <label>Password
              <input type="password" value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="Create a strong password" autoComplete="new-password" aria-invalid={!!errors.password} />
              {form.password && <div className="password-strength" aria-live="polite">
                <div className="strength-bars">{[0,1,2,3,4].map((i) => <span key={i} className={i < strength.score ? `filled strength-${strength.score}` : ""} />)}</div>
                <div className="strength-row"><span>{strength.label} password</span><span>{strength.score}/5</span></div>
                <div className="password-rules">
                  <span className={checks.length ? "valid" : ""}>✓ 8+ chars</span>
                  <span className={checks.upper ? "valid" : ""}>✓ Uppercase</span>
                  <span className={checks.lower ? "valid" : ""}>✓ Lowercase</span>
                  <span className={checks.number ? "valid" : ""}>✓ Number</span>
                  <span className={checks.special ? "valid" : ""}>✓ Special</span>
                </div>
              </div>}
              {errors.password && <small className="field-error">{errors.password}</small>}
            </label>
            <label>Confirm password
              <input type="password" value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} placeholder="Repeat your password" autoComplete="new-password" aria-invalid={!!errors.confirmPassword} />
              {form.confirmPassword && <small className={form.password === form.confirmPassword ? "field-success" : "field-error"}>{form.password === form.confirmPassword ? "✓ Passwords match" : "Passwords do not match."}</small>}
              {errors.confirmPassword && !form.confirmPassword && <small className="field-error">{errors.confirmPassword}</small>}
            </label>
          </div>

          {serverError && <div className="error">{serverError}</div>}
          <button className="primary signup-submit" disabled={loading}>{loading ? "Creating account…" : "Create account"}</button>
        </form>

        <div className="divider"><span>OR</span></div>
        <div className="signup-social-grid">
          <button className="social-login" type="button" onClick={() => signIn("google", { callbackUrl: "/dashboard" })}><GoogleIcon /><span>Continue with Google</span></button>
          <button className="social-login" type="button" onClick={() => signIn("linkedin", { callbackUrl: "/dashboard" })}><LinkedInIcon /><span>Continue with LinkedIn</span></button>
        </div>
        <p className="switch">Already have an account? <Link href="/login">Log in</Link></p>
      </section>
    </main>
  );
}
