/**
 * Types for the majors / university seed dataset.
 *
 * Ground rules for every record in this folder:
 * - nothing is invented: a field that the official source does not state is
 *   `null` (or `"unknown"` where the enum requires a value), never a guess;
 * - every record carries `verification`, `lastVerifiedAt`, `sourceIds` and,
 *   when it may be rendered, `sourceUrl` + `academicYear`;
 * - an unverified record is still useful for navigation, as long as it says so
 *   and is filtered out of every public surface by `lib/majors/dataset.ts`.
 *
 * `verification` describes the record's *factual core*, not its editorial
 * annotations:
 * - "verified"   every field listed in `officialFields` (or, for thresholds,
 *                the published figure/year/institution) is traceable to the
 *                cited source, and `sourceUrl` + `academicYear` +
 *                `lastVerifiedAt` are filled in;
 * - "pending"    the source backs most fields but at least one link (for
 *                example which bac stream a published average belongs to)
 *                still has to be checked against the full official table;
 * - "unverified" the record exists for navigation only.
 *
 * Two editorial links are flagged explicitly rather than hidden inside
 * `verification`:
 * - `Major.streamsEditorial` — the bac-stream list comes from the repository's
 *   editorial mapping in `content/orientation.ts`, not from a per-program
 *   column;
 * - `ThresholdRecord.streamPairing` — the same caveat for a published average.
 * A rendering surface must state both caveats; they are not optional.
 */

export type VerificationStatus = "verified" | "pending" | "unverified";

export type AcademicField =
  | "health"
  | "engineering"
  | "science"
  | "it"
  | "economics"
  | "law"
  | "languages"
  | "humanities"
  | "arts"
  | "agriculture"
  | "other";

export type DegreeType =
  | "licence"
  | "master"
  | "doctorate"
  | "engineering"
  | "medical"
  | "professional"
  | "unknown";

/** Arabic/French are mandatory; `en` is optional because not every official
 *  row publishes an English label. */
export type LocalizedName = { ar: string; fr: string; en?: string };
export type LocalizedPair = { ar: string; fr: string };

export type Faculty = { id: string; name: LocalizedPair };

/** Fields the 2026 MESRS table actually publishes for a program row. */
export type OfficialField = "name" | "field" | "institution";

export type University = {
  id: string;
  slug: string;
  name: LocalizedName;
  city: string | null;
  wilaya: string | null;
  kind: "university" | "center" | "school" | "institute";
  website: string | null;
  faculties: Faculty[];
  sourceIds: string[];
  /** Absolute URL of the cited source. Required for a renderable record. */
  sourceUrl: string | null;
  /** Academic year of the cited source (2026 campaign table). */
  academicYear: number | null;
  verification: VerificationStatus;
  lastVerifiedAt: string | null;
};

export type Major = {
  id: string;
  slug: string;
  name: LocalizedName;
  summary: LocalizedPair;
  field: AcademicField;
  degree: DegreeType;
  durationYears: number | null;
  /** `content/bac` StreamId values. */
  bacStreams: string[];
  /** True while `bacStreams` is the repository's editorial mapping. */
  streamsEditorial: boolean;
  /** Which asserted fields the cited row actually publishes. */
  officialFields: OfficialField[];
  /** Arabic + French + English synonyms used by the search index. */
  keywords: string[];
  /** Only when a verified curriculum exists; always `null` in this seed. */
  curriculum: { ar: string[]; fr: string[] } | null;
  careers: LocalizedPair[] | null;
  universityIds: string[];
  sourceIds: string[];
  /** Absolute URL of the cited source. Required for a renderable record. */
  sourceUrl: string | null;
  /** Academic year of the cited source (2026 campaign table). */
  academicYear: number | null;
  verification: VerificationStatus;
  lastVerifiedAt: string | null;
  notes: LocalizedPair | null;
};

export type ThresholdRecord = {
  id: string;
  majorId: string;
  universityId: string;
  /** `content/bac` StreamId value. */
  bacStream: string;
  academicYear: number;
  value: number | null;
  group: "min1" | "min2" | "min3" | null;
  category: string | null;
  sourceId: string;
  /** Absolute URL of the cited source. Required for a renderable record. */
  sourceUrl: string | null;
  /** The published table has no per-program stream column. */
  streamPairing: "editorial";
  verification: VerificationStatus;
  lastVerifiedAt: string | null;
};

export type MajorSource = {
  id: string;
  title: string;
  url: string;
  publicationDate: string | null;
  type: "official" | "university" | "editorial";
  verificationDate: string;
};

/** Ordered list used by filter UIs and by the guards below. */
export const ACADEMIC_FIELDS: readonly AcademicField[] = [
  "health",
  "engineering",
  "science",
  "it",
  "economics",
  "law",
  "languages",
  "humanities",
  "arts",
  "agriculture",
  "other",
];

export const DEGREE_TYPES: readonly DegreeType[] = [
  "licence",
  "master",
  "doctorate",
  "engineering",
  "medical",
  "professional",
  "unknown",
];

const VERIFICATION_VALUES: readonly VerificationStatus[] = ["verified", "pending", "unverified"];
const THRESHOLD_GROUPS = ["min1", "min2", "min3"] as const;
const UNIVERSITY_KINDS = ["university", "center", "school", "institute"] as const;
const SOURCE_TYPES = ["official", "university", "editorial"] as const;
const OFFICIAL_FIELDS: readonly OfficialField[] = ["name", "field", "institution"];

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isString);
}

