/**
 * Pomodoro engine — pure, deterministic, no React and no browser globals.
 *
 * The state stores the epoch instant at which the phase ends (`endsAt`), never a
 * decremented counter. That makes the timer immune to tab throttling, device
 * suspension and page navigation: on every tick we compare wall-clock time with
 * the deadline, and missed phases are replayed from their real deadlines.
 */

import { dayKey } from "./time";

export type Phase = "focus" | "short" | "long";

export type PomodoroSettings = {
  /** Focus block length, minutes. */
  focus: number;
  /** Short break, minutes. */
  short: number;
  /** Long break, minutes. */
  long: number;
  /** Long break after this many focus blocks. */
  longEvery: number;
  /** Chain the next phase automatically. */
  autoStart: boolean;
  /** Short beep on phase change. */
  sound: boolean;
  /** Browser notification on phase change (permission-gated). */
  notifications: boolean;
};

export type TimerState = {
  phase: Phase;
  /** Epoch ms of the phase deadline; null when idle or paused. */
  endsAt: number | null;
  /** Remaining ms while paused; null when running or fresh. */
  pausedMs: number | null;
  /** Completed focus blocks inside the current long-break cycle. */
  inCycle: number;
  /** Lifetime completed focus blocks (local). */
  completed: number;
  /** Optional label of the study block (lesson, task, subject). */
  label: string | null;
};

export type CompletionEvent = {
  phase: Phase;
  /** Deadline that was reached. */
  at: number;
  durationMs: number;
  label: string | null;
};

export type StatsDay = { sessions: number; ms: number };

export type StatsStore = {
  version: 1;
  days: Record<string, StatsDay>;
  total: StatsDay;
};

export const defaultSettings: PomodoroSettings = {
  focus: 25,
  short: 5,
  long: 15,
  longEvery: 4,
  autoStart: true,
  sound: true,
  notifications: false,
};

const MINUTES = 60_000;

export function clampMinutes(value: unknown, min: number, max: number, fallback: number): number {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.round(parsed)));
}

export function normalizeSettings(input: Partial<PomodoroSettings> | null | undefined): PomodoroSettings {
  const raw = input ?? {};
  return {
    focus: clampMinutes(raw.focus, 1, 120, defaultSettings.focus),
    short: clampMinutes(raw.short, 1, 60, defaultSettings.short),
    long: clampMinutes(raw.long, 5, 90, defaultSettings.long),
    longEvery: clampMinutes(raw.longEvery, 2, 8, defaultSettings.longEvery),
    autoStart: typeof raw.autoStart === "boolean" ? raw.autoStart : defaultSettings.autoStart,
    sound: typeof raw.sound === "boolean" ? raw.sound : defaultSettings.sound,
    notifications: typeof raw.notifications === "boolean" ? raw.notifications : defaultSettings.notifications,
  };
}

export function durationMs(phase: Phase, settings: PomodoroSettings): number {
  const minutes = phase === "focus" ? settings.focus : phase === "short" ? settings.short : settings.long;
  return clampMinutes(minutes, 1, 180, 1) * MINUTES;
}

export function freshState(): TimerState {
  return { phase: "focus", endsAt: null, pausedMs: null, inCycle: 0, completed: 0, label: null };
}

/** Remaining ms for the current phase at `now`. */
export function remainingMs(state: TimerState, settings: PomodoroSettings, now: number): number {
  if (state.endsAt !== null) return Math.max(0, state.endsAt - now);
  if (state.pausedMs !== null) return Math.max(0, state.pausedMs);
  return durationMs(state.phase, settings);
}

/** Elapsed fraction of the phase, 0..1 — used by the ring. */
export function progress(state: TimerState, settings: PomodoroSettings, now: number): number {
  const total = durationMs(state.phase, settings);
  if (total <= 0) return 0;
  const left = remainingMs(state, settings, now);
  return Math.min(1, Math.max(0, 1 - left / total));
}

/** Start or resume. Idempotent while running. */
export function start(state: TimerState, settings: PomodoroSettings, now: number): TimerState {
  if (state.endsAt !== null) return state;
  const left = state.pausedMs ?? durationMs(state.phase, settings);
  return { ...state, endsAt: now + left, pausedMs: null };
}

/** Pause, preserving the exact remaining time. */
export function pause(state: TimerState, now: number): TimerState {
  if (state.endsAt === null) return state;
  return { ...state, endsAt: null, pausedMs: Math.max(0, state.endsAt - now) };
}

function nextPhase(phase: Phase, inCycle: number, settings: PomodoroSettings): Phase {
  if (phase !== "focus") return "focus";
  return inCycle >= settings.longEvery ? "long" : "short";
}

/** Skip the current phase. Never credits a completion. */
export function skip(state: TimerState, settings: PomodoroSettings): TimerState {
  const phase = nextPhase(state.phase, state.inCycle, settings);
  return { ...state, phase, endsAt: null, pausedMs: null, label: phase === "focus" ? state.label : null };
}

