import type { Localized } from "./bac";
import type { Block, FaqItem, SourceRef } from "./types";

export type Guide = {
  slug: string;
  category: "calculator" | "coefficients" | "revision" | "orientation" | "method";
  published: string;
  updated: string;
  readingMinutes: number;
  featured?: boolean;
  locales: Record<
    "ar" | "fr" | "en",
    {
      title: string;
      description: string;
      blocks: Block[];
      faq?: FaqItem[];
      keywords: string[];
    }
  >;
  sources: SourceRef[];
  related: string[];
};

const coefficientSources: SourceRef[] = [
  {
    label: "Décision n°36 du 9 septembre 2026 (abrogation de la décision n°20) — Eddirasa",
    url: "https://eddirasa.com/ministerial-decision-36-regulating-secondary-education/",
    kind: "secondary",
    checkedOn: "2026-11-15",
  },
  {
    label: "Tableau des horaires et coefficients, 3e année secondaire (PDF)",
    url: "https://bac-algerie.net/coef.pdf",
    kind: "secondary",
    checkedOn: "2026-11-15",
  },
  {
    label: "Ministère de l’Éducation nationale (source officielle, indisponible lors de la vérification)",
    url: "https://www.education.gov.dz/",
    kind: "official",
    checkedOn: "2026-11-15",
  },
];

const orientationSources: SourceRef[] = [
  {
    label: "MESRS — Circulaire n°01 du 7 juillet 2026 relative à l’orientation des nouveaux bacheliers",
    url: "https://www.mesrs.dz/2026/07/signe-electroniquement-la-circulaire-ministerielle-relative-a-lorientation-des-nouveaux-bacheliers-session-2026-ar/",
    kind: "official",
    checkedOn: "2026-11-15",
  },
  {
    label: "MESRS — Moyennes minimales BAC 2026 après phase 1 (PDF)",
    url: "https://www.esi.dz/wp-content/uploads/2026/07/BAC-2026-Fichier-des-moyennes-minimales-apres-phase-1.pdf",
    kind: "official",
    checkedOn: "2026-11-15",
  },
];

