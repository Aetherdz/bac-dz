export const locales = ["ar", "fr", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ar";

export const localeMeta: Record<Locale, { label: string; short: string; dir: "rtl" | "ltr"; htmlLang: string; intl: string }> = {
  ar: { label: "العربية", short: "ع", dir: "rtl", htmlLang: "ar-DZ", intl: "ar-DZ" },
  fr: { label: "Français", short: "FR", dir: "ltr", htmlLang: "fr-DZ", intl: "fr-DZ" },
  en: { label: "English", short: "EN", dir: "ltr", htmlLang: "en", intl: "en-DZ" },
};

export function isLocale(value: string | undefined): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}

type Dict = {
  nav: { home: string; calculator: string; coefficients: string; exams: string; streams: string; guides: string; orientation: string; tools: string; planner: string; study: string; updates: string };
  actions: { calculate: string; reset: string; share: string; copy: string; copied: string; print: string; download: string; save: string; saved: string; clear: string; next: string; back: string; compare: string; addSubject: string; remove: string; search: string; filter: string; all: string };
  common: {
    skipToContent: string;
    lastVerified: string;
    updated: string;
    published: string;
    source: string;
    sources: string;
    official: string;
    editorial: string;
    estimated: string;
    disclaimer: string;
    readMore: string;
    related: string;
    breadcrumb: string;
    language: string;
    theme: string;
    light: string;
    dark: string;
    loading: string;
    noResults: string;
    noResultsHint: string;
    results: string;
    outOf20: string;
    coefficient: string;
    total: string;
    subject: string;
    stream: string;
    year: string;
    grade: string;
    minutes: string;
    hours: string;
    optional: string;
    required: string;
    yes: string;
    no: string;
    open: string;
    close: string;
    page: string;
    of: string;
    home: string;
    notFound: string;
    notFoundText: string;
    backHome: string;
    errorTitle: string;
    errorText: string;
  };
  footer: {
    tagline: string;
    learn: string;
    tools: string;
    trust: string;
    legal: string;
    rights: string;
    independent: string;
    sourcePolicy: string;
  };
  home: {
    kicker: string;
    title: string;
    subtitle: string;
    searchLabel: string;
    searchPlaceholder: string;
    primaryCta: string;
    secondaryCta: string;
    statsStudents: string;
    statsStreams: string;
    statsSubjects: string;
    statsTools: string;
    quickCalc: string;
    quickCalcHint: string;
    sessionStatus: string;
    latestExams: string;
    popularStreams: string;
    toolsTitle: string;
    orientationTitle: string;
    orientationText: string;
    guidesTitle: string;
    updatesTitle: string;
    trustTitle: string;
  };
  calculator: {
    title: string;
    intro: string;
    chooseStream: string;
    enterGrades: string;
    hint: string;
    result: string;
    formula: string;
    emptySubject: string;
    invalid: string;
    scenario: string;
    scenarioHint: string;
    target: string;
    needed: string;
    neededImpossible: string;
    neededDone: string;
    savedLocal: string;
    shareCopied: string;
    breakdown: string;
    contribution: string;
    pass: string;
    fail: string;
    excluded: string;
    includePe: string;
    method: string;
    streamChanged: string;
  };
  exams: {
    title: string;
    intro: string;
    yearLabel: string;
    streamLabel: string;
    subjectLabel: string;
    typeLabel: string;
    papers: string;
    corrections: string;
    notHosted: string;
    notHostedText: string;
    officialSource: string;
    archiveNotice: string;
    sessionYear: string;
    documents: string;
    structure: string;
    noDocuments: string;
    filterHint: string;
    clearFilters: string;
  };
  orientation: {
    title: string;
    intro: string;
    yourStream: string;
    yourAverage: string;
    yearLabel: string;
    check: string;
    eligible: string;
    notEligible: string;
    unknown: string;
    thresholdNote: string;
    resultTitle: string;
    resultEmpty: string;
    fieldsTitle: string;
    compareTitle: string;
    enterThreshold: string;
    verdictAbove: string;
    verdictBelow: string;
    historical: string;
    officialLinks: string;
    noThresholdData: string;
    youNeed: string;
    difference: string;
    prerequisite: string;
    explanation: string;
    simulateTitle: string;
    simulateHint: string;
  };
  tools: {
    title: string;
    intro: string;
    countdown: string;
    weighted: string;
    studyTime: string;
    timetable: string;
    score: string;
    improvement: string;
    finder: string;
    scientific: string;
    planner: string;
  };
  planner: {
    title: string;
    intro: string;
    setup: string;
    weeks: string;
    hoursPerWeek: string;
    generate: string;
    schedule: string;
    progress: string;
    focus: string;
    exportIcs: string;
    savedNote: string;
    day: string;
    complete: string;
    resetPlan: string;
    examDate: string;
  };
  trust: {
    aboutTitle: string;
    editorialTitle: string;
    correctionsTitle: string;
    privacyTitle: string;
    termsTitle: string;
    contactTitle: string;
  };
};

