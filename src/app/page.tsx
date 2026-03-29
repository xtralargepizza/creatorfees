"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface Creator {
  username: string; pfp: string; provider: string; twitterUsername: string;
  royaltyBps: number; isCreator: boolean; isAdmin: boolean; wallet: string;
}
interface ClaimStat { wallet: string; tokenMint: string; totalClaimed: string; }
interface ClaimEvent { wallet: string; isCreator: boolean; amount: string; signature: string; timestamp: number; }
interface TokenData {
  tokenMint: string; lifetimeFees: string | null; creators: Creator[];
  claimStats: ClaimStat[]; claimEvents: { events: ClaimEvent[] } | ClaimEvent[];
}
interface Toast { id: number; message: string; amount: string; exiting?: boolean; }

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
function fmtDate(ts: number): string {
  return new Date(ts * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch(() => {});
}

// Donut chart colors
const DONUT_COLORS = ["#00D62B", "#33E155", "#66EC80", "#99F4AA", "#CCF9D4", "#E0FBE8"];

export default function Home() {
  const [mint, setMint] = useState("");
  const [data, setData] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [copied, setCopied] = useState(false);
  const prevEventsRef = useRef<string[]>([]);
  const toastId = useRef(0);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const addToast = useCallback((message: string, amount: string) => {
    const id = ++toastId.current;
    setToasts(prev => [...prev.slice(-4), { id, message, amount }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 300);
    }, 5000);
  }, []);

  const fetchToken = useCallback(async (address: string, isPolling = false) => {
    if (!isPolling) setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/token/${address}`);
      const json = await res.json();
      if (!json.success) { setError(json.error || "Failed to load"); return; }
      setData(json.data);
      const events = getEvents(json.data.claimEvents);
      const sigs = events.map((e: ClaimEvent) => e.signature);
      if (prevEventsRef.current.length > 0) {
        events.filter((e: ClaimEvent) => !prevEventsRef.current.includes(e.signature)).forEach((e: ClaimEvent) => {
          addToast(`${e.isCreator ? "Creator" : e.wallet.slice(0, 6) + "..."} claimed fees`, `+${fmtSol(parseInt(e.amount))} SOL`);
        });
      }
      prevEventsRef.current = sigs;
      if (!isPolling) setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch {
      if (!isPolling) setError("Network error");
    } finally {
      if (!isPolling) setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    if (!data?.tokenMint) return;
    pollRef.current = setInterval(() => fetchToken(data.tokenMint, true), 15000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [data?.tokenMint, fetchToken]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = mint.trim();
    if (!trimmed || trimmed.length < 32 || trimmed.length > 44) { setError("Enter a valid Bags token address"); return; }
    prevEventsRef.current = [];
    fetchToken(trimmed);
  };

  const handleCopy = () => {
    if (!data?.tokenMint) return;
    copyToClipboard(data.tokenMint);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const feesLam = data?.lifetimeFees ? parseInt(data.lifetimeFees) : 0;
  const feesSol = feesLam / 1e9;
  const events = data ? getEvents(data.claimEvents) : [];
  const totalClaimed = data?.claimStats.reduce((s, c) => s + parseInt(c.totalClaimed || "0"), 0) || 0;
  const unclaimed = feesLam - totalClaimed;
  const claimPct = feesLam > 0 ? (totalClaimed / feesLam) * 100 : 0;
  const creator = data?.creators.find(c => c.isCreator) || data?.creators[0];

  // Build cumulative fee data for chart from claim events
  const chartPoints = events.length > 0
    ? [...events].reverse().reduce<{ x: number; y: number }[]>((acc, ev) => {
        const prev = acc.length > 0 ? acc[acc.length - 1].y : 0;
        acc.push({ x: ev.timestamp, y: prev + parseInt(ev.amount) / 1e9 });
        return acc;
      }, [])
    : [];

  return (
    <>
      {/* Toasts */}
      <div className="fixed top-16 right-4 z-50 space-y-2 w-80">
        {toasts.map(t => (
          <div key={t.id} className={`${t.exiting ? "toast-exit" : "toast-enter"} bg-[var(--card)] border border-[var(--border)] p-4 shadow-lg flex items-center gap-3`} style={{ borderRadius: "12px", borderLeft: "3px solid var(--green)" }}>
            <div className="w-8 h-8 bg-[var(--green-10)] flex items-center justify-center shrink-0" style={{ borderRadius: "8px" }}>
              <span className="text-[var(--green)] text-[14px] font-bold">$</span>
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-bold text-[var(--text)] truncate">{t.message}</p>
              <p className="text-[13px] font-bold text-[var(--green)]">{t.amount}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center">
        {/* Hero — when no results */}
        {!data && !loading && (
          <div className="flex flex-col items-center justify-center text-center min-h-[65vh] w-full">
            <img src="/logo.svg" alt="CreatorFees" className="h-16 md:h-20 mb-6" />
            <h1 className="text-[42px] md:text-[56px] lg:text-[72px] font-bold leading-[1.05] tracking-tighter text-[var(--text)]">
              Creator Fee{" "}
              <span className="text-[var(--green)]">Dashboard</span>
            </h1>
            <p className="mt-4 text-[14px] md:text-[16px] text-[var(--text-secondary)] max-w-lg leading-relaxed">
              Track lifetime creator fees, claim history, and fee share analytics for any Bags.fm token.
            </p>

            {/* BIG search bar */}
            <form onSubmit={handleSearch} className="w-full max-w-2xl mt-10">
              <div className="flex items-center bg-[var(--card)] border-2 border-[var(--border)] focus-within:border-[var(--green)] transition-colors shadow-[0_4px_32px_rgba(0,0,0,0.06)]" style={{ borderRadius: "16px" }}>
                <input
                  type="text"
                  value={mint}
                  onChange={(e) => { setMint(e.target.value); setError(""); }}
                  placeholder="Paste Bags CA here..."
                  className="flex-1 bg-transparent px-6 md:px-8 py-5 md:py-6 text-[16px] md:text-[18px] text-[var(--text)] placeholder:text-[var(--text-dim)] outline-none font-mono"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[var(--green)] text-white font-bold px-8 md:px-10 py-5 md:py-6 text-[14px] md:text-[16px] uppercase tracking-[0.06em] hover:bg-[var(--green-hover)] active:scale-[0.98] transition-all disabled:opacity-50 shrink-0"
                  style={{ borderRadius: "0 14px 14px 0" }}
                >
                  {loading ? "..." : "Check Fees"}
                </button>
              </div>
              {error && <p className="mt-3 text-center text-[13px] font-bold text-[var(--error)]">{error}</p>}
            </form>
          </div>
        )}

        {/* Compact search when results showing */}
        {(data || loading) && (
          <form onSubmit={handleSearch} className="w-full mb-6">
            <div className="flex items-center bg-[var(--card)] border border-[var(--border)] focus-within:border-[var(--green)] transition-colors" style={{ borderRadius: "12px" }}>
              <svg className="ml-4 shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/></svg>
              <input
                type="text"
                value={mint}
                onChange={(e) => { setMint(e.target.value); setError(""); }}
                placeholder="Paste Bags CA here..."
                className="flex-1 bg-transparent px-4 py-3.5 text-[14px] text-[var(--text)] placeholder:text-[var(--text-dim)] outline-none font-mono"
              />
              <button type="submit" disabled={loading} className="text-[var(--green)] font-bold text-[13px] pr-4 hover:opacity-80">
                {loading ? "..." : "Go"}
              </button>
            </div>
            {error && <p className="mt-2 text-center text-[12px] font-bold text-[var(--error)]">{error}</p>}
          </form>
        )}

        {/* Loading skeleton matching dashboard layout */}
        {loading && (
          <div className="w-full space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[var(--card)] border border-[var(--border)] p-6 h-64 animate-pulse" style={{ borderRadius: "16px" }} />
              <div className="bg-[var(--card)] border border-[var(--border)] p-6 h-64 animate-pulse" style={{ borderRadius: "16px" }} />
            </div>
            <div className="bg-[var(--card)] border border-[var(--border)] p-6 h-48 animate-pulse" style={{ borderRadius: "16px" }} />
          </div>
        )}

        {/* ═══ DASHBOARD RESULTS ═══ */}
        {data && !loading && (
          <div ref={resultsRef} className="w-full animate-slide-up space-y-4">

            {/* Row 1: Lifetime Fees Chart + Claim History Table */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Lifetime Fees Card */}
              <div className="bg-[var(--card)] border border-[var(--border)] p-6" style={{ borderRadius: "16px" }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[18px] font-bold text-[var(--text)]">Lifetime Fees</h3>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[var(--green)]" style={{ borderRadius: "2px" }} /> Claimed</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[var(--green)] opacity-40" style={{ borderRadius: "2px" }} /> Unclaimed</span>
                  </div>
                </div>

                {/* Big number */}
                <p className="text-[32px] font-bold text-[var(--text)] mb-1">
                  {feesSol > 0 ? fmtSol(feesLam) : "0"} <span className="text-[20px] text-[var(--green)]">SOL</span>
                </p>
                <p className="text-[12px] text-[var(--text-secondary)] mb-4">
                  {claimPct.toFixed(1)}% claimed &middot; {events.length} events
                </p>

                {/* Area chart */}
                <div className="h-28 relative">
                  {chartPoints.length > 1 ? (
                    <svg viewBox="0 0 400 100" className="w-full h-full" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--green)" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="var(--green)" stopOpacity="0.02" />
                        </linearGradient>
                      </defs>
                      {(() => {
                        const maxY = Math.max(...chartPoints.map(p => p.y));
                        const minX = chartPoints[0].x;
                        const maxX = chartPoints[chartPoints.length - 1].x;
                        const rangeX = maxX - minX || 1;
                        const pts = chartPoints.map(p => ({
                          x: ((p.x - minX) / rangeX) * 400,
                          y: 95 - (p.y / (maxY || 1)) * 85,
                        }));
                        const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
                        const area = `${line} L${pts[pts.length - 1].x},95 L${pts[0].x},95 Z`;
                        return (
                          <>
                            <path d={area} fill="url(#areaGrad)" />
                            <path d={line} fill="none" stroke="var(--green)" strokeWidth="2" />
                          </>
                        );
                      })()}
                    </svg>
                  ) : (
                    <div className="h-full flex items-center justify-center text-[12px] text-[var(--text-dim)]">
                      {feesLam > 0 ? "Single data point" : "No fee data yet"}
                    </div>
                  )}
                </div>
              </div>

              {/* Claim History Table */}
              <div className="bg-[var(--card)] border border-[var(--border)] p-6" style={{ borderRadius: "16px" }}>
                <h3 className="text-[18px] font-bold text-[var(--text)] mb-4">Claim History</h3>

                {events.length > 0 ? (
                  <div className="overflow-y-auto max-h-56">
                    <table className="w-full text-[12px]">
                      <thead>
                        <tr className="text-left text-[var(--text-secondary)] border-b border-[var(--border)]">
                          <th className="pb-2 font-bold">Date</th>
                          <th className="pb-2 font-bold">Wallet</th>
                          <th className="pb-2 font-bold text-right">Claim Fees</th>
                        </tr>
                      </thead>
                      <tbody>
                        {events.slice(0, 10).map((ev, i) => (
                          <tr key={i} className="border-b border-[var(--border-light)] last:border-0">
                            <td className="py-2.5 text-[var(--text-secondary)]">{fmtDate(ev.timestamp)}</td>
                            <td className="py-2.5 font-mono text-[var(--text)]">
                              <a href={`https://solscan.io/tx/${ev.signature}`} target="_blank" className="hover:text-[var(--green)]">
                                {ev.wallet.slice(0, 4)}...{ev.wallet.slice(-4)}
                                {ev.isCreator && <span className="ml-1 text-[9px] text-[var(--green)] font-bold">C</span>}
                              </a>
                            </td>
                            <td className="py-2.5 text-right font-bold text-[var(--green)]">
                              {fmtSol(parseInt(ev.amount))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="h-40 flex items-center justify-center text-[13px] text-[var(--text-dim)]">
                    No claims yet
                  </div>
                )}
              </div>
            </div>

            {/* Row 2: Fee Share Analytics */}
            <div className="bg-[var(--card)] border border-[var(--border)] p-6" style={{ borderRadius: "16px" }}>
              <h3 className="text-[18px] font-bold text-[var(--text)] mb-6">Fee Share Analytics</h3>

              <div className="flex flex-col md:flex-row gap-8 items-center">
                {/* Donut Chart */}
                <div className="shrink-0">
                  <svg width="160" height="160" viewBox="0 0 160 160">
                    {data.creators.length > 0 ? (
                      (() => {
                        let cumAngle = 0;
                        const total = data.creators.reduce((s, c) => s + c.royaltyBps, 0);
                        return data.creators.map((c, i) => {
                          const pct = c.royaltyBps / (total || 1);
                          const angle = pct * 360;
                          const startAngle = cumAngle;
                          cumAngle += angle;
                          const r = 60;
                          const cx = 80, cy = 80;
                          const inner = 35;
                          const a1 = ((startAngle - 90) * Math.PI) / 180;
                          const a2 = ((startAngle + angle - 90) * Math.PI) / 180;
                          const large = angle > 180 ? 1 : 0;
                          const path = [
                            `M${cx + inner * Math.cos(a1)},${cy + inner * Math.sin(a1)}`,
                            `L${cx + r * Math.cos(a1)},${cy + r * Math.sin(a1)}`,
                            `A${r},${r} 0 ${large} 1 ${cx + r * Math.cos(a2)},${cy + r * Math.sin(a2)}`,
                            `L${cx + inner * Math.cos(a2)},${cy + inner * Math.sin(a2)}`,
                            `A${inner},${inner} 0 ${large} 0 ${cx + inner * Math.cos(a1)},${cy + inner * Math.sin(a1)}`,
                          ].join(" ");
                          return <path key={i} d={path} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />;
                        });
                      })()
                    ) : (
                      <circle cx="80" cy="80" r="60" fill="var(--border)" />
                    )}
                  </svg>
                  {/* Legend */}
                  <div className="flex flex-wrap gap-3 mt-3 justify-center">
                    {data.creators.map((c, i) => (
                      <span key={i} className="flex items-center gap-1.5 text-[11px]">
                        <span className="w-2.5 h-2.5 shrink-0" style={{ backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length], borderRadius: "2px" }} />
                        {c.twitterUsername || c.username || "Unknown"}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Fee Share Table */}
                <div className="flex-1 w-full">
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr className="text-left text-[var(--text-secondary)] border-b border-[var(--border)]">
                        <th className="pb-2 font-bold">Name</th>
                        <th className="pb-2 font-bold text-right">Fee Share</th>
                        <th className="pb-2 font-bold text-right">% Total Fees</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.creators.map((c, i) => {
                        const pct = (c.royaltyBps / 100).toFixed(0);
                        const claimStat = data.claimStats.find(s => s.wallet === c.wallet);
                        const claimed = claimStat ? parseInt(claimStat.totalClaimed) : 0;
                        return (
                          <tr key={i} className="border-b border-[var(--border-light)] last:border-0">
                            <td className="py-2.5">
                              <div className="flex items-center gap-2">
                                {c.pfp && <img src={c.pfp} alt="" className="w-6 h-6" style={{ borderRadius: "6px" }} />}
                                <a href={`https://x.com/${c.twitterUsername}`} target="_blank" className="font-bold text-[var(--text)] hover:text-[var(--green)]">
                                  {c.twitterUsername || c.username}
                                </a>
                                {c.isCreator && <span className="text-[8px] font-bold text-[var(--green)] uppercase">Creator</span>}
                              </div>
                            </td>
                            <td className="py-2.5 text-right font-bold text-[var(--text)]">{pct}%</td>
                            <td className="py-2.5 text-right font-mono text-[var(--green)] font-bold">
                              {claimed > 0 ? fmtSol(claimed) : "0"} SOL
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-[var(--border)]">
                        <td className="pt-3 font-bold text-[var(--text)]">Total</td>
                        <td className="pt-3 text-right">
                          <span className="bg-[var(--green)] text-white font-bold text-[11px] px-3 py-1" style={{ borderRadius: "4px" }}>
                            {((data.creators.reduce((s, c) => s + c.royaltyBps, 0)) / 100).toFixed(0)}%
                          </span>
                        </td>
                        <td className="pt-3 text-right">
                          <span className="bg-[var(--green)] text-white font-bold text-[11px] px-3 py-1 font-mono" style={{ borderRadius: "4px" }}>
                            {feesSol > 0 ? fmtSol(feesLam) : "0"} SOL
                          </span>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            {/* CA + Links Row */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleCopy}
                className="flex-1 bg-[var(--card)] border border-[var(--border)] p-4 flex items-center justify-center gap-2 hover:border-[var(--green)] transition-colors"
                style={{ borderRadius: "12px" }}
              >
                <span className="font-mono text-[12px] text-[var(--text-secondary)]">{data.tokenMint.slice(0, 8)}...{data.tokenMint.slice(-6)}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                {copied && <span className="text-[var(--green)] text-[11px] font-bold">Copied!</span>}
              </button>
              <a
                href={`https://bags.fm/${data.tokenMint}?ref=crisnewtonx`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[var(--green)] text-white font-bold py-4 px-8 text-[13px] uppercase tracking-[0.06em] hover:bg-[var(--green-hover)] transition-colors text-center"
                style={{ borderRadius: "12px" }}
              >
                View on Bags.fm
              </a>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
