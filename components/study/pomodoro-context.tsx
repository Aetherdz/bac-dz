"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { matchRoute, pathFor } from "@/lib/routes";
import { tx } from "@/lib/tx";
import {
  defaultSettings,
  emptyStats,
  freshState,
  isStatsStore,
  isTimerState,
  normalizeSettings,
  pause,
  phaseLabel,
  progress as progressOf,
  recordFocus,
  remainingMs,
  reset,
  restore,
  skip,
  start,
  tick,
  type CompletionEvent,
  type PomodoroSettings,
  type StatsStore,
  type TimerState,
} from "@/lib/study/pomodoro";
import { STORAGE_KEYS, readStored, writeStored, emitStudyChange } from "@/lib/study/store";
import { formatClock } from "@/lib/study/time";
import { IconPause, IconPlay } from "@/components/icons";

/**
 * The public timer API deliberately excludes the ticking values (`remaining`,
 * `progress`). Those live in a second context so a 500ms tick re-renders only
 * the leaves that print a clock or move a ring — never a whole page.
 *
 * Actions / state / settings change on user intent, not on the clock, so
 * anything consuming only this context stays still while the timer runs.
 */
type PomodoroContextValue = {
  state: TimerState;
  settings: PomodoroSettings;
  stats: StatsStore;
  running: boolean;
  ready: boolean;
  start: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  skipPhase: () => void;
  startBlock: (minutes: number, label: string) => void;
  updateSettings: (patch: Partial<PomodoroSettings>) => void;
  enableNotifications: () => Promise<NotificationPermission | "unsupported">;
};

/** Ticking values. Consume this only in leaf nodes that display time. */
export type PomodoroTickValue = { remaining: number; progress: number };

const PomodoroContext = createContext<PomodoroContextValue | null>(null);
const PomodoroTickContext = createContext<PomodoroTickValue | null>(null);

export function usePomodoro(): PomodoroContextValue {
  const value = useContext(PomodoroContext);
  if (!value) throw new Error("usePomodoro must be used inside PomodoroProvider");
  return value;
}

export function usePomodoroTick(): PomodoroTickValue {
  const value = useContext(PomodoroTickContext);
  if (!value) throw new Error("usePomodoroTick must be used inside PomodoroProvider");
  return value;
}

function beep(): void {
  if (typeof window === "undefined") return;
  const AudioCtor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtor) return;
  try {
    const context = new AudioCtor();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = 660;
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.16, context.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.5);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.52);
    oscillator.onended = () => {
      void context.close().catch(() => undefined);
    };
  } catch {
    /* audio is optional */
  }
}

function notify(locale: Locale, event: CompletionEvent): void {
  if (typeof window === "undefined" || typeof Notification === "undefined") return;
  if (Notification.permission !== "granted") return;
  const label = phaseLabel[event.phase];
  const title =
    event.phase === "focus"
      ? tx(locale, { ar: "انتهت جلسة التركيز", fr: "Session de concentration terminée", en: "Focus session finished" })
      : tx(locale, { ar: "انتهت الراحة", fr: "Pause terminée", en: "Break finished" });
  const body = tx(locale, {
    ar: `المرحلة التالية: ${label.ar}.`,
    fr: `Étape suivante : ${label.fr.toLowerCase()}.`,
    en: `Next phase: ${label.en.toLowerCase()}.`,
  });
  try {
    new Notification(title, { body, tag: "bacdz-pomodoro", silent: true });
  } catch {
    /* ignore */
  }
}

/**
 * True on the full timer page, where the mini dock is redundant. Read from the
 * router rather than a string suffix so it works for every locale slug.
 */
function useIsWorkbench(): boolean {
  const pathname = usePathname() ?? "";
  const segments = pathname.split("?")[0].split("/").filter(Boolean).slice(1);
  return matchRoute(segments)?.name === "pomodoro";
}

