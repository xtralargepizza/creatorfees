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
    if (!trimmed) {
      setError("Enter a token mint address");
      return;
    }
    if (trimmed.length < 32 || trimmed.length > 44) {
      setError("Invalid Solana address");
      return;
    }
    router.push(`/token/${trimmed}`);
  };

  return (
    <div className="flex flex-col items-center">
      {/* Hero */}
      <div className="mt-12 mb-16 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/5 px-4 py-1.5 text-sm text-purple-400">
          <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
          Bags Hackathon Entry
        </div>
        <h1 className="mb-4 text-5xl font-extrabold tracking-tight leading-tight">
          Fee Revenue
          <br />
          <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Dashboard
          </span>
        </h1>
        <p className="mx-auto max-w-lg text-lg text-[var(--text-secondary)]">
          Track lifetime fees, claim history, and analytics for any Bags.fm
          token. Paste a mint address to get started.
        </p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="w-full max-w-2xl">
        <div className="group relative">
          <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-cyan-500/20 opacity-0 blur transition-opacity group-focus-within:opacity-100" />
          <div className="relative flex items-center rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] transition-colors group-focus-within:border-purple-500/40">
            <svg
              className="ml-5 h-5 w-5 text-[var(--text-secondary)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              value={mint}
              onChange={(e) => {
                setMint(e.target.value);
                setError("");
              }}
              placeholder="Paste token mint address..."
              className="flex-1 bg-transparent px-4 py-4 text-base text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 outline-none font-mono"
            />
            <button
              type="submit"
              className="mr-2 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition-all hover:shadow-purple-500/30 hover:brightness-110 active:scale-[0.98]"
            >
              Analyze
            </button>
          </div>
        </div>
        {error && (
          <p className="mt-3 text-center text-sm text-red-400">{error}</p>
        )}
      </form>

      {/* Quick Stats */}
      <div className="mt-16 grid w-full max-w-4xl grid-cols-3 gap-4">
        <QuickStat
          label="Data Source"
          value="Bags API"
          sub="Real-time on-chain data"
        />
        <QuickStat
          label="Analytics"
          value="Fee Tracking"
          sub="Lifetime fees, claims, creators"
        />
        <QuickStat
          label="Launch Feed"
          value="Live"
          sub="New tokens as they launch"
          highlight
        />
      </div>

      {/* Feature Cards */}
      <div className="mt-12 grid w-full max-w-4xl grid-cols-1 gap-4 md:grid-cols-2">
        <FeatureCard
          icon={
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          }
          title="Lifetime Fee Revenue"
          description="See total fees earned by any Bags token since launch. Track cumulative revenue in real-time."
        />
        <FeatureCard
          icon={
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
            </svg>
          }
          title="Claim History"
          description="Full timeline of fee claims — who claimed, when, and how much. Track every fee event."
        />
        <FeatureCard
          icon={
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
            </svg>
          }
          title="Creator Info"
          description="See who launched the token, their social profiles, and fee share configuration."
        />
        <FeatureCard
          icon={
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
            </svg>
          }
          title="Launch Feed"
          description="Real-time feed of new Bags token launches. See status, socials, and metadata as tokens go live."
          href="/feed"
        />
      </div>
    </div>
  );
}

function QuickStat({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  sub: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5 transition-colors hover:border-[var(--border)]">
      <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
        {label}
      </p>
      <p className={`mt-1 text-xl font-bold ${highlight ? "text-green-400" : ""}`}>
        {value}
      </p>
      <p className="mt-0.5 text-xs text-[var(--text-secondary)]">{sub}</p>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href?: string;
}) {
  const Wrapper = href ? "a" : "div";
  return (
    <Wrapper
      {...(href ? { href } : {})}
      className="group rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6 transition-all hover:border-purple-500/30 hover:bg-[var(--bg-card-hover)]"
    >
      <div className="mb-3 inline-flex rounded-lg bg-purple-500/10 p-2.5 text-purple-400">
        {icon}
      </div>
      <h3 className="mb-1 text-base font-semibold">{title}</h3>
      <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
        {description}
      </p>
    </Wrapper>
  );
}
