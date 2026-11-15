import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { getDict } from "@/lib/i18n";
import { pathFor } from "@/lib/routes";
import { tx } from "@/lib/tx";
import { streams, subjectById } from "@/content/bac";
import { archiveSources, archiveStatus, examPageBlocks, examPages, findExamPage } from "@/content/exams";
import { absolute } from "@/lib/seo";
import { Badge, Callout, SectionHeader } from "@/components/ui";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Blocks } from "@/components/blocks";
import { SourceList, VerifiedStamp } from "@/components/source-list";
import { JsonLd, collectionSchema, learningResourceSchema } from "@/components/jsonld";
import { ExamsBrowser } from "@/components/exams-browser";
import { PageShell } from "./core";
import { IconArrow, IconInfo } from "@/components/icons";

export function ExamsPage({ locale }: { locale: Locale }) {
  const dict = getDict(locale);

  return (
    <>
      <PageShell>
        <Breadcrumbs locale={locale} items={[{ name: dict.nav.exams, target: { name: "exams" } }]} label={dict.common.home} />
        <SectionHeader
          as="h1"
          eyebrow={tx(locale, { ar: "أرشيف", fr: "Archive", en: "Archive" })}
          title={dict.exams.title}
          intro={dict.exams.intro}
          action={<VerifiedStamp locale={locale} verifiedOn={archiveStatus.checkedOn} label={tx(locale, { ar: "آخر تحقق", fr: "Vérifié le", en: "Checked" })} />}
        />

        <Callout tone="warn" title={archiveStatus.headline[locale]}>
          <p>{archiveStatus.body[locale]}</p>
        </Callout>

        <div className="mt-6">
          <ExamsBrowser locale={locale} />
        </div>

        <section className="mt-10 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="card p-5 sm:p-6">
            <h2 className="text-[14px] font-semibold text-ink">{dict.exams.notHosted}</h2>
            <p className="mt-2 text-[13px] leading-7 text-muted">{dict.exams.notHostedText}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href={pathFor(locale, { name: "guide", slug: "utiliser-sujets-bac" })} className="btn btn-sm">
                {tx(locale, { ar: "كيف تستعمل موضوعًا؟", fr: "Comment utiliser un sujet ?", en: "How to use a paper" })}
                <IconArrow size={14} />
              </Link>
              <a href="https://bac.onec.dz/" target="_blank" rel="noopener noreferrer" className="btn btn-sm">
                {dict.exams.officialSource}
              </a>
            </div>
          </div>
          <div className="card p-5 sm:p-6">
            <h2 className="flex items-center gap-2 text-[14px] font-semibold text-ink">
              <IconInfo size={16} className="text-muted" />
              {tx(locale, { ar: "حالة الفهرس", fr: "État de l’index", en: "Index status" })}
            </h2>
            <dl className="mt-3 space-y-2 text-[12.5px] text-muted">
              <div className="flex justify-between gap-3">
                <dt>{tx(locale, { ar: "سنوات مفهرسة", fr: "Années indexées", en: "Indexed years" })}</dt>
                <dd className="num font-medium text-ink">2021–2026</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>{tx(locale, { ar: "صفحات مرجعية", fr: "Pages de référence", en: "Reference pages" })}</dt>
                <dd className="num font-medium text-ink">{examPages.length}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>{tx(locale, { ar: "ملفات PDF مستضافة", fr: "PDF hébergés", en: "Hosted PDFs" })}</dt>
                <dd className="font-medium text-ink">0</dd>
              </div>
            </dl>
            <p className="mt-3 border-t border-line pt-3 text-[11px] leading-5 text-muted">{dict.exams.archiveNotice}</p>
          </div>
        </section>

        <div className="mt-10">
          <SourceList locale={locale} sources={archiveSources} title={dict.common.sources} checkedLabel={dict.common.lastVerified} />
        </div>
      </PageShell>

      <JsonLd
        data={collectionSchema({
          locale,
          url: absolute(pathFor(locale, { name: "exams" })),
          name: dict.exams.title,
          description: dict.exams.intro,
          items: examPages.map((page) => ({
            name: `${subjectById[page.subject]?.name[locale] ?? page.subject} — ${streams.find((s) => s.id === page.stream)?.name[locale] ?? page.stream} (${page.year})`,
            url: absolute(
              pathFor(locale, { name: "examSubject", year: page.year, stream: page.stream, subject: page.subject }),
            ),
          })),
        })}
      />
    </>
  );
}

