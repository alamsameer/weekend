"use client";

import { useMemo, useRef, useState } from "react";
import { readNdjsonProgress } from "@/lib/ndjson";
import { ColumnMeta } from "@/lib/types";

const QUICK_STATUSES = [
  "Not started",
  "To revise",
  "In progress",
  "Done",
] as const;

export function BulkResetBar({
  databaseId,
  rowCount,
  statusProperty,
  nextReviewProperty,
  columns,
  onDone,
}: {
  databaseId: string;
  rowCount: number;
  statusProperty: string | null;
  nextReviewProperty: string | null;
  columns: ColumnMeta[];
  onDone: () => void | Promise<void>;
}) {
  const statusOptions = useMemo(() => {
    const col = columns.find((c) => c.name === statusProperty);
    const fromSchema = (col?.options ?? []).map((o) => o.name);
    const merged = [...fromSchema];
    for (const q of QUICK_STATUSES) {
      if (!merged.some((n) => n.toLowerCase() === q.toLowerCase())) {
        merged.push(q);
      }
    }
    return merged;
  }, [columns, statusProperty]);

  const [statusValue, setStatusValue] = useState("");
  const [dateMode, setDateMode] = useState<"keep" | "clear" | "set">("keep");
  const [dateValue, setDateValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ updated: number; total: number } | null>(
    null,
  );
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  async function apply() {
    const touchStatus = !!statusValue;
    const touchDate = dateMode !== "keep";
    if (!touchStatus && !touchDate) {
      setError("Choose a status and/or a review-date action.");
      return;
    }

    const parts: string[] = [];
    if (touchStatus) parts.push(`status → ${statusValue}`);
    if (dateMode === "clear") parts.push("clear Next review");
    if (dateMode === "set") {
      if (!dateValue) {
        setError("Pick a Next review date.");
        return;
      }
      parts.push(`Next review → ${dateValue}`);
    }

    const ok = window.confirm(
      `Update all ${rowCount} rows in this database?\n\n${parts.join("\n")}`,
    );
    if (!ok) return;

    const ac = new AbortController();
    abortRef.current = ac;
    setBusy(true);
    setError(null);
    setMessage(null);
    setProgress({ updated: 0, total: rowCount });
    try {
      const res = await fetch(`/api/databases/${databaseId}/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          statusValue: touchStatus ? statusValue : undefined,
          clearNextReview: dateMode === "clear",
          nextReviewValue: dateMode === "set" ? dateValue : undefined,
        }),
        signal: ac.signal,
      });
      const last = await readNdjsonProgress(res, (ev) => {
        if (ev.type === "start" || ev.type === "progress" || ev.type === "done") {
          setProgress({
            updated: "updated" in ev ? ev.updated : 0,
            total: ev.total,
          });
        }
      });
      const updated = last.type === "done" ? last.updated : 0;
      const total = last.type === "done" ? last.total : rowCount;
      setMessage(`Updated ${updated}/${total} rows.`);
      await onDone();
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        setMessage("Cancelled — some rows may already be updated.");
        await onDone();
      } else {
        setError(err instanceof Error ? err.message : "Bulk update failed");
      }
    } finally {
      setBusy(false);
      setProgress(null);
      abortRef.current = null;
    }
  }

  function cancel() {
    abortRef.current?.abort();
  }

  const pct =
    progress && progress.total > 0
      ? Math.round((progress.updated / progress.total) * 100)
      : 0;

  return (
    <div className="panel p-4">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold">Bulk reset</h3>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Set status and/or Next review for every row in this database
          </p>
        </div>
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          {rowCount} rows
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block text-xs" style={{ color: "var(--text-muted)" }}>
          Status (all rows)
          <select
            value={statusValue}
            disabled={!statusProperty || busy}
            onChange={(e) => setStatusValue(e.target.value)}
            className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none disabled:opacity-50"
            style={{
              background: "var(--bg)",
              borderColor: "var(--border)",
              color: "var(--text)",
            }}
          >
            <option value="">Keep current</option>
            {statusOptions.map((name) => (
              <option key={name} value={name}>
                All → {name}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-xs" style={{ color: "var(--text-muted)" }}>
          Next review (all rows)
          <select
            value={dateMode}
            disabled={!nextReviewProperty || busy}
            onChange={(e) =>
              setDateMode(e.target.value as "keep" | "clear" | "set")
            }
            className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none disabled:opacity-50"
            style={{
              background: "var(--bg)",
              borderColor: "var(--border)",
              color: "var(--text)",
            }}
          >
            <option value="keep">Keep current</option>
            <option value="clear">Clear all dates</option>
            <option value="set">Set all to date…</option>
          </select>
        </label>

        <label className="block text-xs" style={{ color: "var(--text-muted)" }}>
          Date
          <input
            type="date"
            value={dateValue}
            disabled={dateMode !== "set" || busy}
            onChange={(e) => setDateValue(e.target.value)}
            className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none disabled:opacity-50"
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
            disabled={busy || rowCount === 0}
            onClick={() => void apply()}
            className="w-full rounded-xl px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
            style={{ background: "var(--accent)" }}
          >
            {busy && progress
              ? `${progress.updated}/${progress.total}`
              : "Apply to all"}
          </button>
          {busy ? (
            <button
              type="button"
              onClick={cancel}
              className="rounded-xl border px-3 py-2 text-sm"
              style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
            >
              Cancel
            </button>
          ) : null}
        </div>
      </div>

      {busy && progress ? (
        <div className="mt-3">
          <div
            className="mb-1 flex justify-between text-xs"
            style={{ color: "var(--text-secondary)" }}
          >
            <span>Updating rows</span>
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

      <div className="mt-3 flex flex-wrap gap-2">
        {QUICK_STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            disabled={busy || !statusProperty}
            onClick={() => setStatusValue(s)}
            className="rounded-full border px-2.5 py-1 text-xs disabled:opacity-50"
            style={{
              borderColor:
                statusValue === s ? "var(--border-strong)" : "var(--border)",
              background:
                statusValue === s ? "var(--bg-hover)" : "transparent",
              color: "var(--text-secondary)",
            }}
          >
            All {s}
          </button>
        ))}
        <button
          type="button"
          disabled={busy || !nextReviewProperty}
          onClick={() => {
            setDateMode("clear");
          }}
          className="rounded-full border px-2.5 py-1 text-xs disabled:opacity-50"
          style={{
            borderColor: "var(--border)",
            color: "var(--text-secondary)",
          }}
        >
          Clear dates
        </button>
      </div>

      {error ? (
        <p className="mt-2 text-sm" style={{ color: "var(--pill-red-text)" }}>
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="mt-2 text-sm" style={{ color: "var(--pill-green-text)" }}>
          {message}
        </p>
      ) : null}
    </div>
  );
}
