import type { CallPolicy, CallSchedule } from "@prisma/client";

/**
 * Shared logic for the internal calling system: policy window validation,
 * time-window helpers, and participant normalization.
 */

const DAY_KEYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const;

/** Parse a "HH:mm" 24h string into minutes-since-midnight. */
function parseHHMM(s: string): number {
  const [h, m] = s.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

/**
 * Is `instant` within the policy's allowed window?
 * - Policy is enabled
 * - The weekday of `instant` (in the policy's timezone) is in allowedDays
 * - The time-of-day is within [allowedStartTime, allowedEndTime]
 *
 * Timezone handling: we evaluate the policy window in the policy's declared
 * timezone. For broad correctness without a TZ library we shift by the
 * policy's UTC offset derived from Intl. Acceptable ±minute accuracy for an
 * internal scheduling tool.
 */
export function isWithinPolicyWindow(
  policy: Pick<
    CallPolicy,
    | "isEnabled"
    | "allowedDays"
    | "allowedStartTime"
    | "allowedEndTime"
    | "timezone"
  >,
  instant: Date
): boolean {
  if (!policy.isEnabled) return false;

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: policy.timezone || "UTC",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(instant);

  const get = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? "";

  const weekday = get("weekday").toUpperCase().slice(0, 3); // "Mon" -> "MON"
  const hour = parseInt(get("hour"), 10);
  const minute = parseInt(get("minute"), 10);
  const timeOfDay = (hour === 24 ? 0 : hour) * 60 + minute;

  if (!policy.allowedDays.includes(weekday)) return false;

  const start = parseHHMM(policy.allowedStartTime);
  const end = parseHHMM(policy.allowedEndTime);

  if (start <= end) {
    return timeOfDay >= start && timeOfDay <= end;
  }
  // Overnight window (e.g. 22:00 → 02:00)
  return timeOfDay >= start || timeOfDay <= end;
}

/**
 * Is a schedule's window currently open (i.e. `now` is between its start and
 * end) AND the schedule is APPROVED? This is the gate the session-start route
 * re-checks right before creating a CallSession.
 */
export function isScheduleWindowOpen(
  schedule: Pick<CallSchedule, "status" | "startDateTime" | "endDateTime">,
  now: Date = new Date()
): boolean {
  if (schedule.status !== "APPROVED") return false;
  return (
    now >= new Date(schedule.startDateTime) &&
    now <= new Date(schedule.endDateTime)
  );
}

/** Human-friendly description of a policy window, e.g. "Mon–Fri, 09:00–17:00 UTC". */
export function describePolicy(
  policy: Pick<
    CallPolicy,
    | "isEnabled"
    | "allowedDays"
    | "allowedStartTime"
    | "allowedEndTime"
    | "timezone"
  >
): string {
  if (!policy.isEnabled) return "Calls disabled";
  const order = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  const days = order.filter((d) => policy.allowedDays.includes(d));
  let dayLabel: string;
  if (days.length === 0) dayLabel = "Never";
  else if (days.length === 7) dayLabel = "Every day";
  else dayLabel = days.join(", ");
  return `${dayLabel}, ${policy.allowedStartTime}–${policy.allowedEndTime} ${
    policy.timezone
  }`;
}

/** Default policy used when seeding the singleton row. */
export function defaultPolicy() {
  return {
    key: "global",
    isEnabled: true,
    allowedDays: ["MON", "TUE", "WED", "THU", "FRI"],
    allowedStartTime: "09:00",
    allowedEndTime: "17:00",
    timezone: "UTC",
    maxDurationMin: 60,
  };
}

export { DAY_KEYS };
