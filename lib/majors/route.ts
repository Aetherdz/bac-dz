/**
 * Explore-state grammar for the majors index.
 *
 * The index URL itself (`/ar/takhassusat-jamiiya`) is the only indexable page.
 * Every filter, sort and page combination is encoded as a stable, order-fixed
 * tail after `/v/`, so:
 * - the state is a real server-rendered URL (shareable, no client JS needed);
 * - `lib/page-meta.ts` can mark each variant `noindex` while the clean URL
 *   stays indexable, and the sitemap only ever lists the clean URL;
 * - an unknown token is a 404 instead of a silently ignored parameter.
 *
 * Grammar (each token is `<key>-<value>`, canonical order s, f, u, a, o, p):
 *   s-<streamId>          bac stream filter
 *   f-<field>             academic field filter
 *   u-<universityId>      institution filter
 *   a-<min>-<max>         published minimum-average band, 0..20
 *   o-<relevance|threshold|name>
 *   p-<page>              1-based page (omitted when 1)
 */
import { streams } from "@/content/bac";
import { ACADEMIC_FIELDS, type AcademicField } from "@/content/majors/schema";
import { renderableUniversities } from "./dataset";
import { MAJOR_SORTS, type MajorSort } from "./search";

export const MAJORS_VIEW_SEGMENT = "v";

export type ExploreState = {
  stream?: string;
  field?: AcademicField;
  universityId?: string;
  averageMin?: number;
  averageMax?: number;
  sort?: MajorSort;
  page: number;
};

export const CLEAN_EXPLORE: ExploreState = { page: 1 };

const STREAM_IDS = new Set<string>(streams.map((stream) => stream.id));
const UNIVERSITY_IDS = new Set(renderableUniversities.map((university) => university.id));
const FIELD_IDS = new Set<string>(ACADEMIC_FIELDS);
const SORT_IDS = new Set<string>(MAJOR_SORTS);

function parseAverage(value: string): { min?: number; max?: number } | null {
  const match = /^(\d{1,2}(?:\.\d{1,2})?)-(\d{1,2}(?:\.\d{1,2})?)$/.exec(value);
  if (!match) return null;
  const min = Number(match[1]);
  const max = Number(match[2]);
  if (!Number.isFinite(min) || !Number.isFinite(max)) return null;
  if (min < 0 || max > 20 || min > max) return null;
  return { min, max };
}

/** Parse `v/s-.../p-2` (the leading `v` already stripped by the caller). */
export function parseExploreView(tokens: readonly string[]): ExploreState | null {
  const state: ExploreState = { page: 1 };
  const seen = new Set<string>();

  for (const token of tokens) {
    const key = token.slice(0, 1);
    const value = token.slice(2);
    if (!/^[a-z]-.+$/.test(token) && !/^[a-z]-$/.test(token)) return null;
    if (seen.has(key)) return null;
    seen.add(key);

    switch (key) {
      case "s":
        if (!STREAM_IDS.has(value)) return null;
        state.stream = value;
        break;
      case "f":
        if (!FIELD_IDS.has(value)) return null;
        state.field = value as AcademicField;
        break;
      case "u":
        if (!UNIVERSITY_IDS.has(value)) return null;
        state.universityId = value;
        break;
      case "a": {
        const band = parseAverage(value);
        if (!band) return null;
        state.averageMin = band.min;
        state.averageMax = band.max;
        break;
      }
      case "o":
        if (!SORT_IDS.has(value)) return null;
        state.sort = value as MajorSort;
        break;
      case "p": {
        if (!/^\d{1,3}$/.test(value)) return null;
        const page = Number(value);
        if (page < 1) return null;
        state.page = page;
        break;
      }
      default:
        return null;
    }
  }

  return state;
}

/** Reverse of `parseExploreView`; returns the token list, canonical order. */
export function exploreTokens(state: ExploreState): string[] {
  const tokens: string[] = [];
  if (state.stream) tokens.push(`s-${state.stream}`);
  if (state.field) tokens.push(`f-${state.field}`);
  if (state.universityId) tokens.push(`u-${state.universityId}`);
  if (typeof state.averageMin === "number" && typeof state.averageMax === "number") {
    tokens.push(`a-${state.averageMin}-${state.averageMax}`);
  }
  if (state.sort && state.sort !== "relevance") tokens.push(`o-${state.sort}`);
  if (state.page > 1) tokens.push(`p-${state.page}`);
  return tokens;
}

/** Route `view` value for `pathFor`, or `undefined` for the clean index. */
export function exploreView(state: ExploreState): string | undefined {
  const tokens = exploreTokens(state);
  return tokens.length === 0 ? undefined : [MAJORS_VIEW_SEGMENT, ...tokens].join("/");
}

/** True when the state is the clean, indexable index. */
export function isCleanExplore(state: ExploreState): boolean {
  return exploreTokens(state).length === 0;
}

/** Labels for the active filters, used by titles and by the results header. */
export function exploreSummary(
  state: ExploreState,
  locale: "ar" | "fr" | "en",
): { stream?: string; field?: string; university?: string; average?: string; sort?: string } {
  const stream = state.stream ? streams.find((entry) => entry.id === state.stream) : undefined;
  const university = state.universityId
    ? renderableUniversities.find((entry) => entry.id === state.universityId)
    : undefined;
  const fieldLabels: Record<string, { ar: string; fr: string; en: string }> = {
    health: { ar: "الصحة", fr: "Santé", en: "Health" },
    engineering: { ar: "الهندسة", fr: "Ingénierie", en: "Engineering" },
    science: { ar: "العلوم", fr: "Sciences", en: "Sciences" },
    it: { ar: "الإعلام الآلي", fr: "Informatique", en: "Computing" },
    economics: { ar: "الاقتصاد والتسيير", fr: "Économie et gestion", en: "Economics and management" },
    law: { ar: "الحقوق", fr: "Droit", en: "Law" },
    languages: { ar: "اللغات", fr: "Langues", en: "Languages" },
    humanities: { ar: "العلوم الإنسانية", fr: "Sciences humaines", en: "Humanities" },
    arts: { ar: "الفنون", fr: "Arts", en: "Arts" },
    agriculture: { ar: "الفلاحة", fr: "Agriculture", en: "Agriculture" },
    other: { ar: "مجالات أخرى", fr: "Autres domaines", en: "Other fields" },
  };
  return {
    stream: stream?.name[locale],
    field: state.field ? fieldLabels[state.field]?.[locale] : undefined,
    university: university?.name[locale],
    average:
      typeof state.averageMin === "number" && typeof state.averageMax === "number"
        ? `${state.averageMin.toFixed(2)}–${state.averageMax.toFixed(2)}`
        : undefined,
    sort: state.sort,
  };
}
