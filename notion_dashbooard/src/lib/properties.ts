import {
  ColumnMeta,
  CellValue,
  INTERVAL_PROP_NAMES,
  NEXT_REVIEW_PROP_NAMES,
  PropertyType,
  STATUS_PROP_NAMES,
} from "./types";
import { richTextToPlain } from "./notion";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyProp = any;

export function normalizePropType(type: string): PropertyType {
  const known: PropertyType[] = [
    "title",
    "rich_text",
    "number",
    "select",
    "multi_select",
    "status",
    "date",
    "checkbox",
    "url",
    "email",
    "phone_number",
    "people",
    "files",
    "relation",
    "rollup",
    "formula",
    "created_time",
    "created_by",
    "last_edited_time",
    "last_edited_by",
    "unique_id",
  ];
  return (known.includes(type as PropertyType) ? type : "other") as PropertyType;
}

export function findPropertyByAliases(
  columns: ColumnMeta[],
  aliases: string[],
  types?: PropertyType[],
): ColumnMeta | undefined {
  const lower = aliases.map((a) => a.toLowerCase());
  return columns.find((c) => {
    const nameOk = lower.includes(c.name.toLowerCase());
    const typeOk = !types || types.includes(c.type);
    return nameOk && typeOk;
  });
}

export function findStatusColumn(columns: ColumnMeta[]): ColumnMeta | undefined {
  return (
    findPropertyByAliases(columns, STATUS_PROP_NAMES, ["status", "select"]) ??
    columns.find((c) => c.type === "status")
  );
}

export function findNextReviewColumn(
  columns: ColumnMeta[],
): ColumnMeta | undefined {
  return (
    findPropertyByAliases(columns, NEXT_REVIEW_PROP_NAMES, ["date"]) ??
    columns.find(
      (c) =>
        c.type === "date" &&
        /next\s*rev|revision|review\s*date/i.test(c.name),
    )
  );
}

export function findIntervalColumn(
  columns: ColumnMeta[],
): ColumnMeta | undefined {
  return (
    findPropertyByAliases(columns, INTERVAL_PROP_NAMES, ["number"]) ??
    columns.find(
      (c) => c.type === "number" && /interval|srs|ease/i.test(c.name),
    )
  );
}

export function schemaToColumns(
  properties: Record<string, AnyProp>,
): ColumnMeta[] {
  return Object.entries(properties).map(([name, config]) => {
    const type = normalizePropType(config.type);
    let options: ColumnMeta["options"];
    if (type === "select") {
      options = (config.select?.options ?? []).map(
        (o: { id: string; name: string; color: string }) => ({
          id: o.id,
          name: o.name,
          color: o.color,
        }),
      );
    } else if (type === "status") {
      options = (config.status?.options ?? []).map(
        (o: { id: string; name: string; color: string }) => ({
          id: o.id,
          name: o.name,
          color: o.color,
        }),
      );
    } else if (type === "multi_select") {
      options = (config.multi_select?.options ?? []).map(
        (o: { id: string; name: string; color: string }) => ({
          id: o.id,
          name: o.name,
          color: o.color,
        }),
      );
    }
    return { id: config.id, name, type, options };
  });
}

export function formatPropertyValue(prop: AnyProp): CellValue {
  if (!prop) {
    return { type: "other", text: "", raw: null };
  }
  const type = normalizePropType(prop.type);
  switch (prop.type) {
    case "title":
      return { type, text: richTextToPlain(prop.title), raw: prop.title };
    case "rich_text":
      return {
        type,
        text: richTextToPlain(prop.rich_text),
        raw: prop.rich_text,
      };
    case "number":
      return {
        type,
        text: prop.number == null ? "" : String(prop.number),
        raw: prop.number,
      };
    case "select":
      return {
        type,
        text: prop.select?.name ?? "",
        raw: prop.select,
        color: prop.select?.color ?? null,
      };
    case "status":
      return {
        type,
        text: prop.status?.name ?? "",
        raw: prop.status,
        color: prop.status?.color ?? null,
      };
    case "multi_select":
      return {
        type,
        text: (prop.multi_select ?? []).map((o: { name: string }) => o.name).join(", "),
        raw: prop.multi_select,
      };
    case "date":
      return {
        type,
        text: prop.date?.start ?? "",
        raw: prop.date,
      };
    case "checkbox":
      return {
        type,
        text: prop.checkbox ? "Yes" : "No",
        raw: prop.checkbox,
      };
    case "url":
      return { type, text: prop.url ?? "", raw: prop.url };
    case "email":
      return { type, text: prop.email ?? "", raw: prop.email };
    case "phone_number":
      return {
        type,
        text: prop.phone_number ?? "",
        raw: prop.phone_number,
      };
    case "people":
      return {
        type,
        text: (prop.people ?? [])
          .map((p: { name?: string }) => p.name ?? "User")
          .join(", "),
        raw: prop.people,
      };
    case "formula": {
      const f = prop.formula;
      let text = "";
      if (f?.type === "string") text = f.string ?? "";
      else if (f?.type === "number") text = f.number == null ? "" : String(f.number);
      else if (f?.type === "boolean") text = f.boolean ? "Yes" : "No";
      else if (f?.type === "date") text = f.date?.start ?? "";
      return { type, text, raw: f };
    }
    case "created_time":
    case "last_edited_time":
      return {
        type,
        text: prop[prop.type] ? String(prop[prop.type]).slice(0, 10) : "",
        raw: prop[prop.type],
      };
    case "unique_id": {
      const prefix = prop.unique_id?.prefix;
      const number = prop.unique_id?.number;
      const text =
        number == null
          ? ""
          : prefix
            ? `${prefix}-${number}`
            : String(number);
      return { type, text, raw: prop.unique_id };
    }
    default:
      return { type: "other", text: "", raw: prop };
  }
}

export function pageToRow(page: AnyProp): {
  id: string;
  url: string;
  properties: Record<string, CellValue>;
} {
  const properties: Record<string, CellValue> = {};
  for (const [name, value] of Object.entries(page.properties ?? {})) {
    properties[name] = formatPropertyValue(value);
  }
  return {
    id: page.id,
    url: page.url ?? "",
    properties,
  };
}

export function isDoneStatus(value: string | null | undefined): boolean {
  if (!value) return false;
  const v = value.trim().toLowerCase();
  return v === "done" || v === "complete" || v === "completed";
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function isDueOrOverdue(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false;
  return dateStr.slice(0, 10) <= todayISO();
}
