"use client";

import { FormEvent, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const countries = [
  ["🇮🇳", "+91", "India"],
  ["🇨🇦", "+1", "Canada"],
  ["🇺🇸", "+1", "United States"],
  ["🇬🇧", "+44", "United Kingdom"],
  ["🇦🇪", "+971", "UAE"],
  ["🇦🇺", "+61", "Australia"],
];

export default function SetupAccount() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [name, setName] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [location, setLocation] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [error, setError] = useState("");
  const [pinError, setPinError] = useState("");
  const [pinLoading, setPinLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  async function lookupPin(pin: string) {
    setPinCode(pin);
    setPinError("");
    if (!/^\d{6}$/.test(pin)) {
      if (pin) setPinError("Enter a valid 6-digit PIN code.");
      setCity("");
      setState("");
      return;
    }

    setPinLoading(true);
    try {
      const r = await fetch(\`https://api.postalpincode.in/pincode/\${pin}\`);
      const data = await r.json();
      const office = data?.[0]?.PostOffice?.[0];
      if (!office) {
        setPinError("PIN code not found.");
        setCity("");
        setState("");
      } else {
        setCity(office.District || office.Block || "");
        setState(office.State || "");
      }
    } catch {
      setPinError("Unable to verify this PIN code.");
    } finally {
      setPinLoading(false);
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (name.trim().length < 2) return setError("Enter your full name.");
    if (!/^\d{7,15}$/.test(phone)) return setError("Enter a valid phone number.");
    if (address1.trim().length < 3) return setError("Enter your address.");
    if (!/^\d{6}$/.test(pinCode) || !city || !state) return setError("Enter a valid PIN code so city and state can be verified.");
    if (!location.trim()) return setError("Enter your current location.");
    if (!targetRole.trim()) return setError("Enter your target job role.");

    const years = Number(experienceYears);
    if (!Number.isInteger(years) || years < 0 || years > 60) return setError("Enter valid years of experience.");

    setLoading(true);
    const r = await fetch("/api/account/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        countryCode,
        phone,
        address1,
        address2,
        pinCode,
        city,
        state,
        location,
        targetRole,
        experienceYears: years,
      }),
    });
    const d = await r.json();
    setLoading(false);
    if (!r.ok) {
      setError(d.error || "Could not save your profile.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  if (status === "loading") return null;
  if (status !== "authenticated") return <main className="auth-shell"><section className="auth-card"><h1>Please log in</h1><p className="sub">Sign in to finish setting up your account.</p></section></main>;

  return (
    <main className="auth-shell signup-shell">
      <section className="auth-card signup-card setup-account-card">
        <div className="signup-brand-wrap"><img src="/logo-primary.svg" alt="JobHuntPro" className="auth-logo" /></div>
        <div className="signup-heading">
          <span className="auth-eyebrow">✦ PROFILE COMPLETION REQUIRED</span>
          <h1>Complete your profile</h1>
          <p className="sub">Before we add your resume, we need a few details to build your job profile.</p>
        </div>

        <div className="profile-required-note"><strong>Your profile must be complete</strong><span>Required before resume upload and job matching</span></div>

        <form onSubmit={submit} className="signup-form" noValidate>
          <div className="signup-form-grid">
            <label>Full name
              <input value={name} onChange={e => setName(e.target.value)} placeholder={session.user?.name || "Your full name"} autoComplete="name" />
            </label>
            <label>Email address
              <input value={session.user?.email || ""} readOnly />
            </label>
          </div>

          <label>Phone number
            <div className="phone-input">
              <div className="country-code">
                <span>{countries.find(([, code]) => code === countryCode)?.[0] || "🌐"}</span>
                <select value={countryCode} onChange={e => setCountryCode(e.target.value)} aria-label="Country code">
                  {countries.map(([flag, code, country]) => <option key={country + code} value={code}>{flag} {code}</option>)}
                </select>
              </div>
              <input type="tel" inputMode="numeric" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 15))} placeholder="98765 43210" autoComplete="tel-national" />
            </div>
          </label>

          <div className="address-heading">Contact address</div>
          <div className="signup-form-grid">
            <label>Address line 1
              <input value={address1} onChange={e => setAddress1(e.target.value)} placeholder="House / flat, street, area" autoComplete="address-line1" />
            </label>
            <label>Address line 2 <span className="optional">(optional)</span>
              <input value={address2} onChange={e => setAddress2(e.target.value)} placeholder="Apartment, landmark, etc." autoComplete="address-line2" />
            </label>
          </div>

          <div className="signup-form-grid">
            <label>PIN code
              <div className="pin-wrap">
                <input value={pinCode} onChange={e => lookupPin(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="110001" inputMode="numeric" autoComplete="postal-code" />
                {pinLoading && <span className="pin-status">Checking…</span>}
                {!pinLoading && city && state && <span className="pin-status pin-success">✓ Found</span>}
              </div>
              {pinError && <small className="field-error">{pinError}</small>}
            </label>
            <label>City
              <input value={city} readOnly placeholder="Auto-filled from PIN" />
            </label>
          </div>

          <label>State
            <input value={state} readOnly placeholder="Auto-filled from PIN" />
          </label>

          <div className="address-heading">Professional profile</div>
          <div className="signup-form-grid">
            <label>Current location
              <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Delhi NCR" />
            </label>
            <label>Target job role
              <input value={targetRole} onChange={e => setTargetRole(e.target.value)} placeholder="Project Manager" />
            </label>
          </div>

          <label>Years of experience
            <input type="number" min="0" max="60" value={experienceYears} onChange={e => setExperienceYears(e.target.value)} placeholder="8" />
          </label>

          {error && <div className="error">{error}</div>}
          <button className="primary signup-submit" disabled={loading}>{loading ? "Completing profile…" : "Complete profile & continue to resume"}</button>
        </form>
      </section>
    </main>
  );
}
