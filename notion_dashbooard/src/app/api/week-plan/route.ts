import { NextResponse } from "next/server";
import {
  applyWeekPlanDatesStream,
  createWeekPlan,
  ndjsonStream,
  WeekPlan,
} from "@/lib/data";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const databaseId = searchParams.get("db");
    const perDay = Number(searchParams.get("perDay") || 5);
    const startDate = searchParams.get("start");
    const includeNotStarted = searchParams.get("includeNotStarted") === "1";
    const plan = await createWeekPlan({
      databaseId,
      perDay: Number.isFinite(perDay) ? perDay : 5,
      startDate,
      includeNotStarted,
    });
    return NextResponse.json(plan);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to build week plan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.apply && body.plan) {
      const stream = ndjsonStream(
        applyWeekPlanDatesStream(body.plan as WeekPlan),
      );
      return new Response(stream, {
        headers: {
          "Content-Type": "application/x-ndjson; charset=utf-8",
          "Cache-Control": "no-cache",
        },
      });
    }

    const plan = await createWeekPlan({
      databaseId: body.databaseId ?? null,
      perDay: body.perDay ?? 5,
      startDate: body.startDate ?? null,
      includeNotStarted: body.includeNotStarted === true,
    });

    if (body.apply) {
      const stream = ndjsonStream(applyWeekPlanDatesStream(plan));
      return new Response(stream, {
        headers: {
          "Content-Type": "application/x-ndjson; charset=utf-8",
          "Cache-Control": "no-cache",
        },
      });
    }

    return NextResponse.json({ plan });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create week plan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
