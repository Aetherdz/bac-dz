/**
 * Time helpers for the study tools.
 *
 * Everything is anchored on Africa/Algiers (UTC+1, no DST since 1981). We never
 * use the device timezone: a student travelling or with a misconfigured clock
 * must still get the Algerian day for streaks and statistics.
 */

export const ALGIERS_OFFSET_MS = 60 * 60 * 1000;
export const ALGIERS_TIME_ZONE = "Africa/Algiers";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Shift an epoch instant into Algiers wall-clock coordinates. */
function algiers(now: number): Date {
  return new Date(now + ALGIERS_OFFSET_MS);
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

/** YYYY-MM-DD for the Algiers calendar day containing `now`. */
export function dayKey(now: number = Date.now()): string {
  const d = algiers(now);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

/** Epoch ms of 00:00 Algiers for a day key. */
export function startOfAlgiersDay(key: string): number {
  const [year, month, day] = key.split("-").map(Number);
  return Date.UTC(year, (month ?? 1) - 1, day ?? 1) - ALGIERS_OFFSET_MS;
}

/** Parse a day key into a UTC-noon Date (safe for weekday arithmetic). */
export function keyToDate(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(Date.UTC(year, (month ?? 1) - 1, day ?? 1, 12, 0, 0));
}

/** Day key for a Date instance (read in UTC, so pass a noon date). */
export function dateToKey(date: Date): string {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

/** Add (or subtract) whole days to a day key. */
export function addDays(key: string, delta: number): string {
  return dateToKey(new Date(keyToDate(key).getTime() + delta * DAY_MS));
}

/** Signed number of days from `from` to `to`. */
export function daysBetween(from: string, to: string): number {
  return Math.round((keyToDate(to).getTime() - keyToDate(from).getTime()) / DAY_MS);
}

/** Last `count` day keys ending today (oldest first). */
export function recentDays(count: number, now: number = Date.now()): string[] {
  const today = dayKey(now);
  const out: string[] = [];
  for (let index = count - 1; index >= 0; index -= 1) out.push(addDays(today, -index));
  return out;
}

/**
 * Consecutive active days ending today or yesterday. A streak is only counted
 * when there is real recorded activity; no day is ever invented.
 */
export function computeStreak(days: Iterable<string>, now: number = Date.now()): number {
  const set = new Set(days);
  const today = dayKey(now);
  let cursor = set.has(today) ? today : addDays(today, -1);
  if (!set.has(cursor)) return 0;
  let streak = 0;
  while (set.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

/** mm:ss, or h:mm:ss above one hour. */
export function formatClock(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  if (hours > 0) return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  return `${pad(minutes)}:${pad(seconds)}`;
}

/** Locale-aware long date for a day key, rendered in Algiers. */
export function formatDayKey(key: string, locale: "ar" | "fr" | "en"): string {
  const localeTag = locale === "ar" ? "ar-DZ" : locale === "fr" ? "fr-DZ" : "en-GB";
  return new Intl.DateTimeFormat(localeTag, {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: ALGIERS_TIME_ZONE,
  }).format(new Date(startOfAlgiersDay(key)));
}

/** Short date (dd/mm) for chart labels. */
export function shortDayKey(key: string): string {
  return `${key.slice(8, 10)}/${key.slice(5, 7)}`;
}

/** Localised minute count with an explicit unit. */
export function formatMinutes(minutes: number, locale: "ar" | "fr" | "en"): string {
  const rounded = Math.max(0, Math.round(minutes));
  if (locale === "ar") return `${rounded} د`;
  if (locale === "fr") return `${rounded} min`;
  return `${rounded} min`;
}

/** 0 = Sunday … 6 = Saturday, matching the Algerian week. */
export function weekdayIndex(key: string = dayKey()): number {
  return keyToDate(key).getUTCDay();
}

/** Whole minutes between two epoch instants, rounded. */
export function minutesBetween(from: number, to: number): number {
  return Math.max(0, Math.round((to - from) / 60_000));
}
