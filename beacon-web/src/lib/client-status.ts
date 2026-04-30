import { differenceInDays, parseISO } from "date-fns";

export type ClientStatus = "contacted" | "urgent" | "upcoming" | "scheduled" | "inactive";

export interface StatusConfig {
  label: string;
  dotClass: string;
  pillClass: string;
}

export const STATUS_CONFIG: Record<ClientStatus, StatusConfig> = {
  contacted: { label: "Contacted", dotClass: "bg-green-500", pillClass: "bg-green-100 text-green-700" },
  urgent:    { label: "Urgent",    dotClass: "bg-red-500",   pillClass: "bg-red-100 text-red-700" },
  upcoming:  { label: "Upcoming",  dotClass: "bg-amber-500", pillClass: "bg-amber-100 text-amber-700" },
  scheduled: { label: "Scheduled", dotClass: "bg-blue-500",  pillClass: "bg-blue-100 text-blue-700" },
  inactive:  { label: "Inactive",  dotClass: "bg-slate-400", pillClass: "bg-slate-100 text-slate-500" },
};

export function computeClientStatus(
  renewalDate: string | null | undefined,
  lastSentAt: Date | null
): ClientStatus {
  if (lastSentAt) return "contacted";
  if (!renewalDate) return "inactive";
  const daysUntil = differenceInDays(parseISO(renewalDate), new Date());
  if (daysUntil < -7) return "inactive";
  if (daysUntil <= 30) return "urgent";
  if (daysUntil <= 60) return "upcoming";
  return "scheduled";
}

export function buildSentMap(
  logEntries: Array<{ clientId: string; sentAt: string }>
): Map<string, Date> {
  const map = new Map<string, Date>();
  for (const e of logEntries) {
    const d = new Date(e.sentAt);
    const ex = map.get(e.clientId);
    if (!ex || d > ex) map.set(e.clientId, d);
  }
  return map;
}
