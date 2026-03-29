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
  dbcPoolKey: string | null;
}

const STATUS: Record<string, { label: string; cls: string }> = {
  PRE_LAUNCH: { label: "PRE-LAUNCH", cls: "badge-purple" },
  PRE_GRAD: { label: "BONDING CURVE", cls: "badge-yellow" },
  MIGRATING: { label: "MIGRATING", cls: "badge-blue" },
  MIGRATED: { label: "GRADUATED", cls: "badge-green" },
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
      if (json.success) {
        setTokens(json.data);
        setLastUpdate(new Date());
        setError("");
      } else {
        setError(json.error || "Failed to fetch feed");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeed();
    const iv = setInterval(fetchFeed, 30000);
    return () => clearInterval(iv);
  }, [fetchFeed]);

  const filtered = filter === "ALL" ? tokens : tokens.filter((t) => t.status === filter);

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-[-0.02em]">Launch Feed</h1>
          <p className="mt-0.5 text-[11px] text-[var(--text-secondary)]">
            Real-time Bags token launches — auto-refreshes every 30s
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdate && (
            <span className="flex items-center gap-1.5 text-[10px] text-[var(--text-tertiary)]">
              <span className="h-1.5 w-1.5 bg-[var(--green)]" />
              {lastUpdate.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={() => { setLoading(true); fetchFeed(); }}
            className="btn-secondary py-1 px-3 text-[10px]"
          >
            REFRESH
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-5 flex gap-[1px] bg-[var(--border)] w-fit">
        {["ALL", "PRE_LAUNCH", "PRE_GRAD", "MIGRATING", "MIGRATED"].map((s) => {
          const active = filter === s;
          const label = s === "ALL" ? "ALL" : STATUS[s]?.label || s;
          const count = s === "ALL" ? tokens.length : tokens.filter((t) => t.status === s).length;
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 text-[10px] font-bold tracking-[0.04em] transition-colors ${
                active
                  ? "bg-[var(--text)] text-white"
                  : "bg-[var(--bg-card)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]"
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
        <div className="grid grid-cols-1 gap-[1px] bg-[var(--border)] md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-36 animate-pulse bg-[var(--bg-card)]" />
          ))}
        </div>
      ) : error ? (
        <div className="border border-red-200 bg-red-50 p-8 text-center">
          <p className="text-[12px] font-medium text-red-700">{error}</p>
          <button
            onClick={() => { setLoading(true); fetchFeed(); }}
            className="btn-secondary mt-4 text-[10px] border-red-300 text-red-600"
          >
            RETRY
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="border border-[var(--border)] bg-[var(--bg-card)] p-12 text-center">
          <p className="text-[12px] text-[var(--text-secondary)]">No tokens with this filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-[1px] bg-[var(--border)] md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((token, i) => (
            <TokenCard key={token.tokenMint} token={token} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

function TokenCard({ token, index }: { token: TokenLaunch; index: number }) {
  const status = STATUS[token.status] || { label: token.status, cls: "badge-gray" };

  return (
    <a
      href={`/token/${token.tokenMint}`}
      className="animate-slide-up group bg-[var(--bg-card)] p-4 transition-colors hover:bg-[var(--bg-card-hover)]"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="flex items-start gap-3">
        {token.image ? (
          <img
            src={token.image}
            alt={token.name}
            className="h-10 w-10 object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center bg-[var(--green-light)] text-[14px] font-bold text-[var(--green)]">
            {token.symbol?.charAt(0) || "?"}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-[12px] font-bold group-hover:text-[var(--green)] transition-colors">
              {token.name}
            </h3>
            <span className="shrink-0 text-[10px] font-medium text-[var(--text-tertiary)]">
              ${token.symbol}
            </span>
          </div>
          <div className="mt-1">
            <span className={`badge ${status.cls}`}>{status.label}</span>
          </div>
        </div>
      </div>

      {token.description && (
        <p className="mt-2.5 line-clamp-2 text-[11px] leading-[1.5] text-[var(--text-secondary)]">
          {token.description}
        </p>
      )}

      <div className="mt-2.5 flex items-center gap-2 text-[10px]">
        {token.twitter && <span className="font-medium text-[var(--link)]">Twitter</span>}
        {token.website && <span className="font-medium text-[var(--green)]">Website</span>}
        <span className="ml-auto font-mono text-[var(--text-tertiary)]">
          {token.tokenMint.slice(0, 6)}...{token.tokenMint.slice(-4)}
        </span>
      </div>
    </a>
  );
}
