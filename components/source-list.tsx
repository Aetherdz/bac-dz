import { IconExternal } from "./icons";
import { Badge } from "./ui";
import type { SourceRef } from "@/content/types";
import type { Locale } from "@/lib/i18n";

const kindLabel: Record<SourceRef["kind"], Record<Locale, string>> = {
  official: { ar: "مصدر رسمي", fr: "Source officielle", en: "Official source" },
  secondary: { ar: "مصدر ثانوي موثوق", fr: "Source secondaire", en: "Secondary source" },
  editorial: { ar: "شرح تحريري", fr: "Explication éditoriale", en: "Editorial explanation" },
};

export function SourceList({
  locale,
  sources,
  title,
  checkedLabel,
}: {
  locale: Locale;
  sources: SourceRef[];
  title: string;
  checkedLabel: string;
}) {
  if (sources.length === 0) return null;
  return (
    <section aria-labelledby="sources-heading" className="card bg-raised/60 p-5">
      <h2 id="sources-heading" className="mb-3 text-sm font-semibold text-ink">
        {title}
      </h2>
      <ol className="space-y-3">
        {sources.map((source, index) => (
          <li key={`${source.url}-${index}`} className="text-[13px] leading-6">
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-start gap-1.5 font-medium text-ink underline decoration-line underline-offset-4 hover:text-brand hover:decoration-brand"
            >
              <span>{source.label}</span>
              <IconExternal size={13} className="mt-1 shrink-0 text-muted" />
            </a>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Badge tone={source.kind === "official" ? "gold" : "neutral"}>{kindLabel[source.kind][locale]}</Badge>
              {source.checkedOn && (
                <span className="text-[11px] text-muted">
                  {checkedLabel}: <time dateTime={source.checkedOn}>{source.checkedOn}</time>
                </span>
              )}
              {source.note && <span className="text-[11px] text-muted">{source.note}</span>}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function VerifiedStamp({
  locale,
  verifiedOn,
  label,
}: {
  locale: Locale;
  verifiedOn: string;
  label: string;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-[11px] text-muted">
      <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden />
      <span>{label}</span>
      <time dateTime={verifiedOn} className="num font-medium text-ink/70">
        {verifiedOn}
      </time>
    </div>
  );
}
