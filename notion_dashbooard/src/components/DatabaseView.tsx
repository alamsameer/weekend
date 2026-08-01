"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { patchRowLocal } from "@/lib/optimistic";
import { computeTrackerStats } from "@/lib/stats";
import { DatabaseDetail } from "@/lib/types";
import { AddPropertyModal } from "./AddPropertyModal";
import { BulkResetBar } from "./BulkResetBar";
import { DashboardHero } from "./DashboardHero";
import { NotionTable } from "./NotionTable";

export function DatabaseView({ databaseId }: { databaseId: string }) {
  const router = useRouter();
  const [data, setData] = useState<DatabaseDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/databases/${databaseId}?all=1`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load");
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [databaseId]);

  useEffect(() => {
    void load();
  }, [load]);

  const stats = useMemo(
    () => (data ? computeTrackerStats(data) : null),
    [data],
  );

  async function patchPage(
    pageId: string,
    body: Record<string, unknown>,
    local: {
      status?: { property: string; value: string | null };
      date?: { property: string; value: string | null };
    },
  ) {
    setSavingId(pageId);
    const prev = data;
    if (data) {
      setData({
        ...data,
        rows: patchRowLocal(data.rows, pageId, local, data.columns),
      });
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
      setData(prev);
      alert(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSavingId(null);
    }
  }

  async function addProperty(payload: {
    name: string;
    type: string;
    options?: string[];
  }) {
    const res = await fetch(`/api/databases/${databaseId}/properties`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to add property");
    await load();
  }

  async function handleDelete() {
    const name = data?.name ?? "this database";
    const ok = window.confirm(
      `Move "${name}" to Notion trash?\n\nThis deletes the database in Notion (recoverable from trash).`,
    );
    if (!ok) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/databases/${databaseId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Delete failed");
      router.push("/");
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
      setDeleting(false);
    }
  }

  if (loading && !data) {
    return (
      <div className="px-5 py-5 md:px-8 md:py-6">
        <div
          className="mb-4 h-8 w-64 animate-pulse rounded"
          style={{ background: "var(--bg-hover)" }}
        />
        <div className="panel mb-4 flex gap-6 p-8">
          <div
            className="h-44 w-44 shrink-0 animate-pulse rounded-full"
            style={{ background: "var(--bg-hover)" }}
          />
          <div className="flex flex-1 flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-4 w-full max-w-md animate-pulse rounded"
                style={{ background: "var(--bg-hover)" }}
              />
            ))}
          </div>
        </div>
        <div className="panel space-y-2 p-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-9 animate-pulse rounded-lg"
              style={{ background: "var(--bg-hover)" }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-8">
        <p style={{ color: "var(--pill-red-text)" }}>{error}</p>
        <button
          onClick={() => void load()}
          className="mt-3 text-sm underline"
          style={{ color: "var(--accent)" }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data || !stats) return null;

  return (
    <div className="px-5 py-5 md:px-8 md:py-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
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
            <span style={{ color: "var(--text-secondary)" }}>Database</span>
          </div>
          <h1 className="text-[28px] leading-tight font-semibold tracking-tight md:text-[32px]">
            {data.icon ? <span className="mr-2">{data.icon}</span> : null}
            {data.name}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/plan?db=${encodeURIComponent(databaseId)}`}
            className="rounded-xl px-3 py-1.5 text-sm font-medium text-white"
            style={{ background: "var(--accent)" }}
          >
            Week plan
          </Link>
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
          <button
            onClick={() => setModalOpen(true)}
            className="rounded-xl px-3 py-1.5 text-sm font-medium text-white"
            style={{ background: "var(--accent)" }}
          >
            New column
          </button>
          <button
            onClick={() => void handleDelete()}
            disabled={deleting}
            className="rounded-xl px-3 py-1.5 text-sm font-medium disabled:opacity-50"
            style={{
              color: "var(--pill-red-text)",
              background: "var(--pill-red-bg)",
            }}
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>

      <div className="mb-4">
        <DashboardHero
          stats={stats}
          eyebrow="Database dashboard"
          subtitle="Chart + table for this tracker only"
          defaultMode={stats.byTopic.length ? "topic" : "status"}
        />
      </div>

      <div className="mb-4">
        <BulkResetBar
          databaseId={databaseId}
          rowCount={data.rows.length}
          statusProperty={data.statusProperty}
          nextReviewProperty={data.nextReviewProperty}
          columns={data.columns}
          onDone={load}
        />
      </div>

      <div className="panel overflow-hidden">
        <NotionTable
          columns={data.columns}
          rows={data.rows}
          statusProperty={data.statusProperty}
          nextReviewProperty={data.nextReviewProperty}
          savingId={savingId}
          onStatusChange={(pageId, property, type, value) =>
            void patchPage(
              pageId,
              { status: { property, type, value: value || null } },
              { status: { property, value: value || null } },
            )
          }
          onDateChange={(pageId, property, value) =>
            void patchPage(
              pageId,
              { date: { property, value: value || null } },
              { date: { property, value: value || null } },
            )
          }
        />
      </div>

      <AddPropertyModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={addProperty}
      />
    </div>
  );
}
