export const SALON_TIMEZONE = "Asia/Kolkata";
export const SALON_OFFSET = "+05:30";
function parseClock(value: string | undefined, fallback: string) {
  const raw = value ?? fallback;
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(raw)) throw new Error("Salon hours must use HH:mm in 24-hour format.");
  const [hours, minutes] = raw.split(":").map(Number);
  return { text: raw, minutes: hours * 60 + minutes };
}
export function getBusinessHours() {
  const open = parseClock(process.env.SALON_OPEN_TIME, "10:00");
  const close = parseClock(process.env.SALON_CLOSE_TIME, "19:00");
  if (close.minutes <= open.minutes) throw new Error("SALON_CLOSE_TIME must be later than SALON_OPEN_TIME.");
  return { open, close };
}
export function atSalonTime(date: string, time: string) {
  return new Date(date + "T" + time + ":00" + SALON_OFFSET);
}

export function isValidDateString(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(value + "T00:00:00.000Z");
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}
