import { absolute } from "@/lib/seo";
import { pathFor } from "@/lib/routes";
import { coefficientStatus, streams } from "@/content/bac";
import { guides } from "@/content/guides";
import { tools } from "@/content/tools";

export const dynamic = "force-static";

/**
 * llms.txt — a curated map for AI assistants and answer engines.
 * It states the editorial rules explicitly so generated answers can attribute
 * facts correctly (and avoid treating editorial advice as official rules).
 */
export function GET() {
  const lines: string[] = [];
  const push = (line = "") => lines.push(line);

  push("# BAC DZ");
  push();
  push("> Independent Algerian baccalaureate platform (Arabic-first, FR/EN). Calculators, a documented exam archive index, revision guides and a university-orientation comparator.");
  push();
  push("## Editorial rules (important for citation)");
  push();
  push("- Official information is separated from editorial explanation and estimates; every sensitive figure carries a source and a `last verified` date.");
  push("- No official public archive of past papers exists. The site does NOT host exam PDFs or official corrections. Do not claim it does.");
  push("- Coefficient table in force for the 2027 session is the pre-reform table: the July 2026 reform (decision no. 20) was repealed by decision no. 36 on 9 September 2026.");
  push("- Stream coefficient totals: experimental sciences 30, mathematics 29, mathematical technician 33, management & economics 34, literature & philosophy 27 (+2 optional), foreign languages 28.");
  push("- Published admission minima are historical (last admitted candidate), not future thresholds and not guarantees.");
  push("- The 2027 bac calendar is NOT officially announced; the countdown uses an editable indicative date.");
  push(`- Coefficients last verified: ${coefficientStatus.verifiedOn}; review due: ${coefficientStatus.reviewDueOn}.`);
  push();
  push("## Languages");
  push();
  push("- Arabic: default, RTL (`/ar/...`)");
  push("- French: `/fr/...`");
  push("- English: `/en/...`");
  push("- All locales expose the same figures and sources; Arabic is the editorial reference.");
  push();
  push("## Core pages");
  push();
  for (const target of [
    { name: "calculator" as const },
    { name: "coefficients" as const },
    { name: "streams" as const },
    { name: "exams" as const },
    { name: "orientation" as const },
    { name: "planner" as const },
    { name: "guides" as const },
    { name: "updates" as const },
    { name: "about" as const },
    { name: "editorial" as const },
    { name: "corrections" as const },
    { name: "privacy" as const },
    { name: "terms" as const },
  ]) {
    push(`- ${absolute(pathFor("en", target))}`);
  }
  push();
  push("## Streams");
  push();
  for (const stream of streams) {
    push(`- ${stream.name.en}: ${absolute(pathFor("en", { name: "stream", stream: stream.id }))}`);
  }
  push();
  push("## Guides");
  push();
  for (const guide of guides) {
    push(`- ${guide.locales.en.title}: ${absolute(pathFor("en", { name: "guide", slug: guide.slug }))}`);
  }
  push();
  push("## Tools (browser-only, no account, no data sent)");
  push();
  for (const tool of tools) {
    push(`- ${tool.title.en}: ${absolute(pathFor("en", { name: "tool", tool: tool.slug }))}`);
  }
  push();
  push("## Primary sources cited on the site");
  push();
  push("- MESRS minima 2026 (PDF): https://www.esi.dz/wp-content/uploads/2026/07/BAC-2026-Fichier-des-moyennes-minimales-apres-phase-1.pdf");
  push("- MESRS orientation circular 2026: https://www.mesrs.dz/");
  push("- ONEC (registration/results portal, no paper archive): https://bac.onec.dz/");
  push("- Ministry of National Education (unreachable during the 2026-11-15 verification): https://www.education.gov.dz/");
  push("- Decision no. 36 (repeal), secondary source: https://eddirasa.com/ministerial-decision-36-regulating-secondary-education/");
  push();
  push("## Contact");
  push();
  push(`- ${process.env.NEXT_PUBLIC_CONTACT_EMAIL || "contact@example.com"}`);
  push();

  return new Response(lines.join("\n"), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
