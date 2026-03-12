import { NextResponse } from "next/server";
import { listChannels } from "@/lib/data";
import type { ApiError } from "@/lib/types";

export async function GET(): Promise<NextResponse> {
  try {
    const channels = await listChannels();
    return NextResponse.json(channels, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to read channels";
    const body: ApiError = { error: message };
    return NextResponse.json(body, { status: 500 });
  }
}
