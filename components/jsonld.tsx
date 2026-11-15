import { localeMeta, locales, type Locale } from "@/lib/i18n";
import { SITE, absolute, siteUrl } from "@/lib/seo";
import { alternatesFor, type RouteTarget } from "@/lib/routes";

export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      // Content is generated from typed, local data — never user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl()}/#organization`,
    name: SITE.name,
    url: siteUrl(),
    description: SITE.tagline.en,
    areaServed: { "@type": "Country", name: "Algeria" },
    knowsLanguage: ["ar", "fr", "en"],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "editorial",
        email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "contact@example.com",
        availableLanguage: ["ar", "fr", "en"],
      },
    ],
  };
}

export function websiteSchema(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl()}/#website`,
    name: SITE.name,
    url: `${siteUrl()}/${locale}`,
    inLanguage: localeMeta[locale].htmlLang,
    publisher: { "@id": `${siteUrl()}/#organization` },
  };
}

export function breadcrumbSchema(locale: Locale, items: { name: string; target: RouteTarget }[]) {
  const list = items.map((item, index) => {
    const path = item.target.name === "home" ? `/${locale}` : undefined;
    return {
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absolute(path ?? ""),
    };
  });
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: list,
  };
}

export function webPageSchema(opts: {
  locale: Locale;
  url: string;
  name: string;
  description: string;
  updated?: string;
  type?: "WebPage" | "CollectionPage" | "AboutPage" | "FAQPage";
}) {
  return {
    "@context": "https://schema.org",
    "@type": opts.type ?? "WebPage",
    "@id": `${opts.url}#webpage`,
    url: opts.url,
    name: opts.name,
    description: opts.description,
    inLanguage: localeMeta[opts.locale].htmlLang,
    isPartOf: { "@id": `${siteUrl()}/#website` },
    publisher: { "@id": `${siteUrl()}/#organization` },
    ...(opts.updated ? { dateModified: opts.updated } : {}),
  };
}

export function articleSchema(opts: {
  locale: Locale;
  url: string;
  headline: string;
  description: string;
  published: string;
  updated: string;
  image: string;
  section?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.headline,
    description: opts.description,
    inLanguage: localeMeta[opts.locale].htmlLang,
    mainEntityOfPage: opts.url,
    datePublished: opts.published,
    dateModified: opts.updated,
    image: [opts.image],
    author: { "@id": `${siteUrl()}/#organization` },
    publisher: { "@id": `${siteUrl()}/#organization` },
    ...(opts.section ? { articleSection: opts.section } : {}),
  };
}

export function faqSchema(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

export function softwareAppSchema(opts: {
  locale: Locale;
  name: string;
  description: string;
  url: string;
  category?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: opts.name,
    description: opts.description,
    url: opts.url,
    applicationCategory: opts.category ?? "EducationalApplication",
    operatingSystem: "Any",
    inLanguage: localeMeta[opts.locale].htmlLang,
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "DZD" },
    publisher: { "@id": `${siteUrl()}/#organization` },
  };
}

export function collectionSchema(opts: {
  locale: Locale;
  url: string;
  name: string;
  description: string;
  items: { name: string; url: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    url: opts.url,
    name: opts.name,
    description: opts.description,
    inLanguage: localeMeta[opts.locale].htmlLang,
    isPartOf: { "@id": `${siteUrl()}/#website` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: opts.items.length,
      itemListElement: opts.items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        url: item.url,
      })),
    },
  };
}

export function learningResourceSchema(opts: {
  locale: Locale;
  name: string;
  description: string;
  url: string;
  educationalLevel?: string;
  about?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: opts.name,
    description: opts.description,
    url: opts.url,
    inLanguage: localeMeta[opts.locale].htmlLang,
    learningResourceType: "Exam preparation",
    educationalLevel: opts.educationalLevel ?? "Upper secondary (Baccalaureate)",
    isAccessibleForFree: true,
    ...(opts.about ? { about: opts.about } : {}),
    publisher: { "@id": `${siteUrl()}/#organization` },
  };
}

export { locales };
