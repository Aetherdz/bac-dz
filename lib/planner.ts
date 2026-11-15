import { allocateStudyMinutes } from "./bac";

export type Session = { subject: string; minutes: number };
export type PlanBlock = {
  id: string;
  week: number;
  day: number;
  subject: string;
  minutes: number;
  done: boolean;
};

/**
 * Deterministic weekly plan builder:
 * 1. allocate weekly minutes by coefficient (with a floor per subject);
 * 2. split each subject into sessions of at most 75 minutes;
 * 3. deal sessions round-robin across the available days;
 * 4. order each day by descending session length.
 */
export function buildWeekPlan(
  coefficients: { subject: string; coefficient: number }[],
  weeklyMinutes: number,
  days: number,
): Session[][] {
  const allocation = allocateStudyMinutes(coefficients, weeklyMinutes);
  const sessions: Session[] = [];

  for (const row of allocation) {
    const count = Math.max(1, Math.ceil(row.minutes / 75));
    const base = Math.floor(row.minutes / count);
    let remainder = row.minutes - base * count;
    for (let i = 0; i < count; i++) {
      const minutes = base + (remainder > 0 ? 1 : 0);
      if (remainder > 0) remainder--;
      if (minutes > 0) sessions.push({ subject: row.subject, minutes });
    }
  }

  sessions.sort((a, b) => b.minutes - a.minutes);

  const grid: Session[][] = Array.from({ length: days }, () => []);
  sessions.forEach((session, index) => {
    grid[index % days].push(session);
  });

  return grid.map((day) => day.sort((a, b) => b.minutes - a.minutes));
}

export function buildMultiWeekPlan(
  coefficients: { subject: string; coefficient: number }[],
  weeklyMinutes: number,
  days: number,
  weeks: number,
): PlanBlock[] {
  const blocks: PlanBlock[] = [];
  for (let week = 0; week < weeks; week++) {
    // Rotate the coefficient order each week so the same subject does not
    // always occupy the same slot.
    const rotated = [...coefficients.slice(week % Math.max(1, coefficients.length)), ...coefficients.slice(0, week % Math.max(1, coefficients.length))];
    const grid = buildWeekPlan(rotated, weeklyMinutes, days);
    grid.forEach((sessions, day) => {
      sessions.forEach((session, index) => {
        blocks.push({
          id: `w${week}-d${day}-${index}-${session.subject}`,
          week,
          day,
          subject: session.subject,
          minutes: session.minutes,
          done: false,
        });
      });
    });
  }
  return blocks;
}

function icsDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}00`;
}

function icsEscape(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

/** Export study blocks as a valid iCalendar feed (floating local times). */
export function plannerToIcs(opts: {
  blocks: PlanBlock[];
  startDate: Date;
  subjectLabel: (subject: string) => string;
  summaryPrefix: string;
}): string {
  const start = new Date(opts.startDate);
  start.setHours(0, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  const stamp = `${start.getFullYear()}${pad(start.getMonth() + 1)}${pad(start.getDate())}T000000Z`;

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//BAC DZ//Study Planner//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:BAC DZ",
  ];

  opts.blocks.forEach((block, index) => {
    const eventDate = new Date(start);
    eventDate.setDate(start.getDate() + block.week * 7 + block.day);
    eventDate.setHours(17, 0, 0, 0);
    lines.push(
      "BEGIN:VEVENT",
      `UID:bacdz-${block.week}-${block.day}-${index}@bacdz`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${icsDate(eventDate)}`,
      `DURATION:PT${block.minutes}M`,
      `SUMMARY:${icsEscape(`${opts.summaryPrefix}: ${opts.subjectLabel(block.subject)}`)}`,
      "END:VEVENT",
    );
  });

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

export function downloadText(filename: string, content: string, mime = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
