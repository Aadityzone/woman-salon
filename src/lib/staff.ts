import { SALON_TIMEZONE } from "@/lib/business-hours";

export type SalonStaff = {
  id: "team-1" | "team-2";
  name: string;
  workingDays: number[];
  opensAt: string;
  closesAt: string;
};

function clockMinutes(value: string, fallback: string) {
  const raw = value || fallback;
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(raw)) return clockMinutes(fallback, fallback);
  const [hours, minutes] = raw.split(":").map(Number);
  return hours * 60 + minutes;
}

function daysFromEnv(value: string | undefined) {
  const dayMap: Record<string, number> = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
  if (!value?.trim()) return [0, 1, 2, 3, 4, 5, 6];
  const parsed = value.split(",").map(day => dayMap[day.trim().slice(0, 3).toLowerCase()]).filter(day => day !== undefined);
  return parsed.length ? [...new Set(parsed)] : [];
}

export function getSalonStaff(): SalonStaff[] {
  const defaultOpen = process.env.SALON_OPEN_TIME || "10:00";
  const defaultClose = process.env.SALON_CLOSE_TIME || "19:00";
  const staff = [
    { id: "team-1" as const, name: process.env.SALON_STAFF_1_NAME?.trim() || "Stylist 1", days: process.env.SALON_STAFF_1_DAYS, open: process.env.SALON_STAFF_1_OPEN_TIME, close: process.env.SALON_STAFF_1_CLOSE_TIME },
    { id: "team-2" as const, name: process.env.SALON_STAFF_2_NAME?.trim() || "Stylist 2", days: process.env.SALON_STAFF_2_DAYS, open: process.env.SALON_STAFF_2_OPEN_TIME, close: process.env.SALON_STAFF_2_CLOSE_TIME },
  ];
  return staff.map(person => ({
    id: person.id,
    name: person.name,
    workingDays: daysFromEnv(person.days),
    opensAt: person.open || defaultOpen,
    closesAt: person.close || defaultClose,
  })).filter(person => clockMinutes(person.closesAt, defaultClose) > clockMinutes(person.opensAt, defaultOpen));
}

export function staffCanWorkOnDate(staff: SalonStaff, date: string) {
  const weekday = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: SALON_TIMEZONE }).format(new Date(date + "T12:00:00+05:30")).toLowerCase();
  const dayMap: Record<string, number> = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
  return staff.workingDays.includes(dayMap[weekday] ?? -1);
}

export function staffCanTakeTime(staff: SalonStaff, date: string, time: string, durationMinutes: number) {
  if (!staffCanWorkOnDate(staff, date)) return false;
  const start = clockMinutes(time, "00:00");
  return start >= clockMinutes(staff.opensAt, "10:00") && start + durationMinutes <= clockMinutes(staff.closesAt, "19:00");
}
