import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Service from "@/models/Service";
import { SlotReservation } from "@/models/Appointment";
import { atSalonTime, getBusinessHours, isValidDateString } from "@/lib/business-hours";
import { getSalonStaff, staffCanTakeTime } from "@/lib/staff";
export const runtime = "nodejs";
export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date") ?? "";
  const serviceId = request.nextUrl.searchParams.get("serviceId") ?? "";
  const requestedStaff = request.nextUrl.searchParams.get("staffId") ?? "any";
  if (!["any", "team-1", "team-2"].includes(requestedStaff)) return NextResponse.json({ error: "Choose a valid stylist." }, { status: 400 });
  if (!isValidDateString(date) || !mongoose.isValidObjectId(serviceId)) return NextResponse.json({ error: "Choose a valid date and service." }, { status: 400 });
  try {
    await connectDB();
    const service = await Service.findOne({ _id: serviceId, active: true }).lean();
    if (!service) return NextResponse.json({ error: "That service is unavailable." }, { status: 404 });
    const staffProfiles = getSalonStaff();
    const staffIds = (requestedStaff === "any" ? staffProfiles.map(person => person.id) : [requestedStaff]).filter(id => staffProfiles.some(person => person.id === id));
    const { open, close } = getBusinessHours();
    const durationSlots = Math.ceil(service.durationMinutes / 15);
    const dayStart = atSalonTime(date, "00:00");
    const dayEnd = atSalonTime(date, "23:59");
    const reserved = await SlotReservation.find({ staffId: { $in: staffIds }, slotStart: { $gte: dayStart, $lte: dayEnd } }).select("staffId slotStart").lean();
    const occupied = new Set(reserved.map(r => r.staffId + "|" + new Date(r.slotStart).toISOString()));
    const slots: { time: string; available: boolean }[] = [];
    const now = Date.now();
    for (let minute = open.minutes; minute + service.durationMinutes <= close.minutes; minute += 15) {
      const hh = String(Math.floor(minute / 60)).padStart(2, "0");
      const mm = String(minute % 60).padStart(2, "0");
      const time = hh + ":" + mm;
      const start = atSalonTime(date, time);
      if (start.getTime() <= now) continue;
      let available = false;
      for (const staffId of staffIds) {
        const staffProfile = staffProfiles.find(person => person.id === staffId);
        if (!staffProfile || !staffCanTakeTime(staffProfile, date, time, service.durationMinutes)) continue;
        let free = true;
        for (let i = 0; i < durationSlots; i++) {
          const slot = new Date(start.getTime() + i * 15 * 60_000).toISOString();
          if (occupied.has(staffId + "|" + slot)) { free = false; break; }
        }
        if (free) { available = true; break; }
      }
      slots.push({ time, available });
    }
    return NextResponse.json({ date, staffId: requestedStaff, staff: staffProfiles.map(({ id, name, workingDays, opensAt, closesAt }) => ({ id, name, workingDays, opensAt, closesAt })), service: { id: String(service._id), durationMinutes: service.durationMinutes }, slots });
  } catch { return NextResponse.json({ error: "Could not check availability right now." }, { status: 503 }); }
}
