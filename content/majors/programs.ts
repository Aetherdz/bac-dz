/**
 * Seed dataset: majors, 2026 threshold records and sources.
 *
 * Derivation rules (do not weaken them):
 * 1. A `Major` is derived only when the row's own field label names the
 *    program unambiguously. Grouped labels ("Sciences économiques, de gestion
 *    et commerciales") and specialised labels ("Informatique (intelligence
 *    artificielle)") are kept in the file but marked "pending", which excludes
 *    them from every public surface (see `lib/majors/dataset.ts`).
 * 2. Threshold values are read programmatically from `orientationFields`
 *    (`content/orientation.ts`) — never re-typed by hand, never averaged.
 *    Only `year === 2026` rows are converted: the file also contains two 2025
 *    comparison rows, and this seed deliberately keeps one academic year.
 * 3. The official table publishes one value per candidate group (Min1/Min2/
 *    Min3) and per institution/field row; `bacStream` comes from the row's own
 *    `streams` array, which orientation.ts labels as an *editorial* mapping.
 *    The published figure is therefore "verified"; the (program, stream)
 *    pairing is flagged `streamPairing: "editorial"` and repeated in the UI.
 * 4. The table says nothing about curriculum, careers, degree level or
 *    duration. Those fields are `null` / "unknown" and explained in `notes`.
 * 5. `sourceUrl`, `academicYear` and `lastVerifiedAt` are copied from the
 *    resolved source. A record without all three cannot be rendered.
 */
import { orientationFields, orientationSources } from "../orientation";
import type {
  AcademicField,
  DegreeType,
  Major,
  MajorSource,
  OfficialField,
  ThresholdRecord,
  VerificationStatus,
} from "./schema";

const CHECKED_ON = "2026-11-15";
const ACADEMIC_YEAR = 2026;

/* -------------------------------------------------------------------------- */
/* Sources                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Sources are resolved from `orientationSources` by URL fragment so that no
 * URL or label is re-typed here. A missing entry throws at module load: better
 * a loud failure than a silently source-less record.
 */
function defineSource(id: string, urlFragment: string, publicationDate: string | null): MajorSource {
  const ref = orientationSources.find((source) => source.url.includes(urlFragment));
  if (!ref) {
    throw new Error(`content/majors: source "${id}" not found in orientationSources (${urlFragment}).`);
  }
  return {
    id,
    title: ref.label,
    url: ref.url,
    publicationDate,
    type: ref.kind === "official" ? "official" : "editorial",
    verificationDate: ref.checkedOn ?? CHECKED_ON,
  };
}

export const sources: MajorSource[] = [
  // Table générée le 29 juillet 2026 (see orientationSources[0].note).
  defineSource("mesrs-2026", "Fichier-des-moyennes-minimales", "2026-07-29"),
  defineSource("mesrs-circulaire-2026", "signe-electroniquement", "2026-07-07"),
  defineSource("mesrs-preinscription-2026", "avis-", null),
  // 2025 republication: kept as a source reference, but no 2025 threshold is
  // seeded (rule 2 above).
  defineSource("aflou-2025", "cu-aflou.edu.dz", null),
];

export const sourceById: Record<string, MajorSource> = Object.fromEntries(
  sources.map((source) => [source.id, source]),
);

/** The one source that backs every rendered figure in this dataset. */
export const FIGURES_SOURCE = sourceById["mesrs-2026"];

function resolveSource(id: string): MajorSource {
  const source = sourceById[id];
  if (!source) throw new Error(`content/majors: unknown source id "${id}".`);
  return source;
}

/* -------------------------------------------------------------------------- */
/* Notes                                                                      */
/* -------------------------------------------------------------------------- */

/** Official identity, editorial everything else. */
const OFFICIAL_ROW_NOTE = {
  ar: "الاسم والمجال والمؤسسة مأخوذة من سطر رسمي في جدول MESRS لسنة 2026. الوصف التحريري وقائمة الشعب اجتهاد تحريري في هذا المستودع وليسا عمودًا رسميًا. البرنامج الدراسي والآفاق المهنية ومستوى الشهادة والمدة غير مذكورة في المصدر، لذلك تبقى null.",
  fr: "Le nom, le domaine et l’établissement proviennent d’une ligne officielle du tableau MESRS 2026. Le résumé et la liste de filières sont éditoriaux et ne figurent pas comme colonnes officielles. Programme, débouchés, niveau de diplôme et durée sont absents de la source : ces champs restent null.",
};

