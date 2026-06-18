"use client";

import { motion } from "framer-motion";
import { cn, truncateAddress } from "@/lib/utils";
import type { SignatureRecord } from "@/types";

interface SignatureProgressBarProps {
  collected: number;
  required: number;
  total: number;
  signers?: SignatureRecord[];
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  showAvatars?: boolean;
}

export function SignatureProgressBar({
  collected,
  required,
  total,
  signers = [],
  size = "md",
  showLabel = true,
  showAvatars = false,
}: SignatureProgressBarProps) {
  const pct = Math.min((collected / required) * 100, 100);
  const isComplete = collected >= required;

  const heightCls = { sm: "h-1.5", md: "h-2.5", lg: "h-3.5" }[size];
  const barColor = isComplete ? "bg-emerald" : collected > 0 ? "bg-primary" : "bg-muted";

  return (
    <div className="flex flex-col gap-1.5">
      {showLabel && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-foreground-secondary">
            <span className={cn("font-semibold", isComplete ? "text-emerald" : "text-foreground")}>
              {collected}
            </span>
            {" of "}
            <span className="font-semibold text-foreground">{required}</span>
            {" signatures"}
          </span>
          <span className="text-xs text-foreground-secondary">{total} members</span>
        </div>
      )}
      <div className={cn("w-full rounded-full bg-muted overflow-hidden", heightCls)}>
        <motion.div
          className={cn("h-full rounded-full", barColor)}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      {showAvatars && signers.length > 0 && (
        <div className="flex items-center gap-1.5 mt-1">
          {signers.map((s) => (
            <div
              key={s.address}
              title={s.address}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 border border-primary/40 text-xs font-mono text-primary"
            >
              {s.address.slice(1, 3)}
            </div>
          ))}
          {collected > signers.length && (
            <span className="text-xs text-foreground-secondary">+{collected - signers.length}</span>
          )}
        </div>
      )}
    </div>
  );
}
