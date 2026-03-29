"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useTheme } from "../ThemeProvider";
import ToolNav from "../ToolNav";

interface WalletToken {
  mint: string;
  lifetimeFeesLamports: number;
}

interface WalletData {
  tokens: WalletToken[];
  totalFeesLamports: number;
}

function fmtSol(lam: number): string {
  const sol = lam / 1e9;
  if (sol >= 1) return sol.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  if (sol >= 0.001) return sol.toFixed(6);
  return sol.toFixed(9);
}

function truncMint(mint: string): string {
  return mint.slice(0, 6) + "..." + mint.slice(-4);
}

function KPI({ label, value, unit, accent }: { label: string; value: string; unit?: string; accent?: boolean }) {
  return (
    <div className="bg-[var(--card)] border border-[var(--border)] p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--text-3)] mb-1">{label}</p>
      <p className={`text-[22px] md:text-[28px] font-bold leading-none ${accent ? "text-[var(--green)]" : "text-[var(--text)]"}`}>
        {value}
        {unit && <span className="text-[12px] md:text-[14px] font-bold text-[var(--text-3)] ml-1.5">{unit}</span>}
      </p>
    </div>
  );
}

export default function WalletPage() {
  const { theme, toggleTheme } = useTheme();
  const [address, setAddress] = useState("");
  const [data, setData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchWallet = useCallback(async (wallet: string) => {
    setLoading(true);
    setError("");
    setData(null);
    try {
      const res = await fetch(`/api/wallet/${wallet}`);
      const json = await res.json();
      if (!json.success) {
        setError(json.error || "Failed to load wallet data");
        return;
      }
      setData(json.data);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = address.trim();
    if (!trimmed || trimmed.length < 32 || trimmed.length > 44) {
      setError("Enter a valid Solana wallet address");
      return;
    }
    fetchWallet(trimmed);
  };

  const hasResults = data || loading;

  return (
    <>
      <ToolNav />
      {/* ═══ STICKY NAV (when results showing) ═══ */}
      {hasResults && (
        <div className="sticky top-0 z-50 bg-[var(--bg)] border-b border-[var(--border)]">
          <div className="mx-auto max-w-4xl px-4 py-2.5 flex items-center gap-2 md:gap-3">
            <form onSubmit={handleSearch} className="flex-1 flex h-10">
              <input
                type="text"
                value={address}
                onChange={(e) => { setAddress(e.target.value); setError(""); }}
                placeholder="Enter wallet address..."
                className="flex-1 bg-[var(--card)] border-2 border-r-0 border-[var(--border)] px-4 text-[13px] text-[var(--text)] placeholder:text-[var(--text-3)] outline-none font-mono focus:border-[var(--green)]"
              />
              <button type="submit" disabled={loading} className="bg-[var(--green)] text-white font-bold px-5 text-[12px] uppercase tracking-[0.06em] hover:bg-[var(--green-hover)] disabled:opacity-50 shrink-0">
                {loading ? "..." : "Look Up"}
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
          </div>
          {error && <p className="mx-auto max-w-4xl px-4 pb-2 text-[11px] font-bold text-[var(--error)]">{error}</p>}
        </div>
      )}

      {/* ═══ HERO (before search) ═══ */}
      {!hasResults && (
        <div className="flex flex-col items-center justify-center text-center min-h-[80vh] px-4">
          <img src="/logo.svg" alt="CreatorFees" className="h-12 md:h-16 mb-6" />
          <h1 className="text-[32px] md:text-[48px] lg:text-[60px] font-bold leading-[1.05] tracking-tighter text-[var(--text)]">
            My <span className="text-[var(--green)]">Tokens</span>
          </h1>
          <p className="mt-4 text-[14px] md:text-[16px] text-[var(--text-2)] max-w-lg leading-relaxed">
            Enter a wallet address to see all tokens you&apos;re fee share admin for, with lifetime fees earned.
          </p>

          <form onSubmit={handleSearch} className="w-full max-w-2xl mt-10">
            <div className="flex h-16 md:h-[72px]">
              <input
                type="text"
                value={address}
                onChange={(e) => { setAddress(e.target.value); setError(""); }}
                placeholder="Enter wallet address..."
                className="flex-1 bg-[var(--card)] border-2 border-r-0 border-[var(--border)] px-5 md:px-8 text-[16px] md:text-[18px] text-[var(--text)] placeholder:text-[var(--text-3)] outline-none font-mono focus:border-[var(--green)]"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-[var(--green)] text-white font-bold px-8 md:px-12 text-[15px] md:text-[17px] uppercase tracking-[0.06em] hover:bg-[var(--green-hover)] active:scale-[0.98] transition-all disabled:opacity-50 shrink-0"
              >
                {loading ? "..." : "Look Up"}
              </button>
            </div>
            {error && <p className="mt-2 text-center text-[13px] font-bold text-[var(--error)]">{error}</p>}
          </form>

          <div className="flex items-center gap-2 mt-8">
            <button onClick={toggleTheme}
              className="h-10 w-10 flex items-center justify-center border border-[var(--border)] bg-[var(--card)] hover:border-[var(--green)] hover:text-[var(--green)] text-[var(--text-2)] transition-colors">
              {theme === "light" ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ═══ LOADING ═══ */}
      {loading && (
        <div className="mx-auto max-w-4xl px-4 py-8 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-[var(--border)] animate-pulse" />)}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-32 bg-[var(--border)] animate-pulse" />)}
          </div>
        </div>
      )}

      {/* ═══ RESULTS ═══ */}
      {data && !loading && (
        <div className="mx-auto max-w-4xl px-4 py-6 animate-slide-up">
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            <KPI label="Total Fees Earned" value={data.totalFeesLamports > 0 ? fmtSol(data.totalFeesLamports) : "0"} unit="SOL" accent />
            <KPI label="Tokens" value={String(data.tokens.length)} />
            <KPI
              label="Avg Fee / Token"
              value={data.tokens.length > 0 ? fmtSol(Math.floor(data.totalFeesLamports / data.tokens.length)) : "0"}
              unit="SOL"
            />
          </div>

          {/* Token grid */}
          {data.tokens.length === 0 ? (
            <div className="bg-[var(--card)] border border-[var(--border)] p-8 text-center">
              <p className="text-[14px] text-[var(--text-2)]">No tokens found for this wallet.</p>
              <p className="text-[12px] text-[var(--text-3)] mt-2">This wallet is not a fee share admin for any Bags tokens.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {data.tokens
                .sort((a, b) => b.lifetimeFeesLamports - a.lifetimeFeesLamports)
                .map((token) => (
                  <Link
                    key={token.mint}
                    href={`/?mint=${token.mint}`}
                    className="bg-[var(--card)] border border-[var(--border)] p-4 hover:border-[var(--green)] transition-colors group"
                  >
                    <p className="text-[11px] font-mono text-[var(--text-3)] mb-2 group-hover:text-[var(--green)]">
                      {truncMint(token.mint)}
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--text-3)] mb-1">Lifetime Fees</p>
                    <p className="text-[20px] md:text-[24px] font-bold text-[var(--green)] leading-none">
                      {token.lifetimeFeesLamports > 0 ? fmtSol(token.lifetimeFeesLamports) : "0"}
                      <span className="text-[11px] font-bold text-[var(--text-3)] ml-1.5">SOL</span>
                    </p>
                    <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.06em] text-[var(--text-3)] group-hover:text-[var(--green)]">
                      View Details &rarr;
                    </p>
                  </Link>
                ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
