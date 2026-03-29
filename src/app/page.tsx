"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [mint, setMint] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = mint.trim();
    if (!trimmed) { setError("Enter a token mint address"); return; }
    if (trimmed.length < 32 || trimmed.length > 44) { setError("Invalid Solana address"); return; }
    router.push(`/token/${trimmed}`);
  };

  return (
    <div className="flex flex-col items-center">
      {/* Hero */}
      <div className="mt-16 mb-12 text-center">
        <div className="mb-5 inline-flex items-center gap-2 border border-[var(--border)] px-3 py-1">
          <span className="h-1.5 w-1.5 bg-[var(--green)]" />
          <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--text-secondary)]">
            Bags Hackathon
          </span>
        </div>
        <h1 className="mb-3 text-[72px] font-bold leading-[0.95] tracking-[-0.03em] text-[var(--text)]">
          Fee Revenue
          <br />
          Dashboard
        </h1>
        <p className="mx-auto max-w-md text-[13px] leading-relaxed text-[var(--text-secondary)]">
          Track lifetime fees, claim history, and analytics for any Bags.fm
          token. Paste a mint address to get started.
        </p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="w-full max-w-xl">
        <div className="flex border border-[var(--border-strong)] bg-[var(--bg-card)] transition-colors focus-within:border-[var(--text)]">
          <input
            type="text"
            value={mint}
            onChange={(e) => { setMint(e.target.value); setError(""); }}
            placeholder="Paste token mint address..."
            className="flex-1 bg-transparent px-4 py-3 text-[12px] text-[var(--text)] placeholder-[var(--text-tertiary)] outline-none font-mono"
          />
          <button type="submit" className="btn-primary px-6">
            Analyze
          </button>
        </div>
        {error && (
          <p className="mt-2 text-[10px] font-medium text-red-600">{error}</p>
        )}
      </form>

      {/* Stats Row */}
      <div className="mt-14 grid w-full max-w-xl grid-cols-3 gap-[1px] bg-[var(--border)]">
        <Stat label="DATA SOURCE" value="Bags API" />
        <Stat label="ANALYTICS" value="Fee Tracking" />
        <Stat label="LAUNCH FEED" value="Live" highlight />
      </div>

      {/* Feature Grid */}
      <div className="mt-10 grid w-full max-w-3xl grid-cols-2 gap-[1px] bg-[var(--border)]">
        <Feature
          title="LIFETIME FEES"
          desc="Total fees earned by any Bags token since launch. Cumulative revenue in real-time."
        />
        <Feature
          title="CLAIM HISTORY"
          desc="Full timeline of fee claims — who claimed, when, and how much."
        />
        <Feature
          title="CREATOR INFO"
          desc="See who launched the token, social profiles, and fee share config."
        />
        <Feature
          title="LAUNCH FEED"
          desc="Real-time feed of new Bags token launches with status and metadata."
          href="/feed"
        />
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="bg-[var(--bg-card)] p-4">
      <p className="text-[9px] font-bold tracking-[0.08em] text-[var(--text-tertiary)]">{label}</p>
      <p className={`mt-1 text-[14px] font-bold ${highlight ? "text-[var(--green)]" : "text-[var(--text)]"}`}>
        {value}
      </p>
    </div>
  );
}

function Feature({ title, desc, href }: { title: string; desc: string; href?: string }) {
  const Tag = href ? "a" : "div";
  return (
    <Tag
      {...(href ? { href } : {})}
      className="group bg-[var(--bg-card)] p-6 transition-colors hover:bg-[var(--bg-card-hover)]"
    >
      <p className="mb-2 text-[10px] font-bold tracking-[0.08em] text-[var(--green)]">{title}</p>
      <p className="text-[11px] leading-[1.6] text-[var(--text-secondary)]">{desc}</p>
      {href && (
        <span className="mt-3 inline-block text-[10px] font-bold uppercase tracking-[0.06em] text-[var(--link)] group-hover:text-[var(--green)]">
          View &rarr;
        </span>
      )}
    </Tag>
  );
}
