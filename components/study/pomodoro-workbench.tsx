"use client";

import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { tx } from "@/lib/tx";
import { dayKey, formatClock } from "@/lib/study/time";
import { dayStats } from "@/lib/study/pomodoro";
import { usePomodoro, usePomodoroTick } from "./pomodoro-context";
import { TimerRing } from "./ring";
import { IconCheck, IconPause, IconPlay, IconSkip } from "@/components/icons";

const phaseCopy = {
  focus: { ar: "تركيز", fr: "Concentration", en: "Focus" },
  short: { ar: "راحة قصيرة", fr: "Pause courte", en: "Short break" },
  long: { ar: "راحة طويلة", fr: "Pause longue", en: "Long break" },
} as const;

export function PomodoroWorkbench({ locale }: { locale: Locale }) {
  const { state, settings, stats, running, ready, start, pauseTimer, resetTimer, skipPhase, updateSettings, enableNotifications } =
    usePomodoro();
  const today = dayStats(stats, dayKey());
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");

  useEffect(() => {
    if (typeof Notification === "undefined") setPermission("unsupported");
    else setPermission(Notification.permission);
  }, []);

  const cycle = Math.max(1, settings.longEvery);
  const filled = state.inCycle % cycle || (state.inCycle > 0 ? cycle : 0);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
      <section className="card min-w-0 p-5 sm:p-8" aria-labelledby="pomodoro-phase">
        <div className="flex items-center justify-between gap-3">
          <h2 id="pomodoro-phase" className="kicker">
            {tx(locale, { ar: "المؤقّت", fr: "Minuteur", en: "Timer" })}
          </h2>
          <span className="num shrink-0 text-[11px] text-muted">
            {state.completed} {tx(locale, { ar: "جلسة مكتملة", fr: "sessions terminées", en: "sessions done" })}
          </span>
        </div>

        {/* The ring shrinks on phones so the primary controls stay above the
            tab bar; at sm+ it is the original 252px block. */}
        <div className="mt-4 flex justify-center sm:mt-6">
          <div className="w-full max-w-[210px] sm:max-w-[252px]">
            <TimerFace locale={locale} />
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:mt-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
          <button
            type="button"
            onClick={running ? pauseTimer : start}
            className="btn btn-brand min-h-12 w-full active:bg-brand/85 sm:min-h-11 sm:w-auto sm:min-w-[132px]"
          >
            {running ? <IconPause size={16} /> : <IconPlay size={16} />}
            {running
              ? tx(locale, { ar: "إيقاف مؤقت", fr: "Pause", en: "Pause" })
              : state.pausedMs !== null
                ? tx(locale, { ar: "متابعة", fr: "Reprendre", en: "Resume" })
                : tx(locale, { ar: "ابدأ التركيز", fr: "Commencer", en: "Start focus" })}
          </button>
          <div className="flex w-full gap-2 sm:w-auto">
            <button
              type="button"
              onClick={skipPhase}
              className="btn min-h-11 flex-1 active:bg-raised sm:flex-none"
              aria-label={tx(locale, { ar: "تخطي الجلسة", fr: "Passer la session", en: "Skip session" })}
            >
              <IconSkip size={15} />
              {tx(locale, { ar: "تخطي", fr: "Passer", en: "Skip" })}
            </button>
            <button
              type="button"
              onClick={resetTimer}
              className="btn btn-ghost min-h-11 flex-1 active:bg-raised sm:flex-none"
            >
              {tx(locale, { ar: "تصفير", fr: "Réinitialiser", en: "Reset" })}
            </button>
          </div>
        </div>

        {state.label ? (
          <p className="mt-4 break-words text-center text-[12px] text-muted">
            {tx(locale, { ar: "الكتلة", fr: "Bloc", en: "Block" })}: <span className="text-ink">{state.label}</span>
          </p>
        ) : null}

        <TimerAnnouncement locale={locale} />

        <div className="mt-7 border-t border-line pt-4">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[10.5px] uppercase tracking-[0.14em] text-muted">
              {tx(locale, { ar: "دورة الراحة الطويلة", fr: "Cycle de pause longue", en: "Long-break cycle" })}
            </span>
            <div className="flex flex-1 items-center gap-1.5" aria-hidden>
              {Array.from({ length: cycle }, (_, index) => (
                <span key={index} className={`h-[3px] flex-1 ${index < filled ? "bg-brand" : "bg-line"}`} />
              ))}
            </div>
            <span className="num shrink-0 text-[11px] text-muted">
              {filled}/{cycle}
            </span>
          </div>
        </div>
      </section>

      <div className="min-w-0 space-y-6">
        <section className="card p-5 sm:p-6" aria-labelledby="pomodoro-settings">
          <h2 id="pomodoro-settings" className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
            {tx(locale, { ar: "إعدادات الجلسات", fr: "Réglages des sessions", en: "Session settings" })}
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <NumberField
              label={tx(locale, { ar: "تركيز", fr: "Focus", en: "Focus" })}
              value={settings.focus}
              min={5}
              max={120}
              onCommit={(value) => updateSettings({ focus: value })}
            />
            <NumberField
              label={tx(locale, { ar: "راحة قصيرة", fr: "Pause courte", en: "Short" })}
              value={settings.short}
              min={1}
              max={60}
              onCommit={(value) => updateSettings({ short: value })}
            />
            <NumberField
              label={tx(locale, { ar: "راحة طويلة", fr: "Pause longue", en: "Long" })}
              value={settings.long}
              min={5}
              max={90}
              onCommit={(value) => updateSettings({ long: value })}
            />
            <NumberField
              label={tx(locale, { ar: "كل", fr: "Toutes les", en: "Every" })}
              value={settings.longEvery}
              min={2}
              max={8}
              suffix={tx(locale, { ar: "جلسات", fr: "sessions", en: "sessions" })}
              onCommit={(value) => updateSettings({ longEvery: value })}
            />
          </div>

          <ul className="mt-5 divide-y divide-line border-t border-line">
            <ToggleRow
              label={tx(locale, { ar: "الانتقال التلقائي", fr: "Transition automatique", en: "Automatic transitions" })}
              hint={tx(locale, {
                ar: "تبدأ الجلسة التالية مباشرة بعد انتهاء الحالية.",
                fr: "La session suivante démarre dès la fin de la précédente.",
                en: "The next session starts as soon as the current one ends.",
              })}
              checked={settings.autoStart}
              onChange={(checked) => updateSettings({ autoStart: checked })}
            />
            <ToggleRow
              label={tx(locale, { ar: "تنبيه صوتي", fr: "Signal sonore", en: "Sound alert" })}
              hint={tx(locale, {
                ar: "نغمة قصيرة عند تغيّر الجلسة، دون أي ملف خارجي.",
                fr: "Une courte tonalité au changement de session, sans fichier externe.",
                en: "A short tone on session change, with no external file.",
              })}
              checked={settings.sound}
              onChange={(checked) => updateSettings({ sound: checked })}
            />
            <li className="flex flex-wrap items-start justify-between gap-3 py-3">
              <div className="min-w-0 max-w-sm">
                <div className="text-[13px] font-medium text-ink">
                  {tx(locale, { ar: "إشعارات المتصفح", fr: "Notifications du navigateur", en: "Browser notifications" })}
                </div>
                <p className="mt-0.5 text-[11.5px] leading-5 text-muted">
                  {permission === "granted"
                    ? tx(locale, { ar: "مسموح بها.", fr: "Autorisées.", en: "Allowed." })
                    : permission === "denied"
                      ? tx(locale, {
                          ar: "مرفوضة من إعدادات المتصفح؛ يمكنك تغييرها من هناك.",
                          fr: "Refusées dans le navigateur ; modifiable dans ses réglages.",
                          en: "Blocked in the browser; you can change it in browser settings.",
                        })
                      : permission === "unsupported"
                        ? tx(locale, { ar: "غير مدعومة في هذا المتصفح.", fr: "Non prises en charge ici.", en: "Not supported here." })
                        : tx(locale, {
                            ar: "لا نطلب الإذن إلا إذا طلبته أنت.",
                            fr: "Nous ne demandons l’autorisation que si vous le souhaitez.",
                            en: "We only ask for permission when you choose to.",
                          })}
                </p>
              </div>
              {permission === "granted" ? (
                <span className="chip chip-brand">
                  <IconCheck size={12} />
                  {tx(locale, { ar: "مفعّلة", fr: "Activées", en: "Enabled" })}
                </span>
              ) : (
                <button
                  type="button"
                  className="btn btn-sm min-h-11 px-3 active:bg-raised sm:min-h-9"
                  disabled={permission === "unsupported"}
                  onClick={async () => {
                    const result = await enableNotifications();
                    setPermission(result);
                  }}
                >
                  {tx(locale, { ar: "طلب الإذن", fr: "Demander", en: "Ask" })}
                </button>
              )}
            </li>
          </ul>
        </section>

        <section className="card p-5 sm:p-6" aria-labelledby="pomodoro-today">
          <h2 id="pomodoro-today" className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
            {tx(locale, { ar: "اليوم", fr: "Aujourd’hui", en: "Today" })}
          </h2>
          <dl className="mt-4 grid grid-cols-3 gap-4">
            <Metric value={String(today.sessions)} label={tx(locale, { ar: "جلسات", fr: "Sessions", en: "Sessions" })} />
            <Metric value={String(Math.floor(today.ms / 60_000))} label={tx(locale, { ar: "دقيقة تركيز", fr: "Minutes", en: "Minutes" })} />
            <Metric
              value={String(Object.keys(stats.days).filter((day) => (stats.days[day]?.sessions ?? 0) > 0).length)}
              label={tx(locale, { ar: "أيام نشطة", fr: "Jours actifs", en: "Active days" })}
            />
          </dl>
          <p className="mt-4 text-[11.5px] leading-5 text-muted">
            {tx(locale, {
              ar: "تُحسب الدقائق فقط للجلسات المكتملة، وتُحفظ في متصفحك حسب توقيت الجزائر.",
              fr: "Seules les sessions terminées comptent, enregistrées dans votre navigateur au fuseau d’Alger.",
              en: "Only completed sessions count, stored in your browser on Algiers time.",
            })}
          </p>
        </section>
      </div>
    </div>
  );
}

