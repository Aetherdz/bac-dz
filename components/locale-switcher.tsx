"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { localeMeta, locales, type Locale } from "@/lib/i18n";
import { matchRoute, pathFor } from "@/lib/routes";

export function LocaleSwitcher({ locale, label }: { locale: Locale; label: string }) {
  const pathname = usePathname() ?? `/${locale}`;
  const segments = pathname.split("/").filter(Boolean);
  const rest = segments.slice(1);
  const target = matchRoute(rest);

  return (
    <nav aria-label={label} className="flex items-center gap-0.5 rounded-full border border-line bg-surface p-0.5">
      {locales.map((option) => {
        const href = target ? pathFor(option, target) : `/${option}`;
        const active = option === locale;
        return (
          <Link
            key={option}
            href={href}
            hrefLang={localeMeta[option].htmlLang}
            aria-current={active ? "true" : undefined}
            className={`flex h-8 min-w-8 items-center justify-center rounded-full px-2 text-[11.5px] font-semibold transition-colors ${
              active ? "bg-brand text-brand-ink" : "text-muted hover:text-brand"
            }`}
          >
            {localeMeta[option].short}
          </Link>
        );
      })}
    </nav>
  );
}
