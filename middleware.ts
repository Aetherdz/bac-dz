import { NextResponse, type NextRequest } from "next/server";

const LOCALES = ["ar", "fr", "en"] as const;
const RESERVED = ["/api", "/admin", "/_next", "/favicon.ico", "/robots.txt", "/sitemap.xml", "/llms.txt", "/ads.txt", "/manifest.webmanifest"];

function preferredLocale(request: NextRequest): string {
  const header = request.headers.get("accept-language") ?? "";
  const candidates = header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { tag: tag.toLowerCase(), q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);

  for (const candidate of candidates) {
    if (candidate.tag.startsWith("ar")) return "ar";
    if (candidate.tag.startsWith("fr")) return "fr";
    if (candidate.tag.startsWith("en")) return "en";
  }
  return "ar";
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (RESERVED.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return NextResponse.next();
  }

  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];

  if (first && (LOCALES as readonly string[]).includes(first)) {
    return NextResponse.next();
  }

  // Every content URL is locale-prefixed so canonical URLs and hreflang stay consistent.
  const locale = preferredLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  url.search = search;
  return NextResponse.redirect(url, 307);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|txt|xml|webmanifest)$).*)"],
};
