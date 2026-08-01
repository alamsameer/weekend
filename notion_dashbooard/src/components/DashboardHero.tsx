"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { TrackerStats } from "@/lib/types";
import { DONUT_COLORS, DonutChart } from "./DonutChart";

export type ChartMode = "topic" | "status" | "database" | "difficulty";

function availableModes(
  stats: TrackerStats,
  chartModes?: ChartMode[],
): ChartMode[] {
  if (chartModes?.length) return chartModes;
  return [
    stats.byTopic.length ? ("topic" as const) : null,
    "status" as const,
    stats.byDatabase?.length ? ("database" as const) : null,
    stats.byDifficulty.length ? ("difficulty" as const) : null,
  ].filter(Boolean) as ChartMode[];
}

function pickDefault(
  stats: TrackerStats,
  modes: ChartMode[],
  preferred?: ChartMode,
): ChartMode {
  if (preferred && modes.includes(preferred)) return preferred;
  if (modes.includes("topic") && stats.byTopic.length) return "topic";
  if (modes.includes("status")) return "status";
  return modes[0] ?? "status";
}

function slicesFor(stats: TrackerStats, chartMode: ChartMode) {
  const source =
    chartMode === "topic"
      ? stats.byTopic
      : chartMode === "database"
        ? (stats.byDatabase ?? [])
        : chartMode === "difficulty"
          ? stats.byDifficulty
          : stats.byStatus;
  return source.slice(0, 14).map((s, i) => ({
    label: s.label,
    value: s.value,
    color: DONUT_COLORS[i % DONUT_COLORS.length],
  }));
}

export function DashboardHero({
  stats,
  eyebrow,
  title,
  subtitle,
  href,
  chartModes,
  defaultMode = "status",
}: {
  stats: TrackerStats;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  href?: string;
  chartModes?: ChartMode[];
  defaultMode?: ChartMode;
}) {
  const modes = availableModes(stats, chartModes);
  const [chartMode, setChartMode] = useState<ChartMode>(() =>
    pickDefault(stats, modes, defaultMode),
  );

  // Reset mode when switching Combined <-> a specific database
  useEffect(() => {
    const nextModes = availableModes(stats, chartModes);
    setChartMode(pickDefault(stats, nextModes, defaultMode));
  }, [stats.id, defaultMode, chartModes, stats]);

  const slices = useMemo(
    () => slicesFor(stats, chartMode),
    [stats, chartMode],
  );

  const pctDone = Math.round((stats.done / Math.max(stats.total, 1)) * 100);

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(280px,1fr)_1.4fr]">
      <section className="panel flex items-center justify-center p-5 md:p-6">
        {slices.length > 0 ? (
          <div className="w-full">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2
                className="text-sm font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                {chartMode === "topic"
                  ? "By topic"
                  : chartMode === "database"
                    ? "By database"
                    : chartMode === "difficulty"
                      ? "By difficulty"
                      : "By status"}
              </h2>
              <div
                className="flex flex-wrap rounded-lg border p-0.5 text-xs"
                style={{ borderColor: "var(--border)" }}
              >
                {modes.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setChartMode(m)}
                    className="rounded-md px-2.5 py-1 capitalize"
                    style={{
                      background:
                        chartMode === m ? "var(--bg-hover)" : "transparent",
                      color:
                        chartMode === m ? "var(--text)" : "var(--text-muted)",
                    }}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <DonutChart
              slices={slices}
              size={210}
              thickness={32}
              centerLabel={`${pctDone}%`}
              centerSub="done"
            />
          </div>
        ) : (
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            No chart data yet
          </p>
        )}
      </section>

      <section className="panel flex flex-col justify-between gap-5 p-5 md:p-6">
        <div>
          {eyebrow ? (
            <p
              className="text-xs uppercase tracking-[0.14em]"
              style={{ color: "var(--text-muted)" }}
            >
              {eyebrow}
            </p>
          ) : null}
          <h2 className="mt-1 text-xl font-semibold tracking-tight">
            {stats.icon ? <span className="mr-2">{stats.icon}</span> : null}
            {title ?? stats.name}
          </h2>
          {subtitle ? (
            <p
              className="mt-1 text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              {subtitle}
            </p>
          ) : null}
          {href ? (
            <Link
              href={href}
              className="mt-1 inline-block text-sm hover:underline"
              style={{ color: "var(--accent)" }}
            >
              Open table →
            </Link>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Total", value: stats.total, color: "var(--text)" },
            {
              label: "Done",
              value: stats.done,
              color: "var(--pill-green-text)",
            },
            {
              label: "In progress",
              value: stats.inProgress,
              color: "var(--pill-blue-text)",
            },
            {
              label: "To revise",
              value: stats.toRevise,
              color: "var(--pill-orange-text)",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border px-3 py-3"
              style={{ borderColor: "var(--border)" }}
            >
              <div
                className="text-[11px] uppercase tracking-wide"
                style={{ color: "var(--text-muted)" }}
              >
                {stat.label}
              </div>
              <div
                className="mt-1 text-2xl font-semibold tabular-nums"
                style={{ color: stat.color }}
              >
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {stats.byDifficulty.length ? (
          <div className="flex flex-wrap gap-2">
            {stats.byDifficulty.map((d, i) => (
              <span
                key={d.label}
                className="rounded-full px-3 py-1 text-xs font-medium"
                style={{
                  background: "var(--bg-hover)",
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border)",
                  boxShadow: `inset 3px 0 0 ${DONUT_COLORS[i % DONUT_COLORS.length]}`,
                }}
              >
                {d.label}: {d.value}
              </span>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
