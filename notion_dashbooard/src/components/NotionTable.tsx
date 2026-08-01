"use client";

import { useEffect, useMemo, useState } from "react";
import { ColumnMeta, RowData } from "@/lib/types";
import { DateCell } from "./DateCell";
import { StatusPill } from "./StatusPill";

const PAGE_SIZE = 50;

type SortDir = "asc" | "desc";
type SortState = { column: string; dir: SortDir } | null;

function typeIcon(type: string): string {
  switch (type) {
    case "title":
      return "Aa";
    case "rich_text":
      return "T";
    case "status":
    case "select":
      return "◇";
    case "date":
      return "▦";
    case "number":
      return "#";
    case "checkbox":
      return "☑";
    default:
      return "·";
  }
}

function cellText(row: RowData, column: string): string {
  return (row.properties[column]?.text ?? "").trim();
}

function compareValues(
  a: string,
  b: string,
  type: ColumnMeta["type"],
  dir: SortDir,
): number {
  const emptyA = !a;
  const emptyB = !b;
  if (emptyA && emptyB) return 0;
  if (emptyA) return 1;
  if (emptyB) return -1;

  let cmp = 0;
  if (type === "number") {
    const na = Number(a);
    const nb = Number(b);
    cmp = (Number.isFinite(na) ? na : 0) - (Number.isFinite(nb) ? nb : 0);
  } else if (type === "date") {
    cmp = a.localeCompare(b);
  } else if (type === "checkbox") {
    cmp = Number(a === "true" || a === "Yes") - Number(b === "true" || b === "Yes");
  } else {
    cmp = a.localeCompare(b, undefined, { sensitivity: "base", numeric: true });
  }
  return dir === "asc" ? cmp : -cmp;
}

function uniqueValues(rows: RowData[], column: string): string[] {
  const set = new Set<string>();
  for (const row of rows) {
    const t = cellText(row, column);
    if (t) set.add(t);
  }
  return [...set].sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" }),
  );
}

