import { NextResponse } from "next/server";
import { getSummary } from "@/lib/data";
import { isSafeSlug, isSafeFilename, ensureMdExtension } from "@/lib/validators";
import type { ApiError } from "@/lib/types";

interface RouteParams {
  params: Promise<{ slug: string; filename: string }>;
}

export async function GET(_request: Request, { params }: RouteParams): Promise<NextResponse> {
  const { slug, filename } = await params;

  if (!isSafeSlug(slug)) {
    const body: ApiError = { error: "Invalid channel slug" };
    return NextResponse.json(body, { status: 404 });
  }

  if (!isSafeFilename(filename)) {
    const body: ApiError = { error: "Invalid filename" };
    return NextResponse.json(body, { status: 404 });
  }

  const safeFilename = ensureMdExtension(filename);

  try {
    const summary = await getSummary(slug, safeFilename);
    return NextResponse.json(summary, { status: 200 });
  } catch (err) {
    const isNotFound =
      err instanceof Error &&
      ((err as NodeJS.ErrnoException).code === "ENOENT" ||
        err.message.includes("not found"));

    if (isNotFound) {
      const body: ApiError = { error: `Not found: ${slug}/${filename}` };
      return NextResponse.json(body, { status: 404 });
    }

    const message = err instanceof Error ? err.message : "Failed to parse summary";
    const body: ApiError = { error: message };
    return NextResponse.json(body, { status: 500 });
  }
}
