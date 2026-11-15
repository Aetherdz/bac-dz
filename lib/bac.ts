import { streamById, subjectById, type CoefficientEntry, type Stream, type StreamId } from "@/content/bac";

export type GradeInput = {
  subject: string;
  coefficient: number;
  grade: number | null;
  optional?: boolean;
};

export type AverageResult = {
  average: number | null;
  totalPoints: number;
  totalCoefficient: number;
  gradedCount: number;
  totalCount: number;
  contributions: { subject: string; coefficient: number; grade: number; points: number; share: number }[];
  passes: boolean | null;
};

const MAX_GRADE = 20;
const MIN_GRADE = 0;

export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/** Parse a user-entered grade. Returns null for empty, "invalid" for out-of-range garbage. */
export function parseGrade(raw: string): number | null | "invalid" {
  const trimmed = raw.trim().replace(",", ".");
  if (trimmed === "") return null;
  if (!/^\d{1,2}(\.\d{1,2})?$/.test(trimmed)) return "invalid";
  const value = Number(trimmed);
  if (!Number.isFinite(value) || value < MIN_GRADE || value > MAX_GRADE) return "invalid";
  return round2(value);
}

export function validateGrade(value: number): boolean {
  return Number.isFinite(value) && value >= MIN_GRADE && value <= MAX_GRADE;
}

/**
 * Official bac average: sum(grade × coefficient) / sum(coefficient), over the
 * subjects that have a grade. Subjects without a grade are excluded — the
 * calculator shows how many were counted so the result is never ambiguous.
 */
export function computeAverage(input: GradeInput[]): AverageResult {
  const listed = input.filter((entry) => entry.grade !== null && validateGrade(entry.grade as number));
  const totalCoefficient = round2(listed.reduce((sum, entry) => sum + entry.coefficient, 0));

  if (totalCoefficient === 0) {
    return {
      average: null,
      totalPoints: 0,
      totalCoefficient: 0,
      gradedCount: 0,
      totalCount: input.length,
      contributions: [],
      passes: null,
    };
  }

  const totalPoints = round2(listed.reduce((sum, entry) => sum + (entry.grade as number) * entry.coefficient, 0));
  const average = round2(totalPoints / totalCoefficient);

  const contributions = listed.map((entry) => {
    const points = round2((entry.grade as number) * entry.coefficient);
    return {
      subject: entry.subject,
      coefficient: entry.coefficient,
      grade: entry.grade as number,
      points,
      share: round2((points / totalPoints) * 100),
    };
  });

  return {
    average,
    totalPoints,
    totalCoefficient,
    gradedCount: listed.length,
    totalCount: input.length,
    contributions,
    passes: average >= 10,
  };
}

export type RequiredGradeResult =
  | { kind: "possible"; grade: number }
  | { kind: "impossible"; reason: "above-20" | "below-0" }
  | { kind: "already-reached" };

/**
 * Solve for the grade x needed in one subject to reach `target`:
 * (fixedPoints + x·coefX) / (fixedCoef + coefX) = target
 */
export function requiredGrade(
  input: GradeInput[],
  targetSubject: string,
  target: number,
): RequiredGradeResult {
  if (!validateGrade(target)) return { kind: "impossible", reason: "above-20" };

  const targetEntry = input.find((entry) => entry.subject === targetSubject);
  if (!targetEntry) return { kind: "impossible", reason: "below-0" };

  const fixed = input.filter(
    (entry) => entry.subject !== targetSubject && entry.grade !== null && validateGrade(entry.grade as number),
  );
  const fixedPoints = fixed.reduce((sum, entry) => sum + (entry.grade as number) * entry.coefficient, 0);
  const fixedCoef = fixed.reduce((sum, entry) => sum + entry.coefficient, 0);
  const coefX = targetEntry.coefficient;

  const needed = (target * (fixedCoef + coefX) - fixedPoints) / coefX;

  if (needed <= 0) {
    // Even a zero in that subject keeps the target.
    return targetEntry.grade !== null && (targetEntry.grade as number) >= 0 && needed <= 0
      ? { kind: "already-reached" }
      : { kind: "possible", grade: 0 };
  }
  if (needed > MAX_GRADE) return { kind: "impossible", reason: "above-20" };
  return { kind: "possible", grade: round2(Math.max(0, needed)) };
}

export function entriesForStream(stream: Stream, grades: Record<string, number | null> = {}): GradeInput[] {
  return stream.coefficients.map((entry: CoefficientEntry) => ({
    subject: entry.subject,
    coefficient: entry.coefficient,
    grade: grades[entry.subject] ?? null,
    optional: entry.optional,
  }));
}

export function getStreamOrThrow(id: string): Stream {
  const stream = streamById[id as StreamId];
  if (!stream) throw new Error(`Unknown stream: ${id}`);
  return stream;
}

export function subjectLabel(subject: string): string {
  const subjectEntry = subjectById[subject as keyof typeof subjectById];
  return subjectEntry?.id ?? subject;
}

/** Human-readable formula used in the UI and in JSON-LD explanations. */
export function formulaText(totalCoefficient: number, totalPoints: number, average: number | null): string {
  if (average === null) return "—";
  return `(${totalPoints.toFixed(2)} ÷ ${totalCoefficient.toFixed(2)}) = ${average.toFixed(2)} / 20`;
}

/** Encode/decode calculator state for shareable links (no server round-trip). */
export function encodeState(stream: string, grades: Record<string, number | null>): string {
  const pairs = Object.entries(grades)
    .filter(([, value]) => value !== null && value !== undefined)
    .map(([key, value]) => `${key}:${value}`);
  return `${stream}~${pairs.join(",")}`;
}

export function decodeState(raw: string): { stream: string; grades: Record<string, number | null> } | null {
  if (!raw || typeof raw !== "string" || raw.length > 500) return null;
  const [stream, rest = ""] = raw.split("~");
  if (!stream) return null;
  const grades: Record<string, number | null> = {};
  for (const pair of rest.split(",")) {
    if (!pair) continue;
    const [key, value] = pair.split(":");
    const parsed = Number(value);
    if (key && Number.isFinite(parsed) && parsed >= 0 && parsed <= 20) grades[key] = round2(parsed);
  }
  return { stream, grades };
}

/** Study-time allocation: proportional to coefficient, with a minimum slot. */
export function allocateStudyMinutes(
  coefficients: { subject: string; coefficient: number }[],
  weeklyMinutes: number,
  minimumPerSubject = 20,
): { subject: string; minutes: number; share: number }[] {
  const total = coefficients.reduce((sum, entry) => sum + entry.coefficient, 0);
  if (total === 0 || weeklyMinutes <= 0) return [];
  const usable = Math.max(0, weeklyMinutes - minimumPerSubject * coefficients.length);
  return coefficients.map((entry) => {
    const minutes = Math.round((entry.coefficient / total) * usable + minimumPerSubject);
    return { subject: entry.subject, minutes, share: round2((entry.coefficient / total) * 100) };
  });
}