/** Row label covers a family of programs, not a single program. */
const GROUPED_NOTE = {
  ar: "عنوان السطر الرسمي يغطي عائلة تكوينات (اقتصاد، تسيير، تجارة) وليس تكوينًا واحدًا؛ لذلك لا نعرضه كصفحة تكوين، ولا نوزّع المعدلات المنشورة عليه.",
  fr: "Le libellé officiel couvre une famille de programmes (économie, gestion, commerce) et non un programme unique ; il n’est donc pas publié comme fiche et les moyennes ne lui sont pas ventilées.",
};

/** Row label names a specialisation of another program. */
const SPECIALISATION_NOTE = {
  ar: "عنوان السطر الرسمي يذكر تخصصًا داخل الإعلام الآلي؛ قد يكون مسارًا داخليًا في نفس الشعبة، لذلك لا نعرضه كتكوين مستقل حتى نتأكد من كتيب التكوين.",
  fr: "Le libellé officiel désigne une spécialisation au sein de l’informatique ; elle peut être un parcours interne à la filière. Elle n’est donc pas publiée comme fiche distincte avant vérification.",
};

/* -------------------------------------------------------------------------- */
/* Majors                                                                     */
/* -------------------------------------------------------------------------- */

type MajorInput = {
  id: string;
  slug: string;
  name: { ar: string; fr: string; en: string };
  summary: { ar: string; fr: string };
  field: AcademicField;
  degree: DegreeType;
  bacStreams: string[];
  keywords: string[];
  universityIds: string[];
  verification: VerificationStatus;
  notes: { ar: string; fr: string };
  /** Which asserted fields the 2026 row publishes. */
  officialFields: OfficialField[];
  /** Every row seeded here comes from the 2026 campaign table. */
  rowSourceId?: string;
};

function major(input: MajorInput): Major {
  const sourceId = input.rowSourceId ?? "mesrs-2026";
  const source = resolveSource(sourceId);
  const verified = input.verification === "verified";
  return {
    id: input.id,
    slug: input.slug,
    name: input.name,
    summary: input.summary,
    field: input.field,
    degree: input.degree,
    // The 2026 table never states a duration.
    durationYears: null,
    bacStreams: input.bacStreams,
    // `orientationFields[].streams` is documented as an editorial mapping.
    streamsEditorial: true,
    officialFields: input.officialFields,
    keywords: input.keywords,
    curriculum: null,
    careers: null,
    universityIds: input.universityIds,
    sourceIds: [sourceId],
    sourceUrl: source.url,
    academicYear: ACADEMIC_YEAR,
    verification: input.verification,
    lastVerifiedAt: verified ? CHECKED_ON : null,
    notes: input.notes,
  };
}

const IDENTITY_FIELDS: OfficialField[] = ["name", "field", "institution"];

