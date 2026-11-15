import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ALGIERS_TIME_ZONE,
  EXAM_START_HOUR,
  countdownTarget,
  examSessions,
  examTimestamp,
} from "../.test-build/content/exam-dates.mjs";

/**
 * These tests exercise the real study engine compiled by
 * `scripts/test-build.mjs`. Every timestamp is explicit, so no assertion
 * depends on the machine clock or on a fake-timer library.
 */
import {
  clampMinutes,
  dayStats,
  defaultSettings,
  durationMs,
  emptyStats,
  freshState,
  isStatsStore,
  isTimerState,
  normalizeSettings,
  pause,
  progress,
  recordFocus,
  remainingMs,
  reset,
  restore,
  skip,
  start,
  tick,
} from "../.test-build/lib/study/pomodoro.mjs";
import {
  addDays,
  computeStreak,
  dayKey,
  daysBetween,
  formatClock,
  keyToDate,
  recentDays,
  startOfAlgiersDay,
  weekdayIndex,
} from "../.test-build/lib/study/time.mjs";
import {
  createTask,
  emptyTasks,
  isTaskStore,
  sortTasks,
  taskProgress,
  tasksForDay,
  weeklyTaskMinutes,
} from "../.test-build/lib/study/tasks.mjs";
import {
  createSession,
  dateOfWeekday,
  emptyPlanner,
  endTime,
  isPlannerStore,
  isSessionDone,
  isValidTime,
  minutesFromTime,
  sessionsForDay,
  timeFromMinutes,
  weekProgress,
  weeklyMinutes,
} from "../.test-build/lib/study/planner.mjs";

const MIN = 60_000;
/** Monday 2026-01-05, 10:00 in Algiers. */
const T0 = Date.UTC(2026, 0, 5, 9, 0, 0);
/** Wednesday 2026-01-07, 11:00 in Algiers. */
const TODAY = Date.UTC(2026, 0, 7, 10, 0, 0);
const settings = { ...defaultSettings };

/* ─────────────────────────────── timer core ─────────────────────────────── */

test("a fresh phase reports its full duration and a running phase counts down without mutating state", () => {
  const fresh = freshState();
  assert.equal(remainingMs(fresh, settings, T0), 25 * MIN);

  const running = start(fresh, settings, T0);
  assert.equal(running.endsAt, T0 + 25 * MIN);
  assert.equal(remainingMs(running, settings, T0), 25 * MIN);
  assert.equal(remainingMs(running, settings, T0 + MIN), 24 * MIN);
  assert.equal(remainingMs(running, settings, T0 + 12 * MIN + 30_000), 12 * MIN + 30_000);
  assert.equal(remainingMs(running, settings, T0 + 25 * MIN), 0);
  assert.equal(remainingMs(running, settings, T0 + 40 * MIN), 0);

  // Reading the clock never rewrites the deadline: zero internal drift.
  assert.equal(running.endsAt, T0 + 25 * MIN);
  assert.deepEqual(running, start(fresh, settings, T0));
  // An untouched fresh state stays full.
  assert.equal(remainingMs(fresh, settings, T0 + 90 * MIN), 25 * MIN);

  assert.equal(durationMs("focus", settings), 25 * MIN);
  assert.equal(durationMs("short", settings), 5 * MIN);
  assert.equal(durationMs("long", settings), 15 * MIN);
});

test("pause and resume are exact: the paused remainder is preserved, not restarted from the duration", () => {
  const running = start(freshState(), settings, T0);
  const paused = pause(running, T0 + 90_000);

  assert.equal(paused.endsAt, null);
  assert.equal(paused.pausedMs, 25 * MIN - 90_000);
  assert.equal(remainingMs(paused, settings, T0 + 90_000), 25 * MIN - 90_000);
  assert.equal(remainingMs(paused, settings, T0 + 30 * MIN), 25 * MIN - 90_000);

  const resumedAt = T0 + 10 * MIN;
  const resumed = start(paused, settings, resumedAt);
  const expectedRemaining = 25 * MIN - 90_000;
  assert.equal(resumed.endsAt, resumedAt + expectedRemaining);
  assert.notEqual(resumed.endsAt, T0 + 25 * MIN);
  assert.equal(remainingMs(resumed, settings, resumedAt), expectedRemaining);
  assert.equal(resumed.pausedMs, null);

  // Starting an already running timer is a no-op.
  assert.equal(start(resumed, settings, resumedAt + MIN), resumed);
});

