import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { getDict } from "@/lib/i18n";
import { pathFor } from "@/lib/routes";
import { tx } from "@/lib/tx";
import { coefficientSourcesFor, coefficientStatus, coefficientTimeline, nationalStats, streams } from "@/content/bac";
import { latestUpdates, updateKindLabels } from "@/content/updates";
import { guides } from "@/content/guides";
import { tools } from "@/content/tools";
import { countdownTarget, examSessions } from "@/content/exam-dates";
import { absolute } from "@/lib/seo";
import { Badge, Stat } from "@/components/ui";
import { JsonLd, faqSchema, webPageSchema } from "@/components/jsonld";
import { SearchForm } from "@/components/search-form";
import { SourceList } from "@/components/source-list";
import { BacCalculator } from "@/components/tools/bac-calculator";
import { CountdownPanel } from "@/components/study/countdown";
import { QuickFocus } from "@/components/study/quick-focus";
import { TodayStrip } from "@/components/study/today-strip";
import {
  IconArrow,
  IconBook,
  IconCalculator,
  IconCalendar,
  IconChevron,
  IconCap,
  IconChart,
  IconClock,
  IconCompass,
  IconLayers,
  IconTarget,
  IconWrench,
} from "@/components/icons";

export function PageShell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`shell py-10 sm:py-12 ${className}`}>{children}</div>;
}

const homeFaq: Record<Locale, { q: string; a: string }[]> = {
  ar: [
    { q: "كيف يُحسب معدل البكالوريا؟", a: "بجمع (النقطة × المعامل) لكل مادة ثم القسمة على مجموع المعاملات، لا على عدد المواد. حاسبة المنصة تطبق هذه القاعدة وتُظهر مساهمة كل مادة." },
    { q: "ما المعاملات المعمول بها لدورة 2027؟", a: "الجدول السابق لتعديل جويلية 2026، لأن التعديل أُلغي بالقرار الوزاري رقم 36 المؤرخ في 9 سبتمبر 2026. مجاميع المعاملات من 27 إلى 34 حسب الشعبة." },
    { q: "هل تاريخ بكالوريا 2027 معلن؟", a: "لا. حتى آخر تحقق في 15 نوفمبر 2026 لم يُنشر تاريخ رسمي. عدّاد المنصة يعرض حالة «غير معلن» ولا يخترع موعدًا." },
    { q: "هل تنشرون مواضيع البكالوريا بصيغة PDF؟", a: "لا. لا يوجد أرشيف رسمي عمومي للمواضيع، ولا ننشر ملفات لا يمكن التحقق من مصدرها. نوفّر فهرسًا يحيل إلى المصادر الرسمية وشرحًا لمنهجية استعمال الموضوع." },
    { q: "هل معدل القبول المنشور ضمان للقبول؟", a: "لا. هو معدل آخر مترشح قُبل في تلك السنة، ويتغير كل سنة وحسب المؤسسة والتخصص والطاقة الاستيعابية." },
  ],
  fr: [
    { q: "Comment est calculée la moyenne du bac ?", a: "En additionnant (note × coefficient) puis en divisant par la somme des coefficients, pas par le nombre de matières." },
    { q: "Quels coefficients s’appliquent en 2027 ?", a: "Le tableau antérieur à la réforme de juillet 2026, abrogée par la décision n°36 du 9 septembre 2026. Les totaux vont de 27 à 34 selon la filière." },
    { q: "La date du bac 2027 est-elle annoncée ?", a: "Non. À la dernière vérification (15 novembre 2026), aucune date officielle n’était publiée. Le compte à rebours indique « non annoncée » et n’invente aucune date." },
    { q: "Hébergez-vous des sujets en PDF ?", a: "Non. Il n’existe pas d’archive publique officielle, et nous ne publions pas de fichiers non vérifiables. Nous tenons un index et expliquons la méthode." },
    { q: "Un seuil d’admission est-il une garantie ?", a: "Non : c’est la moyenne du dernier admis de l’année, variable selon l’établissement, la filière et la capacité." },
  ],
  en: [
    { q: "How is the bac average calculated?", a: "By summing (grade × coefficient) and dividing by the sum of coefficients, not the number of subjects." },
    { q: "Which coefficients apply in 2027?", a: "The table predating the July 2026 reform, which was repealed by decision no. 36 of 9 September 2026. Totals range from 27 to 34 by stream." },
    { q: "Is the 2027 bac date announced?", a: "No. At the last check (15 November 2026) no official date had been published. The countdown states “not announced” and invents no date." },
    { q: "Do you host past papers as PDFs?", a: "No. There is no official public archive, and we do not publish unverifiable files. We keep an index and explain the method." },
    { q: "Is an admission threshold a guarantee?", a: "No: it is the last admitted candidate’s average for that year and varies by institution, field and capacity." },
  ],
};

