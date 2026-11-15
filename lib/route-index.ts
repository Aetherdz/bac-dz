import { examPages } from "@/content/exams";
import { guides } from "@/content/guides";
import { streams } from "@/content/bac";
import { tools } from "@/content/tools";
import { updates } from "@/content/updates";
import type { Locale } from "./i18n";
import { staticRouteNames } from "./page-meta";
import { pathFor, type RouteTarget } from "./routes";

/**
 * Single source of truth for "what pages exist".
 * Used by generateStaticParams, the sitemap and the client-side search index,
 * so a route can never exist in one place and be missing from another.
 */
export function allTargets(): RouteTarget[] {
  const statics = staticRouteNames().map((name) => ({ name }) as RouteTarget);
  return [
    ...statics,
    ...streams.map((stream) => ({ name: "stream", stream: stream.id }) as RouteTarget),
    ...examPages.map(
      (page) => ({ name: "examSubject", year: page.year, stream: page.stream, subject: page.subject }) as RouteTarget,
    ),
    ...guides.map((guide) => ({ name: "guide", slug: guide.slug }) as RouteTarget),
    ...tools.map((tool) => ({ name: "tool", tool: tool.slug }) as RouteTarget),
    ...updates.map((entry) => ({ name: "update", slug: entry.slug }) as RouteTarget),
  ];
}

/** Catch-all segments for a locale, without the locale prefix. */
export function segmentsFor(locale: Locale, target: RouteTarget): string[] {
  const path = pathFor(locale, target);
  const prefix = `/${locale}`;
  const rest = path.startsWith(prefix) ? path.slice(prefix.length) : path;
  return rest.split("/").filter(Boolean);
}

export function pathsForLocale(locale: Locale): string[] {
  return allTargets().map((target) => pathFor(locale, target));
}

/** Build all catch-all params for a locale (home has no slug). */
export function paramsForLocale(locale: Locale): { locale: string; slug?: string[] }[] {
  return allTargets().map((target) => {
    const slug = segmentsFor(locale, target);
    return { locale, slug };
  });
}
