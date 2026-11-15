import type { Localized } from "./bac";
import type { SourceRef } from "./types";

/**
 * Orientation data.
 *
 * IMPORTANT: the numbers below are *published historical minimum averages*
 * (moyennes minimales) from the official MESRS table for 2026, after phase 1.
 * They are NOT a threshold for 2027 and they do not guarantee admission.
 * Column meanings (Min1/Min2/Min3) follow the ministry table's candidate
 * groups; we do not reinterpret them.
 */

export type ThresholdValue = { min1: number | null; min2: number | null; min3: number | null };

export type OrientationField = {
  id: string;
  institution: string;
  field: Localized;
  domain: "health" | "engineering" | "science" | "it" | "economics" | "law" | "languages" | "humanities";
  year: 2025 | 2026;
  values: ThresholdValue;
  /** Editorial mapping used only for indicative filtering. */
  streams: string[];
  sourceId: string;
};

export const orientationSources: SourceRef[] = [
  {
    label: "MESRS — Moyennes minimales BAC 2026 (après phase 1), PDF 350 p.",
    url: "https://www.esi.dz/wp-content/uploads/2026/07/BAC-2026-Fichier-des-moyennes-minimales-apres-phase-1.pdf",
    kind: "official",
    checkedOn: "2026-11-15",
    note: "Tableau officiel, généré le 29 juillet 2026.",
  },
  {
    label: "MESRS — Circulaire ministérielle n°01 du 7 juillet 2026 (orientation des nouveaux bacheliers)",
    url: "https://www.mesrs.dz/2026/07/signe-electroniquement-la-circulaire-ministerielle-relative-a-lorientation-des-nouveaux-bacheliers-session-2026-ar/",
    kind: "official",
    checkedOn: "2026-11-15",
  },
  {
    label: "MESRS — Avis de préinscription 2026 (plateforme orientation-esi.dz)",
    url: "https://www.mesrs.dz/2026/07/avis-ض-lensemble-des-titulaires-du-baccalaureat-session-2026/",
    kind: "official",
    checkedOn: "2026-11-15",
    note: "La plateforme n’est ouverte que pendant la campagne d’orientation.",
  },
  {
    label: "CU Aflou — BAC 2025 moyennes minimales (republication du tableau ministériel)",
    url: "https://www.cu-aflou.edu.dz/DocPdf/bac/BAC2025MoyennesMinimales.pdf",
    kind: "official",
    checkedOn: "2026-11-15",
  },
];

export const orientationFields: OrientationField[] = [
  {
    id: "medecine-2026",
    institution: "Recrutement national",
    field: { ar: "الطب", fr: "Médecine", en: "Medicine" },
    domain: "health",
    year: 2026,
    values: { min1: 16.33, min2: 16.82, min3: null },
    streams: ["sciences-experimentales", "mathematiques"],
    sourceId: "mesrs-2026",
  },
  {
    id: "pharmacie-2026",
    institution: "Recrutement national",
    field: { ar: "الصيدلة", fr: "Pharmacie", en: "Pharmacy" },
    domain: "health",
    year: 2026,
    values: { min1: 16.03, min2: 16.52, min3: null },
    streams: ["sciences-experimentales", "mathematiques"],
    sourceId: "mesrs-2026",
  },
  {
    id: "medecine-dentaire-2026",
    institution: "Recrutement national",
    field: { ar: "طب الأسنان", fr: "Médecine dentaire", en: "Dentistry" },
    domain: "health",
    year: 2026,
    values: { min1: 16.81, min2: 17.31, min3: null },
    streams: ["sciences-experimentales", "mathematiques"],
    sourceId: "mesrs-2026",
  },
  {
    id: "informatique-alger1-2026",
    institution: "Université Alger 1",
    field: { ar: "الإعلام الآلي", fr: "Informatique", en: "Computer science" },
    domain: "it",
    year: 2026,
    values: { min1: 14.29, min2: 14.99, min3: null },
    streams: ["mathematiques", "sciences-experimentales", "technique-mathematique"],
    sourceId: "mesrs-2026",
  },
  {
    id: "architecture-alger1-2026",
    institution: "Université Alger 1",
    field: { ar: "العمارة", fr: "Architecture", en: "Architecture" },
    domain: "engineering",
    year: 2026,
    values: { min1: 14.69, min2: null, min3: null },
    streams: ["mathematiques", "technique-mathematique", "sciences-experimentales"],
    sourceId: "mesrs-2026",
  },
  {
    id: "ia-setif1-2026",
    institution: "Université Sétif 1",
    field: { ar: "الإعلام الآلي (الذكاء الاصطناعي)", fr: "Informatique (intelligence artificielle)", en: "Computer science (AI)" },
    domain: "it",
    year: 2026,
    values: { min1: 15.66, min2: 16.44, min3: null },
    streams: ["mathematiques", "sciences-experimentales", "technique-mathematique"],
    sourceId: "mesrs-2026",
  },
  {
    id: "sciences-eco-setif1-2026",
    institution: "Université Sétif 1",
    field: { ar: "العلوم الاقتصادية والتسيير والتجارية", fr: "Sciences économiques, de gestion et commerciales", en: "Economics, management and commerce" },
    domain: "economics",
    year: 2026,
    values: { min1: 10.0, min2: 11.56, min3: null },
    streams: ["gestion-economie", "mathematiques", "sciences-experimentales", "lettres-philosophie"],
    sourceId: "mesrs-2026",
  },
  {
    id: "snv-constantine1-2026",
    institution: "Université Constantine 1",
    field: { ar: "علوم الطبيعة والحياة", fr: "Sciences de la nature et de la vie", en: "Natural and life sciences" },
    domain: "science",
    year: 2026,
    values: { min1: 11.92, min2: 12.77, min3: null },
    streams: ["sciences-experimentales", "mathematiques"],
    sourceId: "mesrs-2026",
  },
  {
    id: "informatique-oran1-2026",
    institution: "Université Oran 1",
    field: { ar: "الإعلام الآلي", fr: "Informatique", en: "Computer science" },
    domain: "it",
    year: 2026,
    values: { min1: 11.14, min2: 11.65, min3: null },
    streams: ["mathematiques", "sciences-experimentales", "technique-mathematique"],
    sourceId: "mesrs-2026",
  },
  {
    id: "anglais-tlemcen-2026",
    institution: "Université Tlemcen",
    field: { ar: "اللغة الإنجليزية", fr: "Langue anglaise", en: "English language" },
    domain: "languages",
    year: 2026,
    values: { min1: 12.58, min2: 13.51, min3: 14.34 },
    streams: ["langues-etrangeres", "lettres-philosophie"],
    sourceId: "mesrs-2026",
  },
  {
    id: "droit-tlemcen-2026",
    institution: "Université Tlemcen",
    field: { ar: "الحقوق", fr: "Droit", en: "Law" },
    domain: "law",
    year: 2026,
    values: { min1: 10.03, min2: 11.43, min3: 12.64 },
    streams: ["lettres-philosophie", "gestion-economie", "langues-etrangeres"],
    sourceId: "mesrs-2026",
  },
  {
    id: "genie-procedes-chlef-2026",
    institution: "Université Chlef",
    field: { ar: "هندسة الطرائق", fr: "Génie des procédés", en: "Process engineering" },
    domain: "engineering",
    year: 2026,
    values: { min1: 10.25, min2: null, min3: null },
    streams: ["technique-mathematique", "sciences-experimentales", "mathematiques"],
    sourceId: "mesrs-2026",
  },
  {
    id: "management-aflou-2026",
    institution: "Centre universitaire Aflou",
    field: { ar: "التسيير الإلكتروني للأعمال", fr: "Management électronique des affaires", en: "Electronic business management" },
    domain: "economics",
    year: 2026,
    values: { min1: 11.3, min2: null, min3: null },
    streams: ["gestion-economie", "mathematiques"],
    sourceId: "mesrs-2026",
  },
  {
    id: "medecine-2025",
    institution: "Recrutement national",
    field: { ar: "الطب", fr: "Médecine", en: "Medicine" },
    domain: "health",
    year: 2025,
    values: { min1: 16.65, min2: 17.15, min3: null },
    streams: ["sciences-experimentales", "mathematiques"],
    sourceId: "aflou-2025",
  },
  {
    id: "pharmacie-2025",
    institution: "Recrutement national",
    field: { ar: "الصيدلة", fr: "Pharmacie", en: "Pharmacy" },
    domain: "health",
    year: 2025,
    values: { min1: 16.26, min2: 16.76, min3: null },
    streams: ["sciences-experimentales", "mathematiques"],
    sourceId: "aflou-2025",
  },
];

