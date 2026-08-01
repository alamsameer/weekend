"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { patchRowLocal, patchTodayFocusLocal } from "@/lib/optimistic";
import { buildReviewGradePayload } from "@/lib/review";
import { computeTrackerStats, mergeLabelCounts } from "@/lib/stats";
import { ReviewGrade } from "@/lib/srs";
import {
  DatabaseDetail,
  TodayFocus,
  TodayFocusItem,
  TrackerStats,
} from "@/lib/types";
import { BulkResetBar } from "./BulkResetBar";
import { DashboardHero } from "./DashboardHero";
import { NotionTable } from "./NotionTable";
import { TodayFocusPanel } from "./TodayFocusPanel";

type Overview = {
  combined: TrackerStats;
  databases: TrackerStats[];
  today: TodayFocus;
};

function recomputeOverview(
  databases: TrackerStats[],
  today: TodayFocus,
): Overview {
  const combined: TrackerStats = {
    id: "combined",
    name: "Combined",
    icon: null,
    total: databases.reduce((s, d) => s + d.total, 0),
    done: databases.reduce((s, d) => s + d.done, 0),
    inProgress: databases.reduce((s, d) => s + d.inProgress, 0),
    toRevise: databases.reduce((s, d) => s + d.toRevise, 0),
    byTopic: mergeLabelCounts(databases.map((d) => d.byTopic)),
    byDifficulty: mergeLabelCounts(databases.map((d) => d.byDifficulty)),
    byStatus: mergeLabelCounts(databases.map((d) => d.byStatus)),
    byDatabase: databases.map((d) => ({
      label: d.name,
      value: d.total,
    })),
  };
  return { combined, databases, today };
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div
        className="flex gap-1 overflow-x-auto rounded-xl border p-1"
        style={{ borderColor: "var(--border)" }}
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-8 w-24 shrink-0 animate-pulse rounded-lg"
            style={{ background: "var(--bg-hover)" }}
          />
        ))}
      </div>
      <div className="panel flex flex-col items-center gap-4 p-8 md:flex-row md:items-start">
        <div
          className="h-48 w-48 shrink-0 animate-pulse rounded-full"
          style={{ background: "var(--bg-hover)" }}
        />
        <div className="flex w-full flex-1 flex-col gap-3">
          <div
            className="h-6 w-40 animate-pulse rounded"
            style={{ background: "var(--bg-hover)" }}
          />
          <div
            className="h-4 w-64 animate-pulse rounded"
            style={{ background: "var(--bg-hover)" }}
          />
          <div className="mt-2 grid grid-cols-3 gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-xl"
                style={{ background: "var(--bg-hover)" }}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="panel space-y-2 p-4">
            <div
              className="h-5 w-28 animate-pulse rounded"
              style={{ background: "var(--bg-hover)" }}
            />
            {Array.from({ length: 4 }).map((_, j) => (
              <div
                key={j}
                className="h-10 animate-pulse rounded-lg"
                style={{ background: "var(--bg-hover)" }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function DatabaseList() {
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scope, setScope] = useState<string>("combined");

  const [detail, setDetail] = useState<DatabaseDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  async function loadOverview() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/overview");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load");
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  const loadDetail = useCallback(async (databaseId: string) => {
    setDetailLoading(true);
    setDetailError(null);
    try {
      const res = await fetch(`/api/databases/${databaseId}?all=1`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load database");
      setDetail(json);
    } catch (err) {
      setDetail(null);
      setDetailError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOverview();
  }, []);

  useEffect(() => {
    if (scope === "combined") {
      setDetail(null);
      setDetailError(null);
      return;
    }
    void loadDetail(scope);
  }, [scope, loadDetail]);

  const activeStats = useMemo(() => {
    if (!data) return null;
    if (scope === "combined") return data.combined;
    if (detail && detail.id === scope) return computeTrackerStats(detail);
    return data.databases.find((d) => d.id === scope) ?? data.combined;
  }, [data, scope, detail]);

  const planHref =
    scope === "combined" ? "/plan" : `/plan?db=${encodeURIComponent(scope)}`;

  async function refreshAll() {
    await loadOverview();
    if (scope !== "combined") await loadDetail(scope);
  }

  async function patchPage(
    pageId: string,
    databaseId: string,
    body: Record<string, unknown>,
    local: {
      status?: { property: string; value: string | null };
      date?: { property: string; value: string | null };
      number?: { property: string; value: number | null };
    },
    todayLocal?: {
      status?: string | null;
      nextReview?: string | null;
      intervalDays?: number;
    },
  ) {
    setSavingId(pageId);
    const prevData = data;
    const prevDetail = detail;

    const rowLocal = {
      status: local.status,
      date: local.date,
      ...(local.number
        ? {
            // reuse text-like patch via status/date only; interval stored as number cell text
          }
        : {}),
    };

    if (detail && detail.id === databaseId) {
      let rows = patchRowLocal(detail.rows, pageId, rowLocal, detail.columns);
      if (local.number) {
        rows = rows.map((row) => {
          if (row.id !== pageId) return row;
          const prev = row.properties[local.number!.property];
          return {
            ...row,
            properties: {
              ...row.properties,
              [local.number!.property]: {
                type: "number" as const,
                text:
                  local.number!.value === null
                    ? ""
                    : String(local.number!.value),
                raw: local.number!.value,
                color: prev?.color ?? null,
              },
            },
          };
        });
      }
      setDetail({ ...detail, rows });
    }

    if (data) {
      const today = patchTodayFocusLocal(data.today, pageId, {
        status: todayLocal?.status ?? local.status?.value,
        nextReview: todayLocal?.nextReview ?? local.date?.value,
        intervalDays: todayLocal?.intervalDays,
      });
      let databases = data.databases;
      if (detail && detail.id === databaseId) {
        let rows = patchRowLocal(detail.rows, pageId, rowLocal, detail.columns);
        if (local.number) {
          rows = rows.map((row) => {
            if (row.id !== pageId) return row;
            const prev = row.properties[local.number!.property];
            return {
              ...row,
              properties: {
                ...row.properties,
                [local.number!.property]: {
                  type: "number" as const,
                  text:
                    local.number!.value === null
                      ? ""
                      : String(local.number!.value),
                  raw: local.number!.value,
                  color: prev?.color ?? null,
                },
              },
            };
          });
        }
        const nextStats = computeTrackerStats({ ...detail, rows });
        databases = data.databases.map((d) =>
          d.id === databaseId ? nextStats : d,
        );
      }
      setData(recomputeOverview(databases, today));
    }

    try {
      const res = await fetch(`/api/pages/${pageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, databaseId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Update failed");
    } catch (err) {
      setData(prevData);
      setDetail(prevDetail);
      alert(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSavingId(null);
    }
  }

  function patchTodayItem(
    item: TodayFocusItem,
    body: Record<string, unknown>,
    local: {
      status?: { property: string; value: string | null };
      date?: { property: string; value: string | null };
      number?: { property: string; value: number | null };
    },
    todayLocal?: {
      status?: string | null;
      nextReview?: string | null;
      intervalDays?: number;
    },
  ) {
    void patchPage(item.pageId, item.databaseId, body, local, todayLocal);
  }

  function gradeTodayItem(item: TodayFocusItem, grade: ReviewGrade) {
    const { body, local } = buildReviewGradePayload(item, grade);
    patchTodayItem(
      item,
      body,
      {
        status: {
          property: item.statusProperty,
          value: local.status,
        },
        date: {
          property: item.nextReviewProperty,
          value: local.nextReview,
        },
        ...(item.intervalProperty
          ? {
              number: {
                property: item.intervalProperty,
                value: local.intervalDays,
              },
            }
          : {}),
      },
      local,
    );
  }

  return (
    <div className="px-5 py-5 md:px-8 md:py-7">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight md:text-[32px]">
            Dashboard
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            Today’s focus on Combined · pick a database for full fields
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={planHref}
            className="rounded-xl px-3 py-1.5 text-sm font-medium text-white"
            style={{ background: "var(--accent)" }}
          >
            Week plan
          </Link>
          <Link
            href="/revise"
            className="rounded-xl border px-3 py-1.5 text-sm"
            style={{
              color: "var(--text-secondary)",
              borderColor: "var(--border)",
            }}
          >
            Review
          </Link>
          <button
            onClick={() => void refreshAll()}
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

      {loading && !data ? (
        <DashboardSkeleton />
      ) : error && !data ? (
        <div className="panel p-6">
          <p style={{ color: "var(--pill-red-text)" }}>{error}</p>
        </div>
      ) : data && activeStats ? (
        <div className="flex flex-col gap-4">
          <div
            className="flex gap-1 overflow-x-auto rounded-xl border p-1"
            style={{ borderColor: "var(--border)" }}
          >
            <ScopeChip
              active={scope === "combined"}
              onClick={() => setScope("combined")}
              label="Combined"
            />
            {data.databases.map((db) => (
              <ScopeChip
                key={db.id}
                active={scope === db.id}
                onClick={() => setScope(db.id)}
                label={`${db.icon ? db.icon + " " : ""}${db.name.trim()}`}
              />
            ))}
          </div>

          <DashboardHero
            key={scope}
            stats={activeStats}
            eyebrow={scope === "combined" ? "All databases" : "Database"}
            subtitle={
              scope === "combined"
                ? `${data.databases.length} trackers · ${activeStats.total} rows`
                : `${activeStats.done}/${activeStats.total} complete`
            }
            defaultMode={
              scope === "combined"
                ? activeStats.byDatabase?.length
                  ? "database"
                  : "status"
                : activeStats.byTopic.length
                  ? "topic"
                  : "status"
            }
            chartModes={
              scope === "combined"
                ? ([
                    activeStats.byDatabase?.length ? "database" : null,
                    activeStats.byTopic.length ? "topic" : null,
                    "status",
                    activeStats.byDifficulty.length ? "difficulty" : null,
                  ].filter(Boolean) as (
                    | "topic"
                    | "status"
                    | "database"
                    | "difficulty"
                  )[])
                : ([
                    activeStats.byTopic.length ? "topic" : null,
                    "status",
                    activeStats.byDifficulty.length ? "difficulty" : null,
                  ].filter(Boolean) as ("topic" | "status" | "difficulty")[])
            }
          />

          {scope === "combined" && data.today ? (
            <TodayFocusPanel
              today={data.today}
              savingId={savingId}
              onStatusChange={(item, value) =>
                patchTodayItem(
                  item,
                  {
                    status: {
                      property: item.statusProperty,
                      type: item.statusType,
                      value: value || null,
                    },
                  },
                  {
                    status: {
                      property: item.statusProperty,
                      value: value || null,
                    },
                  },
                )
              }
              onDateChange={(item, value) =>
                patchTodayItem(
                  item,
                  {
                    date: {
                      property: item.nextReviewProperty,
                      value: value || null,
                    },
                  },
                  {
                    date: {
                      property: item.nextReviewProperty,
                      value: value || null,
                    },
                  },
                )
              }
              onReviewGrade={(item, grade) => gradeTodayItem(item, grade)}
            />
          ) : null}

          {scope !== "combined" ? (
            <>
              {data.today ? (
                <TodayFocusPanel
                  today={data.today}
                  databaseId={scope}
                  savingId={savingId}
                  onStatusChange={(item, value) =>
                    patchTodayItem(
                      item,
                      {
                        status: {
                          property: item.statusProperty,
                          type: item.statusType,
                          value: value || null,
                        },
                      },
                      {
                        status: {
                          property: item.statusProperty,
                          value: value || null,
                        },
                      },
                    )
                  }
                  onDateChange={(item, value) =>
                    patchTodayItem(
                      item,
                      {
                        date: {
                          property: item.nextReviewProperty,
                          value: value || null,
                        },
                      },
                      {
                        date: {
                          property: item.nextReviewProperty,
                          value: value || null,
                        },
                      },
                    )
                  }
                  onReviewGrade={(item, grade) => gradeTodayItem(item, grade)}
                />
              ) : null}

              {detail ? (
                <BulkResetBar
                  databaseId={scope}
                  rowCount={detail.rows.length}
                  statusProperty={detail.statusProperty}
                  nextReviewProperty={detail.nextReviewProperty}
                  columns={detail.columns}
                  onDone={async () => {
                    await loadDetail(scope);
                    await loadOverview();
                  }}
                />
              ) : null}

              <section className="panel overflow-hidden">
                <div
                  className="flex items-center justify-between border-b px-4 py-3"
                  style={{ borderColor: "var(--border)" }}
                >
                  <h2 className="text-sm font-medium">
                    {detail?.name ?? activeStats.name} · all fields
                  </h2>
                  <span
                    className="text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {detailLoading
                      ? "Loading…"
                      : detail
                        ? `${detail.rows.length} rows · ${detail.columns.length} columns`
                        : ""}
                  </span>
                </div>

                {detailLoading && !detail ? (
                  <div className="space-y-2 p-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-9 animate-pulse rounded-lg"
                        style={{ background: "var(--bg-hover)" }}
                      />
                    ))}
                  </div>
                ) : detailError ? (
                  <p
                    className="p-6 text-sm"
                    style={{ color: "var(--pill-red-text)" }}
                  >
                    {detailError}
                  </p>
                ) : detail ? (
                  <NotionTable
                    columns={detail.columns}
                    rows={detail.rows}
                    statusProperty={detail.statusProperty}
                    nextReviewProperty={detail.nextReviewProperty}
                    savingId={savingId}
                    onStatusChange={(pageId, property, type, value) =>
                      void patchPage(
                        pageId,
                        scope,
                        {
                          status: { property, type, value: value || null },
                        },
                        { status: { property, value: value || null } },
                      )
                    }
                    onDateChange={(pageId, property, value) =>
                      void patchPage(
                        pageId,
                        scope,
                        {
                          date: { property, value: value || null },
                        },
                        { date: { property, value: value || null } },
                      )
                    }
                  />
                ) : null}
              </section>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function ScopeChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap"
      style={{
        background: active ? "var(--bg-hover)" : "transparent",
        color: active ? "var(--text)" : "var(--text-muted)",
        border: active
          ? "1px solid var(--border-strong)"
          : "1px solid transparent",
      }}
      title={label}
    >
      {label.length > 28 ? `${label.slice(0, 26)}…` : label}
    </button>
  );
}
