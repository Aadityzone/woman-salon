import { NextResponse } from "next/server";
import { isOwnerAuthenticated } from "@/lib/owner-auth";
export async function GET() { return NextResponse.json({ authenticated: await isOwnerAuthenticated() }); }
