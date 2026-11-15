/**
 * Bilingual (Arabic / French / English) search over the majors seed dataset.
 *
 * Design notes
 * - The index is built once, lazily, at module scope and then reused. Every
 *   normalisation regex is compiled once at module scope too: the hot loop only
 *   compares pre-split tokens.
 * - Matching goes through `keywords`, so an Arabic query can surface a record
 *   whose keywords are French and vice versa. `SYNONYM_GROUPS` adds the
 *   equivalence classes the orientation vocabulary needs.
 * - Score tiers (per query token): exact name 100, name prefix 70, keyword 50,
 *   summary 25, field label 20, city 10. A fuzzy token match keeps the same tier
 *   at 60% of its value (Damerau-Levenshtein ≤ 2 for tokens of 4+ characters,
 *   ≤ 1 for 3-character tokens).
 * - Filters are hard predicates. `maxYears` and `maxThreshold` exclude records
 *   whose value is unknown (`null`), because an unknown value cannot be proven
 *   to satisfy the bound.
 * - The index is built from `renderableMajors` only (see lib/majors/dataset):
 *   a record the editorial gate withholds can never be returned here.
 */
import { domainLabels } from "@/content/orientation";
import type { Locale } from "@/lib/i18n";
import { streamById } from "@/content/bac";
import { ACADEMIC_FIELDS, type AcademicField, type DegreeType, type Major, type ThresholdRecord } from "@/content/majors/schema";
import {
  renderableMajorBySlug,
  renderableMajors,
  renderableThresholds,
  renderableUniversities,
} from "./dataset";

/* -------------------------------------------------------------------------- */
/* Normalisation                                                              */
/* -------------------------------------------------------------------------- */

const ARABIC_MARKS = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g;
const ALEF_VARIANTS = /[أإآٱ]/g;
const PUNCTUATION = /[^\p{L}\p{N}]+/gu;
const WHITESPACE = /\s+/g;

