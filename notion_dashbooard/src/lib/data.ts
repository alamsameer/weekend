import { getNotionClient, richTextToPlain } from "./notion";
import {
  findIntervalColumn,
  findNextReviewColumn,
  findStatusColumn,
  pageToRow,
  schemaToColumns,
} from "./properties";
import { parseIntervalDays } from "./srs";
import {
  ColumnMeta,
  DatabaseDetail,
  DatabaseSummary,
  DEFAULT_STATUS_OPTIONS,
  ReviseItem,
  TodayFocus,
  TodayFocusItem,
  TrackerStats,
} from "./types";
import { computeTrackerStats, mergeLabelCounts } from "./stats";
import {
  cacheGet,
  cacheInvalidateAll,
  cacheSet,
  detailCacheKey,
  invalidateDataSource,
} from "./cache";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRec = any;

function iconToEmoji(icon: AnyRec): string | null {
  if (!icon) return null;
  if (icon.type === "emoji") return icon.emoji ?? null;
  return null;
}

export async function deleteDataSource(dataSourceId: string): Promise<void> {
  const notion = getNotionClient();
  const ds = (await notion.dataSources.retrieve({
    data_source_id: dataSourceId,
  })) as AnyRec;

  const parent = ds.parent;
  if (parent?.type === "database_id" && parent.database_id) {
    await notion.databases.update({
      database_id: parent.database_id,
      in_trash: true,
    });
  } else {
    await notion.dataSources.update({
      data_source_id: dataSourceId,
      in_trash: true,
    });
  }
  invalidateDataSource(dataSourceId);
  cacheInvalidateAll();
}

export async function listDataSources(): Promise<DatabaseSummary[]> {
  const cached = cacheGet<DatabaseSummary[]>("list:datasources");
  if (cached) return cached;

  const notion = getNotionClient();
  const results: DatabaseSummary[] = [];
  let cursor: string | undefined;

  do {
    const res = await notion.search({
      filter: { property: "object", value: "data_source" },
      page_size: 100,
      start_cursor: cursor,
      sort: { direction: "descending", timestamp: "last_edited_time" },
    });

    for (const item of res.results) {
      if (item.object !== "data_source") continue;
      const ds = item as AnyRec;
      if (ds.in_trash || ds.archived) continue;
      results.push({
        id: ds.id,
        name: richTextToPlain(ds.title) || "Untitled",
        icon: iconToEmoji(ds.icon),
        url: ds.url ?? "",
        lastEditedTime: ds.last_edited_time ?? "",
      });
    }

    cursor = res.has_more ? (res.next_cursor ?? undefined) : undefined;
  } while (cursor);

  cacheSet("list:datasources", results, 30_000);
  return results;
}

export async function ensureTrackingProperties(
  dataSourceId: string,
): Promise<{
  columns: ColumnMeta[];
  statusProperty: string;
  nextReviewProperty: string;
  intervalProperty: string;
  created: string[];
  meta: { name: string; icon: string | null; url: string };
}> {
  const notion = getNotionClient();
  let ds = (await notion.dataSources.retrieve({
    data_source_id: dataSourceId,
  })) as AnyRec;

  let columns = schemaToColumns(ds.properties ?? {});
  const created: string[] = [];
  const propertiesUpdate: Record<string, AnyRec> = {};

  let statusCol = findStatusColumn(columns);
  if (!statusCol) {
    propertiesUpdate["Status"] = {
      select: {
        options: DEFAULT_STATUS_OPTIONS.map((o) => ({
          name: o.name,
          color: o.color,
        })),
      },
    };
    created.push("Status");
  }

  let nextReviewCol = findNextReviewColumn(columns);
  if (!nextReviewCol) {
    propertiesUpdate["Next review"] = { date: {} };
    created.push("Next review");
  }

  let intervalCol = findIntervalColumn(columns);
  if (!intervalCol) {
    propertiesUpdate["Interval"] = { number: {} };
    created.push("Interval");
  }

  if (Object.keys(propertiesUpdate).length > 0) {
    ds = (await notion.dataSources.update({
      data_source_id: dataSourceId,
      properties: propertiesUpdate,
    })) as AnyRec;
    columns = schemaToColumns(ds.properties ?? {});
    statusCol = findStatusColumn(columns);
    nextReviewCol = findNextReviewColumn(columns);
    intervalCol = findIntervalColumn(columns);
    invalidateDataSource(dataSourceId);
  }

  return {
    columns,
    statusProperty: statusCol?.name ?? "Status",
    nextReviewProperty: nextReviewCol?.name ?? "Next review",
    intervalProperty: intervalCol?.name ?? "Interval",
    created,
    meta: {
      name: richTextToPlain(ds.title) || "Untitled",
      icon: iconToEmoji(ds.icon),
      url: ds.url ?? "",
    },
  };
}

