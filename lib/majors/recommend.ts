/**
 * Recommendation engine.
 *
 * It ranks the renderable majors for one student profile. Everything is
 * phrased as a *historical comparison* with the published 2026 table: the
 * engine never says a candidate is eligible, admitted or guaranteed, because
 * it cannot know that. Bucket names describe data distance, not a decision.
 *
 * Bucket rules (2026 threshold of the student's stream):
 * - match      average ≥ threshold + 1
 * - reachable  threshold − 2 ≤ average < threshold + 1
 * - stretch    average < threshold − 2
 * - explore    no threshold for that stream, or no average given
 *
 * The ministry table publishes three candidate groups (Min1/Min2/Min3) and we
 * do not reinterpret them: the comparison uses Min1 when present (otherwise the
 * lowest published value), and the record is surfaced as an uncertainty.
 *
 * Every recommendation carries at least one human-readable reason in all three
 * locales. Records withheld by `lib/majors/dataset.ts` are never candidates.
 */
import { streamById, type StreamId } from "@/content/bac";
import type { AcademicField, Major, ThresholdRecord } from "@/content/majors/schema";
import { publishedInstitutionLabel, renderableMajors, renderableUniversities, thresholdsForMajorSlug } from "./dataset";
import { fieldLabels, normalizeQuery } from "./search";

export type RecommendationBucket = "match" | "reachable" | "stretch" | "explore";

export type LocalizedText = { ar: string; fr: string; en: string };

export type RecommendationInput = {
  stream: string;
  average: number | null;
  fields: AcademicField[];
  interests: string[];
  city?: string | null;
  universityId?: string | null;
  maxYears?: number | null;
};

export type Recommendation = {
  major: Major;
  bucket: RecommendationBucket;
  score: number;
  reasons: LocalizedText[];
  threshold: ThresholdRecord | null;
  thresholdDelta: number | null;
  uncertainties: LocalizedText[];
};

const BUCKET_SCORE: Record<RecommendationBucket, number> = {
  match: 100,
  reachable: 75,
  stretch: 45,
  explore: 30,
};

/** Fixed order used by the UI so buckets never depend on the ranking. */
export const RECOMMENDATION_BUCKETS: readonly RecommendationBucket[] = [
  "match",
  "reachable",
  "stretch",
  "explore",
];

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function fmt(value: number): string {
  return value.toFixed(2);
}

export function streamName(stream: string): { ar: string; fr: string; en: string } {
  const entry = (streamById as Record<string, { name: { ar: string; fr: string; en: string } } | undefined>)[
    stream as StreamId
  ];
  if (entry) return entry.name;
  return { ar: stream, fr: stream, en: stream };
}

/** Lowest published 2026 value for the stream, preferring the Min1 column. */
function thresholdFor(major: Major, stream: string): ThresholdRecord | null {
  const candidates = thresholdsForMajorSlug(major.slug).filter(
    (record) => record.bacStream === stream && record.academicYear === 2026 && record.value !== null,
  );
  if (candidates.length === 0) return null;

  const min1 = candidates.find((record) => record.group === "min1");
  if (min1) return min1;

  let best = candidates[0];
  for (const record of candidates) {
    if (record.value === null || best.value === null) continue;
    if (record.value < best.value) best = record;
  }
  return best;
}

export function classifyBucket(
  average: number | null,
  threshold: ThresholdRecord | null,
): { bucket: RecommendationBucket; delta: number | null } {
  if (average === null || threshold === null || threshold.value === null) {
    return { bucket: "explore", delta: null };
  }
  const delta = round2(average - threshold.value);
  if (delta >= 1) return { bucket: "match", delta };
  if (delta >= -2) return { bucket: "reachable", delta };
  return { bucket: "stretch", delta };
}

function interestMatches(major: Major, interests: string[]): string[] {
  if (interests.length === 0) return [];
  const haystack = new Set<string>();
  const texts = [major.name.ar, major.name.fr, major.name.en ?? "", major.summary.ar, major.summary.fr, ...major.keywords];
  for (const text of texts) {
    for (const token of normalizeQuery(text).split(" ")) {
      if (token.length > 0) haystack.add(token);
    }
  }

  const matched: string[] = [];
  for (const interest of interests) {
    const tokens = normalizeQuery(interest)
      .split(" ")
      .filter((token) => token.length > 1);
    const hit = tokens.some((token) => {
      if (haystack.has(token)) return true;
      if (token.length < 3) return false;
      for (const word of haystack) {
        if (word.startsWith(token)) return true;
      }
      return false;
    });
    if (hit) matched.push(interest);
  }
  return matched;
}

const NO_AVERAGE: LocalizedText = {
  ar: "لم يُقدَّم أي معدل: لا يمكن إجراء مقارنة مع الأرقام المنشورة.",
  fr: "Aucune moyenne n’a été fournie : aucune comparaison avec les chiffres publiés n’est possible.",
  en: "No average was provided, so no comparison with the published figures is possible.",
};