const ar: Dict = {
  nav: {
    home: "الرئيسية",
    calculator: "حاسبة المعدل",
    coefficients: "المعاملات",
    exams: "مواضيع البكالوريا",
    streams: "الشعب",
    guides: "دليل المراجعة",
    orientation: "التوجيه الجامعي",
    tools: "الأدوات",
    planner: "مخطط المراجعة",
    study: "فضاء المراجعة",
    updates: "التحديثات",
  },
  actions: {
    calculate: "احسب المعدل",
    reset: "تصفير",
    share: "مشاركة النتيجة",
    copy: "نسخ",
    copied: "تم النسخ",
    print: "طباعة",
    download: "تحميل",
    save: "حفظ",
    saved: "تم الحفظ",
    clear: "مسح",
    next: "التالي",
    back: "السابق",
    compare: "قارن",
    addSubject: "إضافة مادة",
    remove: "إزالة",
    search: "بحث",
    filter: "تصفية",
    all: "الكل",
  },
  common: {
    skipToContent: "تجاوز إلى المحتوى",
    lastVerified: "آخر تحقق",
    updated: "آخر تحديث",
    published: "تاريخ النشر",
    source: "المصدر",
    sources: "المصادر",
    official: "رسمي",
    editorial: "شرح تحريري",
    estimated: "تقديري",
    disclaimer: "تنبيه",
    readMore: "اقرأ المزيد",
    related: "محتوى ذو صلة",
    breadcrumb: "مسار التنقل",
    language: "اللغة",
    theme: "المظهر",
    light: "فاتح",
    dark: "داكن",
    loading: "جارٍ التحميل…",
    noResults: "لا توجد نتائج مطابقة",
    noResultsHint: "جرّب تعديل كلمات البحث أو إزالة بعض عوامل التصفية.",
    results: "نتيجة",
    outOf20: "من 20",
    coefficient: "المعامل",
    total: "المجموع",
    subject: "المادة",
    stream: "الشعبة",
    year: "السنة",
    grade: "النقطة",
    minutes: "دقيقة",
    hours: "ساعة",
    optional: "اختياري",
    required: "إلزامي",
    yes: "نعم",
    no: "لا",
    open: "فتح",
    close: "إغلاق",
    page: "صفحة",
    of: "من",
    home: "الرئيسية",
    notFound: "الصفحة غير موجودة",
    notFoundText: "الرابط الذي طلبته غير متوفر أو تم تغييره. يمكنك العودة إلى الصفحة الرئيسية أو استعمال البحث.",
    backHome: "العودة إلى الرئيسية",
    errorTitle: "حدث خطأ غير متوقع",
    errorText: "يمكنك إعادة تحميل الصفحة أو العودة إلى الرئيسية.",
  },
  footer: {
    tagline: "منصة جزائرية مستقلة لطلبة البكالوريا: أدوات حساب دقيقة، أرشيف امتحانات موثّق، ومراجعة مبنية على المنهاج الرسمي.",
    learn: "التعلّم",
    tools: "الأدوات",
    trust: "المصداقية",
    legal: "قانوني",
    rights: "جميع الحقوق محفوظة.",
    independent: "موقع مستقل غير تابع لوزارة التربية الوطنية.",
    sourcePolicy: "نُميّز بوضوح بين المعلومة الرسمية والشرح التحريري، ونذكر مصدر كل معطى حساس.",
  },
  home: {
    kicker: "بكالوريا الجزائر · دورة 2027",
    title: "كل ما تحتاجه للبكالوريا، في مكان واحد واضح.",
    subtitle: "احسب معدلك بالمعاملات المعتمدة، راجع بخطة واقعية، واطّلع على أرشيف المواضيع والتوجيه الجامعي — بمعلومات موثّقة ومصادر ظاهرة.",
    searchLabel: "ابحث في المنصة",
    searchPlaceholder: "مثال: معاملات علوم تجريبية، الرياضيات، معدل القبول…",
    primaryCta: "احسب معدلك الآن",
    secondaryCta: "استكشف المواضيع",
    statsStudents: "مترشح للبكالوريا سنويًا",
    statsStreams: "شعب رسمية",
    statsSubjects: "مادة دراسية",
    statsTools: "أداة مجانية",
    quickCalc: "حاسبة سريعة",
    quickCalcHint: "اختر الشعبة، أدخل نقاطك، واحصل على المعدل فورًا مع تفصيل مساهمة كل مادة.",
    sessionStatus: "حالة المعاملات",
    latestExams: "أحدث المواضيع",
    popularStreams: "الشعب الأكثر بحثًا",
    toolsTitle: "أدوات عملية",
    orientationTitle: "التوجيه الجامعي",
    orientationText: "قارن معدلك بمعدلات القبول المنشورة، واعرف الشروط الحقيقية لكل ميدان — دون وعود زائفة.",
    guidesTitle: "أدلة المراجعة",
    updatesTitle: "آخر التحديثات الموثّقة",
    trustTitle: "لماذا تثق بنا",
  },
  calculator: {
    title: "حاسبة معدل البكالوريا",
    intro: "احسب معدل شهادة البكالوريا بالمعاملات المعتمدة لكل شعبة، مع تفصيل مساهمة كل مادة وخطوات الحساب.",
    chooseStream: "اختر الشعبة",
    enterGrades: "أدخل نقاطك",
    hint: "اترك المادة فارغة إذا لم تكن لديك نقطة فيها بعد؛ لن تُحتسب في المعدل.",
    result: "المعدل النهائي",
    formula: "طريقة الحساب",
    emptySubject: "بدون نقطة",
    invalid: "أدخل نقطة بين 0 و20",
    scenario: "سيناريو: كم أحتاج في مادة معينة؟",
    scenarioHint: "اختر مادة ونقطة مستهدفة لمعرفة العلامة اللازمة في تلك المادة للوصول إلى المعدل المطلوب.",
    target: "المعدل المستهدف",
    needed: "العلامة اللازمة",
    neededImpossible: "غير ممكن بهذه المعطيات (تتجاوز 20 أو أقل من 0).",
    neededDone: "تحقّق الهدف أصلًا بهذه النقاط.",
    savedLocal: "تُحفظ نقاطك في متصفحك فقط، ولا تُرسل إلى أي خادم.",
    shareCopied: "تم نسخ رابط النتيجة.",
    breakdown: "تفصيل الحساب",
    contribution: "المساهمة في المعدل",
    pass: "ناجح",
    fail: "أقل من عتبة النجاح",
    excluded: "غير محتسبة",
    includePe: "احتساب التربية البدنية",
    method: "القاعدة المعتمدة",
    streamChanged: "تم تحديث قائمة المواد حسب الشعبة.",
  },
  exams: {
    title: "أرشيف مواضيع البكالوريا",
    intro: "فهرس منظّم للمواضيع الرسمية حسب السنة والشعبة والمادة، مع روابط المصدر الرسمي وحالة كل وثيقة.",
    yearLabel: "السنة",
    streamLabel: "الشعبة",
    subjectLabel: "المادة",
    typeLabel: "نوع الوثيقة",
    papers: "الموضوع",
    corrections: "التصحيح",
    notHosted: "غير مستضاف بعد",
    notHostedText: "لا نستضيف ملفات لا نملك حق نشرها أو لم نتحقق منها. ستجد في كل صفحة رابط المصدر الرسمي.",
    officialSource: "المصدر الرسمي",
    archiveNotice: "هذا الأرشيف فهرس تحريري. لا ننشر أي موضوع أو تصحيح لم نتحقق من صحته ومصدره.",
    sessionYear: "دورة",
    documents: "الوثائق",
    structure: "بنية الامتحان",
    noDocuments: "لا توجد وثائق منشورة لهذه المادة بعد.",
    filterHint: "استعمل عوامل التصفية للوصول إلى الموضوع المطلوب.",
    clearFilters: "إزالة التصفية",
  },
  orientation: {
    title: "محاكي التوجيه الجامعي",
    intro: "أداة للمقارنة والاستكشاف، وليست جهة قبول. معدلات القبول تتغير كل سنة، والقرار النهائي يعود للجهات الرسمية.",
    yourStream: "شعبتك",
    yourAverage: "معدلك",
    yearLabel: "السنة الجامعية",
    check: "تحقّق من الشروط",
    eligible: "شعبتك مقبولة مبدئيًا",
    notEligible: "شعبتك غير مؤهلة لهذا الميدان",
    unknown: "غير محدد",
    thresholdNote: "معدل القبول المنشور في السنة الماضية ليس ضمانًا للسنة القادمة.",
    resultTitle: "الميادين المتاحة لشعبتك",
    resultEmpty: "أدخل شعبتك ومعدلك لعرض الميادين.",
    fieldsTitle: "الميادين",
    compareTitle: "قارن معدلك بمعدل منشور",
    enterThreshold: "أدخل معدل القبول المنشور",
    verdictAbove: "معدلك أعلى من العتبة المدخلة",
    verdictBelow: "معدلك أقل من العتبة المدخلة",
    historical: "بيانات تاريخية",
    officialLinks: "الروابط الرسمية",
    noThresholdData: "لم نُدرج معدلات قبول رقمية لأننا لم نتحقق منها من مصدر رسمي. يمكنك إدخال العتبة المنشورة في دليل التوجيه ومقارنتها بمعدلك.",
    youNeed: "تحتاج",
    difference: "الفارق",
    prerequisite: "الشروط",
    explanation: "كيف يعمل التوجيه",
    simulateTitle: "محاكاة",
    simulateHint: "هذه المحاكاة تعليمية فقط ولا تعني ضمان القبول.",
  },
  tools: {
    title: "أدوات الطالب",
    intro: "أدوات مجانية تعمل داخل متصفحك، بدون تسجيل ودون إرسال نقاطك إلى أي خادم.",
    countdown: "عدّاد البكالوريا",
    weighted: "حاسبة المعدل الموزون",
    studyTime: "حاسبة وقت المراجعة",
    timetable: "مولّد جدول المراجعة",
    score: "محاكي نقاط الامتحان",
    improvement: "حاسبة تحسين المعدل",
    finder: "دليل المواضيع",
    scientific: "الآلة الحاسبة العلمية",
    planner: "مخطط المراجعة",
  },
  planner: {
    title: "مخطط المراجعة",
    intro: "أنشئ جدول مراجعة أسبوعيًا حسب شعبتك ووقتك المتاح، وتابع تقدّمك مادة بمادة. يُحفظ كل شيء في متصفحك.",
    setup: "الإعداد",
    weeks: "عدد الأسابيع",
    hoursPerWeek: "ساعات المراجعة في الأسبوع",
    generate: "أنشئ الجدول",
    schedule: "الجدول الأسبوعي",
    progress: "التقدّم",
    focus: "المواد ذات المعامل الأعلى تُمنح وقتًا أكبر تلقائيًا.",
    exportIcs: "تصدير إلى التقويم (ICS)",
    savedNote: "يُحفظ المخطط محليًا في متصفحك.",
    day: "اليوم",
    complete: "إتمام",
    resetPlan: "إعادة تعيين",
    examDate: "تاريخ الامتحان",
  },
  trust: {
    aboutTitle: "عن المنصة",
    editorialTitle: "السياسة التحريرية",
    correctionsTitle: "سياسة التصحيح",
    privacyTitle: "سياسة الخصوصية",
    termsTitle: "شروط الاستخدام",
    contactTitle: "اتصل بنا",
  },
};

