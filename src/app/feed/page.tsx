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

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PRE_LAUNCH: { label: "Pre-Launch", color: "text-purple-400 bg-purple-400/10" },
  PRE_GRAD: { label: "Bonding Curve", color: "text-yellow-400 bg-yellow-400/10" },
  MIGRATING: { label: "Migrating", color: "text-blue-400 bg-blue-400/10" },
  MIGRATED: { label: "Graduated", color: "text-green-400 bg-green-400/10" },
};

export default function FeedPage() {
  const [tokens, setTokens] = useState<TokenLaunch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<string>("ALL");
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
      setError("Network error — could not reach API");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeed();
    const interval = setInterval(fetchFeed, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [fetchFeed]);

  const filtered =
    filter === "ALL" ? tokens : tokens.filter((t) => t.status === filter);

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Launch Feed</h1>
          <p className="mt-1 text-[var(--text-secondary)]">
            Real-time Bags token launches — auto-refreshes every 30s
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdate && (
            <span className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              Updated {lastUpdate.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={() => { setLoading(true); fetchFeed(); }}
            className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-1.5 text-sm font-medium transition-colors hover:bg-[var(--bg-card-hover)]"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-2">
        {["ALL", "PRE_LAUNCH", "PRE_GRAD", "MIGRATING", "MIGRATED"].map(
          (s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                filter === s
                  ? "bg-purple-500/20 text-purple-300 shadow-sm"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-card)]"
              }`}
            >
              {s === "ALL" ? "All" : STATUS_LABELS[s]?.label || s}
              {s !== "ALL" && (
                <span className="ml-1.5 text-xs opacity-60">
                  {tokens.filter((t) => t.status === s).length}
                </span>
              )}
            </button>
          )
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-xl border border-[var(--border)] bg-[var(--bg-card)]"
            />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-8 text-center">
          <p className="text-red-400">{error}</p>
          <button
            onClick={() => { setLoading(true); fetchFeed(); }}
            className="mt-4 rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400 hover:bg-red-500/20"
          >
            Retry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-12 text-center">
          <p className="text-[var(--text-secondary)]">
            No tokens found with this filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((token, i) => (
            <TokenCard key={token.tokenMint} token={token} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

function TokenCard({ token, index }: { token: TokenLaunch; index: number }) {
  const status = STATUS_LABELS[token.status] || {
    label: token.status,
    color: "text-gray-400 bg-gray-400/10",
  };

  return (
    <a
      href={`/token/${token.tokenMint}`}
      className="animate-slide-up group rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5 transition-all hover:border-purple-500/30 hover:bg-[var(--bg-card-hover)] hover:shadow-lg hover:shadow-purple-500/5"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-start gap-3">
        {token.image ? (
          <img
            src={token.image}
            alt={token.name}
            className="h-12 w-12 rounded-xl object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 text-lg font-bold text-purple-400">
            {token.symbol?.charAt(0) || "?"}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-semibold group-hover:text-purple-300 transition-colors">
              {token.name}
            </h3>
            <span className="shrink-0 text-xs font-medium text-[var(--text-secondary)]">
              ${token.symbol}
            </span>
          </div>
          <div className="mt-1">
            <span
              className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${status.color}`}
            >
              {status.label}
            </span>
          </div>
        </div>
      </div>

      {token.description && (
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-[var(--text-secondary)]">
          {token.description}
        </p>
      )}

      <div className="mt-3 flex items-center gap-3">
        {token.twitter && (
          <span className="text-xs text-blue-400">Twitter</span>
        )}
        {token.website && (
          <span className="text-xs text-green-400">Website</span>
        )}
        <span className="ml-auto font-mono text-xs text-[var(--text-secondary)]">
          {token.tokenMint.slice(0, 6)}...{token.tokenMint.slice(-4)}
        </span>
      </div>
    </a>
  );
}