/**
 * The only part of this screen that re-renders every tick: the ring sweep and
 * the clock digits. Everything around it (settings, stats, buttons) is static.
 */
function TimerFace({ locale }: { locale: Locale }) {
  const { state, settings, ready } = usePomodoro();
  const { remaining, progress } = usePomodoroTick();
  const display = ready ? formatClock(remaining) : "--:--";
  const total = state.phase === "focus" ? settings.focus : state.phase === "short" ? settings.short : settings.long;

  return (
    <TimerRing
      progress={progress}
      size={252}
      stroke={3}
      ticks
      label={`${tx(locale, { ar: "الوقت المتبقي في الجلسة", fr: "Temps restant", en: "Time left in session" })}: ${display}`}
    >
      <div className="max-w-full text-center">
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
          {tx(locale, phaseCopy[state.phase])}
        </div>
        <div className="num mt-2 font-display text-[46px] font-semibold leading-none text-ink sm:text-[54px] lg:text-[62px]">
          {display}
        </div>
        <div className="mt-2 text-[11px] text-muted">
          {tx(locale, {
            ar: `من ${total} دقيقة`,
            fr: `sur ${total} minutes`,
            en: `of ${total} minutes`,
          })}
        </div>
      </div>
    </TimerRing>
  );
}

/**
 * Polite live region for meaningful moments only — never every second:
 * a phase start, then the 5- and 1-minute marks.
 */
