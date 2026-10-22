import "dotenv/config";
import mongoose from "mongoose";
import Service from "../src/models/Service";

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Set MONGODB_URI before running npm run seed.");
  await mongoose.connect(uri);
  const services = [
  { name: "Signature haircut", description: "A tailored cut and finish shaped around you.", durationMinutes: 45, priceInPaise: 49900, category: "Hair", active: true },
  { name: "Blow-dry & styling", description: "Smooth, bouncy or beautifully undone.", durationMinutes: 30, priceInPaise: 39900, category: "Hair", active: true },
  { name: "Hair spa & repair", description: "A nourishing reset for softer, healthier-feeling hair.", durationMinutes: 45, priceInPaise: 89900, category: "Hair", active: true },
  { name: "Root touch-up", description: "A seamless refresh for your colour.", durationMinutes: 60, priceInPaise: 99900, category: "Hair", active: true },
  { name: "Global hair colour", description: "A full-colour transformation with a considered finish.", durationMinutes: 90, priceInPaise: 199900, category: "Hair", active: true },
  { name: "Highlights & balayage", description: "Dimensional colour with a naturally blended look.", durationMinutes: 150, priceInPaise: 249900, category: "Hair", active: true },
  { name: "Smoothening", description: "A sleek, polished finish with a consultation first.", durationMinutes: 180, priceInPaise: 299900, category: "Hair", active: true },
  { name: "Party hair & updos", description: "Soft waves, polished buns and occasion styling.", durationMinutes: 60, priceInPaise: 99900, category: "Hair", active: true },
  { name: "Express clean-up", description: "A quick refresh for a clean, comfortable feel.", durationMinutes: 30, priceInPaise: 49900, category: "Skin", active: true },
  { name: "Classic facial", description: "A tailored facial ritual for everyday radiance.", durationMinutes: 60, priceInPaise: 99900, category: "Skin", active: true },
  { name: "Hydrating facial", description: "A moisture-focused treatment for a fresh, dewy look.", durationMinutes: 60, priceInPaise: 149900, category: "Skin", active: true },
  { name: "Brightening ritual", description: "A glow-focused facial selected for your skin needs.", durationMinutes: 60, priceInPaise: 149900, category: "Skin", active: true },
  { name: "Detan treatment", description: "A refreshing treatment for face, neck or arms.", durationMinutes: 30, priceInPaise: 69900, category: "Skin", active: true },
  { name: "Face & brow threading", description: "Precise shaping and tidy finishing details.", durationMinutes: 15, priceInPaise: 9900, category: "Skin", active: true },
  { name: "Classic manicure", description: "Nail shaping, cuticle care and a polished finish.", durationMinutes: 40, priceInPaise: 39900, category: "Nails", active: true },
  { name: "Classic pedicure", description: "A soothing reset for feet, nails and skin.", durationMinutes: 45, priceInPaise: 49900, category: "Nails", active: true },
  { name: "Gel polish", description: "A glossy, long-wear finish in your chosen shade.", durationMinutes: 45, priceInPaise: 69900, category: "Nails", active: true },
  { name: "Gel removal", description: "Careful removal with nail health in mind.", durationMinutes: 15, priceInPaise: 19900, category: "Nails", active: true },
  { name: "Nail art", description: "Minimal accents or expressive designs, your way.", durationMinutes: 30, priceInPaise: 9900, category: "Nails", active: true },
  { name: "Extensions & overlays", description: "Length and structure shaped to your style.", durationMinutes: 75, priceInPaise: 149900, category: "Nails", active: true },
  { name: "Everyday makeup", description: "Fresh, light and beautifully effortless.", durationMinutes: 45, priceInPaise: 99900, category: "Makeup", active: true },
  { name: "Party makeup", description: "A little extra polish for your plans.", durationMinutes: 75, priceInPaise: 299900, category: "Makeup", active: true },
  { name: "Soft glam", description: "Diffused definition with a luminous finish.", durationMinutes: 90, priceInPaise: 349900, category: "Makeup", active: true },
  { name: "Eye makeup", description: "From subtle definition to a statement eye.", durationMinutes: 45, priceInPaise: 79900, category: "Makeup", active: true },
  { name: "Draping & finishing", description: "The final details to complete your look.", durationMinutes: 30, priceInPaise: 49900, category: "Makeup", active: true },
  { name: "Bridal consultation", description: "A personal conversation about your wedding-day look.", durationMinutes: 60, priceInPaise: 0, category: "Makeup", active: true }
  ];
  await Service.updateMany({ name: { $in: ["Hair Styling", "Skin Rituals", "Makeup", "Nail Care"] } }, { $set: { active: false } });
  for (const service of services) await Service.updateOne({ name: service.name }, { $set: service }, { upsert: true });
  console.log("Initial salon services are ready.");
  await mongoose.disconnect();
}
main().catch(async error => { console.error(error); await mongoose.disconnect().catch(() => undefined); process.exitCode = 1; });
