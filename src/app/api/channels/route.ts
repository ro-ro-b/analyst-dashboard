import { NextResponse } from "next/server";
import { getChannels } from "@/lib/data";

export async function GET() {
  try {
    const channels = await getChannels();
    return NextResponse.json({ channels });
  } catch (error) {
    console.error("Failed to load channels:", error);
    return NextResponse.json(
      { error: "Failed to load channels" },
      { status: 500 }
    );
  }
}
