import { test } from "node:test";
import assert from "node:assert/strict";

/**
 * These tests run against the real calculation engine compiled by
 * `scripts/test-build.mjs`, so the invariants below cannot drift from the code
 * that ships to users.
 */
import {
  allocateStudyMinutes,
  computeAverage,
  decodeState,
  encodeState,
  entriesForStream,
  getStreamOrThrow,
  parseGrade,
  requiredGrade,
} from "../.test-build/lib/bac.mjs";

const sciences = getStreamOrThrow("sciences-experimentales");
const total = sciences.coefficients.reduce((sum, entry) => sum + entry.coefficient, 0);

test("coefficient table sums to the published totals", () => {
  assert.equal(total, 30);
  assert.equal(getStreamOrThrow("mathematiques").coefficients.reduce((s, e) => s + e.coefficient, 0), 29);
  assert.equal(getStreamOrThrow("technique-mathematique").coefficients.reduce((s, e) => s + e.coefficient, 0), 33);
  assert.equal(getStreamOrThrow("gestion-economie").coefficients.reduce((s, e) => s + e.coefficient, 0), 34);
  assert.equal(getStreamOrThrow("langues-etrangeres").coefficients.reduce((s, e) => s + e.coefficient, 0), 28);
});

test("uniform 10/20 gives exactly 10/20 and passes", () => {
  const grades = Object.fromEntries(sciences.coefficients.map((entry) => [entry.subject, 10]));
  const result = computeAverage(entriesForStream(sciences, grades));
  assert.equal(result.average, 10);
  assert.equal(result.totalCoefficient, 30);
  assert.equal(result.passes, true);
});

test("weighted average matches the official formula", () => {
  const grades = {
    "natural-sciences": 18,
    mathematics: 16,
    physics: 14,
    arabic: 12,
    philosophy: 12,
    french: 12,
    english: 12,
    "history-geography": 12,
    "islamic-studies": 12,
    "physical-education": 12,
  };
  const result = computeAverage(entriesForStream(sciences, grades));
  // 18·6 + 16·5 + 14·5 + 12·3 + 12·2·5 + 12·1 = 426 → 426 / 30 = 14.2
  assert.equal(result.totalPoints, 426);
  assert.equal(result.average, 14.2);
  assert.equal(result.gradedCount, 10);
});

test("missing grades are excluded, not counted as zero", () => {
  const result = computeAverage(entriesForStream(sciences, { "natural-sciences": 15 }));
  assert.equal(result.average, 15);
  assert.equal(result.totalCoefficient, 6);
  assert.equal(result.gradedCount, 1);
  assert.equal(result.totalCount, sciences.coefficients.length);
});

test("no grade at all produces no average", () => {
  const result = computeAverage(entriesForStream(sciences));
  assert.equal(result.average, null);
  assert.equal(result.passes, null);
});

test("required grade solves the linear equation", () => {
  const grades = Object.fromEntries(
    sciences.coefficients.filter((entry) => entry.subject !== "natural-sciences").map((entry) => [entry.subject, 10]),
  );
  const result = requiredGrade(entriesForStream(sciences, grades), "natural-sciences", 12);
  // fixed: coef 24, points 240 → (240 + 6x) / 30 = 12 → x = 20
  assert.equal(result.kind, "possible");
  assert.equal(result.grade, 20);
});

test("an unreachable target is reported as impossible", () => {
  const grades = Object.fromEntries(
    sciences.coefficients.filter((entry) => entry.subject !== "mathematics").map((entry) => [entry.subject, 10]),
  );
  // fixed: coef 25, points 250 → (250 + 5x) / 30 = 19 → x = 64 > 20
  const result = requiredGrade(entriesForStream(sciences, grades), "mathematics", 19);
  assert.equal(result.kind, "impossible");
});

test("grade parsing rejects out-of-range and non-numeric input", () => {
  assert.equal(parseGrade("15,5"), 15.5);
  assert.equal(parseGrade("  "), null);
  assert.equal(parseGrade("21"), "invalid");
  assert.equal(parseGrade("-1"), "invalid");
  assert.equal(parseGrade("abc"), "invalid");
  assert.equal(parseGrade("12.345"), "invalid");
});

test("share links round-trip and stay bounded", () => {
  const encoded = encodeState("sciences-experimentales", { mathematics: 17.5, physics: 9 });
  const decoded = decodeState(encoded);
  assert.equal(decoded.stream, "sciences-experimentales");
  assert.equal(decoded.grades.mathematics, 17.5);
  assert.equal(decodeState("x".repeat(600)), null);
});

test("study allocation respects the weekly total and the minimum slot", () => {
  const allocation = allocateStudyMinutes(
    sciences.coefficients.map((entry) => ({ subject: entry.subject, coefficient: entry.coefficient })),
    600,
  );
  const sum = allocation.reduce((value, entry) => value + entry.minutes, 0);
  assert.ok(Math.abs(sum - 600) <= sciences.coefficients.length, `allocated ${sum} minutes`);
  assert.ok(allocation.every((entry) => entry.minutes >= 20));
});
