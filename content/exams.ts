import type { Localized } from "./bac";
import { examYears, streams, subjectById, type SubjectId } from "./bac";
import type { Block, SourceRef } from "./types";

/**
 * Exam archive model.
 *
 * No official public archive of past papers exists (verified 15 Nov 2026):
 * ONEC's portal is a registration/results service and the ministry site was
 * unreachable. We therefore ship a *registry* with an explicit document status
 * and publish detail pages only for records we can support with real content.
 * We never attach a PDF placeholder to a document we do not host.
 */

export type DocumentStatus = "not-hosted" | "published";

export type ExamRegistryRow = {
  id: string;
  year: (typeof examYears)[number];
  stream: string;
  subject: SubjectId;
  coefficient: number;
  status: DocumentStatus;
  hasPage: boolean;
};

export const archiveSources: SourceRef[] = [
  {
    label: "ONEC — Office national des examens et concours (portail de résultats et d’inscription)",
    url: "https://bac.onec.dz/",
    kind: "official",
    checkedOn: "2026-11-15",
    note: "Portail saisonnier ; aucune archive publique de sujets.",
  },
  {
    label: "Ministère de l’Éducation nationale",
    url: "https://www.education.gov.dz/",
    kind: "official",
    checkedOn: "2026-11-15",
    note: "Inaccessible lors de la vérification (délai dépassé).",
  },
];

export const archiveStatus = {
  checkedOn: "2026-11-15",
  headline: {
    ar: "لا يوجد أرشيف رسمي عمومي للمواضيع",
    fr: "Il n’existe pas d’archive publique officielle des sujets",
    en: "There is no official public paper archive",
  } as Localized,
  body: {
    ar: "تحققنا من بوابة الديوان الوطني للامتحانات والمسابقات (bac.onec.dz) وموقع الوزارة: الأولى مخصصة للتسجيل والنتائج، والثانية لم تستجب أثناء التحقق. لذلك لا ننشر أي ملف موضوع أو تصحيح، ونكتفي بفهرس يحيل إلى المصادر الرسمية.",
    fr: "Nous avons vérifié le portail de l’ONEC (bac.onec.dz) et le site du ministère : le premier sert à l’inscription et aux résultats, le second ne répondait pas lors de la vérification. Nous ne publions donc aucun sujet ni corrigé et tenons un index renvoyant aux sources officielles.",
    en: "We checked the ONEC portal (bac.onec.dz) and the ministry site: the first handles registration and results, the second did not respond during verification. We therefore publish no paper or correction and keep an index pointing to official sources.",
  } as Localized,
};

/** Core subject topics, used by the exam preparation pages (editorial). */
export const subjectTopics: Partial<
  Record<
    SubjectId,
    {
      topics: Localized;
      method: Localized;
      mistakes: Localized;
    }
  >
