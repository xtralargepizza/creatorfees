"use client";

import ToolNav from "../ToolNav";

export default function ClaimPage() {
  return (
    <>
      <ToolNav />
      <div className="flex flex-col items-center justify-center text-center min-h-[70vh] px-4 opacity-60">
        <img src="/logo.svg" alt="" className="h-12 mb-6 opacity-40" />
        <h1 className="text-[28px] md:text-[36px] font-bold tracking-tighter text-[var(--text)]">
          Claim <span className="text-[var(--green)]">Center</span>
        </h1>
        <p className="mt-3 text-[14px] text-[var(--text-2)]">Coming Soon</p>
        <p className="mt-2 text-[12px] text-[var(--text-3)] max-w-sm leading-relaxed">
          Check unclaimed fee positions across all your tokens. Currently being refined.
        </p>
      </div>
    </>
  );
}