const sectionIndex = [
  {
    href: "#study",
    title: { ar: "الدراسة اليومية", fr: "Le travail quotidien", en: "Daily study" },
    text: {
      ar: "عدّاد، مؤقت تركيز، مهام، ومخطط أسبوعي — يعمل كله دون حساب.",
      fr: "Compte à rebours, minuteur, tâches et planning : tout fonctionne sans compte.",
      en: "Countdown, focus timer, tasks and a weekly plan: all without an account.",
    },
  },
  {
    href: "#calculator",
    title: { ar: "حاسبة المعدل", fr: "La moyenne", en: "The average" },
    text: {
      ar: "المعاملات السارية لدورة 2027، وتفصيل مساهمة كل مادة.",
      fr: "Les coefficients en vigueur pour 2027, et le détail par matière.",
      en: "The coefficients in force for 2027, with a per-subject breakdown.",
    },
  },
  {
    href: "#library",
    title: { ar: "المكتبة", fr: "La bibliothèque", en: "The library" },
    text: {
      ar: "فهرس المواضيع وأدلة المراجعة، مع حالة كل وثيقة.",
      fr: "Index des sujets et guides de révision, avec le statut de chaque document.",
      en: "Paper index and revision guides, with each document’s status.",
    },
  },
  {
    href: "#orientation",
    title: { ar: "التوجيه الجامعي", fr: "L’orientation", en: "Orientation" },
    text: {
      ar: "المعدلات الدنيا الرسمية لسنة 2026، بلا وعود زائفة.",
      fr: "Les minima officiels de 2026, sans fausses promesses.",
      en: "Official 2026 minima, with no false promises.",
    },
  },
  {
    href: "#tools",
    title: { ar: "الأدوات", fr: "Les outils", en: "The tools" },
    text: {
      ar: "حاسبات وخطط تعمل في المتصفح، بلا تسجيل.",
      fr: "Calculateurs et plans dans le navigateur, sans inscription.",
      en: "Calculators and plans in the browser, with no sign-up.",
    },
  },
];

