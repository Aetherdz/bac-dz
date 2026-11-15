import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { getDict } from "@/lib/i18n";
import { pathFor } from "@/lib/routes";
import { tx } from "@/lib/tx";
import { guideCategories, getGuide, guides } from "@/content/guides";
import { updateBySlug, updateKindLabels, updates, latestUpdates } from "@/content/updates";
import { absolute } from "@/lib/seo";
import { Badge, SectionHeader } from "@/components/ui";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Blocks } from "@/components/blocks";
import { SourceList, VerifiedStamp } from "@/components/source-list";
import { JsonLd, articleSchema, faqSchema, webPageSchema } from "@/components/jsonld";
import { PageShell } from "./core";
import { IconArrow, IconBook, IconClock } from "@/components/icons";

export function GuidesPage({ locale }: { locale: Locale }) {
  const dict = getDict(locale);
  const categories = Object.keys(guideCategories) as (keyof typeof guideCategories)[];

  return (
    <PageShell>
      <Breadcrumbs locale={locale} items={[{ name: dict.nav.guides, target: { name: "guides" } }]} label={dict.common.home} />
      <SectionHeader
        as="h1"
        eyebrow={tx(locale, { ar: "دليل", fr: "Guides", en: "Guides" })}
        title={tx(locale, {
          ar: "أدلة عملية للبكالوريا: حساب، مراجعة، منهجية، وتوجيه",
          fr: "Guides pratiques du bac : calcul, révision, méthode et orientation",
          en: "Practical bac guides: calculation, revision, method and orientation",
        })}
        intro={tx(locale, {
          ar: "كل دليل مكتوب ليجيب عن سؤال محدد، بمصادر ظاهرة وتاريخ تحديث. لا صفحات مولّدة آليًا ولا محتوى مكرر.",
          fr: "Chaque guide répond à une question précise, avec sources visibles et date de mise à jour. Pas de pages générées à la chaîne.",
          en: "Each guide answers a specific question, with visible sources and an update date. No mass-generated pages.",
        })}
      />

      <div className="mb-6 flex flex-wrap gap-1.5">
        {categories.map((category) => (
          <span key={category} className="chip">
            {guideCategories[category][locale]}
          </span>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {guides.map((guide) => {
          const content = guide.locales[locale];
          return (
            <Link
              key={guide.slug}
              href={pathFor(locale, { name: "guide", slug: guide.slug })}
              className="card group flex flex-col gap-2.5 p-5 transition-colors hover:border-brand/50"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="brand">{guideCategories[guide.category][locale]}</Badge>
                {guide.featured && <Badge tone="gold">{tx(locale, { ar: "مميّز", fr: "À la une", en: "Featured" })}</Badge>}
              </div>
              <h2 className="text-[15.5px] font-semibold leading-snug text-ink group-hover:text-brand">{content.title}</h2>
              <p className="text-[13px] leading-6 text-muted">{content.description}</p>
              <div className="mt-auto flex flex-wrap items-center gap-3 pt-1 text-[11px] text-muted">
                <span className="inline-flex items-center gap-1">
                  <IconClock size={13} />
                  <span className="num">{guide.readingMinutes}</span> {dict.common.minutes}
                </span>
                <span className="inline-flex items-center gap-1">
                  {dict.common.updated} <time dateTime={guide.updated} className="num">{guide.updated}</time>
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </PageShell>
  );
}

export function GuidePage({ locale, slug }: { locale: Locale; slug: string }) {
  const dict = getDict(locale);
  const guide = getGuide(slug);
  if (!guide) return null;
  const content = guide.locales[locale];
  const related = guide.related.map((item) => getGuide(item)).filter(Boolean);
  const url = absolute(pathFor(locale, { name: "guide", slug }));

  return (
    <>
      <PageShell>
        <Breadcrumbs
          locale={locale}
          items={[
            { name: dict.nav.guides, target: { name: "guides" } },
            { name: content.title, target: { name: "guide", slug } },
          ]}
          label={dict.common.home}
        />

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_260px]">
          <article className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="brand">{guideCategories[guide.category][locale]}</Badge>
              <Badge tone="neutral">
                <IconBook size={12} />
                <span className="num">{guide.readingMinutes}</span> {dict.common.minutes}
              </Badge>
            </div>
            <h1 className="mt-3 font-display text-[1.9rem] font-semibold leading-tight tracking-tight text-ink sm:text-[2.35rem]">
              {content.title}
            </h1>
            <p className="mt-3 max-w-prose text-[15px] leading-8 text-muted">{content.description}</p>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px] text-muted">
              <span>
                {dict.common.published}: <time dateTime={guide.published} className="num">{guide.published}</time>
              </span>
              <span>
                {dict.common.updated}: <time dateTime={guide.updated} className="num">{guide.updated}</time>
              </span>
              <span>{dict.footer.independent}</span>
            </div>

            <div className="mt-8">
              <Blocks blocks={content.blocks} locale={locale} />
            </div>

            {content.faq && content.faq.length > 0 && (
              <section className="mt-10">
                <h2 className="text-xl font-semibold text-ink">
                  {tx(locale, { ar: "أسئلة متكررة", fr: "Questions fréquentes", en: "Frequently asked" })}
                </h2>
                <div className="mt-3 divide-y divide-line rounded-card border border-line bg-surface">
                  {content.faq.map((item) => (
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
            )}

            <div className="mt-8">
              <SourceList locale={locale} sources={guide.sources} title={dict.common.sources} checkedLabel={dict.common.lastVerified} />
            </div>

            <section className="mt-8 rounded-card border border-line bg-raised p-5">
              <h2 className="text-[13px] font-semibold text-ink">{tx(locale, { ar: "عن هذا الدليل", fr: "À propos de ce guide", en: "About this guide" })}</h2>
              <p className="mt-1.5 text-[12.5px] leading-6 text-muted">
                {tx(locale, {
                  ar: "محتوى تحريري مستقل. الحقائق الرقمية (المعاملات، العتبات) تحمل مصادرها؛ الشرح والمنهجية اجتهاد تحريري وليس تعليمات رسمية.",
                  fr: "Contenu éditorial indépendant. Les données chiffrées (coefficients, seuils) portent leurs sources ; les conseils de méthode sont éditoriaux, pas des consignes officielles.",
                  en: "Independent editorial content. Numerical facts (coefficients, thresholds) carry their sources; method advice is editorial, not official instructions.",
                })}
              </p>
            </section>
          </article>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="card p-5">
              <h2 className="text-[12.5px] font-semibold text-ink">{dict.common.related}</h2>
              <ul className="mt-2 space-y-2.5">
                {related.map((item) =>
                  item ? (
                    <li key={item.slug}>
                      <Link href={pathFor(locale, { name: "guide", slug: item.slug })} className="group block">
                        <span className="block text-[12.5px] font-medium leading-5 text-ink group-hover:text-brand">
                          {item.locales[locale].title}
                        </span>
                        <span className="mt-0.5 block text-[10.5px] text-muted">{guideCategories[item.category][locale]}</span>
                      </Link>
                    </li>
                  ) : null,
                )}
              </ul>
            </div>
            <div className="card p-5">
              <h2 className="text-[12.5px] font-semibold text-ink">{dict.nav.tools}</h2>
              <div className="mt-2 space-y-2">
                <Link href={pathFor(locale, { name: "calculator" })} className="btn btn-sm w-full justify-between">
                  {dict.nav.calculator}
                  <IconArrow size={14} />
                </Link>
                <Link href={pathFor(locale, { name: "planner" })} className="btn btn-sm w-full justify-between">
                  {dict.nav.planner}
                  <IconArrow size={14} />
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </PageShell>

      <JsonLd
        data={articleSchema({
          locale,
          url,
          headline: content.title,
          description: content.description,
          published: guide.published,
          updated: guide.updated,
          image: `${absolute(pathFor(locale, { name: "guide", slug }))}/opengraph-image`,
          section: guideCategories[guide.category][locale],
        })}
      />
      {content.faq && content.faq.length > 0 && <JsonLd data={faqSchema(content.faq)} />}
      <JsonLd
        data={webPageSchema({
          locale,
          url,
          name: content.title,
          description: content.description,
          updated: guide.updated,
        })}
      />
    </>
  );
}

export function UpdatesPage({ locale }: { locale: Locale }) {
  const dict = getDict(locale);
  return (
    <PageShell>
      <Breadcrumbs locale={locale} items={[{ name: dict.nav.updates, target: { name: "updates" } }]} label={dict.common.home} />
      <SectionHeader
        as="h1"
        eyebrow={tx(locale, { ar: "سجل", fr: "Journal", en: "Log" })}
        title={tx(locale, {
          ar: "آخر التحديثات الموثّقة",
          fr: "Dernières mises à jour vérifiées",
          en: "Latest verified updates",
        })}
        intro={tx(locale, {
          ar: "كل تغيير يمس البكالوريا أو بيانات المنصة، بتاريخ الحدث وتاريخ التحقق. لا نؤرّخ حدثًا لم نتحقق منه.",
          fr: "Chaque changement concernant le bac ou les données du site, avec date de l’événement et date de vérification.",
          en: "Every change affecting the bac or the platform’s data, with event date and verification date.",
        })}
      />

      <div className="divide-y divide-line rounded-card border border-line bg-surface">
        {latestUpdates.map((entry) => (
          <Link key={entry.slug} href={pathFor(locale, { name: "update", slug: entry.slug })} className="group block px-5 py-5">
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted">
              <time dateTime={entry.date} className="num font-medium text-ink/70">
                {entry.date}
              </time>
              <Badge tone={entry.kind === "official" ? "gold" : "neutral"}>{updateKindLabels[entry.kind][locale]}</Badge>
              <span>
                {dict.common.lastVerified}: <span className="num">{entry.checkedOn}</span>
              </span>
            </div>
            <h2 className="mt-1.5 text-[15px] font-semibold leading-snug text-ink group-hover:text-brand">{entry.title[locale]}</h2>
            <p className="mt-1 max-w-3xl text-[13px] leading-6 text-muted">{entry.summary[locale]}</p>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}

export function UpdatePage({ locale, slug }: { locale: Locale; slug: string }) {
  const dict = getDict(locale);
  const entry = updateBySlug[slug];
  if (!entry) return null;
  const related = updates.filter((item) => item.slug !== slug).slice(0, 3);
  const url = absolute(pathFor(locale, { name: "update", slug }));

  return (
    <>
      <PageShell>
        <Breadcrumbs
          locale={locale}
          items={[
            { name: dict.nav.updates, target: { name: "updates" } },
            { name: entry.title[locale], target: { name: "update", slug } },
          ]}
          label={dict.common.home}
        />
        <article className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={entry.kind === "official" ? "gold" : "neutral"}>{updateKindLabels[entry.kind][locale]}</Badge>
            <VerifiedStamp locale={locale} verifiedOn={entry.checkedOn} label={dict.common.lastVerified} />
          </div>
          <h1 className="mt-3 font-display text-[1.9rem] font-semibold leading-tight tracking-tight text-ink sm:text-[2.25rem]">
            {entry.title[locale]}
          </h1>
          <p className="mt-2 text-[13px] text-muted">
            {tx(locale, { ar: "تاريخ الحدث", fr: "Date de l’événement", en: "Event date" })}:{" "}
            <time dateTime={entry.date} className="num">{entry.date}</time>
          </p>
          <p className="mt-4 text-[15px] leading-8 text-ink/85">{entry.summary[locale]}</p>

          <div className="mt-6">
            <Blocks blocks={entry.blocks[locale]} locale={locale} />
          </div>

          <div className="mt-8">
            <SourceList locale={locale} sources={entry.sources} title={dict.common.sources} checkedLabel={dict.common.lastVerified} />
          </div>

          <section className="mt-8">
            <h2 className="text-[13px] font-semibold text-ink">{dict.common.related}</h2>
            <ul className="mt-2 space-y-2">
              {related.map((item) => (
                <li key={item.slug}>
                  <Link href={pathFor(locale, { name: "update", slug: item.slug })} className="link text-[13px]">
                    {item.title[locale]}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </article>
      </PageShell>

      <JsonLd
        data={articleSchema({
          locale,
          url,
          headline: entry.title[locale],
          description: entry.summary[locale],
          published: entry.date,
          updated: entry.checkedOn,
          image: absolute(`/api/og?t=${encodeURIComponent("BAC DZ update")}&l=${locale}`),
        })}
      />
    </>
  );
}