export const majors: Major[] = [
  major({
    id: "medecine",
    slug: "medecine",
    name: { ar: "الطب", fr: "Médecine", en: "Medicine" },
    summary: {
      ar: "تكوين طبي في قطاع الصحة، يُفتح عبر التوظيف الوطني بعد البكالوريا.",
      fr: "Formation médicale du secteur de la santé, ouverte par recrutement national après le bac.",
    },
    field: "health",
    degree: "medical",
    bacStreams: ["sciences-experimentales", "mathematiques"],
    keywords: ["طب", "médecine", "medecine", "medicine", "médecin", "medecin", "doctor", "طبيب"],
    universityIds: ["recrutement-national"],
    verification: "verified",
    notes: OFFICIAL_ROW_NOTE,
    officialFields: IDENTITY_FIELDS,
  }),
  major({
    id: "pharmacie",
    slug: "pharmacie",
    name: { ar: "الصيدلة", fr: "Pharmacie", en: "Pharmacy" },
    summary: {
      ar: "تكوين في الصيدلة ضمن قطاع الصحة، عبر التوظيف الوطني.",
      fr: "Formation en pharmacie, secteur de la santé, par recrutement national.",
    },
    field: "health",
    degree: "medical",
    bacStreams: ["sciences-experimentales", "mathematiques"],
    keywords: ["صيدلة", "pharmacie", "pharmacy", "pharmacien", "صيدلي"],
    universityIds: ["recrutement-national"],
    verification: "verified",
    notes: OFFICIAL_ROW_NOTE,
    officialFields: IDENTITY_FIELDS,
  }),
  major({
    id: "medecine-dentaire",
    slug: "medecine-dentaire",
    name: { ar: "طب الأسنان", fr: "Médecine dentaire", en: "Dentistry" },
    summary: {
      ar: "تكوين في طب الأسنان ضمن قطاع الصحة، عبر التوظيف الوطني.",
      fr: "Formation en médecine dentaire, secteur de la santé, par recrutement national.",
    },
    field: "health",
    degree: "medical",
    bacStreams: ["sciences-experimentales", "mathematiques"],
    keywords: ["طب أسنان", "طب الأسنان", "médecine dentaire", "medecine dentaire", "dentaire", "dentistry", "dentist"],
    universityIds: ["recrutement-national"],
    verification: "verified",
    notes: OFFICIAL_ROW_NOTE,
    officialFields: IDENTITY_FIELDS,
  }),
  major({
    id: "informatique",
    slug: "informatique",
    name: { ar: "الإعلام الآلي", fr: "Informatique", en: "Computer science" },
    summary: {
      ar: "تكوين في الإعلام الآلي والبرمجة والأنظمة المعلوماتية.",
      fr: "Formation en informatique : programmation et systèmes d’information.",
    },
    field: "it",
    degree: "unknown",
    bacStreams: ["mathematiques", "sciences-experimentales", "technique-mathematique"],
    keywords: [
      "إعلام آلي",
      "الإعلام الآلي",
      "informatique",
      "computer science",
      "computing",
      "برمجة",
      "programmation",
      "programming",
      "software",
    ],
    // Two 2026 rows: Université Alger 1 and Université Oran 1.
    universityIds: ["univ-alger-1", "univ-oran-1"],
    verification: "verified",
    notes: OFFICIAL_ROW_NOTE,
    officialFields: IDENTITY_FIELDS,
  }),
  major({
    id: "architecture",
    slug: "architecture",
    name: { ar: "العمارة", fr: "Architecture", en: "Architecture" },
    summary: {
      ar: "تكوين في العمارة وتصميم البناء والتهيئة العمرانية.",
      fr: "Formation en architecture : conception du bâti et aménagement.",
    },
    field: "engineering",
    degree: "unknown",
    bacStreams: ["mathematiques", "technique-mathematique", "sciences-experimentales"],
    keywords: ["عمارة", "architecture", "architecte", "مهندس معماري"],
    universityIds: ["univ-alger-1"],
    verification: "verified",
    notes: OFFICIAL_ROW_NOTE,
    officialFields: IDENTITY_FIELDS,
  }),
  major({
    id: "informatique-intelligence-artificielle",
    slug: "intelligence-artificielle",
    name: {
      ar: "الإعلام الآلي (الذكاء الاصطناعي)",
      fr: "Informatique (intelligence artificielle)",
      en: "Computer science (AI)",
    },
    summary: {
      ar: "تكوين في الإعلام الآلي مع تخصص في الذكاء الاصطناعي.",
      fr: "Formation en informatique avec spécialisation en intelligence artificielle.",
    },
    field: "it",
    degree: "unknown",
    bacStreams: ["mathematiques", "sciences-experimentales", "technique-mathematique"],
    keywords: [
      "ذكاء اصطناعي",
      "الذكاء الاصطناعي",
      "intelligence artificielle",
      "artificial intelligence",
      "ai",
      "machine learning",
      "تعلم الآلة",
    ],
    universityIds: ["univ-setif-1"],
    verification: "pending",
    notes: SPECIALISATION_NOTE,
    officialFields: IDENTITY_FIELDS,
  }),
  major({
    id: "sciences-economiques-gestion-commerciales",
    slug: "sciences-economiques-gestion-commerciales",
    name: {
      ar: "العلوم الاقتصادية والتسيير والتجارية",
      fr: "Sciences économiques, de gestion et commerciales",
      en: "Economics, management and commerce",
    },
    summary: {
      ar: "تكوين في العلوم الاقتصادية والتسيير والتجارة.",
      fr: "Formation en sciences économiques, gestion et commerce.",
    },
    field: "economics",
    degree: "unknown",
    bacStreams: ["gestion-economie", "mathematiques", "sciences-experimentales", "lettres-philosophie"],
    keywords: [
      "اقتصاد",
      "علوم اقتصادية",
      "تسيير",
      "تجارة",
      "économie",
      "economie",
      "gestion",
      "commerce",
      "management",
      "economics",
      "business",
    ],
    universityIds: ["univ-setif-1"],
    verification: "pending",
    notes: GROUPED_NOTE,
    officialFields: IDENTITY_FIELDS,
  }),
  major({
    id: "sciences-de-la-nature-et-de-la-vie",
    slug: "sciences-de-la-nature-et-de-la-vie",
    name: {
      ar: "علوم الطبيعة والحياة",
      fr: "Sciences de la nature et de la vie",
      en: "Natural and life sciences",
    },
    summary: {
      ar: "تكوين في علوم الطبيعة والحياة، قريب من البيولوجيا.",
      fr: "Formation en sciences de la nature et de la vie, proche de la biologie.",
    },
    field: "science",
    degree: "unknown",
    bacStreams: ["sciences-experimentales", "mathematiques"],
    keywords: [
      "علوم الطبيعة والحياة",
      "بيولوجيا",
      "biologie",
      "biology",
      "sciences de la nature et de la vie",
      "snv",
    ],
    universityIds: ["univ-constantine-1"],
    verification: "verified",
    notes: OFFICIAL_ROW_NOTE,
    officialFields: IDENTITY_FIELDS,
  }),
  major({
    id: "langue-anglaise",
    slug: "langue-anglaise",
    name: { ar: "اللغة الإنجليزية", fr: "Langue anglaise", en: "English language" },
    summary: {
      ar: "تكوين في اللغة الإنجليزية.",
      fr: "Formation en langue anglaise.",
    },
    field: "languages",
    degree: "unknown",
    bacStreams: ["langues-etrangeres", "lettres-philosophie"],
    keywords: ["اللغة الإنجليزية", "لغة إنجليزية", "langue anglaise", "anglais", "english", "english language"],
    universityIds: ["univ-tlemcen"],
    verification: "verified",
    notes: OFFICIAL_ROW_NOTE,
    officialFields: IDENTITY_FIELDS,
  }),
  major({
    id: "droit",
    slug: "droit",
    name: { ar: "الحقوق", fr: "Droit", en: "Law" },
    summary: {
      ar: "تكوين في الحقوق والقانون.",
      fr: "Formation en droit.",
    },
    field: "law",
    degree: "unknown",
    bacStreams: ["lettres-philosophie", "gestion-economie", "langues-etrangeres"],
    keywords: ["حقوق", "droit", "law", "قانون", "legal"],
    universityIds: ["univ-tlemcen"],
    verification: "verified",
    notes: OFFICIAL_ROW_NOTE,
    officialFields: IDENTITY_FIELDS,
  }),
  major({
    id: "genie-des-procedes",
    slug: "genie-des-procedes",
    name: { ar: "هندسة الطرائق", fr: "Génie des procédés", en: "Process engineering" },
    summary: {
      ar: "تكوين في هندسة الطرائق والتحويلات الصناعية.",
      fr: "Formation en génie des procédés et transformations industrielles.",
    },
    field: "engineering",
    degree: "unknown",
    bacStreams: ["technique-mathematique", "sciences-experimentales", "mathematiques"],
    keywords: ["هندسة الطرائق", "génie des procédés", "genie des procedes", "process engineering", "génie chimique"],
    universityIds: ["univ-chlef"],
    verification: "verified",
    notes: OFFICIAL_ROW_NOTE,
    officialFields: IDENTITY_FIELDS,
  }),
  major({
    id: "management-electronique-des-affaires",
    slug: "management-electronique-des-affaires",
    name: {
      ar: "التسيير الإلكتروني للأعمال",
      fr: "Management électronique des affaires",
      en: "Electronic business management",
    },
    summary: {
      ar: "تكوين في التسيير الإلكتروني للأعمال.",
      fr: "Formation en management électronique des affaires.",
    },
    field: "economics",
    degree: "unknown",
    bacStreams: ["gestion-economie", "mathematiques"],
    keywords: [
      "تسيير إلكتروني",
      "التسيير الإلكتروني للأعمال",
      "management électronique des affaires",
      "e-business",
      "business management",
    ],
    universityIds: ["cu-aflou"],
    verification: "verified",
    notes: OFFICIAL_ROW_NOTE,
    officialFields: IDENTITY_FIELDS,
  }),
];

