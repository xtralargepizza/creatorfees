"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Creator {
  username: string; pfp: string; provider: string; providerUsername: string;
  royaltyBps: number; isCreator: boolean; wallet: string; bagsUsername: string;
  isAdmin: boolean; twitterUsername: string;
}
interface ClaimStat { wallet: string; tokenMint: string; totalClaimed: string; }
interface ClaimEvent { wallet: string; isCreator: boolean; amount: string; signature: string; timestamp: number; }
interface TokenData {
  tokenMint: string; lifetimeFees: string | null; creators: Creator[];
  claimStats: ClaimStat[]; claimEvents: { events: ClaimEvent[] } | ClaimEvent[];
}

function getEvents(raw: TokenData["claimEvents"]): ClaimEvent[] {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object" && "events" in raw) return raw.events;
  return [];
}
function fmtSol(lam: number): string {
  const sol = lam / 1e9;
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
      } catch { setError("Network error"); }
      finally { setLoading(false); }
    })();
  }, [mint]);

  if (loading) return (
    <section className="px-6 md:px-8 pt-4 pb-16 space-y-4">
      <div className="h-8 w-48 bg-[var(--surface)] animate-pulse" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
        {[1,2,3,4].map(i => <div key={i} className="h-28 md:h-32 bg-[var(--surface-low)] animate-pulse" />)}
      </div>
      <div className="h-48 bg-[var(--surface-low)] animate-pulse" />
    </section>
  );

  if (error) return (
    <section className="px-6 md:px-8 pt-4 pb-16">
      <div className="max-w-md mx-auto border-2 border-[var(--error)]/30 bg-[var(--error)]/10 p-10 text-center">
        <p className="text-[13px] font-bold text-[var(--error)] mb-2">Error</p>
        <p className="text-[11px] text-[var(--error)]">{error}</p>
        <p className="mt-3 font-mono text-[10px] text-[var(--error)]/60 break-all">{mint}</p>
        <a href="/" className="inline-block mt-4 py-2 px-6 border-2 border-[var(--error)]/30 text-[10px] font-bold uppercase tracking-[0.1em]">Back</a>
      </div>
    </section>
  );

  if (!data) return null;

  const feesLam = data.lifetimeFees ? parseInt(data.lifetimeFees) : 0;
  const feesSol = feesLam / 1e9;
  const events = getEvents(data.claimEvents);
  const totalClaimed = data.claimStats.reduce((s, c) => s + parseInt(c.totalClaimed || "0"), 0);
  const unclaimed = feesLam - totalClaimed;
  const claimPct = feesLam > 0 ? (totalClaimed / feesLam) * 100 : 0;
  const creator = data.creators.find(c => c.isCreator) || data.creators[0];

  return (
    <section className="px-6 md:px-8 pt-4 pb-16">
      {/* Back */}
      <a
        href="/"
        className="inline-flex items-center gap-2 mb-8 py-2 px-4 border border-[var(--border)] bg-[var(--card)] text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--text-2)] hover:text-[var(--text)] hover:border-[var(--text)] transition-colors"
      >
        <span className="material-symbols-outlined text-base">arrow_back</span>
        Back to Dashboard
      </a>

      {/* Hero Header */}
      <div className="mb-12">
        <h2 className="text-[12px] font-bold uppercase tracking-[0.3em] text-[var(--text-2)] mb-4">
          Token Analytics
        </h2>
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-5 mb-3">
              {creator?.pfp && <img src={creator.pfp} alt="" className="w-12 h-12" />}
              <div>
                <h1 className="text-[40px] md:text-[56px] font-bold leading-[1] tracking-tighter text-[var(--text)]">
                  {feesSol > 0 ? fmtSol(feesLam) : "0"}{" "}
                  <span className="text-[var(--green)]">SOL</span>
                </h1>
                {creator && (
                  <p className="text-[12px] text-[var(--text-2)] mt-1">
                    Created by{" "}
                    <a href={`https://x.com/${creator.twitterUsername}`} target="_blank" rel="noopener noreferrer" className="font-bold text-[var(--link)] hover:text-[var(--green)] transition-colors">
                      @{creator.twitterUsername}
                    </a>
                  </p>
                )}
              </div>
            </div>
            <p className="font-mono text-[10px] text-[var(--text-3)] break-all mt-2">{mint}</p>
          </div>
          <a
            href={`https://bags.fm/${mint}?ref=crisnewtonx`}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 bg-[var(--green)] text-white font-bold py-4 px-8 text-[13px] tracking-[0.1em] uppercase hover:brightness-110 active:scale-95 transition-all text-center shadow-[0_2px_8px_rgba(0,214,43,0.3)]"
          >
            View on Bags.fm
          </a>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-1 mb-12">
        <KPI label="Lifetime Fees" value={feesSol > 0 ? `${fmtSol(feesLam)} SOL` : "0 SOL"} green={feesSol > 0} />
        <KPI label="Total Claimed" value={totalClaimed > 0 ? `${fmtSol(totalClaimed)} SOL` : "0 SOL"} sub={`${data.claimStats.length} claimer(s)`} />
        <KPI label="Unclaimed" value={unclaimed > 0 ? `${fmtSol(unclaimed)} SOL` : "0 SOL"} warn={unclaimed > 0} />
        <KPI label="Claims" value={String(events.length)} sub={events.length > 0 ? `Last ${ago(events[0].timestamp)}` : "None"} />
      </div>

      {/* Distribution Progress */}
      {feesLam > 0 && totalClaimed > 0 && (
        <div className="bg-[var(--card)] border border-[var(--border)] p-6 md:p-8 mb-12">
          <div className="flex justify-between mb-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--text-2)]">
              Claim Progress
            </p>
            <p className="text-[14px] font-bold text-[var(--text)]">{claimPct.toFixed(1)}%</p>
          </div>
          <div className="progress-bar h-3">
            <div className="progress-fill" style={{ width: `${Math.min(100, claimPct)}%` }} />
          </div>
          <div className="mt-3 flex justify-between text-[11px] text-[var(--text-2)]">
            <span>Claimed: <span className="font-bold text-[var(--green)]">{fmtSol(totalClaimed)} SOL</span></span>
            <span>Total: <span className="font-bold">{fmtSol(feesLam)} SOL</span></span>
          </div>
        </div>
      )}

      {/* Fee Share Config */}
      {data.creators.length > 0 && (
        <div className="mb-12">
          <h2 className="text-[12px] font-bold uppercase tracking-[0.3em] text-[var(--text-2)] mb-6">
            Fee Share Configuration
          </h2>
          <div className="space-y-1">
            {data.creators.map((c, i) => (
              <div key={i} className="bg-[var(--card)] border border-[var(--border)] p-5 md:p-6 flex items-center justify-between">
                <div className="flex items-center gap-4 md:gap-5">
                  {c.pfp ? (
                    <img src={c.pfp} alt="" className="w-12 h-12" />
                  ) : (
                    <div className="w-12 h-12 bg-[var(--green)]/10 flex items-center justify-center text-[16px] font-bold text-[var(--green)]">
                      {c.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <a href={`https://x.com/${c.twitterUsername}`} target="_blank" rel="noopener noreferrer" className="text-[13px] font-bold text-[var(--link)] hover:text-[var(--green)] transition-colors">
                        @{c.twitterUsername || c.username}
                      </a>
                      {c.isCreator && <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.06em] bg-[var(--green)]/10 text-[var(--green)]">Creator</span>}
                      {c.isAdmin && <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.06em] bg-blue-500/15 text-blue-400">Admin</span>}
                    </div>
                    <p className="text-[11px] text-[var(--text-2)] mt-1">
                      {c.provider} &middot; <span className="font-bold text-[var(--text)]">{(c.royaltyBps / 100).toFixed(0)}% share</span>
                    </p>
                  </div>
                </div>
                <span className="font-mono text-[10px] text-[var(--text-3)] hidden sm:inline">{c.wallet.slice(0, 6)}...{c.wallet.slice(-4)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Claim Stats */}
      {data.claimStats.length > 0 && (
        <div className="mb-12">
          <h2 className="text-[12px] font-bold uppercase tracking-[0.3em] text-[var(--text-2)] mb-6">
            Claim Statistics
          </h2>
          <div className="space-y-1">
            {data.claimStats.map((stat, i) => {
              const claimed = parseInt(stat.totalClaimed || "0");
              const pct = feesLam > 0 ? (claimed / feesLam) * 100 : 0;
              return (
                <div key={i} className="bg-[var(--card)] border border-[var(--border)] p-5 md:p-6">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-mono text-[11px] text-[var(--text-2)]">{stat.wallet.slice(0, 8)}...{stat.wallet.slice(-6)}</span>
                    <span className="text-[16px] md:text-[20px] font-bold text-[var(--green)]">{fmtSol(claimed)} SOL</span>
                  </div>
                  <div className="progress-bar h-3">
                    <div className="progress-fill" style={{ width: `${Math.min(100, pct)}%` }} />
                  </div>
                  <p className="mt-2 text-right text-[10px] font-bold text-[var(--text-3)]">{pct.toFixed(1)}% of fees</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Claim History / Activity Feed */}
      {events.length > 0 && (
        <div className="pb-8">
          <h2 className="text-[12px] font-bold uppercase tracking-[0.3em] text-[var(--text-2)] mb-6">
            Claim History
          </h2>
          <div className="space-y-1">
            {events.map((ev, i) => (
              <a
                key={i}
                href={`https://solscan.io/tx/${ev.signature}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-5 md:p-6 bg-[var(--card)] border border-[var(--border)] transition-colors hover:bg-[var(--surface)] block"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[var(--green)]/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[var(--green)] text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                      payments
                    </span>
                  </div>
                  <div>
                    <p className="text-[12px] font-bold text-[var(--text)] uppercase">Fee Claim</p>
                    <p className="text-[10px] text-[var(--text-2)] uppercase mt-0.5">
                      {ago(ev.timestamp)} &middot; {ev.wallet.slice(0, 6)}...{ev.wallet.slice(-4)}
                      {ev.isCreator && <span className="ml-1 text-[var(--green)]">&middot; Creator</span>}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className="text-[18px] md:text-[22px] font-bold text-[var(--green)] leading-tight">+{fmtSol(parseInt(ev.amount))} SOL</p>
                  <p className="text-[9px] text-[var(--text-2)] uppercase mt-0.5">Fee Claimed</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {data.creators.length === 0 && data.claimStats.length === 0 && events.length === 0 && feesLam === 0 && (
        <div className="bg-[var(--card)] border border-[var(--border)] p-12 text-center">
          <p className="text-[13px] font-bold text-[var(--text-2)]">No data available</p>
          <p className="mt-1 text-[11px] text-[var(--text-3)]">This token may be new or not a Bags token.</p>
        </div>
      )}
    </section>
  );
}

function KPI({ label, value, sub, green, warn }: { label: string; value: string; sub?: string; green?: boolean; warn?: boolean }) {
  const c = green ? "text-[var(--green)]" : warn ? "text-yellow-600" : "text-[var(--text)]";
  return (
    <div className="bg-[var(--card)] border border-[var(--border)] p-5 md:p-6">
      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--text-2)] mb-2">{label}</p>
      <p className={`text-[22px] md:text-[28px] font-bold leading-tight ${c}`}>{value}</p>
      {sub && <p className="mt-1 text-[10px] text-[var(--text-3)]">{sub}</p>}
    </div>
  );
}
