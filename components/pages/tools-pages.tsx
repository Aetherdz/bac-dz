import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { getDict } from "@/lib/i18n";
import { pathFor } from "@/lib/routes";
import { tx } from "@/lib/tx";
import { tools, toolBySlug, type ToolSlug } from "@/content/tools";
import { domainLabels, orientationFacts, orientationSources } from "@/content/orientation";
import { absolute } from "@/lib/seo";
import { Badge, Callout, SectionHeader } from "@/components/ui";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SourceList, VerifiedStamp } from "@/components/source-list";
import { JsonLd, faqSchema, softwareAppSchema, webPageSchema } from "@/components/jsonld";
import { PageShell } from "./core";
import { ImprovementCalculator, StudyTimeCalculator, WeightedAverage } from "@/components/tools/misc-tools";
import { TimetableGenerator } from "@/components/tools/planner";
import { ScoreSimulator } from "@/components/tools/score-simulator";
import { ScientificCalculator } from "@/components/tools/scientific-calculator";
import { OrientationSimulator } from "@/components/tools/orientation-simulator";
import { StudyPlanner } from "@/components/tools/planner";
import { IconArrow, IconCalculator, IconCalendar, IconCompass, IconWrench } from "@/components/icons";

const toolIcons: Record<string, React.ReactNode> = {
  "weighted-average": <IconCalculator size={18} />,
  "study-time": <IconWrench size={18} />,
  "revision-timetable": <IconCalendar size={18} />,
  "exam-score-simulator": <IconCalculator size={18} />,
  "average-improvement": <IconWrench size={18} />,
  "scientific-calculator": <IconCalculator size={18} />,
};

export function ToolsPage({ locale }: { locale: Locale }) {
  const dict = getDict(locale);
  return (
    <PageShell>
      <Breadcrumbs locale={locale} items={[{ name: dict.nav.tools, target: { name: "tools" } }]} label={dict.common.home} />
      <SectionHeader
        as="h1"
        eyebrow={tx(locale, { ar: "أدوات", fr: "Outils", en: "Tools" })}
        title={dict.tools.title}
        intro={dict.tools.intro}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <ToolLink
          href={pathFor(locale, { name: "calculator" })}
          icon={<IconCalculator size={18} />}
          title={dict.calculator.title}
          text={dict.calculator.intro}
          tag={tx(locale, { ar: "أساسية", fr: "Essentiel", en: "Core" })}
        />
        <ToolLink
          href={pathFor(locale, { name: "orientation" })}
          icon={<IconCompass size={18} />}
          title={dict.orientation.title}
          text={dict.orientation.intro}
          tag={tx(locale, { ar: "بيانات 2026", fr: "Données 2026", en: "2026 data" })}
        />
        <ToolLink
          href={pathFor(locale, { name: "planner" })}
          icon={<IconCalendar size={18} />}
          title={dict.planner.title}
          text={dict.planner.intro}
          tag={tx(locale, { ar: "تصدير ICS", fr: "Export ICS", en: "ICS export" })}
        />
        {tools.map((tool) => (
          <ToolLink
            key={tool.slug}
            href={pathFor(locale, { name: "tool", tool: tool.slug })}
            icon={toolIcons[tool.slug] ?? <IconWrench size={18} />}
            title={tool.title[locale]}
            text={tool.description[locale]}
          />
        ))}
      </div>

      <Callout tone="info" title={tx(locale, { ar: "الخصوصية أولًا", fr: "Confidentialité d’abord", en: "Privacy first" })}>
        <p>
          {tx(locale, {
            ar: "كل الحسابات تجري في متصفحك، ولا تُرسل نقاطك إلى أي خادم. الحفظ (عند توفره) محلي في جهازك، ويمكنك مسحه في أي وقت.",
            fr: "Tous les calculs se font dans votre navigateur ; vos notes ne sont envoyées à aucun serveur. L’enregistrement est local et effaçable.",
            en: "All calculations run in your browser; your grades are never sent to a server. Saving is local and can be cleared anytime.",
          })}
        </p>
      </Callout>
    </PageShell>
  );
}

