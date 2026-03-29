"use client";

import { usePathname } from "next/navigation";
import { useTheme } from "./ThemeProvider";

const NAV_ITEMS = [
  { href: "/", label: "Fee Check" },
  { href: "/wallet", label: "My Tokens" },
  { href: "/claim", label: "Claims" },
  { href: "/lookup", label: "Who Earns?" },
  { href: "/quote", label: "Price" },
  { href: "/calculator", label: "Calculator" },
];

export default function ToolNav() {
  const path = usePathname();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="sticky top-0 z-50 bg-[var(--bg)]/90 backdrop-blur-xl border-b border-[var(--border)]">
      <div className="mx-auto max-w-4xl px-4">
        {/* Top bar: logo + theme */}
        <div className="flex items-center justify-between py-2">
          <a href="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="" className="h-5" />
            <span className="text-[13px] font-bold text-[var(--text)]">CreatorFees</span>
          </a>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme}
              className="w-8 h-8 flex items-center justify-center text-[var(--text-3)] hover:text-[var(--green)] transition-colors">
              {theme === "light" ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
              )}
            </button>
            <a href="https://bags.fm/?ref=crisnewtonx" target="_blank" rel="noopener noreferrer"
              className="bg-[var(--green)] text-white font-bold py-1 px-3 text-[10px] uppercase tracking-[0.06em] hover:bg-[var(--green-hover)]">
              Bags
            </a>
          </div>
        </div>
        {/* Tab nav */}
        <div className="flex gap-0 overflow-x-auto -mx-4 px-4 pb-0">
          {NAV_ITEMS.map(item => {
            const active = path === item.href;
            return (
              <a key={item.href} href={item.href}
                className={`shrink-0 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.04em] border-b-2 transition-colors ${
                  active
                    ? "border-[var(--green)] text-[var(--green)]"
                    : "border-transparent text-[var(--text-3)] hover:text-[var(--text)]"
                }`}>
                {item.label}
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
