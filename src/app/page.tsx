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
function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch(() => {});
}

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
  const events = data ? getEvents(data.claimEvents) : [];
  const totalClaimed = data?.claimStats.reduce((s, c) => s + parseInt(c.totalClaimed || "0"), 0) || 0;
  const unclaimed = feesLam - totalClaimed;
  const claimPct = feesLam > 0 ? (totalClaimed / feesLam) * 100 : 0;
  const creator = data?.creators.find(c => c.isCreator) || data?.creators[0];
  const feeSharers = data?.creators.filter(c => !c.isCreator) || [];

  return (
    <>
      {/* Toasts */}
      <div className="fixed top-16 right-4 z-50 space-y-2 w-80">
        {toasts.map(t => (
          <div key={t.id} className={`${t.exiting ? "toast-exit" : "toast-enter"} rcard flex items-center gap-3 p-4 shadow-lg`}>
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

      {/* Search bar — pill style */}
      <div className="mb-6">
        <form onSubmit={handleSearch}>
          <div className="flex items-center bg-[var(--card)] border border-[var(--border)] px-4 gap-3" style={{ borderRadius: "14px" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/></svg>
            <input
              type="text"
              value={mint}
              onChange={(e) => { setMint(e.target.value); setError(""); }}
              placeholder="Search by CA or ticker"
              className="flex-1 bg-transparent py-3.5 text-[14px] text-[var(--text)] placeholder:text-[var(--text-dim)] outline-none"
            />
            {mint && (
              <button type="submit" disabled={loading} className="text-[var(--green)] font-bold text-[13px] hover:opacity-80">
                {loading ? "..." : "Go"}
              </button>
            )}
          </div>
        </form>
        {error && <p className="mt-2 text-center text-[12px] font-bold text-[var(--error)]">{error}</p>}
      </div>

      {/* Hero — when no results */}
      {!data && !loading && (
        <div className="flex flex-col items-center justify-center text-center min-h-[55vh]">
          <img src="/logo.svg" alt="CreatorFees" className="h-16 md:h-20 mb-6" />
          <h1 className="text-[36px] md:text-[52px] lg:text-[64px] font-bold leading-[1.05] tracking-tighter text-[var(--text)]">
            Creator Fee{" "}
            <span className="text-[var(--green)]">Dashboard</span>
          </h1>
          <p className="mt-4 text-[14px] text-[var(--text-secondary)] max-w-md leading-relaxed">
            Track lifetime creator fees, claim history, and fee share analytics for any Bags.fm token.
          </p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center mt-12 gap-4">
          <div className="w-20 h-20 bg-[var(--border)] animate-pulse" style={{ borderRadius: "16px" }} />
          <div className="w-32 h-6 bg-[var(--border)] animate-pulse" style={{ borderRadius: "8px" }} />
          <div className="w-48 h-4 bg-[var(--border)] animate-pulse" style={{ borderRadius: "8px" }} />
          <div className="grid grid-cols-3 gap-3 w-full mt-4">
            {[1,2,3].map(i => <div key={i} className="h-20 bg-[var(--border)] animate-pulse" style={{ borderRadius: "14px" }} />)}
          </div>
        </div>
      )}

      {/* Results — Bags style centered token detail */}
      {data && !loading && (
        <div ref={resultsRef} className="animate-slide-up flex flex-col items-center">
          {/* Token Image */}
          {creator?.pfp && (
            <div className="w-24 h-24 mb-4 overflow-hidden" style={{ borderRadius: "20px" }}>
              <img src={creator.pfp} alt="" className="w-full h-full object-cover" />
            </div>
          )}

          {/* Token Name (from creator username) */}
          <h2 className="text-[24px] font-bold text-[var(--text)] mb-1">
            {creator?.twitterUsername ? `@${creator.twitterUsername}` : data.tokenMint.slice(0, 8)}
          </h2>
          <p className="text-[14px] text-[var(--text-secondary)] mb-6">Token Fee Analytics</p>

          {/* Stats — 3 pill cards */}
          <div className="grid grid-cols-3 gap-3 w-full mb-4">
            <div className="stat-pill">
              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--text-dim)] mb-1">Lifetime Fees</p>
              <p className="text-[16px] md:text-[18px] font-bold text-[var(--text)]">
                {feesLam > 0 ? fmtSol(feesLam) : "0"}
                <span className="text-[12px] text-[var(--text-secondary)] ml-1">SOL</span>
              </p>
            </div>
            <div className="stat-pill">
              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--text-dim)] mb-1">Claimed</p>
              <p className="text-[16px] md:text-[18px] font-bold text-[var(--green)]">
                {totalClaimed > 0 ? fmtSol(totalClaimed) : "0"}
              </p>
            </div>
            <div className="stat-pill">
              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--text-dim)] mb-1">Unclaimed</p>
              <p className="text-[16px] md:text-[18px] font-bold text-[var(--text)]">
                {unclaimed > 0 ? fmtSol(unclaimed) : "0"}
              </p>
            </div>
          </div>

          {/* CA Copy pill */}
          <button onClick={handleCopy} className="pill w-full mb-3">
            <span className="font-mono text-[13px] text-[var(--text-secondary)]">
              {data.tokenMint.slice(0, 6)}...{data.tokenMint.slice(-4)}
            </span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
            {copied && <span className="text-[var(--green)] text-[11px] font-bold">Copied!</span>}
          </button>

          {/* View on Bags pill */}
          <a href={`https://bags.fm/${data.tokenMint}?ref=crisnewtonx`} target="_blank" rel="noopener noreferrer" className="pill w-full mb-6">
            <img src="/bags-icon.png" alt="" className="w-5 h-5" />
            <span className="font-bold">View on Bags</span>
          </a>

          {/* Progress bar */}
          {feesLam > 0 && (
            <div className="w-full rcard p-4 mb-4">
              <div className="flex justify-between mb-2 text-[11px] font-bold">
                <span className="text-[var(--text-secondary)] uppercase tracking-[0.06em]">Claim Progress</span>
                <span className="text-[var(--text)]">{claimPct.toFixed(1)}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${Math.min(100, claimPct)}%` }} />
              </div>
            </div>
          )}

          {/* Creator */}
          {creator && (
            <div className="w-full mb-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--green)] mb-2">Creator</p>
              <div className="pill justify-between">
                <div className="flex items-center gap-3">
                  {creator.pfp && <img src={creator.pfp} alt="" className="w-8 h-8" style={{ borderRadius: "8px" }} />}
                  <a href={`https://x.com/${creator.twitterUsername}`} target="_blank" className="font-bold text-[var(--text)] hover:text-[var(--green)] uppercase text-[13px]">
                    {creator.twitterUsername || creator.username}
                  </a>
                  <span className="text-[var(--text-dim)] text-[12px]">𝕏</span>
                </div>
                <span className="font-bold text-[var(--text)] text-[14px]">{(creator.royaltyBps / 100).toFixed(0)}%</span>
              </div>
            </div>
          )}

          {/* Fee Shareholders */}
          {feeSharers.length > 0 && (
            <div className="w-full mb-4 mt-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--green)] mb-2">Fee Shareholders</p>
              <div className="space-y-2">
                {feeSharers.map((c, i) => (
                  <div key={i} className="pill justify-between">
                    <div className="flex items-center gap-3">
                      {c.pfp && <img src={c.pfp} alt="" className="w-8 h-8" style={{ borderRadius: "8px" }} />}
                      <a href={`https://x.com/${c.twitterUsername}`} target="_blank" className="font-bold text-[var(--text)] hover:text-[var(--green)] uppercase text-[13px]">
                        {c.twitterUsername || c.username}
                      </a>
                      <span className="text-[var(--text-dim)] text-[12px]">𝕏</span>
                    </div>
                    <span className="font-bold text-[var(--text)] text-[14px]">{(c.royaltyBps / 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Earnings */}
          {feesLam > 0 && (
            <div className="pill w-full justify-between mb-6 mt-2">
              <span className="text-[14px] text-[var(--text-secondary)]">earnings</span>
              <span className="text-[18px] font-bold text-[var(--green)]">{fmtSol(feesLam)} SOL</span>
            </div>
          )}

          {/* Divider */}
          <div className="w-full border-t border-[var(--border)] mb-6" />

          {/* Claim History */}
          {events.length > 0 && (
            <div className="w-full mb-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--text-secondary)] mb-3">
                Claim History ({events.length})
              </p>
              <div className="space-y-2">
                {events.map((ev, i) => (
                  <a
                    key={i}
                    href={`https://solscan.io/tx/${ev.signature}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pill justify-between hover:border-[var(--green)]"
                  >
                    <div>
                      <p className="text-[12px] font-mono text-[var(--text)]">
                        {ev.wallet.slice(0, 6)}...{ev.wallet.slice(-4)}
                        {ev.isCreator && <span className="ml-2 text-[10px] font-bold text-[var(--green)] uppercase">Creator</span>}
                      </p>
                      <p className="text-[10px] text-[var(--text-dim)]">{ago(ev.timestamp)}</p>
                    </div>
                    <span className="text-[15px] font-bold text-[var(--green)]">+{fmtSol(parseInt(ev.amount))} SOL</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Empty */}
          {feesLam === 0 && data.creators.length === 0 && events.length === 0 && (
            <div className="rcard p-8 text-center w-full">
              <p className="text-[14px] font-bold text-[var(--text-secondary)]">No fee data found</p>
              <p className="text-[12px] text-[var(--text-dim)] mt-2">This token may be new or not on Bags.</p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