> = {
  mathematics: {
    topics: {
      ar: "الدوال العددية والنهايات والاشتقاق، المتتاليات، الاحتمالات، الأعداد المركبة، الهندسة في الفضاء، والحساب التكاملي حسب الشعبة.",
      fr: "Fonctions, limites et dérivation, suites, probabilités, nombres complexes, géométrie dans l’espace et calcul intégral selon la filière.",
      en: "Functions, limits and derivatives, sequences, probability, complex numbers, solid geometry and integral calculus depending on the stream.",
    },
    method: {
      ar: "ابدأ بتحليل نص التمرين: ما المطلوب بالضبط؟ ثم اكتب المعطيات والرموز. لا تبدأ الحساب قبل تحديد الطريقة. خصّص وقتًا للتحقق من النتيجة بالتعويض.",
      fr: "Analysez l’énoncé avant de calculer, notez les données et les notations, puis vérifiez le résultat par substitution.",
      en: "Read the whole question first, list the given data and notation, then verify results by substitution.",
    },
    mistakes: {
      ar: "نسيان مجال التعريف، إهمال الوحدات في الهندسة، والقفز على البرهان في الأسئلة النظرية.",
      fr: "Oublier le domaine de définition, négliger les unités, sauter la démonstration.",
      en: "Forgetting the domain of definition, dropping units, skipping proofs.",
    },
  },
  physics: {
    topics: {
      ar: "الميكانيك (الحركة، القوى، الطاقة)، الكهرباء (الدارات، الحقول)، الكيمياء (التحولات، الحموض والأسس)، والتمارين التجريبية.",
      fr: "Mécanique (mouvement, forces, énergie), électricité (circuits, champs), chimie (transformations, acides-bases) et exercices expérimentaux.",
      en: "Mechanics (motion, forces, energy), electricity (circuits, fields), chemistry (transformations, acids-bases) and experimental tasks.",
    },
    method: {
      ar: "ارسم المخطط قبل الحساب، وحدّد الجملة المدروسة والمرجع. اكتب العلاقات الحرفية ثم عوّض الأرقام في النهاية.",
      fr: "Faites le schéma, délimitez le système et le référentiel, écrivez la relation littérale avant de remplacer par les valeurs.",
      en: "Draw the diagram, define the system and frame, write the literal relation before substituting numbers.",
    },
    mistakes: {
      ar: "خلط الوحدات، نسيان معامل التحويل، وتفسير النتيجة دون ربطها بالظاهرة الفيزيائية.",
      fr: "Mélanger les unités, oublier les conversions, ne pas interpréter le résultat physiquement.",
      en: "Mixing units, missing conversions, not interpreting the result physically.",
    },
  },
  "natural-sciences": {
    topics: {
      ar: "تركيب البروتين والترجمة، النشاط الأنزيمي، التركيب الضوئي، الوراثة، المناعة، والتنظيم العصبي الهرموني.",
      fr: "Synthèse des protéines et traduction, activité enzymatique, photosynthèse, génétique, immunologie et régulation neuro-hormonale.",
      en: "Protein synthesis and translation, enzyme activity, photosynthesis, genetics, immunology and neuro-hormonal regulation.",
    },
    method: {
      ar: "استعمل المصطلحات العلمية الدقيقة، وابنِ الإجابة على شكل: ملاحظة ← تفسير ← استنتاج. في النص العلمي، احترم التسلسل السببي.",
      fr: "Utilisez le vocabulaire scientifique exact et structurez : observation → interprétation → conclusion. Respectez la chaîne causale.",
      en: "Use precise scientific vocabulary and structure answers as observation → interpretation → conclusion.",
    },
    mistakes: {
      ar: "الحفظ دون فهم التسلسل، إهمال الوثائق المرفقة، وعدم ربط الاستنتاج بالسؤال.",
      fr: "Réciter sans comprendre l’enchaînement, ignorer les documents, ne pas relier la conclusion à la question.",
      en: "Reciting without understanding the sequence, ignoring the documents, not linking conclusions to the question.",
    },
  },
  philosophy: {
    topics: {
      ar: "المقالة الفلسفية، الإشكالية والطرح، التحليل والمناقشة، ومناطق البرنامج: المعرفة العلمية، الحرية، الدولة، الفن… حسب الشعبة.",
      fr: "Dissertation philosophique : problématique, analyse, discussion ; thèmes du programme : science, liberté, État, art… selon la filière.",
      en: "Philosophical essay: problem, analysis, discussion; programme themes such as science, freedom, the state and art.",
    },
    method: {
      ar: "لا تبدأ بالمقدمة قبل تحديد الإشكالية. المقدمة تؤدي إلى السؤال، والتحليل يعرض الأطروحة ونقيضها، والخاتمة تحسم موقفًا مبررًا.",
      fr: "Ne rédigez pas l’introduction avant d’avoir cerné le problème : elle doit mener au questionnement, le développement confronter les thèses.",
      en: "Do not write the introduction before identifying the problem: it must lead to the question, the body must confront positions.",
    },
    mistakes: {
      ar: "السرد التاريخي للفلاسفة بدل المعالجة، مقدمة عامة لا تخدم السؤال، وخاتمة تكرر ما سبق.",
      fr: "Raconter l’histoire des philosophes au lieu de traiter la question, introduction hors sujet, conclusion répétitive.",
      en: "Narrating philosophers’ biographies instead of addressing the question, off-topic introductions, repetitive conclusions.",
    },
  },
  accounting: {
    topics: {
      ar: "التسجيل المحاسبي، الميزانية والحسابات السنوية، تحليل التكاليف، حساب النتائج، والتحليل المالي.",
      fr: "Écritures comptables, bilan et comptes annuels, analyse des coûts, calcul du résultat et analyse financière.",
      en: "Accounting entries, balance sheet and annual accounts, cost analysis, result calculation and financial analysis.",
    },
    method: {
      ar: "تحقق من توازن كل قيد، واستعمل جدولًا لتنظيم الحسابات. اكتب الوحدات والتواريخ، واشرح كل حساب.",
      fr: "Vérifiez l’équilibre de chaque écriture, organisez les comptes en tableau et justifiez chaque calcul.",
      en: "Check that every entry balances, organise accounts in a table and justify each calculation.",
    },
    mistakes: {
      ar: "خلط المدين والدائن، إهمال الضرائب، ونسيان ترحيل الأرصدة.",
      fr: "Confondre débit et crédit, oublier les taxes, ne pas reporter les soldes.",
      en: "Confusing debit and credit, omitting taxes, failing to carry balances forward.",
    },
  },
  arabic: {
    topics: {
      ar: "النصوص الأدبية، تحليل النص، البلاغة والعروض، المقالة الأدبية، وقواعد اللغة.",
      fr: "Textes littéraires, analyse de texte, rhétorique et prosodie, dissertation littéraire et grammaire.",
      en: "Literary texts, text analysis, rhetoric and prosody, literary essay and grammar.",
    },
    method: {
      ar: "اقرأ النص مرتين، حدّد نوعه وموضوعه، ثم أجب عن الأسئلة بمصطلحات دقيقة قبل كتابة الإنتاج.",
      fr: "Lisez le texte deux fois, identifiez son genre et son thème, répondez avec précision avant la production écrite.",
      en: "Read the text twice, identify its genre and theme, answer precisely before the writing task.",
    },
    mistakes: {
      ar: "الإجابة العامة دون الاستشهاد من النص، وإهمال سلامة اللغة.",
      fr: "Réponses vagues sans citations du texte, négligence de la langue.",
      en: "Vague answers without quoting the text, neglecting language accuracy.",
    },
  },
  french: {
    topics: {
      ar: "فهم النص، المفردات، القواعد، والمنهجية: النص الحجاجي والتفسيري، والإنتاج الكتابي.",
      fr: "Compréhension de texte, lexique, grammaire et méthodologie : texte argumentatif et explicatif, production écrite.",
      en: "Text comprehension, vocabulary, grammar and methodology: argumentative and explanatory texts, written production.",
    },
    method: {
      ar: "اقرأ الأسئلة قبل النص، ثم ابحث عن مؤشرات النوع والحجج. في الإنتاج، استعمل روابط منطقية واضحة.",
      fr: "Lisez les questions avant le texte, repérez le type et les arguments, utilisez des connecteurs logiques clairs.",
      en: "Read the questions before the text, identify the type and arguments, use clear logical connectors.",
    },
    mistakes: {
      ar: "نسخ النص بدل التحليل، وإهمال المطلوب في السؤال.",
      fr: "Recopier le texte au lieu d’analyser, ignorer la consigne.",
      en: "Copying the text instead of analysing, ignoring the task.",
    },
  },
  english: {
    topics: {
      ar: "فهم النص، المفردات، القواعد، والإنتاج الكتابي (رسالة، مقال قصير).",
      fr: "Compréhension, vocabulaire, grammaire et production écrite (lettre, court essai).",
      en: "Comprehension, vocabulary, grammar and written production (letter, short essay).",
    },
    method: {
      ar: "وزّع الوقت: قراءة، أسئلة، ثم إنتاج. اكتب فقرة بمقدمة وجملتين للتطوير وخاتمة.",
      fr: "Répartissez le temps : lecture, questions, production. Rédigez introduction, deux arguments, conclusion.",
      en: "Split your time: reading, questions, production. Write an introduction, two arguments and a conclusion.",
    },
    mistakes: {
      ar: "الإجابة بجمل مقتطعة، وإهمال علامات الترقيم.",
      fr: "Répondre par des fragments, négliger la ponctuation.",
      en: "Answering in fragments, ignoring punctuation.",
    },
  },
  "history-geography": {
    topics: {
      ar: "الوثائق التاريخية، المقالة التاريخية، التحولات الكبرى، والخرائط والمفاهيم الجغرافية.",
      fr: "Documents historiques, dissertation, grandes transformations, cartes et concepts géographiques.",
      en: "Historical documents, essays, major transformations, maps and geographical concepts.",
    },
    method: {
      ar: "حلّل الوثيقة (طبيعتها، مصدرها، سياقها) قبل استخراج المعلومات، ثم نظّم الإجابة في محاور.",
      fr: "Analysez le document (nature, source, contexte) avant d’en extraire l’information, puis organisez en axes.",
      en: "Analyse the document (nature, source, context) before extracting information, then organise your answer.",
    },
    mistakes: {
      ar: "الاكتفاء بالسرد، وإهمال السياق الزمني.",
      fr: "Se limiter au récit, négliger la chronologie.",
      en: "Limiting yourself to narrative, neglecting chronology.",
    },
  },
  "islamic-studies": {
    topics: {
      ar: "القرآن والحديث، العقيدة، الفقه، السيرة، والقيم الإسلامية.",
      fr: "Coran et hadith, croyance, fiqh, biographie prophétique et valeurs islamiques.",
      en: "Qur’an and hadith, creed, fiqh, prophetic biography and Islamic values.",
    },
    method: {
      ar: "استشهد بالنصوص بدقة، وفرّق بين الحكم ودليله، ونظّم الإجابة حسب المطلوب.",
      fr: "Citez les textes avec précision, distinguez la règle de sa preuve, répondez selon la consigne.",
      en: "Quote texts precisely, distinguish rulings from evidence, answer the exact task.",
    },
    mistakes: {
      ar: "الاستشهاد الخاطئ، والخلط بين المفاهيم.",
      fr: "Citations erronées, confusion des notions.",
      en: "Incorrect quotations, confused concepts.",
    },
  },
  technology: {
    topics: {
      ar: "الرسم التقني، التحليل الوظيفي، الحساب التطبيقي، ودراسة أنظمة حسب التخصص (مدني، كهربائي، ميكانيكي، طرائق).",
      fr: "Dessin technique, analyse fonctionnelle, calcul appliqué et étude de systèmes selon la spécialité.",
      en: "Technical drawing, functional analysis, applied calculation and system study by specialty.",
    },
    method: {
      ar: "اقرأ المخطط جيدًا قبل الإجابة، وحدّد الوظائف ثم أنجز الحسابات بوحدات واضحة.",
      fr: "Lisez le schéma avant de répondre, identifiez les fonctions puis calculez avec des unités claires.",
      en: "Read the diagram before answering, identify functions, then calculate with clear units.",
    },
    mistakes: {
      ar: "إهمال الوحدات، وعدم احترام اصطلاحات الرسم.",
      fr: "Négliger les unités, ignorer les conventions de dessin.",
      en: "Ignoring units, disregarding drawing conventions.",
    },
  },
  economics: {
    topics: {
      ar: "المؤسسة ووظائفها، التسويق، التمويل، السياسات الاقتصادية، والتحليل الاقتصادي.",
      fr: "Entreprise et fonctions, marketing, financement, politiques économiques et analyse économique.",
      en: "The firm and its functions, marketing, finance, economic policy and analysis.",
    },
    method: {
      ar: "استعمل المصطلحات الاقتصادية بدقة، وادعم التحليل بأمثلة من الواقع الجزائري عند الطلب.",
      fr: "Employez le vocabulaire économique exact et illustrez par des exemples algériens lorsque demandé.",
      en: "Use precise economic vocabulary and illustrate with Algerian examples when asked.",
    },
    mistakes: {
      ar: "الإجابة بالتعريفات فقط دون تحليل.",
      fr: "Répondre par des définitions sans analyse.",
      en: "Answering with definitions only, without analysis.",
    },
  },
  law: {
    topics: {
      ar: "القانون المدني (الالتزامات)، القانون التجاري، قانون العمل، والتنظيم القضائي.",
      fr: "Droit civil (obligations), droit commercial, droit du travail et organisation judiciaire.",
      en: "Civil law (obligations), commercial law, labour law and judicial organisation.",
    },
    method: {
      ar: "حدّد القاعدة القانونية ثم طبّقها على الواقعة، مع ذكر النص إن أمكن.",
      fr: "Identifiez la règle de droit puis appliquez-la aux faits, en citant le texte si possible.",
      en: "Identify the legal rule, apply it to the facts and cite the text when possible.",
    },
    mistakes: {
      ar: "الخلط بين الفروع، وإهمال التطبيق على الحالة.",
      fr: "Confondre les branches, négliger l’application au cas.",
      en: "Confusing branches of law, neglecting application to the case.",
    },
  },
  "third-language": {
    topics: {
      ar: "فهم النص، القواعد، المفردات، والإنتاج الكتابي في اللغة الثالثة.",
      fr: "Compréhension, grammaire, lexique et production écrite dans la troisième langue.",
      en: "Comprehension, grammar, vocabulary and written production in the third language.",
    },
    method: {
      ar: "راجع القواعد الأساسية بانتظام، وتمرّن على كتابة فقرات قصيرة.",
      fr: "Révisez régulièrement les bases grammaticales et entraînez-vous à écrire des paragraphes courts.",
      en: "Revise grammar basics regularly and practise short paragraphs.",
    },
    mistakes: {
      ar: "ترجمة حرفية من العربية أو الفرنسية.",
      fr: "Traduction littérale depuis l’arabe ou le français.",
      en: "Literal translation from Arabic or French.",
    },
  },
  "physical-education": {
    topics: {
      ar: "تقييم في المؤسسة حسب النشاط الرياضي المبرمج.",
      fr: "Évaluation en établissement selon l’activité sportive programmée.",
      en: "School-based assessment according to the planned sport.",
    },
    method: {
      ar: "الحضور المنتظم والالتزام بالبرنامج كافيان غالبًا؛ راجع أستاذك حول معايير التقييم.",
      fr: "La régularité et l’implication suffisent généralement ; vérifiez les critères avec votre professeur.",
      en: "Regular attendance and effort usually suffice; confirm the criteria with your teacher.",
    },
    mistakes: {
      ar: "الغياب المتكرر.",
      fr: "Absences répétées.",
      en: "Repeated absences.",
    },
  },
};

