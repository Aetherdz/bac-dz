"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { tx } from "@/lib/tx";
import type { Localized } from "@/content/bac";
import { examTimestamp } from "@/content/exam-dates";
import { useNow } from "@/lib/study/use-stored";

const copy = {
  official: { ar: "الموعد الرسمي", fr: "Date officielle", en: "Official date" },
  estimated: { ar: "موعد تقديري — ليس رسميًا", fr: "Date estimée — pas officielle", en: "Estimated date — not official" },
  days: { ar: "يوم", fr: "jours", en: "days" },
  hours: { ar: "ساعة", fr: "heures", en: "hours" },
  minutes: { ar: "دقيقة", fr: "minutes", en: "minutes" },
  seconds: { ar: "ثانية", fr: "secondes", en: "seconds" },
  timeLeft: { ar: "الوقت المتبقي", fr: "Temps restant", en: "Time left" },
  target: { ar: "الهدف", fr: "Cible", en: "Target" },
  passed: {
    ar: "مرّ الموعد المحسوب. ننتظر نشر التقويم الرسمي للدورة القادمة لتحديث العدّاد.",
    fr: "La date calculée est passée. Nous attendons le calendrier officiel de la prochaine session.",
    en: "The computed date has passed. Waiting for the official calendar of the next session.",
  },
} as const;

function split(totalMs: number) {
  const seconds = Math.max(0, Math.floor(totalMs / 1000));
  return {
    days: Math.floor(seconds / 86_400),
    hours: Math.floor((seconds % 86_400) / 3_600),
    minutes: Math.floor((seconds % 3_600) / 60),
    seconds: seconds % 60,
  };
}

const pad = (value: number) => String(value).padStart(2, "0");

function formatTarget(locale: Locale, iso: string): string {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-DZ" : locale === "fr" ? "fr-DZ" : "en-GB", {
    dateStyle: "full",
    timeZone: "Africa/Algiers",
  }).format(new Date(examTimestamp(iso)));
}

/**
 * The bac countdown. It always runs: on an official date when one exists, on a
 * clearly labelled estimate otherwise. Everything else on the page — the rule,
 * the sources, the "not eligibility" caveats — is server-rendered; this
 * component only owns the clock.
 */
export function CountdownPanel({
  locale,
  target,
  rule,
  note,
  variant = "page",
}: {
  locale: Locale;
  /** Official date when it exists, otherwise the stated estimate. */
  target: { iso: string | null; kind: "official" | "estimated" };
  rule?: Localized | null;
  note?: Localized | null;
  variant?: "hero" | "page";
}) {
  // Render the digits only after mount so server HTML and client HTML agree.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const estimated = target.kind === "estimated";
  const targetTs = target.iso ? examTimestamp(target.iso) : null;

  if (!mounted || targetTs === null) {
    return (
      <div className={variant === "hero" ? "min-h-[132px]" : "min-h-[176px]"} aria-busy="true">
        <span className="sr-only">
          {tx(locale, { ar: "جارٍ حساب الوقت المتبقي", fr: "Calcul du temps restant", en: "Computing time left" })}
        </span>
      </div>
    );
  }

  return (
    <div className={variant === "hero" ? "" : "border-y border-line-strong py-4"}>
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
        <span
          className={`inline-flex items-center gap-1.5 border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${
            estimated ? "border-line-strong text-ink" : "border-brand/40 text-brand"
          }`}
        >
          <span aria-hidden className={`h-1.5 w-1.5 ${estimated ? "bg-ink" : "bg-brand"}`} />
          {tx(locale, estimated ? copy.estimated : copy.official)}
        </span>
        <span className="num text-[11px] text-muted">08:00 · Africa/Algiers</span>
      </div>

      <CountdownCells targetTs={targetTs} locale={locale} variant={variant} />

      <p className="mt-3 text-[11.5px] leading-5 text-muted">
        {tx(locale, copy.target)}:{" "}
        <time dateTime={target.iso ?? undefined} className="text-ink/80">
          {target.iso ? formatTarget(locale, target.iso) : ""}
        </time>
      </p>

      {estimated && rule ? (
        <p className="mt-1.5 text-[11.5px] leading-5 text-muted">{tx(locale, rule)}</p>
      ) : note ? (
        <p className="mt-1.5 text-[11.5px] leading-5 text-muted">{tx(locale, note)}</p>
      ) : null}
    </div>
  );
}

/**
 * Ticking leaf. One second granularity, but scoped to the four cells so the
 * surrounding prose never re-renders.
 *
 * Days come first on the LEFT in every locale, estimated or official: the
 * sequence reads largest unit to smallest, which is easier to scan than
 * mirroring it with the page direction.
 */
function CountdownCells({ targetTs, locale, variant }: { targetTs: number; locale: Locale; variant: "hero" | "page" }) {
  const now = useNow(true);
  const remaining = targetTs - now;
  const parts = split(remaining);

  const cells = [
    { value: String(parts.days), label: tx(locale, copy.days) },
    { value: pad(parts.hours), label: tx(locale, copy.hours) },
    { value: pad(parts.minutes), label: tx(locale, copy.minutes) },
    { value: pad(parts.seconds), label: tx(locale, copy.seconds) },
  ];

  const grid =
    variant === "hero"
      ? "mt-3 grid grid-cols-2 gap-x-2 gap-y-3 text-left sm:grid-cols-4 sm:gap-y-0"
      : "mt-3 grid grid-cols-2 gap-x-4 gap-y-4 text-left sm:grid-cols-4 sm:gap-x-0 sm:gap-y-0 sm:divide-x sm:divide-line";

  return (
    <dl className={grid} dir="ltr" aria-live="off" aria-label={tx(locale, copy.timeLeft)}>
      {cells.map((cell) => (
        <div key={cell.label} className={variant === "hero" ? "min-w-0" : "min-w-0 px-0 sm:px-4 sm:first:ps-0"}>
          <dd
            className={
              variant === "hero"
                ? "num font-display text-[2.4rem] font-semibold leading-none tracking-tight text-ink sm:text-[2.9rem]"
                : "num font-display text-[2.6rem] font-semibold leading-none tracking-tight text-ink sm:text-[3.1rem]"
            }
          >
            {remaining > 0 ? cell.value : "0"}
          </dd>
          <dt className="mt-1 text-[10px] uppercase tracking-[0.16em] text-muted">{cell.label}</dt>
        </div>
      ))}
    </dl>
  );
}
