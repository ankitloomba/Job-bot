import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token");
  if (!token) return NextResponse.redirect(new URL("/login?verified=invalid", req.url));
  const record = await prisma.verificationToken.findUnique({ where: { token } });
  if (!record || record.expires < new Date()) return NextResponse.redirect(new URL("/login?verified=expired", req.url));
  await prisma.user.update({ where: { email: record.identifier }, data: { emailVerified: new Date() } });
  await prisma.verificationToken.delete({ where: { token } });
  return NextResponse.redirect(new URL("/login?verified=success&next=/setup-account", req.url));
}