export async function getDatabaseDetail(
  dataSourceId: string,
  opts?: {
    cursor?: string;
    ensureTracking?: boolean;
    allPages?: boolean;
    skipCache?: boolean;
  },
): Promise<DatabaseDetail> {
  const allPages = opts?.allPages === true;
  const ensureTracking = opts?.ensureTracking !== false;
  const cacheable =
    allPages && ensureTracking && !opts?.cursor && !opts?.skipCache;
  const key = detailCacheKey(dataSourceId, true);

  if (cacheable) {
    const cached = cacheGet<DatabaseDetail>(key);
    if (cached) return cached;
  }

  const notion = getNotionClient();

  let columns: ColumnMeta[];
  let statusProperty: string | null = null;
  let nextReviewProperty: string | null = null;
  let intervalProperty: string | null = null;
  let name = "Untitled";
  let icon: string | null = null;
  let url = "";

  if (ensureTracking) {
    const ensured = await ensureTrackingProperties(dataSourceId);
    columns = ensured.columns;
    statusProperty = ensured.statusProperty;
    nextReviewProperty = ensured.nextReviewProperty;
    intervalProperty = ensured.intervalProperty;
    name = ensured.meta.name;
    icon = ensured.meta.icon;
    url = ensured.meta.url;
  } else {
    const ds = (await notion.dataSources.retrieve({
      data_source_id: dataSourceId,
    })) as AnyRec;
    columns = schemaToColumns(ds.properties ?? {});
    statusProperty = findStatusColumn(columns)?.name ?? null;
    nextReviewProperty = findNextReviewColumn(columns)?.name ?? null;
    intervalProperty = findIntervalColumn(columns)?.name ?? null;
    name = richTextToPlain(ds.title) || "Untitled";
    icon = iconToEmoji(ds.icon);
    url = ds.url ?? "";
  }

  const rows: ReturnType<typeof pageToRow>[] = [];
  let cursor: string | undefined = opts?.cursor;
  let hasMore = false;
  let nextCursor: string | null = null;

  do {
    const query = await notion.dataSources.query({
      data_source_id: dataSourceId,
      start_cursor: cursor,
      page_size: 100,
    });

    rows.push(
      ...query.results
        .filter((r) => (r as AnyRec).object === "page")
        .map((r) => pageToRow(r)),
    );

    hasMore = query.has_more;
    nextCursor = query.next_cursor;
    cursor = allPages && hasMore ? (nextCursor ?? undefined) : undefined;
  } while (allPages && cursor);

  const detail: DatabaseDetail = {
    id: dataSourceId,
    name,
    icon,
    url,
    columns,
    rows,
    hasMore: allPages ? false : hasMore,
    nextCursor: allPages ? null : nextCursor,
    statusProperty,
    nextReviewProperty,
    intervalProperty,
  };

  if (cacheable) cacheSet(key, detail);
  return detail;
}

export type OverviewStats = {
  combined: TrackerStats;
  databases: TrackerStats[];
  today: TodayFocus;
};

function isDoneStatus(status: string | null | undefined): boolean {
  const s = (status ?? "").trim().toLowerCase();
  return s === "done" || s === "complete" || s === "completed";
}

function isInProgressStatus(status: string | null | undefined): boolean {
  return (status ?? "").toLowerCase().includes("progress");
}

