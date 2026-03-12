import { NextResponse } from "next/server";
import { getSummary } from "@/lib/data";
import { getCached, setCached } from "@/lib/cache";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string; filename: string }> }
) {
  const { slug, filename } = await params;

  const cacheKey = `summary:${slug}:${filename}`;
  const cached = getCached<ReturnType<typeof getSummary>>(cacheKey);
  if (cached) {
    try {
      return NextResponse.json(await cached);
    } catch {
      // fall through
    }
  }

  const promise = getSummary(slug, filename);
  setCached(cacheKey, promise);

  try {
    const summary = await promise;
    return NextResponse.json(summary);
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === "ENOENT") {
      return NextResponse.json({ error: "Summary not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Failed to load summary" },
      { status: 500 }
    );
  }
}
