"use client";

import { useEffect, useState, useCallback } from "react";

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

const STATUS: Record<string, { label: string; cls: string }> = {
  PRE_LAUNCH: { label: "PRE-LAUNCH", cls: "bg-purple-500/10 text-purple-700" },
  PRE_GRAD: { label: "BONDING CURVE", cls: "bg-yellow-500/10 text-yellow-700" },
  MIGRATING: { label: "MIGRATING", cls: "bg-blue-500/10 text-blue-700" },
  MIGRATED: { label: "GRADUATED", cls: "bg-[var(--green)]/10 text-[#00A020]" },
};

export default function FeedPage() {
  const [tokens, setTokens] = useState<TokenLaunch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchFeed = useCallback(async () => {
    try {
      const res = await fetch("/api/feed");
      const json = await res.json();
      if (json.success) { setTokens(json.data); setLastUpdate(new Date()); setError(""); }
      else setError(json.error);
    } catch { setError("Network error"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchFeed();
    const iv = setInterval(fetchFeed, 30000);
    return () => clearInterval(iv);
  }, [fetchFeed]);

  const filtered = filter === "ALL" ? tokens : tokens.filter(t => t.status === filter);

  return (
    <section className="px-6 md:px-8 pt-4 pb-16">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-[12px] font-bold uppercase tracking-[0.3em] text-[var(--text-variant)] mb-4">
          Token Launches
        </h2>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <h1 className="text-[48px] md:text-[72px] font-bold leading-[1.05] tracking-tighter text-[var(--text)]">
            Launch <span className="text-[var(--green)]">Feed</span>
          </h1>
          <div className="flex items-center gap-3">
            {lastUpdate && (
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-[0.1em]">
                <span className="w-2 h-2 bg-[var(--green)]" />
                {lastUpdate.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={() => { setLoading(true); fetchFeed(); }}
              className="py-2 px-4 border-2 border-[var(--text)]/10 text-[10px] font-bold uppercase tracking-[0.1em] hover:bg-[var(--surface)] transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-[1px] bg-[var(--surface-highest)] w-fit overflow-x-auto">
        {["ALL", "PRE_LAUNCH", "PRE_GRAD", "MIGRATING", "MIGRATED"].map(s => {
          const active = filter === s;
          const label = s === "ALL" ? "ALL" : STATUS[s]?.label || s;
          const count = s === "ALL" ? tokens.length : tokens.filter(t => t.status === s).length;
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-2 text-[10px] font-bold tracking-[0.06em] transition-colors whitespace-nowrap ${
                active
                  ? "bg-[var(--text)] text-white"
                  : "bg-[var(--surface-lowest)] text-[var(--text-variant)] hover:bg-[var(--surface-low)]"
              }`}
            >
              {label}
              <span className="ml-1 opacity-50">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 bg-[var(--surface-low)] animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="border-2 border-red-200 bg-red-50 p-8 text-center">
          <p className="text-[12px] font-bold text-red-700">{error}</p>
          <button onClick={() => { setLoading(true); fetchFeed(); }} className="mt-4 py-2 px-6 border-2 border-red-300 text-[10px] font-bold uppercase tracking-[0.1em] text-red-600 hover:bg-red-50">
            RETRY
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[var(--surface-low)] p-12 text-center">
          <p className="text-[12px] font-bold text-[var(--text-variant)]">No tokens with this filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
          {filtered.map((token, i) => (
            <TokenCard key={token.tokenMint} token={token} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}

function TokenCard({ token, index }: { token: TokenLaunch; index: number }) {
  const status = STATUS[token.status] || { label: token.status, cls: "bg-gray-500/10 text-gray-600" };

  return (
    <a
      href={`/token/${token.tokenMint}`}
      className="animate-slide-up group bg-[var(--surface-lowest)] p-5 transition-colors hover:bg-[var(--surface-low)]"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="flex items-start gap-3">
        {token.image ? (
          <img src={token.image} alt={token.name} className="h-10 w-10 object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center bg-[var(--green)]/10 text-[14px] font-bold text-[var(--green)]">
            {token.symbol?.charAt(0) || "?"}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-[12px] font-bold group-hover:text-[var(--green)] transition-colors">
              {token.name}
            </h3>
            <span className="shrink-0 text-[10px] font-medium text-[var(--text-dim)]">${token.symbol}</span>
          </div>
          <span className={`mt-1 inline-flex px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.06em] ${status.cls}`}>
            {status.label}
          </span>
        </div>
      </div>

      {token.description && (
        <p className="mt-3 line-clamp-2 text-[11px] leading-relaxed text-[var(--text-variant)]">
          {token.description}
        </p>
      )}

      <div className="mt-3 flex items-center gap-2 text-[10px]">
        {token.twitter && <span className="font-bold text-[var(--link)]">Twitter</span>}
        {token.website && <span className="font-bold text-[var(--green)]">Website</span>}
        <span className="ml-auto font-mono text-[var(--text-dim)]">
          {token.tokenMint.slice(0, 4)}...{token.tokenMint.slice(-4)}
        </span>
      </div>
    </a>
  );
}
