import type { Localized } from "./bac";
import type { Block, SourceRef } from "./types";

/**
 * Verified update log.
 *
 * Each entry states what changed, when it was checked, and what it means for
 * candidates. Entries are never back-dated: the `date` is the date of the
 * source event, `checkedOn` is when we verified it.
 */
export type UpdateKind = "official" | "data" | "platform";

export type UpdateEntry = {
  slug: string;
  date: string;
  checkedOn: string;
  kind: UpdateKind;
  title: Localized;
  summary: Localized;
  blocks: Record<"ar" | "fr" | "en", Block[]>;
  sources: SourceRef[];
};

export const updateKindLabels: Record<UpdateKind, Localized> = {
  official: { ar: "قرار رسمي", fr: "Décision officielle", en: "Official decision" },
  data: { ar: "تحديث بيانات", fr: "Mise à jour de données", en: "Data update" },
  platform: { ar: "تحديث المنصة", fr: "Mise à jour du site", en: "Platform update" },
};

export const updates: UpdateEntry[] = [
  {
    slug: "abrogation-reforme-coefficients-2026",
    date: "2026-09-09",
    checkedOn: "2026-11-15",
    kind: "official",
    title: {
      ar: "إلغاء تعديلات المعاملات: العودة إلى الجدول السابق لدورة 2027",
      fr: "Réforme des coefficients abrogée : retour au tableau antérieur pour 2027",
      en: "Coefficient reform repealed: the previous table applies to 2027",
    },
    summary: {
      ar: "القرار الوزاري رقم 36 ألغى القرار رقم 20 (28 جويلية 2026). النتيجة: المواد والمعاملات المعتمدة سابقًا هي المعمول بها.",
      fr: "La décision n°36 abroge la décision n°20 du 28 juillet 2026. Les matières et coefficients antérieurs s’appliquent.",
      en: "Decision no. 36 repeals decision no. 20 of 28 July 2026. The previous subjects and coefficients apply.",
    },
    blocks: {
      ar: [
        { type: "p", text: "أعلن قرار 28 جويلية 2026 تقليص عدد المواد ورفع معاملات التخصص في بعض الشعب. بعد أقل من شهرين، ألغى القرار رقم 36 المؤرخ في 9 سبتمبر 2026 ذلك التعديل وأبقى التنظيم السابق." },
        { type: "p", text: "عمليًا: كل جدول يُظهر حذف الفلسفة من الشعب العلمية أو معامل 8 في الرياضيات يعود إلى التعديل الملغى. المنصة تعتمد الجدول السابق، وهو ما يطابق مجموع المعاملات المنشور لكل شعبة." },
        { type: "callout", tone: "warn", title: "ما يجب فعله", text: "راجع جدول شعبتك في صفحة الشعب وتأكد من مجموع المعاملات. لا تعتمد على ملخصات مواقع لم تحدّث جداولها." },
      ],
      fr: [
        { type: "p", text: "La décision du 28 juillet 2026 réduisait le nombre de matières et renforçait les spécialités. Moins de deux mois plus tard, la décision n°36 du 9 septembre 2026 l’a abrogée et a rétabli l’organisation antérieure." },
        { type: "p", text: "Concrètement : tout tableau qui supprime la philosophie en filière scientifique ou affiche un coefficient 8 en mathématiques relève de la réforme abrogée. La plateforme applique le tableau antérieur, cohérent avec les totaux publiés par filière." },
        { type: "callout", tone: "warn", title: "À faire", text: "Vérifiez le tableau de votre filière et le total des coefficients. Ne vous fiez pas aux résumés de sites qui n’ont pas mis à jour leurs tableaux." },
      ],
      en: [
        { type: "p", text: "The 28 July 2026 decision cut subjects and strengthened specialties. Less than two months later, decision no. 36 of 9 September 2026 repealed it and restored the previous organisation." },
        { type: "p", text: "In practice: any table removing philosophy from science streams or showing coefficient 8 in mathematics reflects the repealed reform. The platform applies the earlier table, consistent with published per-stream totals." },
        { type: "callout", tone: "warn", title: "What to do", text: "Check your stream’s table and its coefficient total. Do not rely on summaries from sites that have not updated their tables." },
      ],
    },
    sources: [
      {
        label: "Décision n°36 du 9 septembre 2026 (texte et contexte) — Eddirasa",
        url: "https://eddirasa.com/ministerial-decision-36-regulating-secondary-education/",
        kind: "secondary",
        checkedOn: "2026-11-15",
      },
      {
        label: "Ministère de l’Éducation nationale (indisponible lors de la vérification)",
        url: "https://www.education.gov.dz/",
        kind: "official",
        checkedOn: "2026-11-15",
        note: "Délai dépassé le 15 novembre 2026.",
      },
    ],
  },
  {
    slug: "moyennes-minimales-bac-2026",
    date: "2026-07-29",
    checkedOn: "2026-11-15",
    kind: "official",
    title: {
      ar: "نشر المعدلات الدنيا للتوجيه بعد المرحلة الأولى (دورة 2026)",
      fr: "Publication des moyennes minimales après la phase 1 (2026)",
      en: "Minimum averages published after phase 1 (2026)",
    },
    summary: {
      ar: "جدول رسمي من وزارة التعليم العالي يحدد معدل آخر مقبول في كل مؤسسة وتخصص. هذه معدلات تاريخية، وليست عتبات لدورة 2027.",
      fr: "Tableau officiel du MESRS indiquant la moyenne du dernier admis par établissement et filière. Données historiques, pas des seuils 2027.",
      en: "Official MESRS table giving the last admitted candidate’s average per institution and field. Historical data, not 2027 thresholds.",
    },
    blocks: {
      ar: [
        { type: "p", text: "الجدول المنشور في 29 جويلية 2026 يحتوي مئات الأسطر. أدرجنا في محاكي التوجيه عينة موثقة فقط، مع رابط الملف الكامل، بدل نسخ جدول ضخم دون سياق." },
        { type: "p", text: "تذكير: معدل القبول هو معدل آخر مترشح قُبل في تلك السنة، ولا يشكل ضمانًا. استعمله للمقارنة وترتيب الرغبات، لا كوعد." },
      ],
      fr: [
        { type: "p", text: "Le tableau publié le 29 juillet 2026 contient des centaines de lignes. Le simulateur n’en reprend qu’un échantillon vérifié, avec le lien vers le fichier complet, plutôt que de recopier un tableau massif hors contexte." },
        { type: "p", text: "Rappel : une moyenne minimale est celle du dernier admis de l’année ; elle ne garantit rien. Utilisez-la pour comparer et ordonner vos vœux, pas comme une promesse." },
      ],
      en: [
        { type: "p", text: "The table published on 29 July 2026 contains hundreds of rows. The orientation simulator reproduces only a verified sample, with a link to the full file, instead of copying a huge table without context." },
        { type: "p", text: "Reminder: a minimum average is the last admitted candidate’s average for that year; it guarantees nothing. Use it to compare and order your wishes, not as a promise." },
      ],
    },
    sources: [
      {
        label: "MESRS — Moyennes minimales BAC 2026 après phase 1 (PDF)",
        url: "https://www.esi.dz/wp-content/uploads/2026/07/BAC-2026-Fichier-des-moyennes-minimales-apres-phase-1.pdf",
        kind: "official",
        checkedOn: "2026-11-15",
      },
    ],
  },
  {
    slug: "calendrier-bac-2027",
    date: "2026-11-15",
    checkedOn: "2026-11-15",
    kind: "data",
    title: {
      ar: "تقويم بكالوريا 2027: لم يُعلن رسميًا بعد",
      fr: "Calendrier du bac 2027 : pas encore annoncé officiellement",
      en: "2027 bac calendar: not officially announced yet",
    },
    summary: {
      ar: "لم نجد أي إعلان رسمي لمواعيد دورة 2027. العدّاد يستعمل تاريخًا تقديريًا قابلًا للتعديل، ولا ننشر مواعيد مؤكدة.",
      fr: "Aucune annonce officielle des dates 2027 n’a été trouvée. Le compte à rebours utilise une date indicative modifiable.",
      en: "No official announcement of 2027 dates was found. The countdown uses an editable indicative date.",
    },
    blocks: {
      ar: [
        { type: "p", text: "الشائع أن الدورة تُنظَّم في جوان، لكن «الشائع» ليس مصدرًا. لذلك لا نعرض جدول امتحانات مفصّلًا لدورة 2027 قبل نشره رسميًا." },
        { type: "p", text: "عندما يُنشر التقويم، ستُحدَّث صفحة العدّاد وهذا السجل بالتاريخ الرسمي ورابط المصدر." },
      ],
      fr: [
        { type: "p", text: "La session se tient habituellement en juin, mais « habituellement » n’est pas une source. Nous n’affichons donc pas de calendrier détaillé 2027 avant sa publication officielle." },
        { type: "p", text: "Dès publication, la page du compte à rebours et ce journal seront mis à jour avec la date officielle et le lien source." },
      ],
      en: [
        { type: "p", text: "The session usually takes place in June, but “usually” is not a source. We therefore publish no detailed 2027 timetable before official release." },
        { type: "p", text: "Once published, the countdown page and this log will be updated with the official date and source link." },
      ],
    },
    sources: [
      {
        label: "Ministère de l’Éducation nationale",
        url: "https://www.education.gov.dz/",
        kind: "official",
        checkedOn: "2026-11-15",
        note: "Aucun calendrier 2027 publié au moment de la vérification.",
      },
      {
        label: "ONEC — portail des examens",
        url: "https://bac.onec.dz/",
        kind: "official",
        checkedOn: "2026-11-15",
      },
    ],
  },
  {
    slug: "lancement-plateforme",
    date: "2026-11-15",
    checkedOn: "2026-11-15",
    kind: "platform",
    title: {
      ar: "إطلاق المنصة: ما تجده وما لا تجده",
      fr: "Lancement de la plateforme : ce que vous y trouverez",
      en: "Platform launch: what you will and will not find",
    },
    summary: {
      ar: "حاسبة معدل، أدوات مراجعة، فهرس مواضيع، ومحاكي توجيه. لا ملفات PDF مجهولة، ولا معدلات قبول مخترعة.",
      fr: "Calculateur, outils de révision, index de sujets et simulateur d’orientation. Aucun PDF non vérifié, aucun seuil inventé.",
      en: "Calculator, revision tools, a paper index and an orientation simulator. No unverified PDFs, no invented thresholds.",
    },
    blocks: {
      ar: [
        { type: "p", text: "ننشر فقط ما يمكن التحقق منه. لهذا لا يوجد أرشيف PDF للمواضيع: تحققنا من بوابة الديوان الوطني ومن موقع الوزارة ولم نجد أرشيفًا رسميًا عامًا." },
        { type: "p", text: "كل معطى حساس في المنصة يحمل مصدره وتاريخ آخر تحقق. وإذا لم نجد مصدرًا، نقول ذلك صراحة بدل ملء الصفحة بأرقام." },
      ],
      fr: [
        { type: "p", text: "Nous ne publions que ce qui est vérifiable. D’où l’absence d’archive PDF de sujets : le portail de l’ONEC et le site du ministère n’en proposent pas publiquement." },
        { type: "p", text: "Chaque donnée sensible porte sa source et sa date de vérification. Quand aucune source n’existe, nous l’écrivons plutôt que de remplir la page de chiffres." },
      ],
      en: [
        { type: "p", text: "We publish only what can be verified. That is why there is no PDF paper archive: neither the ONEC portal nor the ministry site offers one publicly." },
        { type: "p", text: "Every sensitive data point carries its source and verification date. Where no source exists, we say so instead of filling the page with numbers." },
      ],
    },
    sources: [],
  },
];

export const updateBySlug = Object.fromEntries(updates.map((entry) => [entry.slug, entry])) as Record<string, UpdateEntry>;

export const latestUpdates = [...updates].sort((a, b) => (a.date < b.date ? 1 : -1));
