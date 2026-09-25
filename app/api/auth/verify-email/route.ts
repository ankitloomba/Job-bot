import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const requestUrl = new URL(req.url);
    const token = requestUrl.searchParams.get("token");

    // No token
    if (!token) {
      return NextResponse.redirect(
        new URL("/login?verified=invalid", req.url)
      );
    }

    // Find verification token
    const record = await prisma.verificationToken.findUnique({
      where: {
        token,
      },
    });

    // Token does not exist
    if (!record) {
      return NextResponse.redirect(
        new URL("/login?verified=invalid", req.url)
      );
    }

    // Token has expired
    if (record.expires < new Date()) {
      // Remove expired token
      await prisma.verificationToken
        .delete({
          where: {
            token,
          },
        })
        .catch(() => {});

      return NextResponse.redirect(
        new URL("/login?verified=expired", req.url)
      );
    }

    // Find the user associated with the token
    const user = await prisma.user.findUnique({
      where: {
        email: record.identifier,
      },
    });

    if (!user) {
      await prisma.verificationToken
        .delete({
          where: {
            token,
          },
        })
        .catch(() => {});

      return NextResponse.redirect(
        new URL("/login?verified=invalid", req.url)
      );
    }

    // Mark email as verified
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        emailVerified: new Date(),
      },
    });

    // Token is one-time use
    await prisma.verificationToken.delete({
      where: {
        token,
      },
    });

    // Send user to login, with setup-account as the next step
    return NextResponse.redirect(
      new URL(
        "/login?verified=success&next=/setup-account",
        req.url
      )
    );
  } catch (error) {
    console.error("Email verification error:", error);

    return NextResponse.redirect(
      new URL("/login?verified=invalid", req.url)
    );
  }
}
