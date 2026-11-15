import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Arabic, Newsreader } from "next/font/google";
import { notFound } from "next/navigation";
import "../../globals.css";
import { getDict, isLocale, localeMeta, locales, type Locale } from "@/lib/i18n";
import { SITE, siteUrl } from "@/lib/seo";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { JsonLd, organizationSchema, websiteSchema } from "@/components/jsonld";

const sans = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const display = Newsreader({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F6F4EC" },
    { media: "(prefers-color-scheme: dark)", color: "#0A1411" },
  ],
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: `${SITE.name} — ${SITE.tagline[locale]}`, template: `%s | ${SITE.name}` },
    applicationName: SITE.name,
    authors: [{ name: SITE.name, url: siteUrl() }],
    creator: SITE.name,
    publisher: SITE.name,
    formatDetection: { telephone: false },
    other: {
      "google-site-verification": process.env.NEXT_PUBLIC_GSC_VERIFICATION ?? "",
    },
  };
}

const themeScript = `(function(){try{var t=localStorage.getItem('bacdz-theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const typed = locale as Locale;
  const meta = localeMeta[typed];
  const dict = getDict(typed);

  return (
    <html lang={meta.htmlLang} dir={meta.dir} suppressHydrationWarning className={`${sans.variable} ${display.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {process.env.NEXT_PUBLIC_ADSENSE_CLIENT ? (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(process.env.NEXT_PUBLIC_ADSENSE_CLIENT)}`}
            crossOrigin="anonymous"
          />
        ) : null}
      </head>
      <body className="min-h-dvh bg-bg font-sans text-ink antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-brand focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-brand-ink"
        >
          {dict.common.skipToContent}
        </a>
        <SiteHeader locale={typed} />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <SiteFooter locale={typed} />
        <JsonLd data={organizationSchema()} />
        <JsonLd data={websiteSchema(typed)} />
      </body>
    </html>
  );
}
