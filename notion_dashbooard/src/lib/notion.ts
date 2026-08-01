import { Client } from "@notionhq/client";

export function getNotionClient() {
  const token = process.env.NOTION_TOKEN;
  if (!token) {
    throw new Error("NOTION_TOKEN is not set in .env.local");
  }
  return new Client({ auth: token });
}

export function richTextToPlain(
  items: Array<{ plain_text?: string }> | undefined | null,
): string {
  if (!items?.length) return "";
  return items.map((t) => t.plain_text ?? "").join("");
}
