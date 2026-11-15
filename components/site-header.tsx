import Link from "next/link";
import { getDict, type Locale } from "@/lib/i18n";
import { pathFor } from "@/lib/routes";
import { IconSearch } from "./icons";
import { MobileAppBarBrand } from "./mobile-appbar";
import { LocaleSwitcher } from "./locale-switcher";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader({ locale }: { locale: Locale }) {
  const dict = getDict(locale);
  const links = [
    { label: dict.nav.calculator, target: { name: "calculator" as const } },
    { label: dict.nav.exams, target: { name: "exams" as const } },
    { label: dict.nav.streams, target: { name: "streams" as const } },
    { label: dict.nav.guides, target: { name: "guides" as const } },
    { label: dict.nav.orientation, target: { name: "orientation" as const } },
    { label: dict.nav.study, target: { name: "studySpace" as const } },
    { label: dict.nav.tools, target: { name: "tools" as const } },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-line-strong bg-bg">
      {/* Editorial dateline — desktop only; on mobile the app bar is compact. */}
      <div className="hidden border-b border-line lg:block">
        <div className="shell flex h-8 items-center justify-between gap-3 text-[10px] uppercase tracking-[0.14em] text-muted">
          <span className="truncate">
            {locale === "ar" ? "منصة مستقلة · مصادر ظاهرة" : locale === "fr" ? "Plateforme indépendante · sources visibles" : "Independent platform · visible sources"}
          </span>
          <span className="num hidden shrink-0 sm:inline">2026-11-15</span>
        </div>
      </div>

      <div className="shell flex h-14 items-center gap-3 lg:h-[72px] lg:gap-4">
        <MobileAppBarBrand locale={locale} />

        <span aria-hidden className="mx-1 hidden h-9 w-px bg-line lg:block" />

        <nav aria-label={dict.common.breadcrumb} className="hidden lg:flex lg:flex-1 lg:items-center lg:gap-5">
          {links.map((link) => (
            <Link
              key={link.target.name}
              href={pathFor(locale, link.target)}
              className="text-[12.5px] font-medium text-muted transition-colors hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ms-auto flex items-center gap-1 lg:ms-0 lg:gap-1.5">
          <Link
            href={pathFor(locale, { name: "search" })}
            aria-label={dict.actions.search}
            title={dict.actions.search}
            className="grid h-10 w-10 place-items-center rounded-card border border-transparent text-ink transition-colors hover:border-line-strong active:bg-raised lg:h-9 lg:w-9"
          >
            <IconSearch size={17} />
          </Link>
          <span className="hidden lg:contents">
            <LocaleSwitcher locale={locale} label={dict.common.language} />
          </span>
          <ThemeToggle label={dict.common.theme} />
        </div>
      </div>
    </header>
  );
}
