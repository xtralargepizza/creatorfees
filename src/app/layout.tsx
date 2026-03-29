import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BagsScan — Fee Revenue Dashboard",
  description:
    "Real-time fee analytics and revenue tracking for Bags.fm token creators. Track lifetime fees, claim history, and token performance.",
  keywords: ["bags", "bags.fm", "solana", "fee revenue", "token analytics", "dashboard"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased">
        <nav className="fixed top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--bg-primary)]/80 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
            <a href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-blue-500">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="text-lg font-bold tracking-tight">
                Bags<span className="text-purple-400">Scan</span>
              </span>
            </a>

            <div className="flex items-center gap-1">
              <a
                href="/"
                className="rounded-lg px-3.5 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]"
              >
                Dashboard
              </a>
              <a
                href="/feed"
                className="rounded-lg px-3.5 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]"
              >
                Launch Feed
              </a>
              <a
                href="https://bags.fm/?ref=crisnewtonx"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 rounded-lg bg-purple-500/10 px-3.5 py-2 text-sm font-medium text-purple-400 transition-colors hover:bg-purple-500/20"
              >
                Open Bags.fm
              </a>
            </div>
          </div>
        </nav>

        <main className="mx-auto max-w-7xl px-6 pt-24 pb-16">{children}</main>

        <footer className="border-t border-[var(--border)] py-8">
          <div className="mx-auto max-w-7xl px-6 text-center text-sm text-[var(--text-secondary)]">
            BagsScan — Built for the{" "}
            <a
              href="https://bags.fm/hackathon"
              className="text-purple-400 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Bags Hackathon
            </a>{" "}
            by{" "}
            <a
              href="https://x.com/crisnewtonx"
              className="text-purple-400 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              @crisnewtonx
            </a>
          </div>
        </footer>
      </body>
    </html>
  );
}
