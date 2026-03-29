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
        const newEvents = events.filter((e: ClaimEvent) => !prevEventsRef.current.includes(e.signature));
        newEvents.forEach((e: ClaimEvent) => {
          const who = e.isCreator ? "Creator" : e.wallet.slice(0, 6) + "...";
          addToast(`${who} claimed fees`, `+${fmtSol(parseInt(e.amount))} SOL`);
        });
      }
      prevEventsRef.current = sigs;

      if (!isPolling) {
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
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
    if (!trimmed || trimmed.length < 32 || trimmed.length > 44) {
      setError("Enter a valid Bags token address");
      return;
    }
    prevEventsRef.current = [];
    fetchToken(trimmed);
  };

  const handleCopyMint = () => {
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

  return (
    <>
      {/* Toasts */}
      <div className="fixed top-20 right-5 z-50 space-y-2 w-80">
        {toasts.map(t => (
          <div key={t.id} className={`${t.exiting ? "toast-exit" : "toast-enter"} flex items-center gap-3 bg-[var(--white)] border-l-4 border-[var(--green)] p-4 shadow-lg`}>
            <div className="w-9 h-9 bg-[var(--green-10)] flex items-center justify-center shrink-0">
              <span className="text-[var(--green)] text-[16px] font-bold">$</span>
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-bold text-[var(--text)] truncate">{t.message}</p>
              <p className="text-[14px] font-bold text-[var(--green)]">{t.amount}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center px-4">
        {/* Hero */}
        <div className={`flex flex-col items-center justify-center text-center w-full ${!data && !loading ? "min-h-[65vh]" : "mt-6 mb-4"}`}>
          <img src="/logo.svg" alt="CreatorFees" className={`mx-auto mb-5 ${!data && !loading ? "h-16 md:h-20" : "h-10"}`} />
          {(!data && !loading) && (
            <>
              <h1 className="text-[42px] md:text-[56px] lg:text-[72px] font-bold leading-[1.05] tracking-tighter text-[var(--text)]">
                Creator Fee{" "}
                <span className="text-[var(--green)]">Dashboard</span>
              </h1>
              <p className="mt-4 text-[14px] md:text-[16px] text-[var(--text-variant)] max-w-lg mx-auto leading-relaxed">
                Track lifetime creator fees, claim history, and fee share analytics for any Bags.fm token.
              </p>
            </>
          )}

          {/* Search — BIG */}
          <form onSubmit={handleSearch} className={`w-full ${!data && !loading ? "max-w-2xl mt-10" : "max-w-3xl mt-2"}`}>
            <div className={`flex border-2 border-[var(--surface-highest)] bg-[var(--white)] focus-within:border-[var(--green)] transition-colors ${!data && !loading ? "shadow-[0_4px_24px_rgba(0,0,0,0.06)]" : ""}`}>
              <input
                type="text"
                value={mint}
                onChange={(e) => { setMint(e.target.value); setError(""); }}
                placeholder="Paste Bags CA here..."
                className={`flex-1 bg-transparent text-[var(--text)] placeholder:text-[var(--text-dim)] outline-none font-mono ${!data && !loading ? "px-6 py-5 text-[16px] md:text-[18px]" : "px-5 py-4 text-[14px]"}`}
              />
              <button
                type="submit"
                disabled={loading}
                className={`bg-[var(--green)] text-white font-bold uppercase tracking-[0.08em] hover:bg-[var(--green-hover)] active:scale-95 transition-all disabled:opacity-50 shrink-0 ${!data && !loading ? "px-8 md:px-10 text-[14px]" : "px-6 text-[12px]"}`}
              >
                {loading ? "..." : "Check Fees"}
              </button>
            </div>
            {error && <p className="mt-3 text-[12px] font-bold text-[var(--error)]">{error}</p>}
          </form>

          {/* Powered by */}
          {!data && !loading && (
            <div className="mt-6 flex items-center gap-2 text-[11px] text-[var(--text-dim)]">
              Powered by{" "}
              <a href="https://bags.fm/?ref=crisnewtonx" target="_blank" rel="noopener noreferrer" className="font-bold text-[var(--green)] hover:underline">
                Bags.fm API
              </a>
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="w-full max-w-3xl space-y-4 mt-4">
            <div className="h-28 bg-[var(--surface-low)] animate-pulse" />
            <div className="grid grid-cols-3 gap-3">
              {[1,2,3].map(i => <div key={i} className="h-24 bg-[var(--surface-low)] animate-pulse" />)}
            </div>
          </div>
        )}

        {/* Results */}
        {data && !loading && (
          <div ref={resultsRef} className="w-full max-w-3xl animate-slide-up mb-12">
            {/* Big Fee Display */}
            <div className="bg-[var(--white)] border border-[var(--surface)] p-6 md:p-8 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {creator?.pfp && <img src={creator.pfp} alt="" className="w-12 h-12" />}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--text-variant)] mb-1">Lifetime Fees</p>
                  <p className="text-[28px] md:text-[36px] font-bold tracking-tight text-[var(--text)]">
                    {feesLam > 0 ? fmtSol(feesLam) : "0"}{" "}
                    <span className="text-[var(--green)] text-[20px] md:text-[24px]">SOL</span>
                  </p>
                </div>
              </div>
              <a
                href={`https://bags.fm/${data.tokenMint}?ref=crisnewtonx`}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 bg-[var(--green)] text-white font-bold py-3 px-5 text-[11px] uppercase tracking-[0.08em] hover:bg-[var(--green-hover)] transition-colors"
              >
                View on Bags.fm
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <Stat label="Claimed" value={totalClaimed > 0 ? fmtSol(totalClaimed) : "0"} unit="SOL" />
              <Stat label="Unclaimed" value={unclaimed > 0 ? fmtSol(unclaimed) : "0"} unit="SOL" warn={unclaimed > 0} />
              <Stat label="Events" value={String(events.length)} sub={events.length > 0 ? ago(events[0].timestamp) : "None"} />
            </div>

            {/* Progress */}
            {feesLam > 0 && (
              <div className="bg-[var(--white)] border border-[var(--surface)] p-5 mb-6">
                <div className="flex justify-between mb-2 text-[11px] font-bold uppercase tracking-[0.08em]">
                  <span className="text-[var(--text-variant)]">Claim Progress</span>
                  <span className="text-[var(--text)]">{claimPct.toFixed(1)}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${Math.min(100, claimPct)}%` }} />
                </div>
              </div>
            )}

            {/* Creators */}
            {data.creators.length > 0 && (
              <div className="mb-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--text-variant)] mb-3">Fee Share</p>
                <div className="space-y-2">
                  {data.creators.map((c, i) => (
                    <div key={i} className="bg-[var(--white)] border border-[var(--surface)] p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {c.pfp ? <img src={c.pfp} alt="" className="w-10 h-10" /> : (
                          <div className="w-10 h-10 bg-[var(--green-10)] flex items-center justify-center text-[14px] font-bold text-[var(--green)]">
                            {c.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <a href={`https://x.com/${c.twitterUsername}`} target="_blank" className="text-[14px] font-bold text-[var(--link)] hover:text-[var(--green)]">
                              @{c.twitterUsername || c.username}
                            </a>
                            {c.isCreator && <span className="px-2 py-0.5 text-[9px] font-bold uppercase bg-[var(--green-10)] text-[#00A020]">Creator</span>}
                          </div>
                          <p className="text-[11px] text-[var(--text-dim)] mt-0.5">{(c.royaltyBps / 100).toFixed(0)}% share</p>
                        </div>
                      </div>
                      <span className="hidden sm:inline font-mono text-[11px] text-[var(--text-dim)]">{c.wallet.slice(0, 6)}...{c.wallet.slice(-4)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Claim History */}
            {events.length > 0 && (
              <div className="mb-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--text-variant)] mb-3">Claim History</p>
                <div className="space-y-2">
                  {events.map((ev, i) => (
                    <a
                      key={i}
                      href={`https://solscan.io/tx/${ev.signature}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between bg-[var(--white)] border border-[var(--surface)] p-4 hover:bg-[var(--surface-low)] transition-colors"
                    >
                      <div>
                        <p className="text-[11px] text-[var(--text-dim)]">
                          <span className="font-mono">{ev.wallet.slice(0, 6)}...{ev.wallet.slice(-4)}</span>
                          {ev.isCreator && <span className="ml-2 text-[9px] font-bold text-[var(--green)] uppercase">Creator</span>}
                        </p>
                        <p className="text-[10px] text-[var(--text-dim)] mt-0.5">{ago(ev.timestamp)}</p>
                      </div>
                      <span className="text-[16px] md:text-[18px] font-bold text-[var(--green)]">+{fmtSol(parseInt(ev.amount))} SOL</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Empty */}
            {feesLam === 0 && data.creators.length === 0 && events.length === 0 && (
              <div className="bg-[var(--surface-low)] p-10 text-center">
                <p className="text-[14px] font-bold text-[var(--text-variant)]">No fee data found</p>
                <p className="text-[12px] text-[var(--text-dim)] mt-2">This token may be new or not on Bags.</p>
              </div>
            )}

            {/* Mint + Copy */}
            <div className="mt-6 flex items-center justify-center gap-2">
              <p className="font-mono text-[11px] text-[var(--text-dim)] break-all">{data.tokenMint}</p>
              <button
                onClick={handleCopyMint}
                className="shrink-0 px-2 py-1 text-[10px] font-bold uppercase text-[var(--text-dim)] border border-[var(--surface)] hover:border-[var(--green)] hover:text-[var(--green)] transition-colors"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function Stat({ label, value, unit, sub, warn }: { label: string; value: string; unit?: string; sub?: string; warn?: boolean }) {
  return (
    <div className="bg-[var(--white)] border border-[var(--surface)] p-5 md:p-6">
      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--text-dim)] mb-1">{label}</p>
      <p className={`text-[20px] md:text-[28px] font-bold ${warn ? "text-[#B08C00]" : "text-[var(--text)]"}`}>
        {value} {unit && <span className="text-[12px] md:text-[14px] text-[var(--text-variant)]">{unit}</span>}
      </p>
      {sub && <p className="text-[10px] text-[var(--text-dim)] mt-1">{sub}</p>}
    </div>
  );
}
