import { CellValue, ColumnMeta, RowData, TodayFocus, TodayFocusItem } from "./types";

function optionColor(
  options: { name: string; color: string }[] | undefined,
  value: string | null,
): string | null {
  if (!value || !options?.length) return null;
  return options.find((o) => o.name === value)?.color ?? null;
}

export function patchRowLocal(
  rows: RowData[],
  pageId: string,
  patch: {
    status?: { property: string; value: string | null };
    date?: { property: string; value: string | null };
  },
  columns?: ColumnMeta[],
): RowData[] {
  return rows.map((row) => {
    if (row.id !== pageId) return row;
    const properties = { ...row.properties };

    if (patch.status) {
      const prev = properties[patch.status.property];
      const col = columns?.find((c) => c.name === patch.status!.property);
      const color =
        optionColor(col?.options, patch.status.value) ?? prev?.color ?? null;
      properties[patch.status.property] = {
        type: (prev?.type ?? col?.type ?? "status") as CellValue["type"],
        text: patch.status.value ?? "",
        raw: patch.status.value,
        color,
      };
    }

    if (patch.date) {
      const prev = properties[patch.date.property];
      properties[patch.date.property] = {
        type: "date",
        text: patch.date.value ?? "",
        raw: patch.date.value,
        color: prev?.color ?? null,
      };
    }

    return { ...row, properties };
  });
}

function isDone(status: string | null) {
  return /^(done|complete|completed)$/i.test((status ?? "").trim());
}

function isInProgress(status: string | null) {
  return /progress/i.test((status ?? "").trim());
}

function isDueTodayOrOverdue(nextReview: string | null, today: string) {
  if (!nextReview) return false;
  return nextReview.slice(0, 10) <= today;
}

export function patchTodayFocusLocal(
  today: TodayFocus,
  pageId: string,
  patch: {
    status?: string | null;
    statusColor?: string | null;
    nextReview?: string | null;
    intervalDays?: number;
  },
): TodayFocus {
  const updateItem = (item: TodayFocusItem): TodayFocusItem => {
    if (item.pageId !== pageId) return item;
    const status = patch.status !== undefined ? patch.status : item.status;
    const nextReview =
      patch.nextReview !== undefined ? patch.nextReview : item.nextReview;
    const statusColor =
      patch.statusColor !== undefined
        ? patch.statusColor
        : patch.status !== undefined
          ? optionColor(item.statusOptions, patch.status)
          : item.statusColor;
    return {
      ...item,
      status,
      statusColor,
      nextReview,
      intervalDays:
        patch.intervalDays !== undefined
          ? patch.intervalDays
          : item.intervalDays,
      overdue: !!nextReview && nextReview.slice(0, 10) < today.date,
    };
  };

  const all = new Map<string, TodayFocusItem>();
  for (const item of [...today.inProgress, ...today.reviseToday]) {
    all.set(item.pageId, updateItem(item));
  }

  // If the patched page wasn't in today lists but we only update existing, fine
  const items = [...all.values()];
  const inProgress: TodayFocusItem[] = [];
  const reviseToday: TodayFocusItem[] = [];

  for (const item of items) {
    if (isDone(item.status)) continue;
    if (isInProgress(item.status)) inProgress.push(item);
    if (isDueTodayOrOverdue(item.nextReview, today.date)) {
      reviseToday.push(item);
    }
  }

  return { ...today, inProgress, reviseToday };
}

export function patchReviseItemLocal<
  T extends {
    pageId: string;
    status: string | null;
    statusColor: string | null;
    statusOptions: { name: string; color: string }[];
    nextReview: string | null;
    intervalDays: number;
  },
>(
  items: T[],
  pageId: string,
  patch: {
    status?: string | null;
    nextReview?: string | null;
    intervalDays?: number;
  },
): T[] {
  return items.map((item) => {
    if (item.pageId !== pageId) return item;
    const status = patch.status !== undefined ? patch.status : item.status;
    const nextReview =
      patch.nextReview !== undefined ? patch.nextReview : item.nextReview;
    const statusColor =
      patch.status !== undefined
        ? optionColor(item.statusOptions, patch.status)
        : item.statusColor;
    const intervalDays =
      patch.intervalDays !== undefined
        ? patch.intervalDays
        : item.intervalDays;
    return { ...item, status, statusColor, nextReview, intervalDays };
  });
}
