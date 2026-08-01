"use client";

import { previewIntervals, ReviewGrade } from "@/lib/srs";

const GRADES: {
  grade: ReviewGrade;
  style: { bg: string; text: string };
}[] = [
  {
    grade: "again",
    style: { bg: "var(--pill-red-bg)", text: "var(--pill-red-text)" },
  },
  {
    grade: "hard",
    style: { bg: "var(--pill-orange-bg)", text: "var(--pill-orange-text)" },
  },
  {
    grade: "good",
    style: { bg: "var(--pill-green-bg)", text: "var(--pill-green-text)" },
  },
  {
    grade: "easy",
    style: { bg: "var(--pill-blue-bg)", text: "var(--pill-blue-text)" },
  },
];

const LABELS: Record<ReviewGrade, string> = {
  again: "Again",
  hard: "Hard",
  good: "Good",
  easy: "Easy",
};

export function ReviewGradeButtons({
  intervalDays,
  disabled,
  onGrade,
  compact,
}: {
  intervalDays: number;
  disabled?: boolean;
  onGrade: (grade: ReviewGrade) => void;
  compact?: boolean;
}) {
  const preview = previewIntervals(intervalDays);

  return (
    <div className={`flex flex-wrap ${compact ? "gap-1" : "gap-1.5"}`}>
      {GRADES.map(({ grade, style }) => (
        <button
          key={grade}
          type="button"
          disabled={disabled}
          title={`Next review in ${preview[grade]}d`}
          onClick={() => onGrade(grade)}
          className={`rounded-lg font-medium disabled:opacity-50 ${
            compact ? "px-2 py-1 text-[11px]" : "px-2.5 py-1 text-xs"
          }`}
          style={{ background: style.bg, color: style.text }}
        >
          {LABELS[grade]}
          <span className="ml-1 opacity-70">{preview[grade]}d</span>
        </button>
      ))}
    </div>
  );
}
