import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CreatorFees.xyz — Bags Fee Dashboard",
  description: "Track creator fees, claim history, and analytics for any Bags.fm token.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col antialiased">
        {/* Search bar at top like Bags */}
        <nav className="sticky top-0 z-50 w-full bg-[var(--bg)]/90 backdrop-blur-xl">
          <div className="mx-auto max-w-2xl px-4 py-3">
            <a href="/" className="flex items-center justify-center gap-2 mb-0">
              <img src="/logo.svg" alt="CreatorFees" className="h-5" />
              <span className="text-[13px] font-bold text-[var(--text)]">CreatorFees</span>
            </a>
          </div>
        </nav>

        <main className="flex-1 mx-auto w-full max-w-2xl px-4 pb-16">
          {children}
        </main>

        <footer className="mt-auto w-full py-4">
          <div className="mx-auto max-w-2xl px-4 flex items-center justify-between text-[11px] text-[var(--text-dim)]">
            <a href="https://creatorfees.xyz" className="font-semibold hover:text-[var(--green)]">CreatorFees.xyz</a>
            <a href="https://x.com/crisnewtonx" target="_blank" className="font-semibold hover:text-[var(--green)]">@crisnewtonx</a>
          </div>
        </footer>
      </body>
    </html>
  );
}
