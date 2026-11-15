"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { Locale } from "@/lib/i18n";
import type { Localized } from "@/content/bac";
import { pathFor } from "@/lib/routes";
import { tx } from "@/lib/tx";
import { STORAGE_KEYS, readStored } from "@/lib/study/store";
import { dayStats, emptyStats, isStatsStore } from "@/lib/study/pomodoro";
import { emptyTasks, isTaskStore, sortTasks, taskProgress, tasksForDay, weeklyTaskMinutes } from "@/lib/study/tasks";
import { computeStreak, dayKey, formatDayKey, recentDays, shortDayKey } from "@/lib/study/time";
import { useNow, useStudySignal } from "@/lib/study/use-stored";
import { CountdownPanel } from "./countdown";
import { QuickFocus } from "./quick-focus";
import { TodayStrip } from "./today-strip";
import { IconArrow, IconCalendar, IconCalculator, IconCheckCircle, IconLayers, IconList, IconTimer } from "@/components/icons";

const quickLinks = [
  { name: "calculator" as const, label: { ar: "حاسبة المعدل", fr: "Moyenne du bac", en: "Bac average" }, icon: <IconCalculator size={15} /> },
  { name: "exams" as const, label: { ar: "أرشيف المواضيع", fr: "Sujets du bac", en: "Past papers" }, icon: <IconLayers size={15} /> },
  { name: "planner" as const, label: { ar: "مخطط الأسبوع", fr: "Planning", en: "Planner" }, icon: <IconCalendar size={15} /> },
  { name: "tasks" as const, label: { ar: "مهام اليوم", fr: "Tâches", en: "Tasks" }, icon: <IconList size={15} /> },
  { name: "coefficients" as const, label: { ar: "المعاملات", fr: "Coefficients", en: "Coefficients" }, icon: <IconCheckCircle size={15} /> },
];

