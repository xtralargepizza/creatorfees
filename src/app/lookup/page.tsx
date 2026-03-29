"use client";

import { useState, useCallback } from "react";

interface SocialResult {
  username: string;
  pfp: string;
  displayName: string;
  wallet: string;
  provider: string;
}

interface TokenFee {
  mint: string;
  lifetimeFees: string | null;
}

interface WalletData {
  wallet: string;
  tokenMints: TokenFee[];
}

const PROVIDERS = ["twitter", "tiktok", "kick", "github", "moltbook"] as const;

function fmtSol(lam: number): string {
  const sol = lam / 1e9;
  if (sol >= 1) return sol.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  if (sol >= 0.001) return sol.toFixed(6);
  return sol.toFixed(9);
}

export default function LookupPage() {
  const [provider, setProvider] = useState<string>("twitter");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [social, setSocial] = useState<SocialResult | null>(null);
  const [walletData, setWalletData] = useState<WalletData | null>(null);

  const handleLookup = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = username.trim().replace(/^@/, "");
    if (!trimmed) { setError("Enter a username"); return; }

    setLoading(true);
    setError("");
    setSocial(null);
    setWalletData(null);

    try {
      const res = await fetch(`/api/social?provider=${provider}&username=${encodeURIComponent(trimmed)}`);
      const json = await res.json();
      if (!json.success) { setError(json.error || "User not found"); setLoading(false); return; }

      const data = json.data;
      setSocial({
        username: data.username || trimmed,
        pfp: data.pfp || "",
        displayName: data.displayName || data.username || trimmed,
        wallet: data.wallet || data.publicKey || "",
        provider: provider,
      });

      const wallet = data.wallet || data.publicKey;
      if (wallet) {
        const wRes = await fetch(`/api/wallet/${wallet}`);
        const wJson = await wRes.json();
        if (wJson.success) setWalletData(wJson.data);
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, [provider, username]);

  return (
    <section className="px-4 sm:px-6 md:px-8 lg:px-10 pt-6 pb-16 mx-auto max-w-3xl">
      {/* Back */}
      <a href="/" className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[var(--text-2)] hover:text-[var(--green)] transition-colors mb-6">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
        Back
      </a>

      {/* Title */}
      <div className="mb-8">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.3em] text-[var(--text-3)] mb-3">
          Social Lookup
        </h2>
        <h1 className="text-[36px] md:text-[48px] font-bold leading-[1.05] tracking-tighter text-[var(--text)]">
          Who <span className="text-[var(--green)]">Earns?</span>
        </h1>
        <p className="mt-3 text-[14px] text-[var(--text-2)] leading-relaxed max-w-lg">
          Enter a social handle to see which Bags tokens they earn creator fees from.
        </p>
      </div>

      {/* Search form */}
      <form onSubmit={handleLookup} className="mb-8">
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="h-12 bg-[var(--card)] border-2 border-[var(--border)] px-4 text-[13px] font-bold text-[var(--text)] outline-none cursor-pointer focus:border-[var(--green)] sm:w-40 appearance-none"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239B9B9F' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
          >
            {PROVIDERS.map(p => (
              <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
            ))}
          </select>
          <div className="flex flex-1 h-12">
            <input
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(""); }}
              placeholder="Username..."
              className="flex-1 bg-[var(--card)] border-2 border-r-0 border-[var(--border)] px-4 text-[14px] text-[var(--text)] placeholder:text-[var(--text-3)] outline-none focus:border-[var(--green)]"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-[var(--green)] text-white font-bold px-6 text-[12px] uppercase tracking-[0.06em] hover:bg-[var(--green-hover)] disabled:opacity-50 shrink-0 transition-colors"
            >
              {loading ? "..." : "Look Up"}
            </button>
          </div>
        </div>
        {error && <p className="mt-2 text-[12px] font-bold text-[var(--error)]">{error}</p>}
      </form>

      {/* Results */}
      {social && (
        <div className="animate-slide-up space-y-6">
          {/* Profile card */}
          <div className="bg-[var(--card)] border border-[var(--border)] p-5 flex items-center gap-4">
            {social.pfp ? (
              <img src={social.pfp} alt={social.displayName} className="w-14 h-14 object-cover shrink-0" />
            ) : (
              <div className="w-14 h-14 bg-[var(--green-10)] flex items-center justify-center text-[20px] font-bold text-[var(--green)] shrink-0">
                {social.displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="text-[16px] font-bold text-[var(--text)] truncate">{social.displayName}</h3>
              <p className="text-[12px] text-[var(--text-2)] mt-0.5">
                <span className="inline-flex px-2 py-0.5 bg-[var(--green-10)] text-[var(--green)] text-[10px] font-bold uppercase tracking-[0.06em] mr-2">
                  {social.provider}
                </span>
                @{social.username}
              </p>
              {social.wallet && (
                <p className="text-[11px] font-mono text-[var(--text-3)] mt-1 truncate">
                  {social.wallet}
                </p>
              )}
            </div>
          </div>

          {/* Admin tokens */}
          {walletData && walletData.tokenMints.length > 0 ? (
            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--text-3)] mb-3">
                Tokens Administered ({walletData.tokenMints.length})
              </h3>
              <div className="space-y-2">
                {walletData.tokenMints.map((t) => {
                  const fees = t.lifetimeFees ? parseInt(t.lifetimeFees) : 0;
                  return (
                    <a
                      key={t.mint}
                      href={`/?mint=${t.mint}`}
                      className="flex items-center justify-between bg-[var(--card)] border border-[var(--border)] p-4 hover:border-[var(--green)] transition-colors group"
                    >
                      <div className="min-w-0">
                        <p className="text-[13px] font-mono font-bold text-[var(--text)] group-hover:text-[var(--green)] transition-colors truncate">
                          {t.mint.slice(0, 6)}...{t.mint.slice(-4)}
                        </p>
                      </div>
                      <div className="shrink-0 text-right ml-4">
                        {fees > 0 ? (
                          <p className="text-[14px] font-bold text-[var(--green)]">
                            {fmtSol(fees)} SOL
                          </p>
                        ) : (
                          <p className="text-[12px] text-[var(--text-3)]">No fees yet</p>
                        )}
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          ) : walletData ? (
            <div className="bg-[var(--card)] border border-[var(--border)] p-8 text-center">
              <p className="text-[12px] font-bold text-[var(--text-3)]">No admin tokens found for this wallet.</p>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