export const majorBySlug: Record<string, Major> = Object.fromEntries(
  majors.map((entry) => [entry.slug, entry]),
);

/* -------------------------------------------------------------------------- */
/* Thresholds                                                                 */
/* -------------------------------------------------------------------------- */

/** Row id → major id. A 2026 row without a mapping throws below. */
const ROW_TO_MAJOR: Readonly<Record<string, string>> = {
  "medecine-2026": "medecine",
  "pharmacie-2026": "pharmacie",
  "medecine-dentaire-2026": "medecine-dentaire",
  "informatique-alger1-2026": "informatique",
  "informatique-oran1-2026": "informatique",
  "architecture-alger1-2026": "architecture",
  "ia-setif1-2026": "informatique-intelligence-artificielle",
  "sciences-eco-setif1-2026": "sciences-economiques-gestion-commerciales",
  "snv-constantine1-2026": "sciences-de-la-nature-et-de-la-vie",
  "anglais-tlemcen-2026": "langue-anglaise",
  "droit-tlemcen-2026": "droit",
  "genie-procedes-chlef-2026": "genie-des-procedes",
  "management-aflou-2026": "management-electronique-des-affaires",
};

/** Published institution string → university id. Verbatim strings. */
const INSTITUTION_TO_UNIVERSITY: Readonly<Record<string, string>> = {
  "Recrutement national": "recrutement-national",
  "Université Alger 1": "univ-alger-1",
  "Université Sétif 1": "univ-setif-1",
  "Université Constantine 1": "univ-constantine-1",
  "Université Oran 1": "univ-oran-1",
  "Université Tlemcen": "univ-tlemcen",
  "Université Chlef": "univ-chlef",
  "Centre universitaire Aflou": "cu-aflou",
};

