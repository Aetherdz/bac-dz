/**
 * Daily task model. Estimates are minutes; completion is a day key so weekly
 * statistics never depend on the device clock being correct at render time.
 */

import { dayKey } from "./time";

export type Priority = "low" | "normal" | "high";

export type StudyTask = {
  id: string;
  title: string;
  /** Subject id from content/bac, or free text for "other". */
  subject: string;
  lesson: string;
  priority: Priority;
  estimateMin: number;
  /** Algiers day key this task is planned for. */
  day: string;
  /** Algiers day key the task was completed on, or null. */
  doneOn: string | null;
  createdAt: number;
};

export type TaskStore = { version: 1; tasks: StudyTask[] };

const PRIORITIES: Priority[] = ["low", "normal", "high"];
const MIN_ESTIMATE = 5;
const MAX_ESTIMATE = 480;

export function emptyTasks(): TaskStore {
  return { version: 1, tasks: [] };
}

export function isPriority(value: unknown): value is Priority {
  return typeof value === "string" && (PRIORITIES as string[]).includes(value);
}

export function clampEstimate(value: unknown, fallback = 30): number {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(MAX_ESTIMATE, Math.max(MIN_ESTIMATE, Math.round(parsed)));
}

function newId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `t-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export type TaskInput = {
  title: string;
  subject?: string;
  lesson?: string;
  priority?: Priority;
  estimateMin?: number;
  day?: string;
};

/** Create a normalised task. An empty title is rejected by returning null. */
export function createTask(input: TaskInput, now: number = Date.now()): StudyTask | null {
  const title = input.title.trim();
  if (!title) return null;
  return {
    id: newId(),
    title: title.slice(0, 160),
    subject: (input.subject ?? "").trim().slice(0, 80),
    lesson: (input.lesson ?? "").trim().slice(0, 160),
    priority: isPriority(input.priority) ? input.priority : "normal",
    estimateMin: clampEstimate(input.estimateMin, 30),
    day: input.day && /^\d{4}-\d{2}-\d{2}$/.test(input.day) ? input.day : dayKey(now),
    doneOn: null,
    createdAt: now,
  };
}

export function tasksForDay(store: TaskStore, day: string = dayKey()): StudyTask[] {
  return store.tasks.filter((task) => task.day === day);
}

/** Completion percentage for a day: 0..100, and 0 when there is no task. */
export function taskProgress(store: TaskStore, day: string = dayKey()): number {
  const tasks = tasksForDay(store, day);
  if (tasks.length === 0) return 0;
  const done = tasks.filter((task) => task.doneOn === day).length;
  return Math.round((done / tasks.length) * 100);
}

const priorityRank: Record<Priority, number> = { high: 0, normal: 1, low: 2 };

/** Open tasks first, then by priority, then by estimate. */
export function sortTasks(tasks: StudyTask[]): StudyTask[] {
  return [...tasks].sort((a, b) => {
    const aDone = a.doneOn !== null;
    const bDone = b.doneOn !== null;
    if (aDone !== bDone) return aDone ? 1 : -1;
    if (a.priority !== b.priority) return priorityRank[a.priority] - priorityRank[b.priority];
    if (a.estimateMin !== b.estimateMin) return a.estimateMin - b.estimateMin;
    return a.createdAt - b.createdAt;
  });
}

/**
 * Estimated minutes completed per day for the given day keys. Only tasks whose
 * `doneOn` matches the key contribute; unfinished estimates are never counted.
 */
export function weeklyTaskMinutes(store: TaskStore, days: string[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const day of days) out[day] = 0;
  for (const task of store.tasks) {
    if (task.doneOn === null) continue;
    if (!(task.doneOn in out)) continue;
    out[task.doneOn] += task.estimateMin;
  }
  return out;
}

export function addTask(store: TaskStore, task: StudyTask): TaskStore {
  return { version: 1, tasks: [task, ...store.tasks] };
}

export function patchTask(store: TaskStore, id: string, patch: Partial<Omit<StudyTask, "id">>): TaskStore {
  return { version: 1, tasks: store.tasks.map((task) => (task.id === id ? { ...task, ...patch } : task)) };
}

export function removeTask(store: TaskStore, id: string): TaskStore {
  return { version: 1, tasks: store.tasks.filter((task) => task.id !== id) };
}

/** Toggle completion; done always records the Algiers day it was completed. */
export function toggleTask(store: TaskStore, id: string, now: number = Date.now()): TaskStore {
  return {
    version: 1,
    tasks: store.tasks.map((task) =>
      task.id === id ? { ...task, doneOn: task.doneOn === null ? dayKey(now) : null } : task,
    ),
  };
}

export function isTaskStore(value: unknown): value is TaskStore {
  if (!value || typeof value !== "object") return false;
  const store = value as Record<string, unknown>;
  if (store.version !== 1 || !Array.isArray(store.tasks)) return false;
  return store.tasks.every((entry) => {
    if (!entry || typeof entry !== "object") return false;
    const task = entry as Record<string, unknown>;
    return (
      typeof task.id === "string" &&
      typeof task.title === "string" &&
      typeof task.subject === "string" &&
      typeof task.lesson === "string" &&
      isPriority(task.priority) &&
      typeof task.estimateMin === "number" &&
      typeof task.day === "string" &&
      (task.doneOn === null || typeof task.doneOn === "string") &&
      typeof task.createdAt === "number"
    );
  });
}