export const guides: Guide[] = [
  {
    slug: "calculer-moyenne-bac",
    category: "calculator",
    published: "2026-02-10",
    updated: "2026-11-15",
    readingMinutes: 6,
    featured: true,
    locales: {
      ar: {
        title: "كيف تُحسب معدل البكالوريا؟ الطريقة الرسمية بمثال محلول",
        description:
          "شرح دقيق لطريقة حساب معدل البكالوريا الجزائرية: جمع (النقطة × المعامل) والقسمة على مجموع المعاملات، مع مثال كامل وخطوات التحقق.",
        keywords: ["حساب معدل البكالوريا", "معدل البكالوريا", "معاملات مواد البكالوريا"],
        blocks: [
          {
            type: "lead",
            text: "معدل البكالوريا هو معدل موزون: كل مادة لها معامل، ونقطتك فيها تُضرب في معاملها. النتيجة تُقسم على مجموع المعاملات، لا على عدد المواد.",
          },
          {
            type: "p",
            text: "الخطأ الأكثر شيوعًا هو جمع النقاط والقسمة على 10. الطريقة الصحيحة تعطي وزنًا أكبر للمواد ذات المعامل العالي، وهو ما يفسّر لماذا يمكن لنقطة ضعيفة في مادة أساسية أن تُغيّر المعدل أكثر من نقطة ممتازة في مادة ثانوية.",
          },
          { type: "h2", text: "القاعدة في سطر واحد" },
          { type: "formula", expression: "Moyenne = Σ(note × coefficient) ÷ Σ(coefficients)", note: "المجموع على المواد التي لديك فيها نقطة." },
          { type: "h2", text: "مثال محلول — شعبة علوم تجريبية" },
          {
            type: "p",
            text: "لنفترض النقاط التالية (المعاملات بين قوسين): علوم الطبيعة والحياة 15 (6)، الرياضيات 12 (5)، الفيزياء 11 (5)، العربية 14 (3)، الفلسفة 10 (2)، الفرنسية 12 (2)، الإنجليزية 13 (2)، التاريخ والجغرافيا 11 (2)، العلوم الإسلامية 16 (2)، التربية البدنية 17 (1).",
          },
          {
            type: "table",
            head: ["المادة", "النقطة", "المعامل", "النقطة × المعامل"],
            rows: [
              ["علوم الطبيعة والحياة", "15", "6", "90"],
              ["الرياضيات", "12", "5", "60"],
              ["العلوم الفيزيائية", "11", "5", "55"],
              ["اللغة العربية", "14", "3", "42"],
              ["الفلسفة", "10", "2", "20"],
              ["الفرنسية", "12", "2", "24"],
              ["الإنجليزية", "13", "2", "26"],
              ["التاريخ والجغرافيا", "11", "2", "22"],
              ["العلوم الإسلامية", "16", "2", "32"],
              ["التربية البدنية", "17", "1", "17"],
              ["المجموع", "—", "30", "388"],
            ],
            caption: "المجموع 388، والمعاملات 30. المعدل = 388 ÷ 30 = 12.93.",
          },
          { type: "formula", expression: "388 ÷ 30 = 12.93 / 20", note: "معدل ناجح (≥ 10/20)." },
          { type: "h2", text: "لماذا تهمّ المعاملات في المراجعة؟" },
          {
            type: "p",
            text: "كل نقطة إضافية في مادة ترفع المعدل بمقدار (معامل المادة ÷ مجموع المعاملات). في المثال أعلاه، نقطة إضافية في علوم الطبيعة ترفع المعدل بـ 0.20، بينما نقطة إضافية في التربية البدنية ترفعه بـ 0.03 فقط. هذه ليست دعوة لإهمال المواد الثانوية، لكنها تفسّر كيف توزّع وقتك عندما يكون الوقت محدودًا.",
          },
          { type: "callout", tone: "calc", title: "جرّبها بنقاطك", text: "الحاسبة في المنصة تطبق نفس القاعدة وتُظهر مساهمة كل مادة ومجموع المعاملات المستعمل، مع إمكانية حساب العلامة اللازمة للوصول إلى معدل مستهدف." },
          { type: "h2", text: "أخطاء يجب تجنبها" },
          {
            type: "ul",
            items: [
              "احتساب مادة بدون نقطة كصفر: في الحساب المدرسي، المادة غير المنجزة لا تُحتسب بنفس طريقة الصفر. حاسبتنا تستثنيها وتُظهر عدد المواد المحتسبة.",
              "نسيان معامل التربية البدنية (1): يُحتسب في المعدل النهائي.",
              "تقريب النتيجة قبل القسمة: اجمع النقاط الدقيقة ثم قرّب النتيجة النهائية إلى منزلتين.",
            ],
          },
          {
            type: "callout",
            tone: "official",
            title: "ما هو رسمي وما هو شرح؟",
            text: "القاعدة (المعدل الموزون) والعتبة (10/20) معروفة ومطبقة في شهادة البكالوريا. تفاصيل مثل احتساب التربية البدنية تعتمد على تنظيم الامتحان؛ راجع بيان الوزارة أو مؤسستك للحالات الخاصة (المترشح الحر).",
          },
        ],
        faq: [
          { q: "هل معدل البكالوريا يُقسم على عدد المواد أم على مجموع المعاملات؟", a: "على مجموع المعاملات. إذا كانت لديك 10 مواد بمجموع معاملات 30، تُقسم النقاط الموزونة على 30." },
          { q: "هل يمكن النجاح بمعدل أقل من 10؟", a: "عتبة النجاح هي 10/20. لا تعتمد على «تعويض» أو استثناءات غير منشورة؛ راجع النصوص الرسمية لحالتك." },
        ],
      },
      fr: {
        title: "Comment est calculée la moyenne du bac ? La méthode officielle avec un exemple",
        description:
          "Méthode exacte de calcul de la moyenne du bac algérien : somme (note × coefficient) divisée par la somme des coefficients, avec un exemple complet.",
        keywords: ["calcul moyenne bac", "moyenne baccalauréat algérie", "coefficients bac"],
        blocks: [
          {
            type: "lead",
            text: "La moyenne du bac est une moyenne pondérée : chaque note est multipliée par le coefficient de la matière, puis le total est divisé par la somme des coefficients — pas par le nombre de matières.",
          },
          {
            type: "p",
            text: "L’erreur la plus fréquente consiste à additionner les notes et à diviser par 10. La pondération donne plus de poids aux matières à fort coefficient : une note faible en matière principale pèse davantage qu’une très bonne note ailleurs.",
          },
          { type: "h2", text: "La règle en une ligne" },
          { type: "formula", expression: "Moyenne = Σ(note × coefficient) ÷ Σ(coefficients)" },
          { type: "h2", text: "Exemple résolu — sciences expérimentales" },
          {
            type: "table",
            head: ["Matière", "Note", "Coef.", "Note × coef."],
            rows: [
              ["Sciences de la nature", "15", "6", "90"],
              ["Mathématiques", "12", "5", "60"],
              ["Sciences physiques", "11", "5", "55"],
              ["Arabe", "14", "3", "42"],
              ["Philosophie", "10", "2", "20"],
              ["Français", "12", "2", "24"],
              ["Anglais", "13", "2", "26"],
              ["Histoire-Géographie", "11", "2", "22"],
              ["Sciences islamiques", "16", "2", "32"],
              ["EPS", "17", "1", "17"],
              ["Total", "—", "30", "388"],
            ],
            caption: "388 ÷ 30 = 12,93/20.",
          },
          { type: "h2", text: "Ce que cela change pour vos révisions" },
          {
            type: "p",
            text: "Chaque point gagné dans une matière augmente la moyenne de (coefficient ÷ total des coefficients). Ici, +1 en sciences de la nature vaut +0,20 de moyenne, contre +0,03 en EPS. Ce n’est pas une raison de négliger les petites matières, mais un outil d’arbitrage quand le temps manque.",
          },
          { type: "callout", tone: "calc", text: "Le calculateur applique cette règle, affiche la contribution de chaque matière et calcule la note nécessaire pour atteindre une moyenne cible." },
          {
            type: "callout",
            tone: "official",
            title: "Officiel vs éditorial",
            text: "La règle de la moyenne pondérée et le seuil de 10/20 sont officiels. Les modalités particulières (candidats libres, EPS) dépendent du règlement de l’examen : vérifiez auprès de votre établissement.",
          },
        ],
        faq: [
          { q: "Divise-t-on par le nombre de matières ou par la somme des coefficients ?", a: "Par la somme des coefficients. Avec 10 matières et 30 coefficients, on divise par 30." },
          { q: "Peut-on réussir avec moins de 10/20 ?", a: "Le seuil est 10/20. Ne comptez pas sur des dérogations non publiées." },
        ],
      },
      en: {
        title: "How is the bac average calculated? Official method with a worked example",
        description: "Exact method for the Algerian bac average: sum of (grade × coefficient) divided by the sum of coefficients, with a full example.",
        keywords: ["bac average calculator", "algerian bac average", "bac coefficients"],
        blocks: [
          { type: "lead", text: "The bac average is weighted: each grade is multiplied by the subject coefficient, then divided by the sum of coefficients — not by the number of subjects." },
          {
            type: "table",
            head: ["Subject", "Grade", "Coef.", "Points"],
            rows: [
              ["Natural sciences", "15", "6", "90"],
              ["Mathematics", "12", "5", "60"],
              ["Physics", "11", "5", "55"],
              ["Arabic", "14", "3", "42"],
              ["Philosophy", "10", "2", "20"],
              ["French", "12", "2", "24"],
              ["English", "13", "2", "26"],
              ["History-Geography", "11", "2", "22"],
              ["Islamic studies", "16", "2", "32"],
              ["PE", "17", "1", "17"],
              ["Total", "—", "30", "388"],
            ],
            caption: "388 ÷ 30 = 12.93/20.",
          },
          { type: "h2", text: "What it means for revision" },
          { type: "p", text: "One extra point in a subject raises the average by coefficient ÷ total coefficients. Here, +1 in natural sciences is worth +0.20, against +0.03 in PE." },
          { type: "callout", tone: "official", title: "Official vs editorial", text: "The weighted-average rule and the 10/20 threshold are official. Special cases (free candidates, PE) follow the exam regulations — check with your school." },
        ],
        faq: [{ q: "Divide by subject count or coefficient sum?", a: "By the coefficient sum. Ten subjects with 30 coefficients means dividing by 30." }],
      },
    },
    sources: coefficientSources,
    related: ["coefficients-bac-2027", "plan-revision-8-semaines", "utiliser-sujets-bac"],
  },
  {
    slug: "coefficients-bac-2027",
    category: "coefficients",
    published: "2026-11-15",
    updated: "2026-11-15",
    readingMinutes: 7,
    featured: true,
    locales: {
      ar: {
        title: "معاملات البكالوريا 2027: ما هو المعمول به فعلًا بعد إلغاء تعديلات جويلية؟",
        description:
          "تعديلات المعاملات أُعلنت في جويلية 2026 ثم أُلغيت في سبتمبر 2026. هذا ما يعني طلبة دورة 2027، مع الجداول والمصادر والتواريخ.",
        keywords: ["معاملات البكالوريا 2027", "تعديلات البكالوريا", "مواد البكالوريا"],
        blocks: [
          {
            type: "lead",
            text: "خلاصة مهمة: التعديل الواسع للمعاملات الذي أُعلن في 28 جويلية 2026 أُلغي بقرار وزاري رقم 36 مؤرخ في 9 سبتمبر 2026. لذلك تعود المعاملات والمواد إلى الجدول السابق، وهو المعمول به لدورة 2027.",
          },
          { type: "h2", text: "ماذا حدث بالترتيب؟" },
          {
            type: "steps",
            items: [
              { title: "28 جويلية 2026: قرار رقم 20", text: "أعلن تقليص المواد ورفع معاملات التخصص: حذف الفرنسية والفلسفة من بعض الشعب العلمية، ورفع معامل الرياضيات إلى 8 في شعبة رياضيات، وإدراج الإعلام الآلي…" },
              { title: "9 سبتمبر 2026: قرار رقم 36", text: "ألغى القرار رقم 20 وكل المناشير المرتبطة به، وأبقى العمل بالتنظيم المعتمد قبل صدوره." },
              { title: "النتيجة لدورة 2027", text: "المواد والمعاملات هي نفسها المعتمدة سابقًا: من 27 إلى 34 معاملًا حسب الشعبة." },
            ],
          },
          { type: "callout", tone: "warn", title: "لماذا ننشر هذا؟", text: "مواقع كثيرة ما زالت تعرض جداول التعديل الملغى. الاعتماد عليها قد يوجّه مراجعتك إلى مواد لم تعد مقررة، أو يخفي مواد ما زالت مقررة." },
          { type: "h2", text: "مجموع المعاملات حسب الشعبة" },
          {
            type: "table",
            head: ["الشعبة", "مجموع المعاملات", "أعلى معامل"],
            rows: [
              ["علوم تجريبية", "30", "علوم الطبيعة والحياة (6)"],
              ["رياضيات", "29", "الرياضيات (7)"],
              ["تقني رياضي", "33", "التكنولوجيا (7)"],
              ["تسيير واقتصاد", "34", "التسيير المحاسبي (6)"],
              ["آداب وفلسفة", "27 (+2 اختياري)", "العربية والفلسفة (6)"],
              ["لغات أجنبية", "28", "الفرنسية والإنجليزية (5)"],
            ],
            caption: "المجاميع محسوبة من جدول المعاملات المعمول به، وتطابق المجاميع المنشورة.",
          },
          { type: "h2", text: "كيف تتحقق بنفسك؟" },
          {
            type: "ol",
            items: [
              "افتح جدول المعاملات لشعبتك في صفحة الشعب.",
              "تأكد من مجموع المعاملات: يجب أن يطابق الرقم أعلاه.",
              "قارن مع أي جدول آخر: إذا حذف موادًا أو رفع معاملات التخصص، فهو جدول التعديل الملغى.",
            ],
          },
          {
            type: "callout",
            tone: "official",
            title: "حدود التحقق",
            text: "موقع وزارة التربية لم يستجب أثناء التحقق (15 نوفمبر 2026)، لذلك اعتمدنا على نص القرار كما نُشر ومصادر ثانوية موثوقة، مع التحقق من اتساق المجاميع. سنحدّث الصفحة عند نشر نص رسمي متاح.",
          },
        ],
        faq: [
          { q: "هل حُذفت الفلسفة من شعبة العلوم التجريبية؟", a: "لا. هذا كان مقترحًا في قرار جويلية 2026 الذي أُلغي في سبتمبر 2026؛ الفلسفة ما زالت مادة بمعامل 2 في هذه الشعبة." },
          { q: "هل معامل الرياضيات في شعبة الرياضيات 7 أم 8؟", a: "7 في الجدول المعمول به. الرقم 8 ورد في التعديل الملغى." },
        ],
      },
      fr: {
        title: "Coefficients du bac 2027 : ce qui s’applique vraiment après l’abrogation de juillet",
        description:
          "La réforme des coefficients annoncée en juillet 2026 a été abrogée en septembre 2026. Ce que cela change pour la session 2027, avec tableaux et sources.",
        keywords: ["coefficients bac 2027", "réforme bac", "matières bac algérie"],
        blocks: [
          {
            type: "lead",
            text: "À retenir : la réforme annoncée le 28 juillet 2026 a été abrogée par la décision n°36 du 9 septembre 2026. Les matières et coefficients antérieurs reviennent en vigueur pour la session 2027.",
          },
          { type: "h2", text: "Chronologie" },
          {
            type: "steps",
            items: [
              { title: "28 juillet 2026 — décision n°20", text: "Réduction du nombre de matières et renforcement des spécialités (suppression du français et de la philosophie dans certaines filières scientifiques, mathématiques à 8 en filière maths, informatique ajoutée…)." },
              { title: "9 septembre 2026 — décision n°36", text: "Abrogation de la décision n°20 et de ses circulaires ; retour à l’organisation antérieure." },
              { title: "Conséquence pour 2027", text: "Les coefficients restent ceux d’avant : de 27 à 34 selon la filière." },
            ],
          },
          {
            type: "table",
            head: ["Filière", "Total coefficients", "Coefficient le plus élevé"],
            rows: [
              ["Sciences expérimentales", "30", "Sciences de la nature (6)"],
              ["Mathématiques", "29", "Mathématiques (7)"],
              ["Technicien mathématique", "33", "Technologie (7)"],
              ["Gestion et économie", "34", "Gestion comptable (6)"],
              ["Lettres et philosophie", "27 (+2 option)", "Arabe et philosophie (6)"],
              ["Langues étrangères", "28", "Français et anglais (5)"],
            ],
          },
          { type: "callout", tone: "warn", title: "Pourquoi cette page existe", text: "De nombreux sites affichent encore les tableaux abrogés. Les utiliser peut vous faire réviser des matières supprimées ou ignorer des matières maintenues." },
          {
            type: "callout",
            tone: "official",
            title: "Limites de vérification",
            text: "Le site du ministère ne répondait pas le 15 novembre 2026. Nous nous appuyons sur le texte de la décision tel que publié et sur des sources secondaires identifiées, après vérification de la cohérence des totaux.",
          },
        ],
        faq: [
          { q: "La philosophie est-elle supprimée en sciences expérimentales ?", a: "Non. C’était la réforme de juillet 2026, abrogée en septembre. La philosophie reste coefficient 2." },
          { q: "Mathématiques : coefficient 7 ou 8 ?", a: "7 dans le tableau en vigueur ; 8 relevait de la réforme abrogée." },
        ],
      },
      en: {
        title: "2027 bac coefficients: what actually applies after the July reform was repealed",
        description: "The July 2026 coefficient reform was repealed in September 2026. What this means for the 2027 session, with tables and sources.",
        keywords: ["bac 2027 coefficients", "algeria bac reform"],
        blocks: [
          { type: "lead", text: "Key point: the reform announced on 28 July 2026 was repealed by decision no. 36 of 9 September 2026. The previous subjects and coefficients apply to the 2027 session." },
          {
            type: "table",
            head: ["Stream", "Total coefficients", "Highest coefficient"],
            rows: [
              ["Experimental sciences", "30", "Natural sciences (6)"],
              ["Mathematics", "29", "Mathematics (7)"],
              ["Mathematical technician", "33", "Technology (7)"],
              ["Management and economics", "34", "Accounting (6)"],
              ["Literature and philosophy", "27 (+2 optional)", "Arabic and philosophy (6)"],
              ["Foreign languages", "28", "French and English (5)"],
            ],
          },
          { type: "callout", tone: "warn", title: "Why this matters", text: "Many sites still show the repealed tables. Relying on them can send you to subjects that are no longer examined or hide subjects that still are." },
        ],
        faq: [{ q: "Is philosophy removed from experimental sciences?", a: "No. That was the July 2026 reform, repealed in September. Philosophy remains coefficient 2." }],
      },
    },
    sources: coefficientSources,
    related: ["calculer-moyenne-bac", "plan-revision-8-semaines"],
  },
  {
    slug: "plan-revision-8-semaines",
    category: "revision",
    published: "2026-03-02",
    updated: "2026-11-15",
    readingMinutes: 8,
    featured: true,
    locales: {
      ar: {
        title: "خطة مراجعة البكالوريا في 8 أسابيع: جدول واقعي قابل للتطبيق",
        description:
          "خطة مراجعة من 8 أسابيع مبنية على المعاملات والصعوبة الشخصية، مع تقسيم أسبوعي وأدوات تتبع، وشرح كيف تعدّلها إذا تأخرت.",
        keywords: ["برنامج مراجعة البكالوريا", "خطة مراجعة", "تنظيم الوقت بكالوريا"],
        blocks: [
          {
            type: "lead",
            text: "الخطة الجيدة ليست التي تملأ كل ساعة، بل التي تصمد أسبوعين ثم يمكن تعديلها. هذه خطة 8 أسابيع تعتمد على ثلاث قواعد: الوزن بالمعامل، التناوب بين المواد، والمراجعة النشطة بدل إعادة القراءة.",
          },
          { type: "h2", text: "القواعد الثلاث" },
          {
            type: "ul",
            items: [
              "الوزن: خصّص أكبر عدد من الحصص لمواد المعامل العالي، دون إهمال المواد الثانوية.",
              "التناوب: لا تخصص يومًا كاملًا لمادة واحدة؛ التناوب يحسّن الاسترجاع ويقلل الملل.",
              "المراجعة النشطة: استرجع من الذاكرة، حلّ تمرينًا، اشرح الدرس بصوت عالٍ — بدل إعادة قراءة الملخص.",
            ],
          },
          { type: "h2", text: "توزيع الأسابيع" },
          {
            type: "table",
            head: ["الأسبوع", "الهدف", "المخرج الملموس"],
            rows: [
              ["1", "جرد شامل + إصلاح الأساسيات", "قائمة ثغرات مرتبة حسب المعامل"],
              ["2–3", "إتمام الدروس الأساسية", "ملخص شخصي لكل درس أساسي"],
              ["4–5", "تمارين مصنفة حسب المحور", "دفتر أخطاء أول"],
              ["6", "موضوع كامل بوقت محدد", "تصحيح ذاتي + قائمة أخطاء"],
              ["7", "معالجة الأخطاء فقط", "إعادة حل الأخطاء دون نظر"],
              ["8", "مراجعة خفيفة + نوم منتظم", "لا جديد، فقط تثبيت"],
            ],
          },
          { type: "callout", tone: "calc", title: "لا تنسخ الجدول", text: "استعمل مولّد الجدول في المنصة: يدخل شعبتك وساعاتك المتاحة ويوزّع الحصص حسب المعامل، ثم تصدّره إلى تقويمك." },
          { type: "h2", text: "كم ساعة في الأسبوع؟" },
          {
            type: "p",
            text: "لا يوجد رقم سحري. ابدأ بـ 10–15 ساعة مراجعة فعّالة خارج الدروس، وقس الأسبوع الأول: هل أنجزت ما خططت؟ إذا كان الجواب دائمًا لا، فالمشكلة في الخطة لا في انضباطك. زد الوقت تدريجيًا فقط إذا كانت الساعات الحالية منجزة بجودة.",
          },
          { type: "h2", text: "ماذا تفعل إذا تأخرت؟" },
          {
            type: "ol",
            items: [
              "قلّص الطموح لا الجودة: احذف مراجعة المحاور ذات المعامل الأدنى بدل إلغاء التمارين.",
              "أعد ترتيب الأولويات: المحاور التي تظهر في الامتحانات بكثرة أولًا.",
              "خصّص جلسة أسبوعية للأخطاء فقط — لا درس جديد فيها.",
            ],
          },
        ],
        faq: [
          { q: "هل أدرس مادة واحدة كل يوم؟", a: "لا يُنصح. التناوب بين مادتين أو ثلاث في اليوم أفضل للاسترجاع، مع جلسات أطول للمواد الأساسية." },
          { q: "كم مرة أراجع الدرس؟", a: "ثلاث مرات متباعدة أفضل من ثلاث مرات متتالية: بعد يوم، بعد أسبوع، وقبل الامتحان." },
        ],
      },
      fr: {
        title: "Plan de révision du bac en 8 semaines : un calendrier réaliste",
        description:
          "Un plan de 8 semaines fondé sur les coefficients et vos difficultés, avec répartition hebdomadaire, suivi et ajustements.",
        keywords: ["plan de révision bac", "organiser révisions bac", "programme révision"],
        blocks: [
          { type: "lead", text: "Un bon plan n’est pas celui qui remplit chaque heure, mais celui qui tient deux semaines puis s’ajuste. Trois règles : pondérer par coefficient, alterner les matières, réviser activement." },
          {
            type: "table",
            head: ["Semaine", "Objectif", "Livrable"],
            rows: [
              ["1", "État des lieux + bases", "Liste des lacunes par coefficient"],
              ["2–3", "Cours fondamentaux", "Fiche personnelle par chapitre"],
              ["4–5", "Exercices par thème", "Cahier d’erreurs"],
              ["6", "Sujet complet chronométré", "Auto-correction + liste d’erreurs"],
              ["7", "Traitement des erreurs", "Refaire sans regarder"],
              ["8", "Révision légère + sommeil", "Consolidation, pas de nouveauté"],
            ],
          },
          { type: "callout", tone: "calc", text: "Utilisez le générateur de planning : filière, heures disponibles, répartition par coefficient, export calendrier." },
          { type: "h2", text: "Combien d’heures ?" },
          { type: "p", text: "Il n’y a pas de chiffre magique. Commencez par 10–15 heures effectives hors cours, mesurez la première semaine, puis augmentez seulement si le volume actuel est réellement tenu." },
        ],
        faq: [
          { q: "Une seule matière par jour ?", a: "Non : alternez deux ou trois matières, avec des sessions plus longues pour les matières principales." },
          { q: "Combien de fois réviser une leçon ?", a: "Trois fois espacées valent mieux que trois fois d’affilée : à J+1, à J+7, avant l’examen." },
        ],
      },
      en: {
        title: "An 8-week bac revision plan that actually holds",
        description: "A realistic 8-week plan weighted by coefficients, with weekly goals, tracking and adjustment rules.",
        keywords: ["bac revision plan", "study schedule bac"],
        blocks: [
          { type: "lead", text: "A good plan is not one that fills every hour, but one that survives two weeks and can be adjusted. Three rules: weight by coefficient, alternate subjects, revise actively." },
          {
            type: "table",
            head: ["Week", "Goal", "Output"],
            rows: [
              ["1", "Audit + fundamentals", "Gap list sorted by coefficient"],
              ["2–3", "Core chapters", "Personal summary per chapter"],
              ["4–5", "Exercises by topic", "Error log"],
              ["6", "Full timed paper", "Self-marking + error list"],
              ["7", "Fix errors only", "Redo without looking"],
              ["8", "Light revision + sleep", "Consolidation, no new material"],
            ],
          },
          { type: "callout", tone: "calc", text: "Use the planner: pick your stream and available hours; it allocates time by coefficient and exports to your calendar." },
        ],
      },
    },
    sources: [],
    related: ["calculer-moyenne-bac", "utiliser-sujets-bac", "methode-sciences-naturelles"],
  },
  {
    slug: "methode-sciences-naturelles",
    category: "method",
    published: "2026-04-12",
    updated: "2026-11-15",
    readingMinutes: 6,
    locales: {
      ar: {
        title: "منهجية الإجابة في علوم الطبيعة والحياة: من الملاحظة إلى الاستنتاج",
        description:
          "كيف تبني إجابة علمية منظمة في بكالوريا علوم الطبيعة والحياة: قراءة الوثائق، صياغة الفرضية، التسلسل السببي، والنص العلمي.",
        keywords: ["منهجية علوم الطبيعة", "النص العلمي بكالوريا", "إجابة علوم طبيعية"],
        blocks: [
          { type: "lead", text: "الفارق بين 12 و17 في علوم الطبيعة ليس كمية المعلومات، بل بنية الإجابة: هل ربطت الملاحظة بالتفسير ثم بالاستنتاج، أم كتبت ما تحفظه فقط؟" },
          { type: "h2", text: "البنية الثلاثية" },
          {
            type: "steps",
            items: [
              { title: "الملاحظة/المعطى", text: "ماذا تُظهر الوثيقة أو التجربة بدقة؟ استعمل الأرقام والرموز الواردة، لا وصفًا عامًا." },
              { title: "التفسير", text: "ما الآلية التي تفسّر هذا المعطى؟ هنا تُستعمل المصطلحات العلمية: تركيب، تحلل، تنشيط، تثبيط…" },
              { title: "الاستنتاج", text: "جواب مباشر عن السؤال المطروح، دون معلومات إضافية غير مطلوبة." },
            ],
          },
          { type: "h2", text: "النص العلمي" },
          { type: "p", text: "في النص العلمي، احترم التسلسل السببي: ابتداءً من المعلومة المعطاة، ثم الآلية، ثم النتيجة. الجمل القصيرة والروابط المنطقية («بالتالي»، «مما يؤدي إلى») تجعل الإجابة قابلة للتصحيح بسرعة." },
          { type: "h2", text: "أخطاء تخفض النقطة" },
          {
            type: "ul",
            items: [
              "وصف الوثيقة دون تفسيرها.",
              "استعمال «يزيد» أو «ينقص» بدل المصطلح العلمي الدقيق.",
              "استنتاج عام لا يجيب عن السؤال المحدد.",
              "إهمال الوحدة أو المقياس عند قراءة المنحنى.",
            ],
          },
          { type: "callout", tone: "calc", title: "تدريب عملي", text: "خذ موضوعًا سابقًا، وأجب دون النظر إلى التصحيح، ثم قارن إجابتك بالمعايير الثلاثة أعلاه. لا يوجد تصحيح رسمي منشور، لذا اعتمد على معايير المنهجية التي يشرحها أستاذك." },
        ],
      },
      fr: {
        title: "Méthode en sciences de la nature : de l’observation à la conclusion",
        description: "Comment structurer une réponse scientifique au bac : documents, interprétation, chaîne causale et texte scientifique.",
        keywords: ["méthode sciences naturelles bac", "texte scientifique bac"],
        blocks: [
          { type: "lead", text: "La différence entre 12 et 17 en sciences de la nature tient moins au volume de connaissances qu’à la structure : observation → interprétation → conclusion." },
          { type: "h2", text: "Les trois temps" },
          {
            type: "steps",
            items: [
              { title: "Observation", text: "Que montre exactement le document ou l’expérience ? Utilisez les chiffres et symboles fournis." },
              { title: "Interprétation", text: "Quel mécanisme explique ces données ? Employez le vocabulaire exact (synthèse, dégradation, activation, inhibition)." },
              { title: "Conclusion", text: "Réponse directe à la question posée, sans ajout hors sujet." },
            ],
          },
          { type: "h2", text: "Le texte scientifique" },
          { type: "p", text: "Respectez la chaîne causale : donnée → mécanisme → conséquence. Des phrases courtes et des connecteurs logiques rendent la copie rapide à corriger." },
        ],
      },
      en: {
        title: "Natural sciences method: from observation to conclusion",
        description: "How to structure a scientific answer: documents, interpretation, causal chain and scientific text.",
        keywords: ["natural sciences bac method"],
        blocks: [
          { type: "lead", text: "The gap between 12 and 17 is rarely knowledge volume; it is structure: observation → interpretation → conclusion." },
          {
            type: "ul",
            items: ["Describe the document precisely, with its figures.", "Name the mechanism with exact terminology.", "Answer the exact question, nothing more."],
          },
        ],
      },
    },
    sources: [],
    related: ["plan-revision-8-semaines", "methode-philosophie"],
  },
  {
    slug: "methode-philosophie",
    category: "method",
    published: "2026-04-20",
    updated: "2026-11-15",
    readingMinutes: 5,
    locales: {
      ar: {
        title: "المقالة الفلسفية: بناء الإشكالية بدل سرد الفلاسفة",
        description: "بنية المقالة الفلسفية في البكالوريا: طرح المشكلة، التحليل، المناقشة، والخاتمة — مع أخطاء نموذجية.",
        keywords: ["منهجية الفلسفة", "المقالة الفلسفية بكالوريا"],
        blocks: [
          { type: "lead", text: "المقالة ليست عرضًا لأقوال الفلاسفة، بل معالجة لمشكلة. إذا لم تحدد المشكلة في أول سطرين، ستكتب نصًا جميلًا خارج الموضوع." },
          { type: "h2", text: "البنية" },
          {
            type: "steps",
            items: [
              { title: "المقدمة", text: "مدخل موجز ← طرح المفارقة ← السؤال. لا تبدأ بـ«منذ القدم» ولا تسرد تعريفات." },
              { title: "التحليل", text: "الأطروحة الأولى مع حججها، ثم حدودها. استشهد بالفيلسوف لأن فكرته تخدم السؤال، لا لأنه مشهور." },
              { title: "المناقشة", text: "أطروحة مضادة وحججها، ثم تركيب. هذا هو الجزء الذي يفرق بين الوصف والتفكير." },
              { title: "الخاتمة", text: "جواب صريح عن المشكلة، لا تلخيص مكرر." },
            ],
          },
          { type: "h2", text: "أخطاء شائعة" },
          { type: "ul", items: ["السرد التاريخي.", "مقدمة عامة لا علاقة لها بالسؤال.", "الاكتفاء بأطروحة واحدة.", "خاتمة تكرر المقدمة."] },
          { type: "callout", tone: "info", text: "تدرّب على كتابة مقدمة في 5 دقائق لموضوعات مختلفة. المقدمة الجيدة تكشف فورًا هل فهمت السؤال." },
        ],
      },
      fr: {
        title: "Dissertation de philosophie : construire le problème, pas raconter les philosophes",
        description: "Structure de la dissertation : problématique, analyse, discussion, conclusion, et erreurs typiques.",
        keywords: ["méthode philosophie bac", "dissertation philosophie"],
        blocks: [
          { type: "lead", text: "Une dissertation n’est pas un catalogue d’auteurs, mais un traitement d’un problème. Sans problématique, vous écrirez un beau hors-sujet." },
          {
            type: "steps",
            items: [
              { title: "Introduction", text: "Accroche brève, paradoxe, question. Pas de « depuis la nuit des temps »." },
              { title: "Analyse", text: "Première thèse et ses arguments, puis ses limites. Citez un auteur parce qu’il sert le problème." },
              { title: "Discussion", text: "Thèse opposée, arguments, puis dépassement." },
              { title: "Conclusion", text: "Réponse explicite au problème, pas un résumé." },
            ],
          },
        ],
      },
      en: {
        title: "Philosophy essay: build the problem, don’t narrate philosophers",
        description: "Essay structure: problem, analysis, discussion, conclusion and typical mistakes.",
        keywords: ["philosophy essay method bac"],
        blocks: [
          { type: "lead", text: "A philosophy essay is not a catalogue of authors but a treatment of a problem. Without a problem statement you will write an elegant off-topic answer." },
          { type: "ul", items: ["Introduction: brief hook → paradox → question.", "Analysis: first thesis, arguments, limits.", "Discussion: opposing thesis, arguments, synthesis.", "Conclusion: explicit answer."] },
        ],
      },
    },
    sources: [],
    related: ["methode-sciences-naturelles", "plan-revision-8-semaines"],
  },
  {
    slug: "utiliser-sujets-bac",
    category: "revision",
    published: "2026-05-05",
    updated: "2026-11-15",
    readingMinutes: 5,
    locales: {
      ar: {
        title: "كيف تستعمل مواضيع البكالوريا السابقة دون إهدار وقتك؟",
        description:
          "طريقة عملية لاستغلال المواضيع السابقة: الاختبار الذاتي، دفتر الأخطاء، والتصحيح الذاتي — مع توضيح لماذا لا نستضيف ملفات غير رسمية.",
        keywords: ["مواضيع بكالوريا مع الحل", "التصحيح النموذجي", "مواضيع بكالوريا الجزائر"],
        blocks: [
          { type: "lead", text: "الموضوع السابق ليس للقراءة، بل للاختبار. قيمته تأتي من الفشل المنتج: تحلّه، تخطئ، ثم تفهم لماذا." },
          { type: "h2", text: "لماذا لا نستضيف ملفات المواضيع؟" },
          { type: "p", text: "تحققنا من بوابة الديوان الوطني للامتحانات والمسابقات وموقع الوزارة: لا يوجد أرشيف رسمي عمومي للمواضيع، والتصحيحات الرسمية تُعدّ للجان التصحيح ولا تُنشر كملفات عامة. نشر ملفات مجهولة المصدر يضرّ أكثر مما ينفع. لذلك نبني فهرسًا يحيل إلى المصادر، ونشرح كيف تستعمل الموضوع الذي تحصل عليه من مؤسستك." },
          { type: "h2", text: "بروتوكول من 4 خطوات" },
          {
            type: "steps",
            items: [
              { title: "اختبار مطابق للظروف", text: "وقت كامل، بلا كتاب، بلا هاتف. اكتب حتى لو لم تعرف." },
              { title: "تصحيح بمعايير", text: "استعمل معايير الإجابة: المنهجية، الدقة، الوحدات. لا تكتف بـ«يبدو صحيحًا»." },
              { title: "دفتر الأخطاء", text: "لكل خطأ: السبب (نسيان، سوء فهم، حساب) والإجراء التصحيحي." },
              { title: "إعادة الحل بعد أسبوع", text: "أعد نفس التمرين دون نظر إلى الحل. هذا هو الاختبار الحقيقي." },
            ],
          },
          { type: "callout", tone: "warn", title: "احذر «الحلول» المجهولة", text: "ملفات تُنسب إلى «التصحيح النموذجي» دون مصدر قد تحتوي أخطاء. تحقق دائمًا من المصدر وتاريخ النشر." },
        ],
        faq: [
          { q: "أين أجد مواضيع البكالوريا؟", a: "من أستاذك أو مؤسستك، ومن المصادر الرسمية عند نشرها. لا يوجد أرشيف رسمي عام تحققنا منه." },
          { q: "هل التصحيح النموذجي متاح للعموم؟", a: "لم نجد أي نشر رسمي عام للتصحيحات. تُعدّ التصحيحات للجان التصحيح." },
        ],
      },
      fr: {
        title: "Comment utiliser les sujets du bac sans perdre votre temps",
        description: "Protocole en 4 étapes pour exploiter les sujets : conditions réelles, auto-correction, cahier d’erreurs, reprise espacée.",
        keywords: ["sujets bac avec corrigés", "corrigé officiel bac"],
        blocks: [
          { type: "lead", text: "Un sujet n’est pas à lire mais à passer : sa valeur vient de l’erreur productive." },
          { type: "h2", text: "Pourquoi nous n’hébergeons pas de PDF" },
          { type: "p", text: "Le portail de l’ONEC et le site du ministère ne proposent pas d’archive publique de sujets, et les corrigés officiels sont préparés pour les commissions de correction. Publier des fichiers non vérifiés nuit plus qu’il n’aide." },
          {
            type: "steps",
            items: [
              { title: "Conditions réelles", text: "Durée complète, sans livre ni téléphone." },
              { title: "Auto-correction critériée", text: "Méthode, exactitude, unités — pas d’impression vague." },
              { title: "Cahier d’erreurs", text: "Cause de l’erreur et action corrective." },
              { title: "Reprise à J+7", text: "Refaire sans regarder : le seul vrai test." },
            ],
          },
        ],
      },
      en: {
        title: "How to use past bac papers without wasting time",
        description: "A 4-step protocol: real conditions, criteria-based self-marking, error log, spaced redo.",
        keywords: ["bac past papers", "bac corrections"],
        blocks: [
          { type: "lead", text: "A past paper is not for reading but for sitting: its value comes from productive failure." },
          { type: "h2", text: "Why we host no PDFs" },
          { type: "p", text: "The ONEC portal and ministry site provide no public paper archive, and official corrections are prepared for marking panels. Publishing unverified files harms more than it helps." },
          { type: "steps", items: [{ title: "Real conditions", text: "Full duration, no book, no phone." }, { title: "Criteria-based marking", text: "Method, accuracy, units." }, { title: "Error log", text: "Cause and corrective action." }, { title: "Redo after a week", text: "Without looking — the only real test." }] },
        ],
      },
    },
    sources: [
      { label: "ONEC — portail officiel (résultats / inscription)", url: "https://bac.onec.dz/", kind: "official", checkedOn: "2026-11-15" },
      { label: "Ministère de l’Éducation nationale", url: "https://www.education.gov.dz/", kind: "official", checkedOn: "2026-11-15" },
    ],
    related: ["plan-revision-8-semaines", "coefficients-bac-2027"],
  },
  {
    slug: "orientation-apres-bac",
    category: "orientation",
    published: "2026-07-20",
    updated: "2026-11-15",
    readingMinutes: 7,
    locales: {
      ar: {
        title: "التوجيه الجامعي بعد البكالوريا: كيف يعمل فعلًا؟",
        description:
          "شرح موثّق لمراحل التوجيه الجامعي في الجزائر: التسجيل المسبق، بطاقة الرغبات، المعدل الموزون، المرحلتان، ومعدلات القبول المنشورة.",
        keywords: ["التوجيه الجامعي الجزائر", "معدلات القبول", "التسجيل الجامعي"],
        blocks: [
          { type: "lead", text: "التوجيه الجامعي ليس قرعة: هو ترتيب آلي حسب الشعبة، المعدل (أو المعدل الموزون)، الرغبات، والطاقة الاستيعابية. فهم القاعدة يغيّر طريقة ترتيب رغباتك." },
          { type: "h2", text: "المراحل كما وردت في دورة 2026" },
          {
            type: "ol",
            items: [
              "تسجيل مسبق إلكتروني على منصة orientation-esi.dz خلال فترة محددة (في 2026: من 15 إلى 19 جويلية).",
              "ملء بطاقة رغبات واحدة: من 6 إلى 12 رغبة، مع رغبتين على الأقل في مسار مضمون محليًا أو جهويًا.",
              "معالجة آلية: الشعبة، النتائج، المعدل الموزون عند الحاجة، الرغبات، الطاقة الاستيعابية، والتوزيع الجغرافي.",
              "إعلان نتائج المرحلة الأولى، ثم التسجيل النهائي والدفع الإلكتروني عبر progres.mesrs.dz.",
              "المرحلة الثانية: بطاقة رغبات جديدة للمترشحين غير الموجهين، مع احترام المعدلات الدنيا للالتحاق.",
            ],
          },
          { type: "h2", text: "ما هو «معدل القبول»؟" },
          { type: "p", text: "معدل القبول المنشور ليس عتبة يحددها الوزير مسبقًا، بل معدل آخر مترشح قُبل في مؤسسة وتخصص معينين في تلك السنة. لهذا يتغير كل سنة، ولهذا لا يمكن اعتباره ضمانًا." },
          { type: "table", head: ["الميدان", "معدل 2026 (Min1)", "معدل 2025 (Min1)"], rows: [["الطب", "16.33", "16.65"], ["الصيدلة", "16.03", "16.26"]], caption: "بيانات رسمية منشورة بعد المرحلة الأولى. الفارق بين السنتين يوضح لماذا لا تُقرأ المعدلات كضمان." },
          { type: "callout", tone: "official", title: "التحقق", text: "المصدر: جدول الوزارة «Moyennes minimales BAC 2026 après phase 1» المنشور في 29 جويلية 2026، والدليل الرسمي للتوجيه. راجع الروابط أسفل الصفحة." },
          { type: "h2", text: "أخطاء في ترتيب الرغبات" },
          { type: "ul", items: ["وضع رغبات «حلمية» فقط دون مسار مضمون.", "ترتيب الرغبات حسب السمعة لا حسب المحتوى.", "إهمال شرط المادة الأساسية أو المعدل الموزون.", "عدم قراءة الطاقة الاستيعابية والتوزيع الجغرافي."] },
        ],
        faq: [
          { q: "هل معدل القبول ثابت؟", a: "لا. يتغير كل سنة وحسب المؤسسة والتخصص، لأنه معدل آخر مقبول." },
          { q: "كم رغبة أستطيع إدخالها؟", a: "في دورة 2026: من 6 إلى 12 رغبة في بطاقة واحدة، مع رغبتين على الأقل في مسار مضمون." },
        ],
      },
      fr: {
        title: "Orientation universitaire après le bac : comment ça marche vraiment",
        description:
          "Procédure documentée : préinscription, fiche de vœux, moyenne pondérée, phases, et lecture correcte des moyennes minimales publiées.",
        keywords: ["orientation universitaire algérie", "moyennes minimales bac"],
        blocks: [
          { type: "lead", text: "L’orientation n’est pas un tirage au sort : c’est un classement par filière, moyenne (ou moyenne pondérée), vœux et capacité d’accueil. Comprendre la règle change l’ordre de vos vœux." },
          { type: "h2", text: "Les étapes (campagne 2026)" },
          {
            type: "ol",
            items: [
              "Préinscription sur orientation-esi.dz pendant la fenêtre officielle (15–19 juillet 2026).",
              "Une fiche de vœux : de 6 à 12 vœux, dont au moins 2 licences à accès garanti local ou régional.",
              "Traitement automatique : filière, résultats, moyenne pondérée le cas échéant, vœux, capacité, district géographique.",
              "Résultats de la phase 1, puis inscription finale et paiement sur progres.mesrs.dz.",
              "Phase 2 : nouvelle fiche pour les non-affectés, dans le respect des minima d’accès.",
            ],
          },
          { type: "h2", text: "Ce qu’est une « moyenne minimale »" },
          { type: "p", text: "Ce n’est pas un seuil fixé à l’avance : c’est la moyenne du dernier admis dans un établissement et une filière donnés, pour cette année. D’où sa variation annuelle — et l’absence de garantie." },
          { type: "table", head: ["Filière", "2026 (Min1)", "2025 (Min1)"], rows: [["Médecine", "16.33", "16.65"], ["Pharmacie", "16.03", "16.26"]], caption: "Données officielles après phase 1 ; la variation annuelle illustre l’absence de garantie." },
          { type: "callout", tone: "official", title: "Vérification", text: "Source : tableau MESRS « Moyennes minimales BAC 2026 après phase 1 » (29 juillet 2026) et circulaire d’orientation. Liens en bas de page." },
        ],
        faq: [
          { q: "Le seuil est-il stable ?", a: "Non : il dépend de l’établissement, de la filière et de l’année." },
          { q: "Combien de vœux ?", a: "En 2026 : 6 à 12 vœux, dont au moins 2 à accès garanti." },
        ],
      },
      en: {
        title: "University orientation after the bac: how it actually works",
        description: "Documented procedure: pre-registration, wish card, weighted average, phases, and how to read published minimum averages.",
        keywords: ["algeria university orientation", "bac admission averages"],
        blocks: [
          { type: "lead", text: "Orientation is not a lottery: it ranks candidates by stream, average (or weighted average), wishes and capacity. Understanding the rule changes how you order your wishes." },
          { type: "h2", text: "What a minimum average is" },
          { type: "p", text: "It is not a pre-set threshold: it is the average of the last admitted candidate in a given institution and field, for that year. That is why it changes every year and guarantees nothing." },
          { type: "table", head: ["Field", "2026 (Min1)", "2025 (Min1)"], rows: [["Medicine", "16.33", "16.65"], ["Pharmacy", "16.03", "16.26"]], caption: "Official data after phase 1." },
          { type: "callout", tone: "official", title: "Verification", text: "Source: MESRS table published 29 July 2026 and the official orientation circular. Links below." },
        ],
      },
    },
    sources: orientationSources,
    related: ["coefficients-bac-2027", "utiliser-sujets-bac"],
  },
];

export function getGuide(slug: string) {
  return guides.find((guide) => guide.slug === slug) ?? null;
}

export const guideCategories = {
  calculator: { ar: "الحساب", fr: "Calcul", en: "Calculation" },
  coefficients: { ar: "المعاملات", fr: "Coefficients", en: "Coefficients" },
  revision: { ar: "المراجعة", fr: "Révision", en: "Revision" },
  orientation: { ar: "التوجيه", fr: "Orientation", en: "Orientation" },
  method: { ar: "المنهجية", fr: "Méthodologie", en: "Method" },
} as const satisfies Record<Guide["category"], Localized>;