/** Reset the deadline, keep lifetime counters. */
export function reset(state: TimerState): TimerState {
  return { ...state, phase: "focus", endsAt: null, pausedMs: null, label: null };
}

function completeOne(state: TimerState, settings: PomodoroSettings, at: number): { state: TimerState; event: CompletionEvent } {
  const duration = durationMs(state.phase, settings);
  const event: CompletionEvent = { phase: state.phase, at, durationMs: duration, label: state.label };

  let completed = state.completed;
  let inCycle = state.inCycle;
  if (state.phase === "focus") {
    completed += 1;
    inCycle = Math.min(settings.longEvery, inCycle + 1);
  }

  const phase = nextPhase(state.phase, inCycle, settings);
  // Only finishing the long break closes the cycle; short breaks keep it open.
  const nextInCycle = state.phase === "long" ? 0 : inCycle;

  const next: TimerState = {
    phase,
    endsAt: null,
    pausedMs: null,
    inCycle: nextInCycle,
    completed,
    label: phase === "focus" ? state.label : null,
  };

  if (settings.autoStart) next.endsAt = at + durationMs(phase, settings);
  return { state: next, event };
}

/**
 * Advance the timer to `now`. Missed phases are replayed from their real
 * deadlines, so a suspended tab or a closed site cannot introduce drift.
 */
export function tick(
  state: TimerState,
  settings: PomodoroSettings,
  now: number,
): { state: TimerState; events: CompletionEvent[] } {
  let current = state;
  const events: CompletionEvent[] = [];
  let guard = 0;
  while (current.endsAt !== null && current.endsAt <= now && guard < 10_000) {
    const at = current.endsAt;
    const result = completeOne(current, settings, at);
    events.push(result.event);
    current = result.state;
    if (!settings.autoStart) break;
    guard += 1;
  }
  return { state: current, events };
}

/**
 * Restore a persisted timer after a reload. At most one phase is credited for a
 * deadline that passed while the site was closed, then the next phase is left
 * ready (not auto-started) so the student consciously resumes.
 */
export function restore(
  state: TimerState,
  settings: PomodoroSettings,
  now: number,
): { state: TimerState; event: CompletionEvent | null } {
  if (state.endsAt === null || state.endsAt > now) return { state, event: null };
  const { state: next, events } = tick({ ...state, endsAt: state.endsAt }, { ...settings, autoStart: false }, now);
  return { state: next, event: events[0] ?? null };
}

export function emptyStats(): StatsStore {
  return { version: 1, days: {}, total: { sessions: 0, ms: 0 } };
}

/** Credit a finished focus block to an Algiers day, without mutating input. */
export function recordFocus(stats: StatsStore, at: number, ms: number): StatsStore {
  const key = dayKey(at);
  const previous = stats.days[key] ?? { sessions: 0, ms: 0 };
  return {
    version: 1,
    days: { ...stats.days, [key]: { sessions: previous.sessions + 1, ms: previous.ms + ms } },
    total: { sessions: stats.total.sessions + 1, ms: stats.total.ms + ms },
  };
}

export function dayStats(stats: StatsStore, key: string): StatsDay {
  return stats.days[key] ?? { sessions: 0, ms: 0 };
}

const PHASES: Phase[] = ["focus", "short", "long"];

export function isPhase(value: unknown): value is Phase {
  return typeof value === "string" && (PHASES as string[]).includes(value);
}

export function isTimerState(value: unknown): value is TimerState {
  if (!value || typeof value !== "object") return false;
  const state = value as Record<string, unknown>;
  return (
    isPhase(state.phase) &&
    (state.endsAt === null || typeof state.endsAt === "number") &&
    (state.pausedMs === null || typeof state.pausedMs === "number") &&
    typeof state.inCycle === "number" &&
    typeof state.completed === "number" &&
    (state.label === null || typeof state.label === "string")
  );
}

export function isStatsStore(value: unknown): value is StatsStore {
  if (!value || typeof value !== "object") return false;
  const store = value as Record<string, unknown>;
  if (store.version !== 1) return false;
  if (!store.total || typeof store.total !== "object") return false;
  if (!store.days || typeof store.days !== "object") return false;
  const total = store.total as Record<string, unknown>;
  if (typeof total.sessions !== "number" || typeof total.ms !== "number") return false;
  return Object.values(store.days as Record<string, unknown>).every((day) => {
    if (!day || typeof day !== "object") return false;
    const entry = day as Record<string, unknown>;
    return typeof entry.sessions === "number" && typeof entry.ms === "number";
  });
}

export { formatClock } from "./time";

export const phaseLabel: Record<Phase, { ar: string; fr: string; en: string }> = {
  focus: { ar: "تركيز", fr: "Concentration", en: "Focus" },
  short: { ar: "راحة قصيرة", fr: "Pause courte", en: "Short break" },
  long: { ar: "راحة طويلة", fr: "Pause longue", en: "Long break" },
};
