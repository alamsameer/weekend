import { bulkUpdateDatabaseStream, ndjsonStream } from "@/lib/data";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const stream = ndjsonStream(
      bulkUpdateDatabaseStream(id, {
        statusValue: body.statusValue,
        clearStatus: body.clearStatus === true,
        nextReviewValue: body.nextReviewValue,
        clearNextReview: body.clearNextReview === true,
      }),
    );

    return new Response(stream, {
      headers: {
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Bulk update failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