export function ExamSubjectPage({
  locale,
  year,
  stream,
  subject,
}: {
  locale: Locale;
  year: number;
  stream: string;
  subject: string;
}) {
  const dict = getDict(locale);
  const page = findExamPage(year, stream, subject);
  const streamItem = streams.find((item) => item.id === stream);
  const subjectItem = subjectById[subject as keyof typeof subjectById];
  if (!page || !streamItem || !subjectItem) return null;

  const blocks = examPageBlocks({
    locale,
    subject: page.subject,
    streamName: streamItem.name[locale],
    subjectName: subjectItem.name[locale],
    coefficient: page.coefficient,
    year,
  });

  const siblings = examPages.filter((item) => item.stream === stream && item.subject !== subject);

  return (
    <>
      <PageShell>
        <Breadcrumbs
          locale={locale}
          items={[
            { name: dict.nav.exams, target: { name: "exams" } },
            { name: streamItem.name[locale], target: { name: "stream", stream } },
            { name: subjectItem.name[locale], target: { name: "examSubject", year, stream, subject } },
          ]}
          label={dict.common.home}
        />

        <div className="grid gap-8 lg:grid-cols-[1.35fr_0.65fr]">
          <article>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="neutral">
                <span className="num">{year}</span>
              </Badge>
              <Badge tone="brand">
                {dict.common.coefficient} <span className="num">{page.coefficient}</span>
              </Badge>
              <Badge tone="accent">{dict.exams.notHosted}</Badge>
            </div>
            <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              {subjectItem.name[locale]}
            </h1>
            <p className="mt-1 text-[14px] text-muted">
              {streamItem.name[locale]} · {tx(locale, { ar: "دورة", fr: "session", en: "session" })} {year}
            </p>

            <div className="mt-6">
              <Blocks blocks={blocks} locale={locale} />
            </div>

            <div className="mt-8">
              <SourceList locale={locale} sources={archiveSources} title={dict.common.sources} checkedLabel={dict.common.lastVerified} />
            </div>
          </article>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="card p-5">
              <h2 className="text-[13.5px] font-semibold text-ink">{dict.exams.structure}</h2>
              <dl className="mt-2 space-y-2 text-[12.5px]">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">{dict.common.stream}</dt>
                  <dd className="text-ink">{streamItem.shortName[locale]}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">{dict.common.coefficient}</dt>
                  <dd className="num text-ink">{page.coefficient}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">{dict.exams.documents}</dt>
                  <dd className="text-ink">0</dd>
                </div>
              </dl>
            </div>

            <div className="card p-5">
              <h2 className="text-[13.5px] font-semibold text-ink">{tx(locale, { ar: "مواد أخرى", fr: "Autres matières", en: "Other subjects" })}</h2>
              <ul className="mt-2 divide-y divide-line">
                {siblings.map((item) => (
                  <li key={item.subject}>
                    <Link
                      href={pathFor(locale, { name: "examSubject", year: item.year, stream, subject: item.subject })}
                      className="flex items-center justify-between gap-2 py-2 text-[12.5px] text-ink hover:text-brand"
                    >
                      <span>{subjectById[item.subject]?.name[locale]}</span>
                      <span className="num text-[11px] text-muted">{item.coefficient}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card p-5">
              <h2 className="text-[13.5px] font-semibold text-ink">{dict.nav.calculator}</h2>
              <p className="mt-1.5 text-[12px] leading-6 text-muted">{dict.calculator.hint}</p>
              <Link href={pathFor(locale, { name: "calculator" })} className="btn btn-sm mt-3 w-full">
                {dict.nav.calculator}
              </Link>
            </div>
          </aside>
        </div>
      </PageShell>

      <JsonLd
        data={learningResourceSchema({
          locale,
          name: `${subjectItem.name[locale]} — ${streamItem.name[locale]} (${year})`,
          description: `${dict.exams.title} · ${streamItem.name[locale]} · ${subjectItem.name[locale]}`,
          url: absolute(pathFor(locale, { name: "examSubject", year, stream, subject })),
        })}
      />
    </>
  );
}
