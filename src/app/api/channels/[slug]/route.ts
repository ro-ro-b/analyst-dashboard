import { NextResponse } from "next/server";
import { getChannelDetail } from "@/lib/data";
import { isSafeSlug } from "@/lib/validators";
import type { ApiError } from "@/lib/types";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: Request, { params }: RouteParams): Promise<NextResponse> {
  const { slug } = await params;

  if (!isSafeSlug(slug)) {
    const body: ApiError = { error: "Invalid channel slug" };
    return NextResponse.json(body, { status: 404 });
  }

  try {
    const detail = await getChannelDetail(slug);
    return NextResponse.json(detail, { status: 200 });
  } catch (err) {
    const isNotFound =
      err instanceof Error &&
      ((err as NodeJS.ErrnoException).code === "ENOENT" ||
        err.message.includes("not found"));

    if (isNotFound) {
      const body: ApiError = { error: `Channel not found: ${slug}` };
      return NextResponse.json(body, { status: 404 });
    }

    const message = err instanceof Error ? err.message : "Failed to read channel";
    const body: ApiError = { error: message };
    return NextResponse.json(body, { status: 500 });
  }
}
