"use client";

import { useMemo, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { tx } from "@/lib/tx";
import { subjectById, type SubjectId } from "@/content/bac";
import { STORAGE_KEYS } from "@/lib/study/store";
import { useStoredState } from "@/lib/study/use-stored";
import {
  addTask,
  clampEstimate,
  createTask,
  emptyTasks,
  isPriority,
  isTaskStore,
  patchTask,
  removeTask,
  sortTasks,
  taskProgress,
  tasksForDay,
  toggleTask,
  weeklyTaskMinutes,
  type Priority,
  type StudyTask,
  type TaskStore,
} from "@/lib/study/tasks";
import { dayKey, formatDayKey, recentDays, shortDayKey } from "@/lib/study/time";
import { IconCheck, IconEdit, IconPlus, IconTrash } from "@/components/icons";

const priorityTone: Record<Priority, string> = {
  high: "chip-brand",
  normal: "chip",
  low: "chip",
};

const priorityLabel: Record<Priority, { ar: string; fr: string; en: string }> = {
  high: { ar: "عالية", fr: "Haute", en: "High" },
  normal: { ar: "عادية", fr: "Normale", en: "Normal" },
  low: { ar: "منخفضة", fr: "Basse", en: "Low" },
};

const subjectOptions = Object.values(subjectById).map((subject) => ({
  id: subject.id as string,
  label: subject.name,
}));

function subjectLabel(subject: string, locale: Locale): string {
  const found = subjectById[subject as SubjectId];
  return found ? found.name[locale] : subject || tx(locale, { ar: "بدون مادة", fr: "Sans matière", en: "No subject" });
}

type Filter = "today" | "all" | "open" | "done";

export function TasksBoard({ locale }: { locale: Locale }) {
  const [store, update, ready] = useStoredState<TaskStore>(STORAGE_KEYS.tasks, emptyTasks(), isTaskStore);
  const [filter, setFilter] = useState<Filter>("today");
  const [announce, setAnnounce] = useState("");
  const today = dayKey();

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState<string>("");
  const [customSubject, setCustomSubject] = useState("");
  const [lesson, setLesson] = useState("");
  const [priority, setPriority] = useState<Priority>("normal");
  const [estimate, setEstimate] = useState("30");
  const [day, setDay] = useState(today);
  const [error, setError] = useState("");

  const [editing, setEditing] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSubject, setEditSubject] = useState("");
  const [editEstimate, setEditEstimate] = useState("30");
  const [editPriority, setEditPriority] = useState<Priority>("normal");

  const visible = useMemo(() => {
    const list =
      filter === "all"
        ? store.tasks
        : filter === "done"
          ? store.tasks.filter((task) => task.doneOn !== null)
          : filter === "open"
            ? store.tasks.filter((task) => task.doneOn === null)
            : tasksForDay(store, today);
    return sortTasks(list);
  }, [store, filter, today]);

  const percent = taskProgress(store, today);
  const weeks = useMemo(() => {
    const days = recentDays(7);
    return days.map((key) => ({ key, minutes: weeklyTaskMinutes(store, [key])[key] }));
  }, [store, ready]);
  const peak = Math.max(30, ...weeks.map((entry) => entry.minutes));

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const resolvedSubject = subject === "__custom" ? customSubject : subject;
    const task = createTask({
      title,
      subject: resolvedSubject,
      lesson,
      priority,
      estimateMin: clampEstimate(estimate, 30),
      day,
    });
    if (!task) {
      setError(tx(locale, { ar: "اكتب عنوان المهمة أولًا.", fr: "Saisissez d’abord un titre.", en: "Enter a task title first." }));
      return;
    }
    update((previous) => addTask(previous, task));
    setTitle("");
    setLesson("");
    setCustomSubject("");
    setError("");
    setAnnounce(tx(locale, { ar: "أُضيفت المهمة.", fr: "Tâche ajoutée.", en: "Task added." }));
  };

  const beginEdit = (task: StudyTask) => {
    setEditing(task.id);
    setEditTitle(task.title);
    setEditSubject(task.subject);
    setEditEstimate(String(task.estimateMin));
    setEditPriority(task.priority);
  };

  const saveEdit = (id: string) => {
    if (!editTitle.trim()) return;
    update((previous) =>
      patchTask(previous, id, {
        title: editTitle.trim().slice(0, 160),
        subject: editSubject.trim().slice(0, 80),
        estimateMin: clampEstimate(editEstimate, 30),
        priority: isPriority(editPriority) ? editPriority : "normal",
      }),
    );
    setEditing(null);
    setAnnounce(tx(locale, { ar: "حُدّثت المهمة.", fr: "Tâche modifiée.", en: "Task updated." }));
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
      <div>
        <form onSubmit={submit} className="card p-5 sm:p-6" aria-label={tx(locale, { ar: "إضافة مهمة", fr: "Ajouter une tâche", en: "Add a task" })}>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
            {tx(locale, { ar: "مهمة جديدة", fr: "Nouvelle tâche", en: "New task" })}
          </h2>
          <div className="mt-4 space-y-3">
            <label className="block min-w-0">
              <span className="mb-1 block text-[11.5px] text-muted">{tx(locale, { ar: "ما الذي ستنجزه؟", fr: "Que allez-vous finir ?", en: "What will you finish?" })}</span>
              <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={160} className="input" placeholder={tx(locale, { ar: "حل 6 تمارين من سلسلة النهايات", fr: "Résoudre 6 exercices de la série", en: "Solve 6 exercises from the sequence" })} required />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block min-w-0">
                <span className="mb-1 block text-[11.5px] text-muted">{tx(locale, { ar: "المادة", fr: "Matière", en: "Subject" })}</span>
                <select value={subject} onChange={(event) => setSubject(event.target.value)} className="select">
                  <option value="">{tx(locale, { ar: "اختر مادة", fr: "Choisir une matière", en: "Choose a subject" })}</option>
                  {subjectOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label[locale]}
                    </option>
                  ))}
                  <option value="__custom">{tx(locale, { ar: "أخرى…", fr: "Autre…", en: "Other…" })}</option>
                </select>
              </label>
              <label className="block min-w-0">
                <span className="mb-1 block text-[11.5px] text-muted">{tx(locale, { ar: "الدرس", fr: "Leçon", en: "Lesson" })}</span>
                <input value={lesson} onChange={(event) => setLesson(event.target.value)} maxLength={160} className="input" placeholder={tx(locale, { ar: "الدوال الأسية", fr: "Fonctions exponentielles", en: "Exponential functions" })} />
              </label>
            </div>

            {subject === "__custom" ? (
              <label className="block min-w-0">
                <span className="mb-1 block text-[11.5px] text-muted">{tx(locale, { ar: "اسم المادة", fr: "Nom de la matière", en: "Subject name" })}</span>
                <input value={customSubject} onChange={(event) => setCustomSubject(event.target.value)} maxLength={80} className="input" />
              </label>
            ) : null}

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <label className="block min-w-0">
                <span className="mb-1 block text-[11.5px] text-muted">{tx(locale, { ar: "الأولوية", fr: "Priorité", en: "Priority" })}</span>
                <select value={priority} onChange={(event) => setPriority(event.target.value as Priority)} className="select">
                  <option value="high">{tx(locale, priorityLabel.high)}</option>
                  <option value="normal">{tx(locale, priorityLabel.normal)}</option>
                  <option value="low">{tx(locale, priorityLabel.low)}</option>
                </select>
              </label>
              <label className="block min-w-0">
                <span className="mb-1 block text-[11.5px] text-muted">{tx(locale, { ar: "التقدير (د)", fr: "Estimation (min)", en: "Estimate (min)" })}</span>
                <input type="number" inputMode="numeric" min={5} max={480} step={5} value={estimate} onChange={(event) => setEstimate(event.target.value)} className="input num" />
              </label>
              {/* A native date picker has an intrinsic minimum width: give it the
                  full row on phones instead of squeezing it into a third. */}
              <label className="col-span-2 block min-w-0 sm:col-span-1">
                <span className="mb-1 block text-[11.5px] text-muted">{tx(locale, { ar: "اليوم", fr: "Jour", en: "Day" })}</span>
                <input type="date" value={day} onChange={(event) => setDay(event.target.value)} className="input num" />
              </label>
            </div>

            {error ? (
              <p role="alert" className="text-[12px] text-accent">
                {error}
              </p>
            ) : null}

            <button type="submit" className="btn btn-primary w-full">
              <IconPlus size={15} />
              {tx(locale, { ar: "أضف المهمة", fr: "Ajouter la tâche", en: "Add task" })}
            </button>
          </div>
        </form>

        <p aria-live="polite" className="sr-only">
          {announce}
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
            {tx(locale, { ar: "المهام", fr: "Tâches", en: "Tasks" })}
          </h2>
          <div className="flex flex-wrap gap-1" role="group" aria-label={tx(locale, { ar: "تصفية المهام", fr: "Filtrer les tâches", en: "Filter tasks" })}>
            {(["today", "open", "done", "all"] as Filter[]).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                aria-pressed={filter === value}
                className={`btn btn-sm min-h-11 px-3 active:bg-raised sm:min-h-9 ${filter === value ? "border-ink text-ink" : "border-transparent text-muted"}`}
              >
                {value === "today"
                  ? tx(locale, { ar: "اليوم", fr: "Aujourd’hui", en: "Today" })
                  : value === "open"
                    ? tx(locale, { ar: "غير منجزة", fr: "Ouvertes", en: "Open" })
                    : value === "done"
                      ? tx(locale, { ar: "منجزة", fr: "Faites", en: "Done" })
                      : tx(locale, { ar: "الكل", fr: "Toutes", en: "All" })}
              </button>
            ))}
          </div>
        </div>

        <ul className="mt-3 divide-y divide-line border-y border-line">
          {visible.length === 0 ? (
            <li className="py-8 text-center text-[13px] text-muted">
              {ready
                ? tx(locale, { ar: "لا مهام في هذا العرض بعد.", fr: "Aucune tâche dans cette vue.", en: "No tasks in this view yet." })
                : "…"}
            </li>
          ) : (
            visible.map((task) => {
              const isEditing = editing === task.id;
              return (
                <li key={task.id} className="py-3">
                  {isEditing ? (
                    <div className="space-y-2">
                      <input value={editTitle} onChange={(event) => setEditTitle(event.target.value)} className="input h-11" aria-label={tx(locale, { ar: "العنوان", fr: "Titre", en: "Title" })} />
                      <div className="grid grid-cols-3 gap-2">
                        <input value={editSubject} onChange={(event) => setEditSubject(event.target.value)} className="input h-11" aria-label={tx(locale, { ar: "المادة", fr: "Matière", en: "Subject" })} />
                        <input type="number" inputMode="numeric" min={5} max={480} step={5} value={editEstimate} onChange={(event) => setEditEstimate(event.target.value)} className="input num h-11" aria-label={tx(locale, { ar: "التقدير", fr: "Estimation", en: "Estimate" })} />
                        <select value={editPriority} onChange={(event) => setEditPriority(event.target.value as Priority)} className="select h-11" aria-label={tx(locale, { ar: "الأولوية", fr: "Priorité", en: "Priority" })}>
                          <option value="high">{tx(locale, priorityLabel.high)}</option>
                          <option value="normal">{tx(locale, priorityLabel.normal)}</option>
                          <option value="low">{tx(locale, priorityLabel.low)}</option>
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <button type="button" className="btn btn-sm btn-primary min-h-11 flex-1 active:bg-brand/85 sm:min-h-9 sm:flex-none" onClick={() => saveEdit(task.id)}>
                          {tx(locale, { ar: "احفظ", fr: "Enregistrer", en: "Save" })}
                        </button>
                        <button type="button" className="btn btn-sm btn-ghost min-h-11 flex-1 active:bg-raised sm:min-h-9 sm:flex-none" onClick={() => setEditing(null)}>
                          {tx(locale, { ar: "إلغاء", fr: "Annuler", en: "Cancel" })}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-start gap-x-2.5 gap-y-2">
                      {/* 24px box, 44px touch target via a transparent pseudo-element. */}
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={task.doneOn !== null}
                        aria-label={task.title}
                        onClick={() => {
                          update((previous) => toggleTask(previous, task.id));
                          setAnnounce(
                            task.doneOn === null
                              ? tx(locale, { ar: "أُنجزت المهمة.", fr: "Tâche terminée.", en: "Task completed." })
                              : tx(locale, { ar: "أُعيدت المهمة.", fr: "Tâche rouverte.", en: "Task reopened." }),
                          );
                        }}
                        className={`relative mt-0.5 grid h-6 w-6 shrink-0 place-items-center border transition-colors before:absolute before:-inset-2.5 before:content-[''] active:bg-raised ${
                          task.doneOn !== null ? "border-brand bg-brand text-brand-ink" : "border-line-strong text-transparent hover:border-ink"
                        }`}
                      >
                        <IconCheck size={13} />
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className={`break-words text-[13.5px] font-medium leading-6 ${task.doneOn !== null ? "text-muted line-through" : "text-ink"}`}>
                          {task.title}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted">
                          <span>{subjectLabel(task.subject, locale)}</span>
                          {task.lesson ? (
                            <>
                              <span aria-hidden>·</span>
                              <span>{task.lesson}</span>
                            </>
                          ) : null}
                          <span aria-hidden>·</span>
                          <span className="num">
                            {task.estimateMin} {tx(locale, { ar: "د", fr: "min", en: "min" })}
                          </span>
                          <span className={`chip ${priorityTone[task.priority]}`}>{tx(locale, priorityLabel[task.priority])}</span>
                          {task.day !== today ? <span className="chip">{formatDayKey(task.day, locale)}</span> : null}
                        </div>
                      </div>

                      {/* Full-width action row on phones, inline on sm+. */}
                      <div className="flex w-full shrink-0 items-center justify-end gap-1 border-t border-line pt-1.5 sm:w-auto sm:border-0 sm:pt-0">
                        <button
                          type="button"
                          onClick={() => beginEdit(task)}
                          className="btn btn-sm btn-ghost min-h-11 min-w-11 px-2 active:bg-raised sm:min-h-8 sm:min-w-0"
                          aria-label={tx(locale, { ar: "تعديل", fr: "Modifier", en: "Edit" })}
                        >
                          <IconEdit size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            update((previous) => removeTask(previous, task.id));
                            setAnnounce(tx(locale, { ar: "حُذفت المهمة.", fr: "Tâche supprimée.", en: "Task deleted." }));
                          }}
                          className="btn btn-sm btn-ghost min-h-11 min-w-11 px-2 hover:text-accent active:bg-raised sm:min-h-8 sm:min-w-0"
                          aria-label={tx(locale, { ar: "حذف", fr: "Supprimer", en: "Delete" })}
                        >
                          <IconTrash size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })
          )}
        </ul>
      </div>

      <aside className="space-y-6">
        <div className="card p-5">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
              {tx(locale, { ar: "إنجاز اليوم", fr: "Avancement du jour", en: "Today’s progress" })}
            </h2>
            <span className="num font-display text-2xl font-semibold text-ink">{percent}%</span>
          </div>
          <div className="mt-3 h-1.5 w-full bg-line" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label={tx(locale, { ar: "نسبة إنجاز مهام اليوم", fr: "Tâches du jour terminées", en: "Today’s task completion" })}>
            <div className="h-1.5 bg-brand transition-[width] duration-300" style={{ width: `${percent}%` }} />
          </div>
          <p className="mt-2 text-[11.5px] leading-5 text-muted">
            {tx(locale, {
              ar: "النسبة = المهام المنجزة اليوم ÷ مهام اليوم. لا تُحتسب المهام غير المجدولة لليوم.",
              fr: "Pourcentage = tâches finies aujourd’hui ÷ tâches du jour. Les tâches d’un autre jour ne comptent pas.",
              en: "Percent = tasks finished today ÷ today’s tasks. Tasks scheduled for other days are excluded.",
            })}
          </p>
        </div>

        <div className="card p-5">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
            {tx(locale, { ar: "آخر 7 أيام", fr: "7 derniers jours", en: "Last 7 days" })}
          </h2>
          <p className="mt-1 text-[11px] text-muted">
            {tx(locale, { ar: "دقائق المهام المنجزة (حسب التقدير)", fr: "Minutes des tâches faites (estimation)", en: "Minutes of completed tasks (estimated)" })}
          </p>
          <div className="mt-4 flex h-28 items-end gap-1.5" role="img" aria-label={tx(locale, { ar: "رسم أعمدة لدقائق المهام في آخر سبعة أيام", fr: "Graphique des minutes de tâches sur sept jours", en: "Bar chart of task minutes over seven days" })}>
            {weeks.map((entry) => (
              <div key={entry.key} className="flex h-full flex-1 flex-col justify-end gap-1" title={`${entry.key}: ${entry.minutes}`}>
                <div
                  className={entry.minutes > 0 ? "bg-brand" : "bg-line"}
                  style={{ height: `${Math.max(2, Math.round((entry.minutes / peak) * 100))}%` }}
                />
                <span className="num text-center text-[9px] text-muted">{shortDayKey(entry.key)}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
