"use client";

import { FileText } from "lucide-react";

export function BoardPageSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 animate-fade-in">
      <div className="rounded-2xl border border-border p-8 mb-8 space-y-4">
        <div className="skeleton h-6 w-40" />
        <div className="skeleton h-10 w-72 max-w-full" />
        <div className="skeleton h-4 w-full max-w-md" />
        <div className="skeleton h-8 w-96 max-w-full" />
        <div className="grid grid-cols-4 gap-3 mt-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-20 rounded-xl" />
          ))}
        </div>
      </div>
      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        <div className="space-y-3">
          <div className="skeleton h-10 w-full" />
          <div className="skeleton h-32 rounded-xl" />
          <div className="skeleton h-32 rounded-xl" />
        </div>
        <div className="skeleton h-64 rounded-xl" />
      </div>
      <p className="text-center text-sm text-foreground-secondary mt-8 flex items-center justify-center gap-2">
        <FileText className="h-4 w-4 animate-pulse" />
        Syncing board state from Stellar Testnet…
      </p>
    </div>
  );
}
