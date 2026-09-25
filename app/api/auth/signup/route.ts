import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

async function sendVerificationEmail(email: string, name: string, token: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  if (!apiKey || !from) throw new Error("Email service is not configured.");
  const url = `${appUrl}/api/auth/verify-email?token=${encodeURIComponent(token)}`;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [email], subject: "Verify your JobFitPro email", html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto"><h1 style="color:#5A4FCF">Welcome to JobFitPro</h1><p>Hi ${name || "there"},</p><p>Please verify your email address to continue setting up your JobFitPro account.</p><p><a href="${url}" style="display:inline-block;background:#5A4FCF;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none">Verify my email</a></p><p>This link expires in 24 hours.</p></div>` })
  });
  if (!response.ok) throw new Error("Unable to send verification email.");
}

export async function POST(req: Request) {
  try {
    const { name, email, phone, password, confirmPassword } = await req.json();
    const normalized = String(email ?? "").trim().toLowerCase();
    const cleanPhone = String(phone ?? "").trim();
    if (!name || !normalized || !cleanPhone || !password || !confirmPassword) return NextResponse.json({ error: "Please complete all fields." }, { status: 400 });
    if (!/^\S+@\S+\.\S+$/.test(normalized)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    if (String(password).length < 8) return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    if (password !== confirmPassword) return NextResponse.json({ error: "Passwords do not match." }, { status: 400 });
    const existing = await prisma.user.findFirst({ where: { OR: [{ email: normalized }, { phone: cleanPhone }] } });
    if (existing?.email === normalized) return NextResponse.json({ error: "An account with this email already exists. Try logging in." }, { status: 409 });
    if (existing?.phone === cleanPhone) return NextResponse.json({ error: "An account with this phone number already exists." }, { status: 409 });
    const passwordHash = await bcrypt.hash(String(password), 12);
    const user = await prisma.user.create({ data: { email: normalized, name: String(name).trim(), phone: cleanPhone, passwordHash } });
    const token = crypto.randomBytes(32).toString("hex");
    await prisma.verificationToken.create({ data: { identifier: normalized, token, expires: new Date(Date.now() + 24 * 60 * 60 * 1000) } });
    try { await sendVerificationEmail(normalized, String(name).trim(), token); } catch {
      await prisma.user.delete({ where: { id: user.id } });
      await prisma.verificationToken.deleteMany({ where: { identifier: normalized } });
      return NextResponse.json({ error: "Your account could not be created because the verification email service is not configured." }, { status: 503 });
    }
    return NextResponse.json({ ok: true, requiresVerification: true }, { status: 201 });
  } catch { return NextResponse.json({ error: "Unable to create your account right now." }, { status: 500 }); }
}
