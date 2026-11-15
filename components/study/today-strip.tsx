"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { Locale } from "@/lib/i18n";
import { pathFor } from "@/lib/routes";
import { tx } from "@/lib/tx";
import { STORAGE_KEYS, readStored } from "@/lib/study/store";
import { emptyStats, dayStats, isStatsStore } from "@/lib/study/pomodoro";
import { emptyTasks, isTaskStore, taskProgress } from "@/lib/study/tasks";
import { computeStreak, dayKey } from "@/lib/study/time";
import { useNow, useStudySignal } from "@/lib/study/use-stored";
import { IconArrow } from "@/components/icons";

export function TodayStrip({ locale }: { locale: Locale }) {
  const signal = useStudySignal();
  const now = useNow(true, 30_000);

  const { sessions, minutes, percent, streak, empty } = useMemo(() => {
    void signal;
    const stats = readStored(STORAGE_KEYS.stats, emptyStats(), isStatsStore);
    const tasks = readStored(STORAGE_KEYS.tasks, emptyTasks(), isTaskStore);
    const today = dayKey(now);
    const todayStats = dayStats(stats, today);
    const activeDays = Object.keys(stats.days).filter((day) => (stats.days[day]?.sessions ?? 0) > 0);
    return {
      sessions: todayStats.sessions,
      minutes: Math.floor(todayStats.ms / 60_000),
      percent: taskProgress(tasks, today),
      streak: computeStreak(activeDays, now),
      empty: activeDays.length === 0 && tasks.tasks.length === 0,
    };
  }, [signal, now]);

  const metrics = [
    { value: String(sessions), label: tx(locale, { ar: "جلسات اليوم", fr: "Sessions du jour", en: "Sessions today" }) },
    { value: String(minutes), label: tx(locale, { ar: "دقائق التركيز", fr: "Minutes de focus", en: "Focus minutes" }) },
    { value: `${percent}%`, label: tx(locale, { ar: "إنجاز المهام", fr: "Tâches terminées", en: "Tasks done" }) },
    { value: String(streak), label: tx(locale, { ar: "أيام متتالية", fr: "Jours d’affilée", en: "Day streak" }) },
  ];

  return (
    <div className="border-y border-line">
      {empty ? (
        <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
              {tx(locale, { ar: "سجلّك اليوم", fr: "Votre journal du jour", en: "Today’s record" })}
            </p>
            <p className="mt-1.5 text-[12.5px] leading-5 text-muted">
              {tx(locale, {
                ar: "لا شيء مسجّل بعد. ابدأ جلسة تركيز أو أضف مهمة، وستظهر أرقامك الحقيقية هنا.",
                fr: "Rien d’enregistré. Lancez une session ou ajoutez une tâche : vos vrais chiffres apparaîtront ici.",
                en: "Nothing recorded yet. Start a session or add a task and your real numbers appear here.",
              })}
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:shrink-0 sm:items-center">
            <Link
              href={pathFor(locale, { name: "pomodoro" })}
              className="btn btn-primary btn-sm min-h-11 w-full active:bg-brand/85 sm:min-h-9 sm:w-auto"
            >
              {tx(locale, { ar: "ابدأ تركيزًا", fr: "Lancer un focus", en: "Start focus" })}
            </Link>
            <Link
              href={pathFor(locale, { name: "tasks" })}
              className="btn btn-sm min-h-11 w-full active:bg-raised sm:min-h-9 sm:w-auto"
            >
              {tx(locale, { ar: "أضف مهمة", fr: "Ajouter une tâche", en: "Add a task" })}
            </Link>
          </div>
        </div>
      ) : (
        <dl className="grid grid-cols-2 divide-line sm:grid-cols-4 sm:divide-x rtl:sm:divide-x-reverse">
          {metrics.map((metric) => (
            <div key={metric.label} className="px-0 py-4 sm:px-5 sm:first:ps-0">
              <dd className="num font-display text-3xl font-semibold leading-none text-ink">{metric.value}</dd>
              <dt className="mt-1.5 text-[10px] uppercase tracking-[0.14em] text-muted">{metric.label}</dt>
            </div>
          ))}
        </dl>
      )}
      <div className="border-t border-line py-1 sm:py-3">
        <Link
          href={pathFor(locale, { name: "studySpace" })}
          className="link inline-flex min-h-11 items-center gap-1 text-[12.5px] sm:min-h-0"
        >
          {tx(locale, { ar: "افتح فضاء المراجعة", fr: "Ouvrir mon espace d’étude", en: "Open my study space" })}
          <IconArrow size={13} />
        </Link>
      </div>
    </div>
  );
}