function collectTodayFromDetail(
  detail: DatabaseDetail,
  today: string,
): { inProgress: TodayFocusItem[]; reviseToday: TodayFocusItem[] } {
  const statusName = detail.statusProperty;
  const nextReviewName = detail.nextReviewProperty;
  const intervalName = detail.intervalProperty;
  if (!statusName) {
    return { inProgress: [], reviseToday: [] };
  }

  const statusCol = detail.columns.find((c) => c.name === statusName);
  const statusType =
    statusCol?.type === "status" ? ("status" as const) : ("select" as const);
  const statusOptions = (statusCol?.options ?? []).map((o) => ({
    name: o.name,
    color: o.color,
  }));
  const titleCol = detail.columns.find((c) => c.type === "title");

  const inProgress: TodayFocusItem[] = [];
  const reviseToday: TodayFocusItem[] = [];

  for (const row of detail.rows) {
    const statusVal = row.properties[statusName]?.text ?? null;
    const statusColor = row.properties[statusName]?.color ?? null;
    const nextReview = nextReviewName
      ? row.properties[nextReviewName]?.text || null
      : null;
    const intervalDays = intervalName
      ? parseIntervalDays(row.properties[intervalName]?.text)
      : 0;
    const title = titleCol
      ? (row.properties[titleCol.name]?.text ?? "Untitled")
      : "Untitled";

    const base: TodayFocusItem = {
      pageId: row.id,
      pageUrl: row.url,
      title,
      databaseId: detail.id,
      databaseName: detail.name,
      status: statusVal,
      statusColor,
      statusProperty: statusName,
      statusType,
      statusOptions,
      nextReview,
      nextReviewProperty: nextReviewName ?? "Next review",
      intervalDays,
      intervalProperty: intervalName,
      overdue: false,
    };

    if (isInProgressStatus(statusVal) && !isDoneStatus(statusVal)) {
      inProgress.push(base);
    }

    const reviewDay = nextReview?.slice(0, 10) ?? null;
    const dueOrOverdue = !!reviewDay && reviewDay <= today;
    if (dueOrOverdue && !isDoneStatus(statusVal)) {
      reviseToday.push({
        ...base,
        overdue: reviewDay < today,
      });
    }
  }

  inProgress.sort((a, b) => a.title.localeCompare(b.title));
  reviseToday.sort((a, b) => {
    const da = a.nextReview ?? "";
    const db = b.nextReview ?? "";
    if (da !== db) return da.localeCompare(db);
    return a.title.localeCompare(b.title);
  });

  return { inProgress, reviseToday };
}

export async function getOverviewStats(): Promise<OverviewStats> {
  const summaries = await listDataSources();
  const settled = await Promise.allSettled(
    summaries.map((s) =>
      getDatabaseDetail(s.id, { ensureTracking: true, allPages: true }),
    ),
  );

  const databases: TrackerStats[] = [];
  const todayISO = new Date().toISOString().slice(0, 10);
  const inProgress: TodayFocusItem[] = [];
  const reviseToday: TodayFocusItem[] = [];

  for (const result of settled) {
    if (result.status !== "fulfilled") continue;
    const detail = result.value;
    databases.push(computeTrackerStats(detail));
    const bucket = collectTodayFromDetail(detail, todayISO);
    inProgress.push(...bucket.inProgress);
    reviseToday.push(...bucket.reviseToday);
  }

  const byDatabase = databases
    .map((d) => ({ label: d.name.trim() || "Untitled", value: d.total }))
    .sort((a, b) => b.value - a.value);

  const combined: TrackerStats = {
    id: "combined",
    name: "Combined",
    icon: null,
    total: databases.reduce((s, d) => s + d.total, 0),
    done: databases.reduce((s, d) => s + d.done, 0),
    inProgress: databases.reduce((s, d) => s + d.inProgress, 0),
    toRevise: databases.reduce((s, d) => s + d.toRevise, 0),
    byTopic: mergeLabelCounts(databases.map((d) => d.byTopic)),
    byDifficulty: mergeLabelCounts(databases.map((d) => d.byDifficulty)),
    byStatus: mergeLabelCounts(databases.map((d) => d.byStatus)),
    byDatabase,
  };

  return {
    combined,
    databases,
    today: { date: todayISO, inProgress, reviseToday },
  };
}

