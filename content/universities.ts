/**
 * Universities / higher-education institutions.
 *
 * The ONLY institution names available in this repository come from the
 * `orientationFields` table in `content/orientation.ts` (official MESRS 2026
 * table, reproduction). Those rows publish the institution label in French
 * only, so we copy it verbatim and do NOT translate it: `name.ar` mirrors the
 * published French label until the Arabic label can be checked against the
 * institution's own official page. Translating a name is a data change, not a
 * formatting choice.
 *
 * Everything the official table does not state is `null`/empty:
 * - `city`, `wilaya`  → the table has no geography column;
 * - `website`         → not part of the source;
 * - `faculties`       → not part of the source (kept as an empty array).
 *
 * `recrutement-national` is NOT a campus. It reproduces the institution cell
 * "Recrutement national" used by the ministry table for medicine, pharmacy and
 * dentistry. It is kept here so the published national averages can be attached
 * to a real record instead of being dropped; its `kind` and name follow the
 * schema/source wording and its verification is "pending" because the schema
 * has no "national pool" member and because it has no city, site or faculties.
 * A "pending" university is never published as a page: its label is still shown
 * verbatim next to the published averages.
 */
import { orientationSources } from "./orientation";
import type { University } from "./majors/schema";

/** Shared provenance for every record below. */
const MESRS_2026 = "mesrs-2026";
const CHECKED_ON = "2026-11-15";
const ACADEMIC_YEAR = 2026;

function mesrsUrl(): string {
  const ref = orientationSources.find((source) => source.url.includes("Fichier-des-moyennes-minimales"));
  if (!ref) throw new Error("content/universities: MESRS 2026 table not found in orientationSources.");
  return ref.url;
}

const SOURCE_URL = mesrsUrl();

export const universities: University[] = [
  {
    id: "univ-alger-1",
    slug: "universite-alger-1",
    name: { ar: "Université Alger 1", fr: "Université Alger 1" },
    city: null,
    wilaya: null,
    kind: "university",
    website: null,
    faculties: [],
    sourceIds: [MESRS_2026],
    sourceUrl: SOURCE_URL,
    academicYear: ACADEMIC_YEAR,
    verification: "verified",
    lastVerifiedAt: CHECKED_ON,
  },
  {
    id: "univ-setif-1",
    slug: "universite-setif-1",
    name: { ar: "Université Sétif 1", fr: "Université Sétif 1" },
    city: null,
    wilaya: null,
    kind: "university",
    website: null,
    faculties: [],
    sourceIds: [MESRS_2026],
    sourceUrl: SOURCE_URL,
    academicYear: ACADEMIC_YEAR,
    verification: "verified",
    lastVerifiedAt: CHECKED_ON,
  },
  {
    id: "univ-constantine-1",
    slug: "universite-constantine-1",
    name: { ar: "Université Constantine 1", fr: "Université Constantine 1" },
    city: null,
    wilaya: null,
    kind: "university",
    website: null,
    faculties: [],
    sourceIds: [MESRS_2026],
    sourceUrl: SOURCE_URL,
    academicYear: ACADEMIC_YEAR,
    verification: "verified",
    lastVerifiedAt: CHECKED_ON,
  },
  {
    id: "univ-oran-1",
    slug: "universite-oran-1",
    name: { ar: "Université Oran 1", fr: "Université Oran 1" },
    city: null,
    wilaya: null,
    kind: "university",
    website: null,
    faculties: [],
    sourceIds: [MESRS_2026],
    sourceUrl: SOURCE_URL,
    academicYear: ACADEMIC_YEAR,
    verification: "verified",
    lastVerifiedAt: CHECKED_ON,
  },
  {
    id: "univ-tlemcen",
    slug: "universite-tlemcen",
    name: { ar: "Université Tlemcen", fr: "Université Tlemcen" },
    city: null,
    wilaya: null,
    kind: "university",
    website: null,
    faculties: [],
    sourceIds: [MESRS_2026],
    sourceUrl: SOURCE_URL,
    academicYear: ACADEMIC_YEAR,
    verification: "verified",
    lastVerifiedAt: CHECKED_ON,
  },
  {
    id: "univ-chlef",
    slug: "universite-chlef",
    name: { ar: "Université Chlef", fr: "Université Chlef" },
    city: null,
    wilaya: null,
    kind: "university",
    website: null,
    faculties: [],
    sourceIds: [MESRS_2026],
    sourceUrl: SOURCE_URL,
    academicYear: ACADEMIC_YEAR,
    verification: "verified",
    lastVerifiedAt: CHECKED_ON,
  },
  {
    id: "cu-aflou",
    slug: "centre-universitaire-aflou",
    name: { ar: "Centre universitaire Aflou", fr: "Centre universitaire Aflou" },
    city: null,
    wilaya: null,
    kind: "center",
    website: null,
    faculties: [],
    sourceIds: [MESRS_2026],
    sourceUrl: SOURCE_URL,
    academicYear: ACADEMIC_YEAR,
    verification: "verified",
    lastVerifiedAt: CHECKED_ON,
  },
  {
    id: "recrutement-national",
    slug: "recrutement-national",
    name: { ar: "Recrutement national", fr: "Recrutement national" },
    city: null,
    wilaya: null,
    kind: "university",
    website: null,
    faculties: [],
    sourceIds: [MESRS_2026],
    sourceUrl: SOURCE_URL,
    academicYear: ACADEMIC_YEAR,
    verification: "pending",
    lastVerifiedAt: null,
  },
];

export const universityBySlug: Record<string, University> = Object.fromEntries(
  universities.map((university) => [university.slug, university]),
);
