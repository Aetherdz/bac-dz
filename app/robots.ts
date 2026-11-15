import type { MetadataRoute } from "next";
import { absolute } from "@/lib/seo";
import { siteSections } from "@/lib/routes";

export default function robots(): MetadataRoute.Robots {
  const searchPaths = [...new Set(Object.values(siteSections.staticPaths.search).map((segments) => `/${segments.join("/")}`))];
  const localizedSearch = ["ar", "fr", "en"].flatMap((locale) => searchPaths.map((path) => `/${locale}${path}`));

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [...new Set(["/admin", "/api/", ...localizedSearch])],
      },
    ],
    sitemap: absolute("/sitemap.xml"),
  };
}
