/**
 * BAC DZ — curriculum data
 *
 * Everything in this file is factual data used by the calculators and the
 * stream pages. Each coefficient set carries its provenance, the date it was
 * last verified, and the sources used. Read `coefficientStatus` before editing:
 * a reform was published in July 2026 and repealed in September 2026, which is
 * why the pre-reform table is the one in force for the 2027 session.
 */
import type { Locale } from "@/lib/i18n";
import type { SourceRef } from "./types";

export type Localized = Record<Locale, string>;

export type SubjectId =
  | "arabic"
  | "philosophy"
  | "french"
  | "english"
  | "third-language"
  | "mathematics"
  | "physics"
  | "natural-sciences"
  | "history-geography"
  | "islamic-studies"
  | "physical-education"
  | "technology"
  | "accounting"
  | "economics"
  | "law";

export type Subject = {
  id: SubjectId;
  slug: string;
  name: Localized;
  family: "languages" | "sciences" | "humanities" | "economics" | "technology" | "sport";
  /** Editorial one-liner used on subject chips. */
  note: Localized;
};

export const subjects: Subject[] = [
  {
    id: "arabic",
    slug: "arabic",
    name: { ar: "اللغة العربية وآدابها", fr: "Langue arabe et littérature", en: "Arabic language and literature" },
    family: "languages",
    note: {
      ar: "مادة أساسية في الشعب الأدبية وموجودة في كل الشعب.",
      fr: "Matière centrale des filières littéraires, présente dans toutes les filières.",
      en: "Core subject in literary streams and present in every stream.",
    },
  },
  {
    id: "philosophy",
    slug: "philosophy",
    name: { ar: "الفلسفة", fr: "Philosophie", en: "Philosophy" },
    family: "humanities",
    note: {
      ar: "تُقيّم على المقالة الفلسفية والتحليل المنهجي، لا على الحفظ فقط.",
      fr: "Évaluée sur la dissertation et l’analyse méthodique, pas sur la seule mémorisation.",
      en: "Assessed through essay writing and structured analysis, not memorisation alone.",
    },
  },
  {
    id: "french",
    slug: "french",
    name: { ar: "اللغة الفرنسية", fr: "Français", en: "French" },
    family: "languages",
    note: {
      ar: "نص + أسئلة الفهم + الإنتاج الكتابي.",
      fr: "Texte, questions de compréhension et production écrite.",
      en: "Text, comprehension questions and written production.",
    },
  },
  {
    id: "english",
    slug: "english",
    name: { ar: "اللغة الإنجليزية", fr: "Anglais", en: "English" },
    family: "languages",
    note: {
      ar: "نص + أسئلة + إنتاج كتابي قصير.",
      fr: "Texte, questions et production écrite courte.",
      en: "Text, questions and a short written production.",
    },
  },
  {
    id: "third-language",
    slug: "third-language",
    name: { ar: "اللغة الأجنبية الثالثة", fr: "Langue étrangère III", en: "Third foreign language" },
    family: "languages",
    note: {
      ar: "الألمانية أو الإسبانية أو الإيطالية، حسب المؤسسة.",
      fr: "Allemand, espagnol ou italien, selon l’établissement.",
      en: "German, Spanish or Italian, depending on the school.",
    },
  },
  {
    id: "mathematics",
    slug: "mathematics",
    name: { ar: "الرياضيات", fr: "Mathématiques", en: "Mathematics" },
    family: "sciences",
    note: {
      ar: "الدوال، المتتاليات، الاحتمالات، الأعداد المركبة، الهندسة.",
      fr: "Fonctions, suites, probabilités, nombres complexes, géométrie.",
      en: "Functions, sequences, probability, complex numbers, geometry.",
    },
  },
  {
    id: "physics",
    slug: "physics",
    name: { ar: "العلوم الفيزيائية", fr: "Sciences physiques", en: "Physics" },
    family: "sciences",
    note: {
      ar: "الميكانيك، الكهرباء، الكيمياء، والتمارين التجريبية.",
      fr: "Mécanique, électricité, chimie et exercices expérimentaux.",
      en: "Mechanics, electricity, chemistry and experimental tasks.",
    },
  },
  {
    id: "natural-sciences",
    slug: "natural-sciences",
    name: { ar: "علوم الطبيعة والحياة", fr: "Sciences de la nature et de la vie", en: "Natural and life sciences" },
    family: "sciences",
    note: {
      ar: "التركيب الحيوي، الوراثة، المناعة، والتركيب الضوئي.",
      fr: "Synthèse des protéines, génétique, immunologie, photosynthèse.",
      en: "Protein synthesis, genetics, immunology, photosynthesis.",
    },
  },
  {
    id: "history-geography",
    slug: "history-geography",
    name: { ar: "التاريخ والجغرافيا", fr: "Histoire-Géographie", en: "History and geography" },
    family: "humanities",
    note: {
      ar: "تحليل وثائق ومقالات تاريخية، ودراسات جغرافية.",
      fr: "Analyse de documents, dissertations historiques et études géographiques.",
      en: "Document analysis, history essays and geography studies.",
    },
  },
  {
    id: "islamic-studies",
    slug: "islamic-studies",
    name: { ar: "العلوم الإسلامية", fr: "Sciences islamiques", en: "Islamic studies" },
    family: "humanities",
    note: {
      ar: "القرآن والحديث والعقيدة والفقه والسيرة.",
      fr: "Coran, hadith, croyance, fiqh et biographie prophétique.",
      en: "Qur’an, hadith, creed, fiqh and prophetic biography.",
    },
  },
  {
    id: "physical-education",
    slug: "physical-education",
    name: { ar: "التربية البدنية والرياضية", fr: "Éducation physique et sportive", en: "Physical education" },
    family: "sport",
    note: {
      ar: "تُقيّم في المؤسسة، وتُحتسب بمعامل 1 في المعدل النهائي.",
      fr: "Évaluée en établissement, comptée avec un coefficient 1.",
      en: "Assessed at school with a coefficient of 1.",
    },
  },
  {
    id: "technology",
    slug: "technology",
    name: { ar: "التكنولوجيا (تخصص)", fr: "Technologie (spécialité)", en: "Technology (specialty)" },
    family: "technology",
    note: {
      ar: "هندسة مدنية، كهربائية، ميكانيكية أو هندسة الطرائق حسب التخصص.",
      fr: "Génie civil, électrique, mécanique ou procédés selon la spécialité.",
      en: "Civil, electrical, mechanical or process engineering depending on the specialty.",
    },
  },
  {
    id: "accounting",
    slug: "accounting",
    name: { ar: "التسيير المحاسبي والمالي", fr: "Gestion comptable et financière", en: "Accounting and financial management" },
    family: "economics",
    note: {
      ar: "القيود المحاسبية، الميزانية، تحليل التكاليف والنتائج.",
      fr: "Écritures comptables, bilan, analyse des coûts et résultats.",
      en: "Accounting entries, balance sheet, cost and result analysis.",
    },
  },
  {
    id: "economics",
    slug: "economics",
    name: { ar: "الاقتصاد والمناجمنت", fr: "Économie et management", en: "Economics and management" },
    family: "economics",
    note: {
      ar: "المؤسسة، التسويق، التمويل، والسياسات الاقتصادية.",
      fr: "Entreprise, marketing, financement et politiques économiques.",
      en: "Firm, marketing, finance and economic policy.",
    },
  },
  {
    id: "law",
    slug: "law",
    name: { ar: "القانون", fr: "Droit", en: "Law" },
    family: "economics",
    note: {
      ar: "القانون المدني، التجاري، وقانون العمل.",
      fr: "Droit civil, commercial et du travail.",
      en: "Civil, commercial and labour law.",
    },
  },
];

