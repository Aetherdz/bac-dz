import Link from "next/link";
import { pathFor, type RouteTarget } from "@/lib/routes";
import type { Locale } from "@/lib/i18n";
import { JsonLd } from "./jsonld";
import { absolute } from "@/lib/seo";

export type Crumb = { name: string; target: RouteTarget };

export function Breadcrumbs({ locale, items, label }: { locale: Locale; items: Crumb[]; label: string }) {
  const all: Crumb[] = [{ name: label, target: { name: "home" } }, ...items];
  return (
    <>
      <nav aria-label={label} className="mb-5">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-muted">
          {all.map((item, index) => {
            const last = index === all.length - 1;
            return (
              <li key={`${item.name}-${index}`} className="flex items-center gap-2">
                {last ? (
                  <span aria-current="page" className="text-ink/70">
                    {item.name}
                  </span>
                ) : (
                  <Link href={pathFor(locale, item.target)} className="hover:text-brand">
                    {item.name}
                  </Link>
                )}
                {!last && <span aria-hidden className="text-line">/</span>}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: all.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            item: absolute(pathFor(locale, item.target)),
          })),
        }}
      />
    </>
  );
}