function ToolLink({
  href,
  icon,
  title,
  text,
  tag,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  text: string;
  tag?: string;
}) {
  return (
    <Link href={href} className="card group flex items-start gap-3 p-4 transition-colors hover:border-brand/50">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line bg-raised text-brand">{icon}</span>
      <span className="min-w-0">
        <span className="flex items-center gap-2">
          <span className="text-[13.5px] font-semibold text-ink group-hover:text-brand">{title}</span>
          {tag && <span className="rounded-full border border-line px-2 py-0.5 text-[10px] text-muted">{tag}</span>}
        </span>
        <span className="mt-0.5 block text-[12px] leading-5 text-muted">{text}</span>
      </span>
    </Link>
  );
}

export function ToolPage({ locale, slug }: { locale: Locale; slug: string }) {
  const dict = getDict(locale);
  const tool = toolBySlug[slug as ToolSlug];
  if (!tool) return null;

  return (
    <>
      <PageShell>
        <Breadcrumbs
          locale={locale}
          items={[
            { name: dict.nav.tools, target: { name: "tools" } },
            { name: tool.title[locale], target: { name: "tool", tool: slug } },
          ]}
          label={dict.common.home}
        />
        <SectionHeader
          as="h1"
          eyebrow={tx(locale, { ar: "أداة", fr: "Outil", en: "Tool" })}
          title={tool.title[locale]}
          intro={tool.description[locale]}
        />

        <div className="max-w-4xl">
          <ToolBody locale={locale} slug={slug} />
        </div>

        <p className="mt-5 max-w-2xl text-[11.5px] leading-5 text-muted">{tool.note[locale]}</p>

        <section className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tools
            .filter((item) => item.slug !== slug)
            .slice(0, 3)
            .map((item) => (
              <ToolLink
                key={item.slug}
                href={pathFor(locale, { name: "tool", tool: item.slug })}
                icon={<IconWrench size={18} />}
                title={item.title[locale]}
                text={item.description[locale]}
              />
            ))}
        </section>
      </PageShell>

      <JsonLd
        data={softwareAppSchema({
          locale,
          name: tool.title[locale],
          description: tool.description[locale],
          url: absolute(pathFor(locale, { name: "tool", tool: slug })),
        })}
      />
    </>
  );
}

function ToolBody({ locale, slug }: { locale: Locale; slug: string }) {
  const dict = getDict(locale);
  switch (slug) {
    case "weighted-average":
      return <WeightedAverage locale={locale} />;
    case "study-time":
      return <StudyTimeCalculator locale={locale} />;
    case "revision-timetable":
      return <TimetableGenerator locale={locale} />;
    case "exam-score-simulator":
      return <ScoreSimulator locale={locale} />;
    case "average-improvement":
      return <ImprovementCalculator locale={locale} />;
    case "scientific-calculator":
      return (
        <ScientificCalculator
          labels={{
            expression: tx(locale, { ar: "التعبير", fr: "Expression", en: "Expression" }),
            result: tx(locale, { ar: "النتيجة", fr: "Résultat", en: "Result" }),
            clear: tx(locale, { ar: "مسح", fr: "Effacer", en: "Clear" }),
            equal: tx(locale, { ar: "يساوي", fr: "Égal", en: "Equals" }),
            degrees: tx(locale, { ar: "درجات", fr: "Degrés", en: "Degrees" }),
            radians: tx(locale, { ar: "راديان", fr: "Radians", en: "Radians" }),
            error: tx(locale, { ar: "تعبير غير صالح", fr: "Expression invalide", en: "Invalid expression" }),
            history: tx(locale, { ar: "السجل", fr: "Historique", en: "History" }),
          }}
        />
      );
    default:
      return <p className="text-sm text-muted">{dict.common.noResults}</p>;
  }
}

