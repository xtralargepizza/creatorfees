import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BagsScan — Fee Revenue Dashboard",
  description:
    "Real-time fee analytics and revenue tracking for Bags.fm token creators.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased">
        {/* Nav */}
        <nav className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-md">
          <div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-4">
            <a href="/" className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center bg-[var(--green)]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="text-sm font-bold tracking-tight text-[var(--text)]">
                BagsScan
              </span>
            </a>

            <div className="flex items-center gap-0.5">
              <NavLink href="/">Dashboard</NavLink>
              <NavLink href="/feed">Feed</NavLink>
              <a
                href="https://bags.fm/?ref=crisnewtonx"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary ml-3 text-[10px] py-1.5 px-3"
              >
                Open Bags
              </a>
            </div>
          </div>
        </nav>

        <main className="mx-auto max-w-6xl px-4 pt-8 pb-16">{children}</main>

        <footer className="border-t border-[var(--border)] py-6">
          <div className="mx-auto max-w-6xl px-4 flex items-center justify-between text-[10px] text-[var(--text-tertiary)]">
            <span>
              Built for the{" "}
              <a href="https://bags.fm/hackathon" target="_blank" rel="noopener noreferrer" className="text-[var(--link)] font-medium hover:underline">
                Bags Hackathon
              </a>
            </span>
            <a href="https://x.com/crisnewtonx" target="_blank" rel="noopener noreferrer" className="text-[var(--link)] font-medium hover:underline">
              @crisnewtonx
            </a>
          </div>
        </footer>
      </body>
    </html>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="px-3 py-1.5 text-[11px] font-semibold text-[var(--text-secondary)] transition-colors hover:text-[var(--text)]"
    >
      {children}
    </a>
  );
}