test("a long suspension replays exactly one completion at the original deadline, so drift is zero", () => {
  const running = start(freshState(), settings, T0);
  const deadline = running.endsAt;
  assert.equal(deadline, T0 + 25 * MIN);

  const { state, events } = tick(running, settings, deadline + MIN);

  assert.equal(events.length, 1);
  assert.equal(events[0].phase, "focus");
  assert.equal(events[0].at, deadline);
  assert.equal(events[0].durationMs, 25 * MIN);
  assert.equal(state.phase, "short");
  assert.equal(state.completed, 1);
  assert.equal(state.inCycle, 1);
  // The break starts at the original deadline, not at the wake-up instant.
  assert.equal(state.endsAt, deadline + 5 * MIN);

  // Still inside the break: no further completion.
  const later = tick(running, settings, deadline + 4 * MIN);
  assert.equal(later.events.length, 1);
  assert.equal(later.state.endsAt, deadline + 5 * MIN);
});

test("a two-hour gap replays the full 25/5 chain and lands on the long break after the fourth focus", () => {
  const { state, events } = tick(start(freshState(), settings, T0), settings, T0 + 120 * MIN);

  assert.equal(events.length, 7);
  assert.deepEqual(
    events.map((event) => event.phase),
    ["focus", "short", "focus", "short", "focus", "short", "focus"],
  );
  assert.deepEqual(
    events.map((event) => (event.at - T0) / MIN),
    [25, 30, 55, 60, 85, 90, 115],
  );
  assert.deepEqual(
    events.map((event) => event.durationMs),
    [25 * MIN, 5 * MIN, 25 * MIN, 5 * MIN, 25 * MIN, 5 * MIN, 25 * MIN],
  );

  assert.equal(events.filter((event) => event.phase === "focus").length, 4);
  assert.equal(state.phase, "long");
  assert.equal(state.completed, 4);
  assert.equal(state.inCycle, 4);
  assert.equal(state.endsAt, T0 + 115 * MIN + 15 * MIN);
  assert.equal(remainingMs(state, settings, T0 + 120 * MIN), 10 * MIN);
});

test("autoStart false stops after a single completion and leaves the next phase ready", () => {
  const manual = { ...settings, autoStart: false };
  const { state, events } = tick(start(freshState(), manual, T0), manual, T0 + 25 * MIN + MIN);

  assert.equal(events.length, 1);
  assert.equal(state.phase, "short");
  assert.equal(state.endsAt, null);
  assert.equal(state.pausedMs, null);
  assert.equal(state.completed, 1);
  assert.equal(state.inCycle, 1);
  // The break is ready to start manually at its full duration.
  assert.equal(remainingMs(state, manual, T0 + 90 * MIN), 5 * MIN);
  assert.equal(tick(state, manual, T0 + 24 * 60 * MIN).events.length, 0);
});

test("the long break arrives on the fourth focus completion and the cycle restarts afterwards", () => {
  let state = start({ ...freshState(), label: "Revision" }, settings, T0);
  const transitions = [];

  for (let index = 0; index < 9; index += 1) {
    state = tick(state, settings, state.endsAt).state;
    transitions.push({ phase: state.phase, completed: state.completed, inCycle: state.inCycle });
  }

  assert.deepEqual(
    transitions.map((entry) => entry.phase),
    ["short", "focus", "short", "focus", "short", "focus", "long", "focus", "short"],
  );
  assert.deepEqual(
    transitions.map((entry) => entry.completed),
    [1, 1, 2, 2, 3, 3, 4, 4, 5],
  );
  // The long break follows the fourth completion, not the third.
  assert.equal(transitions[5].completed, 3);
  assert.equal(transitions[5].phase, "focus");
  assert.equal(transitions[6].phase, "long");
  assert.equal(transitions[6].inCycle, 4);
  // Finishing the long break closes the cycle, then a focus reopens it.
  assert.equal(transitions[7].phase, "focus");
  assert.equal(transitions[7].inCycle, 0);
  assert.equal(transitions[8].phase, "short");
  assert.equal(transitions[8].inCycle, 1);
});

