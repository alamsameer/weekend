export type ReviewGrade = "again" | "hard" | "good" | "easy";

export type SrsSchedule = {
  grade: ReviewGrade;
  intervalDays: number;
  nextReview: string;
  statusKind: "to_revise" | "done";
  label: string;
};

const GRADE_META: Record<
  ReviewGrade,
  { label: string; short: string; hint: string }
> = {
  again: { label: "Again", short: "Again", hint: "Missed — review tomorrow" },
  hard: { label: "Hard", short: "Hard", hint: "Tough — short interval" },
  good: { label: "Good", short: "Good", hint: "Solid recall" },
  easy: { label: "Easy", short: "Easy", hint: "Too easy — longer gap" },
};

export function gradeMeta(grade: ReviewGrade) {
  return GRADE_META[grade];
}

export function addDaysISO(from: Date | string, days: number): string {
  const d =
    typeof from === "string" ? new Date(from.slice(0, 10) + "T12:00:00") : new Date(from);
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Anki-lite: grow interval from previous Interval (days). */
export function scheduleReview(
  previousIntervalDays: number,
  grade: ReviewGrade,
  fromDate: Date | string = new Date(),
): SrsSchedule {
  const prev = Math.max(0, Math.floor(previousIntervalDays) || 0);
  let intervalDays: number;

  switch (grade) {
    case "again":
      intervalDays = 1;
      break;
    case "hard":
      intervalDays = prev <= 0 ? 2 : Math.max(1, Math.round(prev * 1.2));
      break;
    case "good":
      if (prev <= 0) intervalDays = 1;
      else if (prev === 1) intervalDays = 3;
      else intervalDays = Math.round(prev * 2.5);
      break;
    case "easy":
      intervalDays = prev <= 0 ? 4 : Math.round(prev * 3.5);
      break;
  }

  intervalDays = Math.min(Math.max(intervalDays, 1), 365);
  const statusKind: SrsSchedule["statusKind"] =
    grade === "again" || grade === "hard" ? "to_revise" : "done";

  return {
    grade,
    intervalDays,
    nextReview: addDaysISO(fromDate, intervalDays),
    statusKind,
    label: GRADE_META[grade].label,
  };
}

export function parseIntervalDays(raw: string | null | undefined): number {
  if (!raw) return 0;
  const n = Number(String(raw).trim());
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

export function pickStatusName(
  options: { name: string }[],
  kind: "done" | "to_revise" | "in_progress",
): string {
  const names = options.map((o) => o.name);
  const find = (re: RegExp) => names.find((n) => re.test(n));

  if (kind === "done") {
    return find(/^(done|complete|completed)$/i) ?? "Done";
  }
  if (kind === "in_progress") {
    return find(/progress/i) ?? "In progress";
  }
  return find(/revise/i) ?? find(/to\s*do|learning/i) ?? "To revise";
}

export function previewIntervals(previousIntervalDays: number): Record<
  ReviewGrade,
  number
> {
  return {
    again: scheduleReview(previousIntervalDays, "again").intervalDays,
    hard: scheduleReview(previousIntervalDays, "hard").intervalDays,
    good: scheduleReview(previousIntervalDays, "good").intervalDays,
    easy: scheduleReview(previousIntervalDays, "easy").intervalDays,
  };
}
