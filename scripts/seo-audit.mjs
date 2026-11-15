/**
 * SEO / GEO audit.
 *
 * Crawls every URL in the generated sitemap and checks the signals that matter
 * for indexing and for answer engines: HTTP status, unique title, description,
 * canonical, hreflang completeness, a single H1, html lang/dir, and JSON-LD.
 *
 * Usage:
 *   AUDIT_BASE_URL=https://example.com node scripts/seo-audit.mjs
 */
const BASE = (process.env.AUDIT_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const CONCURRENCY = Number(process.env.AUDIT_CONCURRENCY || 6);

async function fetchText(url) {
  const response = await fetch(url, { headers: { "user-agent": "bac-dz-seo-audit" } });
  return { status: response.status, contentType: response.headers.get("content-type") || "", body: await response.text() };
}

function collect(html, pattern) {
  return [...html.matchAll(pattern)].map((match) => match[1]);
}

const sitemap = await fetchText(`${BASE}/sitemap.xml`);
if (sitemap.status !== 200) {
  console.error(`FAIL sitemap.xml → ${sitemap.status}`);
  process.exit(1);
}

const urls = [...sitemap.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
if (urls.length === 0) {
  console.error("FAIL sitemap.xml contains no URLs");
  process.exit(1);
}

const problems = [];
const titles = new Map();
const descriptions = new Map();
let checked = 0;

async function audit(url) {
  const pathname = new URL(url).pathname;
  const { status, contentType, body } = await fetchText(`${BASE}${pathname}`);
  checked += 1;

  if (status !== 200) problems.push(`${status} ${pathname}`);
  if (!contentType.includes("text/html")) problems.push(`not-html ${pathname}`);

  const title = collect(body, /<title>([^<]*)<\/title>/g)[0] || "";
  const description = collect(body, /<meta name="description" content="([^"]*)"/g)[0] || "";
  const canonical = collect(body, /<link rel="canonical" href="([^"]*)"/g)[0] || "";
  const h1 = (body.match(/<h1[\s>]/g) || []).length;
  const lang = collect(body, /<html lang="([^"]*)"/g)[0] || "";
  const dir = collect(body, /<html[^>]*dir="([^"]*)"/g)[0] || "";
  const hreflang = collect(body, /<link rel="alternate" hrefLang="([^"]*)"/g);
  const jsonLd = (body.match(/application\/ld\+json/g) || []).length;

  if (!title) problems.push(`no-title ${pathname}`);
  if (title.length > 70) problems.push(`long-title(${title.length}) ${pathname}`);
  if (!description) problems.push(`no-description ${pathname}`);
  if (description.length > 175) problems.push(`long-description(${description.length}) ${pathname}`);
  if (!canonical) problems.push(`no-canonical ${pathname}`);
  if (canonical && new URL(canonical).pathname !== pathname) problems.push(`canonical-mismatch ${pathname} → ${canonical}`);
  if (h1 !== 1) problems.push(`h1-count(${h1}) ${pathname}`);
  if (!lang) problems.push(`no-lang ${pathname}`);
  if (!["rtl", "ltr"].includes(dir)) problems.push(`bad-dir(${dir || "none"}) ${pathname}`);
  if (hreflang.length !== 4) problems.push(`hreflang-count(${hreflang.length}) ${pathname}`);
  if (jsonLd === 0) problems.push(`no-jsonld ${pathname}`);

  if (titles.has(title)) problems.push(`duplicate-title ${pathname} == ${titles.get(title)}`);
  else titles.set(title, pathname);
  if (descriptions.has(description)) problems.push(`duplicate-description ${pathname} == ${descriptions.get(description)}`);
  else descriptions.set(description, pathname);
}

for (let index = 0; index < urls.length; index += CONCURRENCY) {
  await Promise.all(urls.slice(index, index + CONCURRENCY).map((url) => audit(url).catch((error) => problems.push(`error ${url} ${error.message}`))));
}

for (const extra of ["/robots.txt", "/llms.txt"]) {
  const result = await fetchText(`${BASE}${extra}`);
  if (result.status !== 200) problems.push(`${result.status} ${extra}`);
}

console.log(`Checked ${checked} sitemap URLs on ${BASE}`);
if (problems.length === 0) {
  console.log("PASS: titles, descriptions, canonicals, hreflang, headings and JSON-LD look correct.");
} else {
  console.log(`FAIL: ${problems.length} issue(s)`);
  for (const problem of problems) console.log(` - ${problem}`);
  process.exitCode = 1;
}
