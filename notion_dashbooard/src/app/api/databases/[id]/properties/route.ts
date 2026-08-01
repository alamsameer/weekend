import { NextResponse } from "next/server";
import { addDatabaseProperty } from "@/lib/data";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const type = body.type as string;
    const selectOptions = Array.isArray(body.options)
      ? body.options.map(String)
      : undefined;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const allowed = [
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
    ] as const;

    if (!allowed.includes(type as (typeof allowed)[number])) {
      return NextResponse.json({ error: "Invalid property type" }, { status: 400 });
    }

    const columns = await addDatabaseProperty(
      id,
      name,
      type as (typeof allowed)[number],
      selectOptions,
    );
    return NextResponse.json({ columns });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to add property";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
