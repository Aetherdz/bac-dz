"use client";

import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { pathFor } from "@/lib/routes";
import { tx } from "@/lib/tx";
import { dayKey, formatClock } from "@/lib/study/time";
import { dayStats, phaseLabel } from "@/lib/study/pomodoro";
import { usePomodoro, usePomodoroTick } from "./pomodoro-context";
import { TimerRing } from "./ring";
import { IconArrow, IconPause, IconPlay } from "@/components/icons";

export function QuickFocus({ locale }: { locale: Locale }) {
  const { state, stats, running, ready, start, pauseTimer, resetTimer } = usePomodoro();
  const today = dayStats(stats, dayKey());

  return (
    <div className="card min-w-0 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="eyebrow">{tx(locale, { ar: "المؤقت", fr: "Minuteur", en: "Timer" })}</div>
          <h2 className="mt-1 break-words font-display text-xl font-semibold text-ink">
            {tx(locale, phaseLabel[state.phase])}
          </h2>
        </div>
        <span className="num shrink-0 text-[11px] text-muted">
          {today.sessions} {tx(locale, { ar: "جلسة اليوم", fr: "aujourd’hui", en: "today" })}
        </span>
      </div>

      <div className="mt-5 flex items-center gap-4 sm:gap-5">
        <div className="shrink-0">
          <QuickRing locale={locale} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={running ? pauseTimer : start}
              className="btn btn-sm btn-primary min-h-11 flex-1 px-3 active:bg-brand/85 sm:min-h-9 sm:flex-none"
            >
              {running ? <IconPause size={14} /> : <IconPlay size={14} />}
              {running
                ? tx(locale, { ar: "إيقاف", fr: "Pause", en: "Pause" })
                : state.pausedMs !== null
                  ? tx(locale, { ar: "متابعة", fr: "Reprendre", en: "Resume" })
                  : tx(locale, { ar: "ابدأ", fr: "Démarrer", en: "Start" })}
            </button>
            <button
              type="button"
              onClick={resetTimer}
              className="btn btn-sm btn-ghost min-h-11 px-3 active:bg-raised sm:min-h-9"
            >
              {tx(locale, { ar: "تصفير", fr: "Reset", en: "Reset" })}
            </button>
          </div>
          <p className="mt-2 break-words text-[11.5px] leading-5 text-muted">
            {state.label
              ? state.label
              : tx(locale, {
                  ar: "يكمل المؤقت عمله أثناء تنقّلك بين الصفحات.",
                  fr: "Le minuteur continue pendant votre navigation.",
                  en: "The timer keeps running as you navigate.",
                })}
          </p>
        </div>
      </div>

      <div aria-hidden className="mt-4 h-px w-full bg-line">
        <QuickProgress />
      </div>

      <Link
        href={pathFor(locale, { name: "pomodoro" })}
        className="link mt-1 inline-flex min-h-11 items-center gap-1 text-[12.5px] sm:mt-3 sm:min-h-0"
      >
        {tx(locale, { ar: "افتح المؤقت كاملًا", fr: "Ouvrir le minuteur complet", en: "Open the full timer" })}
        <IconArrow size={13} />
      </Link>
    </div>
  );
}

/** Ticking leaf: the dial only. */
function QuickRing({ locale }: { locale: Locale }) {
  const { ready } = usePomodoro();
  const { remaining, progress } = usePomodoroTick();
  const display = ready ? formatClock(remaining) : "--:--";

  return (
    <TimerRing
      progress={progress}
      size={92}
      stroke={2.5}
      label={`${tx(locale, { ar: "الوقت المتبقي", fr: "Temps restant", en: "Time left" })}: ${display}`}
    >
      <span className="num font-display text-[18px] font-semibold text-ink sm:text-[21px]">{display}</span>
    </TimerRing>
  );
}

/** Ticking leaf: the hairline progress bar. */
function QuickProgress() {
  const { progress } = usePomodoroTick();
  return <div className="h-px bg-brand transition-[width] duration-500" style={{ width: `${Math.round(progress * 100)}%` }} />;
}