const orientationFaq: Record<Locale, { q: string; a: string }[]> = {
  ar: [
    { q: "هل المعدل المنشور عتبة ثابتة؟", a: "لا. هو معدل آخر مترشح قُبل في مؤسسة وتخصص محددين في تلك السنة، ويتغير كل سنة." },
    { q: "كم رغبة أستطيع إدخالها؟", a: "في دورة 2026: من 6 إلى 12 رغبة في بطاقة واحدة، مع رغبتين على الأقل في مسار مضمون محليًا أو جهويًا." },
    { q: "هل المحاكي يعرف فرصي الحقيقية؟", a: "لا. هو يقارن معدلك ببيانات تاريخية منشورة فقط، ولا يعرف الطاقة الاستيعابية ولا ترتيب بقية المترشحين." },
  ],
  fr: [
    { q: "Le seuil publié est-il fixe ?", a: "Non : c’est la moyenne du dernier admis dans un établissement et une filière donnés, variable chaque année." },
    { q: "Combien de vœux ?", a: "En 2026 : 6 à 12 vœux sur une seule fiche, dont au moins 2 à accès garanti local ou régional." },
    { q: "Le simulateur connaît-il mes chances réelles ?", a: "Non. Il compare votre moyenne à des données historiques publiées, sans connaître les capacités ni le classement des autres candidats." },
  ],
  en: [
    { q: "Is the published threshold fixed?", a: "No: it is the last admitted candidate’s average for a given institution and field, and it changes every year." },
    { q: "How many wishes?", a: "In 2026: 6 to 12 wishes on a single card, including at least 2 guaranteed local or regional places." },
    { q: "Does the simulator know my real chances?", a: "No. It compares your average with published historical data and knows neither capacity nor other candidates’ ranking." },
  ],
};

