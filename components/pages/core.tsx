import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { getDict } from "@/lib/i18n";
import { pathFor } from "@/lib/routes";
import { tx } from "@/lib/tx";
import { coefficientSourcesFor, coefficientStatus, coefficientTimeline, nationalStats, streams } from "@/content/bac";
import { latestUpdates, updateKindLabels } from "@/content/updates";
import { guides } from "@/content/guides";
import { tools } from "@/content/tools";
import { absolute } from "@/lib/seo";
import { Badge, Stat } from "@/components/ui";
import { JsonLd, faqSchema, webPageSchema } from "@/components/jsonld";
import { SourceList } from "@/components/source-list";
import { BacCalculator } from "@/components/tools/bac-calculator";
import {
  IconArrow,
  IconBook,
  IconCalculator,
  IconCalendar,
  IconCap,
  IconChart,
  IconCompass,
  IconLayers,
  IconSearch,
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
    { q: "هل تنشرون مواضيع البكالوريا بصيغة PDF؟", a: "لا. لا يوجد أرشيف رسمي عمومي للمواضيع، ولا ننشر ملفات لا يمكن التحقق من مصدرها. نوفّر فهرسًا يحيل إلى المصادر الرسمية وشرحًا لمنهجية استعمال الموضوع." },
    { q: "هل معدل القبول المنشور ضمان للقبول؟", a: "لا. هو معدل آخر مترشح قُبل في تلك السنة، ويتغير كل سنة وحسب المؤسسة والتخصص والطاقة الاستيعابية." },
  ],
  fr: [
    { q: "Comment est calculée la moyenne du bac ?", a: "En additionnant (note × coefficient) puis en divisant par la somme des coefficients, pas par le nombre de matières." },
    { q: "Quels coefficients s’appliquent en 2027 ?", a: "Le tableau antérieur à la réforme de juillet 2026, abrogée par la décision n°36 du 9 septembre 2026. Les totaux vont de 27 à 34 selon la filière." },
    { q: "Hébergez-vous des sujets en PDF ?", a: "Non. Il n’existe pas d’archive publique officielle, et nous ne publions pas de fichiers non vérifiables. Nous tenons un index et expliquons la méthode." },
    { q: "Un seuil d’admission est-il une garantie ?", a: "Non : c’est la moyenne du dernier admis de l’année, variable selon l’établissement, la filière et la capacité." },
  ],
  en: [
    { q: "How is the bac average calculated?", a: "By summing (grade × coefficient) and dividing by the sum of coefficients, not the number of subjects." },
    { q: "Which coefficients apply in 2027?", a: "The table predating the July 2026 reform, which was repealed by decision no. 36 of 9 September 2026. Totals range from 27 to 34 by stream." },
    { q: "Do you host past papers as PDFs?", a: "No. There is no official public archive, and we do not publish unverifiable files. We keep an index and explain the method." },
    { q: "Is an admission threshold a guarantee?", a: "No: it is the last admitted candidate’s average for that year and varies by institution, field and capacity." },
  ],
};