const NO_THRESHOLD: LocalizedText = {
  ar: "لا يوجد رقم منشور لسنة 2026 لهذه الشعبة: تصنيف «استكشاف» يعني غياب البيانات لا تقدير الصعوبة.",
  fr: "Pas de chiffre 2026 pour cette filière : le classement « explorer » signale une absence de données, pas une difficulté estimée.",
  en: "No 2026 figure is published for this stream: “explore” means missing data, not an estimated difficulty.",
};

const STREAM_NOT_LISTED: LocalizedText = {
  ar: "قائمة الشعب في هذا السطر الرسمي لا تتضمن شعبتك: يجب التأكد من المنشور الرسمي.",
  fr: "La liste de filières de cette ligne officielle n’inclut pas votre filière : à confirmer avec la circulaire.",
  en: "The official row’s stream list does not include your stream: confirm it against the official notice.",
};

const GROUP_CAVEAT: LocalizedText = {
  ar: "الجدول ينشر ثلاث فئات للمترشحين (Min1/Min2/Min3)؛ المقارنة هنا تعتمد عمود Min1 فقط، وقد تنطبق عليك فئة أخرى.",
  fr: "Le tableau publie trois groupes de candidats (Min1/Min2/Min3) ; la comparaison utilisée ici est la colonne Min1, un autre groupe peut concerner votre profil.",
  en: "The table publishes three candidate groups (Min1/Min2/Min3); this comparison uses the Min1 column only, and another group may apply to you.",
};

const STREAM_PAIRING_CAVEAT: LocalizedText = {
  ar: "ربط هذا المعدل بشعبتك تصنيف تحريري في هذا الموقع: الجدول الرسمي ينشر المؤسسة والمجال، لا عمودًا لكل شعبة.",
  fr: "Le rattachement de ce seuil à votre filière est éditorial : le tableau officiel publie l’établissement et le domaine, pas une colonne par filière.",
  en: "Attaching this threshold to your stream is editorial: the official table publishes the institution and field, not one column per stream.",
};

const DATA_GAPS: LocalizedText = {
  ar: "البيانات ناقصة: مستوى الشهادة والمدة والبرنامج غير مذكورة في المصدر.",
  fr: "Données incomplètes : niveau de diplôme, durée et programme sont absents de la source.",
  en: "Incomplete data: degree level, duration and curriculum are absent from the source.",
};

const CITY_UNAVAILABLE: LocalizedText = {
  ar: "لا تتوفر أي مدينة في بيانات المؤسسات، لذلك لم يُطبَّق تفضيل المدينة.",
  fr: "Aucune ville n’est renseignée pour les établissements : la préférence de ville n’a pas pu être appliquée.",
  en: "No city is recorded for these institutions, so the city preference could not be applied.",
};

const DURATION_UNKNOWN: LocalizedText = {
  ar: "المدة غير مذكورة في المصدر، لذلك لم يُطبَّق شرط الحد الأقصى للسنوات.",
  fr: "La durée n’est pas indiquée dans la source : le plafond d’années n’a pas pu être appliqué.",
  en: "The duration is not stated in the source, so the maximum-years condition could not be applied.",
};

/* -------------------------------------------------------------------------- */
/* Public API                                                                 */
/* -------------------------------------------------------------------------- */

