"use client";

const COLOR_MAP: Record<string, { bg: string; text: string }> = {
  green: { bg: "var(--pill-green-bg)", text: "var(--pill-green-text)" },
  orange: { bg: "var(--pill-orange-bg)", text: "var(--pill-orange-text)" },
  blue: { bg: "var(--pill-blue-bg)", text: "var(--pill-blue-text)" },
  gray: { bg: "var(--pill-gray-bg)", text: "var(--pill-gray-text)" },
  default: { bg: "var(--pill-gray-bg)", text: "var(--pill-gray-text)" },
  red: { bg: "var(--pill-red-bg)", text: "var(--pill-red-text)" },
  purple: { bg: "var(--pill-purple-bg)", text: "var(--pill-purple-text)" },
  yellow: { bg: "var(--pill-yellow-bg)", text: "var(--pill-yellow-text)" },
  pink: { bg: "var(--pill-pink-bg)", text: "var(--pill-pink-text)" },
  brown: { bg: "var(--pill-brown-bg)", text: "var(--pill-brown-text)" },
};

export function StatusPill({
  value,
  color,
  options,
  onChange,
  disabled,
}: {
  value: string;
  color?: string | null;
  options?: { name: string; color: string }[];
  onChange?: (next: string) => void;
  disabled?: boolean;
}) {
  const c = COLOR_MAP[color ?? "default"] ?? COLOR_MAP.default;

  if (!onChange) {
    if (!value) {
      return (
        <span className="text-sm" style={{ color: "var(--text-muted)" }}>
          —
        </span>
      );
    }
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
        style={{ background: c.bg, color: c.text }}
      >
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: c.text }}
        />
        {value}
      </span>
    );
  }

  return (
    <select
      value={value || ""}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className="cursor-pointer rounded-full border-0 px-2 py-1 text-xs font-medium outline-none"
      style={{
        background: value ? c.bg : "var(--bg-hover)",
        color: value ? c.text : "var(--text-secondary)",
      }}
    >
      <option value="">—</option>
      {(options ?? []).map((o) => (
        <option key={o.name} value={o.name}>
          {o.name}
        </option>
      ))}
      {value && !(options ?? []).some((o) => o.name === value) ? (
        <option value={value}>{value}</option>
      ) : null}
    </select>
  );
}