const fr: Dict = {
  nav: {
    home: "Accueil",
    calculator: "Calculateur",
    coefficients: "Coefficients",
    exams: "Sujets du bac",
    streams: "Filières",
    guides: "Guides de révision",
    orientation: "Orientation",
    tools: "Outils",
    planner: "Planificateur",
    study: "Espace d’étude",
    updates: "Actualités",
  },
  actions: {
    calculate: "Calculer la moyenne",
    reset: "Réinitialiser",
    share: "Partager le résultat",
    copy: "Copier",
    copied: "Copié",
    print: "Imprimer",
    download: "Télécharger",
    save: "Enregistrer",
    saved: "Enregistré",
    clear: "Effacer",
    next: "Suivant",
    back: "Précédent",
    compare: "Comparer",
    addSubject: "Ajouter une matière",
    remove: "Retirer",
    search: "Rechercher",
    filter: "Filtrer",
    all: "Tout",
  },
  common: {
    skipToContent: "Aller au contenu",
    lastVerified: "Dernière vérification",
    updated: "Mis à jour",
    published: "Publié",
    source: "Source",
    sources: "Sources",
    official: "Officiel",
    editorial: "Explication éditoriale",
    estimated: "Estimatif",
    disclaimer: "Avertissement",
    readMore: "Lire la suite",
    related: "À lire aussi",
    breadcrumb: "Fil d’Ariane",
    language: "Langue",
    theme: "Thème",
    light: "Clair",
    dark: "Sombre",
    loading: "Chargement…",
    noResults: "Aucun résultat",
    noResultsHint: "Modifiez votre recherche ou retirez certains filtres.",
    results: "résultat(s)",
    outOf20: "sur 20",
    coefficient: "Coefficient",
    total: "Total",
    subject: "Matière",
    stream: "Filière",
    year: "Année",
    grade: "Note",
    minutes: "min",
    hours: "h",
    optional: "Facultatif",
    required: "Obligatoire",
    yes: "Oui",
    no: "Non",
    open: "Ouvrir",
    close: "Fermer",
    page: "Page",
    of: "sur",
    home: "Accueil",
    notFound: "Page introuvable",
    notFoundText: "Le lien demandé n’existe pas ou a changé. Revenez à l’accueil ou utilisez la recherche.",
    backHome: "Retour à l’accueil",
    errorTitle: "Une erreur est survenue",
    errorText: "Rechargez la page ou revenez à l’accueil.",
  },
  footer: {
    tagline: "Plateforme algérienne indépendante pour les candidats au bac : calculateurs fiables, archive documentée et révisions fondées sur le programme officiel.",
    learn: "Apprendre",
    tools: "Outils",
    trust: "Fiabilité",
    legal: "Légal",
    rights: "Tous droits réservés.",
    independent: "Site indépendant, non affilié au ministère de l’Éducation nationale.",
    sourcePolicy: "Nous distinguons clairement l’information officielle de l’explication éditoriale et citons la source de chaque donnée sensible.",
  },
  home: {
    kicker: "Bac Algérie · Session 2027",
    title: "Tout le bac, au même endroit — clairement.",
    subtitle: "Calculez votre moyenne avec les coefficients en vigueur, révisez avec un plan réaliste et consultez les sujets et l’orientation — avec des sources visibles.",
    searchLabel: "Rechercher sur le site",
    searchPlaceholder: "Ex. : coefficients sciences expérimentales, moyenne d’admission…",
    primaryCta: "Calculer ma moyenne",
    secondaryCta: "Voir les sujets",
    statsStudents: "candidats par an",
    statsStreams: "filières officielles",
    statsSubjects: "matières",
    statsTools: "outils gratuits",
    quickCalc: "Calcul rapide",
    quickCalcHint: "Choisissez votre filière, saisissez vos notes et obtenez la moyenne avec le détail par matière.",
    sessionStatus: "Statut des coefficients",
    latestExams: "Sujets récents",
    popularStreams: "Filières les plus consultées",
    toolsTitle: "Outils pratiques",
    orientationTitle: "Orientation universitaire",
    orientationText: "Comparez votre moyenne aux seuils publiés et comprenez les conditions réelles de chaque domaine — sans fausses promesses.",
    guidesTitle: "Guides de révision",
    updatesTitle: "Dernières mises à jour vérifiées",
    trustTitle: "Pourquoi nous faire confiance",
  },
  calculator: {
    title: "Calculateur de moyenne du bac",
    intro: "Calculez votre moyenne avec les coefficients en vigueur, avec le détail de la contribution de chaque matière et la formule appliquée.",
    chooseStream: "Choisissez votre filière",
    enterGrades: "Saisissez vos notes",
    hint: "Laissez vide une matière sans note : elle sera ignorée dans le calcul.",
    result: "Moyenne finale",
    formula: "Méthode de calcul",
    emptySubject: "Sans note",
    invalid: "Saisissez une note entre 0 et 20",
    scenario: "Scénario : quelle note me faut-il ?",
    scenarioHint: "Choisissez une matière et une moyenne visée pour connaître la note nécessaire.",
    target: "Moyenne visée",
    needed: "Note nécessaire",
    neededImpossible: "Impossible avec ces données (au-delà de 20 ou sous 0).",
    neededDone: "Objectif déjà atteint avec ces notes.",
    savedLocal: "Vos notes restent dans votre navigateur ; elles ne sont envoyées à aucun serveur.",
    shareCopied: "Lien du résultat copié.",
    breakdown: "Détail du calcul",
    contribution: "Contribution",
    pass: "Admis",
    fail: "Sous le seuil de 10/20",
    excluded: "Non comptée",
    includePe: "Compter l’EPS",
    method: "Règle appliquée",
    streamChanged: "Matières mises à jour selon la filière.",
  },
  exams: {
    title: "Archive des sujets du bac",
    intro: "Index organisé des sujets officiels par année, filière et matière, avec lien vers la source officielle et statut de chaque document.",
    yearLabel: "Année",
    streamLabel: "Filière",
    subjectLabel: "Matière",
    typeLabel: "Type de document",
    papers: "Sujet",
    corrections: "Corrigé",
    notHosted: "Non hébergé",
    notHostedText: "Nous n’hébergeons pas de fichiers dont nous ne détenons pas les droits ou que nous n’avons pas vérifiés. Chaque page renvoie à la source officielle.",
    officialSource: "Source officielle",
    archiveNotice: "Cette archive est un index éditorial. Nous ne publions aucun sujet ni corrigé non vérifié.",
    sessionYear: "Session",
    documents: "Documents",
    structure: "Structure de l’épreuve",
    noDocuments: "Aucun document publié pour cette matière.",
    filterHint: "Utilisez les filtres pour trouver le sujet.",
    clearFilters: "Effacer les filtres",
  },
  orientation: {
    title: "Simulateur d’orientation universitaire",
    intro: "Un outil de comparaison et d’exploration, pas une instance d’admission. Les seuils changent chaque année ; la décision finale appartient aux autorités officielles.",
    yourStream: "Votre filière",
    yourAverage: "Votre moyenne",
    yearLabel: "Année universitaire",
    check: "Vérifier les conditions",
    eligible: "Filière a priori éligible",
    notEligible: "Filière non éligible pour votre filière",
    unknown: "Non déterminé",
    thresholdNote: "Un seuil publié l’an dernier ne garantit rien pour l’année suivante.",
    resultTitle: "Domaines ouverts à votre filière",
    resultEmpty: "Saisissez votre filière et votre moyenne.",
    fieldsTitle: "Domaines",
    compareTitle: "Comparer à un seuil publié",
    enterThreshold: "Seuil d’admission publié",
    verdictAbove: "Votre moyenne dépasse le seuil saisi",
    verdictBelow: "Votre moyenne est sous le seuil saisi",
    historical: "Données historiques",
    officialLinks: "Liens officiels",
    noThresholdData: "Nous n’affichons pas de seuils chiffrés faute de source officielle vérifiée. Saisissez le seuil publié dans le guide d’orientation pour le comparer.",
    youNeed: "Il vous manque",
    difference: "Écart",
    prerequisite: "Conditions",
    explanation: "Comment fonctionne l’orientation",
    simulateTitle: "Simulation",
    simulateHint: "Simulation pédagogique, sans garantie d’admission.",
  },
  tools: {
    title: "Outils de l’élève",
    intro: "Des outils gratuits qui fonctionnent dans votre navigateur, sans inscription et sans envoyer vos notes.",
    countdown: "Compte à rebours du bac",
    weighted: "Moyenne pondérée",
    studyTime: "Temps de révision",
    timetable: "Générateur d’emploi du temps",
    score: "Simulateur de notes",
    improvement: "Gain de moyenne",
    finder: "Trouver un sujet",
    scientific: "Calculatrice scientifique",
    planner: "Planificateur",
  },
  planner: {
    title: "Planificateur de révision",
    intro: "Créez un planning hebdomadaire selon votre filière et votre temps disponible, puis suivez votre progression. Tout reste dans votre navigateur.",
    setup: "Paramètres",
    weeks: "Nombre de semaines",
    hoursPerWeek: "Heures de révision par semaine",
    generate: "Générer le planning",
    schedule: "Planning hebdomadaire",
    progress: "Progression",
    focus: "Les matières à fort coefficient reçoivent automatiquement plus de temps.",
    exportIcs: "Exporter vers l’agenda (ICS)",
    savedNote: "Le plan est enregistré localement.",
    day: "Jour",
    complete: "Terminer",
    resetPlan: "Réinitialiser",
    examDate: "Date de l’examen",
  },
  trust: {
    aboutTitle: "À propos",
    editorialTitle: "Charte éditoriale",
    correctionsTitle: "Politique de correction",
    privacyTitle: "Confidentialité",
    termsTitle: "Conditions d’utilisation",
    contactTitle: "Contact",
  },
};

