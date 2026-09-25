import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
export async function POST(req: Request) {
  const session = await getAuthSession();
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "Please log in first." }, { status: 401 });
  const { location, targetRole, experienceYears } = await req.json();
  const years = experienceYears === "" || experienceYears == null ? null : Number(experienceYears);
  if (years != null && (!Number.isInteger(years) || years < 0 || years > 60)) return NextResponse.json({ error: "Enter valid experience years." }, { status: 400 });
  await prisma.user.update({ where: { id: userId }, data: { location: String(location ?? "").trim() || null, targetRole: String(targetRole ?? "").trim() || null, experienceYears: years, profileComplete: true } });
  return NextResponse.json({ ok: true });
}
