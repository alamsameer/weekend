import { NextResponse } from "next/server";
import { deleteDataSource, getDatabaseDetail } from "@/lib/data";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor") ?? undefined;
    const ensure = searchParams.get("ensure") !== "0";
    const allPages = searchParams.get("all") === "1";
    const detail = await getDatabaseDetail(id, {
      cursor,
      ensureTracking: ensure,
      allPages,
    });
    return NextResponse.json(detail);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load database";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    await deleteDataSource(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete database";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
