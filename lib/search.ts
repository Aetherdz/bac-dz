import type { Locale } from "./i18n";
import { metaFor } from "./page-meta";
import { allTargets } from "./route-index";
import { pathFor, type RouteTarget } from "./routes";
import { getGuide } from "@/content/guides";
import { streamById, subjectById } from "@/content/bac";

export type SearchDoc = {
  url: string;
  title: string;
  description: string;
  haystack: string;
  group: "page" | "stream" | "guide" | "tool" | "exam" | "update";
};

/** Normalize Arabic/French input: lowercase, strip diacritics and tatweel. */
export function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u064B-\u065F\u0670\u0640]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[’']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extraKeywords(target: RouteTarget, locale: Locale): string {
  switch (target.name) {
    case "stream": {
      const stream = streamById[target.stream as keyof typeof streamById];
      if (!stream) return "";
      return [stream.name[locale], stream.shortName[locale], ...stream.coefficients.map((entry) => subjectById[entry.subject].name[locale])].join(" ");
    }
    case "examSubject": {
      const subject = subjectById[target.subject as keyof typeof subjectById];
      const stream = streamById[target.stream as keyof typeof streamById];
      return [subject?.name[locale], stream?.name[locale], String(target.year)].filter(Boolean).join(" ");
    }
    case "guide": {
      const guide = getGuide(target.slug);
      if (!guide) return "";
      return [...guide.locales[locale].keywords, ...guide.related].join(" ") + ` ${guide.category}`;
    }
    case "tool":
      return target.tool.replace(/-/g, " ");
    default:
      return "";
  }
}

export function searchDocs(locale: Locale): SearchDoc[] {
  return allTargets().map((target) => {
    const meta = metaFor(locale, target);
    const group: SearchDoc["group"] =
      target.name === "stream"
        ? "stream"
        : target.name === "guide"
          ? "guide"
          : target.name === "tool"
            ? "tool"
            : target.name === "examSubject"
              ? "exam"
              : target.name === "update"
                ? "update"
                : "page";
    return {
      url: pathFor(locale, target),
      title: meta.title,
      description: meta.description,
      group,
      haystack: normalize(`${meta.title} ${meta.description} ${extraKeywords(target, locale)}`),
    };
  });
}

export function searchQuery(locale: Locale, rawQuery: string, limit = 24): SearchDoc[] {
  const query = normalize(rawQuery);
  if (query.length < 2) return [];
  const terms = query.split(" ").filter((term) => term.length > 1);
  return searchDocs(locale)
    .map((doc) => {
      let score = 0;
      for (const term of terms) {
        if (normalize(doc.title).includes(term)) score += 3;
        else if (doc.haystack.includes(term)) score += 1;
      }
      return { doc, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.doc);
}