/** Strip tashkeel/tatweel, unify alef/ya/ta-marbuta/hamza carriers, lowercase. */
export function normalizeArabic(input: string): string {
  return input
    .replace(ARABIC_MARKS, "")
    .replace(ALEF_VARIANTS, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .toLowerCase();
}

/** Strip Latin diacritics, lowercase, turn punctuation into separators. */
export function normalizeFrench(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(PUNCTUATION, " ")
    .replace(WHITESPACE, " ")
    .trim();
}

/** Arabic-safe query normalisation used for indexing and lookups. */
export function normalizeQuery(input: string): string {
  return normalizeFrench(normalizeArabic(input));
}

/** Function words that carry no signal and must not trigger fuzzy matches. */
const STOPWORDS = new Set([
  "la",
  "le",
  "les",
  "de",
  "des",
  "du",
  "et",
  "of",
  "and",
  "the",
  "an",
  "en",
  "au",
  "aux",
  "un",
  "une",
  "في",
  "من",
  "على",
  "الى",
  "إلى",
  "او",
  "أو",
  "و",
]);

function tokenize(normalized: string): string[] {
  if (!normalized) return [];
  return normalized.split(" ").filter((token) => token.length > 0 && !STOPWORDS.has(token));
}

/* -------------------------------------------------------------------------- */
/* Labels                                                                     */
/* -------------------------------------------------------------------------- */

type Label = { ar: string; fr: string; en: string };

/**
 * Field labels reuse `domainLabels` from content/orientation.ts (same wording
 * as the rest of the site) and add the three fields the orientation table does
 * not use.
 */
export const fieldLabels: Record<AcademicField, Label> = {
  ...domainLabels,
  arts: { ar: "الفنون", fr: "Arts", en: "Arts" },
  agriculture: { ar: "الفلاحة", fr: "Agriculture", en: "Agriculture" },
  other: { ar: "مجالات أخرى", fr: "Autres domaines", en: "Other fields" },
};

export const degreeLabels: Record<DegreeType, Label> = {
  licence: { ar: "ليسانس", fr: "Licence", en: "Bachelor" },
  master: { ar: "ماستر", fr: "Master", en: "Master" },
  doctorate: { ar: "دكتوراه", fr: "Doctorat", en: "Doctorate" },
  engineering: { ar: "شهادة مهندس", fr: "Diplôme d’ingénieur", en: "Engineering degree" },
  medical: { ar: "دراسات طبية", fr: "Études médicales", en: "Medical studies" },
  professional: { ar: "تكوين مهني", fr: "Formation professionnelle", en: "Professional" },
  unknown: { ar: "غير محدد", fr: "Non précisé", en: "Not specified" },
};

/* -------------------------------------------------------------------------- */
/* Synonyms                                                                   */
/* -------------------------------------------------------------------------- */

/** Equivalence classes: any trigger token pulls in the whole group. */
const SYNONYM_GROUPS: readonly (readonly string[])[] = [
  ["إعلام آلي", "الاعلام الالي", "informatique", "computer science", "computing"],
  ["ذكاء اصطناعي", "الذكاء الاصطناعي", "intelligence artificielle", "artificial intelligence", "ai"],
  ["طب", "médecine", "medecine", "medicine"],
  ["صيدلة", "pharmacie", "pharmacy"],
  ["هندسة مدنية", "génie civil", "genie civil", "civil engineering"],
  ["محاسبة", "comptabilité", "comptabilite", "accounting"],
  ["حقوق", "droit", "law"],
  ["علوم سياسية", "sciences politiques", "political science"],
  ["بيولوجيا", "biologie", "biology"],
  ["رياضيات", "mathématiques", "mathematiques", "mathematics", "maths"],
  ["فيزياء", "physique", "physics"],
  ["كيمياء", "chimie", "chemistry"],
  ["عمارة", "architecture"],
  ["إنجليزية", "anglais", "english"],
  ["اقتصاد", "économie", "economie", "economics"],
];

/** Tokens too generic to trigger a synonym class on their own. */
const GENERIC_TRIGGERS = new Set([
  "science",
  "sciences",
  "engineering",
  "language",
  "langue",
  "des",
  "de",
  "du",
  "la",
  "le",
  "of",
  "and",
  "et",
  "العلوم",
  "علوم",
  "هندسة",
]);

/**
 * Trigger token → normalised synonym terms (full phrases). Single-word terms are
 * matched token-by-token, multi-word terms are matched as phrases against the
 * full normalised name/keyword/summary, so "génie civil" never collapses into a
 * bare "génie" match.
 */
const SYNONYM_LOOKUP: ReadonlyMap<string, readonly string[]> = (() => {
  const variants = new Map<string, Set<string>>();
  for (const group of SYNONYM_GROUPS) {
    const terms = [...new Set(group.map((term) => normalizeQuery(term)))].filter((term) => term.length > 0);
    for (const term of terms) {
      for (const trigger of tokenize(term)) {
        if (trigger.length < 2 || GENERIC_TRIGGERS.has(trigger)) continue;
        const bucket = variants.get(trigger) ?? new Set<string>();
        for (const phrase of terms) bucket.add(phrase);
        variants.set(trigger, bucket);
      }
    }
  }
  const lookup = new Map<string, readonly string[]>();
  for (const [trigger, bucket] of variants) lookup.set(trigger, [...bucket]);
  return lookup;
})();

/** Query token → [itself, ...synonyms]. */
function expandToken(token: string): readonly string[] {
  const bucket = SYNONYM_LOOKUP.get(token);
  if (!bucket) return [token];
  const expanded = new Set<string>([token, ...bucket]);
  return [...expanded];
}

/* -------------------------------------------------------------------------- */
/* Typo tolerance                                                             */
/* -------------------------------------------------------------------------- */

/** Damerau-Levenshtein (optimal string alignment) with an early exit bound. */
function damerauLevenshtein(a: string, b: string, max: number): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > max) return max + 1;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  let previousPrevious: number[] = [];
  let previous: number[] = [];
  for (let j = 0; j <= b.length; j++) previous[j] = j;

  for (let i = 1; i <= a.length; i++) {
    const current: number[] = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let value = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        value = Math.min(value, previousPrevious[j - 2] + 1);
      }
      current[j] = value;
      if (value < rowMin) rowMin = value;
    }
    if (rowMin > max) return max + 1;
    previousPrevious = previous;
    previous = current;
  }
  return previous[b.length];
}

