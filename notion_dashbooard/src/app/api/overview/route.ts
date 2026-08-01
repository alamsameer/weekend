import { NextResponse } from "next/server";
import { getOverviewStats } from "@/lib/data";

export async function GET() {
  try {
    const overview = await getOverviewStats();
    return NextResponse.json(overview);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load overview";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
