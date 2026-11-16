import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Amiri, IBM_Plex_Sans_Arabic } from "next/font/google";
import { notFound } from "next/navigation";
import "../../globals.css";
import { getDict, isLocale, localeMeta, locales, type Locale } from "@/lib/i18n";
import { SITE, siteUrl } from "@/lib/seo";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { JsonLd, organizationSchema, websiteSchema } from "@/components/jsonld";
import { PomodoroProvider } from "@/components/study/pomodoro-context";
import { MobileTabBar } from "@/components/mobile-tabbar";
import { PageTransition } from "@/components/page-transition";
import { GoogleAnalytics } from "@next/third-parties/google";

const sans = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

// Amiri carries both Arabic and Latin display text; it is the editorial face
// for headlines on every locale, so the site reads as one publication.
const display = Amiri({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  variable: "--font-display",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F6F4ED" },
    { media: "(prefers-color-scheme: dark)", color: "#0D110F" },
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
    appleWebApp: { capable: true, title: "BAC DZ", statusBarStyle: "default" },
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
      <body className="min-h-dvh bg-bg pb-[calc(56px+env(safe-area-inset-bottom))] font-sans text-ink antialiased lg:pb-0">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus:rounded-card focus:bg-brand focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-brand-ink"
        >
          {dict.common.skipToContent}
        </a>
        <SiteHeader locale={typed} />
        <PomodoroProvider locale={typed}>
          <main id="main" tabIndex={-1}>
            <PageTransition>{children}</PageTransition>
          </main>
        </PomodoroProvider>
        <SiteFooter locale={typed} />
        <MobileTabBar locale={typed} />
        <JsonLd data={organizationSchema()} />
        <JsonLd data={websiteSchema(typed)} />
      </body>
      <GoogleAnalytics gaId="G-78S8BEKWL4" />
      <Script
        defer
        src="https://static.cloudflareinsights.com/beacon.min.js"
        data-cf-beacon='{"token": "7c685e3071ad4b318ff3ab94e77edc70"}'
        strategy="afterInteractive"
      />
    </html>
  );
}
