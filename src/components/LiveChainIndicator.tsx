"use client";

import { cn } from "@/lib/utils";

interface LiveChainIndicatorProps {
  network?: "testnet" | "mainnet";
  className?: string;
  compact?: boolean;
}

export function LiveChainIndicator({
  network = "testnet",
  className,
  compact,
}: LiveChainIndicatorProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-emerald/25 bg-emerald/10",
        compact ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs",
        className
      )}
    >
      <span className="live-dot" aria-hidden />
      <span className="font-medium text-emerald">
        Live on {network === "testnet" ? "Stellar Testnet" : "Stellar Mainnet"}
      </span>
    </div>
  );
}