test("skipping advances the phase but never credits a session", () => {
  const fresh = {...freshState(), label: "Maths"};
  const skipped = skip(fresh, settings);

  assert.equal(skipped.phase, "short");
  assert.equal(skipped.endsAt, null);
  assert.equal(skipped.completed, 0);
  assert.equal(skipped.inCycle, 0);
  assert.equal(skipped.label, null);

  const backToFocus = skip(skipped, settings);
  assert.equal(backToFocus.phase, "focus");
  assert.equal(backToFocus.completed, 0);
  assert.equal(backToFocus.inCycle, 0);

  const running = start(freshState(), settings, T0);
  const skippedWhileRunning = skip(running, settings);
  assert.equal(skippedWhileRunning.endsAt, null);
  assert.equal(skippedWhileRunning.pausedMs, null);
  assert.equal(skippedWhileRunning.completed, 0);
  assert.equal(skippedWhileRunning.inCycle, 0);

  // A skipped focus at the end of a cycle opens the long break, still uncredited.
  const lastOfCycle = skip({ ...freshState(), phase: "focus", inCycle: settings.longEvery }, settings);
  assert.equal(lastOfCycle.phase, "long");
  assert.equal(lastOfCycle.inCycle, settings.longEvery);
  assert.equal(lastOfCycle.completed, 0);
});

test("reset clears the running deadline but keeps lifetime counters", () => {
  const running = { ...start(freshState(), settings, T0), completed: 12, inCycle: 3, label: "Physique" };
  const cleared = reset(running);

  assert.equal(cleared.phase, "focus");
  assert.equal(cleared.endsAt, null);
  assert.equal(cleared.pausedMs, null);
  assert.equal(cleared.label, null);
  assert.equal(cleared.completed, 12);
  assert.equal(cleared.inCycle, 3);
});

test("restore credits at most one phase for a deadline that passed while the site was closed", () => {
  const running = start(freshState(), settings, T0);
  const early = restore(running, settings, running.endsAt - 1);
  assert.equal(early.event, null);
  assert.equal(early.state, running);

  const { state, event } = restore(running, settings, T0 + 10 * 60 * MIN);
  assert.equal(event.phase, "focus");
  assert.equal(event.at, running.endsAt);
  assert.equal(state.completed, 1);
  assert.equal(state.inCycle, 1);
  assert.equal(state.phase, "short");
  // Restored phases are never auto-started, even with autoStart on.
  assert.equal(state.endsAt, null);
  assert.equal(state.pausedMs, null);

  const breakRunning = start({ ...freshState(), phase: "short" }, settings, T0);
  const savedBreak = restore(breakRunning, settings, T0 + 6 * MIN);
  assert.equal(savedBreak.event.phase, "short");
  assert.equal(savedBreak.state.phase, "focus");
  assert.equal(savedBreak.state.completed, 0);
  assert.equal(savedBreak.state.inCycle, 0);
  assert.equal(savedBreak.state.endsAt, null);

  const paused = pause(running, T0 + MIN);
  assert.equal(restore(paused, settings, T0 + 60 * MIN).event, null);
});

test("progress tracks elapsed time, saturates at the bounds and freezes while paused", () => {
  assert.equal(progress(freshState(), settings, T0), 0);

  const running = start(freshState(), settings, T0);
  assert.equal(progress(running, settings, T0), 0);
  assert.equal(progress(running, settings, T0 + 12 * MIN + 30_000), 0.5);
  assert.equal(progress(running, settings, T0 + 25 * MIN), 1);
  assert.equal(progress(running, settings, T0 + 40 * MIN), 1);

  const frozen = progress(pause(running, T0 + 90_000), settings, T0 + 30 * MIN);
  assert.ok(Math.abs(frozen - 0.06) < 1e-12, `expected 0.06, got ${frozen}`);
});

/* ──────────────────────────────── settings ──────────────────────────────── */

test("normalizeSettings clamps out-of-range values and defaults the booleans", () => {
  const clamped = normalizeSettings({
    focus: 999,
    short: 0,
    long: 1,
    longEvery: 99,
    autoStart: false,
    sound: false,
    notifications: true,
  });

  assert.equal(clamped.focus, 120);
  assert.equal(clamped.short, 1);
  assert.equal(clamped.long, 5);
  assert.equal(clamped.longEvery, 8);
  assert.equal(clamped.autoStart, false);
  assert.equal(clamped.sound, false);
  assert.equal(clamped.notifications, true);

  assert.deepEqual(normalizeSettings({}), { ...defaultSettings });
  assert.deepEqual(normalizeSettings(null), { ...defaultSettings });
  assert.deepEqual(normalizeSettings(undefined), { ...defaultSettings });

  const partial = normalizeSettings({ focus: 50 });
  assert.equal(partial.focus, 50);
  assert.equal(partial.autoStart, defaultSettings.autoStart);
  assert.equal(partial.sound, defaultSettings.sound);
  assert.equal(partial.notifications, defaultSettings.notifications);
  // Non-boolean values do not silently become truthy.
  assert.equal(normalizeSettings({ autoStart: "no" }).autoStart, defaultSettings.autoStart);
});

