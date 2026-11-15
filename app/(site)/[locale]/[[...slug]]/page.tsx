import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, locales, type Locale } from "@/lib/i18n";
import { matchRoute, type RouteTarget } from "@/lib/routes";
import { buildMetadata } from "@/lib/seo";
import { metaFor } from "@/lib/page-meta";
import { paramsForLocale } from "@/lib/route-index";
import { streamById } from "@/content/bac";
import { findExamPage } from "@/content/exams";
import { getGuide } from "@/content/guides";
import { toolBySlug } from "@/content/tools";
import { updateBySlug } from "@/content/updates";
import { HomePage, PageShell } from "@/components/pages/core";
import { CalculatorPage, CoefficientsPage, StreamPage, StreamsPage } from "@/components/pages/learn";
import { ExamSubjectPage, ExamsPage } from "@/components/pages/exams";
import { GuidePage, GuidesPage, UpdatePage, UpdatesPage } from "@/components/pages/guides";
import { OrientationPage, PlannerPage, ToolPage, ToolsPage } from "@/components/pages/tools-pages";
import { CountdownPage, PomodoroPage, StudySpacePage, TasksPage } from "@/components/pages/study";
import { TrustPage } from "@/components/pages/misc";
import { Suspense } from "react";
import { SearchClient } from "@/components/search-client";

type Params = { locale: string; slug?: string[] };


export function generateStaticParams() {
  return locales.flatMap((locale) => paramsForLocale(locale));
}

function validTarget(target: RouteTarget): boolean {
  switch (target.name) {
    case "stream":
      return Boolean(streamById[target.stream as keyof typeof streamById]);
    case "examSubject":
      return Boolean(findExamPage(target.year, target.stream, target.subject));
    case "guide":
      return Boolean(getGuide(target.slug));
    case "tool":
      return Boolean(toolBySlug[target.tool as keyof typeof toolBySlug]);
    case "update":
      return Boolean(updateBySlug[target.slug]);
    default:
      return true;
  }
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  if (!isLocale(rawLocale)) return {};
  const locale = rawLocale as Locale;
  const target = matchRoute(slug ?? []);
  if (!target || !validTarget(target)) {
    return { title: "404", robots: { index: false, follow: false } };
  }
  const meta = metaFor(locale, target);
  return buildMetadata({
    locale,
    target,
    title: meta.title,
    description: meta.description,
    ogTitle: meta.ogTitle,
    type: meta.type,
    noindex: meta.noindex,
    published: meta.published,
    updated: meta.updated,
  });
}

export default async function LocalizedPage({ params }: { params: Promise<Params> }) {
  const { locale: rawLocale, slug } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = rawLocale as Locale;
  const target = matchRoute(slug ?? []);
  if (!target || !validTarget(target)) notFound();

  switch (target.name) {
    case "home":
      return <HomePage locale={locale} />;
    case "calculator":
      return <CalculatorPage locale={locale} />;
    case "coefficients":
      return <CoefficientsPage locale={locale} />;
    case "streams":
      return <StreamsPage locale={locale} />;
    case "stream":
      return <StreamPage locale={locale} streamId={target.stream} />;
    case "exams":
      return <ExamsPage locale={locale} />;
    case "examSubject":
      return <ExamSubjectPage locale={locale} year={target.year} stream={target.stream} subject={target.subject} />;
    case "guides":
      return <GuidesPage locale={locale} />;
    case "guide":
      return <GuidePage locale={locale} slug={target.slug} />;
    case "tools":
      return <ToolsPage locale={locale} />;
    case "tool":
      return <ToolPage locale={locale} slug={target.tool} />;
    case "orientation":
      return <OrientationPage locale={locale} />;
    case "planner":
      return <PlannerPage locale={locale} />;
    case "countdown":
      return <CountdownPage locale={locale} />;
    case "pomodoro":
      return <PomodoroPage locale={locale} />;
    case "studySpace":
      return <StudySpacePage locale={locale} />;
    case "tasks":
      return <TasksPage locale={locale} />;
    case "updates":
      return <UpdatesPage locale={locale} />;
    case "update":
      return <UpdatePage locale={locale} slug={target.slug} />;
    case "search":
      return (
        <Suspense fallback={<PageShell>…</PageShell>}>
          <SearchClient locale={locale} />
        </Suspense>
      );
    case "about":
    case "editorial":
    case "corrections":
    case "privacy":
    case "terms":
    case "contact":
      return <TrustPage locale={locale} kind={target.name} />;
    default:
      // A route that exists in the registry but has no page yet must answer with
      // a real 404, never a 200 body that merely prints "404".
      notFound();
  }
}
