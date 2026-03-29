import { getBagsClient } from "@/lib/bags-api";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const client = getBagsClient();
    const { tokenMints } = await client.getAdminList(address);

    const mintsToQuery = tokenMints.slice(0, 20);
    const results = await Promise.allSettled(
      mintsToQuery.map((mint) => client.getLifetimeFees(mint))
    );

    const tokenData = mintsToQuery.map((mint, i) => {
      const result = results[i];
      return {
        mint,
        lifetimeFees:
          result.status === "fulfilled" ? result.value : null,
      };
    });

    return NextResponse.json({
      success: true,
      data: { wallet: address, tokenMints: tokenData },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