export function HomePage({ locale }: { locale: Locale }) {
  const dict = getDict(locale);
  const t = dict.home;
  const faq = homeFaq[locale];
  const featuredGuides = guides.filter((guide) => guide.featured).slice(0, 3);
  const mainTools = tools.filter((tool) =>
    ["weighted-average", "exam-score-simulator", "scientific-calculator", "study-time", "revision-timetable"].includes(tool.slug),
  );
  const session = examSessions[0];

  return (
    <>
      <section className="border-b border-line-strong">
        <div className="shell grid gap-10 py-10 sm:py-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:py-16">
          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="eyebrow">
                <span aria-hidden className="h-px w-8 bg-ink" />
                {t.kicker}
              </span>
              <Badge tone="brand">
                {locale === "ar" ? "معاملات موثّقة" : locale === "fr" ? "Coefficients vérifiés" : "Verified coefficients"}
              </Badge>
            </div>

            <h1 className="mt-5 max-w-[22ch] font-display text-[2rem] font-bold leading-[1.14] tracking-tight text-ink sm:mt-6 sm:max-w-[17ch] sm:text-[3.1rem] sm:leading-[1.1] lg:text-[3.4rem]">
              {t.title}
            </h1>
            <p className="mt-3 max-w-prose text-[13.5px] leading-6 text-muted sm:mt-5 sm:text-[15.5px] sm:leading-8">{t.subtitle}</p>

            <div className="mt-7 hidden flex-wrap gap-2.5 sm:flex">
              <Link href={pathFor(locale, { name: "calculator" })} className="btn btn-primary">
                <IconCalculator size={16} />
                {t.primaryCta}
              </Link>
              <Link href={pathFor(locale, { name: "studySpace" })} className="btn">
                <IconTarget size={16} />
                {dict.nav.study}
              </Link>
              <Link href={pathFor(locale, { name: "exams" })} className="btn btn-ghost">
                {t.secondaryCta}
                <IconArrow size={15} />
              </Link>
            </div>

            <SearchForm
              action={pathFor(locale, { name: "search" })}
              id="home-search"
              label={t.searchLabel}
              placeholder={t.searchPlaceholder}
              submitLabel={dict.actions.search}
              className="mt-8 hidden max-w-xl sm:block"
              labelClassName="mb-2 block text-[11px] uppercase tracking-[0.14em] text-muted"
            />

            <dl className="mt-9 hidden max-w-xl grid-cols-2 gap-y-5 sm:grid sm:grid-cols-4">
              <Stat value={nationalStats.candidatesPerYear} label={t.statsStudents} />
              <Stat value={String(nationalStats.streams)} label={t.statsStreams} />
              <Stat value={String(nationalStats.subjects)} label={t.statsSubjects} />
              <Stat value={String(nationalStats.tools)} label={t.statsTools} />
            </dl>
          </div>

          <div className="lg:pt-2">
            <div className="border border-line-strong bg-surface p-5 sm:p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line pb-3">
                <h2 className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-muted">
                  {tx(locale, { ar: "حتى موعد البكالوريا", fr: "Avant le bac", en: "Until the bac" })}
                </h2>
                <Link href={pathFor(locale, { name: "countdown" })} className="link text-[11.5px]">
                  {tx(locale, { ar: "التفاصيل", fr: "Détails", en: "Details" })}
                </Link>
              </div>
              <div className="mt-4">
                <CountdownPanel locale={locale} target={countdownTarget(session)} note={session.note} variant="hero" />
              </div>
            </div>

            <div className="mt-4">
              <QuickFocus locale={locale} />
            </div>
          </div>
        </div>
      </section>

      <section aria-label={tx(locale, { ar: "اختصارات", fr: "Raccourcis", en: "Shortcuts" })} className="border-b border-line lg:hidden">
        <div className="shell grid grid-cols-2 gap-2 py-4">
          <AppAction href={pathFor(locale, { name: "calculator" })} icon={<IconCalculator size={18} />} label={tx(locale, { ar: "احسب معدلك", fr: "Ma moyenne", en: "My average" })} hint={tx(locale, { ar: "بالمعاملات السارية", fr: "Coefficients en vigueur", en: "Coefficients in force" })} />
          <AppAction href={pathFor(locale, { name: "exams" })} icon={<IconLayers size={18} />} label={tx(locale, { ar: "المواضيع", fr: "Sujets", en: "Papers" })} hint={tx(locale, { ar: "فهرس موثّق", fr: "Index documenté", en: "Documented index" })} />
          <AppAction href={pathFor(locale, { name: "pomodoro" })} icon={<IconClock size={18} />} label={tx(locale, { ar: "ابدأ تركيزًا", fr: "Lancer un focus", en: "Start focus" })} hint={tx(locale, { ar: "25 دقيقة", fr: "25 minutes", en: "25 minutes" })} />
          <AppAction href={pathFor(locale, { name: "tasks" })} icon={<IconLayers size={18} />} label={tx(locale, { ar: "مهام اليوم", fr: "Tâches du jour", en: "Today’s tasks" })} hint={tx(locale, { ar: "أضف وأنجز", fr: "Ajouter et finir", en: "Add and finish" })} />
        </div>
      </section>

      <div className="shell">
        <TodayStrip locale={locale} />
      </div>

      <PageShell className="pt-12 sm:pt-14">
        <nav aria-label={tx(locale, { ar: "فهرس الصفحة", fr: "Sommaire", en: "Page index" })} className="hidden lg:block">
          <div className="flex items-baseline justify-between gap-3 border-b border-line pb-2">
            <h2 className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-muted">
              {tx(locale, { ar: "في هذه الصفحة", fr: "Sur cette page", en: "On this page" })}
            </h2>
            <span className="num text-[10.5px] text-muted">05</span>
          </div>
          <ol className="divide-y divide-line">
            {sectionIndex.map((entry, index) => (
              <li key={entry.href}>
                <a href={entry.href} className="group grid grid-cols-[2.25rem_1fr_auto] items-baseline gap-3 py-3.5">
                  <span className="num text-[11px] text-muted">0{index + 1}</span>
                  <span className="min-w-0">
                    <span className="block font-display text-[17px] font-semibold text-ink group-hover:text-brand">
                      {tx(locale, entry.title)}
                    </span>
                    <span className="mt-0.5 block text-[12px] leading-5 text-muted">{tx(locale, entry.text)}</span>
                  </span>
                  <IconArrow size={14} />
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <nav aria-label={tx(locale, { ar: "أقسام الصفحة", fr: "Sections de la page", en: "Page sections" })} className="mt-2 lg:hidden">
          <ul className="divide-y divide-line border-y border-line">
            {sectionIndex.map((entry, index) => (
              <li key={`m-${entry.href}`}>
                <a href={entry.href} className="flex min-h-[52px] items-center gap-3 py-2 active:bg-raised">
                  <span className="num text-[10px] text-muted">0{index + 1}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13.5px] font-semibold text-ink">{tx(locale, entry.title)}</span>
                    <span className="mt-0.5 block text-[11px] leading-4 text-muted">{tx(locale, entry.text)}</span>
                  </span>
                  <IconChevron size={14} className="text-muted rtl:rotate-180" />
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <section id="study" className="mt-10 scroll-mt-32 lg:mt-14">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line-strong pb-3">
            <div>
              <span className="eyebrow">01 — {tx(locale, { ar: "الدراسة", fr: "Étude", en: "Study" })}</span>
              <h2 className="mt-1 font-display text-2xl font-semibold text-ink sm:text-[1.9rem]">
                {tx(locale, { ar: "أدوات تجعل المراجعة تحدث فعلًا", fr: "Des outils qui font vraiment réviser", en: "Tools that make revision happen" })}
              </h2>
            </div>
            <Link href={pathFor(locale, { name: "studySpace" })} className="link text-[12.5px]">
              {tx(locale, { ar: "افتح فضاء المراجعة", fr: "Ouvrir mon espace", en: "Open my space" })}
              <IconArrow size={13} />
            </Link>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <StudyCard
              href={pathFor(locale, { name: "pomodoro" })}
              icon={<IconClock size={17} />}
              title={tx(locale, { ar: "مؤقت التركيز", fr: "Minuteur de focus", en: "Focus timer" })}
              text={tx(locale, {
                ar: "جلسات 25/5 مع راحة طويلة، تعمل عبر صفحات الموقع وتُحفظ محليًا.",
                fr: "Sessions 25/5 avec pause longue, qui survivent à la navigation et restent locales.",
                en: "25/5 sessions with a long break that survive navigation and stay local.",
              })}
            />
            <StudyCard
              href={pathFor(locale, { name: "tasks" })}
              icon={<IconLayers size={17} />}
              title={tx(locale, { ar: "مهام اليوم", fr: "Tâches du jour", en: "Today’s tasks" })}
              text={tx(locale, {
                ar: "أضف ما ستنجزه، قدّر المدة، وتابع نسبة الإنجاز يومًا بيوم.",
                fr: "Ajoutez ce que vous finirez, estimez la durée et suivez l’avancement jour après jour.",
                en: "Add what you will finish, estimate the time and track completion day by day.",
              })}
            />
            <StudyCard
              href={pathFor(locale, { name: "planner" })}
              icon={<IconCalendar size={17} />}
              title={tx(locale, { ar: "مخطط الأسبوع", fr: "Planning de la semaine", en: "Weekly plan" })}
              text={tx(locale, {
                ar: "كل جلسة مخططة تفتح مؤقتًا بالمدة نفسها، ثم تُعلَّم كمكتملة.",
                fr: "Chaque créneau ouvre un minuteur de la même durée, puis se marque comme fait.",
                en: "Each slot opens a timer of the same length, then can be marked done.",
              })}
            />
          </div>
        </section>

        <section id="calculator" className="mt-14 scroll-mt-32 grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <div>
            <span className="eyebrow">02 — {tx(locale, { ar: "الحساب", fr: "Calcul", en: "Calculation" })}</span>
            <h2 className="mt-1 font-display text-2xl font-semibold text-ink sm:text-[1.9rem]">{t.quickCalc}</h2>
            <p className="mt-2 max-w-prose text-[13.5px] leading-7 text-muted">{t.quickCalcHint}</p>

            <div className="mt-6 border-y border-line py-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="eyebrow">{t.sessionStatus}</div>
                  <h3 className="mt-1 text-[15px] font-semibold text-ink">{coefficientStatus.label[locale]}</h3>
                </div>
                <Badge tone="brand">
                  {dict.common.lastVerified}: <span className="num">{coefficientStatus.verifiedOn}</span>
                </Badge>
              </div>
              <p className="mt-3 text-[12.5px] leading-6 text-muted">
                {tx(locale, {
                  ar: "أُعلن تعديل واسع للمعاملات في جويلية 2026 ثم أُلغي في سبتمبر 2026. المنصة تعتمد الجدول الذي عاد ساريًا، وتوثّق كل تغيير.",
                  fr: "Une réforme large a été annoncée en juillet 2026 puis abrogée en septembre 2026. La plateforme applique le tableau rétabli et documente chaque changement.",
                  en: "A broad reform was announced in July 2026 and repealed in September 2026. The platform applies the restored table and documents every change.",
                })}
              </p>
              <ol className="mt-3 space-y-2">
                {coefficientTimeline.map((event) => (
                  <li key={event.date} className="flex gap-3">
                    <time dateTime={event.date} className="num mt-0.5 w-[72px] shrink-0 text-[10.5px] text-muted">
                      {event.date}
                    </time>
                    <span className="text-[12.5px] leading-5 text-ink/85">{event.label[locale]}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href={pathFor(locale, { name: "coefficients" })} className="btn btn-sm">
                  {dict.nav.coefficients}
                  <IconArrow size={14} />
                </Link>
                <Link href={pathFor(locale, { name: "update", slug: "abrogation-reforme-coefficients-2026" })} className="btn btn-sm btn-ghost">
                  {dict.nav.updates}
                </Link>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted">{t.popularStreams}</h3>
                <span className="num text-[10.5px] text-muted">06</span>
              </div>
              <ul className="mt-2 divide-y divide-line border-y border-line">
                {streams.slice(0, 6).map((stream) => {
                  const total = stream.coefficients.reduce((sum, entry) => sum + entry.coefficient, 0);
                  return (
                    <li key={stream.id}>
                      <Link href={pathFor(locale, { name: "stream", stream: stream.id })} className="flex items-center justify-between gap-3 py-2.5 text-[13px] text-ink hover:text-brand">
                        <span>{stream.name[locale]}</span>
                        <span className="num shrink-0 text-[11px] text-muted">
                          {total} {locale === "ar" ? "معاملًا" : "coef."}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <div className="lg:sticky lg:top-32 lg:self-start">
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <h3 className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted">
                {tx(locale, { ar: "احسب الآن", fr: "Calculer maintenant", en: "Compute now" })}
              </h3>
              <Link href={pathFor(locale, { name: "calculator" })} className="link text-[12px]">
                {dict.actions.calculate}
              </Link>
            </div>
            <BacCalculator locale={locale} compact />
          </div>
        </section>

        <section id="library" className="mt-14 scroll-mt-32">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line-strong pb-3">
            <div>
              <span className="eyebrow">03 — {tx(locale, { ar: "المكتبة", fr: "Bibliothèque", en: "Library" })}</span>
              <h2 className="mt-1 font-display text-2xl font-semibold text-ink sm:text-[1.9rem]">{t.latestExams}</h2>
            </div>
            <Link href={pathFor(locale, { name: "exams" })} className="link text-[12.5px]">
              {dict.actions.all}
              <IconArrow size={13} />
            </Link>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <Link href={pathFor(locale, { name: "exams" })} className="group card flex flex-col justify-between gap-5 p-5 transition-colors hover:border-line-strong sm:p-6">
              <div>
                <div className="flex items-center gap-2 text-[10.5px] uppercase tracking-[0.14em] text-muted">
                  <IconLayers size={14} />
                  {dict.nav.exams}
                </div>
                <p className="mt-3 max-w-prose text-[13.5px] leading-7 text-muted">
                  {tx(locale, {
                    ar: "فهرس حسب السنة والشعبة والمادة، مع حالة كل وثيقة ورابط المصدر الرسمي. لا نستضيف ملفات غير متحقق منها.",
                    fr: "Index par année, filière et matière, avec le statut de chaque document et le lien officiel. Aucun fichier non vérifié.",
                    en: "Index by year, stream and subject, with each document’s status and the official link. No unverified file.",
                  })}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {[2026, 2025, 2024].map((year) => (
                  <span key={year} className="chip num">
                    {year}
                  </span>
                ))}
                <span className="btn btn-sm ms-auto">
                  {t.secondaryCta}
                  <IconArrow size={13} />
                </span>
              </div>
            </Link>

            <div className="grid gap-3">
              {featuredGuides.map((guide) => {
                const content = guide.locales[locale];
                return (
                  <Link key={guide.slug} href={pathFor(locale, { name: "guide", slug: guide.slug })} className="group flex items-start gap-3 border-b border-line pb-3 last:border-b-0">
                    <span className="mt-0.5 text-muted">
                      <IconBook size={15} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[13.5px] font-medium leading-6 text-ink group-hover:text-brand">{content.title}</span>
                      <span className="mt-0.5 flex items-center gap-2 text-[10.5px] text-muted">
                        <span className="num">{guide.readingMinutes}</span> {dict.common.minutes}
                        <span aria-hidden>·</span>
                        <span className="num">{guide.updated}</span>
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section id="orientation" className="mt-14 scroll-mt-32 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <span className="eyebrow">04 — {tx(locale, { ar: "التوجيه", fr: "Orientation", en: "Orientation" })}</span>
            <h2 className="mt-1 font-display text-2xl font-semibold text-ink sm:text-[1.9rem]">{t.orientationTitle}</h2>
            <p className="mt-2 max-w-prose text-[13.5px] leading-7 text-muted">{t.orientationText}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Badge tone="neutral">
                {tx(locale, { ar: "بيانات 2026 الرسمية", fr: "Données officielles 2026", en: "Official 2026 data" })}
              </Badge>
              <Link href={pathFor(locale, { name: "orientation" })} className="btn btn-sm">
                {dict.orientation.simulateTitle}
                <IconArrow size={13} />
              </Link>
            </div>
          </div>

          <div className="border border-line-strong p-5">
            <div className="flex items-center gap-2 text-[10.5px] uppercase tracking-[0.14em] text-muted">
              <IconCompass size={14} />
              {dict.nav.updates}
            </div>
            <ul className="mt-3 divide-y divide-line">
              {latestUpdates.slice(0, 3).map((entry) => (
                <li key={entry.slug}>
                  <Link href={pathFor(locale, { name: "update", slug: entry.slug })} className="group block py-2.5">
                    <div className="flex flex-wrap items-center gap-2 text-[10.5px] text-muted">
                      <time dateTime={entry.date} className="num">
                        {entry.date}
                      </time>
                      <Badge tone={entry.kind === "official" ? "brand" : "neutral"}>{updateKindLabels[entry.kind][locale]}</Badge>
                    </div>
                    <div className="mt-1 text-[12.5px] font-medium leading-5 text-ink group-hover:text-brand">{entry.title[locale]}</div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="tools" className="mt-14 scroll-mt-32">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line-strong pb-3">
            <div>
              <span className="eyebrow">05 — {tx(locale, { ar: "أدوات", fr: "Outils", en: "Tools" })}</span>
              <h2 className="mt-1 font-display text-2xl font-semibold text-ink sm:text-[1.9rem]">{t.toolsTitle}</h2>
            </div>
            <Link href={pathFor(locale, { name: "tools" })} className="link text-[12.5px]">
              {dict.actions.all} {dict.nav.tools}
            </Link>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <ToolCard href={pathFor(locale, { name: "calculator" })} icon={<IconCalculator size={17} />} title={dict.calculator.title} text={dict.calculator.intro} />
            <ToolCard href={pathFor(locale, { name: "orientation" })} icon={<IconCompass size={17} />} title={dict.orientation.title} text={dict.orientation.intro} />
            <ToolCard href={pathFor(locale, { name: "planner" })} icon={<IconCalendar size={17} />} title={dict.planner.title} text={dict.planner.intro} />
            {mainTools.slice(0, 3).map((tool) => (
              <ToolCard
                key={tool.slug}
                href={pathFor(locale, { name: "tool", tool: tool.slug })}
                icon={<IconWrench size={17} />}
                title={tool.title[locale]}
                text={tool.description[locale]}
              />
            ))}
          </div>
        </section>

        <section className="mt-14 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <span className="eyebrow">{t.trustTitle}</span>
            <ul className="mt-3 divide-y divide-line border-y border-line">
              {[
                tx(locale, {
                  ar: "لا بيانات مخترعة: كل رقم حساس يحمل مصدره وتاريخ تحققه.",
                  fr: "Aucune donnée inventée : chaque chiffre sensible porte sa source et sa date.",
                  en: "No invented data: every sensitive figure carries its source and date.",
                }),
                tx(locale, {
                  ar: "تمييز صريح بين الرسمي والتحريري والتقديري.",
                  fr: "Distinction explicite entre officiel, éditorial et estimatif.",
                  en: "An explicit split between official, editorial and estimated.",
                }),
                tx(locale, {
                  ar: "لا نستضيف ملفات لا نملك حق نشرها أو لم نتحقق منها.",
                  fr: "Nous n’hébergeons aucun fichier dont nous ne détenons pas les droits ou non vérifié.",
                  en: "We host no file we have no right to publish or have not verified.",
                }),
              ].map((item) => (
                <li key={item} className="flex gap-2.5 py-3 text-[12.5px] leading-6 text-muted">
                  <span aria-hidden className="mt-2.5 h-1.5 w-1.5 shrink-0 bg-brand" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href={pathFor(locale, { name: "about" })} className="btn btn-sm">
                {dict.trust.aboutTitle}
              </Link>
              <Link href={pathFor(locale, { name: "editorial" })} className="btn btn-sm">
                {dict.trust.editorialTitle}
              </Link>
            </div>
          </div>

          <div>
            <span className="eyebrow">{tx(locale, { ar: "أسئلة متكررة", fr: "Questions fréquentes", en: "Frequently asked" })}</span>
            <div className="mt-3 divide-y divide-line border-y border-line">
              {faq.slice(0, 4).map((item) => (
                <details key={item.q} className="group py-3">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[13px] font-medium text-ink">
                    {item.q}
                    <span aria-hidden className="text-muted transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-2 text-[12.5px] leading-6 text-muted">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <div className="mt-12">
          <SourceList
            locale={locale}
            sources={coefficientSourcesFor(locale)}
            title={dict.common.sources}
            checkedLabel={dict.common.lastVerified}
          />
        </div>
      </PageShell>

      <JsonLd
        data={webPageSchema({
          locale,
          url: absolute(pathFor(locale, { name: "home" })),
          name: t.title,
          description: dict.home.subtitle,
        })}
      />
      <JsonLd data={faqSchema(faq)} />
    </>
  );
}

function AppAction({ href, icon, label, hint }: { href: string; icon: React.ReactNode; label: string; hint: string }) {
  return (
    <Link
      href={href}
      className="flex min-h-[74px] flex-col justify-between border border-line bg-surface p-3 transition-colors active:border-line-strong active:bg-raised"
    >
      <span className="text-muted">{icon}</span>
      <span>
        <span className="block text-[12.5px] font-semibold leading-4 text-ink">{label}</span>
        <span className="mt-0.5 block text-[10px] leading-4 text-muted">{hint}</span>
      </span>
    </Link>
  );
}

function StudyCard({ href, icon, title, text }: { href: string; icon: React.ReactNode; title: string; text: string }) {
  return (
    <Link href={href} className="group card flex items-start gap-3 p-4 transition-colors hover:border-line-strong">
      <span className="mt-0.5 text-muted transition-colors group-hover:text-brand">{icon}</span>
      <span className="min-w-0">
        <span className="block text-[13.5px] font-semibold text-ink group-hover:text-brand">{title}</span>
        <span className="mt-1 block text-[12px] leading-5 text-muted">{text}</span>
      </span>
    </Link>
  );
}

function ToolCard({ href, icon, title, text }: { href: string; icon: React.ReactNode; title: string; text: string }) {
  return (
    <Link href={href} className="group card flex items-start gap-3 p-4 transition-colors hover:border-line-strong">
      <span className="mt-0.5 text-muted transition-colors group-hover:text-brand">{icon}</span>
      <span className="min-w-0">
        <span className="block text-[13.5px] font-semibold text-ink group-hover:text-brand">{title}</span>
        <span className="mt-1 block line-clamp-2 text-[12px] leading-5 text-muted">{text}</span>
      </span>
    </Link>
  );
}

export const homeIcons = { IconCap, IconChart, IconTarget };