export const domainLabels: Record<OrientationField["domain"], Localized> = {
  health: { ar: "الصحة", fr: "Santé", en: "Health" },
  engineering: { ar: "الهندسة والعمارة", fr: "Ingénierie et architecture", en: "Engineering and architecture" },
  science: { ar: "العلوم", fr: "Sciences", en: "Sciences" },
  it: { ar: "الإعلام الآلي", fr: "Informatique", en: "Computing" },
  economics: { ar: "الاقتصاد والتسيير", fr: "Économie et gestion", en: "Economics and management" },
  law: { ar: "الحقوق", fr: "Droit", en: "Law" },
  languages: { ar: "اللغات", fr: "Langues", en: "Languages" },
  humanities: { ar: "العلوم الإنسانية", fr: "Sciences humaines", en: "Humanities" },
};

/** Verified facts about the 2026 orientation campaign, used in the explainer. */
export const orientationFacts = {
  campaignYear: 2026,
  preRegistration: {
    from: "2026-07-15",
    to: "2026-07-19",
    portal: "orientation-esi.dz",
  },
  wishes: { min: 6, max: 12, note: { ar: "بطاقة رغبات واحدة", fr: "Une seule fiche de vœux", en: "A single wish card" } as Localized },
  phases: 2,
  weightedAverage: {
    ar: "المعدل الموزون = معدل البكالوريا + نقطة المادة الأساسية بمعامل",
    fr: "Moyenne pondérée = moyenne du bac + note de la matière fondamentale affectée d’un coefficient",
    en: "Weighted average = bac average + core-subject mark multiplied by a coefficient",
  } as Localized,
  portalNote: {
    ar: "منصة orientation-esi.dz لا تعمل إلا خلال فترة التسجيل المسبق، ثم تُستكمل التسجيلات النهائية على progres.mesrs.dz.",
    fr: "La plateforme orientation-esi.dz n’est active que pendant la préinscription ; l’inscription finale se fait sur progres.mesrs.dz.",
    en: "orientation-esi.dz is only active during pre-registration; final registration happens on progres.mesrs.dz.",
  } as Localized,
  livePortals: [
    { label: "MESRS", url: "https://www.mesrs.dz/", checkedOn: "2026-11-15" },
    { label: "Progres", url: "https://progres.mesrs.dz/", checkedOn: "2026-11-15" },
    { label: "RAG MESRS", url: "https://rag.mesrs.dz/", checkedOn: "2026-11-15" },
  ],
};
