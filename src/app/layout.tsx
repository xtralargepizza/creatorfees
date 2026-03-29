import type { Metadata } from "next";
import "./globals.css";
import UnicornBg from "./UnicornBg";
import ThemeProvider from "./ThemeProvider";

export const metadata: Metadata = {
  title: "CreatorFees.xyz — Bags Fee Dashboard",
  description: "Track creator fees, claim history, and analytics for any Bags.fm token.",
  icons: { icon: "/favicon.png" },
  openGraph: {
    title: "CreatorFees.xyz — Bags Fee Dashboard",
    description: "Track lifetime creator fees, claim history, and fee share analytics for any Bags.fm token.",
    url: "https://creatorfees.xyz",
    siteName: "CreatorFees.xyz",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "CreatorFees.xyz" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CreatorFees.xyz — Bags Fee Dashboard",
    description: "Track lifetime creator fees, claim history, and fee share analytics for any Bags.fm token.",
    images: ["/og.png"],
  },
};

const TOOL_LINKS = [
  { href: "/", label: "Fee Check" },
  { href: "/wallet", label: "My Tokens" },
  { href: "/claim", label: "Claims" },
  { href: "/lookup", label: "Who Earns?" },
  { href: "/quote", label: "Price" },
  { href: "/calculator", label: "Calculator" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col antialiased">
        <ThemeProvider>
          <UnicornBg />
          <main className="flex-1 w-full relative z-10">{children}</main>
          <footer className="mt-auto w-full border-t border-[var(--border)] py-6 relative z-10">
            <div className="mx-auto max-w-4xl px-4">
              {/* Tool links */}
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mb-4">
                {TOOL_LINKS.map(t => (
                  <a key={t.href} href={t.href} className="text-[11px] font-bold text-[var(--green)] hover:underline uppercase tracking-[0.04em]">
                    {t.label}
                  </a>
                ))}
              </div>
              {/* Bottom row */}
              <div className="flex items-center justify-between text-[10px] text-[var(--text-3)]">
                <a href="https://creatorfees.xyz" className="font-semibold hover:text-[var(--green)]">CreatorFees.xyz</a>
                <span>
                  <a href="https://bags.fm/?ref=crisnewtonx" target="_blank" className="font-semibold hover:text-[var(--green)]">Bags.fm</a>
                  {" · "}
                  <a href="https://x.com/crisnewtonx" target="_blank" className="font-semibold hover:text-[var(--green)]">@crisnewtonx</a>
                </span>
              </div>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
