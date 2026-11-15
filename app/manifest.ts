import type { MetadataRoute } from "next";

/**
 * Web app manifest: the mobile experience is intentionally app-like (bottom
 * tabs, safe-area aware bars, standalone display) while the desktop remains an
 * editorial site.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BAC DZ — منصة البكالوريا الجزائرية",
    short_name: "BAC DZ",
    description:
      "حاسبة معدل البكالوريا، أرشيف المواضيع، مؤقت التركيز، المهام، والتوجيه الجامعي — بمصادر ظاهرة.",
    start_url: "/ar",
    display: "standalone",
    orientation: "portrait",
    background_color: "#F6F4ED",
    theme_color: "#155239",
    lang: "ar",
    dir: "rtl",
    categories: ["education", "productivity"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