function TimerAnnouncement({ locale }: { locale: Locale }) {
  const { state, ready } = usePomodoro();
  const { remaining } = usePomodoroTick();
  const [message, setMessage] = useState("");
  const previous = useRef<{ phase: string; running: boolean; minutes: number }>({
    phase: state.phase,
    running: state.endsAt !== null,
    minutes: -1,
  });

  const running = state.endsAt !== null;
  const minutes = Math.max(1, Math.ceil(remaining / 60_000));

  useEffect(() => {
    if (!ready) return;
    const last = previous.current;
    previous.current = { phase: state.phase, running, minutes };
    if (!running) return;

    if (!last.running || last.phase !== state.phase) {
      setMessage(
        tx(locale, {
          ar: `بدأت ${phaseCopy[state.phase].ar}: ${minutes} دقيقة.`,
          fr: `${phaseCopy[state.phase].fr} : ${minutes} minutes.`,
          en: `${phaseCopy[state.phase].en}: ${minutes} minutes.`,
        }),
      );
      return;
    }
    if (last.minutes !== minutes && (minutes === 5 || minutes === 1)) {
      setMessage(
        tx(locale, {
          ar: `بقيت ${minutes === 1 ? "دقيقة واحدة" : `${minutes} دقائق`}.`,
          fr: minutes === 1 ? "Il reste une minute." : `Il reste ${minutes} minutes.`,
          en: minutes === 1 ? "One minute left." : `${minutes} minutes left.`,
        }),
      );
    }
  }, [ready, running, state.phase, minutes, locale]);

  return (
    <p aria-live="polite" aria-atomic="true" className="sr-only">
      {message}
    </p>
  );
}