function fuzzyLimit(token: string): number | null {
  if (token.length >= 4) return 2;
  if (token.length === 3) return 1;
  return null;
}

const FUZZY_FACTOR = 0.6;

/* -------------------------------------------------------------------------- */
/* Index                                                                      */
/* -------------------------------------------------------------------------- */

type NameVariant = { value: string; locale: "ar" | "fr" | "en"; label: string };

type IndexedMajor = {
  major: Major;
  nameVariants: NameVariant[];
  nameValues: string[];
  keywordTokens: string[];
  keywordValues: string[];
  summaryTokens: string[];
  summaryValues: string[];
  fieldTokens: string[];
  fieldValues: string[];
  cityTokens: string[];
  cityValues: string[];
  streams: string[];
  universityIds: string[];
  bestThreshold: ThresholdRecord | null;
  bestThresholdValue: number | null;
};

const TIER_EXACT_NAME = 100;
const TIER_NAME_PREFIX = 70;
const TIER_KEYWORD = 50;
const TIER_SUMMARY = 25;
const TIER_FIELD = 20;
const TIER_CITY = 10;

function lowestThreshold(records: ThresholdRecord[]): ThresholdRecord | null {
  let best: ThresholdRecord | null = null;
  for (const record of records) {
    if (record.academicYear !== 2026 || record.value === null) continue;
    if (record.verification !== "verified") continue;
    if (!best || best.value === null || record.value < best.value) best = record;
  }
  return best;
}

function buildIndex(): IndexedMajor[] {
  const thresholdsByMajorId = new Map<string, ThresholdRecord[]>();
  for (const record of renderableThresholds) {
    const bucket = thresholdsByMajorId.get(record.majorId);
    if (bucket) bucket.push(record);
    else thresholdsByMajorId.set(record.majorId, [record]);
  }

  const universityById = new Map(renderableUniversities.map((university) => [university.id, university]));

  return renderableMajors.map((major) => {
    const nameVariants: NameVariant[] = [];
    const locales: ("ar" | "fr" | "en")[] = ["ar", "fr", "en"];
    for (const locale of locales) {
      const label = major.name[locale];
      if (!label) continue;
      nameVariants.push({ value: normalizeQuery(label), locale, label });
    }

    const linkedUniversities = major.universityIds
      .map((id) => universityById.get(id))
      .filter((university): university is NonNullable<typeof university> => Boolean(university));

    const cities = linkedUniversities
      .map((university) => (university.city ? normalizeQuery(university.city) : ""))
      .filter((city) => city.length > 0);

    const cityTokens = new Set<string>();
    for (const city of cities) {
      for (const token of tokenize(city)) cityTokens.add(token);
    }

    const fieldLabel = fieldLabels[major.field];
    const fieldTokens = new Set<string>();
    const fieldValues: string[] = [];
    for (const label of [fieldLabel.ar, fieldLabel.fr, fieldLabel.en]) {
      const normalized = normalizeQuery(label);
      if (normalized) fieldValues.push(normalized);
      for (const token of tokenize(normalized)) fieldTokens.add(token);
    }

    const keywordTokens = new Set<string>();
    const keywordValues: string[] = [];
    for (const keyword of major.keywords) {
      const normalized = normalizeQuery(keyword);
      if (normalized) keywordValues.push(normalized);
      for (const token of tokenize(normalized)) keywordTokens.add(token);
    }

    const summaryTokens = new Set<string>();
    const summaryValues: string[] = [];
    for (const summary of [major.summary.ar, major.summary.fr]) {
      const normalized = normalizeQuery(summary);
      if (normalized) summaryValues.push(normalized);
      for (const token of tokenize(normalized)) summaryTokens.add(token);
    }

    const majorThresholds = thresholdsByMajorId.get(major.id) ?? [];
    const bestThreshold = lowestThreshold(majorThresholds);

    const streams = new Set<string>(major.bacStreams);
    for (const record of majorThresholds) streams.add(record.bacStream);

    return {
      major,
      nameVariants,
      nameValues: nameVariants.map((name) => name.value),
      keywordTokens: [...keywordTokens],
      keywordValues,
      summaryTokens: [...summaryTokens],
      summaryValues,
      fieldTokens: [...fieldTokens],
      fieldValues,
      cityTokens: [...cityTokens],
      cityValues: cities,
      streams: [...streams],
      universityIds: major.universityIds,
      bestThreshold,
      bestThresholdValue: bestThreshold ? bestThreshold.value : null,
    };
  });
}

