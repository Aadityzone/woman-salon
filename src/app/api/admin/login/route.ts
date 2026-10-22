import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { createOwnerSession } from "../../../../lib/owner-auth";
export const runtime = "nodejs";
const Input = z.object({ email: z.string().email().max(254), password: z.string().min(1).max(200) });
export async function POST(request: NextRequest) {
  const parsed = Input.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid email and password." }, { status: 400 });
  const expectedEmail = process.env.OWNER_EMAIL?.trim().toLowerCase();
  const passwordHash = process.env.OWNER_PASSWORD_HASH;
  if (!expectedEmail || !passwordHash) return NextResponse.json({ error: "Owner login has not been configured. Set OWNER_EMAIL and OWNER_PASSWORD_HASH." }, { status: 503 });
  const emailMatches = parsed.data.email.trim().toLowerCase() === expectedEmail;
  const passwordMatches = await bcrypt.compare(parsed.data.password, passwordHash).catch(() => false);
  if (!emailMatches || !passwordMatches) return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
  try { await createOwnerSession(); return NextResponse.json({ ok: true }); }
  catch { return NextResponse.json({ error: "Owner session secret is not configured correctly." }, { status: 503 }); }
}
