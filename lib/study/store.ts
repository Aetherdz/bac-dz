/**
 * Versioned localStorage for the study tools.
 *
 * All keys are namespaced and versioned so a future schema change can be
 * migrated or discarded instead of crashing on stale JSON. Every access is
 * guarded: private mode, disabled storage or a cleared profile must degrade to
 * in-memory defaults, never to a runtime error.
 */

export const STORAGE_KEYS = {
  timer: "bacdz.study.timer.v1",
  settings: "bacdz.study.settings.v1",
  stats: "bacdz.study.stats.v1",
  tasks: "bacdz.study.tasks.v1",
  planner: "bacdz.study.planner.v1",
  countdown: "bacdz.study.countdown.v1",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

/** Broadcast channel name used to sync tabs and mounted widgets. */
export const STUDY_EVENT = "bacdz:study:change";

function canUse(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function readStored<T>(key: StorageKey, fallback: T, guard: (value: unknown) => value is T): T {
  if (!canUse()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed: unknown = JSON.parse(raw);
    return guard(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function writeStored(key: StorageKey, value: unknown): boolean {
  if (!canUse()) return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeStored(key: StorageKey): void {
  if (!canUse()) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

/** Tell every mounted widget (and other tabs) that a study store changed. */
export function emitStudyChange(key?: StorageKey): void {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(new CustomEvent(STUDY_EVENT, { detail: { key } }));
  } catch {
    /* ignore */
  }
}
