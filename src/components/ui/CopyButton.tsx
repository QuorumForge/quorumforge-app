"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
  value: string;
  className?: string;
  /** Duration in ms before the checkmark reverts to the copy icon. Default: 2000 */
  resetDelay?: number;
  /** Optional accessible label. Defaults to "Copy to clipboard". */
  label?: string;
}

/**
 * An icon button that copies `value` to the clipboard and briefly shows a
 * checkmark to confirm the copy was successful.
 * Cleans up the reset timer on unmount to prevent state updates on unmounted components.
 *
 * @example
 * <CopyButton value={contractId} />
 */
export function CopyButton({ value, className, resetDelay = 2000, label = "Copy to clipboard" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), resetDelay);
    } catch {
      // Clipboard API may be unavailable; silently ignore
    }
  }, [value, resetDelay]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? "Copied!" : label}
      title={copied ? "Copied!" : label}
      className={cn(
        "inline-flex items-center justify-center rounded p-1 transition-colors",
        "text-foreground-secondary hover:text-foreground hover:bg-muted",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        copied && "text-emerald hover:text-emerald",
        className
      )}
    >
      {copied
        ? <Check className="h-3.5 w-3.5" aria-hidden="true" />
        : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
    </button>
  );
}
