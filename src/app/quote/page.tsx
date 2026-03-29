"use client";

import { useState } from "react";
import Link from "next/link";

interface RouteLeg {
  ammKey: string;
  label: string;
  inputMint: string;
  outputMint: string;
  feeAmount: string;
  feeMint: string;
}

interface QuoteResult {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  otherAmountThreshold: string;
  priceImpactPct: string;
  routePlan: {
    swapInfo: RouteLeg;
    percent: number;
  }[];
  slippageBps: number;
}

export default function QuotePage() {
  const [mint, setMint] = useState("");
  const [amount, setAmount] = useState("1");
  const [slippage, setSlippage] = useState("1");
  const [quote, setQuote] = useState<QuoteResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchQuote = async () => {
    const trimmed = mint.trim();
    if (!trimmed) { setError("Enter a token mint address"); return; }
    const solAmount = parseFloat(amount);
    if (!solAmount || solAmount <= 0) { setError("Enter a valid SOL amount"); return; }

    setLoading(true);
    setError("");
    setQuote(null);

    try {
      const lamports = Math.round(solAmount * 1e9);
      const slippageBps = Math.round(parseFloat(slippage) * 100);
      const url = `/api/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=${trimmed}&amount=${lamports}&slippageBps=${slippageBps}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.error) {
        setError(json.error);
      } else {
        setQuote(json);
      }
    } catch {
      setError("Network error — could not fetch quote");
    } finally {
      setLoading(false);
    }
  };

  const fmtTokens = (raw: string, decimals = 6) => {
    const n = parseInt(raw, 10) / Math.pow(10, decimals);
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
    if (n >= 1_000) return (n / 1_000).toFixed(2) + "K";
    return n.toLocaleString(undefined, { maximumFractionDigits: 4 });
  };

  return (
    <section style={{ padding: "24px 16px 64px" }}>
      {/* Back link */}
      <Link
        href="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "12px",
          fontWeight: 700,
          color: "var(--text-2)",
          textDecoration: "none",
          marginBottom: "24px",
          letterSpacing: "0.05em",
          textTransform: "uppercase" as const,
        }}
      >
        &larr; Back
      </Link>

      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <h2 style={{
          fontSize: "11px", fontWeight: 700, textTransform: "uppercase" as const,
          letterSpacing: "0.3em", color: "var(--text-3)", marginBottom: "12px",
        }}>
          Trade Quote
        </h2>
        <h1 style={{
          fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 700,
          lineHeight: 1.05, letterSpacing: "-0.03em", color: "var(--text)",
        }}>
          Price <span style={{ color: "var(--green)" }}>Check</span>
        </h1>
      </div>

      {/* Form */}
      <div style={{
        background: "var(--card)", border: "1px solid var(--border)",
        padding: "24px", marginBottom: "16px",
      }}>
        <label style={labelStyle}>Token Mint Address</label>
        <input
          type="text"
          value={mint}
          onChange={e => setMint(e.target.value)}
          placeholder="Enter token mint address..."
          style={inputStyle}
          onKeyDown={e => e.key === "Enter" && fetchQuote()}
        />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "16px" }}>
          <div>
            <label style={labelStyle}>SOL Amount</label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              min="0.001"
              step="0.1"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Slippage %</label>
            <input
              type="number"
              value={slippage}
              onChange={e => setSlippage(e.target.value)}
              min="0.1"
              step="0.1"
              max="50"
              style={inputStyle}
            />
          </div>
        </div>

        <button
          onClick={fetchQuote}
          disabled={loading}
          style={{
            marginTop: "20px", width: "100%", padding: "14px",
            background: loading ? "var(--border)" : "var(--green)",
            color: loading ? "var(--text-3)" : "#000",
            border: "none", fontSize: "13px", fontWeight: 700,
            textTransform: "uppercase" as const, letterSpacing: "0.1em",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Fetching..." : "Get Quote"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          border: "2px solid var(--error)", background: "rgba(211,47,47,0.08)",
          padding: "16px", marginBottom: "16px", textAlign: "center",
        }}>
          <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--error)" }}>{error}</p>
        </div>
      )}

      {/* Results */}
      {quote && (
        <div className="animate-slide-up" style={{
          background: "var(--card)", border: "1px solid var(--border)", padding: "24px",
        }}>
          <h3 style={{
            fontSize: "11px", fontWeight: 700, textTransform: "uppercase" as const,
            letterSpacing: "0.2em", color: "var(--text-3)", marginBottom: "20px",
          }}>
            Quote Result
          </h3>

          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "1px",
            background: "var(--border)",
          }}>
            <StatCard label="Output Amount" value={fmtTokens(quote.outAmount)} accent />
            <StatCard label="Price Impact" value={`${parseFloat(quote.priceImpactPct).toFixed(4)}%`} warn={parseFloat(quote.priceImpactPct) > 5} />
            <StatCard label="Min Output" value={fmtTokens(quote.otherAmountThreshold)} />
            <StatCard label="Slippage" value={`${(quote.slippageBps / 100).toFixed(2)}%`} />
          </div>

          {/* Route legs */}
          {quote.routePlan && quote.routePlan.length > 0 && (
            <div style={{ marginTop: "20px" }}>
              <h4 style={{
                fontSize: "10px", fontWeight: 700, textTransform: "uppercase" as const,
                letterSpacing: "0.15em", color: "var(--text-3)", marginBottom: "10px",
              }}>
                Route ({quote.routePlan.length} leg{quote.routePlan.length > 1 ? "s" : ""})
              </h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {quote.routePlan.map((leg, i) => (
                  <span key={i} style={{
                    display: "inline-flex", alignItems: "center", gap: "6px",
                    padding: "6px 12px", fontSize: "11px", fontWeight: 600,
                    background: "var(--green-10)", color: "var(--green)",
                    border: "1px solid var(--green)",
                    borderColor: "rgba(0,214,43,0.2)",
                  }}>
                    {leg.swapInfo.label}
                    <span style={{ color: "var(--text-3)", fontWeight: 400 }}>{leg.percent}%</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function StatCard({ label, value, accent, warn }: { label: string; value: string; accent?: boolean; warn?: boolean }) {
  return (
    <div style={{
      background: "var(--card)", padding: "16px",
    }}>
      <p style={{
        fontSize: "10px", fontWeight: 700, textTransform: "uppercase" as const,
        letterSpacing: "0.1em", color: "var(--text-3)", marginBottom: "6px",
      }}>
        {label}
      </p>
      <p style={{
        fontSize: "18px", fontWeight: 700,
        color: warn ? "var(--error)" : accent ? "var(--green)" : "var(--text)",
        fontFamily: "monospace",
      }}>
        {value}
      </p>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "10px", fontWeight: 700,
  textTransform: "uppercase", letterSpacing: "0.1em",
  color: "var(--text-3)", marginBottom: "6px",
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "12px 14px",
  background: "var(--bg)", border: "1px solid var(--border)",
  color: "var(--text)", fontSize: "14px", fontFamily: "monospace",
  outline: "none", boxSizing: "border-box",
};
