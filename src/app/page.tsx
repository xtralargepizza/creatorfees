"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "./ThemeProvider";

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
  return new Date(ts * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}
function copyToClipboard(text: string) { navigator.clipboard.writeText(text).catch(() => {}); }

const COLORS = ["#00D62B", "#33E155", "#66EC80", "#99F4AA", "#CCF9D4", "#E0FBE8"];

const QUICK_LINKS = [
  { href: "https://bags.fm/launch", label: "Launch Token", desc: "Launch a new Bags token" },
  { href: "https://bags.fm/apps/dexscreener", label: "DexScreener", desc: "Pay for DexScreener listing" },
  { href: "https://bags.fm/apps/compound-liquidity", label: "Compound Liquidity", desc: "Compound your LP" },
  { href: "https://bags.fm/apps/dex-boost", label: "Dex Boost", desc: "Boost DEX visibility" },
  { href: "https://bags.fm/apps/dividendsbot", label: "DividendsBot", desc: "Auto dividend payouts" },
  { href: "https://bags.fm/apps/bagsamm", label: "BagsAMM", desc: "Bags automated market maker" },
  { href: "https://bags.fm/apps/x", label: "Connect X", desc: "Link X for fee sharing" },
  { href: "https://bags.fm/apps/tiktok", label: "Connect TikTok", desc: "TikTok fee sharing" },
  { href: "https://bags.fm/apps/moltbook", label: "Connect Moltbook", desc: "Moltbook fee sharing" },
  { href: "https://bags.fm/apps/github", label: "Connect GitHub", desc: "GitHub fee sharing" },
  { href: "https://bags.fm/apps/kick", label: "Connect Kick", desc: "Kick streamer royalties" },
];

