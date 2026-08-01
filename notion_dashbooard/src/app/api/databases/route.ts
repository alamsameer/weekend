import { NextResponse } from "next/server";
import { listDataSources } from "@/lib/data";

export async function GET() {
  try {
    const databases = await listDataSources();
    return NextResponse.json({ databases });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to list databases";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