export async function updatePageProperties(
  pageId: string,
  updates: {
    status?: { property: string; type: "status" | "select"; value: string | null };
    date?: { property: string; value: string | null };
    number?: { property: string; value: number | null };
    text?: { property: string; type: "rich_text" | "title"; value: string };
  },
  opts?: { dataSourceId?: string; skipInvalidate?: boolean },
) {
  const notion = getNotionClient();
  const properties: Record<string, AnyRec> = {};

  if (updates.status) {
    const { property, type, value } = updates.status;
    if (type === "status") {
      properties[property] = {
        status: value ? { name: value } : null,
      };
    } else {
      properties[property] = {
        select: value ? { name: value } : null,
      };
    }
  }

  if (updates.date) {
    properties[updates.date.property] = {
      date: updates.date.value ? { start: updates.date.value } : null,
    };
  }

  if (updates.number) {
    properties[updates.number.property] = {
      number: updates.number.value,
    };
  }

  if (updates.text) {
    const rich = [{ type: "text", text: { content: updates.text.value } }];
    if (updates.text.type === "title") {
      properties[updates.text.property] = { title: rich };
    } else {
      properties[updates.text.property] = { rich_text: rich };
    }
  }

  const result = await notion.pages.update({ page_id: pageId, properties });
  if (!opts?.skipInvalidate) {
    if (opts?.dataSourceId) invalidateDataSource(opts.dataSourceId);
    else cacheInvalidateAll();
  }
  return result;
}

export type ProgressEvent =
  | { type: "start"; total: number }
  | { type: "progress"; updated: number; total: number }
  | { type: "done"; updated: number; total: number }
  | { type: "error"; message: string };

export async function* bulkUpdateDatabaseStream(
  dataSourceId: string,
  opts: {
    statusValue?: string | null;
    clearStatus?: boolean;
    nextReviewValue?: string | null;
    clearNextReview?: boolean;
  },
): AsyncGenerator<ProgressEvent> {
  const detail = await getDatabaseDetail(dataSourceId, {
    ensureTracking: true,
    allPages: true,
    skipCache: true,
  });

  const statusName = detail.statusProperty;
  const nextReviewName = detail.nextReviewProperty;
  const statusCol = statusName
    ? detail.columns.find((c) => c.name === statusName)
    : undefined;
  const statusType =
    statusCol?.type === "status" ? ("status" as const) : ("select" as const);

  const touchStatus =
    opts.clearStatus === true || typeof opts.statusValue === "string";
  const touchDate =
    opts.clearNextReview === true || typeof opts.nextReviewValue === "string";

  const total = detail.rows.length;
  yield { type: "start", total };

  if (!touchStatus && !touchDate) {
    yield { type: "done", updated: 0, total };
    return;
  }

  let updated = 0;
  for (const row of detail.rows) {
    const updates: Parameters<typeof updatePageProperties>[1] = {};

    if (touchStatus && statusName) {
      updates.status = {
        property: statusName,
        type: statusType,
        value: opts.clearStatus ? null : (opts.statusValue ?? null),
      };
    }

    if (touchDate && nextReviewName) {
      updates.date = {
        property: nextReviewName,
        value: opts.clearNextReview ? null : (opts.nextReviewValue ?? null),
      };
    }

    if (updates.status || updates.date) {
      await updatePageProperties(row.id, updates, {
        dataSourceId,
        skipInvalidate: true,
      });
      updated++;
      yield { type: "progress", updated, total };
      await new Promise((r) => setTimeout(r, 120));
    }
  }

  invalidateDataSource(dataSourceId);
  yield { type: "done", updated, total };
}

export async function bulkUpdateDatabase(
  dataSourceId: string,
  opts: {
    statusValue?: string | null;
    clearStatus?: boolean;
    nextReviewValue?: string | null;
    clearNextReview?: boolean;
  },
): Promise<{ updated: number; total: number }> {
  let result = { updated: 0, total: 0 };
  for await (const ev of bulkUpdateDatabaseStream(dataSourceId, opts)) {
    if (ev.type === "done") result = { updated: ev.updated, total: ev.total };
    if (ev.type === "start") result = { updated: 0, total: ev.total };
  }
  return result;
}

