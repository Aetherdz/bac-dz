"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getDict, type Locale } from "@/lib/i18n";
import { pathFor, type RouteTarget } from "@/lib/routes";
import { searchDocs } from "@/lib/search";
import { Badge, EmptyState, SectionHeader } from "@/components/ui";
import { IconSearch } from "@/components/icons";

/**
 * Search runs in the browser over a small static index so the content pages
 * remain statically generated (awaiting `searchParams` would make the whole
 * catch-all route dynamic).
 */
export function SearchClient({ locale }: { locale: Locale }) {
  const dict = getDict(locale);
  const params = useSearchParams();
  const query = (params.get("q") ?? "").slice(0, 80);
  const docs = useMemo(() => searchDocs(locale), [locale]);

  const results = useMemo(() => {
    const norm = (value: string) =>
      value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[\u064B-\u065F\u0670\u0640]/g, "")
        .replace(/[أإآ]/g, "ا")
        .replace(/ى/g, "ي")
        .replace(/ة/g, "ه");
    const q = norm(query.trim());
    if (q.length < 2) return [];
    const terms = q.split(" ").filter((term) => term.length > 1);
    return docs
      .map((doc) => {
        const title = norm(doc.title);
        let score = 0;
        for (const term of terms) {
          if (title.includes(term)) score += 3;
          else if (doc.haystack.includes(term)) score += 1;
        }
        return { doc, score };
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 24)
      .map((entry) => entry.doc);
  }, [docs, query]);

  const suggestions: { label: string; target: RouteTarget }[] = [
    { label: dict.nav.calculator, target: { name: "calculator" } },
    { label: dict.nav.coefficients, target: { name: "coefficients" } },
    { label: dict.nav.exams, target: { name: "exams" } },
    { label: dict.nav.streams, target: { name: "streams" } },
    { label: dict.nav.orientation, target: { name: "orientation" } },
    { label: dict.nav.planner, target: { name: "planner" } },
  ];

  const groupLabel = (group: string) => {
    const labels: Record<string, Record<Locale, string>> = {
      page: { ar: "صفحة", fr: "Page", en: "Page" },
      stream: { ar: "شعبة", fr: "Filière", en: "Stream" },
      guide: { ar: "دليل", fr: "Guide", en: "Guide" },
      tool: { ar: "أداة", fr: "Outil", en: "Tool" },
      exam: { ar: "مادة", fr: "Matière", en: "Subject" },
      update: { ar: "تحديث", fr: "Mise à jour", en: "Update" },
    };
    return labels[group]?.[locale] ?? group;
  };

  return (
    <div className="shell py-10 sm:py-12">
      <SectionHeader as="h1" eyebrow={dict.actions.search} title={dict.home.searchLabel} intro={dict.home.searchPlaceholder} />

      <form action={pathFor(locale, { name: "search" })} role="search" className="max-w-2xl">
        <label htmlFor="site-search" className="sr-only">
          {dict.home.searchLabel}
        </label>
        <div className="flex items-center gap-2 rounded-full border border-line bg-surface p-1.5 shadow-sm focus-within:border-brand">
          <span className="ps-2.5 text-muted" aria-hidden>
            <IconSearch size={17} />
          </span>
          <input
            id="site-search"
            name="q"
            type="search"
            defaultValue={query}
            placeholder={dict.home.searchPlaceholder}
            className="min-h-9 w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted/70"
          />
          <button type="submit" className="btn btn-primary btn-sm shrink-0">
            {dict.actions.search}
          </button>
        </div>
      </form>

      {query.trim().length >= 2 ? (
        <section className="mt-8" aria-live="polite">
          <p className="text-[12.5px] text-muted">
            <span className="num font-semibold text-ink">{results.length}</span> {dict.common.results} · «{query}»
          </p>
          {results.length === 0 ? (
            <div className="mt-3">
              <EmptyState
                title={dict.common.noResults}
                hint={dict.common.noResultsHint}
                action={
                  <div className="mt-2 flex flex-wrap justify-center gap-1.5">
                    {suggestions.map((item) => (
                      <Link key={item.label} href={pathFor(locale, item.target)} className="chip hover:border-brand hover:text-brand">
                        {item.label}
                      </Link>
                    ))}
                  </div>
                }
              />
            </div>
          ) : (
            <ul className="mt-3 divide-y divide-line rounded-card border border-line bg-surface">
              {results.map((result) => (
                <li key={result.url}>
                  <Link href={result.url} className="group block px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Badge tone="neutral">{groupLabel(result.group)}</Badge>
                      <span className="text-[11px] text-muted">{result.url}</span>
                    </div>
                    <div className="mt-1 text-[14px] font-semibold text-ink group-hover:text-brand">{result.title}</div>
                    <p className="mt-0.5 line-clamp-2 text-[12.5px] leading-6 text-muted">{result.description}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : (
        <div className="mt-8 flex flex-wrap gap-1.5">
          {suggestions.map((item) => (
            <Link key={item.label} href={pathFor(locale, item.target)} className="chip hover:border-brand hover:text-brand">
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
