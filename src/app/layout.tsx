import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BagsScan — Creator Revenue Dashboard",
  description: "Real-time fee analytics and revenue tracking for Bags.fm token creators.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen">
        {/* ─── Desktop Sidebar ──────────────────────── */}
        <aside className="fixed left-0 top-0 h-screen w-64 z-50 bg-[var(--bg)]/80 backdrop-blur-xl hidden md:flex flex-col p-6 shadow-[24px_0_48px_rgba(13,15,11,0.06)]">
          <a href="/" className="text-3xl font-bold text-[var(--text)] mb-8 tracking-tighter">
            Bags
          </a>

          <nav className="flex-1 space-y-1">
            <SideLink href="/" icon="dashboard" label="Dashboard" />
            <SideLink href="/feed" icon="rocket_launch" label="Launch Feed" />
            <SideLink href="/revenue" icon="history" label="Revenue History" />
            <SideLink href="/claims" icon="payments" label="Claims" />
          </nav>

          <div className="mt-auto pt-6 border-t border-[var(--surface)]">
            <a
              href="https://bags.fm/?ref=crisnewtonx"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-[var(--green)] text-[var(--text)] font-bold py-4 mb-6 text-center hover:brightness-110 transition-all active:scale-95 uppercase text-[11px] tracking-[0.1em]"
            >
              Open Bags.fm
            </a>
            <div className="space-y-1">
              <SideLink href="https://docs.bags.fm" icon="description" label="Documentation" external />
              <SideLink href="https://bags.fm/hackathon" icon="emoji_events" label="Hackathon" external />
            </div>
          </div>
        </aside>

        {/* ─── Main Content ─────────────────────────── */}
        <main className="md:ml-64 min-h-screen pb-24 md:pb-0">
          {/* Top Header */}
          <header className="sticky top-0 z-40 flex justify-between items-center w-full px-6 md:px-8 py-4 bg-[var(--bg)]/80 backdrop-blur-xl">
            <div className="flex items-center gap-4 flex-1">
              <a href="/" className="md:hidden text-2xl font-bold tracking-tighter text-[var(--text)]">
                BAGS
              </a>
              <form action="/search" method="GET" className="relative w-full max-w-md hidden sm:block">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)] text-sm">
                  search
                </span>
                <input
                  name="q"
                  type="text"
                  placeholder="SEARCH CA OR TICKER..."
                  className="w-full bg-[var(--surface-low)] border-none py-2.5 pl-10 pr-4 text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--text)] placeholder:text-[var(--text-dim)] focus:ring-1 focus:ring-[var(--green)] outline-none"
                />
              </form>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="https://bags.fm/?ref=crisnewtonx"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden lg:block text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--link)] opacity-70 hover:text-[var(--green)] transition-colors"
              >
                bags.fm
              </a>
              <div className="flex items-center gap-2 border-l border-[var(--surface)] pl-4">
                <a
                  href="https://x.com/crisnewtonx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-bold text-[var(--text-variant)]"
                >
                  @crisnewtonx
                </a>
              </div>
            </div>
          </header>

          {children}
        </main>

        {/* ─── Mobile Bottom Nav ────────────────────── */}
        <nav className="fixed bottom-0 left-0 w-full z-50 h-20 bg-[var(--bg)] flex justify-around items-center px-4 md:hidden border-t border-[var(--surface)]">
          <MobileLink href="/" icon="dashboard" label="Home" />
          <MobileLink href="/feed" icon="rocket_launch" label="Feed" />
          <MobileLink href="/revenue" icon="payments" label="Revenue" />
          <MobileLink href="/claims" icon="stars" label="Claims" />
        </nav>

        {/* Footer (desktop only) */}
        <footer className="hidden md:block md:ml-64 px-8 py-12 bg-[var(--surface-low)] mt-16">
          <div className="grid grid-cols-4 gap-12">
            <div className="col-span-2">
              <div className="text-2xl font-bold mb-4">Bags</div>
              <p className="text-[11px] font-medium leading-relaxed text-[var(--text-variant)] max-w-sm">
                BagsScan is a fee revenue dashboard for Bags.fm token creators.
                Track your 1% trading fees, claim history, and token analytics.
              </p>
            </div>
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--text-variant)] mb-4">Platform</h4>
              <ul className="space-y-2 text-[11px] font-bold uppercase tracking-tight">
                <li><a href="https://bags.fm/?ref=crisnewtonx" className="hover:text-[var(--green)] transition-colors">Bags.fm</a></li>
                <li><a href="https://docs.bags.fm" className="hover:text-[var(--green)] transition-colors">API Docs</a></li>
                <li><a href="https://bags.fm/hackathon" className="hover:text-[var(--green)] transition-colors">Hackathon</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--text-variant)] mb-4">Builder</h4>
              <ul className="space-y-2 text-[11px] font-bold uppercase tracking-tight">
                <li><a href="https://x.com/crisnewtonx" className="hover:text-[var(--green)] transition-colors">@crisnewtonx</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-6 border-t border-[var(--surface)] flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--text-dim)]">
              Built for the Bags Hackathon 2026
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--text-dim)]">
              BagsScan
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}

function SideLink({ href, icon, label, external }: { href: string; icon: string; label: string; external?: boolean }) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="text-[var(--link)] px-4 py-3 flex items-center gap-3 text-[11px] font-bold uppercase tracking-tight hover:bg-[var(--surface-low)] transition-all"
    >
      <span className="material-symbols-outlined text-lg">{icon}</span>
      {label}
    </a>
  );
}

function MobileLink({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <a href={href} className="flex flex-col items-center justify-center text-[var(--link)] p-2 min-w-[64px] hover:text-[var(--green)] active:scale-90 transition-all duration-200">
      <span className="material-symbols-outlined mb-1">{icon}</span>
      <span className="text-[9px] font-bold uppercase tracking-[0.06em]">{label}</span>
    </a>
  );
}
