import type { Metadata } from "next";
import { alternatesFor, pathFor, type RouteTarget } from "./routes";
import { localeMeta, type Locale } from "./i18n";

export const SITE = {
  name: "BAC DZ",
  legalName: "BAC DZ — منصة البكالوريا الجزائرية",
  tagline: {
    ar: "منصة البكالوريا الجزائرية: حاسبة المعدل، المواضيع، المراجعة والتوجيه",
    fr: "Plateforme du bac algérien : moyenne, sujets, révisions et orientation",
    en: "Algerian bac platform: average, papers, revision and orientation",
  } as Record<Locale, string>,
  localeTag: "ar_DZ",
  twitter: "@bacdz",
};

export function siteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const fallback = "http://localhost:3000";
  const value = raw && raw.length > 0 ? raw : fallback;
  return value.replace(/\/$/, "");
}

export function absolute(path: string): string {
  return `${siteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

const ogLocale: Record<Locale, string> = { ar: "ar_DZ", fr: "fr_DZ", en: "en_US" };

/**
 * Keep titles inside the ~600px SERP budget. The brand name is deliberately
 * not appended: it would push every long Arabic title past the truncation
 * point, and the domain already carries the brand.
 */
const TITLE_LIMIT = 64;

function clampTitle(value: string): string {
  const clean = value.replace(/\s+/g, " ").trim();
  if (clean.length <= TITLE_LIMIT) return clean;
  const cut = clean.slice(0, TITLE_LIMIT);
  const lastSpace = cut.lastIndexOf(" ");
  const base = lastSpace > 40 ? cut.slice(0, lastSpace) : cut;
  return `${base.replace(/[،,؛;:\-–—]\s*$/, "")}…`;
}

/** Latin-only label used for the generated OG image (no Arabic shaping issues). */
export function ogLabel(locale: Locale, label: Record<Locale, string>): string {
  return label[locale];
}

export function buildMetadata(opts: {
  locale: Locale;
  target: RouteTarget;
  title: string;
  description: string;
  /** Latin label for OG image */
  ogTitle: string;
  updated?: string;
  noindex?: boolean;
  type?: "website" | "article";
  published?: string;
}): Metadata {
  const { locale, target, title, description, ogTitle } = opts;
  const path = pathFor(locale, target);
  const canonical = absolute(path);
  const alternates = alternatesFor(target);
  const languages: Record<string, string> = {};
  for (const [key, value] of Object.entries(alternates)) {
    languages[key === "x-default" ? "x-default" : key] = absolute(value);
  }

  const ogImage = `${siteUrl()}/api/og?t=${encodeURIComponent(ogTitle)}&l=${locale}`;

  const metadata: Metadata = {
    metadataBase: new URL(siteUrl()),
    title: { absolute: clampTitle(title) },
    description,
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      type: opts.type ?? "website",
      siteName: SITE.name,
      title,
      description,
      url: canonical,
      locale: ogLocale[locale],
      alternateLocale: (["ar", "fr", "en"] as Locale[]).filter((l) => l !== locale).map((l) => ogLocale[l]),
      images: [{ url: ogImage, width: 1200, height: 630, alt: ogTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    robots: opts.noindex
      ? { index: false, follow: true }
      : {
          index: true,
          follow: true,
          googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
        },
  };

  if (opts.type === "article") {
    metadata.openGraph = {
      ...metadata.openGraph,
      type: "article",
      publishedTime: opts.published,
      modifiedTime: opts.updated,
    };
  }

  return metadata;
}

export function brandTitle(page: string, locale: Locale): string {
  const suffix = locale === "ar" ? "BAC DZ" : "BAC DZ";
  return `${page} | ${suffix}`;
}