function coreSubjects(streamId: string, count: number): SubjectId[] {
  const stream = streams.find((item) => item.id === streamId);
  if (!stream) return [];
  return [...stream.coefficients]
    .filter((entry) => entry.subject !== "physical-education")
    .sort((a, b) => b.coefficient - a.coefficient)
    .slice(0, count)
    .map((entry) => entry.subject);
}

/** Detail pages exist only for the 2025 session and each stream's core subjects. */
const documentedYear = 2025;
const documentedStreams = streams.map((stream) => ({
  stream: stream.id,
  subjects: coreSubjects(stream.id, 4),
}));

export const examPages: { year: number; stream: string; subject: SubjectId; coefficient: number }[] = documentedStreams.flatMap(
  ({ stream, subjects }) =>
    subjects.map((subject) => ({
      year: documentedYear,
      stream,
      subject,
      coefficient: streams.find((s) => s.id === stream)?.coefficients.find((entry) => entry.subject === subject)?.coefficient ?? 0,
    })),
);

export function findExamPage(year: number, stream: string, subject: string) {
  return examPages.find((page) => page.year === year && page.stream === stream && page.subject === subject) ?? null;
}

/** Full registry used by the archive filters. */
export const examRegistry: ExamRegistryRow[] = examYears.flatMap((year) =>
  streams.flatMap((stream) =>
    stream.coefficients
      .filter((entry) => entry.subject !== "physical-education" && subjectTopics[entry.subject])
      .map((entry) => ({
        id: `${year}-${stream.id}-${entry.subject}`,
        year,
        stream: stream.id,
        subject: entry.subject,
        coefficient: entry.coefficient,
        status: "not-hosted" as DocumentStatus,
        hasPage: examPages.some((page) => page.year === year && page.stream === stream.id && page.subject === entry.subject),
      })),
  ),
);

