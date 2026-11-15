import type { Localized } from "./bac";

/**
 * Tool registry.
 *
 * Every tool runs entirely in the browser: no account, no upload, no grades
 * sent to a server. Tools that are full pages of their own (calculator,
 * orientation, planner) are linked through their own route names; the rest
 * are rendered by the generic `tool` route.
 */
export type ToolSlug =
  | "bac-countdown"
  | "weighted-average"
  | "study-time"
  | "revision-timetable"
  | "exam-score-simulator"
  | "average-improvement"
  | "scientific-calculator";

export type ToolEntry = {
  slug: ToolSlug;
  title: Localized;
  description: Localized;
  /** Editorial note on what the tool does and does not claim. */
  note: Localized;
};

export const tools: ToolEntry[] = [
  {
    slug: "bac-countdown",
    title: { ar: "عدّاد البكالوريا", fr: "Compte à rebours du bac", en: "Bac countdown" },
    description: {
      ar: "عدد الأيام المتبقية حتى تاريخ الامتحان، مع إمكانية تعديل التاريخ لأن الموعد الرسمي لدورة 2027 لم يُعلن بعد.",
      fr: "Jours restants avant l’examen, avec une date modifiable car le calendrier officiel 2027 n’est pas encore publié.",
      en: "Days left before the exam, with an editable date because the official 2027 calendar is not published yet.",
    },
    note: {
      ar: "التاريخ الافتراضي تقديري فقط، وليس موعدًا رسميًا.",
      fr: "La date par défaut est indicative, pas une date officielle.",
      en: "The default date is indicative, not an official date.",
    },
  },
  {
    slug: "weighted-average",
    title: { ar: "حاسبة المعدل الموزون", fr: "Moyenne pondérée", en: "Weighted average" },
    description: {
      ar: "احسب معدلًا موزونًا بأي معاملات تختارها: مفيد للمعدلات الفصلية ومعدلات التوجيه.",
      fr: "Calculez une moyenne pondérée avec les coefficients de votre choix : utile pour les moyennes trimestrielles et l’orientation.",
      en: "Compute a weighted average with any coefficients you choose — useful for term averages and orientation.",
    },
    note: {
      ar: "لا يعوّض القواعد الرسمية للتوجيه؛ هو أداة حساب فقط.",
      fr: "Ne remplace pas les règles officielles d’orientation ; outil de calcul uniquement.",
      en: "Does not replace official orientation rules; a calculation tool only.",
    },
  },
  {
    slug: "study-time",
    title: { ar: "حاسبة وقت المراجعة", fr: "Temps de révision", en: "Study time" },
    description: {
      ar: "وزّع ساعاتك المتاحة على مواد شعبتك حسب المعامل، واحصل على توزيع أسبوعي قابل للتعديل.",
      fr: "Répartissez vos heures disponibles entre les matières de votre filière selon les coefficients.",
      en: "Split your available hours across your stream’s subjects according to coefficients.",
    },
    note: {
      ar: "التوزيع اقتراح تحريري، وليس برنامجًا رسميًا.",
      fr: "La répartition est une proposition éditoriale, pas un programme officiel.",
      en: "The allocation is an editorial suggestion, not an official schedule.",
    },
  },
  {
    slug: "revision-timetable",
    title: { ar: "مولّد جدول المراجعة", fr: "Générateur d’emploi du temps", en: "Revision timetable" },
    description: {
      ar: "أنشئ جدولًا أسبوعيًا لمادتين أو أكثر مع أوقات جلسات واضحة، ثم اطبعه أو صدّره.",
      fr: "Créez un emploi du temps hebdomadaire avec des créneaux clairs, à imprimer ou exporter.",
      en: "Build a weekly timetable with clear slots, ready to print or export.",
    },
    note: {
      ar: "يُحفظ الجدول في متصفحك فقط.",
      fr: "Le planning reste dans votre navigateur.",
      en: "The timetable stays in your browser.",
    },
  },
  {
    slug: "exam-score-simulator",
    title: { ar: "محاكي نقاط الامتحان", fr: "Simulateur de notes", en: "Exam score simulator" },
    description: {
      ar: "جرّب سيناريوهات النقاط في الامتحان الوطني وشاهد أثرها على المعدل النهائي.",
      fr: "Testez des scénarios de notes à l’examen national et leur effet sur la moyenne finale.",
      en: "Test exam grade scenarios and see their effect on the final average.",
    },
    note: {
      ar: "سيناريو حسابي، وليس توقعًا للنتائج.",
      fr: "Scénario de calcul, pas une prédiction de résultats.",
      en: "A calculation scenario, not a result prediction.",
    },
  },
  {
    slug: "average-improvement",
    title: { ar: "حاسبة تحسين المعدل", fr: "Gain de moyenne", en: "Average improvement" },
    description: {
      ar: "اعرف كم نقطة إضافية تحتاج في مادة معينة، وكم سترفع معدلك فعليًا.",
      fr: "Voyez combien de points supplémentaires dans une matière font progresser votre moyenne.",
      en: "See how many extra points in a subject translate into average gain.",
    },
    note: {
      ar: "النتيجة تعتمد على المعاملات المعمول بها في شعبتك.",
      fr: "Le résultat dépend des coefficients en vigueur dans votre filière.",
      en: "The result depends on the coefficients in force for your stream.",
    },
  },
  {
    slug: "scientific-calculator",
    title: { ar: "الآلة الحاسبة العلمية", fr: "Calculatrice scientifique", en: "Scientific calculator" },
    description: {
      ar: "آلة حاسبة علمية بسيطة تعمل دون إنترنت، للدوال واللوغاريتمات والعمليات المركبة.",
      fr: "Calculatrice scientifique simple, hors ligne : fonctions, logarithmes et expressions composées.",
      en: "A simple offline scientific calculator for functions, logarithms and compound expressions.",
    },
    note: {
      ar: "لا تُستعمل في الامتحان إلا إذا سمحت التعليمات الرسمية بذلك.",
      fr: "À n’utiliser en examen que si la réglementation officielle l’autorise.",
      en: "Use in an exam only where the official rules allow it.",
    },
  },
];

export const toolBySlug = Object.fromEntries(tools.map((tool) => [tool.slug, tool])) as Record<ToolSlug, ToolEntry>;

/** Short labels used by the tools hub cards. */
export const toolLabels = {
  calculator: { ar: "حاسبة المعدل", fr: "Calculateur", en: "Grade calculator" } as Localized,
  orientation: { ar: "محاكي التوجيه", fr: "Orientation", en: "Orientation" } as Localized,
  planner: { ar: "مخطط المراجعة", fr: "Planificateur", en: "Planner" } as Localized,
};
