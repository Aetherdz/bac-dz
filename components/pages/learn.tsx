import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { getDict } from "@/lib/i18n";
import { pathFor } from "@/lib/routes";
import { tx } from "@/lib/tx";
import { coefficientSourcesFor, coefficientStatus, streams, streamById, subjectById, subjectNameForStream, totalCoefficient } from "@/content/bac";
import { examPages } from "@/content/exams";
import { absolute } from "@/lib/seo";
import { Badge, Callout, SectionHeader } from "@/components/ui";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SourceList, VerifiedStamp } from "@/components/source-list";
import { JsonLd, faqSchema, softwareAppSchema, webPageSchema } from "@/components/jsonld";
import { BacCalculator } from "@/components/tools/bac-calculator";
import { PageShell } from "./core";
import { IconArrow, IconCalculator, IconCheck } from "@/components/icons";

export function CalculatorPage({ locale }: { locale: Locale }) {
  const dict = getDict(locale);
  const t = dict.calculator;

  const method =
    locale === "ar"
      ? [
          "اضرب نقطة كل مادة في معاملها، ثم اجمع النتائج.",
          "اجمع معاملات المواد التي أدخلت نقطتها فقط.",
          "اقسم مجموع النقاط الموزونة على مجموع المعاملات، ثم قرّب إلى منزلتين.",
        ]
      : locale === "fr"
        ? [
            "Multipliez chaque note par le coefficient de sa matière, puis additionnez.",
            "Additionnez les coefficients des matières effectivement notées.",
            "Divisez le total pondéré par le total des coefficients, puis arrondissez à deux décimales.",
          ]
        : [
            "Multiply each grade by its subject coefficient, then add the results.",
            "Add the coefficients of the subjects you actually filled in.",
            "Divide the weighted total by the coefficient total and round to two decimals.",
          ];

  const faq =
    locale === "ar"
      ? [
          { q: "هل تُحتسب المواد التي ليس لدي فيها نقطة؟", a: "لا. الحاسبة تستثنيها وتُظهر عدد المواد المحتسبة ومجموع معاملاتها. هذا يمنع احتسابها كصفر بشكل خاطئ." },
          { q: "هل النتيجة رسمية؟", a: "لا. هي نتيجة حسابية مطابقة لقاعدة المعدل الموزون، لكن المعدل الرسمي يصدر عن الديوان الوطني للامتحانات والمسابقات." },
          { q: "هل تُرسل نقاطي إلى خادم؟", a: "لا. كل الحساب يجري في متصفحك، والحفظ (إن فعّلته) محلي فقط." },
        ]
      : locale === "fr"
        ? [
            { q: "Les matières sans note sont-elles comptées ?", a: "Non. Le calculateur les exclut et affiche le nombre de matières comptées et le total des coefficients, pour éviter de les compter comme zéro." },
            { q: "Le résultat est-il officiel ?", a: "Non. C’est un calcul conforme à la règle de la moyenne pondérée ; la moyenne officielle est délivrée par l’ONEC." },
            { q: "Mes notes sont-elles envoyées ?", a: "Non. Tout est calculé dans votre navigateur ; l’enregistrement, si activé, reste local." },
          ]
        : [
            { q: "Are subjects without a grade counted?", a: "No. The calculator excludes them and shows how many subjects and coefficients are counted, so they are not treated as zero." },
            { q: "Is the result official?", a: "No. It is a calculation following the weighted-average rule; the official average is issued by ONEC." },
            { q: "Are my grades sent anywhere?", a: "No. Everything runs in your browser; saving, if enabled, is local." },
          ];

  return (
    <>
      <PageShell>
        <Breadcrumbs locale={locale} items={[{ name: t.title, target: { name: "calculator" } }]} label={dict.common.home} />
        <SectionHeader
          as="h1"
          eyebrow={tx(locale, { ar: "أداة", fr: "Outil", en: "Tool" })}
          title={t.title}
          intro={t.intro}
          action={<VerifiedStamp locale={locale} verifiedOn={coefficientStatus.verifiedOn} label={coefficientStatus.label[locale]} />}
        />

        <BacCalculator locale={locale} />

        <section className="mt-12 grid gap-5 lg:grid-cols-[1fr_0.85fr]">
          <div className="card p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-ink">{t.method}</h2>
            <p className="mt-2 text-[13.5px] leading-7 text-muted">
              {tx(locale, {
                ar: "المعدل موزون: لا يُقسم على عدد المواد بل على مجموع المعاملات.",
                fr: "La moyenne est pondérée : on divise par la somme des coefficients, pas par le nombre de matières.",
                en: "The average is weighted: divide by the sum of coefficients, not the number of subjects.",
              })}
            </p>
            <div dir="ltr" className="num mt-4 overflow-x-auto rounded-lg border border-line bg-raised px-4 py-3 text-center font-mono text-[14px] text-ink">
              Moyenne = Σ(note × coefficient) ÷ Σ(coefficients)
            </div>
            <ol className="mt-4 space-y-2.5">
              {method.map((step, index) => (
                <li key={step} className="flex gap-3 text-[13.5px] leading-7 text-ink/85">
                  <span className="num mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-line bg-surface text-[11px] font-semibold text-brand">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
            <p className="mt-4 text-[12px] leading-6 text-muted">
              {tx(locale, {
                ar: "عتبة النجاح 10/20. المواد الاختيارية تُحتسب فقط إذا كانت لديك نقطة فيها وكانت مقررة في شعبتك.",
                fr: "Seuil d’admission : 10/20. Les matières facultatives ne comptent que si vous avez une note et qu’elles relèvent de votre filière.",
                en: "Pass mark: 10/20. Optional subjects count only if you have a grade and they belong to your stream.",
              })}
            </p>
          </div>

          <div className="space-y-4">
            <Callout tone="official" title={tx(locale, { ar: "مصدر المعاملات", fr: "Source des coefficients", en: "Coefficient source" })}>
              <p>{coefficientStatus.label[locale]}</p>
              <p className="mt-2 text-[12.5px] leading-6 text-muted">{coefficientStatus.notes[locale][0]}</p>
              <Link href={pathFor(locale, { name: "coefficients" })} className="link mt-2 inline-flex items-center gap-1 text-[12.5px]">
                {dict.nav.coefficients}
                <IconArrow size={14} />
              </Link>
            </Callout>
            <div className="card p-5">
              <h2 className="text-[13.5px] font-semibold text-ink">
                {tx(locale, { ar: "ابدأ من شعبتك", fr: "Partez de votre filière", en: "Start from your stream" })}
              </h2>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {streams.map((stream) => (
                  <Link
                    key={stream.id}
                    href={pathFor(locale, { name: "stream", stream: stream.id })}
                    className="chip hover:border-brand hover:text-brand"
                  >
                    {stream.shortName[locale]}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-12 max-w-3xl">
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

        <div className="mt-10">
          <SourceList locale={locale} sources={coefficientSourcesFor(locale)} title={dict.common.sources} checkedLabel={dict.common.lastVerified} />
        </div>
      </PageShell>

      <JsonLd
        data={softwareAppSchema({
          locale,
          name: t.title,
          description: t.intro,
          url: absolute(pathFor(locale, { name: "calculator" })),
        })}
      />
      <JsonLd data={faqSchema(faq)} />
      <JsonLd
        data={webPageSchema({
          locale,
          url: absolute(pathFor(locale, { name: "calculator" })),
          name: t.title,
          description: t.intro,
        })}
      />
    </>
  );
}

export function CoefficientsPage({ locale }: { locale: Locale }) {
  const dict = getDict(locale);

  const intro = tx(locale, {
    ar: "جدول المعاملات المعمول به لدورة 2027، بعد إلغاء تعديل جويلية 2026 بالقرار رقم 36. تحقق من مجموع شعبتك قبل أي حساب.",
    fr: "Tableau des coefficients en vigueur pour 2027, après l’abrogation de la réforme de juillet 2026 par la décision n°36. Vérifiez le total de votre filière.",
    en: "Coefficient table in force for 2027, after the July 2026 reform was repealed by decision no. 36. Check your stream’s total first.",
  });

  return (
    <>
      <PageShell>
        <Breadcrumbs locale={locale} items={[{ name: dict.nav.coefficients, target: { name: "coefficients" } }]} label={dict.common.home} />
        <SectionHeader
          as="h1"
          eyebrow={tx(locale, { ar: "بيانات", fr: "Données", en: "Data" })}
          title={tx(locale, {
            ar: "معاملات البكالوريا لدورة 2027",
            fr: "Coefficients du bac pour la session 2027",
            en: "Bac coefficients for the 2027 session",
          })}
          intro={intro}
          action={<VerifiedStamp locale={locale} verifiedOn={coefficientStatus.verifiedOn} label={coefficientStatus.label[locale]} />}
        />

        <Callout tone="warn" title={tx(locale, { ar: "انتبه إلى الجداول الملغاة", fr: "Attention aux tableaux abrogés", en: "Beware of repealed tables" })}>
          <p>
            {tx(locale, {
              ar: "قرار 28 جويلية 2026 قلّص المواد ورفع معاملات التخصص، ثم ألغاه القرار رقم 36 المؤرخ في 9 سبتمبر 2026. أي جدول يحذف الفلسفة من الشعب العلمية أو يعطي الرياضيات معامل 8 يعود إلى التعديل الملغى.",
              fr: "La décision du 28 juillet 2026 réduisait les matières et renforçait les spécialités ; la décision n°36 du 9 septembre 2026 l’a abrogée. Un tableau supprimant la philosophie en sciences ou donnant 8 en maths relève de la réforme abrogée.",
              en: "The 28 July 2026 decision cut subjects and raised specialty coefficients; decision no. 36 of 9 September 2026 repealed it. Any table removing philosophy from science streams or giving maths coefficient 8 reflects the repealed reform.",
            })}
          </p>
        </Callout>

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-ink">
            {tx(locale, { ar: "مقارنة المجاميع", fr: "Comparaison des totaux", en: "Totals compared" })}
          </h2>
          <p className="mt-1 text-[13px] text-muted">
            {tx(locale, {
              ar: "هذه المجاميع محسوبة من الجداول أدناه، وتطابق المجاميع المنشورة لكل شعبة.",
              fr: "Totaux calculés à partir des tableaux ci-dessous, conformes aux totaux publiés par filière.",
              en: "Totals computed from the tables below, matching the published per-stream totals.",
            })}
          </p>
          <div className="table-wrap mt-3">
            <table className="data rounded-card border border-line">
              <thead>
                <tr>
                  <th scope="col">{dict.common.stream}</th>
                  <th scope="col">{tx(locale, { ar: "عدد المواد", fr: "Matières", en: "Subjects" })}</th>
                  <th scope="col" className="n">{dict.common.total}</th>
                  <th scope="col">{tx(locale, { ar: "أعلى معامل", fr: "Coef. le plus élevé", en: "Highest coefficient" })}</th>
                </tr>
              </thead>
              <tbody>
                {streams.map((stream) => {
                  const top = [...stream.coefficients].sort((a, b) => b.coefficient - a.coefficient)[0];
                  return (
                    <tr key={stream.id}>
                      <td>
                        <Link href={pathFor(locale, { name: "stream", stream: stream.id })} className="link">
                          {stream.name[locale]}
                        </Link>
                      </td>
                      <td className="n">{stream.coefficients.length}</td>
                      <td className="n font-semibold">{totalCoefficient(stream)}</td>
                      <td>
                        {subjectNameForStream(top, locale)} ({top.coefficient})
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="text-lg font-semibold text-ink">{tx(locale, { ar: "الجداول التفصيلية", fr: "Tableaux détaillés", en: "Detailed tables" })}</h2>
          {streams.map((stream) => (
            <details key={stream.id} className="card overflow-hidden" open={stream.id === "sciences-experimentales"}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 bg-raised px-4 py-3">
                <span className="text-[14px] font-semibold text-ink">{stream.name[locale]}</span>
                <span className="num text-[12px] text-muted">
                  {totalCoefficient(stream)} {tx(locale, { ar: "معاملًا", fr: "coef.", en: "coef." })}
                </span>
              </summary>
              <div className="table-wrap px-0 sm:px-0">
                <table className="data">
                  <thead>
                    <tr>
                      <th scope="col">{dict.common.subject}</th>
                      <th scope="col" className="n">{dict.common.coefficient}</th>
                      <th scope="col">{tx(locale, { ar: "ملاحظة", fr: "Remarque", en: "Note" })}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stream.coefficients.map((entry) => (
                      <tr key={entry.subject}>
                        <td>{subjectNameForStream(entry, locale)}</td>
                        <td className="n font-semibold">{entry.coefficient}</td>
                        <td className="text-[12px] text-muted">
                          {entry.optional
                            ? dict.common.optional
                            : entry.subject === "physical-education"
                              ? tx(locale, { ar: "تقييم مؤسسة", fr: "Évaluation en établissement", en: "School assessment" })
                              : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          ))}
        </section>

        <section className="mt-10 grid gap-5 lg:grid-cols-2">
          <div className="card p-5 sm:p-6">
            <h2 className="text-[14px] font-semibold text-ink">
              {tx(locale, { ar: "كيف تتحقق بنفسك", fr: "Comment vérifier vous-même", en: "How to verify yourself" })}
            </h2>
            <ol className="mt-3 space-y-2 text-[13px] leading-7 text-muted">
              {coefficientStatus.notes[locale].map((note) => (
                <li key={note} className="flex gap-2.5">
                  <IconCheck size={15} className="mt-1.5 shrink-0 text-brand" />
                  {note}
                </li>
              ))}
            </ol>
          </div>
          <div className="card p-5 sm:p-6">
            <h2 className="text-[14px] font-semibold text-ink">{tx(locale, { ar: "الجدول الزمني", fr: "Chronologie", en: "Timeline" })}</h2>
            <ul className="mt-3 space-y-3">
              {coefficientStatus.sources.slice(0, 3).map((source) => (
                <li key={source.url} className="text-[13px] leading-6">
                  <a href={source.url} target="_blank" rel="noopener noreferrer" className="link">
                    {source.label[locale]}
                  </a>
                  <span className="num ms-2 text-[11px] text-muted">{source.checkedOn}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <div className="mt-10">
          <SourceList locale={locale} sources={coefficientSourcesFor(locale)} title={dict.common.sources} checkedLabel={dict.common.lastVerified} />
        </div>
      </PageShell>

      <JsonLd
        data={webPageSchema({
          locale,
          url: absolute(pathFor(locale, { name: "coefficients" })),
          name: dict.nav.coefficients,
          description: intro,
          updated: coefficientStatus.verifiedOn,
        })}
      />
    </>
  );
}

export function StreamsPage({ locale }: { locale: Locale }) {
  const dict = getDict(locale);
  return (
    <PageShell>
      <Breadcrumbs locale={locale} items={[{ name: dict.nav.streams, target: { name: "streams" } }]} label={dict.common.home} />
      <SectionHeader
        as="h1"
        eyebrow={tx(locale, { ar: "الشعب", fr: "Filières", en: "Streams" })}
        title={tx(locale, {
          ar: "شعب البكالوريا الست: المواد والمعاملات والآفاق",
          fr: "Les six filières du bac : matières, coefficients et débouchés",
          en: "The six bac streams: subjects, coefficients and pathways",
        })}
        intro={tx(locale, {
          ar: "بطاقة لكل شعبة: مجموع المعاملات، المواد الأساسية، والآفاق الجامعية. البيانات الرقمية من الجدول المعمول به لدورة 2027؛ التوجيه شرح تحريري.",
          fr: "Une fiche par filière : total des coefficients, matières dominantes et débouchés. Les chiffres viennent du tableau en vigueur pour 2027 ; les conseils sont éditoriaux.",
          en: "One profile per stream: coefficient total, dominant subjects and pathways. Figures come from the table in force for 2027; guidance is editorial.",
        })}
      />

      <div className="grid gap-4 md:grid-cols-2">
        {streams.map((stream) => {
          const total = totalCoefficient(stream);
          const top = [...stream.coefficients].sort((a, b) => b.coefficient - a.coefficient).slice(0, 3);
          return (
            <Link
              key={stream.id}
              href={pathFor(locale, { name: "stream", stream: stream.id })}
              className="card group flex flex-col gap-3 p-5 transition-colors hover:border-brand/50"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-display text-xl font-semibold text-ink group-hover:text-brand">{stream.name[locale]}</h2>
                <Badge tone="brand">
                  <span className="num">{total}</span>
                </Badge>
              </div>
              <p className="text-[13px] leading-6 text-muted">{stream.summary[locale]}</p>
              <div className="mt-auto flex flex-wrap gap-1.5">
                {top.map((entry) => (
                  <span key={entry.subject} className="chip">
                    {subjectNameForStream(entry, locale)} · <span className="num">{entry.coefficient}</span>
                  </span>
                ))}
              </div>
            </Link>
          );
        })}
      </div>

      <section className="mt-10 card p-5 sm:p-6">
        <h2 className="text-[14px] font-semibold text-ink">
          {tx(locale, { ar: "كيف تختار شعبتك؟", fr: "Comment choisir sa filière ?", en: "How to choose your stream?" })}
        </h2>
        <p className="mt-2 max-w-prose text-[13.5px] leading-7 text-muted">
          {tx(locale, {
            ar: "اختيار الشعبة يحدد المواد ذات الوزن الأكبر في معدلك، لا «مستواك» العام. اقرأ محتوى المواد الأساسية أولًا، ثم قارنها بما تحبّ العمل عليه يوميًا. الآفاق الجامعية مذكورة كإشارة، وتظل خاضعة لمعدلات القبول والطاقة الاستيعابية.",
            fr: "La filière détermine les matières qui pèsent le plus dans votre moyenne, pas votre « niveau » général. Lisez d’abord le contenu des matières dominantes, puis comparez avec ce que vous acceptez de travailler quotidiennement. Les débouchés sont indicatifs et restent soumis aux seuils et capacités.",
            en: "Your stream determines which subjects weigh most in your average, not your general “level”. Read the dominant subjects’ content first, then compare with what you are willing to work on daily. Pathways are indicative and remain subject to thresholds and capacity.",
          })}
        </p>
      </section>
    </PageShell>
  );
}

export function StreamPage({ locale, streamId }: { locale: Locale; streamId: string }) {
  const dict = getDict(locale);
  const stream = streamById[streamId as keyof typeof streamById];
  if (!stream) return null;
  const total = totalCoefficient(stream);
  const streamExams = examPages.filter((page) => page.stream === streamId).slice(0, 4);

  return (
    <>
      <PageShell>
        <Breadcrumbs
          locale={locale}
          items={[
            { name: dict.nav.streams, target: { name: "streams" } },
            { name: stream.name[locale], target: { name: "stream", stream: stream.id } },
          ]}
          label={dict.common.home}
        />
        <div className="grid gap-8 lg:grid-cols-[1.35fr_0.65fr]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="brand">{coefficientStatus.label[locale]}</Badge>
              <Badge tone="neutral">
                {tx(locale, { ar: "دورة", fr: "Session", en: "Session" })} <span className="num">{coefficientStatus.effectiveSession}</span>
              </Badge>
            </div>
            <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{stream.name[locale]}</h1>
            <p className="mt-3 max-w-prose text-[15px] leading-8 text-muted">{stream.summary[locale]}</p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="card p-4">
                <div className="text-[11px] uppercase tracking-wide text-muted">{dict.common.total}</div>
                <div className="num mt-1 text-2xl font-semibold text-ink">{total}</div>
                <div className="text-[11px] text-muted">{tx(locale, { ar: "معاملًا", fr: "coefficients", en: "coefficients" })}</div>
              </div>
              <div className="card p-4">
                <div className="text-[11px] uppercase tracking-wide text-muted">{tx(locale, { ar: "المواد", fr: "Matières", en: "Subjects" })}</div>
                <div className="num mt-1 text-2xl font-semibold text-ink">{stream.coefficients.length}</div>
                <div className="text-[11px] text-muted">{tx(locale, { ar: "منها اختيارية", fr: "dont facultatives", en: "including optional" })}</div>
              </div>
              <div className="card p-4">
                <div className="text-[11px] uppercase tracking-wide text-muted">{tx(locale, { ar: "أعلى معامل", fr: "Coef. max", en: "Top coef." })}</div>
                <div className="num mt-1 text-2xl font-semibold text-ink">
                  {Math.max(...stream.coefficients.map((entry) => entry.coefficient))}
                </div>
                <div className="text-[11px] text-muted">
                  {subjectNameForStream([...stream.coefficients].sort((a, b) => b.coefficient - a.coefficient)[0], locale)}
                </div>
              </div>
            </div>

            <section className="mt-8">
              <h2 className="text-lg font-semibold text-ink">{tx(locale, { ar: "المواد والمعاملات", fr: "Matières et coefficients", en: "Subjects and coefficients" })}</h2>
              <div className="table-wrap mt-3">
                <table className="data rounded-card border border-line">
                  <thead>
                    <tr>
                      <th scope="col">{dict.common.subject}</th>
                      <th scope="col" className="n">{dict.common.coefficient}</th>
                      <th scope="col">{tx(locale, { ar: "الوزن النسبي", fr: "Poids relatif", en: "Relative weight" })}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stream.coefficients.map((entry) => (
                      <tr key={entry.subject}>
                        <td>
                          {subjectNameForStream(entry, locale)}
                          {entry.optional && <span className="ms-2 text-[11px] text-muted">({dict.common.optional})</span>}
                        </td>
                        <td className="n font-semibold">{entry.coefficient}</td>
                        <td className="n text-[12px] text-muted">{Math.round((entry.coefficient / total) * 100)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-[11.5px] leading-5 text-muted">{coefficientStatus.notes[locale][1]}</p>
            </section>

            {stream.specialties && (
              <section className="mt-8">
                <h2 className="text-lg font-semibold text-ink">{tx(locale, { ar: "التخصصات", fr: "Spécialités", en: "Specialties" })}</h2>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {stream.specialties.map((specialty) => (
                    <span key={specialty.id} className="chip">
                      {specialty.name[locale]}
                    </span>
                  ))}
                </div>
              </section>
            )}

            <section className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="card p-5">
                <h2 className="text-[13.5px] font-semibold text-ink">{tx(locale, { ar: "لمن تناسب؟", fr: "Pour qui ?", en: "Who is it for?" })}</h2>
                <p className="mt-2 text-[13px] leading-7 text-muted">{stream.fits[locale]}</p>
                <Badge tone="neutral">
                  <span className="text-[10px]">{dict.common.editorial}</span>
                </Badge>
              </div>
              <div className="card p-5">
                <h2 className="text-[13.5px] font-semibold text-ink">{tx(locale, { ar: "الآفاق", fr: "Débouchés", en: "Pathways" })}</h2>
                <p className="mt-2 text-[13px] leading-7 text-muted">{stream.topFields[locale]}</p>
                <Link href={pathFor(locale, { name: "orientation" })} className="link mt-2 inline-flex items-center gap-1 text-[12.5px]">
                  {dict.nav.orientation}
                  <IconArrow size={14} />
                </Link>
              </div>
            </section>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="card p-5">
              <h2 className="text-[13.5px] font-semibold text-ink">{tx(locale, { ar: "احسب معدلك", fr: "Calculez votre moyenne", en: "Compute your average" })}</h2>
              <p className="mt-1.5 text-[12.5px] leading-6 text-muted">{dict.calculator.intro}</p>
              <Link href={pathFor(locale, { name: "calculator" })} className="btn btn-primary btn-sm mt-3 w-full">
                <IconCalculator size={15} />
                {dict.nav.calculator}
              </Link>
            </div>

            {streamExams.length > 0 && (
              <div className="card p-5">
                <h2 className="text-[13.5px] font-semibold text-ink">{tx(locale, { ar: "مواد الأرشيف", fr: "Matières de l’archive", en: "Archive subjects" })}</h2>
                <ul className="mt-2 divide-y divide-line">
                  {streamExams.map((page) => (
                    <li key={`${page.year}-${page.subject}`}>
                      <Link
                        href={pathFor(locale, { name: "examSubject", year: page.year, stream: page.stream, subject: page.subject })}
                        className="flex items-center justify-between gap-2 py-2 text-[12.5px] text-ink hover:text-brand"
                      >
                        <span>{subjectById[page.subject]?.name[locale]}</span>
                        <span className="num text-[11px] text-muted">{page.year}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="card p-5">
              <h2 className="text-[13.5px] font-semibold text-ink">{tx(locale, { ar: "شعب أخرى", fr: "Autres filières", en: "Other streams" })}</h2>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {streams
                  .filter((item) => item.id !== stream.id)
                  .map((item) => (
                    <Link key={item.id} href={pathFor(locale, { name: "stream", stream: item.id })} className="chip hover:border-brand hover:text-brand">
                      {item.shortName[locale]}
                    </Link>
                  ))}
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-10">
          <SourceList locale={locale} sources={coefficientSourcesFor(locale)} title={dict.common.sources} checkedLabel={dict.common.lastVerified} />
        </div>
      </PageShell>

      <JsonLd
        data={webPageSchema({
          locale,
          url: absolute(pathFor(locale, { name: "stream", stream: stream.id })),
          name: stream.name[locale],
          description: stream.summary[locale],
          updated: coefficientStatus.verifiedOn,
        })}
      />
    </>
  );
}
