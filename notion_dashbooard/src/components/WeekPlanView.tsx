"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { readNdjsonProgress } from "@/lib/ndjson";

type PlanItem = {
  pageId: string;
  title: string;
  databaseId: string;
  databaseName: string;
  pageUrl: string;
  status: string | null;
};

type PlanDay = {
  date: string;
  weekday: string;
  items: PlanItem[];
};

type WeekPlan = {
  startDate: string;
  endDate: string;
  scope: string;
  perDay: number;
  totalItems: number;
  days: PlanDay[];
};

type DbOption = { id: string; name: string; icon: string | null };

function mondayISO(from = new Date()) {
  const d = new Date(from);
  d.setHours(12, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

function WeekPlanInner() {
  const searchParams = useSearchParams();
  const initialDb = searchParams.get("db") || "";

  const [databases, setDatabases] = useState<DbOption[]>([]);
  const [databaseId, setDatabaseId] = useState(initialDb);
  const [perDay, setPerDay] = useState(5);
  const [startDate, setStartDate] = useState(mondayISO());
  const [includeNotStarted, setIncludeNotStarted] = useState(false);
  const [plan, setPlan] = useState<WeekPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [progress, setProgress] = useState<{ updated: number; total: number } | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/databases")
      .then((r) => r.json())
      .then((j) => {
        if (j.databases) {
          setDatabases(
            j.databases.map(
              (d: { id: string; name: string; icon: string | null }) => ({
                id: d.id,
                name: d.name,
                icon: d.icon,
              }),
            ),
          );
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setDatabaseId(initialDb);
  }, [initialDb]);

  const generate = useCallback(async () => {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/week-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          databaseId: databaseId || null,
          perDay,
          startDate,
          includeNotStarted,
          apply: false,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      setPlan(json.plan);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }, [databaseId, perDay, startDate, includeNotStarted]);

  const applyDates = useCallback(async () => {
    if (!plan || plan.totalItems === 0) return;
    setApplying(true);
    setError(null);
    setMessage(null);
    setProgress({ updated: 0, total: plan.totalItems });
    try {
      const res = await fetch("/api/week-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apply: true, plan }),
      });
      const last = await readNdjsonProgress(res, (ev) => {
        if (ev.type === "start" || ev.type === "progress" || ev.type === "done") {
          setProgress({ updated: "updated" in ev ? ev.updated : 0, total: ev.total });
        }
      });
      const updated = last.type === "done" ? last.updated : 0;
      setMessage(`Applied Next review dates to ${updated} items in Notion.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setApplying(false);
      setProgress(null);
    }
  }, [plan]);

  const pct =
    progress && progress.total > 0
      ? Math.round((progress.updated / progress.total) * 100)
      : 0;

  return (
    <div className="px-5 py-5 md:px-8 md:py-7">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm">
            <Link
              href="/"
              className="hover:underline"
              style={{ color: "var(--text-muted)" }}
            >
              Dashboard
            </Link>
            <span style={{ color: "var(--text-muted)" }}>/</span>
            <span style={{ color: "var(--text-secondary)" }}>Week plan</span>
          </div>
          <h1 className="text-[28px] font-semibold tracking-tight md:text-[32px]">
            Week plan
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            Schedules due / in-progress / to-revise items by default
          </p>
        </div>
      </div>

      <section className="panel mb-4 p-4 md:p-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block text-xs" style={{ color: "var(--text-muted)" }}>
            Scope
            <select
              value={databaseId}
              onChange={(e) => setDatabaseId(e.target.value)}
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none"
              style={{
                background: "var(--bg)",
                borderColor: "var(--border)",
                color: "var(--text)",
              }}
            >
              <option value="">Combined (all databases)</option>
              {databases.map((d) => (
                <option key={d.id} value={d.id}>
                  {(d.icon ? d.icon + " " : "") + d.name.trim()}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-xs" style={{ color: "var(--text-muted)" }}>
            Items per day
            <input
              type="number"
              min={1}
              max={30}
              value={perDay}
              onChange={(e) => setPerDay(Number(e.target.value) || 5)}
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none"
              style={{
                background: "var(--bg)",
                borderColor: "var(--border)",
                color: "var(--text)",
              }}
            />
          </label>

          <label className="block text-xs" style={{ color: "var(--text-muted)" }}>
            Week start (Monday)
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none"
              style={{
                background: "var(--bg)",
                borderColor: "var(--border)",
                color: "var(--text)",
                colorScheme: "dark",
              }}
            />
          </label>

          <div className="flex items-end gap-2">
            <button
              type="button"
              disabled={loading || applying}
              onClick={() => void generate()}
              className="flex-1 rounded-xl px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
              style={{ background: "var(--accent)" }}
            >
              {loading ? "Building…" : "Create plan"}
            </button>
          </div>
        </div>

        <label
          className="mt-3 flex items-center gap-2 text-sm"
          style={{ color: "var(--text-secondary)" }}
        >
          <input
            type="checkbox"
            checked={includeNotStarted}
            disabled={loading || applying}
            onChange={(e) => setIncludeNotStarted(e.target.checked)}
          />
          Include not started (larger pool)
        </label>

        {error ? (
          <p className="mt-3 text-sm" style={{ color: "var(--pill-red-text)" }}>
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="mt-3 text-sm" style={{ color: "var(--pill-green-text)" }}>
            {message}
          </p>
        ) : null}
      </section>

      {plan ? (
        <>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {plan.startDate} → {plan.endDate} · {plan.totalItems} items ·{" "}
              {plan.perDay}/day
            </p>
            <button
              type="button"
              disabled={applying || plan.totalItems === 0}
              onClick={() => void applyDates()}
              className="rounded-xl border px-3 py-1.5 text-sm font-medium disabled:opacity-50"
              style={{
                borderColor: "var(--border-strong)",
                color: "var(--text)",
                background: "var(--bg-hover)",
              }}
            >
              {applying && progress
                ? `Applying ${progress.updated}/${progress.total}…`
                : "Apply Next review dates"}
            </button>
          </div>

          {applying && progress ? (
            <div className="panel mb-3 p-3">
              <div className="mb-1 flex justify-between text-xs" style={{ color: "var(--text-secondary)" }}>
                <span>Writing dates to Notion</span>
                <span>
                  {progress.updated}/{progress.total} ({pct}%)
                </span>
              </div>
              <div
                className="h-2 overflow-hidden rounded-full"
                style={{ background: "var(--bg-hover)" }}
              >
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${pct}%`, background: "var(--accent)" }}
                />
              </div>
            </div>
          ) : null}

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {plan.days.map((day) => (
              <div key={day.date} className="panel p-4">
                <div className="mb-3 flex items-baseline justify-between gap-2">
                  <div>
                    <div className="text-sm font-semibold">{day.weekday}</div>
                    <div
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {day.date}
                    </div>
                  </div>
                  <span
                    className="rounded-full px-2 py-0.5 text-xs"
                    style={{
                      background: "var(--pill-gray-bg)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {day.items.length}
                  </span>
                </div>
                {day.items.length === 0 ? (
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Rest / catch-up
                  </p>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {day.items.map((item) => (
                      <li
                        key={item.pageId}
                        className="rounded-lg border px-2.5 py-2"
                        style={{ borderColor: "var(--border)" }}
                      >
                        <a
                          href={item.pageUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="block text-sm font-medium hover:underline"
                        >
                          {item.title}
                        </a>
                        <div
                          className="mt-0.5 truncate text-[11px]"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {item.databaseName}
                          {item.status ? ` · ${item.status}` : ""}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="panel p-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>
          Choose scope and click <strong>Create plan</strong> to distribute
          revise items across the week.
        </div>
      )}
    </div>
  );
}

export function WeekPlanView() {
  return (
    <Suspense
      fallback={
        <div className="p-8" style={{ color: "var(--text-muted)" }}>
          Loading…
        </div>
      }
    >
      <WeekPlanInner />
    </Suspense>
  );
}
