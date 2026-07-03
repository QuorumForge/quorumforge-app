"use client";

import { useState, useCallback } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
  value: string;
  className?: string;
  /** Duration in ms before the checkmark reverts to the copy icon. Default: 2000 */
  resetDelay?: number;
}

/**
 * An icon button that copies `value` to the clipboard and briefly shows a
 * checkmark to confirm the copy was successful.
 *
 * @example
 * <CopyButton value={contractId} />
 */
export function CopyButton({ value, className, resetDelay = 2000 }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), resetDelay);
    } catch {
      // Clipboard API may be unavailable; silently ignore
    }
  }, [value, resetDelay]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={copied ? "Copied!" : "Copy to clipboard"}
      className={cn(
        "inline-flex items-center justify-center rounded p-1 transition-colors",
        "text-foreground-secondary hover:text-foreground hover:bg-muted",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        copied && "text-emerald hover:text-emerald",
        className
      )}
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}
