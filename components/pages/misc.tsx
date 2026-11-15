import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { getDict } from "@/lib/i18n";
import { pathFor, type RouteTarget } from "@/lib/routes";
import { tx } from "@/lib/tx";
import type { Block } from "@/content/types";
import { absolute } from "@/lib/seo";
import { Badge, EmptyState, SectionHeader } from "@/components/ui";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Blocks } from "@/components/blocks";
import { JsonLd, webPageSchema } from "@/components/jsonld";
import { PageShell } from "./core";
import { IconArrow } from "@/components/icons";

const trustContent: Record<
  "about" | "editorial" | "corrections" | "privacy" | "terms" | "contact",
  Record<Locale, Block[]>
> = {
  about: {
    ar: [
      { type: "lead", text: "BAC DZ منصة جزائرية مستقلة لطلبة البكالوريا. الهدف بسيط: أدوات حساب دقيقة، ومعلومات موثّقة، وشرح واضح — دون وعود زائفة ودون بيانات مخترعة." },
      { type: "h2", text: "ما نقدّمه" },
      { type: "ul", items: ["حاسبة معدل تطبق قاعدة المعدل الموزون بالمعاملات المعمول بها.", "فهرس مواضيع البكالوريا مع حالة كل وثيقة ومصادرها الرسمية.", "أدوات مراجعة وتخطيط تعمل في المتصفح دون تسجيل.", "محاكي توجيه يقارن معدلك ببيانات رسمية منشورة، مع توضيح حدودها."] },
      { type: "h2", text: "ما لا نقدّمه" },
      { type: "ul", items: ["لا ننشر مواضيع أو تصحيحات لا يمكن التحقق من مصدرها.", "لا نعرض معدلات قبول غير منشورة رسميًا.", "لا نعطي تنبؤات بنتيجة أو بقبول جامعي."] },
      { type: "h2", text: "الاستقلال" },
      { type: "p", text: "الموقع غير تابع لوزارة التربية الوطنية ولا لوزارة التعليم العالي ولا للديوان الوطني للامتحانات والمسابقات. جميع الروابط الرسمية تُفتح في مصادرها الأصلية." },
      { type: "callout", tone: "official", title: "المصادر أولًا", text: "كل رقم حساس في المنصة (معامل، عتبة، تاريخ) يحمل مصدره وتاريخ آخر تحقق. وإذا تعارض مصدران، نذكر التعارض بدل اختيار الأنسب لنا." },
    ],
    fr: [
      { type: "lead", text: "BAC DZ est une plateforme algérienne indépendante pour les candidats au bac. L’objectif : des calculateurs exacts, des informations vérifiées et des explications claires — sans promesses ni données inventées." },
      { type: "h2", text: "Ce que nous proposons" },
      { type: "ul", items: ["Un calculateur appliquant la moyenne pondérée avec les coefficients en vigueur.", "Un index des sujets avec le statut de chaque document et ses sources officielles.", "Des outils de révision et de planification dans le navigateur, sans compte.", "Un simulateur d’orientation comparant votre moyenne à des données officielles publiées, avec ses limites."] },
      { type: "h2", text: "Ce que nous ne faisons pas" },
      { type: "ul", items: ["Publier des sujets ou corrigés dont la source n’est pas vérifiable.", "Afficher des seuils d’admission non publiés officiellement.", "Prédire une note ou une admission."] },
      { type: "h2", text: "Indépendance" },
      { type: "p", text: "Le site n’est affilié ni au ministère de l’Éducation nationale, ni au MESRS, ni à l’ONEC. Les liens officiels renvoient toujours à leur source d’origine." },
      { type: "callout", tone: "official", title: "Les sources d’abord", text: "Chaque donnée sensible (coefficient, seuil, date) porte sa source et sa date de vérification. En cas de sources divergentes, nous signalons la divergence." },
    ],
    en: [
      { type: "lead", text: "BAC DZ is an independent Algerian platform for bac candidates. The goal is simple: accurate calculators, verified information and clear explanations — no promises, no invented data." },
      { type: "h2", text: "What we offer" },
      { type: "ul", items: ["An average calculator applying the weighted-average rule with the coefficients in force.", "A paper index with each document’s status and official sources.", "Revision and planning tools that run in the browser, without an account.", "An orientation simulator comparing your average with published official data, with its limits stated."] },
      { type: "h2", text: "What we do not do" },
      { type: "ul", items: ["Publish papers or corrections whose source cannot be verified.", "Show admission thresholds that were not officially published.", "Predict a grade or an admission outcome."] },
      { type: "h2", text: "Independence" },
      { type: "p", text: "The site is not affiliated with the Ministry of National Education, the MESRS or ONEC. Official links always open at their original source." },
      { type: "callout", tone: "official", title: "Sources first", text: "Every sensitive figure (coefficient, threshold, date) carries its source and verification date. When sources diverge, we report the divergence." },
    ],
  },
  editorial: {
    ar: [
      { type: "lead", text: "السياسة التحريرية تحدد كيف نختار الصفحات، كيف نتحقق من الأرقام، وكيف نميّز بين ما هو رسمي وما هو شرح." },
      { type: "h2", text: "سلّم الأدلة" },
      { type: "steps", items: [
        { title: "مصدر رسمي", text: "قرار وزاري، جدول منشور، نص قانوني. يُعرض أولًا ويُسند إليه." },
        { title: "مصدر ثانوي موثوق", text: "نشر نص القرار أو جدول مع إشارة المصدر. يُستعمل عند تعذر الوصول إلى الموقع الرسمي، ويُذكر ذلك صراحة." },
        { title: "شرح تحريري", text: "منهجية، نصائح، مقارنات. لا يُقدَّم أبدًا كقاعدة رسمية." },
      ]},
      { type: "h2", text: "التحقق قبل النشر" },
      { type: "ul", items: ["كل رقم يُقارن بمصدره، وتُفحص اتساق المجاميع (مثل مجموع المعاملات).", "كل صفحة بيانات تحمل تاريخ آخر تحقق وتاريخ مراجعة قادمة.", "عند تعارض المصادر أو تعذر الوصول إليها، يُذكر ذلك في الصفحة نفسها.", "لا تُنشر صفحات «رفيعة» بغرض تحسين محركات البحث؛ الصفحة إما تجيب عن سؤال أو لا توجد."] },
      { type: "h2", text: "الترجمة" },
      { type: "p", text: "الصفحات متوفرة بالعربية والفرنسية والإنجليزية. المحتوى العربي هو المرجع التحريري، والنسخ الأخرى ترجمة له؛ تبقى الأرقام والمصادر متطابقة." },
      { type: "callout", tone: "warn", title: "ما لا نفعله", text: "لا نولّد صفحات آليًا لتغطية كل كلمة مفتاحية، ولا ننسخ محتوى مواقع أخرى، ولا ننسب إلى الوزارة ما لم تصرّح به." },
    ],
    fr: [
      { type: "lead", text: "La charte éditoriale définit comment nous choisissons les pages, vérifions les chiffres et distinguons l’officiel de l’explication." },
      { type: "h2", text: "Hiérarchie des sources" },
      { type: "steps", items: [
        { title: "Source officielle", text: "Décision ministérielle, tableau publié, texte réglementaire. Affichée en premier." },
        { title: "Source secondaire identifiée", text: "Republication d’un texte ou d’un tableau, source citée. Utilisée si le site officiel est inaccessible, et signalée." },
        { title: "Explication éditoriale", text: "Méthode, conseils, comparaisons. Jamais présentée comme une règle officielle." },
      ]},
      { type: "h2", text: "Vérification avant publication" },
      { type: "ul", items: ["Chaque chiffre est comparé à sa source, avec contrôle de cohérence des totaux (coefficients).", "Chaque page de données affiche sa date de vérification et une date de revue.", "En cas de sources divergentes ou inaccessibles, la page le dit.", "Aucune page « mince » pour le référencement : une page répond à une question ou n’existe pas."] },
      { type: "h2", text: "Traduction" },
      { type: "p", text: "Les pages existent en arabe, français et anglais. Le contenu arabe fait référence ; les autres versions en sont la traduction, avec des chiffres et sources identiques." },
      { type: "callout", tone: "warn", title: "Ce que nous ne faisons pas", text: "Pas de pages générées en masse pour couvrir des mots-clés, pas de copie de contenus tiers, pas d’attribution au ministère de propos qu’il n’a pas tenus." },
    ],
    en: [
      { type: "lead", text: "The editorial policy defines how we choose pages, verify figures and separate official information from explanation." },
      { type: "h2", text: "Evidence hierarchy" },
      { type: "steps", items: [
        { title: "Official source", text: "Ministerial decision, published table or legal text. Shown first and cited." },
        { title: "Identified secondary source", text: "Republication of a text or table with its source. Used when the official site is unreachable, and disclosed." },
        { title: "Editorial explanation", text: "Method, advice, comparisons. Never presented as an official rule." },
      ]},
      { type: "h2", text: "Verification before publication" },
      { type: "ul", items: ["Every figure is checked against its source, including total consistency (coefficients).", "Every data page shows its verification date and a review date.", "Diverging or unreachable sources are stated on the page.", "No thin pages for search engines: a page answers a question or does not exist."] },
      { type: "h2", text: "Translation" },
      { type: "p", text: "Pages exist in Arabic, French and English. Arabic is the editorial reference; the other versions are translations, with identical figures and sources." },
      { type: "callout", tone: "warn", title: "What we do not do", text: "No mass-generated pages to cover keywords, no copying of other sites, no attributing statements to the ministry that it did not make." },
    ],
  },
  corrections: {
    ar: [
      { type: "lead", text: "الأخطاء تحدث. المهم أن تُصحّح بسرعة، وأن يبقى أثر التصحيح ظاهرًا." },
      { type: "h2", text: "كيف تبلّغ" },
      { type: "ol", items: ["أرسل بريدًا إلى العنوان المذكور في صفحة الاتصال.", "اذكر رابط الصفحة، والجملة أو الرقم الخاطئ، والمصدر الذي تعتمد عليه.", "إن أمكن، أرفق رابط المصدر الرسمي وتاريخه."] },
      { type: "h2", text: "ما نفعله" },
      { type: "steps", items: [
        { title: "فحص أولي", text: "نتحقق من البلاغ ونقارنه بالمصدر خلال أيام عمل قليلة." },
        { title: "تصحيح أو توضيح", text: "إذا ثبت الخطأ، نصحح ونحدّث تاريخ الصفحة. وإذا كان البلاغ غير دقيق، نوضح ذلك في الرد." },
        { title: "تسجيل", text: "التصحيحات المؤثرة على بيانات تُسجّل في صفحة التحديثات بتاريخها." },
      ]},
      { type: "callout", tone: "info", title: "أولوية عالية", text: "أخطاء المعاملات، ومجاميع النقاط، والمعدلات الدنيا، وأي خطأ قد يضلل طالبًا في قراره — تُعالج أولًا." },
    ],
    fr: [
      { type: "lead", text: "Les erreurs arrivent. L’important est de les corriger vite, en gardant une trace datée." },
      { type: "h2", text: "Comment signaler" },
      { type: "ol", items: ["Écrivez à l’adresse indiquée sur la page contact.", "Indiquez l’URL, la phrase ou le chiffre erroné, et la source que vous utilisez.", "Si possible, joignez le lien officiel et sa date."] },
      { type: "h2", text: "Notre traitement" },
      { type: "steps", items: [
        { title: "Vérification", text: "Nous comparons le signalement à la source sous quelques jours ouvrés." },
        { title: "Correction ou explication", text: "Erreur confirmée : correction et date mise à jour. Signalement inexact : explication dans la réponse." },
        { title: "Journal", text: "Les corrections affectant des données sont consignées dans le journal des mises à jour." },
      ]},
      { type: "callout", tone: "info", title: "Priorité haute", text: "Coefficients, totaux de notes, minima d’admission et toute erreur pouvant induire un candidat en erreur sont traités en premier." },
    ],
    en: [
      { type: "lead", text: "Mistakes happen. What matters is correcting them quickly and keeping a dated record." },
      { type: "h2", text: "How to report" },
      { type: "ol", items: ["Email the address shown on the contact page.", "Include the page URL, the wrong sentence or figure, and the source you rely on.", "If possible, attach the official link and its date."] },
      { type: "h2", text: "What we do" },
      { type: "steps", items: [
        { title: "Check", text: "We compare the report with the source within a few working days." },
        { title: "Correct or explain", text: "Confirmed error: corrected, page date updated. Inaccurate report: explained in the reply." },
        { title: "Log", text: "Corrections affecting data are recorded in the update log with their date." },
      ]},
      { type: "callout", tone: "info", title: "High priority", text: "Coefficient errors, grade totals, admission minima and anything that could mislead a candidate are handled first." },
    ],
  },
  privacy: {
    ar: [
      { type: "lead", text: "لا حساب، ولا إرسال لنقاطك. الحاسبات تعمل في متصفحك، والحفظ محلي في جهازك." },
      { type: "h2", text: "ما يُخزَّن في متصفحك" },
      { type: "ul", items: ["المظهر (فاتح/داكن).", "نقاط الحاسبة إن اخترت حفظها.", "خطة المراجعة وتقدّمك.", "تفضيلات محلية أخرى لا تحتوي بيانات شخصية."] },
      { type: "p", text: "يمكنك مسح هذه البيانات من إعدادات المتصفح أو من زر التصفير داخل الأداة. لا نملك نسخة منها على أي خادم." },
      { type: "h2", text: "التحليلات والإعلانات" },
      { type: "p", text: "لا نحمّل حاليًا أي سكربت تحليلات أو إعلانات. إذا فُعّلت لاحقًا، فلن تُحمّل إلا عند إعداد معرّفاتها، وسنوضح ذلك في هذه الصفحة قبل التفعيل. لا نبيع بيانات شخصية." },
      { type: "h2", text: "الخادم والسجلات" },
      { type: "p", text: "الموقع يُستضاف على Vercel. قد تُسجّل منصة الاستضافة بيانات تقنية قياسية (عنوان IP، مسار الطلب) لأغراض التشغيل والأمان، وفق سياساتها." },
      { type: "h2", text: "التواصل" },
      { type: "p", text: "إذا راسلتنا بالبريد، نحتفظ بالرسالة فقط للرد ومعالجة الطلب. لا نضيفك إلى أي قائمة بريدية." },
    ],
    fr: [
      { type: "lead", text: "Pas de compte, pas d’envoi de notes. Les calculateurs fonctionnent dans votre navigateur et l’enregistrement est local." },
      { type: "h2", text: "Ce qui est stocké dans votre navigateur" },
      { type: "ul", items: ["Le thème (clair/sombre).", "Les notes du calculateur si vous choisissez de les conserver.", "Le planning de révision et votre progression.", "D’autres préférences locales sans données personnelles."] },
      { type: "p", text: "Vous pouvez effacer ces données depuis les réglages du navigateur ou le bouton de réinitialisation de l’outil. Nous n’en détenons aucune copie serveur." },
      { type: "h2", text: "Mesure d’audience et publicité" },
      { type: "p", text: "Aucun script d’analytics ou de publicité n’est chargé actuellement. S’ils sont activés plus tard, ils ne le seront qu’après configuration de leurs identifiants, et cette page sera mise à jour avant activation. Aucune donnée personnelle n’est vendue." },
      { type: "h2", text: "Serveur et journaux" },
      { type: "p", text: "Le site est hébergé sur Vercel. L’hébergeur peut enregistrer des données techniques standard (adresse IP, chemin de requête) pour l’exploitation et la sécurité, selon ses politiques." },
      { type: "h2", text: "Contact" },
      { type: "p", text: "Si vous nous écrivez, le message est conservé uniquement pour répondre et traiter la demande. Aucune inscription à une liste de diffusion." },
    ],
    en: [
      { type: "lead", text: "No account, no grades sent anywhere. Calculators run in your browser and saving is local." },
      { type: "h2", text: "What is stored in your browser" },
      { type: "ul", items: ["Theme (light/dark).", "Calculator grades if you choose to keep them.", "Your revision plan and progress.", "Other local preferences containing no personal data."] },
      { type: "p", text: "You can clear this from your browser settings or the tool’s reset button. We hold no server copy." },
      { type: "h2", text: "Analytics and advertising" },
      { type: "p", text: "No analytics or advertising script is currently loaded. If enabled later, they will load only after their identifiers are configured, and this page will be updated before activation. No personal data is sold." },
      { type: "h2", text: "Server and logs" },
      { type: "p", text: "The site is hosted on Vercel. The host may record standard technical data (IP address, request path) for operations and security, under its policies." },
      { type: "h2", text: "Contact" },
      { type: "p", text: "If you email us, the message is kept only to reply and handle the request. We do not add you to any mailing list." },
    ],
  },
  terms: {
    ar: [
      { type: "lead", text: "باستخدامك المنصة، فإنك تقبل الشروط أدناه. هي شروط استخدام موقع تعليمي مستقل، وليست عقدًا مع جهة رسمية." },
      { type: "h2", text: "طبيعة الخدمة" },
      { type: "p", text: "المنصة أداة تعليمية. الحسابات والسيناريوهات تقديرية، ولا تُعتبر نتيجة رسمية ولا ضمانًا للقبول الجامعي. المرجع دائمًا هو الجهات الرسمية." },
      { type: "h2", text: "الاستخدام المسموح" },
      { type: "ul", items: ["استخدام شخصي أو تعليمي.", "عدم محاولة تعطيل الموقع أو استخراج بياناته آليًا بشكل مكثف.", "عدم إعادة نشر المحتوى التحريري دون ذكر المصدر ورابط الصفحة."] },
      { type: "h2", text: "حدود المسؤولية" },
      { type: "p", text: "نبذل جهدًا معقولًا لضمان دقة المعلومات، لكننا لا نضمن خلوها من الأخطاء أو ملاءمتها لحالة فردية. القرارات المتعلقة بالتسجيل والامتحان تبقى مسؤولية المستخدم والجهات الرسمية." },
      { type: "h2", text: "الملكية الفكرية" },
      { type: "p", text: "المحتوى التحريري والتصميم مملوكان للمنصة. النصوص الرسمية تبقى ملكًا لجهاتها، وتُذكر كمصادر مع روابطها." },
    ],
    fr: [
      { type: "lead", text: "En utilisant la plateforme, vous acceptez les conditions ci-dessous. Il s’agit d’un site éducatif indépendant, pas d’un contrat avec une autorité officielle." },
      { type: "h2", text: "Nature du service" },
      { type: "p", text: "La plateforme est un outil pédagogique. Calculs et scénarios sont indicatifs et ne constituent ni un résultat officiel ni une garantie d’admission. Les autorités officielles font référence." },
      { type: "h2", text: "Usage autorisé" },
      { type: "ul", items: ["Usage personnel ou pédagogique.", "Ne pas perturber le site ni extraire massivement ses données.", "Ne pas republier le contenu éditorial sans citer la source et l’URL."] },
      { type: "h2", text: "Limites de responsabilité" },
      { type: "p", text: "Nous faisons un effort raisonnable de précision, sans garantir l’absence d’erreur ni l’adéquation à un cas particulier. Les décisions d’inscription et d’examen restent celles de l’utilisateur et des autorités." },
      { type: "h2", text: "Propriété intellectuelle" },
      { type: "p", text: "Le contenu éditorial et le design appartiennent à la plateforme. Les textes officiels restent la propriété de leurs institutions et sont cités comme sources." },
    ],
    en: [
      { type: "lead", text: "By using the platform you accept the terms below. This is an independent educational site, not a contract with an official authority." },
      { type: "h2", text: "Nature of the service" },
      { type: "p", text: "The platform is an educational tool. Calculations and scenarios are indicative and constitute neither an official result nor a guarantee of admission. Official authorities are the reference." },
      { type: "h2", text: "Permitted use" },
      { type: "ul", items: ["Personal or educational use.", "Do not disrupt the site or scrape it at scale.", "Do not republish editorial content without citing the source and URL."] },
      { type: "h2", text: "Liability limits" },
      { type: "p", text: "We make a reasonable effort for accuracy but do not guarantee the absence of errors or fitness for a particular case. Registration and exam decisions remain the user’s and the authorities’ responsibility." },
      { type: "h2", text: "Intellectual property" },
      { type: "p", text: "Editorial content and design belong to the platform. Official texts remain the property of their institutions and are cited as sources." },
    ],
  },
  contact: {
    ar: [
      { type: "lead", text: "للإبلاغ عن خطأ، أو اقتراح محتوى، أو سؤال حول المنهجية — استعمل البريد التالي." },
      { type: "h2", text: "قبل أن تراسلنا" },
      { type: "ul", items: ["إن كان البلاغ عن خطأ في بيانات، أرفق رابط المصدر الرسمي وتاريخه.", "إن كان السؤال عن معدل قبول، اذكر المؤسسة والتخصص والسنة.", "لا ترسل وثائق شخصية أو صور كشوف نقاط."] },
      { type: "h2", text: "مدة الرد" },
      { type: "p", text: "نرد على البلاغات المتعلقة بالبيانات أولًا. قد يتأخر الرد على الأسئلة العامة عند كثرة الرسائل، لكن كل بلاغ خطأ يُفحص." },
      { type: "callout", tone: "info", title: "ملاحظة", text: "لا نقدّم استشارة توجيه فردية، ولا نضمن القبول في أي مؤسسة. يمكنك استعمال محاكي التوجيه والروابط الرسمية." },
    ],
    fr: [
      { type: "lead", text: "Pour signaler une erreur, proposer un contenu ou poser une question de méthode, utilisez l’adresse ci-dessous." },
      { type: "h2", text: "Avant d’écrire" },
      { type: "ul", items: ["Erreur de donnée : joignez le lien officiel et sa date.", "Question sur un seuil : précisez l’établissement, la filière et l’année.", "N’envoyez pas de documents personnels ni de photos de relevés."] },
      { type: "h2", text: "Délai de réponse" },
      { type: "p", text: "Les signalements de données sont traités en priorité. Les questions générales peuvent attendre, mais chaque erreur signalée est vérifiée." },
      { type: "callout", tone: "info", title: "Remarque", text: "Nous ne fournissons pas de conseil d’orientation individuel et ne garantissons aucune admission. Utilisez le simulateur et les liens officiels." },
    ],
    en: [
      { type: "lead", text: "To report an error, suggest content or ask a methodology question, use the address below." },
      { type: "h2", text: "Before writing" },
      { type: "ul", items: ["Data error: include the official link and its date.", "Threshold question: name the institution, field and year.", "Do not send personal documents or photos of grade slips."] },
      { type: "h2", text: "Response time" },
      { type: "p", text: "Data reports are handled first. General questions may wait when volume is high, but every reported error is checked." },
      { type: "callout", tone: "info", title: "Note", text: "We do not provide individual orientation advice or guarantee admission. Use the simulator and official links." },
    ],
  },
};

