import { getBagsClient } from "@/lib/bags-api";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const inputMint = searchParams.get("inputMint");
    const outputMint = searchParams.get("outputMint");
    const amount = searchParams.get("amount");

    if (!inputMint || !outputMint || !amount) {
      return NextResponse.json(
        { success: false, error: "Missing required query params: inputMint, outputMint, amount" },
        { status: 400 }
      );
    }

    const client = getBagsClient();
    const quote = await client.getTradeQuote({
      inputMint,
      outputMint,
      amount: Number(amount),
    });
    return NextResponse.json({ success: true, data: quote });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
