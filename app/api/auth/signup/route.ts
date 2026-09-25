import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

async function sendVerificationEmail(
  email: string,
  name: string,
  token: string
) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || "JobFitPro";

  const appUrl =
    process.env.NEXTAUTH_URL || "http://localhost:3000";

  if (!apiKey || !senderEmail) {
    throw new Error("Email service is not configured.");
  }

  const url = `${appUrl}/api/auth/verify-email?token=${encodeURIComponent(
    token
  )}`;

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: {
        name: senderName,
        email: senderEmail,
      },
      to: [
        {
          email,
          name: name || "there",
        },
      ],
      subject: "Verify your JobFitPro email",
      htmlContent: `
        <div
          style="
            font-family: Arial, sans-serif;
            max-width: 560px;
            margin: 40px auto;
            padding: 24px;
            color: #1A1033;
          "
        >
          <h1 style="color: #5A4FCF;">
            Welcome to JobFitPro
          </h1>

          <p>
            Hi ${name || "there"},
          </p>

          <p>
            Thanks for signing up for JobFitPro.
            Please verify your email address to continue
            setting up your account.
          </p>

          <p style="margin: 30px 0;">
            <a
              href="${url}"
              style="
                display: inline-block;
                background: #5A4FCF;
                color: #ffffff;
                padding: 12px 20px;
                border-radius: 10px;
                text-decoration: none;
                font-weight: 600;
              "
            >
              Verify my email
            </a>
          </p>

          <p>
            This verification link expires in 24 hours.
          </p>

          <p style="font-size: 13px; color: #7B6FA0;">
            If you did not create a JobFitPro account,
            you can safely ignore this email.
          </p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Brevo email error:", errorText);
    throw new Error("Unable to send verification email.");
  }
}

export async function POST(req: Request) {
  try {
    const {
      name,
      email,
      phone,
      password,
      confirmPassword,
    } = await req.json();

    const normalized = String(email ?? "")
      .trim()
      .toLowerCase();

    const cleanName = String(name ?? "").trim();
    const cleanPhone = String(phone ?? "").trim();

    // Required fields
    if (
      !cleanName ||
      !normalized ||
      !cleanPhone ||
      !password ||
      !confirmPassword
    ) {
      return NextResponse.json(
        {
          error: "Please complete all fields.",
        },
        { status: 400 }
      );
    }

    // Email validation
    if (!/^\S+@\S+\.\S+$/.test(normalized)) {
      return NextResponse.json(
        {
          error: "Enter a valid email address.",
        },
        { status: 400 }
      );
    }

    // Password validation
    if (String(password).length < 8) {
      return NextResponse.json(
        {
          error: "Password must be at least 8 characters.",
        },
        { status: 400 }
      );
    }

    // Confirm password
    if (password !== confirmPassword) {
      return NextResponse.json(
        {
          error: "Passwords do not match.",
        },
        { status: 400 }
      );
    }

    // Check whether email or phone already exists
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          {
            email: normalized,
          },
          {
            phone: cleanPhone,
          },
        ],
      },
    });

    if (existing?.email === normalized) {
      return NextResponse.json(
        {
          error:
            "An account with this email already exists. Try logging in.",
        },
        { status: 409 }
      );
    }

    if (existing?.phone === cleanPhone) {
      return NextResponse.json(
        {
          error:
            "An account with this phone number already exists.",
        },
        { status: 409 }
      );
    }

    // Securely hash password
    const passwordHash = await bcrypt.hash(
      String(password),
      12
    );

    // Create user
    const user = await prisma.user.create({
      data: {
        email: normalized,
        name: cleanName,
        phone: cleanPhone,
        passwordHash,
      },
    });

    // Generate secure verification token
    const token = crypto
      .randomBytes(32)
      .toString("hex");

    // Token expires in 24 hours
    await prisma.verificationToken.create({
      data: {
        identifier: normalized,
        token,
        expires: new Date(
          Date.now() + 24 * 60 * 60 * 1000
        ),
      },
    });

    // Send verification email
    try {
      await sendVerificationEmail(
        normalized,
        cleanName,
        token
      );
    } catch (error) {
      console.error(
        "Verification email failed:",
        error
      );

      // Roll back user if email cannot be sent
      await prisma.user.delete({
        where: {
          id: user.id,
        },
      });

      await prisma.verificationToken.deleteMany({
        where: {
          identifier: normalized,
        },
      });

      return NextResponse.json(
        {
          error:
            "Your account could not be created because the verification email service is not configured.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        requiresVerification: true,
        message:
          "Account created. Please check your email to verify your account.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Signup error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to create your account right now.",
      },
      { status: 500 }
    );
  }
}