export function PomodoroProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const [settings, setSettings] = useState<PomodoroSettings>(defaultSettings);
  const [state, setState] = useState<TimerState>(() => freshState());
  const [stats, setStats] = useState<StatsStore>(emptyStats);
  const [ready, setReady] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const stateRef = useRef(state);
  const settingsRef = useRef(settings);
  stateRef.current = state;
  settingsRef.current = settings;

  const persistTimer = useCallback((next: TimerState) => {
    writeStored(STORAGE_KEYS.timer, next);
  }, []);

  const applyEvents = useCallback(
    (events: CompletionEvent[]) => {
      const focusEvents = events.filter((event) => event.phase === "focus");
      if (focusEvents.length > 0) {
        setStats((previous) => {
          let next = previous;
          for (const event of focusEvents) next = recordFocus(next, event.at, event.durationMs);
          writeStored(STORAGE_KEYS.stats, next);
          emitStudyChange(STORAGE_KEYS.stats);
          return next;
        });
      }
      for (const event of events) {
        if (settingsRef.current.sound) beep();
        if (settingsRef.current.notifications) notify(locale, event);
      }
    },
    [locale],
  );

  // Hydrate.
  useEffect(() => {
    const storedSettings = normalizeSettings(readStored<Partial<PomodoroSettings>>(STORAGE_KEYS.settings, {}, (value): value is Partial<PomodoroSettings> => typeof value === "object" && value !== null));
    const storedStats = readStored(STORAGE_KEYS.stats, emptyStats(), isStatsStore);
    const storedTimer = readStored(STORAGE_KEYS.timer, freshState(), isTimerState);
    const moment = Date.now();
    const restored = restore(storedTimer, storedSettings, moment);

    setSettings(storedSettings);
    setStats(storedStats);
    setState(restored.state);
    setNow(moment);
    setReady(true);

    if (restored.event) {
      if (restored.event.phase === "focus") {
        setStats((previous) => {
          const next = recordFocus(previous, restored.event!.at, restored.event!.durationMs);
          writeStored(STORAGE_KEYS.stats, next);
          emitStudyChange(STORAGE_KEYS.stats);
          return next;
        });
      }
      if (storedSettings.sound) beep();
    }
    persistTimer(restored.state);
  }, [persistTimer]);

  // Tick loop: reads wall-clock time, so suspension cannot create drift.
  // While idle or paused the remaining time is constant, so we do not touch
  // state at all — no re-render, no wake-ups that matter.
  useEffect(() => {
    if (!ready) return;
    const advance = () => {
      const current = stateRef.current;
      if (current.endsAt === null) return;
      const moment = Date.now();
      setNow(moment);
      const result = tick(current, settingsRef.current, moment);
      if (result.state === current) return;
      stateRef.current = result.state;
      setState(result.state);
      persistTimer(result.state);
      if (result.events.length > 0) applyEvents(result.events);
    };

    const id = window.setInterval(advance, 500);
    const onVisible = () => {
      if (document.visibilityState === "visible") advance();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", advance);
    advance();
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", advance);
    };
  }, [ready, persistTimer, applyEvents]);

  const commitState = useCallback(
    (next: TimerState) => {
      stateRef.current = next;
      setState(next);
      persistTimer(next);
      setNow(Date.now());
    },
    [persistTimer],
  );

  const startTimer = useCallback(() => {
    commitState(start(stateRef.current, settingsRef.current, Date.now()));
  }, [commitState]);

  const pauseTimer = useCallback(() => {
    commitState(pause(stateRef.current, Date.now()));
  }, [commitState]);

  const resetTimer = useCallback(() => {
    commitState(reset(stateRef.current));
  }, [commitState]);

  const skipPhase = useCallback(() => {
    commitState(skip(stateRef.current, settingsRef.current));
  }, [commitState]);

  const startBlock = useCallback(
    (minutes: number, label: string) => {
      const nextSettings = normalizeSettings({ ...settingsRef.current, focus: minutes });
      settingsRef.current = nextSettings;
      setSettings(nextSettings);
      writeStored(STORAGE_KEYS.settings, nextSettings);
      emitStudyChange(STORAGE_KEYS.settings);
      const base: TimerState = {
        phase: "focus",
        endsAt: null,
        pausedMs: null,
        inCycle: stateRef.current.inCycle,
        completed: stateRef.current.completed,
        label: label.trim() === "" ? null : label.trim().slice(0, 120),
      };
      commitState(start(base, nextSettings, Date.now()));
    },
    [commitState],
  );

  const updateSettings = useCallback((patch: Partial<PomodoroSettings>) => {
    setSettings((previous) => {
      const next = normalizeSettings({ ...previous, ...patch });
      settingsRef.current = next;
      writeStored(STORAGE_KEYS.settings, next);
      emitStudyChange(STORAGE_KEYS.settings);
      return next;
    });
  }, []);

  const enableNotifications = useCallback(async (): Promise<NotificationPermission | "unsupported"> => {
    if (typeof Notification === "undefined") return "unsupported";
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") updateSettings({ notifications: true });
      return permission;
    } catch {
      return "denied";
    }
  }, [updateSettings]);

  const running = state.endsAt !== null;

  const value = useMemo<PomodoroContextValue>(
    () => ({
      state,
      settings,
      stats,
      running,
      ready,
      start: startTimer,
      pauseTimer,
      resetTimer,
      skipPhase,
      startBlock,
      updateSettings,
      enableNotifications,
    }),
    [state, settings, stats, running, ready, startTimer, pauseTimer, resetTimer, skipPhase, startBlock, updateSettings, enableNotifications],
  );

  const tickValue = useMemo<PomodoroTickValue>(
    () => ({
      remaining: remainingMs(state, settings, now),
      progress: progressOf(state, settings, now),
    }),
    [state, settings, now],
  );

  // Keep the dock element stable so the 500ms provider render does not re-run it.
  const dock = useMemo(() => <PomodoroDock locale={locale} />, [locale]);

  return (
    <PomodoroContext.Provider value={value}>
      <PomodoroTickContext.Provider value={tickValue}>
        {children}
        {dock}
      </PomodoroTickContext.Provider>
    </PomodoroContext.Provider>
  );
}

