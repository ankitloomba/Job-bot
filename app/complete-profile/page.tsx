"use client";

import { FormEvent, useMemo, useState } from "react";
import { useSession } from "next-auth/react";

type FormState = {
  name: string;
  countryCode: string;
  phone: string;
  address1: string;
  address2: string;
  pinCode: string;
  city: string;
  state: string;
};

const countries = [
  ["🇮🇳", "+91", "India"],
  ["🇨🇦", "+1", "Canada"],
  ["🇺🇸", "+1", "United States"],
  ["🇬🇧", "+44", "United Kingdom"],
  ["🇦🇪", "+971", "UAE"],
  ["🇦🇺", "+61", "Australia"],
];

export default function CompleteProfilePage() {
  const { data: session, status } = useSession();
  const [form, setForm] = useState<FormState>({
    name: session?.user?.name || "",
    countryCode: "+91",
    phone: "",
    address1: "",
    address2: "",
    pinCode: "",
    city: "",
    state: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pinLoading, setPinLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const update = (key: keyof FormState, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  async function lookupPin(pin: string) {
    update("pinCode", pin);
    if (!/^\d{6}$/.test(pin)) {
      if (pin) setErrors((e) => ({ ...e, pinCode: "Enter a valid 6-digit PIN code." }));
      return;
    }

    setPinLoading(true);
    setErrors((e) => ({ ...e, pinCode: "", city: "", state: "" }));
    try {
      const response = await fetch(\`https://api.postalpincode.in/pincode/\${pin}\`);
      const data = await response.json();
      const office = data?.[0]?.PostOffice?.[0];
      if (!office) {
        setErrors((e) => ({ ...e, pinCode: "PIN code not found." }));
        setForm((f) => ({ ...f, city: "", state: "" }));
        return;
      }
      setForm((f) => ({
        ...f,
        city: office.District || office.Block || "",
        state: office.State || "",
      }));
    } catch {
      setErrors((e) => ({ ...e, pinCode: "Unable to verify this PIN code." }));
    } finally {
      setPinLoading(false);
    }
  }

  const completeCount = useMemo(() => [
    form.name, form.phone, form.address1, form.pinCode, form.city, form.state
  ].filter(Boolean).length, [form]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (form.name.trim().length < 2) next.name = "Enter your full name.";
    if (!/^\d{7,15}$/.test(form.phone)) next.phone = "Enter a valid phone number.";
    if (!form.address1.trim()) next.address1 = "Enter your address.";
    if (!/^\d{6}$/.test(form.pinCode)) next.pinCode = "Enter a valid 6-digit PIN code.";
    if (!form.city) next.city = "Enter a valid PIN code.";
    if (!form.state) next.state = "Enter a valid PIN code.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    const response = await fetch("/api/profile/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await response.json();
    setSaving(false);

    if (!response.ok) {
      setErrors({ form: data.error || "Could not save your profile." });
      return;
    }
    window.location.href = "/dashboard";
  }

  if (status === "loading") return null;
  if (!session) {
    window.location.href = "/login";
    return null;
  }

  return (
    <main className="auth-shell signup-shell">
      <section className="auth-card signup-card">
        <div className="signup-brand-wrap"><img src="/logo-primary.svg" alt="JobHuntPro" className="auth-logo" /></div>
        <div className="signup-heading">
          <span className="auth-eyebrow">✦ COMPLETE YOUR PROFILE</span>
          <h1>One last step</h1>
          <p className="sub">Complete your profile before uploading your resume or using job matching.</p>
        </div>

        <div className="profile-required-note">
          <strong>Profile completion is required</strong>
          <span>{completeCount}/6 required details completed</span>
        </div>

        <form onSubmit={submit} className="signup-form" noValidate>
          <div className="signup-form-grid">
            <label>Full name
              <input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Your full name" autoComplete="name" aria-invalid={!!errors.name} />
              {errors.name && <small className="field-error">{errors.name}</small>}
            </label>
            <label>Email address
              <input value={session.user?.email || ""} readOnly />
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
                <input value={form.pinCode} onChange={(e) => lookupPin(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="110001" inputMode="numeric" autoComplete="postal-code" aria-invalid={!!errors.pinCode} />
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
            <input value={form.state} readOnly placeholder="Auto-filled from PIN" />
            {errors.state && <small className="field-error">{errors.state}</small>}
          </label>

          {errors.form && <div className="error">{errors.form}</div>}
          <button className="primary signup-submit" disabled={saving}>{saving ? "Saving profile…" : "Complete profile & continue"}</button>
        </form>
      </section>
    </main>
  );
}
