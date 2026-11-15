import type { Locale } from "./i18n";
import type { RouteTarget } from "./routes";
import { streamById, subjectById } from "@/content/bac";
import { getGuide } from "@/content/guides";
import { toolBySlug } from "@/content/tools";
import { updateBySlug } from "@/content/updates";

export type PageMeta = {
  title: string;
  description: string;
  /** Latin-only label for the generated Open Graph image. */
  ogTitle: string;
  type?: "website" | "article";
  noindex?: boolean;
  published?: string;
  updated?: string;
};

const staticMeta: Record<
  Exclude<RouteTarget["name"], "stream" | "examSubject" | "guide" | "tool" | "update">,
  Record<Locale, PageMeta>
> = {
  home: {
    ar: {
      title: "BAC DZ — منصة البكالوريا الجزائرية: المعدل، المواضيع، المراجعة والتوجيه",
      description: "احسب معدل البكالوريا بالمعاملات المعمول بها لدورة 2027، راجع بخطة أسبوعية، واطّلع على فهرس المواضيع ومحاكي التوجيه الجامعي — بمصادر ظاهرة.",
      ogTitle: "BAC DZ — Algerian baccalaureate platform",
    },
    fr: {
      title: "BAC DZ — Plateforme du bac algérien : moyenne, sujets, révisions, orientation",
      description: "Calculez votre moyenne avec les coefficients en vigueur pour 2027, révisez avec un plan hebdomadaire, consultez les sujets et le simulateur d’orientation — sources visibles.",
      ogTitle: "BAC DZ — Algerian baccalaureate platform",
    },
    en: {
      title: "BAC DZ — Algerian baccalaureate platform: average, papers, revision, orientation",
      description: "Compute your average with the coefficients in force for 2027, revise with a weekly plan, browse the paper index and the orientation simulator — with visible sources.",
      ogTitle: "BAC DZ — Algerian baccalaureate platform",
    },
  },
  calculator: {
    ar: {
      title: "حاسبة معدل البكالوريا 2027 — معاملات كل شعبة وتفصيل الحساب",
      description: "احسب معدل شهادة البكالوريا بالمعاملات المعتمدة لكل شعبة، مع مساهمة كل مادة، وحساب العلامة اللازمة للوصول إلى معدل مستهدف.",
      ogTitle: "Bac average calculator",
    },
    fr: {
      title: "Calculateur de moyenne du bac 2027 — coefficients par filière",
      description: "Calculez la moyenne du bac avec les coefficients en vigueur, la contribution de chaque matière et la note nécessaire pour atteindre une moyenne cible.",
      ogTitle: "Bac average calculator",
    },
    en: {
      title: "Bac average calculator 2027 — coefficients by stream",
      description: "Compute your bac average with the coefficients in force, each subject’s contribution and the grade needed to reach a target average.",
      ogTitle: "Bac average calculator",
    },
  },
  coefficients: {
    ar: {
      title: "معاملات البكالوريا 2027 — الجدول المعمول به بعد إلغاء تعديل جويلية",
      description: "جدول المعاملات المعمول به لدورة 2027 لكل شعبة، مع شرح إلغاء تعديلات جويلية 2026 بالقرار رقم 36 والمصادر وتاريخ التحقق.",
      ogTitle: "Bac coefficients 2027",
    },
    fr: {
      title: "Coefficients du bac 2027 — le tableau en vigueur après l’abrogation",
      description: "Tableau des coefficients en vigueur pour 2027 par filière, avec l’abrogation de la réforme de juillet 2026 par la décision n°36, les sources et la date de vérification.",
      ogTitle: "Bac coefficients 2027",
    },
    en: {
      title: "2027 bac coefficients — the table in force after the repeal",
      description: "Coefficient table in force for 2027 by stream, with the repeal of the July 2026 reform by decision no. 36, sources and verification date.",
      ogTitle: "Bac coefficients 2027",
    },
  },
  streams: {
    ar: {
      title: "شعب البكالوريا الست — المواد والمعاملات والآفاق",
      description: "بطاقات الشعب الرسمية الست في البكالوريا الجزائرية: المواد، المعاملات، التخصصات، والآفاق الجامعية، مع مقارنة مجموع المعاملات.",
      ogTitle: "Bac streams",
    },
    fr: {
      title: "Les six filières du bac — matières, coefficients et débouchés",
      description: "Fiches des six filières officielles du bac algérien : matières, coefficients, spécialités et débouchés, avec comparaison des totaux.",
      ogTitle: "Bac streams",
    },
    en: {
      title: "The six bac streams — subjects, coefficients and pathways",
      description: "Profiles of the six official Algerian bac streams: subjects, coefficients, specialties and university pathways, with total comparisons.",
      ogTitle: "Bac streams",
    },
  },
  exams: {
    ar: {
      title: "أرشيف مواضيع البكالوريا — فهرس حسب السنة والشعبة والمادة",
      description: "فهرس مواضيع البكالوريا حسب السنة والشعبة والمادة، مع حالة كل وثيقة وروابط المصادر الرسمية. لا نستضيف ملفات غير متحقق منها.",
      ogTitle: "Bac paper archive",
    },
    fr: {
      title: "Archive des sujets du bac — index par année, filière et matière",
      description: "Index des sujets du bac par année, filière et matière, avec le statut de chaque document et les liens officiels. Aucun fichier non vérifié n’est hébergé.",
      ogTitle: "Bac paper archive",
    },
    en: {
      title: "Bac paper archive — index by year, stream and subject",
      description: "Bac paper index by year, stream and subject, with each document’s status and official sources. No unverified file is hosted.",
      ogTitle: "Bac paper archive",
    },
  },
  guides: {
    ar: {
      title: "دليل البكالوريا — أدلة المراجعة والمنهجية والتوجيه",
      description: "أدلة عملية: حساب المعدل، المعاملات، خطة مراجعة في 8 أسابيع، منهجية العلوم والفلسفة، واستغلال المواضيع السابقة.",
      ogTitle: "Bac guides",
    },
    fr: {
      title: "Guides du bac — révision, méthode et orientation",
      description: "Guides pratiques : calcul de la moyenne, coefficients, plan de révision en 8 semaines, méthode en sciences et philosophie, exploitation des sujets.",
      ogTitle: "Bac guides",
    },
    en: {
      title: "Bac guides — revision, method and orientation",
      description: "Practical guides: average calculation, coefficients, an 8-week revision plan, science and philosophy method, and how to use past papers.",
      ogTitle: "Bac guides",
    },
  },
  tools: {
    ar: {
      title: "أدوات الطالب — حاسبات وخطط مراجعة تعمل في متصفحك",
      description: "أدوات مجانية بلا تسجيل: حاسبة المعدل، العدّاد، المعدل الموزون، وقت المراجعة، جدول المراجعة، محاكي النقاط، والآلة العلمية.",
      ogTitle: "Student tools",
    },
    fr: {
      title: "Outils de l’élève — calculateurs et plans de révision",
      description: "Outils gratuits sans inscription : moyenne, compte à rebours, moyenne pondérée, temps de révision, emploi du temps, simulateur de notes, calculatrice.",
      ogTitle: "Student tools",
    },
    en: {
      title: "Student tools — calculators and revision plans",
      description: "Free tools without sign-up: average calculator, countdown, weighted average, study time, timetable, score simulator and scientific calculator.",
      ogTitle: "Student tools",
    },
  },
  orientation: {
    ar: {
      title: "محاكي التوجيه الجامعي — قارن معدلك بالمعدلات المنشورة",
      description: "استكشف الميادين المتاحة لشعبتك، قارن معدلك بالمعدلات الدنيا الرسمية لسنة 2026، وافهم كيف يعمل التوجيه فعليًا.",
      ogTitle: "University orientation simulator",
    },
    fr: {
      title: "Simulateur d’orientation universitaire — comparer sa moyenne",
      description: "Explorez les domaines ouverts à votre filière, comparez votre moyenne aux minima officiels 2026 et comprenez le fonctionnement réel de l’orientation.",
      ogTitle: "University orientation simulator",
    },
    en: {
      title: "University orientation simulator — compare your average",
      description: "Explore the fields open to your stream, compare your average with the official 2026 minima and understand how orientation actually works.",
      ogTitle: "University orientation simulator",
    },
  },
  planner: {
    ar: {
      title: "مخطط المراجعة — جدول أسبوعي حسب شعبتك ووقتك",
      description: "أنشئ خطة مراجعة أسبوعية موزعة حسب المعامل، تابع تقدّمك، وصدّر الجدول إلى تقويمك بصيغة ICS. كل شيء يُحفظ في متصفحك.",
      ogTitle: "Study planner",
    },
    fr: {
      title: "Planificateur de révision — planning hebdomadaire par filière",
      description: "Créez un planning hebdomadaire pondéré par les coefficients, suivez votre progression et exportez-le en ICS. Tout reste dans votre navigateur.",
      ogTitle: "Study planner",
    },
    en: {
      title: "Study planner — weekly schedule by stream",
      description: "Build a weekly plan weighted by coefficients, track progress and export it as ICS. Everything stays in your browser.",
      ogTitle: "Study planner",
    },
  },
  updates: {
    ar: {
      title: "آخر التحديثات الموثّقة — قرارات رسمية وتحديثات بيانات",
      description: "سجل زمني للتحديثات التي تمس البكالوريا: إلغاء تعديلات المعاملات، نشر المعدلات الدنيا، وحالة تقويم دورة 2027.",
      ogTitle: "Verified updates",
    },
    fr: {
      title: "Dernières mises à jour vérifiées — décisions et données",
      description: "Journal daté des évolutions qui concernent le bac : abrogation de la réforme des coefficients, publication des minima, calendrier 2027.",
      ogTitle: "Verified updates",
    },
    en: {
      title: "Latest verified updates — official decisions and data",
      description: "Dated log of changes affecting the bac: repeal of the coefficient reform, publication of minima, and the 2027 calendar status.",
      ogTitle: "Verified updates",
    },
  },
  search: {
    ar: {
      title: "البحث في المنصة",
      description: "ابحث في صفحات المنصة: الشعب، المعاملات، المواضيع، الأدلة، والأدوات.",
      ogTitle: "Search",
      noindex: true,
    },
    fr: {
      title: "Recherche sur le site",
      description: "Recherchez parmi les filières, coefficients, sujets, guides et outils de la plateforme.",
      ogTitle: "Search",
      noindex: true,
    },
    en: {
      title: "Search the site",
      description: "Search the platform’s streams, coefficients, papers, guides and tools.",
      ogTitle: "Search",
      noindex: true,
    },
  },
  about: {
    ar: {
      title: "عن منصة BAC DZ — من نحن ومنهجيتنا",
      description: "منصة جزائرية مستقلة لطلبة البكالوريا، تفصل بوضوح بين المعلومة الرسمية والشرح التحريري والتقدير، وتذكر مصادرها.",
      ogTitle: "About BAC DZ",
    },
    fr: {
      title: "À propos de BAC DZ — qui nous sommes, notre méthode",
      description: "Plateforme algérienne indépendante pour les candidats au bac, qui distingue information officielle, explication éditoriale et estimation, avec sources.",
      ogTitle: "About BAC DZ",
    },
    en: {
      title: "About BAC DZ — who we are and how we work",
      description: "An independent Algerian platform for bac candidates that separates official information, editorial explanation and estimates, with sources.",
      ogTitle: "About BAC DZ",
    },
  },
  editorial: {
    ar: {
      title: "السياسة التحريرية — كيف نختار المحتوى ونتحقق منه",
      description: "قواعدنا: لا بيانات مخترعة، تمييز واضح بين الرسمي والتحريري، ذكر المصادر وتواريخ التحقق، وتحديث الصفحات عند تغيّر النصوص.",
      ogTitle: "Editorial policy",
    },
    fr: {
      title: "Charte éditoriale — sélection et vérification du contenu",
      description: "Nos règles : aucune donnée inventée, distinction entre officiel et éditorial, sources datées, mise à jour des pages quand les textes changent.",
      ogTitle: "Editorial policy",
    },
    en: {
      title: "Editorial policy — how we select and verify content",
      description: "Our rules: no invented data, a clear split between official and editorial content, dated sources, and updates when official texts change.",
      ogTitle: "Editorial policy",
    },
  },
  corrections: {
    ar: {
      title: "سياسة التصحيح — كيف نعالج الأخطاء",
      description: "كيف تبلغ عن خطأ، وما نفعله عند اكتشاف خطأ في بيانات أو حساب، ومدة المراجعة، وكيف نؤرخ التصحيح.",
      ogTitle: "Corrections policy",
    },
    fr: {
      title: "Politique de correction — traitement des erreurs",
      description: "Comment signaler une erreur, ce que nous faisons lorsqu’une donnée ou un calcul est faux, délais et datation des corrections.",
      ogTitle: "Corrections policy",
    },
    en: {
      title: "Corrections policy — how we handle mistakes",
      description: "How to report an error, what we do when data or a calculation is wrong, review timelines and how corrections are dated.",
      ogTitle: "Corrections policy",
    },
  },
  privacy: {
    ar: {
      title: "سياسة الخصوصية — بياناتك تبقى في متصفحك",
      description: "لا حساب ولا إرسال للنقاط. نتائج الحاسبات تُحفظ محليًا، ولا نستعمل إعلانات أو تحليلات قبل تفعيلها بموافقتك.",
      ogTitle: "Privacy policy",
    },
    fr: {
      title: "Confidentialité — vos données restent dans votre navigateur",
      description: "Pas de compte, pas d’envoi de notes. Les calculs sont stockés localement ; publicité et mesure d’audience ne sont activées qu’avec consentement.",
      ogTitle: "Privacy policy",
    },
    en: {
      title: "Privacy — your data stays in your browser",
      description: "No account, no grades sent anywhere. Calculations are stored locally; ads and analytics run only with consent.",
      ogTitle: "Privacy policy",
    },
  },
  terms: {
    ar: {
      title: "شروط الاستخدام",
      description: "شروط استعمال أدوات المنصة ومحتواها: الاستخدام الشخصي، حدود المسؤولية، والملكية الفكرية.",
      ogTitle: "Terms of use",
    },
    fr: {
      title: "Conditions d’utilisation",
      description: "Conditions d’usage des outils et contenus : usage personnel, limites de responsabilité et propriété intellectuelle.",
      ogTitle: "Terms of use",
    },
    en: {
      title: "Terms of use",
      description: "Conditions for using the platform’s tools and content: personal use, liability limits and intellectual property.",
      ogTitle: "Terms of use",
    },
  },
  contact: {
    ar: {
      title: "اتصل بنا — اقتراح، تصحيح، أو سؤال",
      description: "راسلنا للإبلاغ عن خطأ في بيانات أو حساب، أو لاقتراح محتوى. نستعمل بريدًا واحدًا ونرد حسب الأولوية.",
      ogTitle: "Contact",
    },
    fr: {
      title: "Contact — suggestion, correction ou question",
      description: "Écrivez-nous pour signaler une erreur de donnée ou de calcul, ou proposer un contenu. Une seule adresse, réponse par priorité.",
      ogTitle: "Contact",
    },
    en: {
      title: "Contact — suggestion, correction or question",
      description: "Write to us to report a data or calculation error, or to suggest content. One address; we answer by priority.",
      ogTitle: "Contact",
    },
  },
};

