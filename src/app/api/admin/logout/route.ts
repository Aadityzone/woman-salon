import { NextResponse } from "next/server";
import { clearOwnerSession } from "@/lib/owner-auth";
export async function POST() { await clearOwnerSession(); return NextResponse.json({ ok: true }); }
