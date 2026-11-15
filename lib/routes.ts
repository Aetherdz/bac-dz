import { defaultLocale, locales, type Locale } from "./i18n";

/**
 * One logical page, one canonical URL per locale. Slugs are localized for the
 * Latin-script locales and kept stable/Latin for Arabic so that URLs stay
 * readable and shareable (Arabic content is served with RTL + lang=ar-DZ).
 */
export type RouteTarget =
  | { name: "home" }
  | { name: "calculator" }
  | { name: "coefficients" }
  | { name: "streams" }
  | { name: "stream"; stream: string }
  | { name: "exams" }
  | { name: "examSubject"; year: number; stream: string; subject: string }
  | { name: "guides" }
  | { name: "guide"; slug: string }
  | { name: "tools" }
  | { name: "tool"; tool: string }
  | { name: "orientation" }
  | { name: "planner" }
  | { name: "updates" }
  | { name: "update"; slug: string }
  | { name: "search" }
  | { name: "about" }
  | { name: "editorial" }
  | { name: "corrections" }
  | { name: "privacy" }
  | { name: "terms" }
  | { name: "contact" };

type StaticName = Exclude<RouteTarget["name"], "stream" | "examSubject" | "guide" | "tool" | "update">;

const staticPaths: Record<StaticName, Record<Locale, string[]>> = {
  home: { ar: [], fr: [], en: [] },
  calculator: { ar: ["bac-calculator"], fr: ["calcul-moyenne-bac"], en: ["bac-grade-calculator"] },
  coefficients: { ar: ["moaamalat-bac"], fr: ["coefficients-bac"], en: ["bac-coefficients"] },
  streams: { ar: ["shuab-bac"], fr: ["filieres-bac"], en: ["bac-streams"] },
  exams: { ar: ["bac-exams"], fr: ["sujets-bac"], en: ["bac-papers"] },
  guides: { ar: ["dalil"], fr: ["guides"], en: ["guides"] },
  tools: { ar: ["adawat"], fr: ["outils"], en: ["tools"] },
  orientation: { ar: ["tawjih-jamii"], fr: ["orientation-universitaire"], en: ["university-orientation"] },
  planner: { ar: ["mudhakkira-muraajaa"], fr: ["planificateur-revision"], en: ["study-planner"] },
  updates: { ar: ["mustajiddat"], fr: ["actualites"], en: ["updates"] },
  about: { ar: ["man-nahnu"], fr: ["a-propos"], en: ["about"] },
  editorial: { ar: ["siyasa-tahrir"], fr: ["charte-editoriale"], en: ["editorial-policy"] },
  corrections: { ar: ["siyasat-tashih"], fr: ["politique-corrections"], en: ["corrections-policy"] },
  privacy: { ar: ["khososiya"], fr: ["confidentialite"], en: ["privacy"] },
  terms: { ar: ["shurut-istikhdam"], fr: ["conditions-utilisation"], en: ["terms"] },
  contact: { ar: ["ittisal"], fr: ["contact"], en: ["contact"] },
  search: { ar: ["search"], fr: ["recherche"], en: ["search"] },
};

const streamBase: Record<Locale, string> = {
  ar: "shuab-bac",
  fr: "filieres-bac",
  en: "bac-streams",
};

const examsBase: Record<Locale, string> = {
  ar: "bac-exams",
  fr: "sujets-bac",
  en: "bac-papers",
};

const guidesBase: Record<Locale, string> = { ar: "dalil", fr: "guides", en: "guides" };
const toolsBase: Record<Locale, string> = { ar: "adawat", fr: "outils", en: "tools" };
const updatesBase: Record<Locale, string> = { ar: "mustajiddat", fr: "actualites", en: "updates" };

/** Build an internal path (always leading slash, no trailing slash). */
export function pathFor(locale: Locale, target: RouteTarget): string {
  const base = `/${locale}`;
  switch (target.name) {
    case "stream":
      return `${base}/${streamBase[locale]}/${target.stream}`;
    case "examSubject":
      return `${base}/${examsBase[locale]}/${target.year}/${target.stream}/${target.subject}`;
    case "guide":
      return `${base}/${guidesBase[locale]}/${target.slug}`;
    case "tool":
      return `${base}/${toolsBase[locale]}/${target.tool}`;
    case "update":
      return `${base}/${updatesBase[locale]}/${target.slug}`;
    default: {
      const segs = staticPaths[target.name][locale];
      return segs.length ? `${base}/${segs.join("/")}` : base;
    }
  }
}

/** All locale variants of a logical page, for hreflang. */
export function alternatesFor(target: RouteTarget): Record<Locale | "x-default", string> {
  const out = {} as Record<Locale | "x-default", string>;
  for (const locale of locales) out[locale] = pathFor(locale, target);
  out["x-default"] = pathFor(defaultLocale, target);
  return out;
}

/** Absolute URL helper. */
export function absoluteUrl(path: string, siteUrl: string): string {
  return `${siteUrl.replace(/\/$/, "")}${path}`;
}

const decoder = (s: string) => {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
};

/** Parse the catch-all segments into a logical route. */
export function matchRoute(rawSegments: string[]): RouteTarget | null {
  const segs = rawSegments.map(decoder);
  if (segs.length === 0) return { name: "home" };
  const [first, second, third, fourth] = segs;

  // Static, locale-agnostic matches: compare against every locale variant.
  for (const name of Object.keys(staticPaths) as StaticName[]) {
    if (name === "home") continue;
    for (const locale of locales) {
      if (staticPaths[name][locale].join("/") === segs.join("/")) {
        return { name } as RouteTarget;
      }
    }
  }

  // Streams
  for (const locale of locales) {
    if (first === streamBase[locale]) {
      if (!second) return { name: "streams" };
      if (segs.length === 2) return { name: "stream", stream: second };
      return null;
    }
  }

  // Exams: /exams or /exams/{year}/{stream}/{subject}
  for (const locale of locales) {
    if (first === examsBase[locale]) {
      if (!second) return { name: "exams" };
      if (segs.length === 4) {
        const year = Number(second);
        if (!Number.isInteger(year) || year < 2000 || year > 2100) return null;
        return { name: "examSubject", year, stream: third, subject: fourth };
      }
      return null;
    }
  }

  for (const locale of locales) {
    if (first === guidesBase[locale]) {
      if (!second) return { name: "guides" };
      if (segs.length === 2) return { name: "guide", slug: second };
      return null;
    }
    if (first === toolsBase[locale]) {
      if (!second) return { name: "tools" };
      if (segs.length === 2) return { name: "tool", tool: second };
      return null;
    }
    if (first === updatesBase[locale]) {
      if (!second) return { name: "updates" };
      if (segs.length === 2) return { name: "update", slug: second };
      return null;
    }
  }

  return null;
}

/** Route name used for the active nav item. */
export function navKey(target: RouteTarget): string {
  switch (target.name) {
    case "calculator":
      return "calculator";
    case "coefficients":
      return "coefficients";
    case "exams":
    case "examSubject":
      return "exams";
    case "streams":
    case "stream":
      return "streams";
    case "guides":
    case "guide":
      return "guides";
    case "orientation":
      return "orientation";
    case "tools":
    case "tool":
      return "tools";
    case "planner":
      return "planner";
    default:
      return "home";
  }
}

export const siteSections = {
  streamBase,
  examsBase,
  guidesBase,
  toolsBase,
  updatesBase,
  staticPaths,
};
