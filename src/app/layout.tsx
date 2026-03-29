import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BagsScan — Fee Revenue Dashboard",
  description: "Track lifetime fees, claim history, and analytics for any Bags.fm token.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        {/* Nav */}
        <nav className="sticky top-0 z-50 border-b border-[var(--surface)] bg-[var(--bg)]/90 backdrop-blur-md">
          <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5">
            <a href="/" className="flex items-center gap-2.5">
              <img src="/bags-icon.png" alt="Bags" className="h-7 w-7" />
              <span className="text-[15px] font-bold tracking-tight text-[var(--text)]">
                BagsScan
              </span>
            </a>
            <a
              href="https://bags.fm/?ref=crisnewtonx"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[var(--green)] text-white font-bold py-1.5 px-4 text-[10px] uppercase tracking-[0.08em] hover:bg-[var(--green-hover)] transition-colors"
            >
              Open Bags
            </a>
          </div>
        </nav>

        <main className="mx-auto max-w-5xl px-5 pt-6 pb-16">{children}</main>

        <footer className="border-t border-[var(--surface)] py-5">
          <div className="mx-auto max-w-5xl px-5 flex items-center justify-between text-[10px] text-[var(--text-dim)]">
            <span>
              Built for the{" "}
              <a href="https://bags.fm/hackathon" target="_blank" className="font-bold text-[var(--link)] hover:text-[var(--green)]">
                Bags Hackathon
              </a>
            </span>
            <a href="https://x.com/crisnewtonx" target="_blank" className="font-bold text-[var(--link)] hover:text-[var(--green)]">
              @crisnewtonx
            </a>
          </div>
        </footer>
      </body>
    </html>
  );
}
