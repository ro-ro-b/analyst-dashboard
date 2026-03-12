import { NextResponse } from "next/server";
import { getChannel } from "@/lib/data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const channel = await getChannel(slug);
    return NextResponse.json({ channel });
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === "ENOENT") {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    }
    console.error("Failed to load channel:", error);
    return NextResponse.json(
      { error: "Failed to load channel" },
      { status: 500 }
    );
  }
}
