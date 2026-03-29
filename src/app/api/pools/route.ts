import { getBagsClient } from "@/lib/bags-api";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const onlyMigrated = searchParams.get("onlyMigrated");

    const client = getBagsClient();
    const pools = await client.getAllPools(onlyMigrated === "true");
    return NextResponse.json({ success: true, data: pools });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