function isOneOf<T extends string>(value: unknown, allowed: readonly T[]): value is T {
  return isString(value) && (allowed as readonly string[]).includes(value);
}

function isLocalizedPair(value: unknown): value is LocalizedPair {
  return isObject(value) && isString(value.ar) && isString(value.fr);
}

function isLocalizedName(value: unknown): value is LocalizedName {
  return isLocalizedPair(value) && ((value as Record<string, unknown>).en === undefined || isString((value as Record<string, unknown>).en));
}

function isVerification(value: unknown): value is VerificationStatus {
  return isOneOf(value, VERIFICATION_VALUES);
}

function isDateOrNull(value: unknown): value is string | null {
  return value === null || isString(value);
}

function isNumberOrNull(value: unknown): value is number | null {
  return value === null || isFiniteNumber(value);
}

function isCurriculum(value: unknown): value is { ar: string[]; fr: string[] } | null {
  if (value === null) return true;
  return isObject(value) && isStringArray(value.ar) && isStringArray(value.fr);
}

function isCareers(value: unknown): value is LocalizedPair[] | null {
  if (value === null) return true;
  return Array.isArray(value) && value.every(isLocalizedPair);
}

export function isUniversity(value: unknown): value is University {
  if (!isObject(value)) return false;
  if (!isString(value.id) || !isString(value.slug)) return false;
  if (!isLocalizedName(value.name)) return false;
  if (!(value.city === null || isString(value.city))) return false;
  if (!(value.wilaya === null || isString(value.wilaya))) return false;
  if (!isOneOf(value.kind, UNIVERSITY_KINDS)) return false;
  if (!(value.website === null || isString(value.website))) return false;
  if (
    !Array.isArray(value.faculties) ||
    !value.faculties.every((faculty) => isObject(faculty) && isString(faculty.id) && isLocalizedPair(faculty.name))
  ) {
    return false;
  }
  if (!isStringArray(value.sourceIds)) return false;
  if (!(value.sourceUrl === null || isString(value.sourceUrl))) return false;
  if (!isNumberOrNull(value.academicYear)) return false;
  if (!isVerification(value.verification)) return false;
  return isDateOrNull(value.lastVerifiedAt);
}

export function isMajor(value: unknown): value is Major {
  if (!isObject(value)) return false;
  if (!isString(value.id) || !isString(value.slug)) return false;
  if (!isLocalizedName(value.name)) return false;
  if (!isLocalizedPair(value.summary)) return false;
  if (!isOneOf(value.field, ACADEMIC_FIELDS)) return false;
  if (!isOneOf(value.degree, DEGREE_TYPES)) return false;
  if (!(value.durationYears === null || isFiniteNumber(value.durationYears))) return false;
  if (!isStringArray(value.bacStreams)) return false;
  if (typeof value.streamsEditorial !== "boolean") return false;
  if (!Array.isArray(value.officialFields) || !value.officialFields.every((field) => isOneOf(field, OFFICIAL_FIELDS))) {
    return false;
  }
  if (!isStringArray(value.keywords)) return false;
  if (!isCurriculum(value.curriculum)) return false;
  if (!isCareers(value.careers)) return false;
  if (!isStringArray(value.universityIds)) return false;
  if (!isStringArray(value.sourceIds)) return false;
  if (!(value.sourceUrl === null || isString(value.sourceUrl))) return false;
  if (!isNumberOrNull(value.academicYear)) return false;
  if (!isVerification(value.verification)) return false;
  if (!isDateOrNull(value.lastVerifiedAt)) return false;
  return value.notes === null || isLocalizedPair(value.notes);
}

export function isThresholdRecord(value: unknown): value is ThresholdRecord {
  if (!isObject(value)) return false;
  if (!isString(value.id) || !isString(value.majorId) || !isString(value.universityId)) return false;
  if (!isString(value.bacStream)) return false;
  if (!isFiniteNumber(value.academicYear)) return false;
  if (!(value.value === null || isFiniteNumber(value.value))) return false;
  if (!(value.group === null || isOneOf(value.group, THRESHOLD_GROUPS))) return false;
  if (!(value.category === null || isString(value.category))) return false;
  if (!isString(value.sourceId)) return false;
  if (!(value.sourceUrl === null || isString(value.sourceUrl))) return false;
  if (value.streamPairing !== "editorial") return false;
  if (!isVerification(value.verification)) return false;
  return isDateOrNull(value.lastVerifiedAt);
}

export function isMajorSource(value: unknown): value is MajorSource {
  if (!isObject(value)) return false;
  if (!isString(value.id) || !isString(value.title) || !isString(value.url)) return false;
  if (!(value.publicationDate === null || isString(value.publicationDate))) return false;
  if (!isOneOf(value.type, SOURCE_TYPES)) return false;
  return isString(value.verificationDate);
}

/**
 * The single gate every public surface must go through. A record is renderable
 * only when it is verified *and* carries the three provenance fields the UI
 * promises to show next to the number: source URL, academic year and the date
 * it was checked.
 */
export function isRenderableRecord(value: {
  verification: VerificationStatus;
  sourceUrl: string | null;
  academicYear: number | null;
  lastVerifiedAt: string | null;
}): boolean {
  const url = value.sourceUrl;
  return (
    value.verification === "verified" &&
    typeof url === "string" &&
    /^https?:\/\//.test(url) &&
    typeof value.academicYear === "number" &&
    Number.isInteger(value.academicYear) &&
    typeof value.lastVerifiedAt === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value.lastVerifiedAt)
  );
}