test("clampMinutes rounds, clamps to the range and falls back for non-finite input", () => {
  assert.equal(clampMinutes(999, 1, 120, 25), 120);
  assert.equal(clampMinutes(0, 1, 120, 25), 1);
  assert.equal(clampMinutes(12.6, 1, 120, 25), 13);
  assert.equal(clampMinutes("30", 1, 120, 25), 30);
  assert.equal(clampMinutes(Number.NaN, 1, 120, 25), 25);
  assert.equal(clampMinutes(Number.POSITIVE_INFINITY, 1, 120, 25), 25);
});

test("isTimerState accepts real states and rejects malformed payloads", () => {
  assert.equal(isTimerState(freshState()), true);
  assert.equal(isTimerState(start(freshState(), settings, T0)), true);

  assert.equal(isTimerState(null), false);
  assert.equal(isTimerState(undefined), false);
  assert.equal(isTimerState("focus"), false);
  assert.equal(isTimerState({ ...freshState(), phase: "break" }), false);
  assert.equal(isTimerState({ ...freshState(), endsAt: "soon" }), false);
  assert.equal(isTimerState({ ...freshState(), completed: "3" }), false);
  assert.equal(isTimerState({ ...freshState(), label: 42 }), false);
});

/* ────────────────────────────────── stats ───────────────────────────────── */

test("recordFocus accumulates sessions and milliseconds per Algiers day without mutating its input", () => {
  const empty = emptyStats();
  const first = recordFocus(empty, T0, 25 * MIN);
  const second = recordFocus(first, T0 + 30 * MIN, 5 * MIN);

  assert.deepEqual(empty, { version: 1, days: {}, total: { sessions: 0, ms: 0 } });
  assert.deepEqual(first.days["2026-01-05"], { sessions: 1, ms: 25 * MIN });
  assert.deepEqual(second.days["2026-01-05"], { sessions: 2, ms: 30 * MIN });
  assert.deepEqual(second.total, { sessions: 2, ms: 30 * MIN });

  // 23:30 UTC is already the next day in Algiers.
  const late = recordFocus(empty, Date.UTC(2026, 0, 5, 23, 30), 25 * MIN);
  assert.deepEqual(late.days["2026-01-06"], { sessions: 1, ms: 25 * MIN });
  assert.equal(late.days["2026-01-05"], undefined);
  assert.deepEqual(late.total, { sessions: 1, ms: 25 * MIN });
});

test("dayStats returns zeros for days without activity and isStatsStore rejects junk", () => {
  const stats = recordFocus(emptyStats(), T0, 25 * MIN);
  assert.deepEqual(dayStats(stats, "2026-01-05"), { sessions: 1, ms: 25 * MIN });
  assert.deepEqual(dayStats(stats, "2026-01-06"), { sessions: 0, ms: 0 });
  assert.deepEqual(dayStats(emptyStats(), "1999-12-31"), { sessions: 0, ms: 0 });

  assert.equal(isStatsStore(stats), true);
  assert.equal(isStatsStore(emptyStats()), true);

  assert.equal(isStatsStore(null), false);
  assert.equal(isStatsStore(undefined), false);
  assert.equal(isStatsStore({ version: 2, days: {}, total: { sessions: 0, ms: 0 } }), false);
  assert.equal(isStatsStore({ version: 1, days: {} }), false);
  assert.equal(isStatsStore({ version: 1, days: {}, total: { sessions: "0", ms: 0 } }), false);
  assert.equal(isStatsStore({ version: 1, days: { "2026-01-05": { sessions: 1 } }, total: { sessions: 1, ms: 0 } }), false);
  assert.equal(isStatsStore({ version: 1, days: { "2026-01-05": null }, total: { sessions: 1, ms: 0 } }), false);
  assert.equal(isStatsStore({ version: 1, days: { "2026-01-05": { sessions: 1, ms: "0" } }, total: { sessions: 1, ms: 0 } }), false);
});

/* ────────────────────────────────── time ───────────────────────────────── */

test("dayKey answers in Algiers time, including across the UTC midnight boundary", () => {
  // 23:30 UTC is already 00:30 the next day in Algiers (UTC+1, no DST).
  assert.equal(dayKey(Date.UTC(2026, 0, 5, 23, 30)), "2026-01-06");
  assert.equal(dayKey(Date.UTC(2026, 0, 5, 22, 59)), "2026-01-05");
  assert.equal(dayKey(Date.UTC(2026, 0, 5, 23, 0)), "2026-01-06");
  assert.equal(dayKey(Date.UTC(2026, 6, 5, 12, 0)), "2026-07-05");
});