export const subjectById = Object.fromEntries(subjects.map((s) => [s.id, s])) as Record<SubjectId, Subject>;

export type StreamId =
  | "sciences-experimentales"
  | "mathematiques"
  | "technique-mathematique"
  | "gestion-economie"
  | "lettres-philosophie"
  | "langues-etrangeres";

export type CoefficientEntry = {
  subject: SubjectId;
  coefficient: number;
  /** Optional in the official timetable (e.g. Amazigh, third language). */
  optional?: boolean;
  /** Shown instead of the generic subject name when a stream splits a subject. */
  variant?: Localized;
};

export type Stream = {
  id: StreamId;
  slug: StreamId;
  name: Localized;
  shortName: Localized;
  /** 1–2 sentence positioning statement, editorial. */
  summary: Localized;
  /** Who the stream tends to suit — editorial guidance, clearly non-official. */
  fits: Localized;
  coefficients: CoefficientEntry[];
  specialties?: { id: string; name: Localized }[];
  topFields: Localized;
};

export const streams: Stream[] = [
  {
    id: "sciences-experimentales",
    slug: "sciences-experimentales",
    name: { ar: "علوم تجريبية", fr: "Sciences expérimentales", en: "Experimental sciences" },
    shortName: { ar: "علوم", fr: "Sciences exp.", en: "Sciences" },
    summary: {
      ar: "الشعبة الأوسع في البكالوريا الجزائرية، تجمع بين علوم الطبيعة والحياة والرياضيات والفيزياء، وتفتح أبواب القطاع الصحي والعلوم البيولوجية.",
      fr: "La filière la plus fréquentée du bac algérien : sciences de la nature, mathématiques et physique, avec un accès large au secteur de la santé et aux sciences du vivant.",
      en: "The largest Algerian bac stream, combining life sciences, mathematics and physics, opening the health sector and life sciences.",
    },
    fits: {
      ar: "تناسب من لديه قدرة على الحفظ المنظّم إلى جانب التفكير التجريبي، ويستهدف الطب أو الصيدلة أو علوم الطبيعة.",
      fr: "Pour ceux qui allient mémorisation structurée et raisonnement expérimental, et visent médecine, pharmacie ou sciences naturelles.",
      en: "Suits students combining structured memorisation with experimental reasoning, aiming at medicine, pharmacy or natural sciences.",
    },
    coefficients: [
      { subject: "natural-sciences", coefficient: 6 },
      { subject: "mathematics", coefficient: 5 },
      { subject: "physics", coefficient: 5 },
      { subject: "arabic", coefficient: 3 },
      { subject: "philosophy", coefficient: 2 },
      { subject: "french", coefficient: 2 },
      { subject: "english", coefficient: 2 },
      { subject: "history-geography", coefficient: 2 },
      { subject: "islamic-studies", coefficient: 2 },
      { subject: "physical-education", coefficient: 1 },
    ],
    topFields: {
      ar: "الطب، الصيدلة، طب الأسنان، علوم الصحة، البيولوجيا، العلوم الزراعية والبيطرية.",
      fr: "Médecine, pharmacie, médecine dentaire, sciences de la santé, biologie, agronomie et vétérinaire.",
      en: "Medicine, pharmacy, dentistry, health sciences, biology, agronomy and veterinary science.",
    },
  },
  {
    id: "mathematiques",
    slug: "mathematiques",
    name: { ar: "رياضيات", fr: "Mathématiques", en: "Mathematics" },
    shortName: { ar: "رياضيات", fr: "Maths", en: "Maths" },
    summary: {
      ar: "شعبة ذات معامل 7 في الرياضيات و6 في الفيزياء، موجّهة لمن يريد بناء مسار قوي في الهندسة والعلوم الدقيقة والإعلام الآلي.",
      fr: "Filière à fort coefficient en mathématiques (7) et en physique (6), orientée vers l’ingénierie, les sciences exactes et l’informatique.",
      en: "A stream weighted towards mathematics (7) and physics (6), aimed at engineering, exact sciences and computer science.",
    },
    fits: {
      ar: "تناسب من يجد متعة حقيقية في البرهان الرياضي وحل المسائل الطويلة، لا من يختارها فقط «للهيبة».",
      fr: "Pour ceux qui prennent plaisir à la démonstration et aux problèmes longs, pas pour ceux qui la choisissent par prestige.",
      en: "For students who genuinely enjoy proofs and long problems, not those choosing it for prestige.",
    },
    coefficients: [
      { subject: "mathematics", coefficient: 7 },
      { subject: "physics", coefficient: 6 },
      { subject: "natural-sciences", coefficient: 2 },
      { subject: "arabic", coefficient: 3 },
      { subject: "philosophy", coefficient: 2 },
      { subject: "french", coefficient: 2 },
      { subject: "english", coefficient: 2 },
      { subject: "history-geography", coefficient: 2 },
      { subject: "islamic-studies", coefficient: 2 },
      { subject: "physical-education", coefficient: 1 },
    ],
    topFields: {
      ar: "المدارس العليا، الهندسة، الرياضيات التطبيقية، الإعلام الآلي، الإحصاء والعلوم الاقتصادية الكمية.",
      fr: "Écoles supérieures, ingénierie, mathématiques appliquées, informatique, statistique et sciences économiques quantitatives.",
      en: "Grandes écoles, engineering, applied mathematics, computer science, statistics and quantitative economics.",
    },
  },
  {
    id: "technique-mathematique",
    slug: "technique-mathematique",
    name: { ar: "تقني رياضي", fr: "Technicien mathématique", en: "Mathematical technician" },
    shortName: { ar: "تقني رياضي", fr: "Technicien math.", en: "Tech. math" },
    summary: {
      ar: "شعبة هندسية تطبيقية بمعامل 7 في التكنولوجيا، تتفرع إلى أربع تخصصات تختلف في مادة التكنولوجيا فقط.",
      fr: "Filière d’ingénierie appliquée avec un coefficient 7 en technologie, divisée en quatre spécialités qui ne diffèrent que par cette matière.",
      en: "An applied engineering stream with technology at coefficient 7, split into four specialties differing only in that subject.",
    },
    fits: {
      ar: "تناسب من يميل إلى الرسم التقني والتصميم والحساب التطبيقي أكثر من التنظير المجرد.",
      fr: "Pour ceux qui préfèrent le dessin technique, la conception et le calcul appliqué à la théorie abstraite.",
      en: "For students drawn to technical drawing, design and applied calculation rather than pure theory.",
    },
    coefficients: [
      { subject: "technology", coefficient: 7 },
      { subject: "mathematics", coefficient: 6 },
      { subject: "physics", coefficient: 6 },
      { subject: "arabic", coefficient: 3 },
      { subject: "philosophy", coefficient: 2 },
      { subject: "french", coefficient: 2 },
      { subject: "english", coefficient: 2 },
      { subject: "history-geography", coefficient: 2 },
      { subject: "islamic-studies", coefficient: 2 },
      { subject: "physical-education", coefficient: 1 },
    ],
    specialties: [
      { id: "genie-civil", name: { ar: "هندسة مدنية", fr: "Génie civil", en: "Civil engineering" } },
      { id: "genie-electrique", name: { ar: "هندسة كهربائية", fr: "Génie électrique", en: "Electrical engineering" } },
      { id: "genie-mecanique", name: { ar: "هندسة ميكانيكية", fr: "Génie mécanique", en: "Mechanical engineering" } },
      { id: "genie-des-procedes", name: { ar: "هندسة الطرائق", fr: "Génie des procédés", en: "Process engineering" } },
    ],
    topFields: {
      ar: "الهندسة بفروعها، المدارس العليا التكنولوجية، المعمار، الطاقات المتجددة والصناعة.",
      fr: "Ingénierie, écoles supérieures technologiques, architecture, énergies renouvelables et industrie.",
      en: "Engineering, higher technological schools, architecture, renewable energy and industry.",
    },
  },
  {
    id: "gestion-economie",
    slug: "gestion-economie",
    name: { ar: "تسيير واقتصاد", fr: "Gestion et économie", en: "Management and economics" },
    shortName: { ar: "تسيير", fr: "Gestion", en: "Management" },
    summary: {
      ar: "شعبة تجمع المحاسبة والاقتصاد والقانون، بمعامل 6 للتسيير المحاسبي والمالي و5 للاقتصاد والمناجمنت.",
      fr: "Filière combinant comptabilité, économie et droit, avec un coefficient 6 en gestion comptable et 5 en économie-management.",
      en: "A stream combining accounting, economics and law, with accounting at coefficient 6 and economics at 5.",
    },
    fits: {
      ar: "تناسب من يهتم بالمؤسسة والأرقام والتحليل المالي، ويقبل العمل المنهجي على الوثائق المحاسبية.",
      fr: "Pour ceux que l’entreprise, les chiffres et l’analyse financière intéressent, prêts au travail méthodique sur documents comptables.",
      en: "For students interested in business, numbers and financial analysis, ready for methodical work on accounting documents.",
    },
    coefficients: [
      { subject: "accounting", coefficient: 6 },
      { subject: "economics", coefficient: 5 },
      { subject: "mathematics", coefficient: 5 },
      { subject: "history-geography", coefficient: 4 },
      { subject: "arabic", coefficient: 3 },
      { subject: "law", coefficient: 2 },
      { subject: "philosophy", coefficient: 2 },
      { subject: "french", coefficient: 2 },
      { subject: "english", coefficient: 2 },
      { subject: "islamic-studies", coefficient: 2 },
      { subject: "physical-education", coefficient: 1 },
    ],
    topFields: {
      ar: "العلوم الاقتصادية والتجارية والمالية، علوم التسيير، المحاسبة، والمدارس العليا للتجارة.",
      fr: "Sciences économiques, commerciales et financières, gestion, comptabilité et écoles supérieures de commerce.",
      en: "Economics, commerce and finance, management, accounting and higher business schools.",
    },
  },
  {
    id: "lettres-philosophie",
    slug: "lettres-philosophie",
    name: { ar: "آداب وفلسفة", fr: "Lettres et philosophie", en: "Literature and philosophy" },
    shortName: { ar: "آداب", fr: "Lettres", en: "Literature" },
    summary: {
      ar: "شعبة معاملاتها موزونة نحو اللغة العربية (6) والفلسفة (6)، وتعتمد على الكتابة والتحليل أكثر من الحساب.",
      fr: "Filière dominée par la langue arabe (6) et la philosophie (6), fondée sur l’écriture et l’analyse plus que sur le calcul.",
      en: "A stream weighted towards Arabic (6) and philosophy (6), built on writing and analysis more than calculation.",
    },
    fits: {
      ar: "تناسب من يكتب بسهولة ويحب النقاش الفكري والتحليل التاريخي، ويستهدف العلوم الإنسانية والاجتماعية.",
      fr: "Pour ceux qui écrivent facilement et aiment le débat d’idées et l’analyse historique, visant les sciences humaines.",
      en: "For students who write easily and enjoy intellectual debate and historical analysis, targeting humanities.",
    },
    coefficients: [
      { subject: "arabic", coefficient: 6 },
      { subject: "philosophy", coefficient: 6 },
      { subject: "history-geography", coefficient: 4 },
      { subject: "french", coefficient: 3 },
      { subject: "english", coefficient: 3 },
      { subject: "mathematics", coefficient: 2 },
      { subject: "islamic-studies", coefficient: 2 },
      { subject: "physical-education", coefficient: 1 },
    ],
    topFields: {
      ar: "العلوم الإنسانية والاجتماعية، الحقوق، الإعلام والاتصال، العلوم السياسية، اللغات والأدب.",
      fr: "Sciences humaines et sociales, droit, information-communication, sciences politiques, langues et lettres.",
      en: "Humanities and social sciences, law, media and communication, political science, languages and literature.",
    },
  },
  {
    id: "langues-etrangeres",
    slug: "langues-etrangeres",
    name: { ar: "لغات أجنبية", fr: "Langues étrangères", en: "Foreign languages" },
    shortName: { ar: "لغات", fr: "Langues", en: "Languages" },
    summary: {
      ar: "شعبة ثلاث لغات أجنبية بمعامل 5 لكل من الفرنسية والإنجليزية واللغة الثالثة بمعامل 4، وتفتح مجال الترجمة والعلاقات الدولية.",
      fr: "Filière de trois langues étrangères : français et anglais à 5, troisième langue à 4, ouvrant vers la traduction et les relations internationales.",
      en: "Three foreign languages (French and English at 5, third language at 4), leading to translation and international relations.",
    },
    fits: {
      ar: "تناسب من يمتلك قاعدة لغوية متينة ويستمتع بالقراءة والتواصل بلغات مختلفة.",
      fr: "Pour ceux qui ont une base linguistique solide et aiment lire et communiquer dans plusieurs langues.",
      en: "For students with a strong language base who enjoy reading and communicating across languages.",
    },
    coefficients: [
      { subject: "french", coefficient: 5 },
      { subject: "english", coefficient: 5 },
      { subject: "third-language", coefficient: 4, optional: true },
      { subject: "arabic", coefficient: 5 },
      { subject: "mathematics", coefficient: 2 },
      { subject: "philosophy", coefficient: 2 },
      { subject: "history-geography", coefficient: 2 },
      { subject: "islamic-studies", coefficient: 2 },
      { subject: "physical-education", coefficient: 1 },
    ],
    topFields: {
      ar: "الترجمة، اللغات الأجنبية التطبيقية، العلاقات الدولية، السياحة والفندقة، والإعلام.",
      fr: "Traduction, langues étrangères appliquées, relations internationales, tourisme-hôtellerie et communication.",
      en: "Translation, applied foreign languages, international relations, tourism and hospitality, media.",
    },
  },
];