/**
 * Institution labels as printed by the ministry table, keyed by university id.
 * Used wherever the published cell is shown verbatim — including
 * `recrutement-national`, which is a national pool rather than a campus and is
 * therefore not published as a university page.
 */
export const institutionLabelById: Record<string, string> = Object.fromEntries(
  Object.entries(INSTITUTION_TO_UNIVERSITY).map(([label, id]) => [id, label]),
);

const THRESHOLD_GROUPS = ["min1", "min2", "min3"] as const;

function buildThresholds(): ThresholdRecord[] {
  const records: ThresholdRecord[] = [];
  for (const row of orientationFields) {
    // Two 2025 rows exist in the source; this seed stays on one campaign year.
    if (row.year !== ACADEMIC_YEAR) continue;

    const majorId = ROW_TO_MAJOR[row.id];
    if (!majorId) {
      throw new Error(`content/majors: no major mapping for 2026 orientation row "${row.id}".`);
    }
    const entry = majors.find((candidate) => candidate.id === majorId);
    if (!entry) {
      throw new Error(`content/majors: major "${majorId}" does not exist (row "${row.id}").`);
    }
    const universityId = INSTITUTION_TO_UNIVERSITY[row.institution];
    if (!universityId) {
      throw new Error(`content/majors: no university mapping for institution "${row.institution}".`);
    }
    const source = resolveSource(row.sourceId);
    // A threshold inherits the parent record's status: a row attached to a
    // "pending" program is not promoted just because its number is published.
    const verified = entry.verification === "verified";

    for (const group of THRESHOLD_GROUPS) {
      const value = row.values[group];
      if (value === null) continue;
      for (const stream of row.streams) {
        records.push({
          id: `th-${ACADEMIC_YEAR}-${majorId}-${universityId}-${stream}-${group}`,
          majorId,
          universityId,
          bacStream: stream,
          academicYear: ACADEMIC_YEAR,
          value,
          group,
          // The ministry group labels are not reproduced in this repository.
          category: null,
          sourceId: source.id,
          sourceUrl: source.url,
          streamPairing: "editorial",
          verification: verified ? "verified" : "pending",
          lastVerifiedAt: verified ? CHECKED_ON : null,
        });
      }
    }
  }
  return records;
}

export const thresholds: ThresholdRecord[] = buildThresholds();

/** Every 2026 row that was deliberately *not* turned into a published fiche. */
export const withheldRows = majors
  .filter((entry) => entry.verification !== "verified")
  .map((entry) => ({
    slug: entry.slug,
    name: entry.name,
    reason: entry.notes,
  }));
