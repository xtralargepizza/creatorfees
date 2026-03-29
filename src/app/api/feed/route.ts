import { getBagsClient } from "@/lib/bags-api";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const client = getBagsClient();
    const feed = await client.getLaunchFeed();
    return NextResponse.json({ success: true, data: feed });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