test("addDays and daysBetween handle month ends and year changes", () => {
  assert.equal(addDays("2026-01-31", 1), "2026-02-01");
  assert.equal(addDays("2026-02-28", 1), "2026-03-01");
  assert.equal(addDays("2026-12-31", 1), "2027-01-01");
  assert.equal(addDays("2026-03-01", -1), "2026-02-28");
  assert.equal(addDays("2026-01-05", 0), "2026-01-05");

  assert.equal(daysBetween("2026-01-31", "2026-02-01"), 1);
  assert.equal(daysBetween("2026-02-01", "2026-01-31"), -1);
  assert.equal(daysBetween("2026-01-01", "2026-12-31"), 364);
  assert.equal(daysBetween("2026-01-01", "2027-01-01"), 365);
  assert.equal(daysBetween("2026-01-05", "2026-01-05"), 0);
});

test("recentDays returns the last days oldest first and keyToDate is a safe noon date", () => {
  assert.deepEqual(recentDays(3, T0), ["2026-01-03", "2026-01-04", "2026-01-05"]);
  assert.deepEqual(recentDays(1, T0), ["2026-01-05"]);
  assert.equal(keyToDate("2026-01-05").toISOString(), "2026-01-05T12:00:00.000Z");
  assert.equal(keyToDate("2026-12-31").getTime(), Date.UTC(2026, 11, 31, 12));
});

test("computeStreak counts today or yesterday anchors and breaks on the first gap", () => {
  assert.equal(computeStreak(["2026-01-05", "2026-01-04", "2026-01-03"], T0), 3);
  // Today is still empty: the streak is anchored on yesterday.
  assert.equal(computeStreak(["2026-01-04", "2026-01-03"], T0), 2);
  // A gap after today's activity stops the count at one.
  assert.equal(computeStreak(["2026-01-05", "2026-01-03"], T0), 1);
  // A missing yesterday ends the streak even if older days exist.
  assert.equal(computeStreak(["2026-01-03", "2026-01-02"], T0), 0);
  assert.equal(computeStreak([], T0), 0);
  // Duplicates do not inflate the streak.
  assert.equal(computeStreak(["2026-01-05", "2026-01-05", "2026-01-04"], T0), 2);
});

test("formatClock prints mm:ss below an hour and h:mm:ss above it", () => {
  assert.equal(formatClock(25 * MIN), "25:00");
  assert.equal(formatClock(5 * MIN + 9_000), "05:09");
  assert.equal(formatClock(3_723_000), "1:02:03");
  assert.equal(formatClock(0), "00:00");
  assert.equal(formatClock(-1_000), "00:00");
  // Partial seconds round up so a timer never shows 00:00 while time remains.
  assert.equal(formatClock(1), "00:01");
  assert.equal(formatClock(1_000), "00:01");
});

test("weekdayIndex is Sunday-based and startOfAlgiersDay returns local midnight", () => {
  assert.equal(weekdayIndex("2026-01-04"), 0); // Sunday
  assert.equal(weekdayIndex("2026-01-05"), 1); // Monday
  assert.equal(weekdayIndex("2026-01-10"), 6); // Saturday
  assert.equal(weekdayIndex("2026-01-11"), 0); // Sunday

  // 00:00 Algiers on 2026-01-06 is 23:00 UTC on 2026-01-05.
  assert.equal(startOfAlgiersDay("2026-01-06"), Date.UTC(2026, 0, 5, 23, 0));
  assert.equal(startOfAlgiersDay("2026-01-05"), Date.UTC(2026, 0, 4, 23, 0));
});

/* ────────────────────────────────── tasks ───────────────────────────────── */

const task = (overrides) => ({
  id: "t",
  title: "Task",
  subject: "maths",
  lesson: "",
  priority: "normal",
  estimateMin: 30,
  day: "2026-01-05",
  doneOn: null,
  createdAt: 0,
  ...overrides,
});

