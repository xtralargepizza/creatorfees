import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CreatorFees.xyz — Bags Fee Revenue Dashboard",
  description: "Track lifetime fees, claim history, and creator analytics for any Bags.fm token.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col antialiased bg-[var(--bg)]">
        {/* Nav */}
        <nav className="sticky top-0 z-50 w-full border-b border-[var(--surface)] bg-[var(--bg)]/90 backdrop-blur-md">
          <div className="mx-auto flex h-14 md:h-16 max-w-[1400px] items-center justify-between px-4 md:px-8 lg:px-12">
            <a href="/" className="flex items-center gap-2.5">
              <img src="/logo.svg" alt="CreatorFees" className="h-6 md:h-7" />
              <span className="text-[14px] font-bold tracking-tight text-[var(--text)]">
                CreatorFees
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

        <main className="flex-1 mx-auto w-full max-w-[1400px] px-4 md:px-8 lg:px-12 pt-6 pb-16">
          {children}
        </main>

        <footer className="mt-auto w-full border-t border-[var(--surface)] py-5">
          <div className="mx-auto max-w-[1400px] px-4 md:px-8 lg:px-12 flex items-center justify-between text-[10px] text-[var(--text-dim)]">
            <span>
              <a href="https://creatorfees.xyz" className="font-bold text-[var(--link)]">CreatorFees.xyz</a>
              {" "}&middot;{" "}
              <a href="https://bags.fm/hackathon" target="_blank" className="text-[var(--text-dim)] hover:text-[var(--green)]">
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
