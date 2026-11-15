"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { getDict } from "@/lib/i18n";
import { matchRoute, navKey, pathFor, type RouteTarget } from "@/lib/routes";
import { tx } from "@/lib/tx";
import { BrandMark } from "./brand-mark";
import { LocaleSwitcher } from "./locale-switcher";
import { ThemeToggle } from "./theme-toggle";
import {
  IconArrow,
  IconBook,
  IconCalculator,
  IconCalendar,
  IconChevron,
  IconClock,
  IconClose,
  IconCompass,
  IconHome,
  IconLayers,
  IconList,
  IconMore,
  IconSearch,
  IconTarget,
  IconWrench,
} from "./icons";

const tabs = [
  { key: "home", target: { name: "home" } as RouteTarget, label: { ar: "الرئيسية", fr: "Accueil", en: "Home" }, icon: <IconHome size={20} /> },
  { key: "study", target: { name: "studySpace" } as RouteTarget, label: { ar: "الدراسة", fr: "Étude", en: "Study" }, icon: <IconTarget size={20} /> },
  { key: "calculator", target: { name: "calculator" } as RouteTarget, label: { ar: "المعدل", fr: "Moyenne", en: "Average" }, icon: <IconCalculator size={20} /> },
  { key: "exams", target: { name: "exams" } as RouteTarget, label: { ar: "المواضيع", fr: "Sujets", en: "Papers" }, icon: <IconLayers size={20} /> },
];

export function MobileTabBar({ locale }: { locale: Locale }) {
  const dict = getDict(locale);
  const pathname = usePathname() ?? "";
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Active state follows the logical section, so every study page (timer,
  // tasks, planner, countdown) keeps the Study tab lit.
  const activeKey = (() => {
    const segments = pathname.split("?")[0].split("/").filter(Boolean).slice(1);
    const match = matchRoute(segments);
    return match ? navKey(match) : "home";
  })();

  const groups: { title: string; links: { label: string; target: RouteTarget; icon: React.ReactNode }[] }[] = [
    {
      title: tx(locale, { ar: "الدراسة", fr: "Étude", en: "Study" }),
      links: [
        { label: dict.nav.study, target: { name: "studySpace" }, icon: <IconTarget size={17} /> },
        { label: tx(locale, { ar: "مؤقت التركيز", fr: "Minuteur de focus", en: "Focus timer" }), target: { name: "pomodoro" }, icon: <IconClock size={17} /> },
        { label: tx(locale, { ar: "مهام اليوم", fr: "Tâches du jour", en: "Today’s tasks" }), target: { name: "tasks" }, icon: <IconList size={17} /> },
        { label: dict.nav.planner, target: { name: "planner" }, icon: <IconCalendar size={17} /> },
        { label: tx(locale, { ar: "عدّاد البكالوريا", fr: "Compte à rebours", en: "Bac countdown" }), target: { name: "countdown" }, icon: <IconClock size={17} /> },
      ],
    },
    {
      title: tx(locale, { ar: "المراجع", fr: "Références", en: "Reference" }),
      links: [
        { label: dict.nav.coefficients, target: { name: "coefficients" }, icon: <IconBook size={17} /> },
        { label: dict.nav.streams, target: { name: "streams" }, icon: <IconLayers size={17} /> },
        { label: dict.nav.orientation, target: { name: "orientation" }, icon: <IconCompass size={17} /> },
        { label: dict.nav.guides, target: { name: "guides" }, icon: <IconBook size={17} /> },
        { label: dict.nav.updates, target: { name: "updates" }, icon: <IconWrench size={17} /> },
      ],
    },
    {
      title: tx(locale, { ar: "المنصة", fr: "La plateforme", en: "The platform" }),
      links: [
        { label: dict.nav.tools, target: { name: "tools" }, icon: <IconWrench size={17} /> },
        { label: dict.actions.search, target: { name: "search" }, icon: <IconSearch size={17} /> },
        { label: dict.trust.aboutTitle, target: { name: "about" }, icon: <IconArrow size={17} /> },
        { label: dict.trust.contactTitle, target: { name: "contact" }, icon: <IconArrow size={17} /> },
      ],
    },
  ];

  return (
    <>
      <nav
        aria-label={tx(locale, { ar: "التنقل السفلي", fr: "Navigation principale", en: "Primary navigation" })}
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line-strong bg-bg lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <ul className="grid grid-cols-5">
          {tabs.map((tab) => {
            const active = activeKey === tab.key;
            return (
              <li key={tab.key}>
                <Link
                  href={pathFor(locale, tab.target)}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex min-h-[56px] flex-col items-center justify-center gap-1 pb-1.5 pt-2 text-[9.5px] font-medium tracking-wide transition-colors ${
                    active ? "text-brand" : "text-muted active:text-ink"
                  }`}
                >
                  <span aria-hidden className={`absolute inset-x-4 top-0 h-[2px] transition-colors ${active ? "bg-brand" : "bg-transparent"}`} />
                  {tab.icon}
                  <span>{tx(locale, tab.label)}</span>
                </Link>
              </li>
            );
          })}
          <li>
            <button
              ref={triggerRef}
              type="button"
              onClick={() => setOpen(true)}
              aria-expanded={open}
              aria-haspopup="dialog"
              className="relative flex min-h-[56px] w-full flex-col items-center justify-center gap-1 pb-1.5 pt-2 text-[9.5px] font-medium tracking-wide text-muted transition-colors active:text-ink"
            >
              <IconMore size={20} />
              <span>{tx(locale, { ar: "المزيد", fr: "Plus", en: "More" })}</span>
            </button>
          </li>
        </ul>
      </nav>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label={tx(locale, { ar: "قائمة الأقسام", fr: "Menu des sections", en: "Section menu" })}>
          <button
            type="button"
            aria-label={tx(locale, { ar: "إغلاق القائمة", fr: "Fermer le menu", en: "Close menu" })}
            className="absolute inset-0 bg-ink/40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[88dvh] overflow-y-auto rounded-t-[14px] border-t border-line-strong bg-bg pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-line bg-bg px-5 py-3">
              <div className="flex items-center gap-2">
                <BrandMark className="h-7 w-7 shrink-0" title={null} />
                <span className="text-[10px] uppercase tracking-[0.16em] text-muted">
                  {tx(locale, { ar: "القائمة", fr: "Menu", en: "Menu" })}
                </span>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={() => {
                  setOpen(false);
                  triggerRef.current?.focus();
                }}
                className="grid h-9 w-9 place-items-center border border-line-strong text-ink"
                aria-label={tx(locale, { ar: "إغلاق", fr: "Fermer", en: "Close" })}
              >
                <IconClose size={16} />
              </button>
            </div>

            <div className="px-5 py-2">
              {groups.map((group, groupIndex) => (
                <section key={group.title} className={groupIndex === 0 ? "" : "mt-2"}>
                  <h2 className="pb-1 pt-3 text-[9.5px] font-semibold uppercase tracking-[0.18em] text-muted">{group.title}</h2>
                  <ul className="divide-y divide-line">
                    {group.links.map((link) => (
                      <li key={`${group.title}-${link.label}`}>
                        <Link
                          href={pathFor(locale, link.target)}
                          className="flex min-h-[48px] items-center gap-3 text-[14px] text-ink active:text-brand"
                        >
                          <span className="text-muted">{link.icon}</span>
                          <span className="flex-1">{link.label}</span>
                          <IconChevron size={14} className="text-muted rtl:rotate-180" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}

              <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-4">
                <LocaleSwitcher locale={locale} label={dict.common.language} />
                <ThemeToggle label={dict.common.theme} />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
