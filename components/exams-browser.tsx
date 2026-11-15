"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { getDict, type Locale } from "@/lib/i18n";
import { tx } from "@/lib/tx";
import { examRegistry, subjectTopics } from "@/content/exams";
import { examYears, streams, subjectById } from "@/content/bac";
import { pathFor } from "@/lib/routes";
import { Badge } from "@/components/ui";

export function ExamsBrowser({ locale }: { locale: Locale }) {
  const dict = getDict(locale);
  const [year, setYear] = useState<string>("all");
  const [stream, setStream] = useState<string>("all");
  const [subject, setSubject] = useState<string>("all");

  const subjectsPresent = useMemo(() => {
    const ids = new Set(examRegistry.map((row) => row.subject));
    return [...ids].filter((id) => subjectTopics[id]);
  }, []);

  const rows = useMemo(
    () =>
      examRegistry.filter(
        (row) =>
          (year === "all" || String(row.year) === year) &&
          (stream === "all" || row.stream === stream) &&
          (subject === "all" || row.subject === subject),
      ),
    [year, stream, subject],
  );

  const labelClass = "mb-1.5 block text-[12px] font-medium text-muted";

  return (
    <div className="space-y-4">
      <div className="card p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label htmlFor="exam-year" className={labelClass}>
              {dict.exams.yearLabel}
            </label>
            <select id="exam-year" className="select" value={year} onChange={(event) => setYear(event.target.value)}>
              <option value="all">{dict.actions.all}</option>
              {[...examYears].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="exam-stream" className={labelClass}>
              {dict.exams.streamLabel}
            </label>
            <select id="exam-stream" className="select" value={stream} onChange={(event) => setStream(event.target.value)}>
              <option value="all">{dict.actions.all}</option>
              {streams.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name[locale]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="exam-subject" className={labelClass}>
              {dict.exams.subjectLabel}
            </label>
            <select id="exam-subject" className="select" value={subject} onChange={(event) => setSubject(event.target.value)}>
              <option value="all">{dict.actions.all}</option>
              {subjectsPresent.map((id) => (
                <option key={id} value={id}>
                  {subjectById[id].name[locale]}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-[11.5px] text-muted">
          <span aria-live="polite">
            <span className="num font-semibold text-ink">{rows.length}</span> {dict.common.results}
          </span>
          {(year !== "all" || stream !== "all" || subject !== "all") && (
            <button
              type="button"
              onClick={() => {
                setYear("all");
                setStream("all");
                setSubject("all");
              }}
              className="link text-[11.5px]"
            >
              {dict.exams.clearFilters}
            </button>
          )}
          <span className="ms-auto hidden sm:inline">{dict.exams.filterHint}</span>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="card px-6 py-12 text-center">
          <p className="text-sm font-medium text-ink">{dict.common.noResults}</p>
          <p className="mt-1 text-[12.5px] text-muted">{dict.common.noResultsHint}</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="table-wrap px-0 sm:px-0">
            <table className="data">
              <thead>
                <tr>
                  <th scope="col">{dict.exams.yearLabel}</th>
                  <th scope="col">{dict.exams.streamLabel}</th>
                  <th scope="col">{dict.exams.subjectLabel}</th>
                  <th scope="col" className="n">{dict.common.coefficient}</th>
                  <th scope="col">{tx(locale, { ar: "الحالة", fr: "Statut", en: "Status" })}</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 220).map((row) => {
                  const streamItem = streams.find((item) => item.id === row.stream);
                  return (
                    <tr key={row.id}>
                      <td className="num">{row.year}</td>
                      <td className="text-[12.5px]">{streamItem?.name[locale] ?? row.stream}</td>
                      <td>
                        {row.hasPage ? (
                          <Link
                            href={pathFor(locale, {
                              name: "examSubject",
                              year: row.year,
                              stream: row.stream,
                              subject: row.subject,
                            })}
                            className="link text-[13px]"
                          >
                            {subjectById[row.subject]?.name[locale] ?? row.subject}
                          </Link>
                        ) : (
                          <span className="text-[13px]">{subjectById[row.subject]?.name[locale] ?? row.subject}</span>
                        )}
                      </td>
                      <td className="n">{row.coefficient}</td>
                      <td>
                        <Badge tone={row.hasPage ? "brand" : "neutral"}>
                          {row.hasPage
                            ? tx(locale, { ar: "صفحة مرجعية", fr: "Page de référence", en: "Reference page" })
                            : dict.exams.notHosted}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {rows.length > 220 && (
            <p className="border-t border-line bg-raised px-4 py-2 text-[11px] text-muted">
              {tx(locale, {
                ar: "تُعرض أول 220 نتيجة؛ استعمل عوامل التصفية لتضييق النتائج.",
                fr: "Les 220 premiers résultats sont affichés ; affinez avec les filtres.",
                en: "Showing the first 220 rows; narrow the results with the filters.",
              })}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