export default function Home() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [mint, setMint] = useState("");
  const [data, setData] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [copied, setCopied] = useState(false);
  const [appsOpen, setAppsOpen] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
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
      if (!isPolling) setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
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

  useEffect(() => {
    const el = document.querySelector('[data-video-bg]');
    if (el) {
      if (data) el.classList.add('video-blur');
      else el.classList.remove('video-blur');
    }
  }, [data]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = mint.trim();
    if (!trimmed || trimmed.length < 32 || trimmed.length > 44) { setError("Enter a valid Bags token address"); return; }
    prevEventsRef.current = [];
    setHistory(prev => [...prev.slice(0, historyIdx + 1), trimmed]);
    setHistoryIdx(prev => prev + 1);
    fetchToken(trimmed);
  };

  const goBack = () => {
    if (historyIdx > 0) {
      const prev = history[historyIdx - 1];
      setHistoryIdx(historyIdx - 1);
      setMint(prev);
      prevEventsRef.current = [];
      fetchToken(prev);
    } else {
      setData(null);
      setMint("");
    }
  };

  const handleCopy = () => {
    if (!data?.tokenMint) return;
    copyToClipboard(data.tokenMint);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasResults = data || loading;
  const feesLam = data?.lifetimeFees ? parseInt(data.lifetimeFees) : 0;
  const feesSol = feesLam / 1e9;
  const events = data ? getEvents(data.claimEvents) : [];
  const totalClaimed = data?.claimStats.reduce((s, c) => s + parseInt(c.totalClaimed || "0"), 0) || 0;
  const unclaimed = feesLam - totalClaimed;
  const claimPct = feesLam > 0 ? (totalClaimed / feesLam) * 100 : 0;
  const creator = data?.creators.find(c => c.isCreator) || data?.creators[0];

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
      <div className="fixed top-4 right-4 z-[60] space-y-2 w-72 md:w-80">
        {toasts.map(t => (
          <div key={t.id} className={`${t.exiting ? "toast-exit" : "toast-enter"} bg-[var(--card)] border border-[var(--border)] border-l-[3px] border-l-[var(--green)] p-3 shadow-lg flex items-center gap-3`}>
            <div className="w-7 h-7 bg-[var(--green-10)] flex items-center justify-center shrink-0 text-[var(--green)] text-[13px] font-bold">$</div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-[var(--text)] truncate">{t.message}</p>
              <p className="text-[13px] font-bold text-[var(--green)]">{t.amount}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ═══ STICKY NAV + SEARCH (when results showing) ═══ */}
      {hasResults && (
        <div className="sticky top-0 z-50 bg-[var(--bg)] border-b border-[var(--border)]">
          <div className="mx-auto max-w-4xl px-4 py-2.5 flex items-center gap-2 md:gap-3">
            <button onClick={goBack} className="shrink-0 w-10 h-10 flex items-center justify-center border border-[var(--border)] bg-[var(--card)] hover:border-[var(--green)] hover:text-[var(--green)] text-[var(--text-2)]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
            </button>
            <form onSubmit={handleSearch} className="flex-1 flex h-10">
              <input type="text" value={mint} onChange={(e) => { setMint(e.target.value); setError(""); }}
                placeholder="Paste Bags CA here..."
                className="flex-1 bg-[var(--card)] border-2 border-r-0 border-[var(--border)] px-4 text-[13px] text-[var(--text)] placeholder:text-[var(--text-3)] outline-none font-mono focus:border-[var(--green)]" />
              <button type="submit" disabled={loading} className="bg-[var(--green)] text-white font-bold px-5 text-[12px] uppercase tracking-[0.06em] hover:bg-[var(--green-hover)] disabled:opacity-50 shrink-0">
                {loading ? "..." : "Go"}
              </button>
            </form>
            <button onClick={toggleTheme}
              className="shrink-0 w-10 h-10 flex items-center justify-center border border-[var(--border)] bg-[var(--card)] hover:border-[var(--green)] hover:text-[var(--green)] text-[var(--text-2)]">
              {theme === "light" ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
              )}
            </button>
            <button onClick={() => setAppsOpen(!appsOpen)}
              className={`shrink-0 h-10 px-4 border text-[12px] font-bold uppercase tracking-[0.06em] transition-colors ${appsOpen ? "bg-[var(--green)] text-white border-[var(--green)]" : "bg-[var(--card)] text-[var(--text-2)] border-[var(--border)] hover:border-[var(--green)] hover:text-[var(--green)]"}`}>
              Apps
            </button>
            <a href="/" className="shrink-0 hidden md:block"><img src="/logo.svg" alt="" className="h-5" /></a>
          </div>
          {error && <p className="mx-auto max-w-4xl px-4 pb-2 text-[11px] font-bold text-[var(--error)]">{error}</p>}
        </div>
      )}
      {/* Apps overlay (outside sticky nav) */}
      {hasResults && appsOpen && <AppsPanel onClose={() => setAppsOpen(false)} />}

      {/* ═══ HERO (before search) ═══ */}
      {!hasResults && (
        <div className="flex flex-col items-center justify-center text-center min-h-[80vh] px-4">
          <img src="/logo.svg" alt="CreatorFees" className="h-16 md:h-20 mb-6" />
          <h1 className="text-[36px] md:text-[52px] lg:text-[68px] font-bold leading-[1.05] tracking-tighter text-[var(--text)]">
            Creator Fees <span className="text-[var(--green)]">Dashboard</span>
          </h1>
          <p className="mt-4 text-[14px] md:text-[16px] text-[var(--text-2)] max-w-lg leading-relaxed">
            Track lifetime creator fees, claim history, and fee share analytics for any Bags.fm token.
          </p>

          {/* BIG SEARCH BAR — rectangle, no rounding */}
          <form onSubmit={handleSearch} className="w-full max-w-2xl mt-10">
            <div className="flex h-16 md:h-[72px]">
              <input
                type="text"
                value={mint}
                onChange={(e) => { setMint(e.target.value); setError(""); }}
                placeholder="Paste Bags CA here..."
                className="flex-1 bg-[var(--card)] border-2 border-r-0 border-[var(--border)] px-5 md:px-8 text-[16px] md:text-[18px] text-[var(--text)] placeholder:text-[var(--text-3)] outline-none font-mono focus:border-[var(--green)]"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-[var(--green)] text-white font-bold px-8 md:px-12 text-[15px] md:text-[17px] uppercase tracking-[0.06em] hover:bg-[var(--green-hover)] active:scale-[0.98] transition-all disabled:opacity-50 shrink-0"
              >
                {loading ? "..." : "Check Fees"}
              </button>
            </div>
            {error && <p className="mt-2 text-center text-[13px] font-bold text-[var(--error)]">{error}</p>}
          </form>

          {/* Controls row */}
          <div className="flex items-center gap-2 mt-8">
            <button onClick={toggleTheme}
              className="h-10 w-10 flex items-center justify-center border border-[var(--border)] bg-[var(--card)] hover:border-[var(--green)] hover:text-[var(--green)] text-[var(--text-2)] transition-colors">
              {theme === "light" ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
              )}
            </button>
            <button onClick={() => setAppsOpen(!appsOpen)}
              className="h-10 px-5 border border-[var(--border)] bg-[var(--card)] text-[var(--text-2)] text-[12px] font-bold uppercase tracking-[0.06em] hover:border-[var(--green)] hover:text-[var(--green)] transition-colors">
              Bags Apps
            </button>
          </div>
          {!hasResults && appsOpen && <AppsPanel onClose={() => setAppsOpen(false)} />}
        </div>
      )}

      {/* ═══ LOADING ═══ */}
      {loading && (
        <div className="mx-auto max-w-4xl px-4 py-8 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1,2,3,4].map(i => <div key={i} className="h-24 bg-[var(--border)] animate-pulse" />)}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-56 bg-[var(--border)] animate-pulse" />
            <div className="h-56 bg-[var(--border)] animate-pulse" />
          </div>
        </div>
      )}

      {/* ═══ DASHBOARD ═══ */}
      {data && !loading && (
        <div ref={resultsRef} className="mx-auto max-w-4xl px-4 py-6 animate-slide-up">

          {/* Token header */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-6">
            <div className="flex items-center gap-3 min-w-0">
              {creator?.pfp && <img src={creator.pfp} alt="" className="w-11 h-11 md:w-14 md:h-14 shrink-0" />}
              <div className="min-w-0">
                <h2 className="text-[18px] md:text-[24px] font-bold text-[var(--text)] truncate">
                  {creator?.twitterUsername ? `@${creator.twitterUsername}` : data.tokenMint.slice(0, 12) + "..."}
                </h2>
                <button onClick={handleCopy} className="flex items-center gap-1.5 text-[11px] md:text-[12px] font-mono text-[var(--text-3)] hover:text-[var(--green)] mt-0.5">
                  {data.tokenMint.slice(0, 6)}...{data.tokenMint.slice(-4)}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13"/><path d="M5 15H4V4h11v1"/></svg>
                  {copied && <span className="text-[var(--green)] font-bold">Copied!</span>}
                </button>
              </div>
            </div>
            <a
              href={`https://bags.fm/${data.tokenMint}?ref=crisnewtonx`}
              target="_blank"
              rel="noopener noreferrer"
              className="sm:ml-auto bg-[var(--green)] text-white text-center font-bold py-2.5 px-5 text-[11px] uppercase tracking-[0.06em] hover:bg-[var(--green-hover)] shrink-0"
            >
              View on Bags
            </a>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <KPI label="Lifetime Fees" value={feesSol > 0 ? fmtSol(feesLam) : "0"} unit="SOL" accent />
            <KPI label="Claimed" value={totalClaimed > 0 ? fmtSol(totalClaimed) : "0"} unit="SOL" />
            <KPI label="Unclaimed" value={unclaimed > 0 ? fmtSol(unclaimed) : "0"} unit="SOL" />
            <KPI label="Claim Events" value={String(events.length)} sub={events.length > 0 ? `Last ${ago(events[0].timestamp)}` : "—"} />
          </div>

          {/* Progress */}
          {feesLam > 0 && (
            <div className="bg-[var(--card)] border border-[var(--border)] p-4 mb-6">
              <div className="flex justify-between text-[11px] font-bold mb-2">
                <span className="text-[var(--text-2)]">CLAIM PROGRESS</span>
                <span className="text-[var(--text)]">{claimPct.toFixed(1)}%</span>
              </div>
              <div className="progress-bar"><div className="progress-fill" style={{ width: `${Math.min(100, claimPct)}%` }} /></div>
              <div className="flex justify-between text-[10px] text-[var(--text-3)] mt-1.5">
                <span>{fmtSol(totalClaimed)} claimed</span>
                <span>{fmtSol(feesLam)} total</span>
              </div>
            </div>
          )}

          {/* Charts row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Lifetime Fees Chart */}
            <div className="bg-[var(--card)] border border-[var(--border)] p-5">
              <h3 className="text-[15px] font-bold text-[var(--text)] mb-1">Lifetime Fees</h3>
              <p className="text-[11px] text-[var(--text-3)] mb-4">{events.length} claim events over time</p>
              <div className="h-32 md:h-40">
                {chartPoints.length > 1 ? (
                  <svg viewBox="0 0 400 120" className="w-full h-full" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--green)" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="var(--green)" stopOpacity="0.02" />
                      </linearGradient>
                    </defs>
                    {(() => {
                      const maxY = Math.max(...chartPoints.map(p => p.y));
                      const minX = chartPoints[0].x;
                      const maxX = chartPoints[chartPoints.length - 1].x;
                      const rX = maxX - minX || 1;
                      const pts = chartPoints.map(p => ({ x: ((p.x - minX) / rX) * 400, y: 110 - (p.y / (maxY || 1)) * 100 }));
                      const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
                      const area = `${line} L${pts[pts.length-1].x},115 L${pts[0].x},115 Z`;
                      return (<><path d={area} fill="url(#ag)" /><path d={line} fill="none" stroke="var(--green)" strokeWidth="2.5" /></>);
                    })()}
                  </svg>
                ) : (
                  <div className="h-full flex items-center justify-center text-[12px] text-[var(--text-3)]">{feesLam > 0 ? `${fmtSol(feesLam)} SOL total` : "No data"}</div>
                )}
              </div>
            </div>

            {/* Claim History Table */}
            <div className="bg-[var(--card)] border border-[var(--border)] p-5">
              <h3 className="text-[15px] font-bold text-[var(--text)] mb-1">Claim History</h3>
              <p className="text-[11px] text-[var(--text-3)] mb-4">Recent fee claims</p>
              {events.length > 0 ? (
                <div className="overflow-y-auto max-h-40 md:max-h-48 -mx-1">
                  {events.slice(0, 12).map((ev, i) => (
                    <a key={i} href={`https://solscan.io/tx/${ev.signature}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-between py-2 px-1 border-b border-[var(--border-light)] last:border-0 hover:bg-[var(--bg)] transition-colors">
                      <div>
                        <span className="font-mono text-[12px] text-[var(--text)]">{ev.wallet.slice(0, 5)}...{ev.wallet.slice(-3)}</span>
                        {ev.isCreator && <span className="ml-1.5 text-[9px] font-bold text-[var(--green)]">C</span>}
                        <p className="text-[10px] text-[var(--text-3)]">{fmtDate(ev.timestamp)}</p>
                      </div>
                      <span className="text-[13px] font-bold text-[var(--green)]">+{fmtSol(parseInt(ev.amount))}</span>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="h-32 flex items-center justify-center text-[12px] text-[var(--text-3)]">No claims yet</div>
              )}
            </div>
          </div>

          {/* Fee Share Analytics */}
          <div className="bg-[var(--card)] border border-[var(--border)] p-5 mb-6">
            <h3 className="text-[15px] font-bold text-[var(--text)] mb-1">Fee Share Analytics</h3>
            <p className="text-[11px] text-[var(--text-3)] mb-5">Revenue split between creators</p>

            <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-center">
              {/* Donut */}
              <div className="shrink-0 flex flex-col items-center">
                <svg width="140" height="140" viewBox="0 0 140 140">
                  {data.creators.length > 0 ? (() => {
                    let cum = 0;
                    const total = data.creators.reduce((s, c) => s + c.royaltyBps, 0);
                    return data.creators.map((c, i) => {
                      const pct = c.royaltyBps / (total || 1);
                      const angle = pct * 360;
                      const start = cum; cum += angle;
                      const r = 55, cx = 70, cy = 70, inner = 32;
                      const a1 = ((start - 90) * Math.PI) / 180;
                      const a2 = ((start + angle - 90) * Math.PI) / 180;
                      const lg = angle > 180 ? 1 : 0;
                      const d = `M${cx+inner*Math.cos(a1)},${cy+inner*Math.sin(a1)} L${cx+r*Math.cos(a1)},${cy+r*Math.sin(a1)} A${r},${r} 0 ${lg} 1 ${cx+r*Math.cos(a2)},${cy+r*Math.sin(a2)} L${cx+inner*Math.cos(a2)},${cy+inner*Math.sin(a2)} A${inner},${inner} 0 ${lg} 0 ${cx+inner*Math.cos(a1)},${cy+inner*Math.sin(a1)}`;
                      return <path key={i} d={d} fill={COLORS[i % COLORS.length]} />;
                    });
                  })() : <circle cx="70" cy="70" r="55" fill="var(--border)" />}
                </svg>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 justify-center">
                  {data.creators.map((c, i) => (
                    <span key={i} className="flex items-center gap-1.5 text-[11px] text-[var(--text-2)]">
                      <span className="w-2 h-2 shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      {c.twitterUsername || c.username}
                    </span>
                  ))}
                </div>
              </div>

              {/* Table */}
              <div className="flex-1 w-full overflow-x-auto">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="text-left text-[var(--text-2)] border-b border-[var(--border)]">
                      <th className="pb-2 font-bold">Name</th>
                      <th className="pb-2 font-bold text-right">Share</th>
                      <th className="pb-2 font-bold text-right">Claimed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.creators.map((c, i) => {
                      const cs = data.claimStats.find(s => s.wallet === c.wallet);
                      const cl = cs ? parseInt(cs.totalClaimed) : 0;
                      return (
                        <tr key={i} className="border-b border-[var(--border-light)] last:border-0">
                          <td className="py-2.5">
                            <div className="flex items-center gap-2">
                              {c.pfp && <img src={c.pfp} alt="" className="w-6 h-6 shrink-0" />}
                              <span className="font-bold text-[var(--text)]">{c.twitterUsername || c.username}</span>
                              {c.isCreator && <span className="text-[8px] font-bold text-[var(--green)]">CREATOR</span>}
                            </div>
                          </td>
                          <td className="py-2.5 text-right font-bold">{(c.royaltyBps / 100).toFixed(0)}%</td>
                          <td className="py-2.5 text-right font-mono font-bold text-[var(--green)]">{cl > 0 ? fmtSol(cl) : "0"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-[var(--border)]">
                      <td className="pt-3 font-bold">Total</td>
                      <td className="pt-3 text-right font-bold">{(data.creators.reduce((s, c) => s + c.royaltyBps, 0) / 100).toFixed(0)}%</td>
                      <td className="pt-3 text-right font-bold text-[var(--green)]">{feesSol > 0 ? fmtSol(feesLam) : "0"} SOL</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {/* Empty state */}
          {feesLam === 0 && data.creators.length === 0 && events.length === 0 && (
            <div className="bg-[var(--card)] border border-[var(--border)] p-8 md:p-10 text-center">
              <p className="text-[14px] font-bold text-[var(--text-2)]">No fee data found</p>
              <p className="text-[12px] text-[var(--text-3)] mt-2">This token may be new or not on Bags.</p>
            </div>
          )}

        </div>
      )}
    </>
  );
}

function KPI({ label, value, unit, sub, accent }: { label: string; value: string; unit?: string; sub?: string; accent?: boolean }) {
  return (
    <div className="bg-[var(--card)] border border-[var(--border)] p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--text-3)] mb-1">{label}</p>
      <p className={`text-[18px] md:text-[22px] font-bold ${accent ? "text-[var(--green)]" : "text-[var(--text)]"}`}>
        {value}
        {unit && <span className="text-[12px] text-[var(--text-3)] ml-1">{unit}</span>}
      </p>
      {sub && <p className="text-[10px] text-[var(--text-3)] mt-0.5">{sub}</p>}
    </div>
  );
}

function AppsPanel({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-[var(--card)] border border-[var(--border)] shadow-2xl w-full max-w-lg pointer-events-auto animate-slide-up" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
            <p className="text-[13px] font-bold text-[var(--text)]">Bags Apps</p>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-[var(--text-3)] hover:text-[var(--text)] transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
          <div className="p-4 grid grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto">
            {QUICK_LINKS.map(l => (
              <a key={l.href} href={`${l.href}?ref=crisnewtonx`} target="_blank" rel="noopener noreferrer"
                className="border border-[var(--border)] bg-[var(--bg)] p-3 hover:border-[var(--green)] transition-colors group">
                <p className="text-[12px] font-bold text-[var(--text)] group-hover:text-[var(--green)]">{l.label}</p>
                <p className="text-[10px] text-[var(--text-3)] mt-0.5 leading-snug">{l.desc}</p>
              </a>
            ))}
          </div>
          <div className="p-3 border-t border-[var(--border)]">
            <a href="https://bags.fm/launch?ref=crisnewtonx" target="_blank" rel="noopener noreferrer"
              className="block w-full bg-[var(--green)] text-white text-center font-bold py-2.5 text-[12px] uppercase tracking-[0.06em] hover:bg-[var(--green-hover)] transition-colors">
              Launch a Token
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
