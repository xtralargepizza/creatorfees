/**
 * Bags API Client
 * Wraps the Bags public API v2 for token launch feed, trading, analytics, and fee management.
 */

const BASE_URL = "https://public-api-v2.bags.fm/api/v1";

export interface TokenLaunchFeedItem {
  name: string;
  symbol: string;
  description: string;
  image: string;
  tokenMint: string;
  status: "PRE_LAUNCH" | "PRE_GRAD" | "MIGRATING" | "MIGRATED";
  twitter: string | null;
  website: string | null;
  launchSignature: string | null;
  uri: string | null;
  dbcPoolKey: string | null;
  dbcConfigKey: string | null;
}

export interface TradeQuote {
  requestId: string;
  contextSlot: number;
  inAmount: string;
  inputMint: string;
  outAmount: string;
  outputMint: string;
  minOutAmount: string;
  priceImpactPct: string;
  slippageBps: number;
  routePlan: RoutePlanStep[];
  platformFee?: {
    amount: string;
    feeBps: number;
    feeAccount: string;
  };
}

export interface RoutePlanStep {
  venue: string;
  inAmount: string;
  outAmount: string;
  inputMint: string;
  outputMint: string;
  inputMintDecimals: number;
  outputMintDecimals: number;
  marketKey: string;
  data: string;
}

export interface SwapTransaction {
  swapTransaction: string;
  computeUnitLimit: number;
  lastValidBlockHeight: number;
  prioritizationFeeLamports: number;
}

export interface ClaimablePosition {
  tokenMint: string;
  [key: string]: unknown;
}

export interface TokenClaimStats {
  [key: string]: unknown;
}

export interface LifetimeFees {
  totalFeesLamports: string;
}

export interface PoolInfo {
  tokenMint: string;
  dbcPoolKey: string;
  dbcConfigKey: string;
  [key: string]: unknown;
}

export interface TokenCreator {
  provider: string;
  username: string;
  [key: string]: unknown;
}

interface ApiResponse<T> {
  success: boolean;
  response: T;
  error?: string;
}

