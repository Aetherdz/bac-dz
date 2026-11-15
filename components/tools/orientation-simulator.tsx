"use client";

import { useMemo, useState } from "react";
import { getDict, type Locale } from "@/lib/i18n";
import { tx } from "@/lib/tx";
import { streams } from "@/content/bac";
import { domainLabels, orientationFields, type OrientationField } from "@/content/orientation";
import { round2 } from "@/lib/bac";
import { Field, ResultPanel, Select } from "./parts";

type Column = "min1" | "min2" | "min3";

export function OrientationSimulator({ locale }: { locale: Locale }) {
  const dict = getDict(locale);
  const [streamId, setStreamId] = useState<string>(streams[0].id);
  const [average, setAverage] = useState("");
  const [year, setYear] = useState("2026");
  const [column, setColumn] = useState<Column>("min1");
  const [manual, setManual] = useState("");
  const [domain, setDomain] = useState<string>("all");

  const parsedAverage = Number(average.replace(",", "."));
  const hasAverage = average.trim() !== "" && Number.isFinite(parsedAverage) && parsedAverage >= 0 && parsedAverage <= 20;

  const rows = useMemo(() => {
    return orientationFields
      .filter((field) => String(field.year) === year)
      .filter((field) => domain === "all" || field.domain === domain)
      .map((field) => {
        const threshold = field.values[column];
        const eligible = field.streams.includes(streamId);
        return {
          ...field,
          threshold,
          eligible,
          gap: threshold !== null && hasAverage ? round2(parsedAverage - threshold) : null,
        };
      })
      .sort((a, b) => (b.threshold ?? -1) - (a.threshold ?? -1));
  }, [year, domain, column, streamId, hasAverage, parsedAverage]);

  const relevant = rows.filter((row) => row.eligible && row.threshold !== null);
  const above = relevant.filter((row) => row.gap !== null && row.gap >= 0);
  const manualValue = Number(manual.replace(",", "."));

  return (
    <div className="space-y-6">
      <div className="card p-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field label={dict.orientation.yourStream} htmlFor="ori-stream">
            <Select id="ori-stream" value={streamId} onChange={setStreamId}>
              {streams.map((stream) => (
                <option key={stream.id} value={stream.id}>
                  {stream.name[locale]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={`${dict.orientation.yourAverage} / 20`} htmlFor="ori-average">
            <input
              id="ori-average"
              dir="ltr"
              inputMode="decimal"
              value={average}
              onChange={(event) => setAverage(event.target.value)}
              placeholder="14.50"
              className="input num"
            />
          </Field>
          <Field label={dict.orientation.yearLabel} htmlFor="ori-year">
            <Select id="ori-year" value={year} onChange={setYear}>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </Select>
          </Field>
          <Field
            label={tx(locale, { ar: "الفئة المنشورة", fr: "Groupe publié", en: "Published group" })}
            htmlFor="ori-column"
            hint={tx(locale, {
              ar: "الأعمدة Min1/Min2/Min3 كما في الجدول الوزاري، دون إعادة تفسير.",
              fr: "Colonnes Min1/Min2/Min3 telles que publiées, sans réinterprétation.",
              en: "Min1/Min2/Min3 columns as published, without reinterpretation.",
            })}
          >
            <Select id="ori-column" value={column} onChange={(value) => setColumn(value as Column)}>
              <option value="min1">Min1</option>
              <option value="min2">Min2</option>
              <option value="min3">Min3</option>
            </Select>
          </Field>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setDomain("all")}
            className={`chip ${domain === "all" ? "border-brand text-brand" : ""}`}
          >
            {dict.actions.all}
          </button>
          {(Object.keys(domainLabels) as (keyof typeof domainLabels)[])
            .filter((key) => orientationFields.some((field) => field.domain === key))
            .map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setDomain(key)}
                className={`chip ${domain === key ? "border-brand text-brand" : ""}`}
              >
                {domainLabels[key][locale]}
              </button>
            ))}
        </div>
      </div>

      {hasAverage && (
        <div className="grid gap-3 sm:grid-cols-3">
          <ResultPanel label={`${dict.orientation.yourAverage}`} value={parsedAverage.toFixed(2)} suffix="/ 20" tone="neutral" />
          <ResultPanel
            label={tx(locale, { ar: "ميادين في متناول معدلك", fr: "Domaines à votre portée", en: "Fields within reach" })}
            value={String(above.length)}
            suffix={`/ ${relevant.length}`}
            tone={above.length > 0 ? "brand" : "accent"}
          />
          <ResultPanel
            label={tx(locale, { ar: "سنة البيانات", fr: "Année des données", en: "Data year" })}
            value={year}
            suffix=""
            tone="neutral"
          >
            <p className="mt-1 text-[11px] text-muted">{dict.orientation.historical}</p>
          </ResultPanel>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="border-b border-line bg-raised px-4 py-3">
          <h3 className="text-[13px] font-semibold text-ink">{dict.orientation.resultTitle}</h3>
          <p className="mt-0.5 text-[11px] leading-5 text-muted">{dict.orientation.thresholdNote}</p>
        </div>
        {rows.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted">{dict.common.noResults}</p>
        ) : (
          <div className="table-wrap px-0 sm:px-0">
            <table className="data">
              <thead>
                <tr>
                  <th scope="col">{tx(locale, { ar: "الميدان", fr: "Filière", en: "Field" })}</th>
                  <th scope="col">{tx(locale, { ar: "المؤسسة", fr: "Établissement", en: "Institution" })}</th>
                  <th scope="col" className="n">Min</th>
                  <th scope="col" className="n">{tx(locale, { ar: "الفارق", fr: "Écart", en: "Gap" })}</th>
                  <th scope="col">{tx(locale, { ar: "شعبتك", fr: "Votre filière", en: "Your stream" })}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <div className="font-medium">{row.field[locale]}</div>
                      <div className="text-[10.5px] text-muted">{domainLabels[row.domain][locale]}</div>
                    </td>
                    <td className="text-[12px] text-muted">{row.institution}</td>
                    <td className="n font-medium">{row.threshold === null ? "—" : row.threshold.toFixed(2)}</td>
                    <td className={`n ${row.gap === null ? "text-muted" : row.gap >= 0 ? "text-brand" : "text-accent"}`}>
                      {row.gap === null ? "—" : `${row.gap > 0 ? "+" : ""}${row.gap.toFixed(2)}`}
                    </td>
                    <td>
                      <span className={`text-[11px] ${row.eligible ? "text-brand" : "text-muted"}`}>
                        {row.eligible ? dict.orientation.eligible : dict.orientation.notEligible}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="border-t border-line bg-raised px-4 py-2.5 text-[10.5px] leading-5 text-muted">
          {tx(locale, {
            ar: "معدلات دنيا منشورة رسميًا لسنة 2026 (بعد المرحلة الأولى). التوجيه يعتمد أيضًا على المعدل الموزون والرغبات والطاقة الاستيعابية.",
            fr: "Minima officiels publiés pour 2026 (après phase 1). L’orientation dépend aussi de la moyenne pondérée, des vœux et de la capacité.",
            en: "Official published minima for 2026 (after phase 1). Orientation also depends on the weighted average, wishes and capacity.",
          })}
        </div>
      </div>

      <div className="card p-5">
        <h3 className="text-sm font-semibold text-ink">{dict.orientation.compareTitle}</h3>
        <p className="mt-1 text-[11.5px] leading-5 text-muted">{dict.orientation.noThresholdData}</p>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <div className="w-[160px]">
            <Field label={dict.orientation.enterThreshold} htmlFor="ori-manual">
              <input
                id="ori-manual"
                dir="ltr"
                inputMode="decimal"
                value={manual}
                onChange={(event) => setManual(event.target.value)}
                placeholder="15.00"
                className="input num"
              />
            </Field>
          </div>
          <div className="pb-2 text-[12.5px] text-muted" aria-live="polite">
            {manual.trim() === "" || !hasAverage || !Number.isFinite(manualValue) ? (
              "—"
            ) : (
              <span className={parsedAverage >= manualValue ? "text-brand" : "text-accent"}>
                {parsedAverage >= manualValue ? dict.orientation.verdictAbove : dict.orientation.verdictBelow}
                {" · "}
                {dict.orientation.difference}: <strong className="num">{round2(Math.abs(parsedAverage - manualValue)).toFixed(2)}</strong>
              </span>
            )}
          </div>
        </div>
      </div>

      <p className="text-[11px] leading-5 text-muted">{dict.orientation.simulateHint}</p>
    </div>
  );
}
