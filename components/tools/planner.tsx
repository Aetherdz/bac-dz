"use client";

import { useMemo, useState } from "react";
import { getDict, type Locale } from "@/lib/i18n";
import { tx } from "@/lib/tx";
import { streams, subjectById } from "@/content/bac";
import { buildMultiWeekPlan, buildWeekPlan, downloadText, plannerToIcs, type PlanBlock } from "@/lib/planner";
import { Field, Select, usePersistentState } from "./parts";

const DAY_NAMES: Record<Locale, string[]> = {
  ar: ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"],
  fr: ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"],
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
};

type PlannerState = {
  stream: string;
  weeks: number;
  hours: number;
  days: number;
  blocks: PlanBlock[];
};

const initial: PlannerState = { stream: streams[0].id, weeks: 4, hours: 15, days: 5, blocks: [] };

export function StudyPlanner({ locale }: { locale: Locale }) {
  const dict = getDict(locale);
  const [state, setState] = usePersistentState<PlannerState>("bacdz-planner", initial);
  const stream = streams.find((item) => item.id === state.stream) ?? streams[0];
  const label = (subject: string) => subjectById[subject as keyof typeof subjectById]?.name[locale] ?? subject;

  const generated = state.blocks.length > 0;
  const total = state.blocks.length;
  const done = state.blocks.filter((block) => block.done).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const weekMinutes = state.blocks
    .filter((block) => block.week === 0)
    .reduce((sum, block) => sum + block.minutes, 0);
  const weeklyHours = Math.round((weekMinutes / 60) * 10) / 10;

  function generate() {
    const blocks = buildMultiWeekPlan(
      stream.coefficients.map((entry) => ({ subject: entry.subject, coefficient: entry.coefficient })),
      Math.max(60, state.hours * 60),
      state.days,
      state.weeks,
    );
    setState({ ...state, blocks });
  }

  function toggle(id: string) {
    setState({ ...state, blocks: state.blocks.map((block) => (block.id === id ? { ...block, done: !block.done } : block)) });
  }

  function exportIcs() {
    const start = new Date();
    start.setDate(start.getDate() + ((7 - start.getDay()) % 7));
    const content = plannerToIcs({
      blocks: state.blocks,
      startDate: start,
      subjectLabel: label,
      summaryPrefix: tx(locale, { ar: "مراجعة", fr: "Révision", en: "Revision" }),
    });
    downloadText("bac-dz-planning.ics", content, "text/calendar;charset=utf-8");
  }

  const weeks = useMemo(() => Array.from({ length: state.weeks }, (_, index) => index), [state.weeks]);

  return (
    <div className="space-y-5">
      <div className="card p-5">
        <div className="eyebrow mb-3">{dict.planner.setup}</div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field label={dict.common.stream} htmlFor="planner-stream">
            <Select id="planner-stream" value={state.stream} onChange={(value) => setState({ ...state, stream: value, blocks: [] })}>
              {streams.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name[locale]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={dict.planner.weeks} htmlFor="planner-weeks">
            <input
              id="planner-weeks"
              type="number"
              min={1}
              max={16}
              dir="ltr"
              value={state.weeks}
              onChange={(event) => setState({ ...state, weeks: Math.max(1, Math.min(16, Number(event.target.value) || 1)), blocks: [] })}
              className="input num"
            />
          </Field>
          <Field label={dict.planner.hoursPerWeek} htmlFor="planner-hours">
            <input
              id="planner-hours"
              type="number"
              min={1}
              max={60}
              dir="ltr"
              value={state.hours}
              onChange={(event) => setState({ ...state, hours: Math.max(1, Math.min(60, Number(event.target.value) || 1)), blocks: [] })}
              className="input num"
            />
          </Field>
          <Field label={tx(locale, { ar: "أيام الأسبوع", fr: "Jours par semaine", en: "Days per week" })} htmlFor="planner-days">
            <Select id="planner-days" value={String(state.days)} onChange={(value) => setState({ ...state, days: Number(value), blocks: [] })}>
              <option value="5">5</option>
              <option value="6">6</option>
              <option value="7">7</option>
            </Select>
          </Field>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button type="button" onClick={generate} className="btn btn-primary btn-sm">
            {dict.planner.generate}
          </button>
          {generated && (
            <>
              <button type="button" onClick={exportIcs} className="btn btn-sm">
                {dict.planner.exportIcs}
              </button>
              <button type="button" onClick={() => setState({ ...state, blocks: [] })} className="btn btn-sm">
                {dict.planner.resetPlan}
              </button>
            </>
          )}
          <span className="text-[11px] text-muted">{dict.planner.savedNote}</span>
        </div>
      </div>

      {generated && (
        <>
          <div className="card p-5">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-ink">{dict.planner.progress}</div>
              <div className="num text-sm text-muted">
                {done}/{total} · {pct}%
              </div>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-line/70">
              <div className="h-full rounded-full bg-brand transition-[width]" style={{ width: `${pct}%` }} />
            </div>
            <p className="mt-2 text-[11px] text-muted">
              {pct >= 100
                ? tx(locale, { ar: "أتممت المخطط بالكامل. أنشئ مخططًا جديدًا للمرحلة القادمة.", fr: "Plan terminé. Créez-en un nouveau pour la phase suivante.", en: "Plan complete. Generate a new one for the next phase." })
                : tx(locale, { ar: `≈ ${weeklyHours} ساعة مراجعة في الأسبوع. الوزن الأكبر لمواد المعامل العالي.`, fr: `≈ ${weeklyHours} h de révision par semaine, priorité aux forts coefficients.`, en: `≈ ${weeklyHours} h of revision per week, weighted towards high coefficients.` })}
            </p>
          </div>

          <div className="space-y-4">
            {weeks.map((week) => {
              const weekBlocks = state.blocks.filter((block) => block.week === week);
              if (weekBlocks.length === 0) return null;
              return (
                <section key={week} className="card overflow-hidden">
                  <h3 className="border-b border-line bg-raised px-4 py-2.5 text-[13px] font-semibold text-ink">
                    {tx(locale, { ar: "الأسبوع", fr: "Semaine", en: "Week" })} {week + 1}
                    <span className="ms-2 text-[11px] font-normal text-muted">
                      {Math.round((weekBlocks.reduce((sum, block) => sum + block.minutes, 0) / 60) * 10) / 10} {dict.common.hours}
                    </span>
                  </h3>
                  <ul className="divide-y divide-line">
                    {weekBlocks.map((block) => (
                      <li key={block.id} className="flex items-center gap-3 px-4 py-2.5">
                        <div className="w-20 shrink-0 text-[11px] text-muted">{DAY_NAMES[locale][block.day % 7]}</div>
                        <div className="min-w-0 flex-1">
                          <div className={`truncate text-[13px] ${block.done ? "text-muted line-through" : "font-medium text-ink"}`}>
                            {label(block.subject)}
                          </div>
                        </div>
                        <div className="num shrink-0 text-[11.5px] text-muted">{block.minutes}′</div>
                        <button
                          type="button"
                          onClick={() => toggle(block.id)}
                          aria-pressed={block.done}
                          className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border text-[11px] ${
                            block.done ? "border-brand bg-brand text-brand-ink" : "border-line text-muted hover:border-brand hover:text-brand"
                          }`}
                          aria-label={`${dict.planner.complete}: ${label(block.subject)}`}
                        >
                          ✓
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export function TimetableGenerator({ locale }: { locale: Locale }) {
  const dict = getDict(locale);
  const [streamId, setStreamId] = useState<string>(streams[0].id);
  const [hours, setHours] = useState("18");
  const [days, setDays] = useState("5");
  const stream = streams.find((item) => item.id === streamId) ?? streams[0];
  const [seed, setSeed] = useState(0);

  const grid = useMemo(() => {
    const rotated = [...stream.coefficients.slice(seed % stream.coefficients.length), ...stream.coefficients.slice(0, seed % stream.coefficients.length)];
    return buildWeekPlan(
      rotated.map((entry) => ({ subject: entry.subject, coefficient: entry.coefficient })),
      Math.max(60, (Number(hours) || 15) * 60),
      Math.max(1, Math.min(7, Number(days) || 5)),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streamId, hours, days, seed]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label={dict.common.stream} htmlFor="tt-stream">
          <Select id="tt-stream" value={streamId} onChange={(value) => { setStreamId(value); setSeed(0); }}>
            {streams.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name[locale]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={dict.planner.hoursPerWeek} htmlFor="tt-hours">
          <input id="tt-hours" type="number" min={1} max={60} dir="ltr" value={hours} onChange={(event) => setHours(event.target.value)} className="input num" />
        </Field>
        <Field label={tx(locale, { ar: "عدد الأيام", fr: "Nombre de jours", en: "Days" })} htmlFor="tt-days">
          <Select id="tt-days" value={days} onChange={setDays}>
            {[5, 6, 7].map((value) => (
              <option key={value} value={String(value)}>
                {value}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {grid.map((daySessions, index) => (
          <div key={index} className="rounded-card border border-line bg-surface">
            <div className="border-b border-line bg-raised px-3 py-2 text-[11.5px] font-semibold text-ink">{DAY_NAMES[locale][index]}</div>
            <ul className="divide-y divide-line">
              {daySessions.length === 0 && <li className="px-3 py-4 text-[11.5px] text-muted">—</li>}
              {daySessions.map((session, i) => (
                <li key={i} className="flex items-center justify-between gap-2 px-3 py-2">
                  <span className="min-w-0 truncate text-[12px] text-ink">{subjectById[session.subject as keyof typeof subjectById]?.name[locale] ?? session.subject}</span>
                  <span className="num shrink-0 text-[10.5px] text-muted">{session.minutes}′</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setSeed((value) => value + 1)} className="btn btn-sm">
          {tx(locale, { ar: "توزيع آخر", fr: "Autre répartition", en: "Shuffle" })}
        </button>
        <button type="button" onClick={() => window.print()} className="btn btn-sm">
          {dict.actions.print}
        </button>
      </div>
      <p className="text-[11.5px] leading-5 text-muted">{dict.planner.focus}</p>
    </div>
  );
}