test("createTask trims and clamps its input and rejects an empty title", () => {
  const created = createTask(
    {
      title: "  Réviser les maths  ",
      subject: "  Mathématiques  ",
      lesson: "  Dérivées  ",
      priority: "high",
      estimateMin: 999,
      day: "2026-01-05",
    },
    T0,
  );

  assert.equal(created.title, "Réviser les maths");
  assert.equal(created.subject, "Mathématiques");
  assert.equal(created.lesson, "Dérivées");
  assert.equal(created.priority, "high");
  assert.equal(created.estimateMin, 480);
  assert.equal(created.day, "2026-01-05");
  assert.equal(created.doneOn, null);
  assert.equal(created.createdAt, T0);
  assert.equal(typeof created.id, "string");

  const minimal = createTask({ title: "x", estimateMin: 1 }, T0);
  assert.equal(minimal.estimateMin, 5);
  assert.equal(minimal.priority, "normal");
  assert.equal(minimal.lesson, "");
  assert.equal(minimal.subject, "");
  assert.equal(createTask({ title: "x" }, T0).estimateMin, 30);
  // Missing or malformed day falls back to the Algiers day of `now`.
  assert.equal(createTask({ title: "x", day: "05/01/2026" }, T0).day, "2026-01-05");

  assert.equal(createTask({ title: "   " }, T0), null);
  assert.equal(createTask({ title: "a".repeat(200) }, T0).title.length, 160);
  assert.equal(createTask({ title: "a", subject: "b".repeat(100) }, T0).subject.length, 80);
  assert.equal(createTask({ title: "a", lesson: "c".repeat(200) }, T0).lesson.length, 160);
});

test("tasksForDay filters by day and taskProgress handles empty days", () => {
  assert.deepEqual(emptyTasks(), { version: 1, tasks: [] });

  const store = {
    version: 1,
    tasks: [
      task({ id: "a", day: "2026-01-05" }),
      task({ id: "b", day: "2026-01-05", doneOn: "2026-01-05" }),
      task({ id: "c", day: "2026-01-05", doneOn: "2026-01-06" }),
      task({ id: "d", day: "2026-01-06" }),
    ],
  };

  assert.deepEqual(tasksForDay(store, "2026-01-05").map((entry) => entry.id), ["a", "b", "c"]);
  assert.deepEqual(tasksForDay(store, "2026-01-07"), []);

  // Only tasks completed on that same day count, so "c" (done later) does not.
  assert.equal(taskProgress(store, "2026-01-05"), 33);
  assert.equal(taskProgress(emptyTasks(), "2026-01-05"), 0);
});

test("sortTasks puts open high-priority tasks first, done tasks last, then estimate and age", () => {
  const input = [
    task({ id: "done-high", priority: "high", doneOn: "2026-01-05", estimateMin: 10 }),
    task({ id: "low", priority: "low", estimateMin: 30 }),
    task({ id: "high-late", priority: "high", estimateMin: 60, createdAt: 30 }),
    task({ id: "normal", priority: "normal", estimateMin: 30 }),
    task({ id: "high-early", priority: "high", estimateMin: 20, createdAt: 10 }),
    task({ id: "high-early-older", priority: "high", estimateMin: 20, createdAt: 5 }),
  ];

  assert.deepEqual(
    sortTasks(input).map((entry) => entry.id),
    ["high-early-older", "high-early", "high-late", "normal", "low", "done-high"],
  );
  // The input order is untouched.
  assert.deepEqual(
    input.map((entry) => entry.id),
    ["done-high", "low", "high-late", "normal", "high-early", "high-early-older"],
  );
});

test("weeklyTaskMinutes sums only tasks completed on the requested days", () => {
  const store = {
    version: 1,
    tasks: [
      task({ id: "a", day: "2026-01-05", doneOn: "2026-01-05", estimateMin: 30 }),
      task({ id: "b", day: "2026-01-05", doneOn: "2026-01-05", estimateMin: 45 }),
      task({ id: "c", day: "2026-01-05", doneOn: null, estimateMin: 20 }),
      task({ id: "d", day: "2026-01-06", doneOn: "2026-01-06", estimateMin: 60 }),
      task({ id: "e", day: "2026-01-07", doneOn: null, estimateMin: 90 }),
      // Completed outside the requested window: ignored.
      task({ id: "f", day: "2026-01-04", doneOn: "2026-01-04", estimateMin: 15 }),
    ],
  };

  assert.deepEqual(weeklyTaskMinutes(store, ["2026-01-05", "2026-01-06", "2026-01-07"]), {
    "2026-01-05": 75,
    "2026-01-06": 60,
    "2026-01-07": 0,
  });
});

