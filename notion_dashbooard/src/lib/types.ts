export type PropertyType =
  | "title"
  | "rich_text"
  | "number"
  | "select"
  | "multi_select"
  | "status"
  | "date"
  | "checkbox"
  | "url"
  | "email"
  | "phone_number"
  | "people"
  | "files"
  | "relation"
  | "rollup"
  | "formula"
  | "created_time"
  | "created_by"
  | "last_edited_time"
  | "last_edited_by"
  | "unique_id"
  | "other";

export type ColumnMeta = {
  id: string;
  name: string;
  type: PropertyType;
  options?: { id: string; name: string; color: string }[];
};

export type CellValue = {
  type: PropertyType;
  text: string;
  raw: unknown;
  color?: string | null;
};

export type DatabaseSummary = {
  id: string;
  name: string;
  icon: string | null;
  url: string;
  lastEditedTime: string;
};

export type LabelCount = { label: string; value: number };

export type TrackerStats = {
  id: string;
  name: string;
  icon: string | null;
  total: number;
  done: number;
  inProgress: number;
  toRevise: number;
  byTopic: LabelCount[];
  byDifficulty: LabelCount[];
  byStatus: LabelCount[];
  byDatabase?: LabelCount[];
};

export type RowData = {
  id: string;
  url: string;
  properties: Record<string, CellValue>;
};

export type DatabaseDetail = {
  id: string;
  name: string;
  icon: string | null;
  url: string;
  columns: ColumnMeta[];
  rows: RowData[];
  hasMore: boolean;
  nextCursor: string | null;
  statusProperty: string | null;
  nextReviewProperty: string | null;
  intervalProperty: string | null;
};

export type ReviseItem = {
  pageId: string;
  pageUrl: string;
  title: string;
  databaseId: string;
  databaseName: string;
  status: string | null;
  statusColor: string | null;
  statusProperty: string;
  statusType: "status" | "select";
  statusOptions: { name: string; color: string }[];
  nextReview: string | null;
  nextReviewProperty: string;
  intervalDays: number;
  intervalProperty: string | null;
  reason: "due" | "not_done" | "both";
};

export type TodayFocusItem = {
  pageId: string;
  pageUrl: string;
  title: string;
  databaseId: string;
  databaseName: string;
  status: string | null;
  statusColor: string | null;
  statusProperty: string;
  statusType: "status" | "select";
  statusOptions: { name: string; color: string }[];
  nextReview: string | null;
  nextReviewProperty: string;
  intervalDays: number;
  intervalProperty: string | null;
  overdue: boolean;
};

export type TodayFocus = {
  date: string;
  inProgress: TodayFocusItem[];
  reviseToday: TodayFocusItem[];
};

export const STATUS_PROP_NAMES = ["status", "stat", "state"];
export const NEXT_REVIEW_PROP_NAMES = [
  "next review",
  "next revison",
  "next revise",
  "revision date",
  "next revision",
  "review date",
];
export const INTERVAL_PROP_NAMES = [
  "interval",
  "interval days",
  "srs interval",
  "rep interval",
];

export const DEFAULT_STATUS_OPTIONS = [
  { name: "To revise", color: "orange" as const },
  { name: "In progress", color: "blue" as const },
  { name: "Done", color: "green" as const },
];