const en: Dict = {
  nav: {
    home: "Home",
    calculator: "Grade calculator",
    coefficients: "Coefficients",
    exams: "Bac papers",
    streams: "Streams",
    guides: "Revision guides",
    orientation: "Orientation",
    tools: "Tools",
    planner: "Planner",
    study: "Study space",
    updates: "Updates",
  },
  actions: {
    calculate: "Calculate",
    reset: "Reset",
    share: "Share result",
    copy: "Copy",
    copied: "Copied",
    print: "Print",
    download: "Download",
    save: "Save",
    saved: "Saved",
    clear: "Clear",
    next: "Next",
    back: "Back",
    compare: "Compare",
    addSubject: "Add subject",
    remove: "Remove",
    search: "Search",
    filter: "Filter",
    all: "All",
  },
  common: {
    skipToContent: "Skip to content",
    lastVerified: "Last verified",
    updated: "Updated",
    published: "Published",
    source: "Source",
    sources: "Sources",
    official: "Official",
    editorial: "Editorial explanation",
    estimated: "Estimated",
    disclaimer: "Note",
    readMore: "Read more",
    related: "Related",
    breadcrumb: "Breadcrumb",
    language: "Language",
    theme: "Theme",
    light: "Light",
    dark: "Dark",
    loading: "Loading…",
    noResults: "No matching results",
    noResultsHint: "Try different search terms or remove some filters.",
    results: "result(s)",
    outOf20: "out of 20",
    coefficient: "Coefficient",
    total: "Total",
    subject: "Subject",
    stream: "Stream",
    year: "Year",
    grade: "Grade",
    minutes: "min",
    hours: "h",
    optional: "Optional",
    required: "Required",
    yes: "Yes",
    no: "No",
    open: "Open",
    close: "Close",
    page: "Page",
    of: "of",
    home: "Home",
    notFound: "Page not found",
    notFoundText: "The link you requested is unavailable or has changed. Return home or use search.",
    backHome: "Back to home",
    errorTitle: "Something went wrong",
    errorText: "Reload the page or return home.",
  },
  footer: {
    tagline: "Independent Algerian platform for bac candidates: reliable calculators, a documented archive and revision based on the official curriculum.",
    learn: "Learn",
    tools: "Tools",
    trust: "Trust",
    legal: "Legal",
    rights: "All rights reserved.",
    independent: "Independent site, not affiliated with the Ministry of National Education.",
    sourcePolicy: "We clearly separate official information from editorial explanation and cite the source of every sensitive data point.",
  },
  home: {
    kicker: "Algerian Bac · 2027 session",
    title: "Everything for the bac, in one clear place.",
    subtitle: "Compute your average with the coefficients in force, revise with a realistic plan, and browse past papers and orientation — with visible sources.",
    searchLabel: "Search the site",
    searchPlaceholder: "e.g. experimental sciences coefficients, admission average…",
    primaryCta: "Calculate my average",
    secondaryCta: "Browse papers",
    statsStudents: "candidates per year",
    statsStreams: "official streams",
    statsSubjects: "subjects",
    statsTools: "free tools",
    quickCalc: "Quick calculator",
    quickCalcHint: "Pick your stream, enter your grades and get the average with a per-subject breakdown.",
    sessionStatus: "Coefficient status",
    latestExams: "Recent papers",
    popularStreams: "Most consulted streams",
    toolsTitle: "Practical tools",
    orientationTitle: "University orientation",
    orientationText: "Compare your average with published thresholds and understand each field’s real requirements — without false promises.",
    guidesTitle: "Revision guides",
    updatesTitle: "Latest verified updates",
    trustTitle: "Why trust us",
  },
  calculator: {
    title: "Bac average calculator",
    intro: "Compute your average with the coefficients in force, including each subject’s contribution and the formula applied.",
    chooseStream: "Choose your stream",
    enterGrades: "Enter your grades",
    hint: "Leave a subject blank if you have no grade yet; it will be excluded.",
    result: "Final average",
    formula: "Calculation method",
    emptySubject: "No grade",
    invalid: "Enter a grade between 0 and 20",
    scenario: "Scenario: what grade do I need?",
    scenarioHint: "Pick a subject and a target average to see the grade required in that subject.",
    target: "Target average",
    needed: "Required grade",
    neededImpossible: "Not possible with these inputs (above 20 or below 0).",
    neededDone: "Target already reached with these grades.",
    savedLocal: "Your grades stay in your browser and are never sent to a server.",
    shareCopied: "Result link copied.",
    breakdown: "Calculation detail",
    contribution: "Contribution",
    pass: "Pass",
    fail: "Below the 10/20 threshold",
    excluded: "Not counted",
    includePe: "Include PE",
    method: "Rule applied",
    streamChanged: "Subjects updated for the selected stream.",
  },
  exams: {
    title: "Bac paper archive",
    intro: "A structured index of official papers by year, stream and subject, with the official source link and each document’s status.",
    yearLabel: "Year",
    streamLabel: "Stream",
    subjectLabel: "Subject",
    typeLabel: "Document type",
    papers: "Paper",
    corrections: "Correction",
    notHosted: "Not hosted",
    notHostedText: "We do not host files we have no right to publish or have not verified. Every page links to the official source.",
    officialSource: "Official source",
    archiveNotice: "This archive is an editorial index. We publish no unverified paper or correction.",
    sessionYear: "Session",
    documents: "Documents",
    structure: "Exam structure",
    noDocuments: "No published document for this subject yet.",
    filterHint: "Use the filters to find the paper.",
    clearFilters: "Clear filters",
  },
  orientation: {
    title: "University orientation simulator",
    intro: "A comparison and exploration tool, not an admissions authority. Thresholds change every year; the final decision belongs to the official authorities.",
    yourStream: "Your stream",
    yourAverage: "Your average",
    yearLabel: "Academic year",
    check: "Check requirements",
    eligible: "Stream eligible in principle",
    notEligible: "Stream not eligible for this field",
    unknown: "Not determined",
    thresholdNote: "A threshold published last year guarantees nothing for next year.",
    resultTitle: "Fields open to your stream",
    resultEmpty: "Enter your stream and average.",
    fieldsTitle: "Fields",
    compareTitle: "Compare with a published threshold",
    enterThreshold: "Published admission threshold",
    verdictAbove: "Your average is above the entered threshold",
    verdictBelow: "Your average is below the entered threshold",
    historical: "Historical data",
    officialLinks: "Official links",
    noThresholdData: "We do not display numeric thresholds without a verified official source. Enter the threshold published in the official orientation guide to compare it.",
    youNeed: "You need",
    difference: "Gap",
    prerequisite: "Requirements",
    explanation: "How orientation works",
    simulateTitle: "Simulation",
    simulateHint: "Educational simulation with no admission guarantee.",
  },
  tools: {
    title: "Student tools",
    intro: "Free tools that run in your browser, with no sign-up and no grades sent anywhere.",
    countdown: "Bac countdown",
    weighted: "Weighted average",
    studyTime: "Study time calculator",
    timetable: "Revision timetable",
    score: "Exam score simulator",
    improvement: "Average improvement",
    finder: "Paper finder",
    scientific: "Scientific calculator",
    planner: "Study planner",
  },
  planner: {
    title: "Study planner",
    intro: "Build a weekly revision plan from your stream and available time, then track progress. Everything stays in your browser.",
    setup: "Setup",
    weeks: "Number of weeks",
    hoursPerWeek: "Revision hours per week",
    generate: "Generate plan",
    schedule: "Weekly schedule",
    progress: "Progress",
    focus: "High-coefficient subjects automatically receive more time.",
    exportIcs: "Export to calendar (ICS)",
    savedNote: "The plan is stored locally.",
    day: "Day",
    complete: "Complete",
    resetPlan: "Reset",
    examDate: "Exam date",
  },
  trust: {
    aboutTitle: "About",
    editorialTitle: "Editorial policy",
    correctionsTitle: "Corrections policy",
    privacyTitle: "Privacy",
    termsTitle: "Terms of use",
    contactTitle: "Contact",
  },
};

export const dictionaries: Record<Locale, Dict> = { ar, fr, en };
export type Dictionary = Dict;

export function getDict(locale: Locale): Dict {
  return dictionaries[locale];
}
