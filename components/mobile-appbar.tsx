"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { getDict } from "@/lib/i18n";
import { matchRoute, navKey, pathFor, type RouteTarget } from "@/lib/routes";
import { tx } from "@/lib/tx";
import { BrandMark } from "./brand-mark";
import { IconChevron } from "./icons";

/**
 * Deterministic parent for the app bar's back control. A browser "back" is
 * unreliable when a deep page is opened directly (shared link, search result),
 * so the control always points at the logical parent section instead.
 */
function parentFor(target: RouteTarget | null): RouteTarget {
  if (!target) return { name: "home" };
  switch (target.name) {
    case "examSubject":
      return { name: "exams" };
    case "guide":
      return { name: "guides" };
    case "tool":
      return { name: "tools" };
    case "update":
      return { name: "updates" };
    case "stream":
      return { name: "streams" };
    case "home":
      return { name: "home" };
    default:
      return { name: "home" };
  }
}

function sectionLabel(locale: Locale, key: string): string {
  const nav = getDict(locale).nav;
  switch (key) {
    case "calculator":
      return nav.calculator;
    case "coefficients":
      return nav.coefficients;
    case "exams":
      return nav.exams;
    case "streams":
      return nav.streams;
    case "guides":
      return nav.guides;
    case "orientation":
      return nav.orientation;
    case "tools":
      return nav.tools;
    case "planner":
      return nav.planner;
    case "study":
      return nav.study;
    case "updates":
      return nav.updates;
    default:
      return getDict(locale).nav.home;
  }
}

/**
 * Mobile-only app bar cluster: brand on top-level pages, and a back control
 * plus the current section name on deeper pages. Desktop keeps the masthead.
 */
export function MobileAppBarBrand({ locale }: { locale: Locale }) {
  const pathname = usePathname() ?? "/";
  const segments = pathname.split("?")[0].split("/").filter(Boolean).slice(1);
  const target = matchRoute(segments);
  const depth = segments.length;
  const parent = parentFor(target);
  const label = sectionLabel(locale, target ? navKey(target) : "home");

  return (
    <div className="flex min-w-0 items-center gap-2">
      {depth > 0 ? (
        <Link
          href={pathFor(locale, parent)}
          aria-label={tx(locale, { ar: "رجوع", fr: "Retour", en: "Back" })}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-card border border-line-strong text-ink transition-colors active:bg-raised lg:hidden"
        >
          <IconChevron size={16} className="rotate-180 rtl:rotate-0" />
        </Link>
      ) : null}

      <Link
        href={pathFor(locale, { name: "home" })}
        className={`group shrink-0 items-center gap-2.5 ${depth > 0 ? "hidden lg:flex" : "flex"}`}
        aria-label="BAC DZ"
      >
        <BrandMark className="h-8 w-8 shrink-0 lg:h-9 lg:w-9" title={null} />
        <span className="leading-none">
          <span className="block font-display text-[18px] font-bold tracking-tight text-ink lg:text-[20px]">BAC DZ</span>
          <span className="mt-1 hidden text-[9.5px] uppercase tracking-[0.18em] text-muted sm:block">
            {locale === "ar" ? "بكالوريا الجزائر" : locale === "fr" ? "Bac algérien" : "Algerian bac"}
          </span>
        </span>
      </Link>

      {depth > 0 ? (
        <span className="min-w-0 truncate text-[13px] font-semibold text-ink lg:hidden">{label}</span>
      ) : null}
    </div>
  );
}
