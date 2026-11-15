"use client";

import { useEffect, useMemo, useState } from "react";
import { getDict, type Locale } from "@/lib/i18n";
import { tx } from "@/lib/tx";
import { streams, subjectById } from "@/content/bac";
import { allocateStudyMinutes, parseGrade, round2 } from "@/lib/bac";
import { Bar, Field, ResultPanel, Select, usePersistentState } from "./parts";

/* ------------------------------------------------------------------ */
/* Countdown                                                           */
/* ------------------------------------------------------------------ */

export function BacCountdown({ locale }: { locale: Locale }) {
  const dict = getDict(locale);
  const [date, setDate] = usePersistentState<string>("bacdz-exam-date", "2027-06-08");
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const target = useMemo(() => new Date(`${date}T08:00:00`), [date]);
  const diff = target.getTime() - (now ?? 0);
  const days = now === null ? null : Math.max(0, Math.floor(diff / 86_400_000));
  const hours = now === null ? null : Math.max(0, Math.floor((diff % 86_400_000) / 3_600_000));
  const minutes = now === null ? null : Math.max(0, Math.floor((diff % 3_600_000) / 60_000));

  return (
    <div className="space-y-4">
      <div className="rounded-card border border-brand/25 bg-brand/[0.06] p-5 text-center">
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
          {tx(locale, { ar: "الوقت المتبقي", fr: "Temps restant", en: "Time remaining" })}
        </div>
        {days === null ? (
          <div className="mt-2 h-14 animate-pulse rounded bg-line/50" aria-hidden />
        ) : (
          <div className="mt-2 flex items-end justify-center gap-3" dir="ltr" aria-live="polite">
            <div>
              <div className="num text-4xl font-semibold text-ink sm:text-5xl">{days}</div>
              <div className="text-[11px] text-muted">{tx(locale, { ar: "يوم", fr: "jours", en: "days" })}</div>
            </div>
            <div className="pb-5 text-2xl text-muted">:</div>
            <div>
              <div className="num text-2xl font-semibold text-ink sm:text-3xl">{String(hours).padStart(2, "0")}</div>
              <div className="text-[11px] text-muted">{tx(locale, { ar: "ساعة", fr: "heures", en: "hours" })}</div>
            </div>
            <div className="pb-4 text-2xl text-muted">:</div>
            <div>
              <div className="num text-2xl font-semibold text-ink sm:text-3xl">{String(minutes).padStart(2, "0")}</div>
              <div className="text-[11px] text-muted">{tx(locale, { ar: "دقيقة", fr: "min", en: "min" })}</div>
            </div>
          </div>
        )}
      </div>
      <Field
        label={dict.planner.examDate}
        htmlFor="countdown-date"
        hint={tx(locale, {
          ar: "اختر تاريخًا يناسبك. التاريخ الافتراضي مبدئي وغير رسمي: لم تُعلن الوزارة بعد عن رزنامة دورة 2027.",
          fr: "Choisissez votre date. La valeur par défaut est indicative : le ministère n’a pas encore publié le calendrier 2027.",
          en: "Pick your own date. The default is indicative: the ministry has not published the 2027 calendar yet.",
        })}
      >
        <input
          id="countdown-date"
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          className="input num max-w-[220px]"
        />
      </Field>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Weighted average (generic)                                          */
/* ------------------------------------------------------------------ */

type Row = { id: number; label: string; weight: string; grade: string };

export function WeightedAverage({ locale }: { locale: Locale }) {
  const dict = getDict(locale);
  const [rows, setRows] = usePersistentState<Row[]>("bacdz-weighted", [
    { id: 1, label: "", weight: "3", grade: "" },
    { id: 2, label: "", weight: "2", grade: "" },
    { id: 3, label: "", weight: "1", grade: "" },
  ]);

  const parsed = rows.map((row) => {
    const weight = Number(row.weight.replace(",", "."));
    const grade = parseGrade(row.grade);
    return {
      ...row,
      weightValid: Number.isFinite(weight) && weight > 0 && weight <= 100,
      gradeValue: grade === "invalid" || grade === null ? null : grade,
      gradeInvalid: grade === "invalid",
    };
  });

  const valid = parsed.filter((row) => row.weightValid && row.gradeValue !== null);
  const totalWeight = round2(valid.reduce((sum, row) => sum + Number(row.weight), 0));
  const average = totalWeight > 0 ? round2(valid.reduce((sum, row) => sum + (row.gradeValue as number) * Number(row.weight), 0) / totalWeight) : null;

  function update(id: number, patch: Partial<Row>) {
    setRows(rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {rows.map((row, index) => (
          <div key={row.id} className="grid grid-cols-[1fr_74px_74px_36px] items-center gap-2">
            <input
              aria-label={`${dict.common.subject} ${index + 1}`}
              value={row.label}
              onChange={(event) => update(row.id, { label: event.target.value })}
              placeholder={tx(locale, { ar: "اسم المادة", fr: "Matière", en: "Subject" })}
              className="input text-[13px]"
            />
            <input
              aria-label={`${dict.common.coefficient} ${index + 1}`}
              dir="ltr"
              inputMode="decimal"
              value={row.weight}
              onChange={(event) => update(row.id, { weight: event.target.value })}
              className="input num px-2 text-center text-[13px]"
            />
            <input
              aria-label={`${dict.common.grade} ${index + 1}`}
              dir="ltr"
              inputMode="decimal"
              value={row.grade}
              onChange={(event) => update(row.id, { grade: event.target.value })}
              placeholder="—"
              className={`num input px-2 text-center text-[13px] ${parsed[index].gradeInvalid ? "border-accent" : ""}`}
            />
            <button
              type="button"
              onClick={() => setRows(rows.filter((item) => item.id !== row.id))}
              aria-label={dict.actions.remove}
              className="grid h-9 w-9 place-items-center rounded-full border border-line text-muted hover:border-accent hover:text-accent"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="btn btn-sm"
          onClick={() => setRows([...rows, { id: Date.now(), label: "", weight: "1", grade: "" }])}
        >
          + {dict.actions.addSubject}
        </button>
        <button type="button" className="btn btn-sm" onClick={() => setRows([{ id: Date.now(), label: "", weight: "1", grade: "" }])}>
          {dict.actions.reset}
        </button>
      </div>
      <ResultPanel
        label={dict.tools.weighted}
        value={average === null ? "—" : average.toFixed(2)}
        suffix="/ 20"
        tone={average === null ? "neutral" : "brand"}
      >
        <div className="mt-2 text-[11.5px] text-muted">
          Σ {dict.common.coefficient}: <span className="num">{totalWeight}</span> · {valid.length}/{rows.length} {dict.common.subject}
        </div>
      </ResultPanel>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Study time calculator                                               */
/* ------------------------------------------------------------------ */

export function StudyTimeCalculator({ locale }: { locale: Locale }) {
  const dict = getDict(locale);
  const [streamId, setStreamId] = useState<string>(streams[0].id);
  const [hours, setHours] = usePersistentState<string>("bacdz-study-hours", "15");
  const stream = streams.find((item) => item.id === streamId) ?? streams[0];
  const weeklyMinutes = Math.max(0, Math.min(80, Number(hours.replace(",", ".")) || 0)) * 60;

  const allocation = allocateStudyMinutes(
    stream.coefficients.map((entry) => ({ subject: entry.subject, coefficient: entry.coefficient })),
    weeklyMinutes,
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={dict.common.stream} htmlFor="study-stream">
          <Select id="study-stream" value={streamId} onChange={setStreamId}>
            {streams.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name[locale]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={dict.planner.hoursPerWeek} htmlFor="study-hours">
          <input
            id="study-hours"
            type="number"
            min={1}
            max={80}
            dir="ltr"
            value={hours}
            onChange={(event) => setHours(event.target.value)}
            className="input num"
          />
        </Field>
      </div>

      <div className="rounded-card border border-line">
        <table className="data">
          <thead>
            <tr>
              <th scope="col">{dict.common.subject}</th>
              <th scope="col" className="n">{dict.common.coefficient}</th>
              <th scope="col" className="n">{tx(locale, { ar: "دقائق/أسبوع", fr: "min/semaine", en: "min/week" })}</th>
              <th scope="col" className="w-24"><span className="sr-only">share</span></th>
            </tr>
          </thead>
          <tbody>
            {allocation.map((row) => (
              <tr key={row.subject}>
                <td>{subjectById[row.subject as keyof typeof subjectById]?.name[locale] ?? row.subject}</td>
                <td className="n">{stream.coefficients.find((e) => e.subject === row.subject)?.coefficient}</td>
                <td className="n">{row.minutes}</td>
                <td><Bar value={row.share} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[11.5px] leading-5 text-muted">
        {tx(locale, {
          ar: "التوزيع يقترح وقتًا أدنى لكل مادة ثم يوزّع الباقي بحسب المعامل. عدّله حسب صعوبتك الشخصية.",
          fr: "La répartition garantit un minimum par matière puis distribue le reste selon le coefficient. Ajustez selon vos difficultés.",
          en: "The split guarantees a minimum per subject then distributes the rest by coefficient. Adjust to your own weaknesses.",
        })}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Grade improvement                                                   */
/* ------------------------------------------------------------------ */

export function ImprovementCalculator({ locale }: { locale: Locale }) {
  const dict = getDict(locale);
  const [streamId, setStreamId] = useState<string>(streams[0].id);
  const [grades, setGrades] = usePersistentState<Record<string, string>>("bacdz-improve", {});
  const stream = streams.find((item) => item.id === streamId) ?? streams[0];

  const entries = stream.coefficients.map((entry) => {
    const parsed = parseGrade(grades[entry.subject] ?? "");
    return {
      subject: entry.subject,
      coefficient: entry.coefficient,
      name: entry.variant?.[locale] ?? subjectById[entry.subject].name[locale],
      grade: parsed === "invalid" || parsed === null ? null : parsed,
    };
  });

  const totalCoef = stream.coefficients.reduce((sum, entry) => sum + entry.coefficient, 0);
  const rows = entries
    .map((entry) => ({
      ...entry,
      gain: round2((1 / totalCoef) * entry.coefficient),
    }))
    .sort((a, b) => b.gain - a.gain);

  return (
    <div className="space-y-4">
      <Field label={dict.common.stream} htmlFor="improve-stream">
        <Select id="improve-stream" value={streamId} onChange={(value) => { setStreamId(value); setGrades({}); }}>
          {streams.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name[locale]}
            </option>
          ))}
        </Select>
      </Field>

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th scope="col">{dict.common.subject}</th>
              <th scope="col" className="n">{dict.common.grade}</th>
              <th scope="col" className="n">+1</th>
              <th scope="col" className="n">+2</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.subject}>
                <td>
                  <div className="font-medium">{row.name}</div>
                  <div className="text-[10.5px] text-muted">
                    {dict.common.coefficient} {row.coefficient}
                  </div>
                </td>
                <td className="n">
                  <input
                    aria-label={`${row.name} — ${dict.common.grade}`}
                    dir="ltr"
                    inputMode="decimal"
                    value={grades[row.subject] ?? ""}
                    onChange={(event) => setGrades({ ...grades, [row.subject]: event.target.value })}
                    placeholder="—"
                    className="num h-9 w-16 rounded-md border border-line bg-surface px-2 text-center text-[13px] outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                  />
                  {row.grade !== null && <div className="mt-0.5 text-[10px] text-muted">→ {row.grade.toFixed(2)}</div>}
                </td>
                <td className="n font-medium text-brand">+{row.gain.toFixed(2)}</td>
                <td className="n font-medium text-brand">+{(row.gain * 2).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[11.5px] leading-5 text-muted">
        {tx(locale, {
          ar: "كل نقطة إضافية في مادة ترفع المعدل بمقدار (معامل المادة ÷ مجموع المعاملات). الجدول مرتب من الأكثر تأثيرًا إلى الأقل.",
          fr: "Chaque point gagné augmente la moyenne de (coefficient ÷ total des coefficients). Le tableau est trié par impact décroissant.",
          en: "Each extra point raises the average by (subject coefficient ÷ total coefficients). Sorted by impact.",
        })}
      </p>
    </div>
  );
}