export function StudyDashboard({
  locale,
  target,
  note,
}: {
  locale: Locale;
  target: { iso: string | null; kind: "official" | "estimated" };
  note?: Localized | null;
}) {
  const signal = useStudySignal();
  const now = useNow(true, 30_000);

  const data = useMemo(() => {
    void signal;
    const stats = readStored(STORAGE_KEYS.stats, emptyStats(), isStatsStore);
    const tasks = readStored(STORAGE_KEYS.tasks, emptyTasks(), isTaskStore);
    const days = recentDays(7, now);
    const taskMinutes = weeklyTaskMinutes(tasks, days);
    const daily = days.map((key) => ({
      key,
      focus: Math.floor(dayStats(stats, key).ms / 60_000),
      tasks: taskMinutes[key] ?? 0,
    }));
    const focusTotal = days.reduce((sum, key) => sum + Math.floor(dayStats(stats, key).ms / 60_000), 0);
    const sessionTotal = days.reduce((sum, key) => sum + dayStats(stats, key).sessions, 0);
    const activeDays = Object.keys(stats.days).filter((key) => (stats.days[key]?.sessions ?? 0) > 0);
    return {
      daily,
      focusTotal,
      sessionTotal,
      streak: computeStreak(activeDays, now),
      percent: taskProgress(tasks, dayKey(now)),
      upcoming: sortTasks(tasksForDay(tasks, dayKey(now))).slice(0, 5),
      taskTotal: taskMinutes,
      empty: focusTotal === 0 && Object.keys(taskMinutes).every((key) => taskMinutes[key] === 0),
    };
  }, [signal, now]);

  const peak = Math.max(30, ...data.daily.map((day) => day.focus + day.tasks));

  return (
    <div className="space-y-10">
      <section aria-labelledby="dash-countdown">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="dash-countdown" className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
            {tx(locale, { ar: "العدّ التنازلي", fr: "Compte à rebours", en: "Countdown" })}
          </h2>
          <Link
            href={pathFor(locale, { name: "countdown" })}
            className="link -my-2 inline-flex min-h-11 items-center text-[12px] sm:my-0 sm:min-h-0"
          >
            {tx(locale, { ar: "الصفحة الكاملة", fr: "Page complète", en: "Full page" })}
          </Link>
        </div>
        <div className="mt-2">
          <CountdownPanel locale={locale} target={target} note={note ?? null} variant="hero" />
        </div>
      </section>

      <section aria-labelledby="dash-today">
        <h2 id="dash-today" className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
          {tx(locale, { ar: "اليوم", fr: "Aujourd’hui", en: "Today" })}
        </h2>
        <div className="mt-2">
          <TodayStrip locale={locale} />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <QuickFocus locale={locale} />

        <div className="card p-5 sm:p-6">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
              {tx(locale, { ar: "مهام اليوم", fr: "Tâches du jour", en: "Today’s tasks" })}
            </h2>
            <Link
              href={pathFor(locale, { name: "tasks" })}
              className="link -my-2 inline-flex min-h-11 items-center text-[12px] sm:my-0 sm:min-h-0"
            >
              {tx(locale, { ar: "إدارة", fr: "Gérer", en: "Manage" })}
            </Link>
          </div>
          {data.upcoming.length === 0 ? (
            <div className="mt-4 border-t border-line pt-4">
              <p className="text-[13px] leading-6 text-muted">
                {tx(locale, {
                  ar: "لا مهام لليوم. ابدأ بمهمة واحدة قابلة للإنهاء بدل قائمة طويلة.",
                  fr: "Aucune tâche aujourd’hui. Commencez par une tâche finissable plutôt qu’une longue liste.",
                  en: "No tasks today. Start with one finishable task instead of a long list.",
                })}
              </p>
              <Link
                href={pathFor(locale, { name: "tasks" })}
                className="btn btn-sm mt-3 min-h-11 w-full active:bg-raised sm:min-h-9 sm:w-auto"
              >
                {tx(locale, { ar: "أضف أول مهمة", fr: "Ajouter la première", en: "Add the first one" })}
                <IconArrow size={13} />
              </Link>
            </div>
          ) : (
            <ul className="mt-3 divide-y divide-line border-t border-line">
              {data.upcoming.map((task) => (
                <li key={task.id} className="flex items-start gap-2.5 py-2.5">
                  <span
                    aria-hidden
                    className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center border ${task.doneOn !== null ? "border-brand bg-brand" : "border-line-strong"}`}
                  />
                  <span className={`min-w-0 flex-1 break-words text-[13px] leading-6 ${task.doneOn !== null ? "text-muted line-through" : "text-ink"}`}>
                    {task.title}
                  </span>
                  <span className="num shrink-0 text-[10.5px] text-muted">{task.estimateMin}′</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section aria-labelledby="dash-week" className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="card p-5 sm:p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="dash-week" className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
              {tx(locale, { ar: "آخر 7 أيام", fr: "7 derniers jours", en: "Last 7 days" })}
            </h2>
            <div className="flex items-center gap-3 text-[10px] text-muted">
              <span className="inline-flex items-center gap-1.5">
                <span aria-hidden className="h-2 w-2 bg-brand" />
                {tx(locale, { ar: "تركيز", fr: "Focus", en: "Focus" })}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span aria-hidden className="h-2 w-2 bg-line-strong" />
                {tx(locale, { ar: "مهام", fr: "Tâches", en: "Tasks" })}
              </span>
            </div>
          </div>

          <div className="mt-5 flex h-40 items-end gap-2" role="img" aria-label={tx(locale, { ar: "دقائق الدراسة اليومية: جلسات التركيز والمهام المنجزة", fr: "Minutes d’étude par jour : focus et tâches faites", en: "Daily study minutes: focus sessions and completed tasks" })}>
            {data.daily.map((day) => {
              const total = day.focus + day.tasks;
              return (
                <div key={day.key} className="flex h-full flex-1 flex-col justify-end gap-1" title={`${formatDayKey(day.key, locale)} — ${total} min`}>
                  <div className="flex w-full flex-col justify-end" style={{ height: `${Math.max(2, Math.round((total / peak) * 100))}%` }}>
                    <div className="w-full bg-line-strong" style={{ height: `${total > 0 ? Math.round((day.tasks / total) * 100) : 0}%` }} />
                    <div className="w-full flex-1 bg-brand" />
                  </div>
                  <span className="num text-center text-[9px] text-muted">{shortDayKey(day.key)}</span>
                </div>
              );
            })}
          </div>

          {data.empty ? (
            <p className="mt-4 border-t border-line pt-3 text-[12px] leading-5 text-muted">
              {tx(locale, {
                ar: "الأرقام صفر لأن لا شيء سُجّل بعد — لا نعرض بيانات تجريبية.",
                fr: "Les chiffres sont à zéro car rien n’est encore enregistré — aucune donnée de démonstration.",
                en: "The figures are zero because nothing has been recorded yet — no demo data.",
              })}
            </p>
          ) : (
            <p className="mt-4 border-t border-line pt-3 text-[12px] leading-5 text-muted">
              {tx(locale, {
                ar: "دقائق التركيز من الجلسات المكتملة فقط، ودقائق المهام من التقدير المسجّل عند الإنجاز.",
                fr: "Les minutes de focus viennent des sessions terminées ; celles des tâches, de l’estimation au moment où elles sont faites.",
                en: "Focus minutes come from completed sessions; task minutes from the estimate recorded when completed.",
              })}
            </p>
          )}
        </div>

        <div className="card p-5 sm:p-6">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
            {tx(locale, { ar: "ملخص الأسبوع", fr: "Résumé de la semaine", en: "Week summary" })}
          </h2>
          <dl className="mt-4 divide-y divide-line">
            <div className="flex items-baseline justify-between gap-3 py-2.5">
              <dt className="text-[12.5px] text-muted">{tx(locale, { ar: "دقائق الدراسة", fr: "Minutes d’étude", en: "Study minutes" })}</dt>
              <dd className="num text-lg font-semibold text-ink">{data.focusTotal}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-3 py-2.5">
              <dt className="text-[12.5px] text-muted">{tx(locale, { ar: "جلسات مكتملة", fr: "Sessions terminées", en: "Completed sessions" })}</dt>
              <dd className="num text-lg font-semibold text-ink">{data.sessionTotal}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-3 py-2.5">
              <dt className="text-[12.5px] text-muted">{tx(locale, { ar: "إنجاز مهام اليوم", fr: "Tâches du jour", en: "Today’s tasks" })}</dt>
              <dd className="num text-lg font-semibold text-ink">{data.percent}%</dd>
            </div>
            <div className="flex items-baseline justify-between gap-3 py-2.5">
              <dt className="text-[12.5px] text-muted">{tx(locale, { ar: "أيام متتالية", fr: "Série de jours", en: "Day streak" })}</dt>
              <dd className="num text-lg font-semibold text-ink">{data.streak}</dd>
            </div>
          </dl>

          <div className="mt-4 border-t border-line pt-3">
            <h3 className="text-[10px] uppercase tracking-[0.14em] text-muted">
              {tx(locale, { ar: "اختصارات", fr: "Raccourcis", en: "Shortcuts" })}
            </h3>
            {/* Phones: a snap carousel of 44px chips. sm+: the original 2-col list. */}
            <ul className="-mx-5 mt-2 flex snap-x-app gap-2 overflow-x-auto px-5 pb-1 no-scrollbar sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-x-4 sm:overflow-visible sm:px-0 sm:pb-0">
              {quickLinks.map((link) => (
                <li key={link.name} className="shrink-0 snap-start sm:shrink">
                  <Link
                    href={pathFor(locale, { name: link.name })}
                    className="flex min-h-11 items-center gap-2 whitespace-nowrap border border-line px-3 text-[12.5px] text-ink active:bg-raised hover:text-brand sm:min-h-0 sm:border-0 sm:px-0 sm:py-1.5 sm:text-[12px]"
                  >
                    <span aria-hidden className="text-muted">
                      {link.icon}
                    </span>
                    {tx(locale, link.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-4">
        <IconTimer size={14} />
        <p className="text-[12px] text-muted">
          {tx(locale, {
            ar: "كل هذه الأرقام محفوظة في متصفحك فقط. لا حساب ولا خادم، ومسح بيانات الموقع يعيدها إلى الصفر.",
            fr: "Tous ces chiffres restent dans votre navigateur. Pas de compte, pas de serveur ; effacer les données remet tout à zéro.",
            en: "All these figures stay in your browser. No account, no server; clearing site data resets them.",
          })}
        </p>
      </div>
    </div>
  );
}