export function examPageBlocks(opts: {
  locale: "ar" | "fr" | "en";
  subject: SubjectId;
  streamName: string;
  subjectName: string;
  coefficient: number;
  year: number;
}): Block[] {
  const topics = subjectTopics[opts.subject];
  if (!topics) return [];
  const common = {
    ar: {
      lead: `صفحة مرجعية لمادة ${opts.subjectName} في شعبة ${opts.streamName}، دورة ${opts.year}. لا نستضيف ملف الموضوع، لكن هذه الصفحة تشرح ما يُقيَّم وكيف تستعمل الموضوع الرسمي عندما تحصل عليه.`,
      structure: "بنية الاختبار",
      structureText: `المادة معاملها ${opts.coefficient} في هذه الشعبة. راجع الجدول الرسمي للمواقيت للتأكد من مدة الاختبار، إذ لم نتمكن من التحقق منها من مصدر رسمي متاح.`,
      topics: "المحاور التي يُقيَّم فيها",
      method: "منهجية الإجابة",
      mistakes: "أخطاء شائعة",
      howTo: "كيف تستعمل هذا الموضوع",
      steps: [
        { title: "احصل على الموضوع من مصدره", text: "لا نستضيف ملفات غير مرخّصة. اطلب الموضوع من أستاذك أو من المصدر الرسمي عند نشره." },
        { title: "حلّه دون نظر إلى التصحيح", text: "خصّص وقتًا مطابقًا للاختبار الحقيقي، وسجّل كل ما تعجز عنه." },
        { title: "صحّح لنفسك", text: "استعمل معايير الإجابة: المنهجية، الدقة العلمية، والوحدات. التصحيح الرسمي غير منشور للعموم." },
        { title: "حوّل الأخطاء إلى قائمة", text: "كل خطأ متكرر يصبح بندًا في خطة المراجعة الأسبوعية." },
      ],
    },
    fr: {
      lead: `Page de référence pour ${opts.subjectName} en filière ${opts.streamName}, session ${opts.year}. Nous n’hébergeons pas le sujet, mais cette page explique ce qui est évalué et comment exploiter le sujet officiel.`,
      structure: "Structure de l’épreuve",
      structureText: `Le coefficient de cette matière est ${opts.coefficient} dans cette filière. Consultez le tableau officiel des horaires pour la durée de l’épreuve, que nous n’avons pas pu vérifier auprès d’une source officielle accessible.`,
      topics: "Thèmes évalués",
      method: "Méthode de réponse",
      mistakes: "Erreurs fréquentes",
      howTo: "Comment exploiter ce sujet",
      steps: [
        { title: "Obtenez le sujet à sa source", text: "Nous n’hébergeons pas de fichiers non autorisés. Demandez-le à votre professeur ou consultez la source officielle." },
        { title: "Traitez-le sans le corrigé", text: "Respectez la durée de l’épreuve et notez tout ce qui bloque." },
        { title: "Auto-corrigez", text: "Utilisez les critères : méthode, exactitude, unités. Le corrigé officiel n’est pas publié." },
        { title: "Transformez les erreurs en plan", text: "Chaque erreur récurrente devient une ligne de votre planning hebdomadaire." },
      ],
    },
    en: {
      lead: `Reference page for ${opts.subjectName} in the ${opts.streamName} stream, ${opts.year} session. We do not host the paper, but this page explains what is assessed and how to use the official paper.`,
      structure: "Exam structure",
      structureText: `This subject has coefficient ${opts.coefficient} in this stream. Check the official timetable for the exam duration, which we could not verify from an accessible official source.`,
      topics: "Assessed topics",
      method: "Answering method",
      mistakes: "Common mistakes",
      howTo: "How to use this paper",
      steps: [
        { title: "Get the paper from its source", text: "We do not host unauthorised files. Ask your teacher or use the official source." },
        { title: "Sit it without the correction", text: "Respect the real duration and note everything you cannot do." },
        { title: "Self-mark", text: "Use the criteria: method, accuracy, units. The official correction is not publicly released." },
        { title: "Turn mistakes into a plan", text: "Every recurring mistake becomes a line in your weekly plan." },
      ],
    },
  }[opts.locale];

  return [
    { type: "lead", text: common.lead },
    { type: "h2", text: common.structure },
    { type: "p", text: common.structureText },
    { type: "h2", text: common.topics },
    { type: "p", text: topics.topics[opts.locale] },
    { type: "h2", text: common.method },
    { type: "p", text: topics.method[opts.locale] },
    { type: "h2", text: common.mistakes },
    { type: "p", text: topics.mistakes[opts.locale] },
    { type: "h2", text: common.howTo },
    { type: "steps", items: common.steps },
    {
      type: "callout",
      tone: "warn",
      title: opts.locale === "ar" ? "حالة الوثيقة" : opts.locale === "fr" ? "Statut du document" : "Document status",
      text:
        opts.locale === "ar"
          ? "لا يوجد ملف PDF مستضاف لهذه الدورة. السبب: عدم توفر مصدر رسمي عام يمكن التحقق منه. سنضيف الملف فور توفره مع ذكر المصدر وتاريخ التحقق."
          : opts.locale === "fr"
            ? "Aucun PDF n’est hébergé pour cette session : aucune source officielle publique vérifiable n’est disponible. Le fichier sera ajouté dès qu’il sera disponible, avec source et date de vérification."
            : "No PDF is hosted for this session: no verifiable public official source is available. The file will be added once available, with source and verification date.",
    },
  ];
}
