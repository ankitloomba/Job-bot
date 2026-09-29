import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getAuthSession();
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "Please log in first." }, { status: 401 });

  const {
    name, countryCode, phone, address1, address2, pinCode, city, state,
    location, targetRole, experienceYears
  } = await req.json();

  const cleanName = String(name ?? "").trim();
  const cleanCountryCode = String(countryCode ?? "+91").trim();
  const cleanPhone = String(phone ?? "").replace(/\D/g, "");
  const cleanAddress1 = String(address1 ?? "").trim();
  const cleanAddress2 = String(address2 ?? "").trim();
  const cleanPinCode = String(pinCode ?? "").replace(/\D/g, "");
  const cleanCity = String(city ?? "").trim();
  const cleanState = String(state ?? "").trim();
  const cleanLocation = String(location ?? "").trim();
  const cleanTargetRole = String(targetRole ?? "").trim();
  const years = experienceYears === "" || experienceYears == null ? null : Number(experienceYears);

  if (!/^[A-Za-zÀ-ÿ' .-]{2,}$/.test(cleanName)) return NextResponse.json({ error: "Enter a valid full name." }, { status: 400 });
  if (!/^\d{7,15}$/.test(cleanPhone)) return NextResponse.json({ error: "Enter a valid phone number." }, { status: 400 });
  if (cleanAddress1.length < 3) return NextResponse.json({ error: "Enter a valid address." }, { status: 400 });
  if (!/^\d{6}$/.test(cleanPinCode) || !cleanCity || !cleanState) return NextResponse.json({ error: "Enter a valid PIN code so city and state can be verified." }, { status: 400 });
  if (!cleanLocation) return NextResponse.json({ error: "Enter your current location." }, { status: 400 });
  if (!cleanTargetRole) return NextResponse.json({ error: "Enter your target job role." }, { status: 400 });
  if (years == null || !Number.isInteger(years) || years < 0 || years > 60) return NextResponse.json({ error: "Enter valid years of experience." }, { status: 400 });

  const existingPhone = await prisma.user.findFirst({ where: { phone: cleanPhone, NOT: { id: userId } } });
  if (existingPhone) return NextResponse.json({ error: "This phone number is already associated with another account." }, { status: 409 });

  await prisma.user.update({
    where: { id: userId },
    data: {
      name: cleanName,
      countryCode: cleanCountryCode,
      phone: cleanPhone,
      address1: cleanAddress1,
      address2: cleanAddress2 || null,
      pinCode: cleanPinCode,
      city: cleanCity,
      state: cleanState,
      location: cleanLocation,
      targetRole: cleanTargetRole,
      experienceYears: years,
      profileComplete: true,
    },
  });

  return NextResponse.json({ ok: true });
}
