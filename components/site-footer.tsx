import Link from "next/link";
import { getDict, type Locale } from "@/lib/i18n";
import { pathFor } from "@/lib/routes";
import { SITE } from "@/lib/seo";

export function SiteFooter({ locale }: { locale: Locale }) {
  const dict = getDict(locale);
  const year = new Date().getFullYear();
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "contact@example.com";

  const columns: { title: string; links: { label: string; href: string }[] }[] = [
    {
      title: dict.footer.learn,
      links: [
        { label: dict.nav.calculator, href: pathFor(locale, { name: "calculator" }) },
        { label: dict.nav.coefficients, href: pathFor(locale, { name: "coefficients" }) },
        { label: dict.nav.exams, href: pathFor(locale, { name: "exams" }) },
        { label: dict.nav.streams, href: pathFor(locale, { name: "streams" }) },
        { label: dict.nav.guides, href: pathFor(locale, { name: "guides" }) },
      ],
    },
    {
      title: dict.footer.tools,
      links: [
        { label: dict.nav.orientation, href: pathFor(locale, { name: "orientation" }) },
        { label: dict.nav.planner, href: pathFor(locale, { name: "planner" }) },
        { label: dict.nav.tools, href: pathFor(locale, { name: "tools" }) },
        { label: dict.nav.home, href: pathFor(locale, { name: "updates" }) },
      ],
    },
    {
      title: dict.footer.trust,
      links: [
        { label: dict.trust.aboutTitle, href: pathFor(locale, { name: "about" }) },
        { label: dict.trust.editorialTitle, href: pathFor(locale, { name: "editorial" }) },
        { label: dict.trust.correctionsTitle, href: pathFor(locale, { name: "corrections" }) },
        { label: dict.trust.contactTitle, href: pathFor(locale, { name: "contact" }) },
      ],
    },
    {
      title: dict.footer.legal,
      links: [
        { label: dict.trust.privacyTitle, href: pathFor(locale, { name: "privacy" }) },
        { label: dict.trust.termsTitle, href: pathFor(locale, { name: "terms" }) },
      ],
    },
  ];

  return (
    <footer className="mt-20 border-t border-line bg-surface">
      <div className="shell py-12">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div className="max-w-xs">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-brand font-display text-[15px] font-bold text-brand-ink">
                ب
              </span>
              <span className="font-display text-[16px] font-bold tracking-tight text-ink">BAC&nbsp;DZ</span>
            </div>
            <p className="mt-3 text-[12.5px] leading-6 text-muted">{dict.footer.tagline}</p>
            <p className="mt-3 text-[11.5px] leading-5 text-muted/80">{SITE.tagline[locale]}</p>
          </div>

          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">{column.title}</h2>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-[13px] text-ink/80 hover:text-brand">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-line pt-6 text-[11.5px] leading-6 text-muted md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl space-y-1.5">
            <p>
              © {year} BAC DZ. {dict.footer.rights}
            </p>
            <p>{dict.footer.independent}</p>
            <p className="text-muted/80">{dict.footer.sourcePolicy}</p>
          </div>
          <div className="shrink-0 text-start md:text-end">
            <a href={`mailto:${contactEmail}`} className="link">
              {contactEmail}
            </a>
            <p className="mt-1 text-muted/70">Algeria · DZ</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
