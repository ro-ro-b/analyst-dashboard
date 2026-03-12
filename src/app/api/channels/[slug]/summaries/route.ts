import { NextResponse } from "next/server";
import { getSummaries } from "@/lib/data";
import { parseIntParam } from "@/lib/validators";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);

    const page = parseIntParam(searchParams.get("page"), 1, 1);
    const limit = parseIntParam(searchParams.get("limit"), 20, 1);

    const result = await getSummaries(slug, page, limit);
    return NextResponse.json(result);
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === "ENOENT") {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    }
    console.error("Failed to load summaries:", error);
    return NextResponse.json(
      { error: "Failed to load summaries" },
      { status: 500 }
    );
  }
}