export async function addDatabaseProperty(
  dataSourceId: string,
  name: string,
  type:
    | "rich_text"
    | "number"
    | "select"
    | "multi_select"
    | "status"
    | "date"
    | "checkbox"
    | "url"
    | "email"
    | "phone_number",
  selectOptions?: string[],
) {
  const notion = getNotionClient();
  const options = (selectOptions?.length
    ? selectOptions
    : DEFAULT_STATUS_OPTIONS.map((o) => o.name)
  ).map((n, i) => ({
    name: n,
    color: (["default", "gray", "brown", "orange", "yellow", "green", "blue", "purple", "pink", "red"] as const)[
      i % 10
    ],
  }));

  let config: AnyRec;
  switch (type) {
    case "select":
      config = { select: { options } };
      break;
    case "multi_select":
      config = { multi_select: { options } };
      break;
    case "status":
      // Status type options are constrained; create select instead for custom options
      config = { select: { options } };
      break;
    case "rich_text":
      config = { rich_text: {} };
      break;
    case "number":
      config = { number: {} };
      break;
    case "date":
      config = { date: {} };
      break;
    case "checkbox":
      config = { checkbox: {} };
      break;
    case "url":
      config = { url: {} };
      break;
    case "email":
      config = { email: {} };
      break;
    case "phone_number":
      config = { phone_number: {} };
      break;
    default:
      config = { rich_text: {} };
  }

  const updated = (await notion.dataSources.update({
    data_source_id: dataSourceId,
    properties: { [name]: config },
  })) as AnyRec;

  invalidateDataSource(dataSourceId);
  return schemaToColumns(updated.properties ?? {});
}

function shouldIncludeReviseItem(
  statusVal: string | null,
  nextReview: string | null,
  includeNotStarted: boolean,
): { include: boolean; reason: ReviseItem["reason"] } {
  const done = isDoneStatus(statusVal);
  const today = new Date().toISOString().slice(0, 10);
  const due = nextReview ? nextReview.slice(0, 10) <= today : false;
  const inProgress = isInProgressStatus(statusVal);
  const statusLower = (statusVal ?? "").trim().toLowerCase();
  const toRevise =
    statusLower.includes("revise") || statusLower === "to revise";

  if (done && !due) return { include: false, reason: "not_done" };

  let reason: ReviseItem["reason"] = "not_done";
  if (!done && due) reason = "both";
  else if (due) reason = "due";

  if (includeNotStarted) return { include: true, reason };

  // Default SRS queue: due/overdue, in progress, or undated "to revise"
  if (due || inProgress) return { include: true, reason };
  if (toRevise && !nextReview) return { include: true, reason };
  return { include: false, reason };
}

export async function getCombinedReviseItems(opts?: {
  includeNotStarted?: boolean;
}): Promise<ReviseItem[]> {
  const includeNotStarted = opts?.includeNotStarted === true;
  const sources = await listDataSources();
  const settled = await Promise.allSettled(
    sources.map((source) =>
      getDatabaseDetail(source.id, { ensureTracking: true, allPages: true }),
    ),
  );

  const items: ReviseItem[] = [];

  for (const result of settled) {
    if (result.status !== "fulfilled") continue;
    const detail = result.value;
    const statusName = detail.statusProperty;
    const nextReviewName = detail.nextReviewProperty;
    const intervalName = detail.intervalProperty;
    if (!statusName || !nextReviewName) continue;

    const statusCol = detail.columns.find((c) => c.name === statusName);
    const statusType =
      statusCol?.type === "status" ? "status" : ("select" as const);

    for (const row of detail.rows) {
      const statusVal = row.properties[statusName]?.text ?? null;
      const statusColor = row.properties[statusName]?.color ?? null;
      const nextReview = row.properties[nextReviewName]?.text || null;
      const intervalDays = intervalName
        ? parseIntervalDays(row.properties[intervalName]?.text)
        : 0;
      const titleCol = detail.columns.find((c) => c.type === "title");
      const title = titleCol
        ? (row.properties[titleCol.name]?.text ?? "Untitled")
        : "Untitled";

      const { include, reason } = shouldIncludeReviseItem(
        statusVal,
        nextReview,
        includeNotStarted,
      );
      if (!include) continue;

      items.push({
        pageId: row.id,
        pageUrl: row.url,
        title,
        databaseId: detail.id,
        databaseName: detail.name,
        status: statusVal,
        statusColor,
        statusProperty: statusName,
        statusType,
        statusOptions: (statusCol?.options ?? []).map((o) => ({
          name: o.name,
          color: o.color,
        })),
        nextReview,
        nextReviewProperty: nextReviewName,
        intervalDays,
        intervalProperty: intervalName,
        reason,
      });
    }
  }

  items.sort((a, b) => {
    const da = a.nextReview ?? "9999-99-99";
    const db = b.nextReview ?? "9999-99-99";
    return da.localeCompare(db);
  });

  return items;
}