test("isTaskStore accepts real stores and rejects malformed items", () => {
  assert.equal(isTaskStore(emptyTasks()), true);
  assert.equal(isTaskStore({ version: 1, tasks: [createTask({ title: "Maths" }, T0)] }), true);

  assert.equal(isTaskStore(null), false);
  assert.equal(isTaskStore(undefined), false);
  assert.equal(isTaskStore({ version: 2, tasks: [] }), false);
  assert.equal(isTaskStore({ version: 1 }), false);
  assert.equal(isTaskStore({ version: 1, tasks: {} }), false);
  assert.equal(isTaskStore({ version: 1, tasks: [{ ...task({}), lesson: undefined }] }), false);
  assert.equal(isTaskStore({ version: 1, tasks: [{ ...task({}), estimateMin: "30" }] }), false);
  assert.equal(isTaskStore({ version: 1, tasks: [{ ...task({}), priority: "urgent" }] }), false);
  assert.equal(isTaskStore({ version: 1, tasks: [{ ...task({}), doneOn: 0 }] }), false);
  assert.equal(isTaskStore({ version: 1, tasks: [{ ...task({}), createdAt: "now" }] }), false);
  assert.equal(isTaskStore({ version: 1, tasks: [null] }), false);
});

/* ───────────────────────────────── planner ──────────────────────────────── */

test("isValidTime accepts every real 24h time and rejects the rest", () => {
  assert.equal(isValidTime("00:00"), true);
  assert.equal(isValidTime("23:59"), true);
  assert.equal(isValidTime("09:05"), true);
  assert.equal(isValidTime("7:00"), false);
  assert.equal(isValidTime("24:00"), false);
  assert.equal(isValidTime("12:60"), false);
  assert.equal(isValidTime("12:5"), false);
  assert.equal(isValidTime(""), false);
});

test("endTime wraps past midnight", () => {
  assert.equal(endTime("23:30", 45), "00:15");
  assert.equal(endTime("23:00", 120), "01:00");
  assert.equal(endTime("07:00", 60), "08:00");
  assert.equal(endTime("23:59", 1), "00:00");
});

test("sessionsForDay filters by weekday and sorts by start time", () => {
  const store = {
    version: 1,
    sessions: [
      { ...createSession({ weekday: 3, start: "18:00", minutes: 60, subject: "Maths" }), id: "evening" },
      { ...createSession({ weekday: 3, start: "08:30", minutes: 60, subject: "Physique" }), id: "morning" },
      { ...createSession({ weekday: 3, start: "12:00", minutes: 60, subject: "Arabe" }), id: "noon" },
      { ...createSession({ weekday: 5, start: "09:00", minutes: 60, subject: "Anglais" }), id: "other-day" },
    ],
  };

  assert.deepEqual(sessionsForDay(store, 3).map((session) => session.id), ["morning", "noon", "evening"]);
  assert.deepEqual(sessionsForDay(store, 0), []);
  assert.equal(weeklyMinutes(store), 240);
});

test("minutesFromTime and timeFromMinutes round-trip and normalise out-of-range totals", () => {
  for (const value of ["00:00", "07:30", "12:00", "23:59"]) {
    assert.equal(timeFromMinutes(minutesFromTime(value)), value);
  }

  assert.equal(minutesFromTime("23:59"), 1_439);
  assert.equal(minutesFromTime("24:00"), 0);
  assert.equal(timeFromMinutes(1_440), "00:00");
  assert.equal(timeFromMinutes(1_500), "01:00");
  assert.equal(timeFromMinutes(-30), "23:30");
});

test("dateOfWeekday maps a Sunday-based weekday onto the current week in Algiers", () => {
  // TODAY is Wednesday 2026-01-07; the Sunday-based week runs 2026-01-04 … 2026-01-10.
  assert.equal(dateOfWeekday(0, TODAY), "2026-01-04");
  assert.equal(dateOfWeekday(1, TODAY), "2026-01-05");
  assert.equal(dateOfWeekday(3, TODAY), "2026-01-07");
  assert.equal(dateOfWeekday(6, TODAY), "2026-01-10");
});

test("isSessionDone and weekProgress only credit sessions completed on their own weekday date", () => {
  const doneMonday = { ...createSession({ weekday: 1, start: "18:00", minutes: 60, subject: "Maths" }), doneOn: "2026-01-05" };
  const staleMonday = { ...createSession({ weekday: 1, start: "19:00", minutes: 60, subject: "Maths" }), doneOn: "2025-12-29" };
  const doneTuesday = { ...createSession({ weekday: 2, start: "17:00", minutes: 60, subject: "Physique" }), doneOn: "2026-01-06" };
  const openThursday = { ...createSession({ weekday: 4, start: "16:00", minutes: 60, subject: "Arabe" }) };

  assert.equal(isSessionDone(doneMonday, "2026-01-05"), true);
  assert.equal(isSessionDone(doneMonday, "2026-01-06"), false);
  assert.equal(isSessionDone(openThursday, "2026-01-08"), false);
  assert.equal(isSessionDone(openThursday, dayKey(TODAY)), false);

  assert.deepEqual(weekProgress({ version: 1, sessions: [doneMonday, staleMonday, doneTuesday, openThursday] }, TODAY), {
    done: 2,
    total: 4,
    percent: 50,
  });
  assert.deepEqual(weekProgress(emptyPlanner(), TODAY), { done: 0, total: 0, percent: 0 });
});

