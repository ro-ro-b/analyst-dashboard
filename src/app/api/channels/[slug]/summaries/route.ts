import { NextResponse } from "next/server";
import { getSummaries } from "@/lib/data";
import { getCached, setCached } from "@/lib/cache";
import { parseIntParam } from "@/lib/validators";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { searchParams } = new URL(request.url);

  const page = parseIntParam(searchParams.get("page"), 1, 1);
  const limit = parseIntParam(searchParams.get("limit"), 20, 1);

  const cacheKey = `summaries:${slug}:${page}:${limit}`;
  const cached = getCached<ReturnType<typeof getSummaries>>(cacheKey);
  if (cached) {
    try {
      return NextResponse.json(await cached);
    } catch {
      // fall through
    }
  }

  const promise = getSummaries(slug, page, limit);
  setCached(cacheKey, promise);

  try {
    const result = await promise;
    return NextResponse.json(result);
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === "ENOENT") {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Failed to load summaries" },
      { status: 500 }
    );
  }
}
