import { getBagsClient } from "@/lib/bags-api";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 60;

interface PopularToken {
  name: string;
  symbol: string;
  image: string;
  tokenMint: string;
  status: string;
  twitter: string | null;
  website: string | null;
  lifetimeFees: string | null; // lamports
}

// Module-level cache with 60s TTL
let cachedData: PopularToken[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 60_000;

export async function GET() {
  try {
    const now = Date.now();

    if (cachedData && now - cacheTimestamp < CACHE_TTL_MS) {
      return NextResponse.json({ success: true, data: cachedData });
    }

    const client = getBagsClient();
    const feed = await client.getLaunchFeed();
    const tokens = feed.slice(0, 15);

    // Fetch lifetime fees in parallel; failures don't block
    const feeResults = await Promise.allSettled(
      tokens.map((t) => client.getLifetimeFees(t.tokenMint))
    );

    const combined: PopularToken[] = tokens.map((t, i) => {
      const feeResult = feeResults[i];
      return {
        name: t.name,
        symbol: t.symbol,
        image: t.image,
        tokenMint: t.tokenMint,
        status: t.status,
        twitter: t.twitter,
        website: t.website,
        lifetimeFees:
          feeResult.status === "fulfilled" ? feeResult.value : null,
      };
    });

    // Sort by lifetime fees descending; nulls go to bottom
    combined.sort((a, b) => {
      if (a.lifetimeFees === null && b.lifetimeFees === null) return 0;
      if (a.lifetimeFees === null) return 1;
      if (b.lifetimeFees === null) return -1;
      return BigInt(b.lifetimeFees) > BigInt(a.lifetimeFees)
        ? 1
        : BigInt(b.lifetimeFees) < BigInt(a.lifetimeFees)
          ? -1
          : 0;
    });

    cachedData = combined;
    cacheTimestamp = now;

    return NextResponse.json({ success: true, data: combined });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