export const streamById = Object.fromEntries(streams.map((s) => [s.id, s])) as Record<StreamId, Stream>;

export function totalCoefficient(stream: Stream, opts: { includeOptional?: boolean } = {}): number {
  return stream.coefficients
    .filter((c) => (opts.includeOptional ?? true) || !c.optional)
    .reduce((sum, c) => sum + c.coefficient, 0);
}

export function subjectNameForStream(entry: CoefficientEntry, locale: Locale): string {
  return entry.variant?.[locale] ?? subjectById[entry.subject].name[locale];
}

/**
 * Provenance of the coefficient table.
 * A ministerial decision (n°20, 28 July 2026) changed coefficients and removed
 * subjects for 2026-2027; it was repealed by decision n°36 (9 September 2026),
 * which keeps the previous organisation in force. We therefore ship the table
 * in force, and document the repeal — rather than the repealed reform.
 */
export const coefficientStatus = {
  set: "bac-dz/coefficients/2027",
  effectiveSession: 2027,
  label: {
    ar: "المعاملات المعمول بها لدورة 2027",
    fr: "Coefficients en vigueur pour la session 2027",
    en: "Coefficients in force for the 2027 session",
  } as Localized,
  verifiedOn: "2026-11-15",
  reviewDueOn: "2027-03-01",
  confidence: "verified-secondary" as const,
  primarySource: {
    label: {
      ar: "قرار وزاري رقم 36 مؤرخ في 9 سبتمبر 2026 يلغي القرار رقم 20 (28 جويلية 2026) ويُبقي التنظيم السابق",
      fr: "Décision n°36 du 9 septembre 2026 abrogeant la décision n°20 du 28 juillet 2026 et maintenant l’organisation antérieure",
      en: "Ministerial decision no. 36 of 9 September 2026 repealing decision no. 20 of 28 July 2026 and keeping the previous organisation",
    } as Localized,
    url: "https://eddirasa.com/ministerial-decision-36-regulating-secondary-education/",
  },
  sources: [
    {
      kind: "secondary" as const,
      label: {
        ar: "نص وسياق القرار رقم 36 (موقع الدراسة الجزائري)",
        fr: "Texte et contexte de la décision n°36 (Eddirasa)",
        en: "Text and context of decision no. 36 (Eddirasa)",
      } as Localized,
      url: "https://eddirasa.com/ministerial-decision-36-regulating-secondary-education/",
      checkedOn: "2026-11-15",
    },
    {
      kind: "secondary" as const,
      label: {
        ar: "جديد القرار الوزاري المنظم للمعاملات (جويلية 2026) — للمقارنة",
        fr: "Nouvelle décision sur les coefficients (juillet 2026) — pour comparaison",
        en: "The July 2026 coefficients decision — for comparison",
      } as Localized,
      url: "https://eddirasa.com/new-ministerial-decision-regulating-secondary-education-2026-2027/",
      checkedOn: "2026-11-15",
    },
    {
      kind: "secondary" as const,
      label: {
        ar: "جدول المواقيت والمعاملات لجميع شعب السنة الثالثة ثانوي (PDF)",
        fr: "Tableau horaires et coefficients de toutes les filières de 3e AS (PDF)",
        en: "Hours and coefficients table for all 3rd-year streams (PDF)",
      } as Localized,
      url: "https://bac-algerie.net/coef.pdf",
      checkedOn: "2026-11-15",
    },
    {
      kind: "official" as const,
      label: {
        ar: "وزارة التربية الوطنية — المصدر الرسمي (لم يتوفر أثناء التحقق)",
        fr: "Ministère de l’Éducation nationale — source officielle (indisponible lors de la vérification)",
        en: "Ministry of National Education — official source (unavailable at verification time)",
      } as Localized,
      url: "https://www.education.gov.dz/",
      checkedOn: "2026-11-15",
    },
  ],
  notes: {
    ar: [
      "أُعلن في جويلية 2026 عن تعديل واسع للمعاملات وحذف مواد من بعض الشعب، ثم أُلغي بقرار رقم 36 المؤرخ في 9 سبتمبر 2026.",
      "بالتالي، تعتمد هذه المنصة جدول المعاملات السابق، وهو الجدول المعمول به في السنة الثالثة ثانوي لدورة 2027.",
      "تحققنا من اتساق الجدول بجمع المعاملات لكل شعبة (من 27 إلى 34 حسب الشعبة)، وهو ما يطابق المجاميع المنشورة.",
      "الموقع الرسمي للوزارة لم يستجب أثناء التحقق، لذلك اعتمدنا مصادر ثانوية موثوقة مع ذكرها. سنحدّث الصفحة فور نشر نص رسمي متاح.",
    ],
    fr: [
      "Une réforme large des coefficients et la suppression de matières ont été annoncées en juillet 2026, puis abrogées par la décision n°36 du 9 septembre 2026.",
      "La plateforme applique donc la table antérieure, celle en vigueur en 3e année secondaire pour la session 2027.",
      "Nous avons vérifié la cohérence des totaux par filière (de 27 à 34 selon la filière), conformément aux totaux publiés.",
      "Le site officiel du ministère ne répondait pas lors de la vérification ; nous citons donc des sources secondaires identifiées et mettrons à jour dès qu’un texte officiel accessible sera publié.",
    ],
    en: [
      "A broad coefficient reform removing subjects was announced in July 2026, then repealed by decision no. 36 of 9 September 2026.",
      "The platform therefore applies the previous table, the one in force in the final secondary year for the 2027 session.",
      "We checked that each stream total matches the published totals (27 to 34 depending on the stream).",
      "The ministry website did not respond during verification, so we cite identified secondary sources and will update as soon as an accessible official text is published.",
    ],
  } as Record<Locale, string[]>,
};

