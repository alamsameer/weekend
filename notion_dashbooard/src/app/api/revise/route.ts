import { NextResponse } from "next/server";
import { getCombinedReviseItems } from "@/lib/data";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeNotStarted = searchParams.get("includeNotStarted") === "1";
    const items = await getCombinedReviseItems({ includeNotStarted });
    return NextResponse.json({ items });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load revise items";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
