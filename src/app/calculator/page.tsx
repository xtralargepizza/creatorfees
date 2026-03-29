"use client";

import { useState, useMemo } from "react";
import ToolNav from "../ToolNav";

const MIGRATION_THRESHOLD = 85; // SOL

const FEE_CONFIGS = [
  { label: "Default (2%)", prePct: 2, postPct: 2 },
  { label: "Low Pre / High Post (0.25% / 1%)", prePct: 0.25, postPct: 1 },
  { label: "High Pre / Low Post (1% / 0.25%)", prePct: 1, postPct: 0.25 },
  { label: "High Flat (10%)", prePct: 10, postPct: 10 },
];

const VOLUME_TIERS = [10_000, 50_000, 100_000, 500_000];

// Creator gets 50% of fees, protocol gets 50%
const CREATOR_SHARE = 0.5;

export default function CalculatorPage() {
  const [buyAmount, setBuyAmount] = useState("1");
  const [feeIdx, setFeeIdx] = useState(0);

  const config = FEE_CONFIGS[feeIdx];
  const solAmount = parseFloat(buyAmount) || 0;

  const results = useMemo(() => {
    // Determine if we're pre or post migration based on whether the buy pushes past threshold
    // For simplicity: show both pre-grad and post-grad fee scenarios
    const preFee = solAmount * (config.prePct / 100);
    const postFee = solAmount * (config.postPct / 100);
    const effectiveBuyPre = solAmount - preFee;
    const effectiveBuyPost = solAmount - postFee;

    const volumeRows = VOLUME_TIERS.map(dailyVol => {
      const preGradRevenue = dailyVol * (config.prePct / 100);
      const postGradRevenue = dailyVol * (config.postPct / 100);
      const creatorPre = preGradRevenue * CREATOR_SHARE;
      const creatorPost = postGradRevenue * CREATOR_SHARE;
      const protocolPre = preGradRevenue * (1 - CREATOR_SHARE);
      const protocolPost = postGradRevenue * (1 - CREATOR_SHARE);
      return {
        dailyVol,
        preGradRevenue,
        postGradRevenue,
        creatorPre,
        creatorPost,
        protocolPre,
        protocolPost,
        weeklyCreatorPost: creatorPost * 7,
        monthlyCreatorPost: creatorPost * 30,
      };
    });

    return { preFee, postFee, effectiveBuyPre, effectiveBuyPost, volumeRows };
  }, [solAmount, config]);

  return (
    <>
      <ToolNav />
      <section style={{ padding: "24px 16px 64px" }}>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <h2 style={{
          fontSize: "11px", fontWeight: 700, textTransform: "uppercase" as const,
          letterSpacing: "0.3em", color: "var(--text-3)", marginBottom: "12px",
        }}>
          Fee Estimator
        </h2>
        <h1 style={{
          fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 700,
          lineHeight: 1.05, letterSpacing: "-0.03em", color: "var(--text)",
        }}>
          Launch <span style={{ color: "var(--green)" }}>Calculator</span>
        </h1>
      </div>

      {/* Inputs */}
      <div style={{
        background: "var(--card)", border: "1px solid var(--border)",
        padding: "24px", marginBottom: "16px",
      }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <label style={labelStyle}>Initial Buy (SOL)</label>
            <input
              type="number"
              value={buyAmount}
              onChange={e => setBuyAmount(e.target.value)}
              min="0.01"
              step="0.5"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Fee Config</label>
            <select
              value={feeIdx}
              onChange={e => setFeeIdx(Number(e.target.value))}
              style={{ ...inputStyle, cursor: "pointer" }}
            >
              {FEE_CONFIGS.map((c, i) => (
                <option key={i} value={i}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Buy breakdown */}
        <div style={{
          marginTop: "20px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: "1px", background: "var(--border)",
        }}>
          <InfoCard label="Migration Threshold" value={`${MIGRATION_THRESHOLD} SOL`} />
          <InfoCard label={`Pre-Grad Fee (${config.prePct}%)`} value={`${results.preFee.toFixed(4)} SOL`} />
          <InfoCard label={`Post-Grad Fee (${config.postPct}%)`} value={`${results.postFee.toFixed(4)} SOL`} />
          <InfoCard label="Effective Buy (Pre)" value={`${results.effectiveBuyPre.toFixed(4)} SOL`} accent />
        </div>
      </div>

      {/* Volume revenue table */}
      <div className="animate-slide-up" style={{
        background: "var(--card)", border: "1px solid var(--border)", padding: "24px",
      }}>
        <h3 style={{
          fontSize: "11px", fontWeight: 700, textTransform: "uppercase" as const,
          letterSpacing: "0.2em", color: "var(--text-3)", marginBottom: "6px",
        }}>
          Daily Fee Revenue by Volume
        </h3>
        <p style={{ fontSize: "11px", color: "var(--text-2)", marginBottom: "20px" }}>
          Creator share: {(CREATOR_SHARE * 100).toFixed(0)}% &middot; Protocol share: {((1 - CREATOR_SHARE) * 100).toFixed(0)}%
        </p>

        {/* Desktop table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr>
                {["Daily Volume", "Total Fees (Pre)", "Creator (Pre)", "Total Fees (Post)", "Creator (Post)", "Weekly (Post)", "Monthly (Post)"].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.volumeRows.map(row => (
                <tr key={row.dailyVol}>
                  <td style={tdStyle}>${row.dailyVol.toLocaleString()}</td>
                  <td style={tdStyle}>${row.preGradRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                  <td style={{ ...tdStyle, color: "var(--green)", fontWeight: 600 }}>
                    ${row.creatorPre.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </td>
                  <td style={tdStyle}>${row.postGradRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                  <td style={{ ...tdStyle, color: "var(--green)", fontWeight: 600 }}>
                    ${row.creatorPost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </td>
                  <td style={tdStyle}>${row.weeklyCreatorPost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                  <td style={{ ...tdStyle, color: "var(--green)", fontWeight: 700 }}>
                    ${row.monthlyCreatorPost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Compounding note */}
        <div style={{
          marginTop: "20px", padding: "16px",
          background: "var(--green-10)", border: "1px solid rgba(0,214,43,0.2)",
        }}>
          <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--green)", marginBottom: "4px", textTransform: "uppercase" as const, letterSpacing: "0.1em" }}>
            Compounding Effect
          </p>
          <p style={{ fontSize: "12px", color: "var(--text-2)", lineHeight: 1.6 }}>
            If you reinvest daily creator fees back into the token, your effective position grows.
            At ${(results.volumeRows[2]?.creatorPost ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}/day
            ({FEE_CONFIGS[feeIdx].label}) with $100K daily volume, reinvesting over 30 days
            yields compounded returns above the simple ${(results.volumeRows[2]?.monthlyCreatorPost ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })} monthly figure.
          </p>
        </div>
      </div>
    </section>
    </>
  );
}

function InfoCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{ background: "var(--card)", padding: "16px" }}>
      <p style={{
        fontSize: "10px", fontWeight: 700, textTransform: "uppercase" as const,
        letterSpacing: "0.1em", color: "var(--text-3)", marginBottom: "6px",
      }}>
        {label}
      </p>
      <p style={{
        fontSize: "16px", fontWeight: 700, fontFamily: "monospace",
        color: accent ? "var(--green)" : "var(--text)",
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

const thStyle: React.CSSProperties = {
  textAlign: "left", padding: "10px 12px",
  fontSize: "10px", fontWeight: 700, textTransform: "uppercase",
  letterSpacing: "0.1em", color: "var(--text-3)",
  borderBottom: "2px solid var(--border)", whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: "10px 12px", borderBottom: "1px solid var(--border)",
  color: "var(--text)", fontFamily: "monospace", whiteSpace: "nowrap",
};
