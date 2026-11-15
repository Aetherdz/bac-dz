"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { pathFor } from "@/lib/routes";
import { tx } from "@/lib/tx";
import { subjectById, type SubjectId } from "@/content/bac";
import { STORAGE_KEYS } from "@/lib/study/store";
import { useStoredState } from "@/lib/study/use-stored";
import {
  createSession,
  dateOfWeekday,
  dayLabels,
  dayLabelsShort,
  emptyPlanner,
  isValidTime,
  isPlannerStore,
  patchSession,
  removeSession,
  sessionsForDay,
  toggleSession,
  weekProgress,
  weeklyMinutes,
  type PlannerSession,
  type PlannerStore,
} from "@/lib/study/planner";
import { dayKey, weekdayIndex } from "@/lib/study/time";
import { usePomodoro } from "./pomodoro-context";
import { IconCheck, IconEdit, IconPlay, IconPlus, IconTrash } from "@/components/icons";

const subjectOptions = Object.values(subjectById).map((subject) => ({ id: subject.id as string, label: subject.name }));

function subjectLabel(subject: string, locale: Locale): string {
  const found = subjectById[subject as SubjectId];
  return found ? found.name[locale] : subject || tx(locale, { ar: "بدون مادة", fr: "Sans matière", en: "No subject" });
}

