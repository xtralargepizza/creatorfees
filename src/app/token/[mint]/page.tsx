"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Creator {
  username: string;
  pfp: string;
  provider: string;
  providerUsername: string;
  royaltyBps: number;
  isCreator: boolean;
  wallet: string;
  bagsUsername: string;
  isAdmin: boolean;
  twitterUsername: string;
}

interface ClaimStat {
  wallet: string;
  tokenMint: string;
  totalClaimed: string;
}

interface ClaimEvent {
  wallet: string;
  isCreator: boolean;
  amount: string;
  signature: string;
  timestamp: number;
}

interface TokenData {
  tokenMint: string;
  lifetimeFees: string | null;
  creators: Creator[];
  claimStats: ClaimStat[];
  claimEvents: { events: ClaimEvent[] } | ClaimEvent[];
}

function getClaimEventsList(raw: TokenData["claimEvents"]): ClaimEvent[] {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object" && "events" in raw) return raw.events;
  return [];
}

function formatSol(lamports: number): string {
  const sol = lamports / 1e9;
  if (sol >= 1) return sol.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  if (sol >= 0.001) return sol.toFixed(6);
  return sol.toFixed(9);
}

function timeAgo(ts: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - ts;
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function TokenPage() {
  const params = useParams();
  const mint = params.mint as string;
  const [data, setData] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!mint) return;
    (async () => {
      try {
        const res = await fetch(`/api/token/${mint}`);
        const json = await res.json();
        if (json.success) setData(json.data);
        else setError(json.error || "Failed to fetch token data");
      } catch {
        setError("Network error");
      } finally {
        setLoading(false);
      }
    })();
  }, [mint]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-[var(--bg-card)]" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl border border-[var(--border)] bg-[var(--bg-card)]" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-xl border border-[var(--border)] bg-[var(--bg-card)]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-red-500/20 bg-red-500/5 p-12 text-center">
        <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-xl text-red-400">!</div>
        <h2 className="mb-2 text-lg font-semibold text-red-400">Error Loading Token</h2>
        <p className="text-sm text-[var(--text-secondary)]">{error}</p>
        <p className="mt-3 font-mono text-xs text-[var(--text-secondary)] break-all">{mint}</p>
        <a href="/" className="mt-6 inline-block rounded-lg bg-[var(--bg-card)] px-4 py-2 text-sm transition-colors hover:bg-[var(--bg-card-hover)]">
          Back to Search
        </a>
      </div>
    );
  }

  if (!data) return null;

  const feesLamports = data.lifetimeFees ? parseInt(data.lifetimeFees) : 0;
  const feesSol = feesLamports / 1e9;
  const events = getClaimEventsList(data.claimEvents);
  const totalClaimed = data.claimStats.reduce((sum, s) => sum + parseInt(s.totalClaimed || "0"), 0);
  const totalClaimedSol = totalClaimed / 1e9;
  const unclaimed = feesLamports - totalClaimed;
  const unclaimedSol = unclaimed / 1e9;
  const primaryCreator = data.creators.find((c) => c.isCreator) || data.creators[0];

  return (
    <div>
      {/* Breadcrumb */}
      <a href="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Search
      </a>

      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            {primaryCreator?.pfp && (
              <img src={primaryCreator.pfp} alt="" className="h-10 w-10 rounded-full" />
            )}
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Token Analytics</h1>
              {primaryCreator && (
                <p className="text-sm text-[var(--text-secondary)]">
                  Created by{" "}
                  <a
                    href={`https://x.com/${primaryCreator.twitterUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:underline"
                  >
                    @{primaryCreator.twitterUsername}
                  </a>
                </p>
              )}
            </div>
          </div>
          <p className="mt-2 font-mono text-xs text-[var(--text-secondary)] break-all">{mint}</p>
        </div>
        <a
          href={`https://bags.fm/${mint}?ref=crisnewtonx`}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-lg bg-purple-500/10 px-4 py-2 text-sm font-medium text-purple-400 transition-colors hover:bg-purple-500/20"
        >
          View on Bags.fm
        </a>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Lifetime Fees"
          value={feesSol > 0 ? `${formatSol(feesLamports)} SOL` : "0 SOL"}
          sub={feesLamports > 0 ? `${feesLamports.toLocaleString()} lamports` : "No fees generated yet"}
          color={feesSol > 0 ? "green" : "default"}
        />
        <StatCard
          label="Total Claimed"
          value={totalClaimedSol > 0 ? `${formatSol(totalClaimed)} SOL` : "0 SOL"}
          sub={`${data.claimStats.length} claimer(s)`}
          color={totalClaimedSol > 0 ? "blue" : "default"}
        />
        <StatCard
          label="Unclaimed"
          value={unclaimedSol > 0 ? `${formatSol(unclaimed)} SOL` : "0 SOL"}
          sub={unclaimedSol > 0 ? "Available to claim" : "All fees claimed"}
          color={unclaimedSol > 0 ? "yellow" : "default"}
        />
        <StatCard
          label="Claim Events"
          value={String(events.length)}
          sub={events.length > 0 ? `Last: ${timeAgo(events[0].timestamp)}` : "No claims yet"}
          color="default"
        />
      </div>

      {/* Fee Share Bar */}
      {feesSol > 0 && totalClaimed > 0 && (
        <div className="mb-8 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="font-medium">Fee Claim Progress</span>
            <span className="text-[var(--text-secondary)]">
              {((totalClaimed / feesLamports) * 100).toFixed(1)}% claimed
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-[var(--bg-primary)]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
              style={{ width: `${Math.min(100, (totalClaimed / feesLamports) * 100)}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-xs text-[var(--text-secondary)]">
            <span>Claimed: {formatSol(totalClaimed)} SOL</span>
            <span>Total: {formatSol(feesLamports)} SOL</span>
          </div>
        </div>
      )}

      {/* Creators */}
      {data.creators.length > 0 && (
        <Section title="Fee Share Configuration" count={data.creators.length}>
          <div className="space-y-3">
            {data.creators.map((creator, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] p-4">
                <div className="flex items-center gap-3">
                  {creator.pfp ? (
                    <img src={creator.pfp} alt="" className="h-10 w-10 rounded-full" />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10 text-sm font-bold text-purple-400">
                      {creator.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <a
                        href={`https://x.com/${creator.twitterUsername}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium hover:text-purple-400 transition-colors"
                      >
                        @{creator.twitterUsername || creator.username}
                      </a>
                      {creator.isCreator && (
                        <span className="rounded bg-purple-500/10 px-1.5 py-0.5 text-[10px] font-medium text-purple-400">
                          CREATOR
                        </span>
                      )}
                      {creator.isAdmin && (
                        <span className="rounded bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-medium text-blue-400">
                          ADMIN
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--text-secondary)]">
                      via {creator.provider} &middot; {(creator.royaltyBps / 100).toFixed(0)}% fee share
                    </p>
                  </div>
                </div>
                <span className="font-mono text-xs text-[var(--text-secondary)]">
                  {creator.wallet.slice(0, 6)}...{creator.wallet.slice(-4)}
                </span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Claim Stats */}
      {data.claimStats.length > 0 && (
        <Section title="Claim Statistics" count={data.claimStats.length}>
          <div className="space-y-3">
            {data.claimStats.map((stat, i) => {
              const claimed = parseInt(stat.totalClaimed || "0");
              const pctOfTotal = feesLamports > 0 ? (claimed / feesLamports) * 100 : 0;
              return (
                <div key={i} className="rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm">
                      {stat.wallet.slice(0, 8)}...{stat.wallet.slice(-6)}
                    </span>
                    <span className="font-semibold text-green-400">
                      {formatSol(claimed)} SOL
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-card)]">
                    <div
                      className="h-full rounded-full bg-green-500/60"
                      style={{ width: `${Math.min(100, pctOfTotal)}%` }}
                    />
                  </div>
                  <p className="mt-1 text-right text-xs text-[var(--text-secondary)]">
                    {pctOfTotal.toFixed(1)}% of lifetime fees
                  </p>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* Claim Events Timeline */}
      {events.length > 0 && (
        <Section title="Claim History" count={events.length}>
          <div className="space-y-1">
            <div className="mb-2 grid grid-cols-[auto_1fr_1fr_1fr] gap-4 px-3 text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
              <span className="w-6" />
              <span>Wallet</span>
              <span className="text-right">Amount</span>
              <span className="text-right">When</span>
            </div>
            {events.map((event, i) => (
              <a
                key={i}
                href={`https://solscan.io/tx/${event.signature}`}
                target="_blank"
                rel="noopener noreferrer"
                className="grid grid-cols-[auto_1fr_1fr_1fr] items-center gap-4 rounded-lg px-3 py-2.5 transition-colors hover:bg-[var(--bg-primary)]"
              >
                <div className={`h-2 w-2 rounded-full ${event.isCreator ? "bg-purple-400" : "bg-green-400"}`} />
                <span className="font-mono text-sm">
                  {event.wallet.slice(0, 6)}...{event.wallet.slice(-4)}
                  {event.isCreator && (
                    <span className="ml-2 text-[10px] text-purple-400">creator</span>
                  )}
                </span>
                <span className="text-right font-mono text-sm font-medium text-green-400">
                  +{formatSol(parseInt(event.amount))} SOL
                </span>
                <span className="text-right text-xs text-[var(--text-secondary)]">
                  {timeAgo(event.timestamp)}
                </span>
              </a>
            ))}
          </div>
        </Section>
      )}

      {/* No Data */}
      {data.creators.length === 0 && data.claimStats.length === 0 && events.length === 0 && feesSol === 0 && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-12 text-center">
          <p className="text-lg font-medium text-[var(--text-secondary)]">No data available yet</p>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            This token may be very new or the mint address may not be a Bags token.
          </p>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  color: "green" | "blue" | "yellow" | "default";
}) {
  const colorMap = {
    green: "text-green-400",
    blue: "text-blue-400",
    yellow: "text-yellow-400",
    default: "",
  };

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">{label}</p>
      <p className={`mt-2 text-xl font-bold ${colorMap[color]}`}>{value}</p>
      <p className="mt-1 text-xs text-[var(--text-secondary)]">{sub}</p>
    </div>
  );
}

function Section({ title, children, count }: { title: string; children: React.ReactNode; count?: number }) {
  return (
    <div className="mb-8">
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-lg font-semibold">{title}</h2>
        {count !== undefined && (
          <span className="rounded-full bg-[var(--bg-card)] px-2 py-0.5 text-xs text-[var(--text-secondary)]">
            {count}
          </span>
        )}
      </div>
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">{children}</div>
    </div>
  );
}
