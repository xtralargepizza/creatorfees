import { getBagsClient } from "@/lib/bags-api";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const provider = searchParams.get("provider");
    const username = searchParams.get("username");

    if (!provider || !username) {
      return NextResponse.json(
        { success: false, error: "Missing required query params: provider, username" },
        { status: 400 }
      );
    }

    const client = getBagsClient();
    const result = await client.getFeeShareWallet(provider, username);
    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