function NumberField({
  label,
  value,
  min,
  max,
  suffix,
  onCommit,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  suffix?: string;
  onCommit: (value: number) => void;
}) {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);

  const commit = () => {
    const parsed = Number(draft);
    if (!Number.isFinite(parsed)) {
      setDraft(String(value));
      return;
    }
    const clamped = Math.min(max, Math.max(min, Math.round(parsed)));
    setDraft(String(clamped));
    if (clamped !== value) onCommit(clamped);
  };

  return (
    <label className="block min-w-0">
      <span className="mb-1 block text-[10.5px] uppercase tracking-[0.1em] text-muted">{label}</span>
      <span className="flex items-baseline gap-1.5">
        <input
          type="number"
          inputMode="numeric"
          enterKeyHint="done"
          min={min}
          max={max}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commit();
            }
          }}
          className="input num h-11 min-w-0 px-2 text-center sm:h-10"
          aria-label={label}
        />
        {suffix ? <span className="shrink-0 text-[10px] text-muted">{suffix}</span> : null}
      </span>
    </label>
  );
}

function ToggleRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <li className="flex items-center justify-between gap-3 py-1 sm:py-3">
      <div className="min-w-0 max-w-sm py-2 sm:py-0">
        <div className="text-[13px] font-medium text-ink">{label}</div>
        <p className="mt-0.5 text-[11.5px] leading-5 text-muted">{hint}</p>
      </div>
      {/* 44px hit area on phones; the original 44x24 track on desktop. */}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className="grid h-11 w-12 shrink-0 place-items-center sm:h-6 sm:w-11"
      >
        <span
          aria-hidden
          className={`relative block h-6 w-11 border transition-colors ${checked ? "border-brand bg-brand" : "border-line-strong bg-transparent"}`}
        >
          <span
            aria-hidden
            className={`absolute top-0.5 h-4 w-4 transition-all ${checked ? "start-[calc(100%-1.125rem)] bg-brand-ink" : "start-0.5 bg-line-strong"}`}
          />
        </span>
      </button>
    </li>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] uppercase tracking-[0.12em] text-muted">{label}</dt>
      <dd className="num mt-1 text-2xl font-semibold text-ink">{value}</dd>
    </div>
  );
}