export function HomePage({ locale }: { locale: Locale }) {
  const dict = getDict(locale);
  const t = dict.home;
  const faq = homeFaq[locale];
  const featuredGuides = guides.filter((guide) => guide.featured).slice(0, 3);
  const mainTools = tools.filter((tool) =>
    ["bac-countdown", "weighted-average", "exam-score-simulator", "scientific-calculator", "study-time", "revision-timetable"].includes(tool.slug),
  );

  return (
    <>
      <section className="relative overflow-hidden border-b border-line bg-surface">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.35] [background:radial-gradient(60%_60%_at_85%_0%,rgb(var(--brand)/0.14),transparent_70%),radial-gradient(45%_55%_at_10%_100%,rgb(var(--gold)/0.12),transparent_70%)]"
        />
        <div className="shell relative grid gap-10 py-12 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-12 lg:py-20">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="brand">{t.kicker}</Badge>
              <Badge tone="gold">
                {locale === "ar" ? "معاملات موثّقة" : locale === "fr" ? "Coefficients vérifiés" : "Verified coefficients"}
              </Badge>
            </div>
            <h1 className="mt-5 max-w-[18ch] font-display text-[2.1rem] font-semibold leading-[1.12] tracking-tight text-ink sm:text-[2.8rem] lg:text-[3.1rem]">
              {t.title}
            </h1>
            <p className="mt-4 max-w-prose text-[15px] leading-7 text-muted sm:text-base sm:leading-8">{t.subtitle}</p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={pathFor(locale, { name: "calculator" })} className="btn btn-primary">
                <IconCalculator size={17} />
                {t.primaryCta}
              </Link>
              <Link href={pathFor(locale, { name: "exams" })} className="btn">
                <IconLayers size={17} />
                {t.secondaryCta}
              </Link>
            </div>

            <form action={pathFor(locale, { name: "search" })} className="mt-8 max-w-xl" role="search">
              <label htmlFor="home-search" className="mb-2 block text-[12.5px] font-medium text-muted">
                {t.searchLabel}
              </label>
              <div className="flex items-center gap-2 rounded-full border border-line bg-surface p-1.5 shadow-sm focus-within:border-brand">
                <span className="ps-2.5 text-muted" aria-hidden>
                  <IconSearch size={17} />
                </span>
                <input
                  id="home-search"
                  name="q"
                  type="search"
                  placeholder={t.searchPlaceholder}
                  className="min-h-9 w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted/70"
                />
                <button type="submit" className="btn btn-primary btn-sm shrink-0">
                  {dict.actions.search}
                </button>
              </div>
            </form>

            <dl className="mt-9 grid max-w-xl grid-cols-2 gap-y-5 sm:grid-cols-4">
              <Stat value={nationalStats.candidatesPerYear} label={t.statsStudents} />
              <Stat value={String(nationalStats.streams)} label={t.statsStreams} />
              <Stat value={String(nationalStats.subjects)} label={t.statsSubjects} />
              <Stat value={String(nationalStats.tools)} label={t.statsTools} />
            </dl>
          </div>

          <div className="lg:sticky lg:top-24">
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <h2 className="text-[15px] font-semibold text-ink">{t.quickCalc}</h2>
              <Link href={pathFor(locale, { name: "calculator" })} className="link text-[12.5px]">
                {dict.common.readMore}
              </Link>
            </div>
            <p className="mb-3 text-[12.5px] leading-5 text-muted">{t.quickCalcHint}</p>
            <BacCalculator locale={locale} compact />
          </div>
        </div>
      </section>

      <PageShell>
        <section aria-labelledby="session-status" className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
          <div className="card p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="eyebrow">{t.sessionStatus}</div>
                <h2 id="session-status" className="mt-1 text-lg font-semibold text-ink">
                  {coefficientStatus.label[locale]}
                </h2>
              </div>
              <Badge tone="brand">
                {dict.common.lastVerified}: {coefficientStatus.verifiedOn}
              </Badge>
            </div>
            <p className="mt-3 text-[13.5px] leading-6 text-muted">
              {tx(locale, {
                ar: "أُعلن تعديل واسع للمعاملات في جويلية 2026 ثم أُلغي في سبتمبر 2026. المنصة تعتمد الجدول الذي عاد ساريًا، وتوثّق كل تغيير.",
                fr: "Une réforme large a été annoncée en juillet 2026 puis abrogée en septembre 2026. La plateforme applique le tableau rétabli et documente chaque changement.",
                en: "A broad reform was announced in July 2026 and repealed in September 2026. The platform applies the restored table and documents every change.",
              })}
            </p>
            <ol className="mt-4 space-y-3">
              {coefficientTimeline.map((event) => (
                <li key={event.date} className="flex gap-3">
                  <time dateTime={event.date} className="num mt-0.5 w-[74px] shrink-0 text-[11px] text-muted">
                    {event.date}
                  </time>
                  <span className="text-[13px] leading-6 text-ink/85">{event.label[locale]}</span>
                </li>
              ))}
            </ol>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href={pathFor(locale, { name: "coefficients" })} className="btn btn-sm">
                {dict.nav.coefficients}
                <IconArrow size={15} />
              </Link>
              <Link href={pathFor(locale, { name: "update", slug: "abrogation-reforme-coefficients-2026" })} className="btn btn-sm">
                {dict.nav.updates}
              </Link>
            </div>
          </div>

          <div className="card p-5 sm:p-6">
            <div className="eyebrow">{t.popularStreams}</div>
            <ul className="mt-3 divide-y divide-line">
              {streams.slice(0, 4).map((stream) => {
                const total = stream.coefficients.reduce((sum, entry) => sum + entry.coefficient, 0);
                return (
                  <li key={stream.id}>
                    <Link
                      href={pathFor(locale, { name: "stream", stream: stream.id })}
                      className="flex items-center justify-between gap-3 py-2.5 text-[13.5px] text-ink hover:text-brand"
                    >
                      <span>{stream.name[locale]}</span>
                      <span className="num shrink-0 text-[11.5px] text-muted">
                        {total} {locale === "ar" ? "معاملًا" : locale === "fr" ? "coef." : "coef."}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <Link href={pathFor(locale, { name: "streams" })} className="link mt-3 inline-flex items-center gap-1 text-[12.5px]">
              {dict.nav.streams}
              <IconArrow size={14} />
            </Link>
          </div>
        </section>

        <section aria-labelledby="tools-heading" className="mt-14">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="eyebrow">{locale === "ar" ? "أدوات" : locale === "fr" ? "Outils" : "Tools"}</div>
              <h2 id="tools-heading" className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">
                {t.toolsTitle}
              </h2>
            </div>
            <Link href={pathFor(locale, { name: "tools" })} className="link text-[12.5px]">
              {dict.actions.all} {dict.nav.tools}
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <ToolCard
              href={pathFor(locale, { name: "calculator" })}
              icon={<IconCalculator size={18} />}
              title={dict.calculator.title}
              text={dict.calculator.intro}
            />
            <ToolCard
              href={pathFor(locale, { name: "orientation" })}
              icon={<IconCompass size={18} />}
              title={dict.orientation.title}
              text={dict.orientation.intro}
            />
            <ToolCard
              href={pathFor(locale, { name: "planner" })}
              icon={<IconCalendar size={18} />}
              title={dict.planner.title}
              text={dict.planner.intro}
            />
            {mainTools.slice(0, 3).map((tool) => (
              <ToolCard
                key={tool.slug}
                href={pathFor(locale, { name: "tool", tool: tool.slug })}
                icon={<IconWrench size={18} />}
                title={tool.title[locale]}
                text={tool.description[locale]}
              />
            ))}
          </div>
        </section>

        <section className="mt-14 grid gap-4 lg:grid-cols-2">
          <div className="card flex flex-col justify-between gap-4 p-6">
            <div>
              <div className="eyebrow">{dict.nav.exams}</div>
              <h2 className="mt-1 font-display text-xl font-semibold text-ink">{t.latestExams}</h2>
              <p className="mt-2 text-[13.5px] leading-6 text-muted">
                {tx(locale, {
                  ar: "فهرس حسب السنة والشعبة والمادة، مع حالة كل وثيقة ورابط المصدر الرسمي. لا نستضيف ملفات غير متحقق منها.",
                  fr: "Index par année, filière et matière, avec le statut de chaque document et le lien officiel. Aucun fichier non vérifié.",
                  en: "Index by year, stream and subject, with each document’s status and the official link. No unverified file.",
                })}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {[2026, 2025, 2024].map((year) => (
                <Badge key={year} tone="neutral">
                  <span className="num">{year}</span>
                </Badge>
              ))}
              <Link href={pathFor(locale, { name: "exams" })} className="btn btn-sm ms-auto">
                {t.secondaryCta}
              </Link>
            </div>
          </div>

          <div className="card flex flex-col justify-between gap-4 p-6">
            <div>
              <div className="eyebrow">{dict.nav.orientation}</div>
              <h2 className="mt-1 font-display text-xl font-semibold text-ink">{t.orientationTitle}</h2>
              <p className="mt-2 text-[13.5px] leading-6 text-muted">{t.orientationText}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[11.5px] text-muted">
              <Badge tone="gold">
                {tx(locale, { ar: "بيانات 2026 الرسمية", fr: "Données officielles 2026", en: "Official 2026 data" })}
              </Badge>
              <Link href={pathFor(locale, { name: "orientation" })} className="btn btn-sm">
                {dict.orientation.simulateTitle}
              </Link>
            </div>
          </div>
        </section>

        <section aria-labelledby="guides-heading" className="mt-14">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="eyebrow">{locale === "ar" ? "دليل" : locale === "fr" ? "Guides" : "Guides"}</div>
              <h2 id="guides-heading" className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">
                {t.guidesTitle}
              </h2>
            </div>
            <Link href={pathFor(locale, { name: "guides" })} className="link text-[12.5px]">
              {dict.actions.all} {dict.nav.guides}
            </Link>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {featuredGuides.map((guide) => {
              const content = guide.locales[locale];
              return (
                <Link
                  key={guide.slug}
                  href={pathFor(locale, { name: "guide", slug: guide.slug })}
                  className="card group flex flex-col gap-2 p-5 transition-colors hover:border-brand/50"
                >
                  <div className="flex items-center gap-2 text-[11px] text-muted">
                    <IconBook size={14} />
                    <span>{guide.readingMinutes} {dict.common.minutes}</span>
                    <span aria-hidden>·</span>
                    <span className="num">{guide.updated}</span>
                  </div>
                  <h3 className="text-[15px] font-semibold leading-snug text-ink group-hover:text-brand">{content.title}</h3>
                  <p className="line-clamp-3 text-[13px] leading-6 text-muted">{content.description}</p>
                </Link>
              );
            })}
          </div>
        </section>

        <section aria-labelledby="updates-heading" className="mt-14 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="card p-5 sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <div className="eyebrow">{dict.nav.updates}</div>
                <h2 id="updates-heading" className="mt-1 font-display text-xl font-semibold text-ink">
                  {t.updatesTitle}
                </h2>
              </div>
              <Link href={pathFor(locale, { name: "updates" })} className="link text-[12.5px]">
                {dict.actions.all}
              </Link>
            </div>
            <ul className="mt-4 divide-y divide-line">
              {latestUpdates.slice(0, 3).map((entry) => (
                <li key={entry.slug}>
                  <Link href={pathFor(locale, { name: "update", slug: entry.slug })} className="group block py-3">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted">
                      <time dateTime={entry.date} className="num">
                        {entry.date}
                      </time>
                      <Badge tone={entry.kind === "official" ? "gold" : "neutral"}>{updateKindLabels[entry.kind][locale]}</Badge>
                    </div>
                    <div className="mt-1 text-[13.5px] font-medium leading-6 text-ink group-hover:text-brand">
                      {entry.title[locale]}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-5 sm:p-6">
            <div className="eyebrow">{t.trustTitle}</div>
            <ul className="mt-3 space-y-3 text-[13px] leading-6 text-muted">
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
                <li key={item} className="flex gap-2.5">
                  <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
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
        </section>

        <section aria-labelledby="faq-heading" className="mt-14 max-w-3xl">
          <div className="eyebrow">{tx(locale, { ar: "أسئلة متكررة", fr: "Questions fréquentes", en: "Frequently asked" })}</div>
          <h2 id="faq-heading" className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">
            {tx(locale, { ar: "أسئلة يسألها الطلبة كل سنة", fr: "Les questions que les candidats posent chaque année", en: "Questions candidates ask every year" })}
          </h2>
          <div className="mt-4 divide-y divide-line rounded-card border border-line bg-surface">
            {faq.map((item) => (
              <details key={item.q} className="group px-5 py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[14px] font-medium text-ink">
                  {item.q}
                  <span aria-hidden className="text-muted transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-2 text-[13.5px] leading-7 text-muted">{item.a}</p>
              </details>
            ))}
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

function ToolCard({ href, icon, title, text }: { href: string; icon: React.ReactNode; title: string; text: string }) {
  return (
    <Link href={href} className="card group flex items-start gap-3 p-4 transition-colors hover:border-brand/50">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line bg-raised text-brand">{icon}</span>
      <span className="min-w-0">
        <span className="block text-[13.5px] font-semibold text-ink group-hover:text-brand">{title}</span>
        <span className="mt-0.5 block line-clamp-2 text-[12px] leading-5 text-muted">{text}</span>
      </span>
    </Link>
  );
}

export const homeIcons = { IconCap, IconChart, IconTarget };
