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

    // Fetch both admin list AND claimable positions in parallel
    const [adminResult, claimResult] = await Promise.allSettled([
      client.getAdminList(address),
      client.getClaimablePositions(address),
    ]);

    // Collect unique mints from both sources
    const mintSet = new Set<string>();

    if (adminResult.status === "fulfilled") {
      adminResult.value.tokenMints.forEach((m: string) => mintSet.add(m));
    }

    if (claimResult.status === "fulfilled") {
      const positions = Array.isArray(claimResult.value) ? claimResult.value : [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      positions.forEach((p: any) => {
        if (p.baseMint) mintSet.add(p.baseMint as string);
      });
    }

    const allMints = Array.from(mintSet).slice(0, 30);

    // Fetch lifetime fees for each mint
    const results = await Promise.allSettled(
      allMints.map((mint) => client.getLifetimeFees(mint))
    );

    const tokenData = allMints.map((mint, i) => ({
      mint,
      lifetimeFees: results[i].status === "fulfilled" ? results[i].value : null,
    }));

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
