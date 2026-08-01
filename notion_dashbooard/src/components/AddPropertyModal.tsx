"use client";

import { useState } from "react";

const PROPERTY_TYPES = [
  { value: "rich_text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "select", label: "Select" },
  { value: "multi_select", label: "Multi-select" },
  { value: "date", label: "Date" },
  { value: "checkbox", label: "Checkbox" },
  { value: "url", label: "URL" },
  { value: "email", label: "Email" },
  { value: "phone_number", label: "Phone" },
] as const;

export function AddPropertyModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    type: string;
    options?: string[];
  }) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState<string>("rich_text");
  const [optionsText, setOptionsText] = useState("To revise, In progress, Done");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const needsOptions = type === "select" || type === "multi_select";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onSubmit({
        name: name.trim(),
        type,
        options: needsOptions
          ? optionsText
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : undefined,
      });
      setName("");
      setType("rich_text");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)" }}
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-lg border p-5 shadow-xl"
        style={{
          background: "var(--bg-elevated)",
          borderColor: "var(--border-strong)",
        }}
      >
        <h2 className="mb-1 text-lg font-semibold">Add property</h2>
        <p className="mb-4 text-sm" style={{ color: "var(--text-secondary)" }}>
          Creates a real Notion column on this database.
        </p>

        <label className="mb-3 block text-xs" style={{ color: "var(--text-muted)" }}>
          Name
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2 text-sm outline-none"
            style={{
              background: "var(--bg)",
              borderColor: "var(--border)",
              color: "var(--text)",
            }}
            placeholder="Property name"
          />
        </label>

        <label className="mb-3 block text-xs" style={{ color: "var(--text-muted)" }}>
          Type
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2 text-sm outline-none"
            style={{
              background: "var(--bg)",
              borderColor: "var(--border)",
              color: "var(--text)",
            }}
          >
            {PROPERTY_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>

        {needsOptions ? (
          <label className="mb-3 block text-xs" style={{ color: "var(--text-muted)" }}>
            Options (comma-separated)
            <input
              value={optionsText}
              onChange={(e) => setOptionsText(e.target.value)}
              className="mt-1 w-full rounded border px-3 py-2 text-sm outline-none"
              style={{
                background: "var(--bg)",
                borderColor: "var(--border)",
                color: "var(--text)",
              }}
            />
          </label>
        ) : null}

        {error ? (
          <p className="mb-3 text-sm" style={{ color: "var(--pill-red-text)" }}>
            {error}
          </p>
        ) : null}

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded px-3 py-1.5 text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60"
            style={{ background: "var(--accent)" }}
          >
            {loading ? "Creating…" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}
