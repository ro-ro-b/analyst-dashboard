import { NextResponse } from "next/server";
import { getSummary } from "@/lib/data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string; filename: string }> }
) {
  try {
    const { slug, filename } = await params;
    const summary = await getSummary(slug, filename);
    return NextResponse.json({ summary });
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === "ENOENT") {
      return NextResponse.json({ error: "Summary not found" }, { status: 404 });
    }
    console.error("Failed to load summary:", error);
    return NextResponse.json(
      { error: "Failed to load summary" },
      { status: 500 }
    );
  }
}