export type WeekPlanItem = {
  pageId: string;
  title: string;
  databaseId: string;
  databaseName: string;
  pageUrl: string;
  nextReviewProperty: string;
  status: string | null;
};

export type WeekPlanDay = {
  date: string;
  weekday: string;
  items: WeekPlanItem[];
};

export type WeekPlan = {
  startDate: string;
  endDate: string;
  scope: string;
  perDay: number;
  totalItems: number;
  days: WeekPlanDay[];
};

function startOfWeekMonday(from = new Date()): Date {
  const d = new Date(from);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0 Sun
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(iso: string, n: number): string {
  const d = new Date(iso + "T12:00:00");
  d.setDate(d.getDate() + n);
  return toISODate(d);
}

const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export async function createWeekPlan(opts: {
  databaseId?: string | null;
  perDay?: number;
  startDate?: string | null;
  includeNotStarted?: boolean;
}): Promise<WeekPlan> {
  const perDay = Math.min(Math.max(opts.perDay ?? 5, 1), 30);
  const start = opts.startDate?.trim()
    ? opts.startDate.trim()
    : toISODate(startOfWeekMonday());

  let items = await getCombinedReviseItems({
    includeNotStarted: opts.includeNotStarted === true,
  });
  if (opts.databaseId) {
    items = items.filter((i) => i.databaseId === opts.databaseId);
  }

  // Prefer due / not done items; already sorted by next review
  const pool = items.slice(0, perDay * 7);

  const days: WeekPlanDay[] = WEEKDAYS.map((weekday, i) => ({
    date: addDays(start, i),
    weekday,
    items: [],
  }));

  for (let i = 0; i < pool.length; i++) {
    const dayIndex = Math.floor(i / perDay);
    if (dayIndex >= 7) break;
    const item = pool[i];
    days[dayIndex].items.push({
      pageId: item.pageId,
      title: item.title,
      databaseId: item.databaseId,
      databaseName: item.databaseName,
      pageUrl: item.pageUrl,
      nextReviewProperty: item.nextReviewProperty,
      status: item.status,
    });
  }

  return {
    startDate: start,
    endDate: addDays(start, 6),
    scope: opts.databaseId ?? "combined",
    perDay,
    totalItems: days.reduce((s, d) => s + d.items.length, 0),
    days,
  };
}

export async function* applyWeekPlanDatesStream(
  plan: WeekPlan,
): AsyncGenerator<ProgressEvent> {
  const flat = plan.days.flatMap((day) =>
    day.items.map((item) => ({ item, date: day.date })),
  );
  const total = flat.length;
  yield { type: "start", total };

  let updated = 0;
  const touched = new Set<string>();
  for (const { item, date } of flat) {
    await updatePageProperties(
      item.pageId,
      { date: { property: item.nextReviewProperty, value: date } },
      { dataSourceId: item.databaseId, skipInvalidate: true },
    );
    touched.add(item.databaseId);
    updated++;
    yield { type: "progress", updated, total };
    await new Promise((r) => setTimeout(r, 120));
  }

  for (const id of touched) invalidateDataSource(id);
  yield { type: "done", updated, total };
}

export async function applyWeekPlanDates(
  plan: WeekPlan,
): Promise<{ updated: number }> {
  let updated = 0;
  for await (const ev of applyWeekPlanDatesStream(plan)) {
    if (ev.type === "done") updated = ev.updated;
  }
  return { updated };
}

export function ndjsonStream(
  generator: AsyncGenerator<ProgressEvent>,
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const event of generator) {
          controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
        }
        controller.close();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Stream failed";
        controller.enqueue(
          encoder.encode(`${JSON.stringify({ type: "error", message })}\n`),
        );
        controller.close();
      }
    },
  });
}