export function recommendMajors(input: RecommendationInput, limit = 10): Recommendation[] {
  const size = Math.max(0, Math.floor(limit));
  if (size === 0) return [];

  const average = input.average !== null && Number.isFinite(input.average) ? input.average : null;
  const wantsFields = input.fields;
  const stream = streamName(input.stream);
  const normalizedCity = input.city ? normalizeQuery(input.city) : null;
  // No city is published in the 2026 table, so this is false by construction.
  const cityKnown = renderableUniversities.some((university) => university.city !== null);

  const candidates = renderableMajors.filter(
    (major) => wantsFields.length === 0 || wantsFields.includes(major.field),
  );

  const recommendations = candidates.map((major) => {
    const threshold = thresholdFor(major, input.stream);
    const { bucket, delta } = classifyBucket(average, threshold);
    const reasons: LocalizedText[] = [];
    const uncertainties: LocalizedText[] = [];

    let score = BUCKET_SCORE[bucket];

    if (threshold && threshold.value !== null) {
      const value = threshold.value;
      const place = publishedInstitutionLabel(threshold.universityId);
      const group = threshold.group ?? "—";
      reasons.push({
        ar: `المعدل الأدنى المنشور لسنة 2026 في ${place}: ${fmt(value)}/20 (عمود ${group} من الجدول).`,
        fr: `Moyenne minimale publiée en 2026 à ${place} : ${fmt(value)}/20 (colonne ${group} du tableau).`,
        en: `Published 2026 minimum average at ${place}: ${fmt(value)}/20 (table column ${group}).`,
      });
      if (average !== null && delta !== null) {
        const distance = fmt(Math.abs(delta));
        if (delta >= 0) {
          reasons.push({
            ar: `معدلك المصرَّح به (${fmt(average)}/20) أعلى من هذا الرقم المنشور بـ ${distance} نقطة: مقارنة تاريخية بجدول 2026.`,
            fr: `Votre moyenne déclarée (${fmt(average)}/20) se situe ${distance} point(s) au-dessus de ce chiffre publié : comparaison historique avec le tableau 2026.`,
            en: `Your stated average (${fmt(average)}/20) is ${distance} point(s) above this published figure: a historical comparison with the 2026 table.`,
          });
        } else {
          reasons.push({
            ar: `معدلك المصرَّح به (${fmt(average)}/20) أدنى من هذا الرقم المنشور لسنة 2026 بـ ${distance} نقطة.`,
            fr: `Votre moyenne déclarée (${fmt(average)}/20) est inférieure de ${distance} point(s) à ce chiffre publié en 2026.`,
            en: `Your stated average (${fmt(average)}/20) is ${distance} point(s) below this 2026 published figure.`,
          });
        }
      }
      if (threshold.group !== "min1") uncertainties.push(GROUP_CAVEAT);
      uncertainties.push(STREAM_PAIRING_CAVEAT);
    } else {
      reasons.push({
        ar: `لا يوجد رقم منشور لسنة 2026 مرتبط بهذا التكوين لشعبة ${stream.ar} في هذه البيانات.`,
        fr: `Aucun chiffre 2026 n’est rattaché à ce programme pour la filière ${stream.fr} dans ce jeu de données.`,
        en: `No 2026 figure is attached to this program for the ${stream.en} stream in this dataset.`,
      });
      uncertainties.push(NO_THRESHOLD);
    }

    if (average === null) uncertainties.push(NO_AVERAGE);

    if (major.bacStreams.includes(input.stream)) {
      score += 12;
      reasons.push({
        ar: `السطر الرسمي لسنة 2026 يربط هذا التكوين بشعبة ${stream.ar}.`,
        fr: `La ligne officielle 2026 associe ce programme à la filière ${stream.fr}.`,
        en: `The 2026 official row lists this program for the ${stream.en} stream.`,
      });
    } else {
      uncertainties.push(STREAM_NOT_LISTED);
    }

    if (wantsFields.includes(major.field)) {
      score += 20;
      reasons.push({
        ar: `المجال «${fieldLabels[major.field].ar}» ضمن اختياراتك.`,
        fr: `Domaine « ${fieldLabels[major.field].fr} », retenu dans vos préférences.`,
        en: `Field “${fieldLabels[major.field].en}”, selected in your preferences.`,
      });
    }

    const matches = interestMatches(major, input.interests);
    if (matches.length > 0) {
      score += Math.min(3, matches.length) * 8;
      for (const match of matches.slice(0, 2)) {
        reasons.push({
          ar: `يطابق اهتمامك «${match}».`,
          fr: `Correspond à votre intérêt « ${match} ».`,
          en: `Matches your interest “${match}”.`,
        });
      }
    }

    if (input.universityId && major.universityIds.includes(input.universityId)) {
      score += 6;
      const place = publishedInstitutionLabel(input.universityId);
      reasons.push({
        ar: `التكوين مرتبط بـ${place}، وهي مؤسسة اخترتها.`,
        fr: `Programme rattaché à ${place}, un établissement que vous avez choisi.`,
        en: `Program linked to ${place}, an institution you selected.`,
      });
    }

    if (normalizedCity && !cityKnown) uncertainties.push(CITY_UNAVAILABLE);

    if (typeof input.maxYears === "number" && major.durationYears === null) {
      uncertainties.push(DURATION_UNKNOWN);
    }

    if (delta !== null) {
      score += Math.max(-6, Math.min(6, delta)) * 2;
    }
    score += 2;
    if (major.degree === "unknown" || major.durationYears === null) uncertainties.push(DATA_GAPS);

    return {
      major,
      bucket,
      score: round2(score),
      reasons,
      threshold,
      thresholdDelta: delta,
      uncertainties,
    };
  });

  recommendations.sort(
    (a, b) => b.score - a.score || a.major.name.fr.localeCompare(b.major.name.fr, "fr"),
  );

  return recommendations.slice(0, size);
}

/** Group a recommendation list into the four buckets, in a stable order. */
export function groupByBucket(
  recommendations: Recommendation[],
): Record<RecommendationBucket, Recommendation[]> {
  const out: Record<RecommendationBucket, Recommendation[]> = {
    match: [],
    reachable: [],
    stretch: [],
    explore: [],
  };
  for (const item of recommendations) out[item.bucket].push(item);
  return out;
}
