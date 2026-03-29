"use client";

import { useEffect, useState, useCallback } from "react";

interface Pool {
  tokenMint: string;
  dammV2PoolKey?: string | null;
  [key: string]: unknown;
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch(() => {});
}

export default function ExplorePage() {
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "graduated">("all");
  const [copiedMint, setCopiedMint] = useState<string | null>(null);

  const fetchPools = useCallback(async (onlyMigrated: boolean) => {
    setLoading(true);
    setError("");
    try {
      const url = onlyMigrated ? "/api/pools?onlyMigrated=true" : "/api/pools";
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) setPools(json.data);
      else setError(json.error || "Failed to load pools");
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPools(filter === "graduated");
  }, [filter, fetchPools]);

  const handleCopy = (mint: string) => {
    copyToClipboard(mint);
    setCopiedMint(mint);
    setTimeout(() => setCopiedMint(null), 1500);
  };

  return (
    <section className="px-4 sm:px-6 md:px-8 lg:px-10 pt-6 pb-16 mx-auto max-w-4xl">
      {/* Back */}
      <a href="/" className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[var(--text-2)] hover:text-[var(--green)] transition-colors mb-6">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
        Back
      </a>

      {/* Title */}
      <div className="mb-8">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.3em] text-[var(--text-3)] mb-3">
          Browse Pools
        </h2>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <h1 className="text-[36px] md:text-[48px] font-bold leading-[1.05] tracking-tighter text-[var(--text)]">
            Token <span className="text-[var(--green)]">Explorer</span>
          </h1>
          {!loading && (
            <span className="text-[12px] font-bold text-[var(--text-3)]">
              {pools.length} pool{pools.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="mb-6">
        <div className="flex gap-[1px]">
          {([["all", "All"], ["graduated", "Graduated Only"]] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.06em] transition-colors ${
                filter === key
                  ? "bg-[var(--text)] text-[var(--bg)]"
                  : "bg-[var(--card)] border border-[var(--border)] text-[var(--text-2)] hover:text-[var(--text)] hover:border-[var(--green)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-14 bg-[var(--card)] border border-[var(--border)] animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="border-2 border-[var(--error)]/30 bg-[var(--error)]/5 p-8 text-center">
          <p className="text-[12px] font-bold text-[var(--error)]">{error}</p>
          <button
            onClick={() => fetchPools(filter === "graduated")}
            className="mt-4 py-2 px-6 border-2 border-[var(--error)]/30 text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--error)] hover:bg-[var(--error)]/10 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : pools.length === 0 ? (
        <div className="bg-[var(--card)] border border-[var(--border)] p-12 text-center">
          <p className="text-[12px] font-bold text-[var(--text-3)]">No pools found.</p>
        </div>
      ) : (
        <>
          {/* Table header */}
          <div className="hidden sm:flex items-center px-4 py-2 text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--text-3)]">
            <span className="flex-1">Token Mint</span>
            <span className="w-28 text-center">Status</span>
            <span className="w-20 text-center">Copy</span>
          </div>

          {/* Rows */}
          <div className="space-y-[1px]">
            {pools.map((pool, i) => {
              const migrated = !!pool.dammV2PoolKey;
              return (
                <div
                  key={pool.tokenMint}
                  className="animate-slide-up flex flex-col sm:flex-row sm:items-center bg-[var(--card)] border border-[var(--border)] px-4 py-3 gap-2 sm:gap-0 group hover:border-[var(--green)] transition-colors"
                  style={{ animationDelay: `${Math.min(i, 20) * 25}ms` }}
                >
                  {/* Mint (clickable) */}
                  <a
                    href={`/?mint=${pool.tokenMint}`}
                    className="flex-1 font-mono text-[13px] font-bold text-[var(--text)] group-hover:text-[var(--green)] transition-colors truncate"
                  >
                    <span className="sm:hidden">{pool.tokenMint.slice(0, 8)}...{pool.tokenMint.slice(-6)}</span>
                    <span className="hidden sm:inline">{pool.tokenMint.slice(0, 12)}...{pool.tokenMint.slice(-8)}</span>
                  </a>

                  {/* Status */}
                  <div className="w-28 flex sm:justify-center">
                    <span className={`inline-flex px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.06em] ${
                      migrated
                        ? "bg-[var(--green)]/10 text-[var(--green)] border border-[var(--green)]/20"
                        : "bg-[var(--text-3)]/10 text-[var(--text-2)] border border-[var(--text-3)]/20"
                    }`}>
                      {migrated ? "Graduated" : "Bonding"}
                    </span>
                  </div>

                  {/* Copy button */}
                  <div className="w-20 flex sm:justify-center">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleCopy(pool.tokenMint); }}
                      className={`py-1 px-3 text-[10px] font-bold uppercase tracking-[0.06em] border transition-colors ${
                        copiedMint === pool.tokenMint
                          ? "bg-[var(--green-10)] border-[var(--green)] text-[var(--green)]"
                          : "bg-[var(--card)] border-[var(--border)] text-[var(--text-3)] hover:border-[var(--green)] hover:text-[var(--green)]"
                      }`}
                    >
                      {copiedMint === pool.tokenMint ? "Copied" : "Copy CA"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
