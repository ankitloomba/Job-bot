export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const requestUrl = new URL(req.url);
    const token = requestUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(
        new URL("/login?verified=invalid", req.url)
      );
    }

    const record = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!record) {
      return NextResponse.redirect(
        new URL("/login?verified=invalid", req.url)
      );
    }

    if (record.expires < new Date()) {
      await prisma.verificationToken
        .delete({ where: { token } })
        .catch(() => {});

      return NextResponse.redirect(
        new URL("/login?verified=expired", req.url)
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: record.identifier },
    });

    if (!user) {
      await prisma.verificationToken
        .delete({ where: { token } })
        .catch(() => {});

      return NextResponse.redirect(
        new URL("/login?verified=invalid", req.url)
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    });

    await prisma.verificationToken.delete({
      where: { token },
    });

    return NextResponse.redirect(
      new URL("/login?verified=success&next=/setup-account", req.url)
    );
  } catch (error) {
    console.error("Email verification error:", error);

    return NextResponse.redirect(
      new URL("/login?verified=invalid", req.url)
    );
  }
}
