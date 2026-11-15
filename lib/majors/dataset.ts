/**
 * The single gate between the seed dataset and every public surface.
 *
 * `content/majors/programs.ts` keeps a few rows that are deliberately *not*
 * published (a grouped label, a specialisation, a national pool). They stay in
 * the repository so the editorial decision is auditable, but nothing here
 * exposes them: search, recommendations, pages, sitemap and route index all
 * read from the `renderable*` collections below.
 *
 * A record is renderable only when it is `verified`, carries `sourceUrl` +
 * `academicYear` + `lastVerifiedAt`, and is not silently ageing: the academic
 * year must match the campaign year of the dataset.
 */
import {
  FIGURES_SOURCE,
  institutionLabelById,
  majors,
  sourceById,
  sources,
  thresholds,
  withheldRows,
} from "@/content/majors/programs";
import {
  isRenderableRecord,
  type Major,
  type MajorSource,
  type ThresholdRecord,
  type University,
} from "@/content/majors/schema";
import { universities } from "@/content/universities";
import type { SourceRef } from "@/content/types";

/** Campaign year of the only table seeded in this repository. */
export const ACADEMIC_YEAR = 2026;

/** The year those figures describe, spelled out for the UI. */
export const FIGURES_YEAR_LABEL = "2026";

function renderable<T extends { verification: University["verification"]; sourceUrl: string | null; academicYear: number | null; lastVerifiedAt: string | null }>(
  records: T[],
): T[] {
  return records.filter((record) => isRenderableRecord(record) && record.academicYear === ACADEMIC_YEAR);
}

export const renderableMajors: Major[] = renderable(majors);
export const renderableUniversities: University[] = renderable(universities);
export const renderableThresholds: ThresholdRecord[] = renderable(thresholds);

export const renderableMajorBySlug: Record<string, Major> = Object.fromEntries(
  renderableMajors.map((entry) => [entry.slug, entry]),
);

export const renderableUniversityBySlug: Record<string, University> = Object.fromEntries(
  renderableUniversities.map((entry) => [entry.slug, entry]),
);

const thresholdsByMajorId = new Map<string, ThresholdRecord[]>();
for (const record of renderableThresholds) {
  const bucket = thresholdsByMajorId.get(record.majorId);
  if (bucket) bucket.push(record);
  else thresholdsByMajorId.set(record.majorId, [record]);
}

/** Published figures for one program, ascending by value then group. */
export function thresholdsForMajorSlug(slug: string): ThresholdRecord[] {
  const entry = renderableMajorBySlug[slug];
  if (!entry) return [];
  const records = thresholdsByMajorId.get(entry.id) ?? [];
  return [...records].sort(
    (a, b) =>
      (a.value ?? Number.POSITIVE_INFINITY) - (b.value ?? Number.POSITIVE_INFINITY) ||
      a.bacStream.localeCompare(b.bacStream) ||
      (a.group ?? "").localeCompare(b.group ?? ""),
  );
}

/** Majors published by one institution. */
export function renderableMajorsForUniversity(universityId: string): Major[] {
  return renderableMajors.filter((entry) => entry.universityIds.includes(universityId));
}

/** The published label for an institution id, verbatim from the source table. */
export function publishedInstitutionLabel(universityId: string): string {
  const university = universities.find((entry) => entry.id === universityId);
  if (university) return university.name.fr;
  return institutionLabelById[universityId] ?? universityId;
}

/** Absolute URL of the source backing a record. */
export function sourceUrlFor(record: { sourceIds: string[] }): string | null {
  for (const id of record.sourceIds) {
    const source = sourceById[id];
    if (source) return source.url;
  }
  return null;
}

/** Sources cited by at least one rendered record. */
export function citedSources(): MajorSource[] {
  const ids = new Set<string>();
  for (const entry of renderableMajors) for (const id of entry.sourceIds) ids.add(id);
  for (const record of renderableThresholds) ids.add(record.sourceId);
  for (const entry of renderableUniversities) for (const id of entry.sourceIds) ids.add(id);
  return sources.filter((source) => ids.has(source.id));
}

/** `SourceRef` view of the sources, ready for the shared `SourceList`. */
export function citedSourceRefs(): SourceRef[] {
  return citedSources().map((source) => ({
    label: source.title,
    url: source.url,
    kind: source.type === "official" ? "official" : "editorial",
    checkedOn: source.verificationDate,
    note: source.publicationDate ? `publication: ${source.publicationDate}` : undefined,
  }));
}

/**
 * Honest volume report. Every number here is derived, never typed by hand, and
 * the UI prints exactly these values.
 */
export const datasetStats = {
  academicYear: ACADEMIC_YEAR,
  majors: renderableMajors.length,
  withheldMajors: majors.length - renderableMajors.length,
  universities: renderableUniversities.length,
  withheldUniversities: universities.length - renderableUniversities.length,
  thresholdFigures: renderableThresholds.length,
  sources: citedSources().length,
} as const;

/** Rows the editorial gate keeps out of the public site, with their reason. */
export const withheldPrograms = withheldRows;

/** The source that backs every rendered figure (exposed for the detail pages). */
export const figuresSource = FIGURES_SOURCE;