export function PlannerBoard({ locale }: { locale: Locale }) {
  const [store, update, ready] = useStoredState<PlannerStore>(STORAGE_KEYS.planner, emptyPlanner(), isPlannerStore);
  const { startBlock } = usePomodoro();
  const [weekday, setWeekday] = useState(() => weekdayIndex(dayKey()));
  const [start, setStart] = useState("17:00");
  const [minutes, setMinutes] = useState("45");
  const [subject, setSubject] = useState("");
  const [customSubject, setCustomSubject] = useState("");
  const [lesson, setLesson] = useState("");
  const [error, setError] = useState("");
  const [announce, setAnnounce] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editStart, setEditStart] = useState("17:00");
  const [editMinutes, setEditMinutes] = useState("45");

  const progress = weekProgress(store);
  const total = weeklyMinutes(store);
  const todayIndex = weekdayIndex(dayKey());
  const days = useMemo(() => dayLabels.map((_, index) => index), []);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!isValidTime(start)) {
      setError(tx(locale, { ar: "أدخل وقتًا صحيحًا (00:00–23:59).", fr: "Saisissez une heure valide (00:00–23:59).", en: "Enter a valid time (00:00–23:59)." }));
      return;
    }
    const session = createSession({
      weekday,
      start,
      minutes: Number(minutes),
      subject: subject === "__custom" ? customSubject : subject,
      lesson,
    });
    if (!session) {
      setError(tx(locale, { ar: "تعذّر إنشاء الجلسة، تحقق من الحقول.", fr: "Création impossible, vérifiez les champs.", en: "Could not create the slot; check the fields." }));
      return;
    }
    update((previous) => ({ version: 1, sessions: [...previous.sessions, session] }));
    setLesson("");
    setError("");
    setAnnounce(tx(locale, { ar: "أُضيفت الجلسة إلى المخطط.", fr: "Créneau ajouté au planning.", en: "Slot added to the plan." }));
  };

  const saveEdit = (id: string) => {
    if (!isValidTime(editStart)) return;
    update((previous) =>
      patchSession(previous, id, {
        start: editStart,
        minutes: Math.min(300, Math.max(10, Math.round(Number(editMinutes) || 45))),
      }),
    );
    setEditing(null);
    setAnnounce(tx(locale, { ar: "حُدّثت الجلسة.", fr: "Créneau modifié.", en: "Slot updated." }));
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
      <div>
        <form onSubmit={submit} className="card p-5 sm:p-6" aria-label={tx(locale, { ar: "إضافة جلسة للمخطط", fr: "Ajouter un créneau", en: "Add a planner slot" })}>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
            {tx(locale, { ar: "جلسة أسبوعية", fr: "Créneau hebdomadaire", en: "Weekly slot" })}
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <label className="block">
              <span className="mb-1 block text-[11.5px] text-muted">{tx(locale, { ar: "اليوم", fr: "Jour", en: "Day" })}</span>
              <select value={weekday} onChange={(event) => setWeekday(Number(event.target.value))} className="select">
                {dayLabels.map((label, index) => (
                  <option key={label.ar} value={index}>
                    {label[locale]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-[11.5px] text-muted">{tx(locale, { ar: "البداية", fr: "Début", en: "Start" })}</span>
              <input type="time" value={start} onChange={(event) => setStart(event.target.value)} className="input num" required />
            </label>
            <label className="block">
              <span className="mb-1 block text-[11.5px] text-muted">{tx(locale, { ar: "المدة (د)", fr: "Durée (min)", en: "Length (min)" })}</span>
              <input type="number" min={10} max={300} step={5} value={minutes} onChange={(event) => setMinutes(event.target.value)} className="input num" />
            </label>
            <label className="block">
              <span className="mb-1 block text-[11.5px] text-muted">{tx(locale, { ar: "المادة", fr: "Matière", en: "Subject" })}</span>
              <select value={subject} onChange={(event) => setSubject(event.target.value)} className="select">
                <option value="">{tx(locale, { ar: "اختر", fr: "Choisir", en: "Choose" })}</option>
                {subjectOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label[locale]}
                  </option>
                ))}
                <option value="__custom">{tx(locale, { ar: "أخرى…", fr: "Autre…", en: "Other…" })}</option>
              </select>
            </label>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {subject === "__custom" ? (
              <label className="block">
                <span className="mb-1 block text-[11.5px] text-muted">{tx(locale, { ar: "اسم المادة", fr: "Nom de la matière", en: "Subject name" })}</span>
                <input value={customSubject} onChange={(event) => setCustomSubject(event.target.value)} maxLength={80} className="input" />
              </label>
            ) : null}
            <label className="block">
              <span className="mb-1 block text-[11.5px] text-muted">{tx(locale, { ar: "ما ستراجعه", fr: "Ce que vous réviserez", en: "What you will revise" })}</span>
              <input value={lesson} onChange={(event) => setLesson(event.target.value)} maxLength={160} className="input" placeholder={tx(locale, { ar: "تمارين الاحتمالات", fr: "Exercices de probabilités", en: "Probability exercises" })} />
            </label>
          </div>

          {error ? (
            <p role="alert" className="mt-2 text-[12px] text-accent">
              {error}
            </p>
          ) : null}

          <button type="submit" className="btn btn-primary mt-3 w-full">
            <IconPlus size={15} />
            {tx(locale, { ar: "أضف إلى المخطط", fr: "Ajouter au planning", en: "Add to the plan" })}
          </button>
        </form>

        <p aria-live="polite" className="sr-only">
          {announce}
        </p>

        <div className="mt-6 space-y-5">
          {ready && store.sessions.length === 0 ? (
            <p className="border-y border-line py-8 text-center text-[13px] text-muted">
              {tx(locale, {
                ar: "المخطط فارغ. أضف جلستين أو ثلاثًا فقط للبداية؛ المخطط القصير يُنجز.",
                fr: "Planning vide. Ajoutez deux ou trois créneaux pour commencer : un plan court se termine.",
                en: "Empty plan. Add two or three slots to start; a short plan gets finished.",
              })}
            </p>
          ) : null}

          {days.map((index) => {
            const sessions = sessionsForDay(store, index);
            if (sessions.length === 0) return null;
            return (
              <section key={index} aria-labelledby={`planner-day-${index}`}>
                <div className="flex items-baseline justify-between gap-3 border-b border-line-strong pb-1.5">
                  <h3 id={`planner-day-${index}`} className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink">
                    {dayLabels[index][locale]}
                  </h3>
                  <span className="num text-[10.5px] text-muted">
                    {sessions.reduce((sum, session) => sum + session.minutes, 0)}{" "}
                    {tx(locale, { ar: "دقيقة", fr: "min", en: "min" })}
                  </span>
                </div>
                <ul className="divide-y divide-line">
                  {sessions.map((session) => {
                    const done = session.doneOn === dateOfWeekday(session.weekday);
                    return (
                      <li key={session.id} className="py-3">
                        {editing === session.id ? (
                          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-end">
                            <input type="time" value={editStart} onChange={(event) => setEditStart(event.target.value)} className="input num h-11 w-full sm:h-10 sm:w-[120px]" aria-label={tx(locale, { ar: "البداية", fr: "Début", en: "Start" })} />
                            <input type="number" inputMode="numeric" min={10} max={300} step={5} value={editMinutes} onChange={(event) => setEditMinutes(event.target.value)} className="input num h-11 w-full sm:h-10 sm:w-[100px]" aria-label={tx(locale, { ar: "المدة", fr: "Durée", en: "Length" })} />
                            <button type="button" className="btn btn-sm btn-primary min-h-11 active:bg-brand/85 sm:min-h-9" onClick={() => saveEdit(session.id)}>
                              {tx(locale, { ar: "احفظ", fr: "Enregistrer", en: "Save" })}
                            </button>
                            <button type="button" className="btn btn-sm btn-ghost min-h-11 active:bg-raised sm:min-h-9" onClick={() => setEditing(null)}>
                              {tx(locale, { ar: "إلغاء", fr: "Annuler", en: "Cancel" })}
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-wrap items-start gap-x-3 gap-y-2">
                            <span className={`num w-[92px] shrink-0 text-[13px] sm:w-[104px] ${done ? "text-muted" : "text-ink"}`}>
                              {session.start}–{endLabel(session)}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className={`block break-words text-[13px] leading-6 ${done ? "text-muted line-through" : "text-ink"}`}>
                                {session.lesson || subjectLabel(session.subject, locale)}
                              </span>
                              <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted">
                                <span>{subjectLabel(session.subject, locale)}</span>
                                <span aria-hidden>·</span>
                                <span className="num">
                                  {session.minutes} {tx(locale, { ar: "د", fr: "min", en: "min" })}
                                </span>
                                {index === todayIndex ? <span className="chip">{tx(locale, { ar: "اليوم", fr: "Aujourd’hui", en: "Today" })}</span> : null}
                              </span>
                            </span>
                            {/* Phone: actions drop to their own row so four 44px
                                targets never squeeze the title. */}
                            <span className="flex w-full shrink-0 flex-wrap items-center justify-end gap-1 border-t border-line pt-1.5 sm:w-auto sm:border-0 sm:pt-0">
                              <button
                                type="button"
                                className="btn btn-sm min-h-11 px-3 active:bg-raised sm:min-h-8 sm:px-2"
                                aria-label={tx(locale, { ar: "ابدأ جلسة تركيز", fr: "Lancer un focus", en: "Start focus" })}
                                onClick={() => startBlock(session.minutes, session.lesson || subjectLabel(session.subject, locale))}
                              >
                                <IconPlay size={13} />
                                {tx(locale, { ar: "ابدأ", fr: "Focus", en: "Focus" })}
                              </button>
                              <button
                                type="button"
                                className={`btn btn-sm min-h-11 min-w-11 px-2 active:bg-raised sm:min-h-8 sm:min-w-0 ${done ? "border-brand text-brand" : ""}`}
                                aria-pressed={done}
                                aria-label={tx(locale, { ar: "علّم كمكتملة", fr: "Marquer fait", en: "Mark done" })}
                                onClick={() => update((previous) => toggleSession(previous, session.id))}
                              >
                                <IconCheck size={13} />
                              </button>
                              <button
                                type="button"
                                className="btn btn-sm btn-ghost min-h-11 min-w-11 px-2 active:bg-raised sm:min-h-8 sm:min-w-0"
                                aria-label={tx(locale, { ar: "تعديل", fr: "Modifier", en: "Edit" })}
                                onClick={() => {
                                  setEditing(session.id);
                                  setEditStart(session.start);
                                  setEditMinutes(String(session.minutes));
                                }}
                              >
                                <IconEdit size={13} />
                              </button>
                              <button
                                type="button"
                                className="btn btn-sm btn-ghost min-h-11 min-w-11 px-2 hover:text-accent active:bg-raised sm:min-h-8 sm:min-w-0"
                                aria-label={tx(locale, { ar: "حذف", fr: "Supprimer", en: "Delete" })}
                                onClick={() => update((previous) => removeSession(previous, session.id))}
                              >
                                <IconTrash size={13} />
                              </button>
                            </span>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      </div>

      <aside className="space-y-6">
        <div className="card p-5">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
              {tx(locale, { ar: "تقدّم الأسبوع", fr: "Avancement de la semaine", en: "Week progress" })}
            </h2>
            <span className="num font-display text-2xl font-semibold text-ink">{progress.percent}%</span>
          </div>
          <div className="mt-3 h-1.5 w-full bg-line" role="progressbar" aria-valuenow={progress.percent} aria-valuemin={0} aria-valuemax={100} aria-label={tx(locale, { ar: "نسبة إنجاز جلسات الأسبوع", fr: "Créneaux faits cette semaine", en: "This week’s completed slots" })}>
            <div className="h-1.5 bg-brand transition-[width] duration-300" style={{ width: `${progress.percent}%` }} />
          </div>
          <dl className="mt-4 grid grid-cols-3 gap-3">
            <div>
              <dt className="metric-label">{tx(locale, { ar: "منجزة", fr: "Faites", en: "Done" })}</dt>
              <dd className="metric-value">{progress.done}</dd>
            </div>
            <div>
              <dt className="metric-label">{tx(locale, { ar: "إجمالي", fr: "Total", en: "Total" })}</dt>
              <dd className="metric-value">{progress.total}</dd>
            </div>
            <div>
              <dt className="metric-label">{tx(locale, { ar: "دقائق/أسبوع", fr: "Min/semaine", en: "Min/week" })}</dt>
              <dd className="metric-value">{total}</dd>
            </div>
          </dl>
          <p className="mt-3 text-[11.5px] leading-5 text-muted">
            {tx(locale, {
              ar: "تُعاد الجلسات إلى «غير منجزة» تلقائيًا في الأسبوع التالي؛ الإنجاز مرتبط بتاريخ يومه.",
              fr: "Les créneaux redeviennent « à faire » la semaine suivante : la complétion est liée à la date du jour.",
              en: "Slots reset to open the following week; completion is tied to that weekday’s date.",
            })}
          </p>
        </div>

        <div className="card p-5">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
            {tx(locale, { ar: "توزيع الأسبوع", fr: "Répartition", en: "Week load" })}
          </h2>
          <div className="mt-3 flex h-24 items-end gap-1.5" role="img" aria-label={tx(locale, { ar: "دقائق مخططة لكل يوم", fr: "Minutes planifiées par jour", en: "Planned minutes per day" })}>
            {days.map((index) => {
              const value = sessionsForDay(store, index).reduce((sum, session) => sum + session.minutes, 0);
              const max = Math.max(30, ...days.map((day) => sessionsForDay(store, day).reduce((sum, session) => sum + session.minutes, 0)));
              return (
                <div key={index} className="flex h-full flex-1 flex-col justify-end gap-1">
                  <div className={value > 0 ? "bg-brand" : "bg-line"} style={{ height: `${Math.max(2, Math.round((value / max) * 100))}%` }} />
                  <span className="text-center text-[9px] text-muted">{dayLabelsShort[index][locale]}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
            {tx(locale, { ar: "الخطوة التالية", fr: "Étape suivante", en: "Next step" })}
          </h2>
          <p className="mt-2 text-[12.5px] leading-6 text-muted">
            {tx(locale, {
              ar: "زر «ابدأ» يفتح مؤقت التركيز بالمدة نفسها ويضع عنوان الجلسة تلقائيًا.",
              fr: "Le bouton « Focus » ouvre le minuteur avec la même durée et le titre du créneau.",
              en: "“Focus” opens the timer with the same length and the slot’s title.",
            })}
          </p>
          <Link href={pathFor(locale, { name: "pomodoro" })} className="link mt-3 inline-flex items-center gap-1 text-[12.5px]">
            {tx(locale, { ar: "المؤقت", fr: "Le minuteur", en: "The timer" })}
            <IconPlay size={12} />
          </Link>
        </div>
      </aside>
    </div>
  );
}

function endLabel(session: PlannerSession): string {
  const [hours, minutes] = session.start.split(":").map(Number);
  const total = hours * 60 + minutes + session.minutes;
  const wrapped = ((total % 1440) + 1440) % 1440;
  return `${String(Math.floor(wrapped / 60)).padStart(2, "0")}:${String(wrapped % 60).padStart(2, "0")}`;
}
