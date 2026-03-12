import { NextResponse } from "next/server";
import { getChannel } from "@/lib/data";
import { getCached, setCached } from "@/lib/cache";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const cacheKey = `channel:${slug}`;
  const cached = getCached<ReturnType<typeof getChannel>>(cacheKey);
  if (cached) {
    try {
      return NextResponse.json(await cached);
    } catch {
      // fall through to re-fetch
    }
  }

  const promise = getChannel(slug);
  setCached(cacheKey, promise);

  try {
    const channel = await promise;
    return NextResponse.json(channel);
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === "ENOENT") {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Failed to load channel" },
      { status: 500 }
    );
  }
}
