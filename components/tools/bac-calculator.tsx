"use client";

import { useEffect, useMemo, useState } from "react";
import { getDict, type Locale } from "@/lib/i18n";
import { streams, subjectById, type StreamId } from "@/content/bac";
import { computeAverage, decodeState, encodeState, parseGrade, requiredGrade, type GradeInput as GradeRow } from "@/lib/bac";
import { Bar, CopyButton, Field, GradeInput, ResultPanel, Select } from "./parts";

export function BacCalculator({ locale, compact = false }: { locale: Locale; compact?: boolean }) {
  const dict = getDict(locale);
  const t = dict.calculator;

  const [streamId, setStreamId] = useState<StreamId>("sciences-experimentales");
  const [raw, setRaw] = useState<Record<string, string>>({});
  const [includePe, setIncludePe] = useState(true);
  const [scenarioSubject, setScenarioSubject] = useState<string>("natural-sciences");
  const [target, setTarget] = useState("12");
  const [loaded, setLoaded] = useState(false);

  const stream = streams.find((item) => item.id === streamId) ?? streams[0];

  // Restore from URL (share links) or localStorage on mount.
  useEffect(() => {
    let restored = false;
    try {
      const params = new URLSearchParams(window.location.search);
      const encoded = params.get("s");
      if (encoded) {
        const decoded = decodeState(encoded);
        if (decoded) {
          const match = streams.find((item) => item.id === decoded.stream);
          if (match) {
            setStreamId(match.id);
            const next: Record<string, string> = {};
            for (const [key, value] of Object.entries(decoded.grades)) next[key] = String(value);
            setRaw(next);
            restored = true;
          }
        }
      }
    } catch {
      /* malformed link */
    }
    if (!restored) {
      try {
        const stored = window.localStorage.getItem("bacdz-grades");
        if (stored) {
          const parsed = JSON.parse(stored) as { stream?: string; grades?: Record<string, string> };
          const match = streams.find((item) => item.id === parsed.stream);
          if (match && parsed.grades) {
            setStreamId(match.id);
            setRaw(parsed.grades);
          }
        }
      } catch {
        /* ignore */
      }
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem("bacdz-grades", JSON.stringify({ stream: streamId, grades: raw }));
    } catch {
      /* ignore */
    }
  }, [loaded, streamId, raw]);

  const entries: GradeRow[] = useMemo(() => {
    return stream.coefficients
      .filter((entry) => includePe || entry.subject !== "physical-education")
      .map((entry) => {
        const parsed = parseGrade(raw[entry.subject] ?? "");
        return {
          subject: entry.subject,
          coefficient: entry.coefficient,
          grade: parsed === "invalid" || parsed === null ? null : parsed,
        };
      });
  }, [stream, raw, includePe]);

  const invalidSubjects = useMemo(
    () => stream.coefficients.filter((entry) => parseGrade(raw[entry.subject] ?? "") === "invalid").map((entry) => entry.subject),
    [stream, raw],
  );

  const result = useMemo(() => computeAverage(entries), [entries]);
  const totalCoefficientAll = useMemo(
    () => stream.coefficients.filter((e) => includePe || e.subject !== "physical-education").reduce((sum, e) => sum + e.coefficient, 0),
    [stream, includePe],
  );

  const scenario = useMemo(() => {
    const parsedTarget = Number(target.replace(",", "."));
    if (!Number.isFinite(parsedTarget) || parsedTarget < 0 || parsedTarget > 20) return null;
    return requiredGrade(entries, scenarioSubject, parsedTarget);
  }, [entries, scenarioSubject, target]);

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const encoded = encodeState(streamId, Object.fromEntries(entries.filter((e) => e.grade !== null).map((e) => [e.subject, e.grade])));
    return `${window.location.origin}${window.location.pathname}?s=${encodeURIComponent(encoded)}`;
  }, [entries, streamId]);

  function updateGrade(subject: string, value: string) {
    setRaw((prev) => ({ ...prev, [subject]: value }));
  }

  function reset() {
    setRaw({});
    try {
      window.localStorage.removeItem("bacdz-grades");
    } catch {
      /* ignore */
    }
  }

  const title = dict.calculator;

  return (
    <div className={`card ${compact ? "p-4 sm:p-5" : "p-5 sm:p-7"}`}>
      <div className="grid gap-5 lg:grid-cols-[1fr_1.15fr]">
        <div className="space-y-4">
          <Field label={t.chooseStream} htmlFor="calc-stream">
            <Select
              id="calc-stream"
              value={streamId}
              onChange={(value) => {
                setStreamId(value as StreamId);
                setScenarioSubject(streams.find((s) => s.id === value)?.coefficients[0].subject ?? "mathematics");
              }}
            >
              {streams.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name[locale]}
                </option>
              ))}
            </Select>
          </Field>

          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="label mb-0">{t.enterGrades}</span>
              <button type="button" onClick={reset} className="text-[11.5px] font-medium text-muted underline-offset-4 hover:text-accent hover:underline">
                {dict.actions.reset}
              </button>
            </div>

            <div className="divide-y divide-line rounded-lg border border-line bg-surface">
              {stream.coefficients.map((entry) => {
                const invalid = parseGrade(raw[entry.subject] ?? "") === "invalid";
                const name = entry.variant?.[locale] ?? subjectById[entry.subject].name[locale];
                const disabled = !includePe && entry.subject === "physical-education";
                return (
                  <div key={entry.subject} className={`flex items-center gap-3 px-3 py-2 ${disabled ? "opacity-40" : ""}`}>
                    <div className="min-w-0 flex-1">
                      <label htmlFor={`grade-${entry.subject}`} className="block truncate text-[13px] font-medium text-ink">
                        {name}
                      </label>
                      <span className="text-[10.5px] text-muted">
                        {dict.common.coefficient}: {entry.coefficient}
                        {entry.optional ? ` · ${dict.common.optional}` : ""}
                      </span>
                    </div>
                    <GradeInput
                      id={`grade-${entry.subject}`}
                      label={`${name} — ${dict.common.grade}`}
                      value={raw[entry.subject] ?? ""}
                      onChange={(value) => updateGrade(entry.subject, value)}
                      invalid={invalid}
                      disabled={disabled}
                    />
                  </div>
                );
              })}
            </div>
            <p className="mt-2 text-[11px] leading-5 text-muted">
              {t.hint} · {t.savedLocal}
            </p>
            {invalidSubjects.length > 0 && (
              <p className="mt-1 text-[11.5px] font-medium text-accent" role="alert">
                {t.invalid}
              </p>
            )}
            <label className="mt-3 flex items-center gap-2 text-[12px] text-muted">
              <input
                type="checkbox"
                checked={includePe}
                onChange={(event) => setIncludePe(event.target.checked)}
                className="h-4 w-4 rounded border-line text-brand focus:ring-brand"
              />
              {t.includePe}
            </label>
          </div>
        </div>

        <div className="space-y-4">
          <ResultPanel
            label={t.result}
            value={result.average === null ? "—" : result.average.toFixed(2)}
            suffix="/ 20"
            tone={result.average === null ? "neutral" : result.passes ? "brand" : "accent"}
          >
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11.5px] text-muted">
              <span className="chip">
                {result.gradedCount}/{result.totalCount} {dict.common.subject}
              </span>
              <span className="chip">
                Σ {dict.common.coefficient}: <span className="num">{result.totalCoefficient || totalCoefficientAll}</span>
              </span>
              {result.average !== null && (
                <span className={`chip ${result.passes ? "border-brand/30 text-brand" : "border-accent/30 text-accent"}`}>
                  {result.passes ? t.pass : t.fail}
                </span>
              )}
            </div>
          </ResultPanel>

          <div className="rounded-card border border-line bg-raised/50 p-4">
            <div className="eyebrow mb-2">{t.method}</div>
            <p className="text-[12.5px] leading-6 text-ink/80">
              {locale === "ar"
                ? "يُحسب المعدل بجمع (النقطة × المعامل) لكل مادة، ثم القسمة على مجموع المعاملات."
                : locale === "fr"
                  ? "La moyenne est la somme des (note × coefficient), divisée par la somme des coefficients."
                  : "The average is the sum of (grade × coefficient) divided by the sum of coefficients."}
            </p>
            <div
              dir="ltr"
              className="num mt-2 overflow-x-auto whitespace-nowrap rounded-md border border-line bg-surface px-3 py-2 text-center font-mono text-[12px] text-ink"
            >
              {result.average === null ? "Σ(grade × coef) ÷ Σ(coef)" : `(${result.totalPoints.toFixed(2)} ÷ ${result.totalCoefficient.toFixed(2)}) = ${result.average.toFixed(2)}`}
            </div>
          </div>

          <div className="rounded-card border border-line p-4">
            <div className="eyebrow mb-2">{t.scenario}</div>
            <p className="mb-3 text-[11.5px] leading-5 text-muted">{t.scenarioHint}</p>
            <div className="flex flex-wrap items-end gap-2">
              <div className="min-w-[150px] flex-1">
                <Field label={dict.common.subject} htmlFor="scenario-subject">
                  <Select
                    id="scenario-subject"
                    value={scenarioSubject}
                    onChange={setScenarioSubject}
                  >
                    {stream.coefficients.map((entry) => (
                      <option key={entry.subject} value={entry.subject}>
                        {(entry.variant?.[locale] ?? subjectById[entry.subject].name[locale])} · {entry.coefficient}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
              <div className="w-[92px]">
                <Field label={t.target} htmlFor="scenario-target">
                  <input
                    id="scenario-target"
                    dir="ltr"
                    inputMode="decimal"
                    value={target}
                    onChange={(event) => setTarget(event.target.value)}
                    className="input num text-center"
                  />
                </Field>
              </div>
            </div>
            <div className="mt-3 rounded-md bg-raised px-3 py-2 text-[12.5px]" aria-live="polite">
              {scenario === null ? (
                <span className="text-muted">—</span>
              ) : scenario.kind === "possible" ? (
                <span className="text-ink">
                  {t.needed}: <strong className="num text-brand">{scenario.grade.toFixed(2)}</strong> / 20
                </span>
              ) : scenario.kind === "already-reached" ? (
                <span className="text-brand">{t.neededDone}</span>
              ) : (
                <span className="text-accent">{t.neededImpossible}</span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <CopyButton text={shareUrl} labels={{ copy: dict.actions.share, copied: t.shareCopied }} />
            <button type="button" onClick={() => window.print()} className="btn btn-sm">
              {dict.actions.print}
            </button>
          </div>
        </div>
      </div>

      {!compact && result.contributions.length > 0 && (
        <div className="mt-7 border-t border-line pt-5">
          <h3 className="mb-3 text-sm font-semibold text-ink">{t.breakdown}</h3>
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th scope="col">{dict.common.subject}</th>
                  <th scope="col" className="n">
                    {dict.common.grade}
                  </th>
                  <th scope="col" className="n">
                    {dict.common.coefficient}
                  </th>
                  <th scope="col" className="n">
                    {t.contribution}
                  </th>
                  <th scope="col" className="w-28">
                    <span className="sr-only">{t.contribution}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.contributions
                  .slice()
                  .sort((a, b) => b.points - a.points)
                  .map((row) => (
                    <tr key={row.subject}>
                      <td>{subjectById[row.subject as keyof typeof subjectById]?.name[locale] ?? row.subject}</td>
                      <td className="n">{row.grade.toFixed(2)}</td>
                      <td className="n">{row.coefficient}</td>
                      <td className="n">
                        {row.points.toFixed(2)} <span className="text-[11px] text-muted">({row.share.toFixed(1)}%)</span>
                      </td>
                      <td>
                        <Bar value={row.points} max={20 * row.coefficient} />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
