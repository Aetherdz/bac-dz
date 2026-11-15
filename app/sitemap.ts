import type { MetadataRoute } from "next";
import { locales, type Locale } from "@/lib/i18n";
import { absolute } from "@/lib/seo";
import { allTargets } from "@/lib/route-index";
import { metaFor } from "@/lib/page-meta";
import { pathFor } from "@/lib/routes";

const fallbackDate = "2026-11-15";

export default function sitemap(): MetadataRoute.Sitemap {
  const targets = allTargets();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const target of targets) {
      const meta = metaFor(locale as Locale, target);
      if (meta.noindex) continue;

      const languages: Record<string, string> = {};
      for (const alt of locales) languages[alt] = absolute(pathFor(alt, target));
      languages["x-default"] = absolute(pathFor("ar", target));

      entries.push({
        url: absolute(pathFor(locale, target)),
        lastModified: meta.updated ?? fallbackDate,
        changeFrequency: target.name === "home" ? "weekly" : target.name === "update" ? "yearly" : "monthly",
        priority: target.name === "home" ? 1 : target.name === "calculator" ? 0.9 : 0.6,
        alternates: { languages },
      });
    }
  }

  return entries;
}
