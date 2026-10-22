import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import Service from "@/models/Service";
import { Appointment, SlotReservation } from "@/models/Appointment";
import { atSalonTime, getBusinessHours, isValidDateString } from "@/lib/business-hours";
import { getSalonStaff, staffCanTakeTime } from "@/lib/staff";
export const runtime = "nodejs";

async function notifyOwner(appointment: { id: string; customerName: string; customerPhone: string; serviceName: string; date: string; time: string; staffId: string; staffName: string; priceInPaise: number }) {
  const webhook = process.env.OWNER_NOTIFICATION_WEBHOOK?.trim();
  if (!webhook) return;
  try {
    const response = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "appointment.confirmed", salon: "Maison Belle", ...appointment }),
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) console.error("Owner booking webhook returned HTTP", response.status);
  } catch (error) {
    // Booking remains confirmed if an external notification provider is unavailable.
    console.error("Owner booking webhook delivery failed:", error instanceof Error ? error.message : "Unknown error");
  }
}
// Initialize both collections/indexes once before accepting concurrent bookings.
// MongoDB can race when several first writes try to create a collection at once;
// the shared promise also ensures the unique slot index is ready before any write.
let bookingIndexesReady: Promise<unknown> | undefined;
function ensureBookingIndexes() {
  bookingIndexesReady ??= Promise.all([
    Appointment.createIndexes(),
    SlotReservation.createIndexes(),
  ]).catch((error) => {
    bookingIndexesReady = undefined;
    throw error;
  });
  return bookingIndexesReady;
}

const BookingInput = z.object({
  serviceId: z.string().refine(mongoose.isValidObjectId, "Invalid service."),
  staffId: z.enum(["any", "team-1", "team-2"]).default("any"),
  date: z.string().refine(isValidDateString, "Invalid calendar date."),
  time: z.string().regex(/^(?:[01]\d|2[0-3]):(?:00|15|30|45)$/),
  customerName: z.string().trim().min(2).max(100),
  customerPhone: z.string().trim().min(7).max(25).regex(/^[+()\d\s.-]+$/, "Enter a valid phone number.").refine(value => value.replace(/\D/g, "").length >= 7, "Enter at least seven digits."),
  customerEmail: z.string().trim().email().max(254).optional().or(z.literal("")),
  notes: z.string().trim().max(1000).optional(),
});
export async function POST(request: NextRequest) {
  const parsed = BookingInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please check your details and try again.", details: parsed.error.flatten().fieldErrors }, { status: 400 });
  const input = parsed.data;
  try {
    await connectDB();
    // Ensure the unique staff/slot index exists before accepting any bookings.
    await ensureBookingIndexes();
    const service = await Service.findOne({ _id: input.serviceId, active: true });
    if (!service) return NextResponse.json({ error: "That service is no longer available." }, { status: 404 });
    const startsAt = atSalonTime(input.date, input.time);
    const endsAt = new Date(startsAt.getTime() + service.durationMinutes * 60_000);
    const { open, close } = getBusinessHours();
    const openAt = atSalonTime(input.date, open.text);
    const closeAt = atSalonTime(input.date, close.text);
    if (startsAt < openAt || endsAt > closeAt || startsAt <= new Date()) return NextResponse.json({ error: "Choose a future time within the salon opening hours." }, { status: 400 });
    const appointment = await Appointment.create({
      customerName: input.customerName, customerPhone: input.customerPhone, customerEmail: input.customerEmail ?? "",
      notes: input.notes ?? "", serviceId: service._id, serviceName: service.name, durationMinutes: service.durationMinutes,
      priceInPaise: service.priceInPaise, startsAt, endsAt, status: "confirmed",
    });
    const slotCount = Math.ceil(service.durationMinutes / 15);
    const staffProfiles = getSalonStaff();
    const staffIds = (input.staffId === "any" ? staffProfiles.map(person => person.id) : [input.staffId]).filter(id => {
      const person = staffProfiles.find(candidate => candidate.id === id);
      return person ? staffCanTakeTime(person, input.date, input.time, service.durationMinutes) : false;
    });
    for (const staffId of staffIds) {
      const reservations = Array.from({ length: slotCount }, (_, index) => ({
        staffId, slotStart: new Date(startsAt.getTime() + index * 15 * 60_000), appointmentId: appointment._id,
      }));
      try {
        await SlotReservation.insertMany(reservations, { ordered: true });
        await Appointment.updateOne({ _id: appointment._id }, { $set: { staffId } });
        const staffName = staffProfiles.find(person => person.id === staffId)?.name ?? "Assigned team member";
        await notifyOwner({ id: String(appointment._id), customerName: input.customerName, customerPhone: input.customerPhone, serviceName: service.name, date: input.date, time: input.time, staffId, staffName, priceInPaise: service.priceInPaise });
        return NextResponse.json({ appointment: { id: String(appointment._id), serviceName: service.name, date: input.date, time: input.time, staffId, staffName, status: "confirmed", priceInPaise: service.priceInPaise }, message: "Your appointment is confirmed." }, { status: 201 });
      } catch {
        await SlotReservation.deleteMany({ appointmentId: appointment._id });
      }
    }
    await Appointment.deleteOne({ _id: appointment._id });
    return NextResponse.json({ error: "That time was just booked. Please choose another available slot." }, { status: 409 });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) return NextResponse.json({ error: "Please check your booking details." }, { status: 400 });
    return NextResponse.json({ error: "We could not save your appointment. Please try again." }, { status: 503 });
  }
}
