import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const AppointmentSchema = new Schema({
  customerName: { type: String, required: true, trim: true, maxlength: 100 },
  customerEmail: { type: String, trim: true, lowercase: true, maxlength: 254, default: "" },
  customerPhone: { type: String, required: true, trim: true, maxlength: 25 },
  notes: { type: String, trim: true, maxlength: 1000, default: "" },
  serviceId: { type: Schema.Types.ObjectId, ref: "Service", required: true },
  serviceName: { type: String, required: true },
  durationMinutes: { type: Number, required: true },
  priceInPaise: { type: Number, required: true },
  staffId: { type: String, required: true, default: "team-1" },
  startsAt: { type: Date, required: true },
  endsAt: { type: Date, required: true },
  status: { type: String, enum: ["confirmed", "cancelled", "completed"], default: "confirmed", index: true },
}, { timestamps: true });
AppointmentSchema.index({ startsAt: 1, status: 1 });
type AppointmentDocument = InferSchemaType<typeof AppointmentSchema>;
export const Appointment = (mongoose.models.Appointment as Model<AppointmentDocument>) || mongoose.model<AppointmentDocument>("Appointment", AppointmentSchema);

const SlotReservationSchema = new Schema({
  staffId: { type: String, required: true },
  slotStart: { type: Date, required: true },
  appointmentId: { type: Schema.Types.ObjectId, required: true, index: true },
}, { timestamps: true });
SlotReservationSchema.index({ staffId: 1, slotStart: 1 }, { unique: true });
type SlotReservationDocument = InferSchemaType<typeof SlotReservationSchema>;
export const SlotReservation = (mongoose.models.SlotReservation as Model<SlotReservationDocument>) || mongoose.model<SlotReservationDocument>("SlotReservation", SlotReservationSchema);
