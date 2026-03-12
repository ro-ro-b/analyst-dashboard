import { NextResponse } from "next/server";
import { getChannels } from "@/lib/data";
import { getCached, setCached } from "@/lib/cache";

export async function GET() {
  const cacheKey = "channels:all";
  const cached = getCached<ReturnType<typeof getChannels>>(cacheKey);
  if (cached) {
    return NextResponse.json(await cached);
  }

  const promise = getChannels();
  setCached(cacheKey, promise);

  try {
    const channels = await promise;
    return NextResponse.json(channels);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load channels" },
      { status: 500 }
    );
  }
}
