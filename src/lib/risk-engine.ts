/**
 * Risk Scoring Engine for Bags Tokens
 *
 * Analyzes tokens across multiple dimensions and produces a 0-100 risk score.
 * Lower = safer, Higher = riskier.
 */

import type { TokenLaunchFeedItem } from "./bags-api";

export interface RiskReport {
  score: number;           // 0-100 overall risk score
  grade: "A" | "B" | "C" | "D" | "F";
  signals: RiskSignal[];
  summary: string;
  tokenMint: string;
  tokenName: string;
  tokenSymbol: string;
  status: string;
  analyzedAt: number;
}

export interface RiskSignal {
  name: string;
  category: "positive" | "warning" | "danger";
  weight: number;       // how much this affects the score
  description: string;
}

export interface OnchainData {
  topHolders: { address: string; pct: number }[];
  totalHolders: number;
  volume24h: number;          // in SOL
  marketCapSol: number;
  lpLocked: boolean;
  mintAuthorityEnabled: boolean;
  freezeAuthorityEnabled: boolean;
  creatorBalance: number;     // % of supply held by creator
  ageMinutes: number;
}

/**
 * Analyze a token and produce a risk report.
 * Combines on-chain data with Bags metadata.
 */
export function analyzeToken(
  token: TokenLaunchFeedItem,
  onchain: OnchainData
): RiskReport {
  const signals: RiskSignal[] = [];

  // ─── Holder Concentration ───────────────────────────────
  const top10Pct = onchain.topHolders
    .slice(0, 10)
    .reduce((sum, h) => sum + h.pct, 0);

  if (top10Pct > 80) {
    signals.push({
      name: "Extreme Concentration",
      category: "danger",
      weight: 30,
      description: `Top 10 holders own ${top10Pct.toFixed(1)}% of supply`,
    });
  } else if (top10Pct > 50) {
    signals.push({
      name: "High Concentration",
      category: "warning",
      weight: 15,
      description: `Top 10 holders own ${top10Pct.toFixed(1)}% of supply`,
    });
  } else {
    signals.push({
      name: "Healthy Distribution",
      category: "positive",
      weight: -10,
      description: `Top 10 holders own ${top10Pct.toFixed(1)}% — well distributed`,
    });
  }

  // ─── Whale Detection ───────────────────────────────────
  const whales = onchain.topHolders.filter((h) => h.pct > 10);
  if (whales.length > 0) {
    signals.push({
      name: `${whales.length} Whale(s) Detected`,
      category: whales.length >= 3 ? "danger" : "warning",
      weight: whales.length * 10,
      description: `${whales.length} wallet(s) hold >10% of supply each`,
    });
  }

  // ─── Creator Holdings ──────────────────────────────────
  if (onchain.creatorBalance > 20) {
    signals.push({
      name: "Creator Holds Large Bag",
      category: "danger",
      weight: 20,
      description: `Creator still holds ${onchain.creatorBalance.toFixed(1)}% of supply`,
    });
  } else if (onchain.creatorBalance > 5) {
    signals.push({
      name: "Creator Holdings Moderate",
      category: "warning",
      weight: 8,
      description: `Creator holds ${onchain.creatorBalance.toFixed(1)}% of supply`,
    });
  }

  // ─── Mint/Freeze Authority ─────────────────────────────
  if (onchain.mintAuthorityEnabled) {
    signals.push({
      name: "Mint Authority Active",
      category: "danger",
      weight: 25,
      description: "Token supply can be inflated — mint authority not revoked",
    });
  }
  if (onchain.freezeAuthorityEnabled) {
    signals.push({
      name: "Freeze Authority Active",
      category: "danger",
      weight: 20,
      description: "Accounts can be frozen — freeze authority not revoked",
    });
  }

  // ─── Liquidity ─────────────────────────────────────────
  if (!onchain.lpLocked) {
    signals.push({
      name: "LP Not Locked",
      category: "warning",
      weight: 15,
      description: "Liquidity pool is not locked — rug pull possible",
    });
  } else {
    signals.push({
      name: "LP Locked",
      category: "positive",
      weight: -10,
      description: "Liquidity pool is locked",
    });
  }

  // ─── Volume ────────────────────────────────────────────
  if (onchain.volume24h > 100) {
    signals.push({
      name: "High Volume",
      category: "positive",
      weight: -5,
      description: `${onchain.volume24h.toFixed(1)} SOL 24h volume — active trading`,
    });
  } else if (onchain.volume24h < 1) {
    signals.push({
      name: "Dead Volume",
      category: "warning",
      weight: 10,
      description: "Less than 1 SOL traded in 24h",
    });
  }

  // ─── Holder Count ──────────────────────────────────────
  if (onchain.totalHolders < 10) {
    signals.push({
      name: "Very Few Holders",
      category: "danger",
      weight: 15,
      description: `Only ${onchain.totalHolders} holders — extremely early or abandoned`,
    });
  } else if (onchain.totalHolders > 100) {
    signals.push({
      name: "Growing Community",
      category: "positive",
      weight: -5,
      description: `${onchain.totalHolders} holders — decent community size`,
    });
  }

  // ─── Age ───────────────────────────────────────────────
  if (onchain.ageMinutes < 5) {
    signals.push({
      name: "Brand New",
      category: "warning",
      weight: 10,
      description: "Token launched less than 5 minutes ago",
    });
  }

  // ─── Social Presence ──────────────────────────────────
  if (token.twitter) {
    signals.push({
      name: "Has Twitter",
      category: "positive",
      weight: -3,
      description: "Token has a linked Twitter account",
    });
  }
  if (token.website) {
    signals.push({
      name: "Has Website",
      category: "positive",
      weight: -3,
      description: "Token has a linked website",
    });
  }

  // ─── Bags Status ──────────────────────────────────────
  if (token.status === "MIGRATED") {
    signals.push({
      name: "Graduated",
      category: "positive",
      weight: -10,
      description: "Token has graduated from bonding curve to DEX",
    });
  }

  // ─── Calculate Score ──────────────────────────────────
  const rawScore = signals.reduce((sum, s) => sum + s.weight, 50);
  const score = Math.max(0, Math.min(100, rawScore));

  const grade: RiskReport["grade"] =
    score <= 20 ? "A" :
    score <= 40 ? "B" :
    score <= 60 ? "C" :
    score <= 80 ? "D" : "F";

  const dangerCount = signals.filter((s) => s.category === "danger").length;
  const warningCount = signals.filter((s) => s.category === "warning").length;

  const summary =
    dangerCount === 0 && warningCount === 0
      ? `${token.symbol} looks clean — no major red flags detected.`
      : dangerCount > 0
        ? `${token.symbol} has ${dangerCount} critical risk(s). Proceed with extreme caution.`
        : `${token.symbol} has ${warningCount} warning(s). Review before trading.`;

  return {
    score,
    grade,
    signals,
    summary,
    tokenMint: token.tokenMint,
    tokenName: token.name,
    tokenSymbol: token.symbol,
    status: token.status,
    analyzedAt: Date.now(),
  };
}

/**
 * Quick risk score from just Bags metadata (no on-chain data needed).
 * Useful for the launch feed overview.
 */
export function quickScore(token: TokenLaunchFeedItem): {
  score: number;
  grade: RiskReport["grade"];
  flags: string[];
} {
  let score = 50;
  const flags: string[] = [];

  if (token.status === "MIGRATED") { score -= 15; flags.push("Graduated"); }
  if (token.status === "PRE_LAUNCH") { score += 10; flags.push("Pre-launch"); }
  if (token.twitter) { score -= 5; flags.push("Has Twitter"); }
  if (token.website) { score -= 5; flags.push("Has Website"); }
  if (!token.twitter && !token.website) { score += 10; flags.push("No socials"); }
  if (!token.description || token.description.length < 20) { score += 5; flags.push("Thin description"); }

  score = Math.max(0, Math.min(100, score));

  const grade: RiskReport["grade"] =
    score <= 20 ? "A" :
    score <= 40 ? "B" :
    score <= 60 ? "C" :
    score <= 80 ? "D" : "F";

  return { score, grade, flags };
}