export class BagsApiClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request<T>(
    method: "GET" | "POST",
    path: string,
    params?: Record<string, string>,
    body?: unknown
  ): Promise<T> {
    const url = new URL(`${BASE_URL}${path}`);
    if (params) {
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    }

    const res = await fetch(url.toString(), {
      method,
      headers: {
        "x-api-key": this.apiKey,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Bags API ${res.status}: ${text}`);
    }

    const data: ApiResponse<T> = await res.json();
    if (!data.success) {
      throw new Error(`Bags API error: ${data.error || "Unknown error"}`);
    }
    return data.response;
  }

  // ─── Launch Feed ───────────────────────────────────────────
  async getLaunchFeed(): Promise<TokenLaunchFeedItem[]> {
    return this.request<TokenLaunchFeedItem[]>("GET", "/token-launch/feed");
  }

  // ─── Analytics ─────────────────────────────────────────────
  async getLifetimeFees(tokenMint: string): Promise<string> {
    return this.request<string>("GET", "/token-launch/lifetime-fees", { tokenMint });
  }

  async getTokenCreators(tokenMint: string): Promise<TokenCreator[]> {
    return this.request<TokenCreator[]>("GET", "/token-launch/creator/v3", { tokenMint });
  }

  async getClaimStats(tokenMint: string): Promise<TokenClaimStats[]> {
    return this.request<TokenClaimStats[]>("GET", "/token-launch/claim-stats", { tokenMint });
  }

  async getClaimEvents(tokenMint: string, limit = 100, offset = 0) {
    return this.request("GET", "/fee-share/token/claim-events", {
      tokenMint,
      limit: String(limit),
      offset: String(offset),
    });
  }

  // ─── Pool Data ─────────────────────────────────────────────
  async getPools(): Promise<PoolInfo[]> {
    return this.request<PoolInfo[]>("GET", "/token-launch/pools");
  }

  async getPoolByMint(tokenMint: string): Promise<PoolInfo> {
    return this.request<PoolInfo>("GET", "/token-launch/pool", { tokenMint });
  }

  // ─── Trading ───────────────────────────────────────────────
  async getTradeQuote(params: {
    inputMint: string;
    outputMint: string;
    amount: number;
    slippageMode?: "auto" | "manual";
    slippageBps?: number;
  }): Promise<TradeQuote> {
    const queryParams: Record<string, string> = {
      inputMint: params.inputMint,
      outputMint: params.outputMint,
      amount: String(params.amount),
    };
    if (params.slippageMode) queryParams.slippageMode = params.slippageMode;
    if (params.slippageBps !== undefined) queryParams.slippageBps = String(params.slippageBps);

    return this.request<TradeQuote>("GET", "/trade/quote", queryParams);
  }

  async createSwapTransaction(
    quoteResponse: TradeQuote,
    userPublicKey: string
  ): Promise<SwapTransaction> {
    return this.request<SwapTransaction>("POST", "/trade/swap", undefined, {
      quoteResponse,
      userPublicKey,
    });
  }

  async sendTransaction(signedTransaction: string): Promise<string> {
    return this.request<string>("POST", "/trade/send-transaction", undefined, {
      signedTransaction,
    });
  }

  // ─── Fee Claiming ─────────────────────────────────────────
  async getClaimablePositions(wallet: string): Promise<ClaimablePosition[]> {
    return this.request<ClaimablePosition[]>("GET", "/token-launch/claimable-positions", {
      wallet,
    });
  }

  async getClaimTransactions(feeClaimer: string, tokenMint: string) {
    return this.request("POST", "/token-launch/claim-txs/v3", undefined, {
      feeClaimer,
      tokenMint,
    });
  }

  // ─── Fee Share Admin ────────────────────────────────────────
  async getAdminList(wallet: string): Promise<{ tokenMints: string[] }> {
    return this.request<{ tokenMints: string[] }>("GET", "/fee-share/admin/list", { wallet });
  }

  // ─── Social Wallet Lookup ─────────────────────────────────
  async getFeeShareWallet(provider: string, username: string) {
    return this.request("GET", "/token-launch/fee-share/wallet/v2", { provider, username });
  }

  async getFeeShareWalletBulk(items: { username: string; provider: string }[]) {
    return this.request("POST", "/token-launch/fee-share/wallet/v2/bulk", undefined, { items });
  }

  // ─── All Pools ─────────────────────────────────────────────
  async getAllPools(onlyMigrated = false): Promise<{ tokenMint: string; dbcPoolKey: string; dbcConfigKey: string; dammV2PoolKey: string | null }[]> {
    const params: Record<string, string> = {};
    if (onlyMigrated) params.onlyMigrated = "true";
    return this.request("GET", "/solana/bags/pools", params);
  }

  async getPoolByTokenMint(tokenMint: string) {
    return this.request("GET", "/solana/bags/pools/token-mint", { tokenMint });
  }

  // ─── Partner ───────────────────────────────────────────────
  async getPartnerStats(partner: string): Promise<{ claimedFees: string; unclaimedFees: string }> {
    return this.request("GET", "/fee-share/partner-config/stats", { partner });
  }

  // ─── DexScreener ──────────────────────────────────────────
  async checkDexScreenerAvailability(tokenAddress: string): Promise<{ available: boolean }> {
    return this.request("GET", "/solana/dexscreener/order-availability", { tokenAddress });
  }
}

// Singleton for server-side usage
let _client: BagsApiClient | null = null;

export function getBagsClient(): BagsApiClient {
  if (!_client) {
    const key = process.env.BAGS_API_KEY;
    if (!key) throw new Error("BAGS_API_KEY not set");
    _client = new BagsApiClient(key);
  }
  return _client;
}