/**
 * Reserves the height the floating dock covers at the bottom of a page, so the
 * last lines of a long article are never trapped behind it. Renders nothing
 * when no session is active and never on desktop (dock sits at the very bottom).
 */
export function PomodoroDockSpacer() {
  const { state, ready } = usePomodoro();
  const isWorkbench = useIsWorkbench();
  const active = ready && (state.endsAt !== null || state.pausedMs !== null);
  if (!active || isWorkbench) return null;
  return <div aria-hidden className="h-20 lg:hidden" />;
}

/** The dock's clock: the only node in the dock that re-renders every tick. */
function DockClock() {
  const { remaining } = usePomodoroTick();
  return (
    <span className="num min-w-[3.5em] text-[17px] font-semibold tabular-nums text-ink" aria-hidden>
      {formatClock(remaining)}
    </span>
  );
}

function PomodoroDock({ locale }: { locale: Locale }) {
  const { state, running, ready, start, pauseTimer } = usePomodoro();
  const isWorkbench = useIsWorkbench();
  const active = state.endsAt !== null || state.pausedMs !== null;

  if (!ready || !active || isWorkbench) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(56px+env(safe-area-inset-bottom))] z-40 pb-2 pt-2 lg:bottom-0 lg:pb-3">
      <div className="shell">
        <div className="pointer-events-auto flex items-center gap-2.5 border border-line-strong bg-surface/95 px-3 py-2 backdrop-blur-sm sm:gap-4 sm:px-4">
          <span aria-hidden className="h-2 w-2 shrink-0 bg-brand" />
          <span className="hidden text-[10.5px] uppercase tracking-[0.16em] text-muted sm:inline">
            {tx(locale, phaseLabel[state.phase])}
          </span>
          <DockClock />
          <div className="ms-auto flex items-center gap-1.5">
            <button
              type="button"
              onClick={running ? pauseTimer : start}
              className="btn btn-sm min-h-11 min-w-11 px-0 sm:min-h-9 sm:min-w-9 sm:px-3"
              aria-label={
                running
                  ? tx(locale, { ar: "إيقاف مؤقت", fr: "Pause", en: "Pause" })
                  : tx(locale, { ar: "متابعة", fr: "Reprendre", en: "Resume" })
              }
            >
              {running ? <IconPause size={14} /> : <IconPlay size={14} />}
            </button>
            <Link
              href={pathFor(locale, { name: "pomodoro" })}
              className="link inline-flex min-h-11 items-center text-[12px] sm:min-h-0"
            >
              {tx(locale, { ar: "افتح المؤقت", fr: "Ouvrir le minuteur", en: "Open timer" })}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
