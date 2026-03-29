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

function getEvents(raw: TokenData["claimEvents"]): ClaimEvent[] {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object" && "events" in raw) return raw.events;
  return [];
}

function fmtSol(lamports: number): string {
  const sol = lamports / 1e9;
  if (sol >= 1) return sol.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  if (sol >= 0.001) return sol.toFixed(6);
  return sol.toFixed(9);
}

function ago(ts: number): string {
  const d = Math.floor(Date.now() / 1000) - ts;
  if (d < 60) return `${d}s ago`;
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
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
        else setError(json.error || "Failed to load");
      } catch {
        setError("Network error");
      } finally {
        setLoading(false);
      }
    })();
  }, [mint]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-48 animate-pulse bg-[var(--border)]" />
        <div className="grid grid-cols-4 gap-[1px] bg-[var(--border)]">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-20 animate-pulse bg-[var(--bg-card)]" />)}
        </div>
        <div className="h-48 animate-pulse bg-[var(--bg-card)] border border-[var(--border)]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md border border-red-200 bg-red-50 p-10 text-center">
        <p className="text-[13px] font-bold text-red-700">Error</p>
        <p className="mt-1 text-[11px] text-red-600">{error}</p>
        <p className="mt-3 font-mono text-[10px] text-red-400 break-all">{mint}</p>
        <a href="/" className="btn-secondary mt-5 inline-block text-[10px]">Back</a>
      </div>
    );
  }

  if (!data) return null;

  const feesLamports = data.lifetimeFees ? parseInt(data.lifetimeFees) : 0;
  const events = getEvents(data.claimEvents);
  const totalClaimed = data.claimStats.reduce((s, c) => s + parseInt(c.totalClaimed || "0"), 0);
  const unclaimed = feesLamports - totalClaimed;
  const claimPct = feesLamports > 0 ? (totalClaimed / feesLamports) * 100 : 0;
  const primaryCreator = data.creators.find((c) => c.isCreator) || data.creators[0];

  return (
    <div>
      {/* Back */}
      <a href="/" className="mb-4 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.06em] text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors">
        &larr; BACK
      </a>

      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            {primaryCreator?.pfp && (
              <img src={primaryCreator.pfp} alt="" className="h-8 w-8" />
            )}
            <div>
              <h1 className="text-[24px] font-bold tracking-[-0.02em]">Token Analytics</h1>
              {primaryCreator && (
                <p className="text-[11px] text-[var(--text-secondary)]">
                  by{" "}
                  <a
                    href={`https://x.com/${primaryCreator.twitterUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-[var(--link)] hover:underline"
                  >
                    @{primaryCreator.twitterUsername}
                  </a>
                </p>
              )}
            </div>
          </div>
          <p className="mt-1.5 font-mono text-[10px] text-[var(--text-tertiary)] break-all">{mint}</p>
        </div>
        <a
          href={`https://bags.fm/${mint}?ref=crisnewtonx`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary text-[10px] py-1.5 px-4"
        >
          VIEW ON BAGS
        </a>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-[1px] bg-[var(--border)] lg:grid-cols-4">
        <KPI label="LIFETIME FEES" value={feesLamports > 0 ? `${fmtSol(feesLamports)} SOL` : "0 SOL"} color={feesLamports > 0 ? "green" : ""} />
        <KPI label="TOTAL CLAIMED" value={totalClaimed > 0 ? `${fmtSol(totalClaimed)} SOL` : "0 SOL"} sub={`${data.claimStats.length} claimer(s)`} />
        <KPI label="UNCLAIMED" value={unclaimed > 0 ? `${fmtSol(unclaimed)} SOL` : "0 SOL"} color={unclaimed > 0 ? "yellow" : ""} />
        <KPI label="CLAIM EVENTS" value={String(events.length)} sub={events.length > 0 ? `Last ${ago(events[0].timestamp)}` : ""} />
      </div>

      {/* Progress Bar */}
      {feesLamports > 0 && totalClaimed > 0 && (
        <div className="mb-6 border border-[var(--border)] bg-[var(--bg-card)] p-4">
          <div className="mb-2 flex justify-between text-[10px] font-bold uppercase tracking-[0.06em]">
            <span className="text-[var(--text-secondary)]">Claim Progress</span>
            <span className="text-[var(--text)]">{claimPct.toFixed(1)}%</span>
          </div>
          <div className="h-2 w-full bg-[var(--bg)]">
            <div
              className="h-full bg-[var(--green)] transition-all"
              style={{ width: `${Math.min(100, claimPct)}%` }}
            />
          </div>
          <div className="mt-1.5 flex justify-between text-[10px] text-[var(--text-tertiary)]">
            <span>Claimed: {fmtSol(totalClaimed)}</span>
            <span>Total: {fmtSol(feesLamports)}</span>
          </div>
        </div>
      )}

      {/* Creators */}
      {data.creators.length > 0 && (
        <Section title="FEE SHARE CONFIG" count={data.creators.length}>
          {data.creators.map((c, i) => (
            <div key={i} className="flex items-center justify-between border-b border-[var(--border)] last:border-0 py-3 px-1">
              <div className="flex items-center gap-3">
                {c.pfp ? (
                  <img src={c.pfp} alt="" className="h-8 w-8" />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center bg-[var(--green-light)] text-[12px] font-bold text-[var(--green)]">
                    {c.username.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`https://x.com/${c.twitterUsername}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[12px] font-bold text-[var(--link)] hover:underline"
                    >
                      @{c.twitterUsername || c.username}
                    </a>
                    {c.isCreator && <span className="badge badge-green">CREATOR</span>}
                    {c.isAdmin && <span className="badge badge-blue">ADMIN</span>}
                  </div>
                  <p className="text-[10px] text-[var(--text-tertiary)]">
                    {c.provider} &middot; {(c.royaltyBps / 100).toFixed(0)}% share
                  </p>
                </div>
              </div>
              <span className="font-mono text-[10px] text-[var(--text-tertiary)]">
                {c.wallet.slice(0, 6)}...{c.wallet.slice(-4)}
              </span>
            </div>
          ))}
        </Section>
      )}

      {/* Claim Stats */}
      {data.claimStats.length > 0 && (
        <Section title="CLAIM STATISTICS" count={data.claimStats.length}>
          {data.claimStats.map((stat, i) => {
            const claimed = parseInt(stat.totalClaimed || "0");
            const pct = feesLamports > 0 ? (claimed / feesLamports) * 100 : 0;
            return (
              <div key={i} className="border-b border-[var(--border)] last:border-0 py-3 px-1">
                <div className="flex justify-between mb-1.5">
                  <span className="font-mono text-[11px] text-[var(--text)]">
                    {stat.wallet.slice(0, 8)}...{stat.wallet.slice(-6)}
                  </span>
                  <span className="text-[12px] font-bold text-[var(--green)]">
                    {fmtSol(claimed)} SOL
                  </span>
                </div>
                <div className="h-1 w-full bg-[var(--bg)]">
                  <div className="h-full bg-[var(--green)]" style={{ width: `${Math.min(100, pct)}%` }} />
                </div>
                <p className="mt-1 text-right text-[9px] font-medium text-[var(--text-tertiary)]">
                  {pct.toFixed(1)}% of lifetime fees
                </p>
              </div>
            );
          })}
        </Section>
      )}

      {/* Claim Events */}
      {events.length > 0 && (
        <Section title="CLAIM HISTORY" count={events.length}>
          {/* Table Header */}
          <div className="grid grid-cols-[12px_1fr_1fr_80px] gap-3 px-1 py-2 text-[9px] font-bold uppercase tracking-[0.08em] text-[var(--text-tertiary)] border-b border-[var(--border)]">
            <span />
            <span>WALLET</span>
            <span className="text-right">AMOUNT</span>
            <span className="text-right">WHEN</span>
          </div>
          {events.map((ev, i) => (
            <a
              key={i}
              href={`https://solscan.io/tx/${ev.signature}`}
              target="_blank"
              rel="noopener noreferrer"
              className="grid grid-cols-[12px_1fr_1fr_80px] items-center gap-3 px-1 py-2.5 border-b border-[var(--border)] last:border-0 transition-colors hover:bg-[var(--bg)]"
            >
              <span className={`h-2 w-2 ${ev.isCreator ? "bg-[var(--green)]" : "bg-[var(--border-strong)]"}`} />
              <span className="font-mono text-[11px] text-[var(--text)]">
                {ev.wallet.slice(0, 6)}...{ev.wallet.slice(-4)}
                {ev.isCreator && <span className="ml-1.5 text-[9px] font-bold text-[var(--green)]">CREATOR</span>}
              </span>
              <span className="text-right font-mono text-[11px] font-bold text-[var(--green)]">
                +{fmtSol(parseInt(ev.amount))} SOL
              </span>
              <span className="text-right text-[10px] text-[var(--text-tertiary)]">
                {ago(ev.timestamp)}
              </span>
            </a>
          ))}
        </Section>
      )}

      {/* Empty */}
      {data.creators.length === 0 && data.claimStats.length === 0 && events.length === 0 && feesLamports === 0 && (
        <div className="border border-[var(--border)] bg-[var(--bg-card)] p-12 text-center">
          <p className="text-[13px] font-bold text-[var(--text-secondary)]">No data available</p>
          <p className="mt-1 text-[11px] text-[var(--text-tertiary)]">
            This token may be new or not a Bags token.
          </p>
        </div>
      )}
    </div>
  );
}

function KPI({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  const c = color === "green" ? "text-[var(--green)]" : color === "yellow" ? "text-[#B08C00]" : "text-[var(--text)]";
  return (
    <div className="bg-[var(--bg-card)] p-4">
      <p className="text-[9px] font-bold tracking-[0.08em] text-[var(--text-tertiary)]">{label}</p>
      <p className={`mt-1 text-[18px] font-bold ${c}`}>{value}</p>
      {sub && <p className="mt-0.5 text-[10px] text-[var(--text-tertiary)]">{sub}</p>}
    </div>
  );
}

function Section({ title, count, children }: { title: string; count?: number; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <div className="mb-2 flex items-center gap-2">
        <h2 className="text-[10px] font-bold tracking-[0.08em] text-[var(--text-secondary)]">{title}</h2>
        {count !== undefined && (
          <span className="text-[10px] font-bold text-[var(--text-tertiary)]">{count}</span>
        )}
      </div>
      <div className="border border-[var(--border)] bg-[var(--bg-card)] p-3">{children}</div>
    </div>
  );
}
