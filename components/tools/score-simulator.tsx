"use client";

import { useMemo, useState } from "react";
import { getDict, type Locale } from "@/lib/i18n";
import { tx } from "@/lib/tx";
import { streams, subjectById } from "@/content/bac";
import { parseGrade, round2 } from "@/lib/bac";
import { Field, ResultPanel, Select } from "./parts";

export function ScoreSimulator({ locale }: { locale: Locale }) {
  const dict = getDict(locale);
  const [streamId, setStreamId] = useState<string>(streams[0].id);
  const [target, setTarget] = useState("12");
  const [grades, setGrades] = useState<Record<string, string>>({});
  const stream = streams.find((item) => item.id === streamId) ?? streams[0];

  const entries = stream.coefficients.map((entry) => {
    const parsed = parseGrade(grades[entry.subject] ?? "");
    return {
      subject: entry.subject,
      name: entry.variant?.[locale] ?? subjectById[entry.subject].name[locale],
      coefficient: entry.coefficient,
      grade: parsed === "invalid" || parsed === null ? null : parsed,
    };
  });

  const targetValue = Number(target.replace(",", "."));
  const validTarget = Number.isFinite(targetValue) && targetValue >= 0 && targetValue <= 20;
  const graded = entries.filter((entry) => entry.grade !== null);
  const remaining = entries.filter((entry) => entry.grade === null);
  const fixedPoints = graded.reduce((sum, entry) => sum + (entry.grade as number) * entry.coefficient, 0);
  const fixedCoef = graded.reduce((sum, entry) => sum + entry.coefficient, 0);
  const remainCoef = remaining.reduce((sum, entry) => sum + entry.coefficient, 0);
  const currentAverage = fixedCoef > 0 ? round2(fixedPoints / fixedCoef) : null;

  const needed = validTarget && remainCoef > 0 ? round2((targetValue * (fixedCoef + remainCoef) - fixedPoints) / remainCoef) : null;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={dict.common.stream} htmlFor="score-stream">
          <Select id="score-stream" value={streamId} onChange={(value) => { setStreamId(value); setGrades({}); }}>
            {streams.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name[locale]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={dict.calculator.target} htmlFor="score-target">
          <input
            id="score-target"
            dir="ltr"
            inputMode="decimal"
            value={target}
            onChange={(event) => setTarget(event.target.value)}
            className="input num"
          />
        </Field>
      </div>

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th scope="col">{dict.common.subject}</th>
              <th scope="col" className="n">{dict.common.coefficient}</th>
              <th scope="col" className="n">{dict.common.grade}</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.subject}>
                <td>{entry.name}</td>
                <td className="n">{entry.coefficient}</td>
                <td className="n">
                  <input
                    aria-label={`${entry.name} — ${dict.common.grade}`}
                    dir="ltr"
                    inputMode="decimal"
                    placeholder="—"
                    value={grades[entry.subject] ?? ""}
                    onChange={(event) => setGrades({ ...grades, [entry.subject]: event.target.value })}
                    className={`num h-9 w-16 rounded-md border bg-surface px-2 text-center text-[13px] outline-none focus:ring-1 ${
                      parseGrade(grades[entry.subject] ?? "") === "invalid"
                        ? "border-accent focus:border-accent focus:ring-accent"
                        : "border-line focus:border-brand focus:ring-brand"
                    }`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <ResultPanel label={dict.calculator.result} value={currentAverage === null ? "—" : currentAverage.toFixed(2)} suffix="/ 20" tone="neutral">
          <p className="mt-1 text-[11px] text-muted">
            {graded.length}/{entries.length} {dict.common.subject}
          </p>
        </ResultPanel>
        <ResultPanel
          label={tx(locale, { ar: "المعدل اللازم في المواد المتبقية", fr: "Moyenne nécessaire dans les matières restantes", en: "Required average in remaining subjects" })}
          value={!validTarget || needed === null ? "—" : needed > 20 ? "20+" : needed <= 0 ? "0" : needed.toFixed(2)}
          suffix="/ 20"
          tone={!validTarget || needed === null || needed > 20 ? "accent" : "brand"}
        >
          <p className="mt-1 text-[11px] leading-5 text-muted">
            {remainCoef === 0
              ? tx(locale, { ar: "أدخل نقطة واحدة على الأقل واترك مواد أخرى فارغة.", fr: "Saisissez au moins une note et laissez des matières vides.", en: "Enter at least one grade and leave some subjects blank." })
              : needed !== null && needed > 20
                ? tx(locale, { ar: "الهدف غير قابل للتحقيق بالنقاط الحالية.", fr: "Objectif inatteignable avec ces notes.", en: "Target unreachable with these grades." })
                : tx(locale, { ar: "بافتراض الحصول على نفس النقطة في كل مادة متبقية.", fr: "En supposant la même note dans chaque matière restante.", en: "Assuming the same grade in each remaining subject." })}
          </p>
        </ResultPanel>
      </div>
    </div>
  );
}
