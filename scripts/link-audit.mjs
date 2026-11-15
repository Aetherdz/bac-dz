/**
 * Internal link audit.
 *
 * Seeds the crawl with every sitemap URL, follows internal links on those
 * pages, and verifies that each unique path resolves (200) instead of 404.
 *
 * Usage:
 *   AUDIT_BASE_URL=https://example.com node scripts/link-audit.mjs
 */
const BASE = (process.env.AUDIT_BASE_URL || "http://localhost:3000").replace(/\/$/, "");

const sitemapResponse = await fetch(`${BASE}/sitemap.xml`);
if (!sitemapResponse.ok) {
  console.error(`FAIL sitemap.xml → ${sitemapResponse.status}`);
  process.exit(1);
}
const sitemap = await sitemapResponse.text();
const seeds = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]).pathname);

const paths = new Set(seeds);
const pages = new Set();

function isInternal(href) {
  if (!href) return false;
  if (/^(mailto:|tel:|javascript:|data:)/i.test(href)) return false;
  if (/^https?:\/\//i.test(href)) return href.startsWith(BASE);
  return href.startsWith("/");
}

for (const seed of seeds) {
  if (pages.has(seed)) continue;
  pages.add(seed);
  const response = await fetch(`${BASE}${seed}`);
  if (!response.ok) continue;
  const html = await response.text();
  for (const match of html.matchAll(/<a[^>]+href="([^"#]+)/g)) {
    const href = match[1].replace(/&amp;/g, "&");
    if (!isInternal(href)) continue;
    const pathname = new URL(href.startsWith("http") ? href : `${BASE}${href}`).pathname;
    if (pathname.startsWith("/_next/") || pathname.startsWith("/api/")) continue;
    paths.add(pathname);
  }
}

const failures = [];
const results = new Map();

async function check(pathname) {
  const response = await fetch(`${BASE}${pathname}`, { redirect: "manual" });
  results.set(pathname, response.status);
  if (response.status >= 400) failures.push(`${response.status} ${pathname}`);
}

for (const pathname of [...paths].sort()) {
  await check(pathname);
}

const redirects = [...results].filter(([, status]) => status >= 300 && status < 400);
const ok = [...results.values()].filter((status) => status === 200).length;

console.log(`Crawled ${pages.size} pages, checked ${results.size} unique internal paths on ${BASE}`);
console.log(`200: ${ok} · redirects: ${redirects.length} · failures: ${failures.length}`);

if (redirects.length) {
  for (const [pathname, status] of redirects) console.log(` - ${status} ${pathname}`);
}
if (failures.length) {
  for (const failure of failures) console.log(` - ${failure}`);
  process.exitCode = 1;
} else {
  console.log("PASS: no broken internal links.");
}
