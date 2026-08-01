import { NextResponse } from "next/server";
import { updatePageProperties } from "@/lib/data";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    await updatePageProperties(
      id,
      {
        status: body.status,
        date: body.date,
        number: body.number,
        text: body.text,
      },
      { dataSourceId: body.databaseId },
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update page";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