let indexCache: IndexedMajor[] | null = null;

function getIndex(): IndexedMajor[] {
  if (!indexCache) indexCache = buildIndex();
  return indexCache;
}

/* -------------------------------------------------------------------------- */
/* Scoring                                                                    */
/* -------------------------------------------------------------------------- */

type VariantScore = { score: number; labels: string[] };

function fuzzyVariant(entry: IndexedMajor, variant: string, limit: number): VariantScore {
  const buckets: { tokens: string[]; tier: number; label: string }[] = [
    { tokens: entry.nameVariants.map((name) => name.value), tier: TIER_NAME_PREFIX, label: "name" },
    { tokens: entry.keywordTokens, tier: TIER_KEYWORD, label: "keyword" },
    { tokens: entry.summaryTokens, tier: TIER_SUMMARY, label: "summary" },
    { tokens: entry.fieldTokens, tier: TIER_FIELD, label: "field" },
    { tokens: entry.cityTokens, tier: TIER_CITY, label: "city" },
  ];
  for (const bucket of buckets) {
    for (const token of bucket.tokens) {
      // Same first letter: a cheap guard that keeps Arabic/French typo matches
      // meaningful (e.g. "medcine" → "medecine") instead of matching unrelated
      // short words such as "اعلام" and "علوم".
      if (variant[0] !== token[0]) continue;
      if (damerauLevenshtein(variant, token, limit) <= limit) {
        return { score: bucket.tier * FUZZY_FACTOR, labels: [bucket.label] };
      }
    }
  }
  return { score: 0, labels: [] };
}

function scorePhrase(entry: IndexedMajor, phrase: string): VariantScore {
  const name = entry.nameVariants.find((variant) => variant.value.includes(phrase));
  if (name) return { score: TIER_EXACT_NAME, labels: [`name:${name.locale}`] };
  if (entry.keywordValues.some((value) => value.includes(phrase))) {
    return { score: TIER_KEYWORD, labels: ["keyword"] };
  }
  if (entry.summaryValues.some((value) => value.includes(phrase))) {
    return { score: TIER_SUMMARY, labels: ["summary"] };
  }
  if (entry.fieldValues.some((value) => value.includes(phrase))) {
    return { score: TIER_FIELD, labels: ["field"] };
  }
  if (entry.cityValues.some((value) => value.includes(phrase))) {
    return { score: TIER_CITY, labels: ["city"] };
  }
  return { score: 0, labels: [] };
}

function scoreVariant(entry: IndexedMajor, variant: string): VariantScore {
  if (variant.includes(" ")) return scorePhrase(entry, variant);

  const exact = entry.nameVariants.find((name) => name.value === variant);
  if (exact) return { score: TIER_EXACT_NAME, labels: [`name:${exact.locale}`] };

  const prefix = entry.nameVariants.find(
    (name) => name.value.startsWith(variant) || name.value.split(" ").some((word) => word.startsWith(variant)),
  );
  if (prefix) return { score: TIER_NAME_PREFIX, labels: [`name:${prefix.locale}`] };

  if (entry.keywordTokens.some((token) => token === variant || token.startsWith(variant))) {
    return { score: TIER_KEYWORD, labels: ["keyword"] };
  }
  if (entry.summaryTokens.some((token) => token.startsWith(variant))) {
    return { score: TIER_SUMMARY, labels: ["summary"] };
  }
  if (entry.fieldTokens.some((token) => token.startsWith(variant))) {
    return { score: TIER_FIELD, labels: ["field"] };
  }
  if (entry.cityTokens.some((token) => token.startsWith(variant))) {
    return { score: TIER_CITY, labels: ["city"] };
  }

  const limit = fuzzyLimit(variant);
  if (limit === null) return { score: 0, labels: [] };
  return fuzzyVariant(entry, variant, limit);
}

