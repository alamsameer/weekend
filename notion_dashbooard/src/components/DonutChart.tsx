"use client";

export type DonutSlice = {
  label: string;
  value: number;
  color: string;
};

const DEFAULT_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
  "var(--chart-7)",
  "var(--chart-8)",
  "var(--chart-9)",
  "var(--chart-10)",
];

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

/** Open arc for stroke-based donut (rounded caps via strokeLinecap). */
function strokeArc(
  cx: number,
  cy: number,
  r: number,
  start: number,
  end: number,
) {
  const large = end - start > 180 ? 1 : 0;
  const s = polar(cx, cy, r, start);
  const e = polar(cx, cy, r, end);
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
}

export function DonutChart({
  slices,
  size = 220,
  thickness = 34,
  gapDegrees = 4,
  centerLabel,
  centerSub,
  showLegend = true,
}: {
  slices: DonutSlice[];
  size?: number;
  thickness?: number;
  gapDegrees?: number;
  centerLabel?: string;
  centerSub?: string;
  showLegend?: boolean;
}) {
  const total = slices.reduce((s, x) => s + x.value, 0) || 1;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - thickness / 2 - 2;

  const active = slices.filter((s) => s.value > 0);
  const usable = 360 - gapDegrees * active.length;
  let angle = gapDegrees / 2;

  const arcs = active.map((slice, i) => {
    const sweep = (slice.value / total) * usable;
    const start = angle;
    const end = angle + Math.max(sweep, 1.2);
    angle = end + gapDegrees;
    return {
      ...slice,
      color: slice.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length],
      percent: Math.round((slice.value / total) * 100),
      d: strokeArc(cx, cy, r, start, end),
    };
  });

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-8">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {arcs.map((a) => (
            <path
              key={a.label}
              d={a.d}
              fill="none"
              stroke={a.color}
              strokeWidth={thickness}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <title>
                {a.label}: {a.value} ({a.percent}%)
              </title>
            </path>
          ))}
        </svg>
        {(centerLabel || centerSub) && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            {centerLabel ? (
              <div className="text-2xl font-semibold tracking-tight">
                {centerLabel}
              </div>
            ) : null}
            {centerSub ? (
              <div
                className="mt-0.5 text-xs"
                style={{ color: "var(--text-muted)" }}
              >
                {centerSub}
              </div>
            ) : null}
          </div>
        )}
      </div>

      {showLegend ? (
        <ul className="grid max-h-56 w-full gap-1.5 overflow-auto pr-1 text-sm sm:max-w-[220px]">
          {arcs.map((a) => (
            <li key={a.label} className="flex min-w-0 items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-[3px]"
                style={{ background: a.color }}
              />
              <span
                className="min-w-0 flex-1 truncate"
                style={{ color: "var(--text-secondary)" }}
                title={a.label}
              >
                {a.label}
              </span>
              <span className="shrink-0 text-xs font-medium tabular-nums">
                {a.percent}%
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export { DEFAULT_COLORS as DONUT_COLORS };
