/**
 * Weekly planner: recurring weekday slots that can launch a focus block.
 *
 * A session belongs to a weekday (0 = Sunday … 6 = Saturday, the Algerian
 * week). Completion is stored as a day key so that "done" resets naturally the
 * following week instead of leaking across weeks.
 */

import type { Localized } from "@/content/bac";
import { addDays, dayKey, weekdayIndex } from "./time";

export type PlannerSession = {
  id: string;
  /** 0 = Sunday … 6 = Saturday. */
  weekday: number;
  /** Start time, "HH:MM" 24h. */
  start: string;
  minutes: number;
  subject: string;
  lesson: string;
  /** Day key on which this slot was completed, or null. */
  doneOn: string | null;
};

export type PlannerStore = { version: 1; sessions: PlannerSession[] };

export const dayLabels: Localized[] = [
  { ar: "الأحد", fr: "Dimanche", en: "Sunday" },
  { ar: "الاثنين", fr: "Lundi", en: "Monday" },
  { ar: "الثلاثاء", fr: "Mardi", en: "Tuesday" },
  { ar: "الأربعاء", fr: "Mercredi", en: "Wednesday" },
  { ar: "الخميس", fr: "Jeudi", en: "Thursday" },
  { ar: "الجمعة", fr: "Vendredi", en: "Friday" },
  { ar: "السبت", fr: "Samedi", en: "Saturday" },
];

export const dayLabelsShort: Localized[] = [
  { ar: "أحد", fr: "Dim", en: "Sun" },
  { ar: "اثن", fr: "Lun", en: "Mon" },
  { ar: "ثلا", fr: "Mar", en: "Tue" },
  { ar: "أرب", fr: "Mer", en: "Wed" },
  { ar: "خمي", fr: "Jeu", en: "Thu" },
  { ar: "جمع", fr: "Ven", en: "Fri" },
  { ar: "سبت", fr: "Sam", en: "Sat" },
];

export function emptyPlanner(): PlannerStore {
  return { version: 1, sessions: [] };
}

export function isValidTime(value: string): boolean {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) return false;
  return true;
}

export function minutesFromTime(value: string): number {
  if (!isValidTime(value)) return 0;
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

export function timeFromMinutes(value: number): string {
  const total = ((Math.round(value) % 1440) + 1440) % 1440;
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

/** End time of a slot, wrapping past midnight. */
export function endTime(start: string, minutes: number): string {
  return timeFromMinutes(minutesFromTime(start) + Math.max(0, Math.round(minutes)));
}

function newId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export type SessionInput = {
  weekday: number;
  start: string;
  minutes: number;
  subject?: string;
  lesson?: string;
};

/** Create a planner slot; returns null on an invalid weekday or time. */
export function createSession(input: SessionInput): PlannerSession | null {
  if (!Number.isInteger(input.weekday) || input.weekday < 0 || input.weekday > 6) return null;
  if (!isValidTime(input.start)) return null;
  const minutes = Number.isFinite(input.minutes) ? Math.min(300, Math.max(10, Math.round(input.minutes))) : 45;
  return {
    id: newId(),
    weekday: input.weekday,
    start: input.start,
    minutes,
    subject: (input.subject ?? "").trim().slice(0, 80),
    lesson: (input.lesson ?? "").trim().slice(0, 160),
    doneOn: null,
  };
}

/** Sessions of one weekday, ordered by start time. */
export function sessionsForDay(store: PlannerStore, weekday: number): PlannerSession[] {
  return store.sessions
    .filter((session) => session.weekday === weekday)
    .sort((a, b) => minutesFromTime(a.start) - minutesFromTime(b.start));
}

/** Total planned minutes for the whole week. */
export function weeklyMinutes(store: PlannerStore): number {
  return store.sessions.reduce((sum, session) => sum + session.minutes, 0);
}

/** Day key of `weekday` inside the Sunday-based week containing `now`. */
export function dateOfWeekday(weekday: number, now: number = Date.now()): string {
  const today = dayKey(now);
  const delta = weekday - weekdayIndex(today);
  return addDays(today, delta);
}

export function isSessionDone(session: PlannerSession, today: string = dayKey()): boolean {
  return session.doneOn === today;
}

/**
 * Completion of the current week: only slots marked done on the date their
 * weekday falls on in the current week are counted.
 */
export function weekProgress(store: PlannerStore, now: number = Date.now()): { done: number; total: number; percent: number } {
  const total = store.sessions.length;
  if (total === 0) return { done: 0, total: 0, percent: 0 };
  const done = store.sessions.filter((session) => session.doneOn === dateOfWeekday(session.weekday, now)).length;
  return { done, total, percent: Math.round((done / total) * 100) };
}

export function todaySessions(store: PlannerStore, now: number = Date.now()): PlannerSession[] {
  return sessionsForDay(store, weekdayIndex(dayKey(now)));
}

export function toggleSession(store: PlannerStore, id: string, now: number = Date.now()): PlannerStore {
  const today = dayKey(now);
  return {
    version: 1,
    sessions: store.sessions.map((session) =>
      session.id === id ? { ...session, doneOn: session.doneOn === today ? null : today } : session,
    ),
  };
}

export function patchSession(store: PlannerStore, id: string, patch: Partial<Omit<PlannerSession, "id">>): PlannerStore {
  return { version: 1, sessions: store.sessions.map((session) => (session.id === id ? { ...session, ...patch } : session)) };
}

export function removeSession(store: PlannerStore, id: string): PlannerStore {
  return { version: 1, sessions: store.sessions.filter((session) => session.id !== id) };
}

export function isPlannerStore(value: unknown): value is PlannerStore {
  if (!value || typeof value !== "object") return false;
  const store = value as Record<string, unknown>;
  if (store.version !== 1 || !Array.isArray(store.sessions)) return false;
  return store.sessions.every((entry) => {
    if (!entry || typeof entry !== "object") return false;
    const session = entry as Record<string, unknown>;
    return (
      typeof session.id === "string" &&
      typeof session.weekday === "number" &&
      session.weekday >= 0 &&
      session.weekday <= 6 &&
      typeof session.start === "string" &&
      isValidTime(session.start) &&
      typeof session.minutes === "number" &&
      typeof session.subject === "string" &&
      typeof session.lesson === "string" &&
      (session.doneOn === null || typeof session.doneOn === "string")
    );
  });
}
