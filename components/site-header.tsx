import Link from "next/link";
import { getDict, type Locale } from "@/lib/i18n";
import { pathFor } from "@/lib/routes";
import { IconSearch } from "./icons";
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
    { label: dict.nav.tools, target: { name: "tools" as const } },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur supports-[backdrop-filter]:bg-bg/75">
      <div className="shell flex h-[62px] items-center gap-3">
        <Link href={pathFor(locale, { name: "home" })} className="flex shrink-0 items-center gap-2.5" aria-label="BAC DZ">
          <span
            aria-hidden
            className="relative grid h-9 w-9 place-items-center rounded-[10px] bg-brand font-display text-[15px] font-bold text-brand-ink"
          >
            ب
            <span className="absolute -end-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-accent" />
          </span>
          <span className="leading-none">
            <span className="block font-display text-[16px] font-bold tracking-tight text-ink">BAC&nbsp;DZ</span>
            <span className="mt-1 block text-[10px] font-medium text-muted">
              {locale === "ar" ? "منصة البكالوريا الجزائرية" : locale === "fr" ? "Plateforme du bac algérien" : "Algerian bac platform"}
            </span>
          </span>
        </Link>

        <nav aria-label={dict.common.breadcrumb} className="ms-4 hidden lg:flex lg:items-center lg:gap-0.5">
          {links.map((link) => (
            <Link
              key={link.target.name}
              href={pathFor(locale, link.target)}
              className="rounded-full px-3 py-2 text-[13px] font-medium text-muted transition-colors hover:bg-raised hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ms-auto flex items-center gap-2">
          <Link
            href={pathFor(locale, { name: "search" })}
            aria-label={dict.actions.search}
            title={dict.actions.search}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-ink transition-colors hover:border-brand hover:text-brand"
          >
            <IconSearch size={17} />
          </Link>
          <LocaleSwitcher locale={locale} label={dict.common.language} />
          <ThemeToggle label={dict.common.theme} />
        </div>
      </div>

      <div className="border-t border-line lg:hidden">
        <nav aria-label={dict.common.breadcrumb} className="shell flex gap-1 overflow-x-auto py-1.5 [scrollbar-width:none]">
          {links.map((link) => (
            <Link
              key={link.target.name}
              href={pathFor(locale, link.target)}
              className="whitespace-nowrap rounded-full px-3 py-1.5 text-[12.5px] font-medium text-muted hover:bg-raised hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
