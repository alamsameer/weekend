"use client";

export function DateCell({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange?: (next: string) => void;
  disabled?: boolean;
}) {
  if (!onChange) {
    return (
      <span
        className="text-sm"
        style={{ color: value ? "var(--text)" : "var(--text-muted)" }}
      >
        {value || "—"}
      </span>
    );
  }

  return (
    <input
      type="date"
      value={value ? value.slice(0, 10) : ""}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className="rounded border bg-transparent px-1.5 py-1 text-sm outline-none"
      style={{
        borderColor: "var(--border)",
        color: "var(--text)",
        colorScheme: "dark",
      }}
    />
  );
}
