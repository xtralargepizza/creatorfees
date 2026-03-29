import { getBagsClient } from "@/lib/bags-api";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ mint: string }> }
) {
  const { mint } = await params;

  if (!mint || mint.length < 32) {
    return NextResponse.json(
      { success: false, error: "Invalid token mint" },
      { status: 400 }
    );
  }

  const client = getBagsClient();

  try {
    const [lifetimeFees, creators, claimStats, claimEvents] =
      await Promise.allSettled([
        client.getLifetimeFees(mint),
        client.getTokenCreators(mint),
        client.getClaimStats(mint),
        client.getClaimEvents(mint, 50),
      ]);

    return NextResponse.json({
      success: true,
      data: {
        tokenMint: mint,
        lifetimeFees:
          lifetimeFees.status === "fulfilled" ? lifetimeFees.value : null,
        creators:
          creators.status === "fulfilled" ? creators.value : [],
        claimStats:
          claimStats.status === "fulfilled" ? claimStats.value : [],
        claimEvents:
          claimEvents.status === "fulfilled" ? claimEvents.value : [],
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
