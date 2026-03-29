"use client";

import { useState, useEffect } from "react";
import ToolNav from "../ToolNav";

interface QuoteResult {
  requestId: string;
  inAmount: string;
  outAmount: string;
  minOutAmount: string;
  priceImpactPct: string;
  slippageBps: number;
  routePlan: { venue: string; inAmount: string; outAmount: string; inputMint: string; outputMint: string }[];
  platformFee?: { amount: string; feeBps: number } | null;
}

export default function QuotePage() {
  const [mint, setMint] = useState("");
  const [amount, setAmount] = useState("1");
  const [quote, setQuote] = useState<QuoteResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const el = document.querySelector('[data-video-bg]');
    if (el) el.classList.add('video-blur');
    return () => { if (el) el.classList.remove('video-blur'); };
  }, []);

  const fetchQuote = async () => {
    const trimmed = mint.trim();
    if (!trimmed || trimmed.length < 32) { setError("Enter a valid token mint"); return; }
    const sol = parseFloat(amount);
    if (!sol || sol <= 0) { setError("Enter a valid SOL amount"); return; }

    setLoading(true);
    setError("");
    setQuote(null);

    try {
      const lamports = Math.round(sol * 1e9);
      const res = await fetch(`/api/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=${trimmed}&amount=${lamports}`);
      const json = await res.json();
      if (!json.success) { setError(json.error || "Failed to get quote"); return; }
      setQuote(json.data);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const fmtTokens = (raw: string) => {
    const n = parseInt(raw) / 1e9;
    if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(2) + "K";
    return n.toLocaleString(undefined, { maximumFractionDigits: 4 });
  };

  return (
    <>
      <ToolNav />
      <div className="max-w-2xl mx-auto px-4 py-8">
      <div className={!quote ? 'flex flex-col items-center justify-center min-h-[60vh]' : ''}>
        <div className="text-center mb-6">
          <h1 className="text-[28px] md:text-[36px] font-bold tracking-tighter text-[var(--text)] mt-4 mb-1">
            Price <span className="text-[var(--green)]">Check</span>
          </h1>
          <p className="text-[13px] text-[var(--text-2)]">Get a trade quote for any Bags token</p>
        </div>

        {/* Form */}
        <div className="bg-[var(--card)] border border-[var(--border)] p-5 mb-4 w-full">
        <label className="block text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--text-3)] mb-1.5">Token Mint</label>
        <input
          type="text"
          value={mint}
          onChange={e => setMint(e.target.value)}
          placeholder="Paste token mint address..."
          className="w-full bg-[var(--bg)] border border-[var(--border)] px-3 py-3 text-[14px] text-[var(--text)] placeholder:text-[var(--text-3)] outline-none font-mono focus:border-[var(--green)] mb-3"
          onKeyDown={e => e.key === "Enter" && fetchQuote()}
        />

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--text-3)] mb-1.5">SOL Amount</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} min="0.001" step="0.1"
              className="w-full bg-[var(--bg)] border border-[var(--border)] px-3 py-3 text-[14px] text-[var(--text)] outline-none font-mono focus:border-[var(--green)]" />
          </div>
          <div className="flex items-end">
            <button onClick={fetchQuote} disabled={loading}
              className="w-full bg-[var(--green)] text-white font-bold py-3 text-[13px] uppercase tracking-[0.06em] hover:bg-[var(--green-hover)] disabled:opacity-50">
              {loading ? "..." : "Get Quote"}
            </button>
          </div>
        </div>
      </div>

        {error && <p className="text-[12px] font-bold text-[var(--error)] mb-4">{error}</p>}
      </div>

      {/* Results */}
      {quote && (
        <div className="animate-slide-up space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-[var(--card)] border border-[var(--border)] p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--text-3)] mb-1">You Get</p>
              <p className="text-[18px] font-bold text-[var(--green)] font-mono">{fmtTokens(quote.outAmount)}</p>
            </div>
            <div className="bg-[var(--card)] border border-[var(--border)] p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--text-3)] mb-1">Price Impact</p>
              <p className={`text-[18px] font-bold font-mono ${parseFloat(quote.priceImpactPct) > 5 ? "text-[var(--error)]" : "text-[var(--text)]"}`}>
                {parseFloat(quote.priceImpactPct).toFixed(4)}%
              </p>
            </div>
            <div className="bg-[var(--card)] border border-[var(--border)] p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--text-3)] mb-1">Min Output</p>
              <p className="text-[18px] font-bold text-[var(--text)] font-mono">{fmtTokens(quote.minOutAmount)}</p>
            </div>
            <div className="bg-[var(--card)] border border-[var(--border)] p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--text-3)] mb-1">Slippage</p>
              <p className="text-[18px] font-bold text-[var(--text)] font-mono">{(quote.slippageBps / 100).toFixed(1)}%</p>
            </div>
          </div>

          {quote.routePlan?.length > 0 && (
            <div className="bg-[var(--card)] border border-[var(--border)] p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--text-3)] mb-2">Route</p>
              <div className="flex flex-wrap gap-2">
                {quote.routePlan.map((leg, i) => (
                  <span key={i} className="bg-[var(--green-10)] border border-[var(--green)]/20 text-[var(--green)] text-[11px] font-bold px-3 py-1.5">
                    {leg.venue}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
    </>
  );
}