function scoreToken(entry: IndexedMajor, variants: readonly string[]): VariantScore {
  let best = 0;
  let labels: string[] = [];
  for (const variant of variants) {
    const result = scoreVariant(entry, variant);
    if (result.score > best) {
      best = result.score;
      labels = [...result.labels];
    } else if (result.score === best && result.score > 0) {
      for (const label of result.labels) {
        if (!labels.includes(label)) labels.push(label);
      }
    }
  }
  return { score: best, labels };
}

/* -------------------------------------------------------------------------- */
/* Public API                                                                 */
/* -------------------------------------------------------------------------- */

export type MajorSort = "relevance" | "threshold" | "name";

export const MAJOR_SORTS: readonly MajorSort[] = ["relevance", "threshold", "name"];

export type MajorFilters = {
  query?: string;
  field?: AcademicField | "all";
  stream?: string | "all";
  city?: string | "all";
  universityId?: string | "all";
  maxYears?: number | null;
  degree?: DegreeType | "all";
  /** Published minimum average must be ≤ this value. */
  maxThreshold?: number | null;
  /** Published minimum average must be ≥ this value. */
  minThreshold?: number | null;
  sort?: MajorSort;
  /** Locale used for the alphabetical sort. */
  locale?: Locale;
};

export type SearchHit = {
  major: Major;
  score: number;
  matchedOn: string[];
  bestThreshold: ThresholdRecord | null;
};

