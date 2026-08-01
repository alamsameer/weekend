import { DatabaseDetail, LabelCount, TrackerStats } from "./types";

function toSortedCounts(m: Map<string, number>): LabelCount[] {
  return [...m.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

export function computeTrackerStats(detail: DatabaseDetail): TrackerStats {
  const statusName = detail.statusProperty;
  const topicCol =
    detail.columns.find((c) => c.name.toLowerCase() === "topic") ??
    detail.columns.find((c) => c.type === "select" && /topic/i.test(c.name));
  const diffCol = detail.columns.find(
    (c) => c.name.toLowerCase() === "difficulty",
  );

  const byTopicMap = new Map<string, number>();
  const byDiffMap = new Map<string, number>();
  const byStatusMap = new Map<string, number>();
  let done = 0;
  let inProgress = 0;
  let toRevise = 0;

  for (const row of detail.rows) {
    const status = (statusName && row.properties[statusName]?.text) || "";
    const s = status.toLowerCase();
    if (s === "done" || s === "complete" || s === "completed") done++;
    else if (s.includes("progress")) inProgress++;
    else toRevise++;

    const statusKey = status || "Unset";
    byStatusMap.set(statusKey, (byStatusMap.get(statusKey) ?? 0) + 1);

    if (topicCol) {
      const t = row.properties[topicCol.name]?.text || "Other";
      byTopicMap.set(t, (byTopicMap.get(t) ?? 0) + 1);
    }
    if (diffCol) {
      const d = row.properties[diffCol.name]?.text || "Unknown";
      byDiffMap.set(d, (byDiffMap.get(d) ?? 0) + 1);
    }
  }

  return {
    id: detail.id,
    name: detail.name,
    icon: detail.icon,
    total: detail.rows.length,
    done,
    inProgress,
    toRevise,
    byTopic: toSortedCounts(byTopicMap),
    byDifficulty: toSortedCounts(byDiffMap),
    byStatus: toSortedCounts(byStatusMap),
  };
}

export function mergeLabelCounts(lists: LabelCount[][]): LabelCount[] {
  const out = new Map<string, number>();
  for (const list of lists) {
    for (const { label, value } of list) {
      out.set(label, (out.get(label) ?? 0) + value);
    }
  }
  return toSortedCounts(out);
}
