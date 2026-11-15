import type { Localized } from "./bac";
import type { SourceRef } from "./types";

/**
 * Exam calendar.
 *
 * Two different things live here and must never be confused:
 *  - `startsOn` is an OFFICIAL date, only set once a decision is published (or
 *    pinned by an operator through NEXT_PUBLIC_BAC_EXAM_DATE).
 *  - `estimatedStartsOn` is a transparent WORKING ESTIMATE derived from the
 *    published rule below. It powers a live countdown so students always see
 *    time remaining, but it is labelled as an estimate everywhere it appears and
 *    is replaced automatically the moment the official date is known.
 *
 * As of the last verification (2026-11-15) the 2027 session had not been
 * announced, so the estimate is in use.
 */

export type ExamSessionStatus = "official" | "estimated";

export type ExamSession = {
  id: string;
  label: Localized;
  status: ExamSessionStatus;
  /** ISO date (YYYY-MM-DD) of the first written paper, when officially known. */
  startsOn: string | null;
  /** Working estimate used for the countdown until the official date exists. */
  estimatedStartsOn: string | null;
  /** Why the estimate is what it is. Shown next to the estimate, never hidden. */
  estimateRule: Localized | null;
  note: Localized;
  verifiedOn: string;
};

export const ALGIERS_TIME_ZONE = "Africa/Algiers";
export const EXAM_START_HOUR = "08:00";

export const examSources: SourceRef[] = [
  {
    label: "Ministère de l’Éducation nationale — calendrier des examens officiels",
    url: "https://www.education.gov.dz/",
    kind: "official",
    checkedOn: "2026-11-15",
  },
  {
    label: "ONEC — Office national des examens et concours",
    url: "https://www.onec.dz/",
    kind: "official",
    checkedOn: "2026-11-15",
  },
];

/**
 * Estimate rule, stated openly: recent baccalauréat sessions open on a Sunday
 * in the first half of June, with the first paper at 08:00 Algiers time. The
 * first Sunday of June 2027 is 6 June, so that is the working estimate.
 */
const ESTIMATE_2027 = "2027-06-06";

const ESTIMATE_RULE_2027: Localized = {
  ar: "قاعدة التقدير: تفتح الدورات الأخيرة يوم أحد في النصف الأول من جوان، على الساعة 08:00 بتوقيت الجزائر. أول أحد من جوان 2027 هو 6 جوان، ومنه يُحسب العدّاد.",
  fr: "Règle d’estimation : les dernières sessions ouvrent un dimanche de la première quinzaine de juin, à 08:00 heure d’Alger. Le premier dimanche de juin 2027 est le 6 juin : c’est la base du compte à rebours.",
  en: "Estimate rule: recent sessions open on a Sunday in the first half of June, at 08:00 Algiers time. The first Sunday of June 2027 is 6 June, which is what the countdown targets.",
};

const ESTIMATE_NOTE_2027: Localized = {
  ar: "الموعد الرسمي لدورة 2027 لم يُنشر بعد (آخر تحقق: 15 نوفمبر 2026). العدّاد يعمل على موعد تقديري معلن، ويُستبدل تلقائيًا بالتاريخ الرسمي فور نشره.",
  fr: "La date officielle de la session 2027 n’est pas encore publiée (dernière vérification : 15 novembre 2026). Le compte à rebours tourne sur une estimation annoncée, remplacée automatiquement par la date officielle dès sa publication.",
  en: "The official 2027 date is not published yet (last check: 15 November 2026). The countdown runs on a stated estimate and switches to the official date automatically once it is published.",
};

const OFFICIAL_NOTE: Localized = {
  ar: "التاريخ مثبّت بعد نشر القرار الرسمي، ويُحسب الموعد على الساعة 08:00 بتوقيت الجزائر.",
  fr: "Date fixée après publication de la décision officielle, calculée à 08:00 heure d’Alger.",
  en: "Date pinned after the official decision, computed at 08:00 Algiers time.",
};

/** Normalise an env-provided date, accepting only a valid YYYY-MM-DD. */
function validIsoDate(raw: string | undefined): string | null {
  if (!raw) return null;
  const value = raw.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10) === value ? value : null;
}

const pinned = validIsoDate(process.env.NEXT_PUBLIC_BAC_EXAM_DATE);

/** The session the site currently speaks about: 2027. */
export const primarySession: () => ExamSession = () => ({
  id: "2027",
  label: { ar: "دورة 2027", fr: "Session 2027", en: "2027 session" },
  status: pinned ? "official" : "estimated",
  startsOn: pinned,
  estimatedStartsOn: ESTIMATE_2027,
  estimateRule: ESTIMATE_RULE_2027,
  note: pinned ? OFFICIAL_NOTE : ESTIMATE_NOTE_2027,
  verifiedOn: "2026-11-15",
});

export const examSessions: ExamSession[] = [
  {
    id: "2027",
    label: { ar: "دورة جوان 2027", fr: "Session juin 2027", en: "June 2027 session" },
    status: pinned ? "official" : "estimated",
    startsOn: pinned,
    estimatedStartsOn: ESTIMATE_2027,
    estimateRule: ESTIMATE_RULE_2027,
    note: pinned ? OFFICIAL_NOTE : ESTIMATE_NOTE_2027,
    verifiedOn: "2026-11-15",
  },
  {
    id: "2026",
    label: { ar: "دورة جوان 2026", fr: "Session juin 2026", en: "June 2026 session" },
    status: "official",
    // The 2026 session was held; we deliberately do not restate a precise day
    // from memory here. Archived material lives in the exam index.
    startsOn: null,
    estimatedStartsOn: null,
    estimateRule: null,
    note: {
      ar: "دورة منتهية. أرشيف المواضيع المتاح لدينا مفهرس حسب السنة والشعبة والمادة.",
      fr: "Session terminée. L’archive de sujets disponible est indexée par année, filière et matière.",
      en: "Completed session. The paper archive we hold is indexed by year, stream and subject.",
    },
    verifiedOn: "2026-11-15",
  },
];

/**
 * What the countdown should actually target, and how honest that target is.
 * Official always wins; the estimate is the fallback so the timer never stops.
 */
export function countdownTarget(session: ExamSession): {
  iso: string | null;
  kind: "official" | "estimated";
} {
  if (session.startsOn) return { iso: session.startsOn, kind: "official" };
  if (session.estimatedStartsOn) return { iso: session.estimatedStartsOn, kind: "estimated" };
  return { iso: null, kind: "estimated" };
}

/** Epoch ms for an ISO date at the exam start hour, Algiers time. */
export function examTimestamp(iso: string): number {
  return new Date(`${iso}T${EXAM_START_HOUR}:00+01:00`).getTime();
}