export function TrustPage({
  locale,
  kind,
}: {
  locale: Locale;
  kind: "about" | "editorial" | "corrections" | "privacy" | "terms" | "contact";
}) {
  const dict = getDict(locale);
  const titles: Record<typeof kind, string> = {
    about: dict.trust.aboutTitle,
    editorial: dict.trust.editorialTitle,
    corrections: dict.trust.correctionsTitle,
    privacy: dict.trust.privacyTitle,
    terms: dict.trust.termsTitle,
    contact: dict.trust.contactTitle,
  };
  const blocks = trustContent[kind][locale];

  return (
    <>
      <PageShell>
        <Breadcrumbs locale={locale} items={[{ name: titles[kind], target: { name: kind } }]} label={dict.common.home} />
        <SectionHeader as="h1" eyebrow={tx(locale, { ar: "مصداقية", fr: "Fiabilité", en: "Trust" })} title={titles[kind]} />
        <div className="max-w-3xl">
          <Blocks blocks={blocks} locale={locale} />

          {kind === "contact" && (
            <div className="mt-8 rounded-card border border-line bg-surface p-5">
              <div className="text-[12px] uppercase tracking-wide text-muted">{dict.trust.contactTitle}</div>
              <a
                href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL || "contact@example.com"}`}
                className="link mt-1 inline-block text-lg font-medium"
              >
                {process.env.NEXT_PUBLIC_CONTACT_EMAIL || "contact@example.com"}
              </a>
              <p className="mt-2 text-[12px] leading-5 text-muted">
                {tx(locale, {
                  ar: "نستقبل العربية والفرنسية والإنجليزية.",
                  fr: "Nous lisons l’arabe, le français et l’anglais.",
                  en: "We read Arabic, French and English.",
                })}
              </p>
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-2">
            <Link href={pathFor(locale, { name: "editorial" })} className="btn btn-sm">
              {dict.trust.editorialTitle}
              <IconArrow size={14} />
            </Link>
            <Link href={pathFor(locale, { name: "corrections" })} className="btn btn-sm">
              {dict.trust.correctionsTitle}
            </Link>
          </div>
        </div>
      </PageShell>

      <JsonLd
        data={webPageSchema({
          locale,
          url: absolute(pathFor(locale, { name: kind })),
          name: titles[kind],
          description: dict.footer.sourcePolicy,
          type: kind === "about" ? "AboutPage" : "WebPage",
        })}
      />
    </>
  );
}

export function NotFoundPage({ locale }: { locale: Locale }) {
  const dict = getDict(locale);
  return (
    <PageShell className="py-20">
      <div className="mx-auto max-w-lg text-center">
        <div className="num font-display text-6xl font-semibold text-brand/30">404</div>
        <h1 className="mt-3 font-display text-2xl font-semibold text-ink">{dict.common.notFound}</h1>
        <p className="mt-2 text-[13.5px] leading-7 text-muted">{dict.common.notFoundText}</p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Link href={pathFor(locale, { name: "home" })} className="btn btn-primary">
            {dict.common.backHome}
          </Link>
          <Link href={pathFor(locale, { name: "search" })} className="btn">
            {dict.actions.search}
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