function nowMs(): number {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

function passesFilters(entry: IndexedMajor, filters: MajorFilters, city: string | null): boolean {
  if (filters.field && filters.field !== "all" && entry.major.field !== filters.field) return false;
  if (filters.degree && filters.degree !== "all" && entry.major.degree !== filters.degree) return false;
  if (filters.stream && filters.stream !== "all" && !entry.streams.includes(filters.stream)) return false;
  if (filters.universityId && filters.universityId !== "all" && !entry.universityIds.includes(filters.universityId)) {
    return false;
  }
  if (city !== null && !entry.cityValues.includes(city)) return false;
  if (typeof filters.maxYears === "number") {
    if (entry.major.durationYears === null || entry.major.durationYears > filters.maxYears) return false;
  }
  if (typeof filters.maxThreshold === "number") {
    if (entry.bestThresholdValue === null || entry.bestThresholdValue > filters.maxThreshold) return false;
  }
  if (typeof filters.minThreshold === "number") {
    if (entry.bestThresholdValue === null || entry.bestThresholdValue < filters.minThreshold) return false;
  }
  return true;
}

function sortScored(hits: SearchHit[], filters: MajorFilters): SearchHit[] {
  const locale: Locale = filters.locale ?? "fr";
  const byName = (a: SearchHit, b: SearchHit) => {
    const left = a.major.name[locale] ?? a.major.name.fr;
    const right = b.major.name[locale] ?? b.major.name.fr;
    return left.localeCompare(right, locale === "ar" ? "ar" : locale);
  };
  const valueOf = (hit: SearchHit) =>
    hit.bestThreshold && hit.bestThreshold.value !== null ? hit.bestThreshold.value : Number.POSITIVE_INFINITY;

  const sort = filters.sort ?? "relevance";
  if (sort === "name") return [...hits].sort(byName);
  if (sort === "threshold") {
    return [...hits].sort((a, b) => valueOf(a) - valueOf(b) || byName(a, b));
  }
  return [...hits].sort((a, b) => b.score - a.score || valueOf(a) - valueOf(b) || byName(a, b));
}

export function searchMajors(
  filters: MajorFilters = {},
  limit = 20,
  offset = 0,
): { hits: SearchHit[]; total: number; took: number } {
  const startedAt = nowMs();
  const query = normalizeQuery(filters.query ?? "");
  const tokens = tokenize(query)
    .filter((token) => token.length > 1)
    .map((token) => ({ variants: expandToken(token), generic: GENERIC_TRIGGERS.has(token) }));
  const city = filters.city && filters.city !== "all" ? normalizeQuery(filters.city) : null;

  const scored: SearchHit[] = [];
  for (const entry of getIndex()) {
    if (!passesFilters(entry, filters, city)) continue;

    let score = 0;
    let matchedNonGeneric = false;
    const matchedOn: string[] = [];
    for (const token of tokens) {
      const result = scoreToken(entry, token.variants);
      score += result.score;
      if (result.score > 0 && !token.generic) matchedNonGeneric = true;
      for (const label of result.labels) {
        if (!matchedOn.includes(label)) matchedOn.push(label);
      }
    }

    if (tokens.length > 0 && score === 0) continue;
    // A multi-token query must match on something more specific than a generic
    // word such as "science" or "علوم".
    if (tokens.length > 1 && !matchedNonGeneric) continue;

    scored.push({
      major: entry.major,
      score,
      matchedOn,
      bestThreshold: entry.bestThreshold,
    });
  }

  const ordered = sortScored(scored, filters);
  const total = ordered.length;
  const start = Math.max(0, Math.floor(offset));
  const size = Math.max(0, Math.floor(limit));
  const hits = size === 0 ? [] : ordered.slice(start, start + size);
  return { hits, total, took: Math.max(0, nowMs() - startedAt) };
}

export type Page<T> = { items: T[]; page: number; pageSize: number; pages: number; total: number };

/** Clamp a 1-based page and slice it. Pages are never empty when items exist. */
export function paginate<T>(items: T[], page = 1, pageSize = 10): Page<T> {
  const size = Math.max(1, Math.floor(pageSize));
  const total = items.length;
  const pages = Math.max(1, Math.ceil(total / size));
  const current = Math.min(Math.max(1, Math.floor(Number.isFinite(page) ? page : 1)), pages);
  const start = (current - 1) * size;
  return { items: items.slice(start, start + size), page: current, pageSize: size, pages, total };
}

type Suggestion = { raw: string; normalized: string };

let suggestionCache: Suggestion[] | null = null;

function getSuggestions(): Suggestion[] {
  if (suggestionCache) return suggestionCache;
  const pool: Suggestion[] = [];
  const seen = new Set<string>();
  for (const entry of getIndex()) {
    for (const name of entry.nameVariants) {
      if (seen.has(name.value)) continue;
      seen.add(name.value);
      pool.push({ raw: name.label, normalized: name.value });
    }
  }
  suggestionCache = pool;
  return pool;
}

/** Name suggestions for a partial query (prefix first, then typo tolerance). */
export function suggest(query: string, limit = 8): string[] {
  const normalized = normalizeQuery(query);
  if (!normalized) return [];
  const size = Math.max(0, Math.floor(limit));
  if (size === 0) return [];

  const prefixMatches: Suggestion[] = [];
  const fuzzyMatches: Suggestion[] = [];
  const limitDistance = fuzzyLimit(normalized) ?? (normalized.length >= 4 ? 2 : null);

  for (const suggestion of getSuggestions()) {
    if (suggestion.normalized.startsWith(normalized)) {
      prefixMatches.push(suggestion);
      continue;
    }
    if (limitDistance === null || normalized.length < 3) continue;
    const words = suggestion.normalized.split(" ");
    const close = words.some((word) => word.startsWith(normalized)) ||
      damerauLevenshtein(normalized, suggestion.normalized, limitDistance) <= limitDistance ||
      words.some((word) => damerauLevenshtein(normalized, word, limitDistance) <= limitDistance);
    if (close) fuzzyMatches.push(suggestion);
  }

  const byLength = (a: Suggestion, b: Suggestion) =>
    a.normalized.length - b.normalized.length || a.normalized.localeCompare(b.normalized);
  prefixMatches.sort(byLength);
  fuzzyMatches.sort(byLength);

  const results: string[] = [];
  for (const suggestion of [...prefixMatches, ...fuzzyMatches]) {
    if (results.includes(suggestion.raw)) continue;
    results.push(suggestion.raw);
    if (results.length >= size) break;
  }
  return results;
}

/** Majors sharing a field, stream or keyword with `slug`, closest first. */
export function relatedMajors(slug: string, limit = 6): Major[] {
  const base = renderableMajorBySlug[slug];
  if (!base) return [];
  const baseEntry = getIndex().find((entry) => entry.major.id === base.id);
  const baseKeywords = new Set(baseEntry ? baseEntry.keywordTokens : []);
  const size = Math.max(0, Math.floor(limit));
  if (size === 0) return [];

  const scored = getIndex()
    .filter((entry) => entry.major.id !== base.id)
    .map((entry) => {
      let score = 0;
      if (entry.major.field === base.field) score += 3;
      const sharedKeywords = entry.keywordTokens.filter((token) => baseKeywords.has(token)).length;
      score += Math.min(3, sharedKeywords) * 2;
      if (entry.streams.some((stream) => base.bacStreams.includes(stream))) score += 1;
      if (entry.universityIds.some((id) => base.universityIds.includes(id))) score += 1;
      return { major: entry.major, score };
    })
    .filter((entry) => entry.score >= 2);

  scored.sort((a, b) => b.score - a.score || a.major.name.fr.localeCompare(b.major.name.fr, "fr"));
  return scored.slice(0, size).map((entry) => entry.major);
}

/* -------------------------------------------------------------------------- */
/* Filter options                                                             */
/* -------------------------------------------------------------------------- */

export type FilterOption = { value: string; ar: string; fr: string; en: string };

export type MajorFilterOptions = {
  fields: FilterOption[];
  streams: FilterOption[];
  universities: FilterOption[];
  /** Lowest/highest published 2026 minimum average in the renderable set. */
  thresholdRange: { min: number; max: number } | null;
};

/**
 * Options are derived from the renderable records only, so the UI can never
 * offer a filter that matches nothing. Geography is deliberately absent: the
 * ministry table publishes no city or wilaya column, and this repository does
 * not invent one.
 */
export function majorFilterOptions(): MajorFilterOptions {
  const fieldValues = new Set<AcademicField>();
  const streamValues = new Set<string>();
  const universityValues = new Set<string>();
  let min: number | null = null;
  let max: number | null = null;

  for (const major of renderableMajors) {
    fieldValues.add(major.field);
    for (const stream of major.bacStreams) streamValues.add(stream);
    for (const id of major.universityIds) universityValues.add(id);
  }
  for (const record of renderableThresholds) {
    if (record.value === null) continue;
    min = min === null ? record.value : Math.min(min, record.value);
    max = max === null ? record.value : Math.max(max, record.value);
  }

  const fields: FilterOption[] = [...fieldValues]
    .sort((a, b) => ACADEMIC_FIELDS.indexOf(a) - ACADEMIC_FIELDS.indexOf(b))
    .map((field) => ({ value: field, ...fieldLabels[field] }));

  const streams: FilterOption[] = [...streamValues]
    .sort((a, b) => a.localeCompare(b))
    .map((stream) => {
      const label = (streamById as Record<string, { name: { ar: string; fr: string; en: string } } | undefined>)[stream];
      return {
        value: stream,
        ar: label?.name.ar ?? stream,
        fr: label?.name.fr ?? stream,
        en: label?.name.en ?? stream,
      };
    });

  const universities: FilterOption[] = renderableUniversities
    .filter((university) => universityValues.has(university.id))
    .map((university) => ({
      value: university.id,
      ar: university.name.ar,
      fr: university.name.fr,
      en: university.name.en ?? university.name.fr,
    }))
    .sort((a, b) => a.fr.localeCompare(b.fr, "fr"));

  return {
    fields,
    streams,
    universities,
    thresholdRange: min !== null && max !== null ? { min, max } : null,
  };
}
    