test("createSession clamps its inputs, rejects invalid slots and isPlannerStore guards the store", () => {
  const session = createSession({ weekday: 3, start: "08:00", minutes: 999, subject: "  Maths  ", lesson: "  Limites  " });
  assert.equal(session.weekday, 3);
  assert.equal(session.start, "08:00");
  assert.equal(session.minutes, 300);
  assert.equal(session.subject, "Maths");
  assert.equal(session.lesson, "Limites");
  assert.equal(session.doneOn, null);

  assert.equal(createSession({ weekday: 0, start: "08:00", minutes: 5, subject: "SVT" }).minutes, 10);
  assert.equal(createSession({ weekday: 0, start: "08:00", minutes: Number.NaN, subject: "SVT" }).minutes, 45);

  assert.equal(createSession({ weekday: 9, start: "08:00", minutes: 60 }), null);
  assert.equal(createSession({ weekday: 1.5, start: "08:00", minutes: 60 }), null);
  assert.equal(createSession({ weekday: 2, start: "7:00", minutes: 60 }), null);
  assert.equal(createSession({ weekday: 2, start: "24:00", minutes: 60 }), null);

  assert.equal(isPlannerStore(emptyPlanner()), true);
  assert.equal(isPlannerStore({ version: 1, sessions: [session] }), true);

  assert.equal(isPlannerStore(null), false);
  assert.equal(isPlannerStore({ version: 2, sessions: [] }), false);
  assert.equal(isPlannerStore({ version: 1 }), false);
  assert.equal(isPlannerStore({ version: 1, sessions: [{ ...session, weekday: 7 }] }), false);
  assert.equal(isPlannerStore({ version: 1, sessions: [{ ...session, start: "24:00" }] }), false);
  assert.equal(isPlannerStore({ version: 1, sessions: [{ ...session, minutes: "60" }] }), false);
  assert.equal(isPlannerStore({ version: 1, sessions: [{ ...session, lesson: undefined }] }), false);
  assert.equal(isPlannerStore({ version: 1, sessions: [null] }), false);
});

/**
 * The countdown must always run: an official date when one exists, otherwise a
 * stated estimate. These tests pin the honesty rules of that fallback.
 */
test("countdownTarget prefers the official date and falls back to a Sunday-in-June estimate", () => {
  const session = examSessions[0];

  // The estimate is a real calendar fact, not a magic string.
  const estimate = session.estimatedStartsOn;
  assert.match(estimate, /^\d{4}-\d{2}-\d{2}$/);
  const estimateDate = new Date(`${estimate}T12:00:00Z`);
  assert.equal(estimateDate.getUTCMonth(), 5, "estimate must land in June");
  assert.equal(estimateDate.getUTCDay(), 0, "estimate must be a Sunday");
  assert.equal(estimate.slice(0, 4), "2027");

  // Without an official date the countdown targets the estimate and says so.
  const chosen = countdownTarget({ ...session, startsOn: null });
  assert.equal(chosen.kind, "estimated");
  assert.equal(chosen.iso, estimate);

  // As soon as an official date exists it wins, and the kind says "official".
  const official = countdownTarget({ ...session, startsOn: "2027-06-13" });
  assert.equal(official.kind, "official");
  assert.equal(official.iso, "2027-06-13");

  // The estimate is never presented as the official date.
  assert.notEqual(session.startsOn, session.estimatedStartsOn);

  // A session with neither date reports null, so callers can render a real
  // waiting state instead of inventing a number.
  assert.equal(countdownTarget({ ...session, startsOn: null, estimatedStartsOn: null }).iso, null);
});

test("examTimestamp pins the start hour to 08:00 Algiers time", () => {
  assert.equal(examTimestamp("2027-06-06"), new Date("2027-06-06T08:00:00+01:00").getTime());
  assert.equal(ALGIERS_TIME_ZONE, "Africa/Algiers");
  assert.equal(EXAM_START_HOUR, "08:00");
});
