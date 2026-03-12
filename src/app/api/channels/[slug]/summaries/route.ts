import { NextResponse } from "next/server";
import { listSummaries } from "@/lib/data";
import { isSafeSlug, parseIntParam } from "@/lib/validators";
import type { ApiError } from "@/lib/types";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(request: Request, { params }: RouteParams): Promise<NextResponse> {
  const { slug } = await params;

  if (!isSafeSlug(slug)) {
    const body: ApiError = { error: "Invalid channel slug" };
    return NextResponse.json(body, { status: 404 });
  }

  const url = new URL(request.url);
  const limit = parseIntParam(url.searchParams.get("limit"), 20, 1);
  const offset = parseIntParam(url.searchParams.get("offset"), 0, 0);

  try {
    const result = await listSummaries(slug, limit, offset);
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    const isNotFound =
      err instanceof Error &&
      ((err as NodeJS.ErrnoException).code === "ENOENT" ||
        err.message.includes("not found"));

    if (isNotFound) {
      const body: ApiError = { error: `Channel not found: ${slug}` };
      return NextResponse.json(body, { status: 404 });
    }

    const message = err instanceof Error ? err.message : "Failed to read summaries";
    const body: ApiError = { error: message };
    return NextResponse.json(body, { status: 500 });
  }
}
