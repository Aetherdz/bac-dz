# BAC DZ — منصة البكالوريا الجزائرية

An independent, Arabic-first platform for Algerian baccalaureate candidates: a weighted-average calculator, verified coefficient tables, an honest exam-paper index, revision tools, an orientation comparator and dated editorial guides.

**Live:** https://bac-dz-iota.vercel.app (Vercel)
**Stack:** Next.js 15 App Router · React 19 · TypeScript · Tailwind CSS · no runtime database

---

## Why it is built this way

Most bac sites in Algeria compete on volume: hundreds of thin pages, copied tables, uncited "expected thresholds" and PDFs of unknown origin. This project takes the opposite approach:

- **Every sensitive figure carries a source and a verification date.** Coefficients, admission minima and calendars are never invented.
- **Official / editorial / estimated is always labelled.** A ministry decision is not presented like a study tip.
- **No hosted exam PDFs.** There is no official public archive; the site indexes subjects and explains what exists instead of uploading unverifiable files.
- **No fake AdSense IDs, no placeholder analytics.** Integrations activate only when real identifiers are configured.

### Facts encoded in the data (verified 2026-11-15)

| Fact | Status |
| --- | --- |
| Coefficient reform of 28 July 2026 (decision n°20) | **Repealed** by decision n°36 on 9 September 2026 |
| Coefficients in force for session 2027 | Pre-reform table (totals 27–34 by stream) |
| Official public past-paper archive | **Does not exist** — index only, 0 hosted PDFs |
| 2027 bac calendar | **Not announced** — countdown uses an editable indicative date |
| Orientation minima | Official MESRS 2026 table (historical, not a 2027 threshold) |

Coefficient totals: experimental sciences 30 · mathematics 29 · mathematical technique 33 · management & economics 34 · literature & philosophy 27 (+2 optional) · foreign languages 28.

---

## Architecture

```
app/
  (site)/[locale]/layout.tsx        html/body, fonts, theme, header/footer, JSON-LD
  (site)/[locale]/[[...slug]]/      single catch-all dispatcher
  robots.ts  sitemap.ts  llms.txt/  ads.txt/  api/og/
components/
  pages/                            one component per route family
  tools/                            client-only calculators (localStorage)
  blocks.tsx  jsonld.tsx  ui.tsx
content/                            typed, source-annotated data (bac, exams, guides, updates, orientation, tools)
lib/
  routes.ts                         route registry + localized slugs + hreflang helpers
  route-index.ts                    single source of truth for generateStaticParams / sitemap / search
  page-meta.ts                      per-route localized metadata
  bac.ts                            calculation engine (tested)
  seo.ts  search.ts  i18n.ts
scripts/                            test build + SEO/link audits
tests/                              node:test suite against the real engine
```

**Routing.** `lib/routes.ts` maps one logical page to three localized URLs. `lib/route-index.ts` derives `generateStaticParams`, the sitemap and the client search index from the same registry, so a page cannot exist in one place and be missing from another. All 195 localized pages are statically prerendered.

**Localization.** Arabic (`ar-DZ`, RTL) is the editorial reference; French and English are full translations with identical figures and sources. Slugs are localized for Latin locales and Latin-script for Arabic so URLs stay shareable.

**Privacy by design.** Calculators run entirely in the browser; grades and plans live in `localStorage`. No account, no upload, no server-side grade storage.

---

## Local development

```bash
npm install
npm run dev          # http://localhost:3000 → redirects to /ar (or Accept-Language)
```

Useful checks:

```bash
npm run typecheck
npm run test         # compiles the engine, runs node:test
npm run build && npm start
AUDIT_BASE_URL=http://localhost:3000 npm run audit:seo
AUDIT_BASE_URL=http://localhost:3000 npm run audit:links
```

The SEO audit checks unique titles/descriptions, canonicals, hreflang completeness, a single H1, `lang`/`dir`, and JSON-LD across every sitemap URL. The link audit follows internal links from the sitemap and fails on any 4xx.

---

## Environment variables

Copy `.env.example` to `.env.local`. Nothing below is required for the site to render; each integration stays disabled until its value exists.

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | **Yes in production** | Canonical origin used by metadata, sitemap, `llms.txt`, OG URLs. Falls back to `http://localhost:3000`. |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Recommended | Shown on contact/trust pages and in JSON-LD. |
| `NEXT_PUBLIC_GSC_VERIFICATION` | Optional | Google Search Console meta tag. |
| `NEXT_PUBLIC_ADSENSE_CLIENT` | Optional | `ca-pub-…`. When empty, no AdSense script is loaded and `/ads.txt` returns 404. |
| `NEXT_PUBLIC_ANALYTICS_ID` | Optional | Reserved; no analytics script ships in this build. |
| `DATABASE_URL`, `ADMIN_PASSWORD`, `AUTH_SECRET` | Not used yet | Reserved for a future admin/CMS; the deployed site has no database. |

---

## SEO and GEO

- Unique localized `<title>`/description, canonical per page, `hreflang` for `ar`/`fr`/`en` + `x-default`.
- `sitemap.xml` generated from the route registry with `lastModified` and language alternates; `robots.txt` disallows `/admin`, `/api/` and internal search.
- JSON-LD: Organization, WebSite, WebPage, FAQPage, Article, LearningResource, SoftwareApplication, CollectionPage, BreadcrumbList.
- `llms.txt` states the editorial rules and the verified facts explicitly so answer engines attribute coefficients, thresholds and archive status correctly.
- Semantic HTML, one H1 per page, skip link, visible focus states, light/dark themes, reduced-motion support, system font fallback, no client-side data fetching for content.
- Dynamic OG images via `/api/og` (Latin text only — Arabic shaping is intentionally not attempted in the image renderer).

---

## Deployment

The project deploys to Vercel with zero configuration:

1. Push the repository to GitHub.
2. Import it in Vercel (framework preset: Next.js).
3. Set `NEXT_PUBLIC_SITE_URL` to the production origin (for example `https://bac-dz-iota.vercel.app`).
4. Deploy, then run the audits against the production URL.

GitHub Pages is **not** used: the site relies on Next.js middleware (locale redirects), route handlers (`/api/og`, `/llms.txt`, `/ads.txt`) and server rendering for unknown paths, none of which GitHub Pages can run.

---

## Limitations (stated honestly)

- **No admin panel or CMS is included in this build.** Content is typed and versioned in `content/`. The database/auth variables are reserved but unused.
- **No exam PDFs or official corrections are hosted** because no official public archive was found; the index says so on every relevant page.
- **AdSense and analytics are inactive** because no publisher/measurement IDs were provided. No placeholder IDs are used.
- **Orientation minima are historical (2026/2025)**, not 2027 thresholds. The simulator compares, it does not predict.
- **The 2027 calendar is unknown.** The countdown's default date is labelled indicative and editable.
- The bilingual content is editorially maintained; translations should be re-reviewed whenever Arabic source text changes.

---

## License and independence

Editorial content and design belong to BAC DZ. Official texts remain the property of their institutions and are cited with links. The project is not affiliated with the Ministry of National Education, the MESRS or ONEC.