export function OrientationPage({ locale }: { locale: Locale }) {
  const dict = getDict(locale);
  const faq = orientationFaq[locale];

  return (
    <>
      <PageShell>
        <Breadcrumbs locale={locale} items={[{ name: dict.nav.orientation, target: { name: "orientation" } }]} label={dict.common.home} />
        <SectionHeader
          as="h1"
          eyebrow={tx(locale, { ar: "توجيه", fr: "Orientation", en: "Orientation" })}
          title={dict.orientation.title}
          intro={dict.orientation.intro}
          action={<VerifiedStamp locale={locale} verifiedOn="2026-11-15" label={dict.orientation.historical} />}
        />

        <OrientationSimulator locale={locale} />

        <section className="mt-12 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="card p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-ink">{dict.orientation.explanation}</h2>
            <ol className="mt-3 space-y-3">
              {[
                tx(locale, {
                  ar: "تسجيل مسبق إلكتروني خلال فترة محددة (في 2026: من 15 إلى 19 جويلية) على منصة orientation-esi.dz.",
                  fr: "Préinscription électronique pendant une fenêtre définie (15–19 juillet 2026) sur orientation-esi.dz.",
                  en: "Electronic pre-registration within a set window (15–19 July 2026) on orientation-esi.dz.",
                }),
                tx(locale, {
                  ar: "بطاقة رغبات واحدة: من 6 إلى 12 رغبة، مع رغبتين على الأقل في مسار مضمون محليًا أو جهويًا.",
                  fr: "Une seule fiche : 6 à 12 vœux, dont au moins 2 licences à accès garanti local ou régional.",
                  en: "One wish card: 6 to 12 wishes, including at least 2 guaranteed local or regional places.",
                }),
                tx(locale, {
                  ar: "معالجة آلية حسب الشعبة والنتائج والمعدل الموزون عند الحاجة والرغبات والطاقة الاستيعابية والتوزيع الجغرافي.",
                  fr: "Traitement automatique : filière, résultats, moyenne pondérée le cas échéant, vœux, capacité et district.",
                  en: "Automatic processing: stream, results, weighted average where needed, wishes, capacity and district.",
                }),
                tx(locale, {
                  ar: "إعلان نتائج المرحلة الأولى، ثم التسجيل النهائي والدفع على progres.mesrs.dz؛ ثم مرحلة ثانية للمترشحين غير الموجهين.",
                  fr: "Résultats de la phase 1, inscription finale et paiement sur progres.mesrs.dz, puis phase 2 pour les non-affectés.",
                  en: "Phase 1 results, final registration and payment on progres.mesrs.dz, then phase 2 for unplaced candidates.",
                }),
              ].map((step, index) => (
                <li key={step} className="flex gap-3 text-[13px] leading-7 text-ink/85">
                  <span className="num mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-line bg-raised text-[11px] font-semibold text-brand">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
            <p className="mt-4 text-[11.5px] leading-5 text-muted">{orientationFacts.portalNote[locale]}</p>
          </div>

          <div className="space-y-4">
            <div className="card p-5">
              <h2 className="text-[13.5px] font-semibold text-ink">{dict.orientation.officialLinks}</h2>
              <ul className="mt-2 space-y-2">
                {orientationFacts.livePortals.map((portal) => (
                  <li key={portal.url} className="flex items-center justify-between gap-3 text-[12.5px]">
                    <a href={portal.url} target="_blank" rel="noopener noreferrer" className="link">
                      {portal.label}
                    </a>
                    <span className="num text-[10.5px] text-muted">{portal.checkedOn}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="card p-5">
              <h2 className="text-[13.5px] font-semibold text-ink">{dict.orientation.prerequisite}</h2>
              <p className="mt-1.5 text-[12.5px] leading-6 text-muted">{orientationFacts.weightedAverage[locale]}</p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {(Object.keys(domainLabels) as (keyof typeof domainLabels)[]).map((domain) => (
                  <span key={domain} className="chip">
                    {domainLabels[domain][locale]}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="mt-8">
          <SourceList locale={locale} sources={orientationSources} title={dict.common.sources} checkedLabel={dict.common.lastVerified} />
        </div>

        <section className="mt-10 max-w-3xl">
          <h2 className="text-lg font-semibold text-ink">{tx(locale, { ar: "أسئلة متكررة", fr: "Questions fréquentes", en: "FAQ" })}</h2>
          <div className="mt-3 divide-y divide-line rounded-card border border-line bg-surface">
            {faq.map((item) => (
              <details key={item.q} className="group px-5 py-3.5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[13.5px] font-medium text-ink">
                  {item.q}
                  <span aria-hidden className="text-muted transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-2 text-[13px] leading-7 text-muted">{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      </PageShell>

      <JsonLd
        data={softwareAppSchema({
          locale,
          name: dict.orientation.title,
          description: dict.orientation.intro,
          url: absolute(pathFor(locale, { name: "orientation" })),
        })}
      />
      <JsonLd data={faqSchema(faq)} />
    </>
  );
}

export function PlannerPage({ locale }: { locale: Locale }) {
  const dict = getDict(locale);
  return (
    <>
      <PageShell>
        <Breadcrumbs locale={locale} items={[{ name: dict.nav.planner, target: { name: "planner" } }]} label={dict.common.home} />
        <SectionHeader
          as="h1"
          eyebrow={tx(locale, { ar: "تخطيط", fr: "Planification", en: "Planning" })}
          title={dict.planner.title}
          intro={dict.planner.intro}
          action={
            <Link href={pathFor(locale, { name: "guide", slug: "plan-revision-8-semaines" })} className="btn btn-sm">
              {tx(locale, { ar: "دليل 8 أسابيع", fr: "Guide 8 semaines", en: "8-week guide" })}
              <IconArrow size={14} />
            </Link>
          }
        />
        <StudyPlanner locale={locale} />
        <p className="mt-4 max-w-2xl text-[11.5px] leading-5 text-muted">
          {tx(locale, {
            ar: "التوزيع اقتراح تحريري مبني على المعاملات، وليس برنامجًا رسميًا. عدّله حسب ظروفك.",
            fr: "La répartition est une proposition éditoriale fondée sur les coefficients, pas un programme officiel. Adaptez-la.",
            en: "The allocation is an editorial suggestion based on coefficients, not an official schedule. Adapt it.",
          })}
        </p>
      </PageShell>

      <JsonLd
        data={softwareAppSchema({
          locale,
          name: dict.planner.title,
          description: dict.planner.intro,
          url: absolute(pathFor(locale, { name: "planner" })),
        })}
      />
    </>
  );
}

export { Badge };
