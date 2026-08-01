"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { patchReviseItemLocal } from "@/lib/optimistic";
import { buildReviewGradePayload } from "@/lib/review";
import { ReviewGrade } from "@/lib/srs";
import { ReviseItem } from "@/lib/types";
import { DateCell } from "./DateCell";
import { ReviewGradeButtons } from "./ReviewGradeButtons";
import { StatusPill } from "./StatusPill";

function isStillInQueue(item: ReviseItem, today: string): boolean {
  const done = /^(done|complete|completed)$/i.test((item.status ?? "").trim());
  if (done) return false;
  const due = item.nextReview
    ? item.nextReview.slice(0, 10) <= today
    : false;
  const inProgress = /progress/i.test(item.status ?? "");
  const toRevise = /revise/i.test(item.status ?? "");
  return due || inProgress || (toRevise && !item.nextReview);
}

export function ReviseView() {
  const [items, setItems] = useState<ReviseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [includeNotStarted, setIncludeNotStarted] = useState(false);
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = includeNotStarted ? "?includeNotStarted=1" : "";
      const res = await fetch(`/api/revise${qs}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load");
      setItems(json.items ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [includeNotStarted]);

  useEffect(() => {
    void load();
  }, [load]);

  async function patch(
    item: ReviseItem,
    body: Record<string, unknown>,
    local: {
      status?: string | null;
      nextReview?: string | null;
      intervalDays?: number;
    },
  ) {
    setSavingId(item.pageId);
    const prev = items;
    setItems((cur) => {
      const patched = patchReviseItemLocal(cur, item.pageId, local);
      if (includeNotStarted) return patched;
      return patched.filter((i) => isStillInQueue(i, today));
    });
    try {
      const res = await fetch(`/api/pages/${item.pageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, databaseId: item.databaseId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Update failed");
    } catch (err) {
      setItems(prev);
      alert(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSavingId(null);
    }
  }

  function grade(item: ReviseItem, g: ReviewGrade) {
    const { body, local } = buildReviewGradePayload(item, g);
    void patch(item, body, local);
  }

  function reasonLabel(reason: ReviseItem["reason"]) {
    if (reason === "due") return "Due";
    if (reason === "both") return "Due + open";
    return "Not done";
  }

  const focus = items[0] ?? null;

  return (
    <div className="px-5 py-5 md:px-8 md:py-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight md:text-[32px]">
            Spaced review
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            Grade each card — intervals grow with Good / Easy
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label
            className="flex items-center gap-2 text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            <input
              type="checkbox"
              checked={includeNotStarted}
              onChange={(e) => setIncludeNotStarted(e.target.checked)}
            />
            Include not started
          </label>
          <button
            onClick={() => void load()}
            className="rounded-xl border px-3 py-1.5 text-sm"
            style={{
              color: "var(--text-secondary)",
              borderColor: "var(--border)",
            }}
          >
            Refresh
          </button>
        </div>
      </div>

      {loading && items.length === 0 ? (
        <div className="panel space-y-2 p-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-10 animate-pulse rounded-lg"
              style={{ background: "var(--bg-hover)" }}
            />
          ))}
        </div>
      ) : error ? (
        <p style={{ color: "var(--pill-red-text)" }}>{error}</p>
      ) : items.length === 0 ? (
        <div className="panel p-8 text-center">
          <p className="font-medium">Queue clear</p>
          <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
            Nothing due right now. Come back when reviews mature.
            {!includeNotStarted
              ? " Or enable “Include not started” to pull new cards."
              : ""}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {focus ? (
            <div className="panel p-5 md:p-6">
              <div
                className="mb-1 text-xs font-medium uppercase tracking-wide"
                style={{ color: "var(--text-muted)" }}
              >
                Next card · {items.length} in queue
              </div>
              <a
                href={focus.pageUrl}
                target="_blank"
                rel="noreferrer"
                className="text-2xl font-semibold tracking-tight hover:underline md:text-3xl"
              >
                {focus.title}
              </a>
              <div
                className="mt-2 flex flex-wrap gap-3 text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                <Link href={`/db/${focus.databaseId}`} className="hover:underline">
                  {focus.databaseName}
                </Link>
                <span>
                  {focus.intervalDays > 0
                    ? `Interval ${focus.intervalDays}d`
                    : "New card"}
                </span>
                <span>{reasonLabel(focus.reason)}</span>
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <StatusPill
                  value={focus.status ?? ""}
                  color={focus.statusColor}
                  options={focus.statusOptions}
                  disabled={savingId === focus.pageId}
                  onChange={(v) =>
                    void patch(
                      focus,
                      {
                        status: {
                          property: focus.statusProperty,
                          type: focus.statusType,
                          value: v || null,
                        },
                      },
                      { status: v || null },
                    )
                  }
                />
                <DateCell
                  value={focus.nextReview ?? ""}
                  disabled={savingId === focus.pageId}
                  onChange={(v) =>
                    void patch(
                      focus,
                      {
                        date: {
                          property: focus.nextReviewProperty,
                          value: v || null,
                        },
                      },
                      { nextReview: v || null },
                    )
                  }
                />
              </div>
              <div className="mt-4">
                <ReviewGradeButtons
                  intervalDays={focus.intervalDays}
                  disabled={savingId === focus.pageId}
                  onGrade={(g) => grade(focus, g)}
                />
              </div>
            </div>
          ) : null}

          <div className="panel overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {[
                    "Topic",
                    "Database",
                    "Status",
                    "Next review",
                    "Interval",
                    "Grade",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-3 py-2 text-left text-xs font-medium"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const busy = savingId === item.pageId;
                  const options = item.statusOptions?.length
                    ? item.statusOptions
                    : [
                        { name: "To revise", color: "orange" },
                        { name: "In progress", color: "blue" },
                        { name: "Done", color: "green" },
                      ];
                  return (
                    <tr
                      key={item.pageId}
                      style={{ borderBottom: "1px solid var(--border)" }}
                    >
                      <td className="px-3 py-2">
                        <a
                          href={item.pageUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium hover:underline"
                        >
                          {item.title}
                        </a>
                      </td>
                      <td className="px-3 py-2">
                        <Link
                          href={`/db/${item.databaseId}`}
                          className="text-sm hover:underline"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {item.databaseName}
                        </Link>
                      </td>
                      <td className="px-3 py-2">
                        <StatusPill
                          value={item.status ?? ""}
                          color={item.statusColor}
                          options={options}
                          disabled={busy}
                          onChange={(v) =>
                            void patch(
                              item,
                              {
                                status: {
                                  property: item.statusProperty,
                                  type: item.statusType,
                                  value: v || null,
                                },
                              },
                              { status: v || null },
                            )
                          }
                        />
                      </td>
                      <td className="px-3 py-2">
                        <DateCell
                          value={item.nextReview ?? ""}
                          disabled={busy}
                          onChange={(v) =>
                            void patch(
                              item,
                              {
                                date: {
                                  property: item.nextReviewProperty,
                                  value: v || null,
                                },
                              },
                              { nextReview: v || null },
                            )
                          }
                        />
                      </td>
                      <td
                        className="px-3 py-2 text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {item.intervalDays > 0 ? `${item.intervalDays}d` : "—"}
                      </td>
                      <td className="px-3 py-2">
                        <ReviewGradeButtons
                          compact
                          intervalDays={item.intervalDays}
                          disabled={busy}
                          onGrade={(g) => grade(item, g)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
