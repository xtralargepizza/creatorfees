import type { Metadata } from "next";
import "./globals.css";
import UnicornBg from "./UnicornBg";

export const metadata: Metadata = {
  title: "CreatorFees.xyz — Bags Fee Dashboard",
  description: "Track creator fees, claim history, and analytics for any Bags.fm token.",
  icons: { icon: "/favicon.png" },
  openGraph: {
    title: "CreatorFees.xyz — Bags Fee Dashboard",
    description: "Track lifetime creator fees, claim history, and fee share analytics for any Bags.fm token.",
    url: "https://creatorfees.xyz",
    siteName: "CreatorFees.xyz",
    images: [
      { url: "/og.png", width: 1200, height: 630, alt: "CreatorFees.xyz" },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CreatorFees.xyz — Bags Fee Dashboard",
    description: "Track lifetime creator fees, claim history, and fee share analytics for any Bags.fm token.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col antialiased">
        <UnicornBg />
        <main className="flex-1 w-full relative z-10">{children}</main>
        <footer className="mt-auto w-full border-t border-[var(--border)] py-4 relative z-10">
          <div className="mx-auto max-w-4xl px-4 flex items-center justify-between text-[11px] text-[var(--text-3)]">
            <a href="https://creatorfees.xyz" className="font-semibold hover:text-[var(--green)]">CreatorFees.xyz</a>
            <a href="https://x.com/crisnewtonx" target="_blank" className="font-semibold hover:text-[var(--green)]">@crisnewtonx</a>
          </div>
        </footer>
      </body>
    </html>
  );
}