export function NotionTable({
  columns,
  rows,
  statusProperty,
  nextReviewProperty,
  savingId,
  onStatusChange,
  onDateChange,
}: {
  columns: ColumnMeta[];
  rows: RowData[];
  statusProperty: string | null;
  nextReviewProperty: string | null;
  savingId?: string | null;
  onStatusChange: (
    pageId: string,
    property: string,
    type: "status" | "select",
    value: string,
  ) => void;
  onDateChange: (pageId: string, property: string, value: string) => void;
}) {
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState<SortState>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [globalQuery, setGlobalQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const ordered = useMemo(
    () =>
      [...columns].sort((a, b) => {
        if (a.type === "title") return -1;
        if (b.type === "title") return 1;
        return 0;
      }),
    [columns],
  );

  const optionLists = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const col of ordered) {
      if (col.type === "status" || col.type === "select") {
        const fromSchema = (col.options ?? []).map((o) => o.name);
        const fromRows = uniqueValues(rows, col.name);
        const merged = [...fromSchema];
        for (const v of fromRows) {
          if (!merged.some((n) => n.toLowerCase() === v.toLowerCase())) {
            merged.push(v);
          }
        }
        map.set(col.name, merged);
      }
    }
    return map;
  }, [ordered, rows]);

  const filteredSorted = useMemo(() => {
    const q = globalQuery.trim().toLowerCase();
    const activeFilters = Object.entries(filters).filter(([, v]) => v.trim());

    let next = rows.filter((row) => {
      if (q) {
        const hit = ordered.some((col) =>
          cellText(row, col.name).toLowerCase().includes(q),
        );
        if (!hit) return false;
      }

      for (const [colName, raw] of activeFilters) {
        const needle = raw.trim().toLowerCase();
        const value = cellText(row, colName).toLowerCase();
        const col = ordered.find((c) => c.name === colName);
        if (col?.type === "status" || col?.type === "select") {
          if (value !== needle) return false;
        } else if (col?.type === "date") {
          if (!value.startsWith(needle)) return false;
        } else if (col?.type === "number") {
          if (value !== needle && !value.includes(needle)) return false;
        } else {
          if (!value.includes(needle)) return false;
        }
      }
      return true;
    });

    if (sort) {
      const col = ordered.find((c) => c.name === sort.column);
      const type = col?.type ?? "rich_text";
      next = [...next].sort((a, b) =>
        compareValues(
          cellText(a, sort.column),
          cellText(b, sort.column),
          type,
          sort.dir,
        ),
      );
    }

    return next;
  }, [rows, ordered, filters, globalQuery, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageRows = filteredSorted.slice(
    safePage * PAGE_SIZE,
    safePage * PAGE_SIZE + PAGE_SIZE,
  );

  const activeFilterCount =
    Object.values(filters).filter((v) => v.trim()).length +
    (globalQuery.trim() ? 1 : 0);

  useEffect(() => {
    setPage(0);
  }, [filters, globalQuery, sort]);

  useEffect(() => {
    if (page > totalPages - 1) setPage(Math.max(0, totalPages - 1));
  }, [page, totalPages]);

  function cycleSort(column: string) {
    setSort((prev) => {
      if (!prev || prev.column !== column) return { column, dir: "asc" };
      if (prev.dir === "asc") return { column, dir: "desc" };
      return null;
    });
  }

  function setFilter(column: string, value: string) {
    setFilters((prev) => {
      const next = { ...prev };
      if (!value) delete next[column];
      else next[column] = value;
      return next;
    });
  }

  function clearAll() {
    setFilters({});
    setGlobalQuery("");
    setSort(null);
  }

  return (
    <div>
      <div
        className="flex flex-wrap items-center gap-2 border-b px-3 py-2.5"
        style={{ borderColor: "var(--border)" }}
      >
        <input
          type="search"
          value={globalQuery}
          onChange={(e) => setGlobalQuery(e.target.value)}
          placeholder="Search all columns…"
          className="min-w-[180px] flex-1 rounded-lg border px-2.5 py-1.5 text-sm outline-none"
          style={{
            background: "var(--bg)",
            borderColor: "var(--border)",
            color: "var(--text)",
          }}
        />
        <button
          type="button"
          onClick={() => setShowFilters((v) => !v)}
          className="rounded-lg border px-2.5 py-1.5 text-xs"
          style={{
            borderColor: showFilters || activeFilterCount
              ? "var(--border-strong)"
              : "var(--border)",
            background:
              showFilters || activeFilterCount
                ? "var(--bg-hover)"
                : "transparent",
            color: "var(--text-secondary)",
          }}
        >
          Filters{activeFilterCount ? ` (${activeFilterCount})` : ""}
        </button>
        {sort || activeFilterCount ? (
          <button
            type="button"
            onClick={clearAll}
            className="rounded-lg border px-2.5 py-1.5 text-xs"
            style={{
              borderColor: "var(--border)",
              color: "var(--text-muted)",
            }}
          >
            Clear
          </button>
        ) : null}
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          {filteredSorted.length === rows.length
            ? `${rows.length} rows`
            : `${filteredSorted.length} of ${rows.length}`}
          {sort ? ` · sort ${sort.column} ${sort.dir}` : ""}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {ordered.map((col) => {
                const active = sort?.column === col.name;
                return (
                  <th
                    key={col.id}
                    className="px-3 py-2 text-left text-xs font-medium whitespace-nowrap"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <button
                      type="button"
                      onClick={() => cycleSort(col.name)}
                      className="inline-flex max-w-full items-center gap-1 rounded px-0.5 hover:underline"
                      title={`Sort by ${col.name}`}
                    >
                      <span className="opacity-50">{typeIcon(col.type)}</span>
                      <span className="truncate">{col.name}</span>
                      <span
                        className="text-[10px]"
                        style={{
                          color: active
                            ? "var(--text)"
                            : "var(--text-muted)",
                          opacity: active ? 1 : 0.45,
                        }}
                      >
                        {active ? (sort!.dir === "asc" ? "▲" : "▼") : "↕"}
                      </span>
                    </button>
                  </th>
                );
              })}
            </tr>
            {showFilters ? (
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {ordered.map((col) => {
                  const options = optionLists.get(col.name);
                  const value = filters[col.name] ?? "";
                  return (
                    <th key={`f-${col.id}`} className="px-2 py-1.5 align-top">
                      {options ? (
                        <select
                          value={value}
                          onChange={(e) => setFilter(col.name, e.target.value)}
                          className="w-full min-w-[90px] rounded-md border px-1.5 py-1 text-xs outline-none"
                          style={{
                            background: "var(--bg)",
                            borderColor: value
                              ? "var(--border-strong)"
                              : "var(--border)",
                            color: "var(--text)",
                          }}
                        >
                          <option value="">All</option>
                          {options.map((name) => (
                            <option key={name} value={name}>
                              {name}
                            </option>
                          ))}
                        </select>
                      ) : col.type === "date" ? (
                        <input
                          type="date"
                          value={value}
                          onChange={(e) => setFilter(col.name, e.target.value)}
                          className="w-full min-w-[110px] rounded-md border px-1.5 py-1 text-xs outline-none"
                          style={{
                            background: "var(--bg)",
                            borderColor: value
                              ? "var(--border-strong)"
                              : "var(--border)",
                            color: "var(--text)",
                            colorScheme: "dark",
                          }}
                        />
                      ) : (
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => setFilter(col.name, e.target.value)}
                          placeholder="Filter…"
                          className="w-full min-w-[90px] rounded-md border px-1.5 py-1 text-xs outline-none"
                          style={{
                            background: "var(--bg)",
                            borderColor: value
                              ? "var(--border-strong)"
                              : "var(--border)",
                            color: "var(--text)",
                          }}
                        />
                      )}
                    </th>
                  );
                })}
              </tr>
            ) : null}
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td
                  colSpan={ordered.length}
                  className="px-3 py-10 text-center"
                  style={{ color: "var(--text-muted)" }}
                >
                  {rows.length === 0
                    ? "No rows in this database."
                    : "No rows match the current filters."}
                </td>
              </tr>
            ) : (
              pageRows.map((row) => (
                <tr
                  key={row.id}
                  style={{ borderBottom: "1px solid var(--border)" }}
                  className="hover:bg-[var(--bg-hover)]/40"
                >
                  {ordered.map((col) => {
                    const cell = row.properties[col.name];
                    const isStatus =
                      statusProperty === col.name &&
                      (col.type === "status" || col.type === "select");
                    const isDate =
                      nextReviewProperty === col.name && col.type === "date";
                    const busy = savingId === row.id;

                    return (
                      <td key={col.id} className="px-3 py-2 align-middle">
                        {isStatus ? (
                          <StatusPill
                            value={cell?.text ?? ""}
                            color={cell?.color}
                            options={col.options}
                            disabled={busy}
                            onChange={(v) =>
                              onStatusChange(
                                row.id,
                                col.name,
                                col.type === "status" ? "status" : "select",
                                v,
                              )
                            }
                          />
                        ) : isDate ? (
                          <DateCell
                            value={cell?.text ?? ""}
                            disabled={busy}
                            onChange={(v) =>
                              onDateChange(row.id, col.name, v)
                            }
                          />
                        ) : col.type === "title" ? (
                          <a
                            href={row.url}
                            target="_blank"
                            rel="noreferrer"
                            className="font-medium hover:underline"
                          >
                            <span className="mr-1.5 opacity-40">📄</span>
                            {cell?.text || "Untitled"}
                          </a>
                        ) : (
                          <span
                            className="block max-w-xs truncate"
                            style={{
                              color: cell?.text
                                ? "var(--text-secondary)"
                                : "var(--text-muted)",
                            }}
                            title={cell?.text}
                          >
                            {cell?.text || "—"}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filteredSorted.length > PAGE_SIZE ? (
        <div
          className="flex flex-wrap items-center justify-between gap-2 border-t px-4 py-3 text-xs"
          style={{
            borderColor: "var(--border)",
            color: "var(--text-secondary)",
          }}
        >
          <span>
            Showing {safePage * PAGE_SIZE + 1}–
            {Math.min((safePage + 1) * PAGE_SIZE, filteredSorted.length)} of{" "}
            {filteredSorted.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={safePage === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="rounded-lg border px-2.5 py-1 disabled:opacity-40"
              style={{ borderColor: "var(--border)" }}
            >
              Prev
            </button>
            <span>
              Page {safePage + 1} / {totalPages}
            </span>
            <button
              type="button"
              disabled={safePage >= totalPages - 1}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              className="rounded-lg border px-2.5 py-1 disabled:opacity-40"
              style={{ borderColor: "var(--border)" }}
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
