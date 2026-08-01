"use client";

import Link from "next/link";
import { ReviewGrade } from "@/lib/srs";
import { TodayFocus, TodayFocusItem } from "@/lib/types";
import { DateCell } from "./DateCell";
import { ReviewGradeButtons } from "./ReviewGradeButtons";
import { StatusPill } from "./StatusPill";

export function TodayFocusPanel({
  today,
  databaseId,
  savingId,
  onStatusChange,
  onDateChange,
  onReviewGrade,
}: {
  today: TodayFocus;
  databaseId?: string | null;
  savingId?: string | null;
  onStatusChange: (item: TodayFocusItem, value: string) => void;
  onDateChange: (item: TodayFocusItem, value: string) => void;
  onReviewGrade: (item: TodayFocusItem, grade: ReviewGrade) => void;
}) {
  const inProgress = databaseId
    ? today.inProgress.filter((i) => i.databaseId === databaseId)
    : today.inProgress;
  const reviseToday = databaseId
    ? today.reviseToday.filter((i) => i.databaseId === databaseId)
    : today.reviseToday;

  const inProgressIds = new Set(inProgress.map((i) => i.pageId));
  const reviseOnly = reviseToday.filter((i) => !inProgressIds.has(i.pageId));

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-2 px-1">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Today</h2>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {today.date} · spaced review — Again / Hard / Good / Easy
          </p>
        </div>
        <div className="flex gap-2 text-xs">
          <span
            className="rounded-full px-2.5 py-1"
            style={{
              background: "var(--pill-blue-bg)",
              color: "var(--pill-blue-text)",
            }}
          >
            {inProgress.length} in progress
          </span>
          <span
            className="rounded-full px-2.5 py-1"
            style={{
              background: "var(--pill-orange-bg)",
              color: "var(--pill-orange-text)",
            }}
          >
            {reviseOnly.length} due today
          </span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <TodayList
          title="In progress"
          empty="Nothing in progress right now."
          accent="var(--pill-blue-text)"
          items={inProgress}
          savingId={savingId}
          onStatusChange={onStatusChange}
          onDateChange={onDateChange}
          onReviewGrade={onReviewGrade}
        />
        <TodayList
          title="Due today"
          empty="No reviews scheduled for today (or overdue)."
          accent="var(--pill-orange-text)"
          items={reviseOnly}
          savingId={savingId}
          showOverdue
          onStatusChange={onStatusChange}
          onDateChange={onDateChange}
          onReviewGrade={onReviewGrade}
        />
      </div>
    </section>
  );
}

function TodayList({
  title,
  empty,
  accent,
  items,
  savingId,
  showOverdue,
  onStatusChange,
  onDateChange,
  onReviewGrade,
}: {
  title: string;
  empty: string;
  accent: string;
  items: TodayFocusItem[];
  savingId?: string | null;
  showOverdue?: boolean;
  onStatusChange: (item: TodayFocusItem, value: string) => void;
  onDateChange: (item: TodayFocusItem, value: string) => void;
  onReviewGrade: (item: TodayFocusItem, grade: ReviewGrade) => void;
}) {
  return (
    <div className="panel overflow-hidden">
      <div
        className="flex items-center justify-between border-b px-4 py-3"
        style={{ borderColor: "var(--border)" }}
      >
        <h3 className="text-sm font-medium" style={{ color: accent }}>
          {title}
        </h3>
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          {items.length}
        </span>
      </div>

      {items.length === 0 ? (
        <p className="p-5 text-sm" style={{ color: "var(--text-muted)" }}>
          {empty}
        </p>
      ) : (
        <ul className="divide-y" style={{ borderColor: "var(--border)" }}>
          {items.map((item) => {
            const busy = savingId === item.pageId;
            return (
              <li
                key={item.pageId}
                className="flex flex-col gap-2.5 px-4 py-3"
                style={{ borderColor: "var(--border)" }}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <a
                      href={item.pageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium hover:underline"
                    >
                      {item.title}
                    </a>
                    <div
                      className="mt-0.5 flex flex-wrap items-center gap-2 text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      <Link
                        href={`/db/${item.databaseId}`}
                        className="hover:underline"
                      >
                        {item.databaseName}
                      </Link>
                      {item.intervalDays > 0 ? (
                        <span>interval {item.intervalDays}d</span>
                      ) : (
                        <span>new card</span>
                      )}
                      {showOverdue && item.overdue ? (
                        <span style={{ color: "var(--pill-red-text)" }}>
                          Overdue
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusPill
                      value={item.status ?? ""}
                      color={item.statusColor}
                      options={item.statusOptions}
                      disabled={busy}
                      onChange={(v) => onStatusChange(item, v)}
                    />
                    <DateCell
                      value={item.nextReview ?? ""}
                      disabled={busy}
                      onChange={(v) => onDateChange(item, v)}
                    />
                  </div>
                </div>
                <ReviewGradeButtons
                  intervalDays={item.intervalDays}
                  disabled={busy}
                  onGrade={(grade) => onReviewGrade(item, grade)}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