export function metaFor(locale: Locale, target: RouteTarget): PageMeta {
  switch (target.name) {
    case "stream": {
      const stream = streamById[target.stream as keyof typeof streamById];
      if (!stream) return staticMeta.home[locale];
      const label =
        locale === "ar" ? "المواد والمعاملات" : locale === "fr" ? "matières et coefficients" : "subjects and coefficients";
      return {
        title: `${stream.name[locale]} — ${label} | ${locale === "ar" ? "بكالوريا 2027" : locale === "fr" ? "bac 2027" : "bac 2027"}`,
        description: stream.summary[locale],
        ogTitle: `${stream.name.en} — bac stream`,
      };
    }
    case "examSubject": {
      const subject = subjectById[target.subject as keyof typeof subjectById];
      const stream = streamById[target.stream as keyof typeof streamById];
      if (!subject || !stream) return staticMeta.exams[locale];
      return {
        title:
          locale === "ar"
            ? `${subject.name.ar} — ${stream.name.ar}، دورة ${target.year}`
            : locale === "fr"
              ? `${subject.name.fr} — ${stream.name.fr}, session ${target.year}`
              : `${subject.name.en} — ${stream.name.en}, ${target.year}`,
        description:
          locale === "ar"
            ? `صفحة مرجعية لمادة ${subject.name.ar} في شعبة ${stream.name.ar} لدورة ${target.year}: المحاور، المنهجية، الأخطاء الشائعة، وحالة الوثيقة.`
            : locale === "fr"
              ? `Page de référence pour ${subject.name.fr} en filière ${stream.name.fr}, session ${target.year} : thèmes, méthode, erreurs fréquentes et statut du document.`
              : `Reference page for ${subject.name.en} in the ${stream.name.en} stream, ${target.year}: topics, method, common errors and document status.`,
        ogTitle: `${subject.name.en} — ${stream.name.en} ${target.year}`,
        type: "article",
        updated: "2026-11-15",
      };
    }
    case "guide": {
      const guide = getGuide(target.slug);
      if (!guide) return staticMeta.guides[locale];
      const content = guide.locales[locale];
      return {
        title: content.title,
        description: content.description,
        ogTitle: content.title.replace(/[^\x20-\x7E]/g, "").trim() || "Bac guide",
        type: "article",
        published: guide.published,
        updated: guide.updated,
      };
    }
    case "tool": {
      const tool = toolBySlug[target.tool as keyof typeof toolBySlug];
      if (!tool) return staticMeta.tools[locale];
      return {
        title: `${tool.title[locale]} — ${locale === "ar" ? "أداة مجانية" : locale === "fr" ? "outil gratuit" : "free tool"}`,
        description: tool.description[locale],
        ogTitle: tool.title.en,
      };
    }
    case "update": {
      const entry = updateBySlug[target.slug];
      if (!entry) return staticMeta.updates[locale];
      return {
        title: entry.title[locale],
        description: entry.summary[locale],
        ogTitle: entry.title.en,
        type: "article",
        published: entry.date,
        updated: entry.checkedOn,
      };
    }
    default:
      return { ...staticMeta[target.name][locale] };
  }
}

export function staticRouteNames() {
  return Object.keys(staticMeta) as Exclude<RouteTarget["name"], "stream" | "examSubject" | "guide" | "tool" | "update">[];
}
