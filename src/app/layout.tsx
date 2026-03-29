import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CreatorFees.xyz — Bags Fee Dashboard",
  description: "Track creator fees, claim history, and analytics for any Bags.fm token.",
  icons: { icon: "/favicon.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col antialiased">
        <main className="flex-1 w-full">{children}</main>
        <footer className="mt-auto w-full border-t border-[var(--border)] py-4">
          <div className="mx-auto max-w-4xl px-4 flex items-center justify-between text-[11px] text-[var(--text-3)]">
            <a href="https://creatorfees.xyz" className="font-semibold hover:text-[var(--green)]">CreatorFees.xyz</a>
            <a href="https://x.com/crisnewtonx" target="_blank" className="font-semibold hover:text-[var(--green)]">@crisnewtonx</a>
          </div>
        </footer>
      </body>
    </html>
  );
}
