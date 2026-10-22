import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import { isOwnerAuthenticated } from "@/lib/owner-auth";
import Service from "@/models/Service";
export const runtime = "nodejs";
export async function GET() {
  if (!await isOwnerAuthenticated()) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  try {
    await connectDB();
    const services = await Service.find().sort({ category: 1, name: 1 }).lean();
    return NextResponse.json({ services: services.map(s => ({ id: String(s._id), name: s.name, description: s.description, durationMinutes: s.durationMinutes, priceInPaise: s.priceInPaise, category: s.category, active: s.active })) });
  } catch { return NextResponse.json({ error: "Could not load services." }, { status: 503 }); }
}
const UpdateInput = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().min(5).max(300),
  durationMinutes: z.number().int().min(15).max(480),
  priceInPaise: z.number().int().min(0).max(10_000_000),
  category: z.string().trim().min(2).max(60),
  active: z.boolean(),
});
export async function PATCH(request: NextRequest) {
  if (!await isOwnerAuthenticated()) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const id = request.nextUrl.searchParams.get("id");
  if (!id || !mongoose.isValidObjectId(id)) return NextResponse.json({ error: "Invalid service." }, { status: 400 });
  const parsed = UpdateInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please check the service fields.", details: parsed.error.flatten().fieldErrors }, { status: 400 });
  try {
    await connectDB();
    const service = await Service.findByIdAndUpdate(id, { $set: parsed.data }, { new: true, runValidators: true });
    if (!service) return NextResponse.json({ error: "Service not found." }, { status: 404 });
    return NextResponse.json({ service: { id: String(service._id), name: service.name, description: service.description, durationMinutes: service.durationMinutes, priceInPaise: service.priceInPaise, category: service.category, active: service.active } });
  } catch { return NextResponse.json({ error: "Could not save service. Check that its name is unique." }, { status: 409 }); }
}
