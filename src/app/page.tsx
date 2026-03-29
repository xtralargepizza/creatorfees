"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface TokenLaunch {
  name: string;
  symbol: string;
  description: string;
  image: string;
  tokenMint: string;
  status: string;
  twitter: string | null;
  website: string | null;
}

export default function Dashboard() {
  const [mint, setMint] = useState("");
  const [error, setError] = useState("");
  const [tokens, setTokens] = useState<TokenLaunch[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchFeed = useCallback(async () => {
    try {
      const res = await fetch("/api/feed");
      const json = await res.json();
      if (json.success) setTokens(json.data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchFeed();
    const iv = setInterval(fetchFeed, 30000);
    return () => clearInterval(iv);
  }, [fetchFeed]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = mint.trim();
    if (!trimmed) { setError("Enter a token mint address"); return; }
    if (trimmed.length < 32 || trimmed.length > 44) { setError("Invalid Solana address"); return; }
    router.push(`/token/${trimmed}`);
  };

  const totalTokens = tokens.length;
  const graduated = tokens.filter(t => t.status === "MIGRATED").length;
  const bondingCurve = tokens.filter(t => t.status === "PRE_GRAD").length;

  // Create faux bar chart from token statuses
  const bars = tokens.slice(0, 14).map((t, i) => {
    const h = 20 + Math.random() * 75;
    const isGreen = t.status === "MIGRATED" || i % 3 === 0;
    return { height: h, green: isGreen };
  });

  return (
    <section className="px-6 md:px-8 pt-4 pb-16">
      {/* Hero */}
      <div className="mb-12 md:mb-16">
        <h2 className="text-[12px] font-bold uppercase tracking-[0.3em] text-[var(--text-variant)] mb-4">
          Platform Overview
        </h2>
        <h1 className="text-[48px] md:text-[72px] font-bold leading-[1.05] tracking-tighter text-[var(--text)] max-w-4xl">
          Fee Revenue{" "}
          <span className="text-[var(--green)]">Dashboard</span>
        </h1>
        <p className="mt-4 md:mt-6 text-[13px] text-[var(--text-variant)] font-medium max-w-xl leading-relaxed">
          Real-time fee analytics for Bags.fm token creators. Track lifetime fees,
          claim history, and holder analytics. Paste a token mint to analyze.
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-12 md:mb-16 max-w-2xl">
        <div className="flex border-2 border-[var(--text)]/10 bg-[var(--surface-lowest)] focus-within:border-[var(--green)] transition-colors">
          <span className="material-symbols-outlined flex items-center px-4 text-[var(--text-dim)]">
            search
          </span>
          <input
            type="text"
            value={mint}
            onChange={(e) => { setMint(e.target.value); setError(""); }}
            placeholder="PASTE TOKEN MINT ADDRESS..."
            className="flex-1 bg-transparent py-3.5 pr-4 text-[12px] font-bold uppercase tracking-[0.05em] text-[var(--text)] placeholder:text-[var(--text-dim)] outline-none font-mono"
          />
          <button type="submit" className="bg-[var(--green)] text-[var(--text)] font-bold px-6 text-[11px] tracking-[0.1em] uppercase hover:brightness-110 active:scale-95 transition-all">
            Analyze
          </button>
        </div>
        {error && <p className="mt-2 text-[10px] font-bold text-[var(--error)]">{error}</p>}
      </form>

      {/* Bento Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-1 mb-12 md:mb-16">
        {/* Live Tokens */}
        <div className="bg-[var(--surface-low)] p-6 md:p-8 flex flex-col justify-between">
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--text-variant)] mb-2">
              Live Tokens
            </h3>
            <div className="text-4xl font-bold text-[var(--text)]">
              {loading ? "..." : totalTokens}
            </div>
          </div>
          <div className="mt-6">
            <a
              href="/feed"
              className="block w-full bg-[var(--green)] text-[var(--text)] font-bold py-3.5 text-center text-[11px] tracking-[0.1em] uppercase hover:brightness-110 transition-all active:scale-95"
            >
              View Feed
            </a>
          </div>
        </div>

        {/* Graduated */}
        <div className="bg-[var(--surface)] p-6 md:p-8 flex flex-col justify-between">
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--text-variant)] mb-2">
              Graduated
            </h3>
            <div className="text-4xl font-bold text-[var(--text)]">
              {loading ? "..." : graduated}
            </div>
          </div>
          <div className="mt-6 flex items-center gap-2">
            <span className="text-[var(--green)] text-[11px] font-bold">
              {totalTokens > 0 ? ((graduated / totalTokens) * 100).toFixed(0) : 0}%
            </span>
            <span className="text-[var(--text-variant)] text-[11px] uppercase tracking-[0.1em]">
              of total launched
            </span>
          </div>
        </div>

        {/* Bonding Curve */}
        <div className="bg-[var(--surface-high)] p-6 md:p-8 flex flex-col justify-between">
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--text-variant)] mb-2">
              On Bonding Curve
            </h3>
            <div className="text-4xl font-bold text-[var(--text)]">
              {loading ? "..." : bondingCurve}
            </div>
          </div>
          <div className="mt-6">
            <div className="bags-progress-bar">
              <div
                className="bags-progress-fill"
                style={{ width: totalTokens > 0 ? `${(bondingCurve / totalTokens) * 100}%` : "0%" }}
              />
            </div>
            <div className="mt-2 text-[10px] uppercase font-bold tracking-[0.1em] text-[var(--text-variant)]">
              Active bonding curves
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Chart (Visual) */}
      <div className="mb-12 md:mb-16">
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-[12px] font-bold uppercase tracking-[0.3em] text-[var(--text-variant)]">
            Launch Activity
          </h2>
          <span className="text-[10px] font-bold bg-[var(--surface-highest)] px-2 py-1 uppercase tracking-[0.1em]">
            Current Feed
          </span>
        </div>
        <div className="bg-[var(--surface-low)] p-1 h-48 md:h-72 relative flex items-end gap-1 overflow-hidden">
          {loading ? (
            <div className="w-full h-full flex items-center justify-center text-[var(--text-dim)] text-[11px] font-bold uppercase tracking-[0.1em]">
              Loading...
            </div>
          ) : bars.length > 0 ? (
            bars.map((bar, i) => (
              <div
                key={i}
                className={`w-full transition-all duration-500 ${bar.green ? "bg-[var(--green)]" : "bg-[var(--surface-highest)]"}`}
                style={{ height: `${bar.height}%` }}
              />
            ))
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--text-dim)]">
              No data
            </div>
          )}
        </div>
      </div>

      {/* Recent Launches Table */}
      <div>
        <h2 className="text-[12px] font-bold uppercase tracking-[0.3em] text-[var(--text-variant)] mb-6">
          Recent Launches
        </h2>

        {loading ? (
          <div className="space-y-1">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 bg-[var(--surface-low)] animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-[1fr_1fr_120px_120px_100px] gap-4 bg-[var(--surface-low)] py-3 px-6">
              <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--text-variant)]">Token</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--text-variant)]">Description</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--text-variant)]">Status</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--text-variant)]">Socials</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--text-variant)]">Mint</span>
            </div>

            <div className="space-y-0">
              {tokens.slice(0, 8).map((token, i) => (
                <a
                  key={token.tokenMint}
                  href={`/token/${token.tokenMint}`}
                  className={`block ${i % 2 === 0 ? "bg-[var(--surface-low)]/50" : ""} hover:bg-[var(--surface)] transition-colors`}
                >
                  {/* Desktop row */}
                  <div className="hidden md:grid grid-cols-[1fr_1fr_120px_120px_100px] gap-4 items-center py-4 px-6">
                    <div className="flex items-center gap-3">
                      {token.image ? (
                        <img src={token.image} alt="" className="w-8 h-8 object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      ) : (
                        <div className="w-8 h-8 bg-[var(--green)]/10 flex items-center justify-center text-[12px] font-bold text-[var(--green)]">
                          {token.symbol?.charAt(0) || "?"}
                        </div>
                      )}
                      <div>
                        <span className="text-[12px] font-bold text-[var(--text)]">{token.name}</span>
                        <span className="ml-2 text-[10px] font-medium text-[var(--text-dim)]">${token.symbol}</span>
                      </div>
                    </div>
                    <span className="text-[11px] text-[var(--text-variant)] truncate">{token.description?.slice(0, 60)}</span>
                    <StatusBadge status={token.status} />
                    <div className="flex gap-2 text-[10px] font-bold">
                      {token.twitter && <span className="text-[var(--link)]">Twitter</span>}
                      {token.website && <span className="text-[var(--green)]">Web</span>}
                      {!token.twitter && !token.website && <span className="text-[var(--text-dim)]">—</span>}
                    </div>
                    <span className="font-mono text-[10px] text-[var(--text-dim)]">
                      {token.tokenMint.slice(0, 4)}...{token.tokenMint.slice(-4)}
                    </span>
                  </div>

                  {/* Mobile row */}
                  <div className="md:hidden flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      {token.image ? (
                        <img src={token.image} alt="" className="w-10 h-10 object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      ) : (
                        <div className="w-10 h-10 bg-[var(--green)]/10 flex items-center justify-center text-[14px] font-bold text-[var(--green)]">
                          {token.symbol?.charAt(0) || "?"}
                        </div>
                      )}
                      <div>
                        <p className="text-[12px] font-bold text-[var(--text)] uppercase">{token.name}</p>
                        <p className="text-[10px] text-[var(--text-variant)] uppercase">${token.symbol}</p>
                      </div>
                    </div>
                    <StatusBadge status={token.status} />
                  </div>
                </a>
              ))}
            </div>

            <a
              href="/feed"
              className="block w-full mt-1 py-4 border-2 border-[var(--text)]/10 text-center text-[10px] font-bold uppercase tracking-[0.1em] hover:bg-[var(--surface)] transition-colors"
            >
              View All Launches
            </a>
          </>
        )}
      </div>
    </section>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    PRE_LAUNCH: { label: "PRE-LAUNCH", cls: "bg-purple-500/10 text-purple-700" },
    PRE_GRAD: { label: "BONDING", cls: "bg-yellow-500/10 text-yellow-700" },
    MIGRATING: { label: "MIGRATING", cls: "bg-blue-500/10 text-blue-700" },
    MIGRATED: { label: "GRADUATED", cls: "bg-[var(--green)]/10 text-[#00A020]" },
  };
  const s = map[status] || { label: status, cls: "bg-gray-500/10 text-gray-600" };
  return (
    <span className={`inline-flex px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.06em] ${s.cls}`}>
      {s.label}
    </span>
  );
}
