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
        {[1,2,3,4].map(i => <div key={i} className="h-24 bg-[var(--surface-low)] animate-pulse" />)}
      </div>
      <div className="h-48 bg-[var(--surface-low)] animate-pulse" />
    </section>
  );

  if (error) return (
    <section className="px-6 md:px-8 pt-4 pb-16">
      <div className="max-w-md mx-auto border-2 border-red-200 bg-red-50 p-10 text-center">
        <p className="text-[13px] font-bold text-red-700 mb-2">Error</p>
        <p className="text-[11px] text-red-600">{error}</p>
        <p className="mt-3 font-mono text-[10px] text-red-400 break-all">{mint}</p>
        <a href="/" className="inline-block mt-4 py-2 px-6 border-2 border-red-300 text-[10px] font-bold uppercase tracking-[0.1em]">Back</a>
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
      <a href="/" className="inline-flex items-center gap-2 mb-6 text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--text-variant)] hover:text-[var(--text)] transition-colors">
        <span className="material-symbols-outlined text-sm">arrow_back</span>
        Back to Dashboard
      </a>

      {/* Hero Header */}
      <div className="mb-12">
        <h2 className="text-[12px] font-bold uppercase tracking-[0.3em] text-[var(--text-variant)] mb-4">
          Token Analytics
        </h2>
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-4 mb-3">
              {creator?.pfp && <img src={creator.pfp} alt="" className="w-12 h-12" />}
              <div>
                <h1 className="text-[36px] md:text-[48px] font-bold leading-[1.05] tracking-tighter text-[var(--text)]">
                  {feesSol > 0 ? fmtSol(feesLam) : "0"}{" "}
                  <span className="text-[var(--green)]">SOL</span>
                </h1>
                {creator && (
                  <p className="text-[11px] text-[var(--text-variant)]">
                    Created by{" "}
                    <a href={`https://x.com/${creator.twitterUsername}`} target="_blank" rel="noopener noreferrer" className="font-bold text-[var(--link)] hover:text-[var(--green)] transition-colors">
                      @{creator.twitterUsername}
                    </a>
                  </p>
                )}
              </div>
            </div>
            <p className="font-mono text-[10px] text-[var(--text-dim)] break-all">{mint}</p>
          </div>
          <a
            href={`https://bags.fm/${mint}?ref=crisnewtonx`}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 bg-[var(--green)] text-[var(--text)] font-bold py-3 px-6 text-[11px] tracking-[0.1em] uppercase hover:brightness-110 active:scale-95 transition-all text-center"
          >
            View on Bags.fm
          </a>
        </div>
      </div>

      {/* Bento Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-1 mb-12">
        <KPI label="Lifetime Fees" value={feesSol > 0 ? `${fmtSol(feesLam)} SOL` : "0 SOL"} green={feesSol > 0} />
        <KPI label="Total Claimed" value={totalClaimed > 0 ? `${fmtSol(totalClaimed)} SOL` : "0 SOL"} sub={`${data.claimStats.length} claimer(s)`} />
        <KPI label="Unclaimed" value={unclaimed > 0 ? `${fmtSol(unclaimed)} SOL` : "0 SOL"} warn={unclaimed > 0} />
        <KPI label="Claims" value={String(events.length)} sub={events.length > 0 ? `Last ${ago(events[0].timestamp)}` : "None"} />
      </div>

      {/* Distribution Progress */}
      {feesLam > 0 && totalClaimed > 0 && (
        <div className="bg-[var(--surface-low)] p-6 mb-12">
          <div className="flex justify-between mb-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--text-variant)]">
              Claim Progress
            </p>
            <p className="text-[10px] font-bold text-[var(--text)]">{claimPct.toFixed(1)}%</p>
          </div>
          <div className="bags-progress-bar">
            <div className="bags-progress-fill" style={{ width: `${Math.min(100, claimPct)}%` }} />
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-[var(--text-variant)]">
            <span>Claimed: {fmtSol(totalClaimed)} SOL</span>
            <span>Total: {fmtSol(feesLam)} SOL</span>
          </div>
        </div>
      )}

      {/* Fee Share Config */}
      {data.creators.length > 0 && (
        <div className="mb-12">
          <h2 className="text-[12px] font-bold uppercase tracking-[0.3em] text-[var(--text-variant)] mb-6">
            Fee Share Configuration
          </h2>
          <div className="space-y-1">
            {data.creators.map((c, i) => (
              <div key={i} className={`${i % 2 === 0 ? "bg-[var(--surface-low)]" : "bg-[var(--surface)]"} p-4 flex items-center justify-between`}>
                <div className="flex items-center gap-4">
                  {c.pfp ? (
                    <img src={c.pfp} alt="" className="w-10 h-10" />
                  ) : (
                    <div className="w-10 h-10 bg-[var(--green)]/10 flex items-center justify-center text-[14px] font-bold text-[var(--green)]">
                      {c.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <a href={`https://x.com/${c.twitterUsername}`} target="_blank" rel="noopener noreferrer" className="text-[12px] font-bold text-[var(--link)] hover:text-[var(--green)] transition-colors">
                        @{c.twitterUsername || c.username}
                      </a>
                      {c.isCreator && <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.06em] bg-[var(--green)]/10 text-[#00A020]">Creator</span>}
                      {c.isAdmin && <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.06em] bg-blue-500/10 text-blue-700">Admin</span>}
                    </div>
                    <p className="text-[10px] text-[var(--text-variant)]">
                      {c.provider} &middot; <span className="font-bold">{(c.royaltyBps / 100).toFixed(0)}% share</span>
                    </p>
                  </div>
                </div>
                <span className="font-mono text-[10px] text-[var(--text-dim)]">{c.wallet.slice(0, 6)}...{c.wallet.slice(-4)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Claim Stats */}
      {data.claimStats.length > 0 && (
        <div className="mb-12">
          <h2 className="text-[12px] font-bold uppercase tracking-[0.3em] text-[var(--text-variant)] mb-6">
            Claim Statistics
          </h2>
          <div className="space-y-1">
            {data.claimStats.map((stat, i) => {
              const claimed = parseInt(stat.totalClaimed || "0");
              const pct = feesLam > 0 ? (claimed / feesLam) * 100 : 0;
              return (
                <div key={i} className="bg-[var(--surface-low)] p-4">
                  <div className="flex justify-between mb-2">
                    <span className="font-mono text-[11px]">{stat.wallet.slice(0, 8)}...{stat.wallet.slice(-6)}</span>
                    <span className="text-[12px] font-bold text-[var(--green)]">{fmtSol(claimed)} SOL</span>
                  </div>
                  <div className="bags-progress-bar" style={{ height: "6px" }}>
                    <div className="bags-progress-fill" style={{ width: `${Math.min(100, pct)}%` }} />
                  </div>
                  <p className="mt-1 text-right text-[9px] font-bold text-[var(--text-dim)]">{pct.toFixed(1)}% of fees</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Claim History / Activity Feed */}
      {events.length > 0 && (
        <div className="pb-8">
          <h2 className="text-[12px] font-bold uppercase tracking-[0.3em] text-[var(--text-variant)] mb-6">
            Claim History
          </h2>
          <div className="space-y-1">
            {events.map((ev, i) => (
              <a
                key={i}
                href={`https://solscan.io/tx/${ev.signature}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-between p-4 transition-colors hover:bg-[var(--surface)] ${
                  i % 2 === 0 ? "bg-[var(--surface-low)]" : "bg-[var(--surface-low)]/50"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[var(--surface-highest)] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[var(--green)]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      payments
                    </span>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-[var(--text)] uppercase">Fee Claim</p>
                    <p className="text-[10px] text-[var(--text-variant)] uppercase">
                      {ago(ev.timestamp)} &middot; {ev.wallet.slice(0, 6)}...{ev.wallet.slice(-4)}
                      {ev.isCreator && <span className="ml-1 text-[var(--green)]">&middot; Creator</span>}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[12px] font-bold text-[var(--green)]">+{fmtSol(parseInt(ev.amount))} SOL</p>
                  <p className="text-[10px] text-[var(--text-variant)] uppercase">Fee Claimed</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {data.creators.length === 0 && data.claimStats.length === 0 && events.length === 0 && feesLam === 0 && (
        <div className="bg-[var(--surface-low)] p-12 text-center">
          <p className="text-[13px] font-bold text-[var(--text-variant)]">No data available</p>
          <p className="mt-1 text-[11px] text-[var(--text-dim)]">This token may be new or not a Bags token.</p>
        </div>
      )}
    </section>
  );
}

function KPI({ label, value, sub, green, warn }: { label: string; value: string; sub?: string; green?: boolean; warn?: boolean }) {
  const c = green ? "text-[var(--green)]" : warn ? "text-yellow-600" : "text-[var(--text)]";
  return (
    <div className="bg-[var(--surface-low)] p-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--text-variant)] mb-1">{label}</p>
      <p className={`text-[20px] md:text-[24px] font-bold ${c}`}>{value}</p>
      {sub && <p className="mt-0.5 text-[10px] text-[var(--text-dim)]">{sub}</p>}
    </div>
  );
}
