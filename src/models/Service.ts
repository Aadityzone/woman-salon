import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const ServiceSchema = new Schema({
  name: { type: String, required: true, trim: true, unique: true },
  description: { type: String, required: true, trim: true },
  durationMinutes: { type: Number, required: true, min: 15, max: 480 },
  priceInPaise: { type: Number, required: true, min: 0 },
  category: { type: String, required: true, trim: true },
  active: { type: Boolean, default: true },
}, { timestamps: true });
export type ServiceDocument = InferSchemaType<typeof ServiceSchema>;
const Service = (mongoose.models.Service as Model<ServiceDocument>) || mongoose.model<ServiceDocument>("Service", ServiceSchema);
export default Service;