/** Localized sources converted to the shape used by <SourceList>. */
export function coefficientSourcesFor(locale: Locale): SourceRef[] {
  return coefficientStatus.sources.map((source) => ({
    label: source.label[locale],
    url: source.url,
    kind: source.kind,
    checkedOn: source.checkedOn,
  }));
}

/** Documented changes affecting the data, newest first. */
export const coefficientTimeline = [
  {
    date: "2026-09-09",
    kind: "repeal" as const,
    label: {
      ar: "القرار رقم 36 يلغي تعديلات جويلية ويعيد العمل بالمعاملات السابقة",
      fr: "La décision n°36 annule les modifications de juillet et rétablit les coefficients antérieurs",
      en: "Decision no. 36 cancels the July changes and restores the previous coefficients",
    } as Localized,
  },
  {
    date: "2026-07-28",
    kind: "announced" as const,
    label: {
      ar: "قرار وزاري يقترح تقليص المواد ورفع معاملات التخصص (أُلغي لاحقًا)",
      fr: "Décision ministérielle réduisant les matières et renforçant les spécialités (abrogée ensuite)",
      en: "Ministerial decision cutting subjects and strengthening specialties (later repealed)",
    } as Localized,
  },
  {
    date: "2007-05-19",
    kind: "in-force" as const,
    label: {
      ar: "القرار رقم 382 الذي يحدد المواقيت والمعاملات لمرحلة التعليم الثانوي",
      fr: "Décision n°382 fixant horaires et coefficients du secondaire",
      en: "Decision no. 382 setting secondary-school hours and coefficients",
    } as Localized,
  },
];

/** Exam sessions for which the archive has an entry (no fabricated documents). */
export const examYears = [2026, 2025, 2024, 2023, 2022, 2021] as const;

export const nationalStats = {
  candidatesPerYear: "≈ 800,000",
  candidatesSource: "https://www.education.gov.dz/",
  streams: streams.length,
  subjects: subjects.length,
  tools: 9,
};
