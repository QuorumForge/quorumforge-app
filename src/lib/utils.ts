import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Truncate a Stellar G-address for display */
export function truncateAddress(address: string, chars = 4): string {
  if (!address || address.length < chars * 2 + 3) return address;
  return `${address.slice(0, chars + 1)}...${address.slice(-chars)}`;
}

/** Validate a Stellar G-address (public key) */
export function isValidStellarAddress(address: string): boolean {
  if (!address || typeof address !== "string") return false;
  return /^G[A-Z2-7]{55}$/.test(address.trim());
}

/** Format time remaining from a Unix timestamp (seconds) */
export function formatTimeRemaining(expiryLedger: number, currentLedger: number): string {
  const ledgersLeft = expiryLedger - currentLedger;
  if (ledgersLeft <= 0) return "Expired";
  // ~5 seconds per ledger
  const secondsLeft = ledgersLeft * 5;
  const hours = Math.floor(secondsLeft / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  if (hours > 24) return `${Math.floor(hours / 24)}d remaining`;
  if (hours > 0) return `${hours}h ${minutes}m remaining`;
  return `${minutes}m remaining`;
}

/** Stellar Expert link for a contract */
export function stellarExpertContractUrl(contractId: string, network: "testnet" | "mainnet" = "testnet") {
  const net = network === "mainnet" ? "public" : "testnet";
  return `https://stellar.expert/explorer/${net}/contract/${contractId}`;
}

/** Stellar Expert link for a transaction */
export function stellarExpertTxUrl(txHash: string, network: "testnet" | "mainnet" = "testnet") {
  const net = network === "mainnet" ? "public" : "testnet";
  return `https://stellar.expert/explorer/${net}/tx/${txHash}`;
}

// ── Amount Formatting ────────────────────────────────────────────────────────

/**
 * Format a raw stroops value (i128 / 10^7) as a human-readable USDC string.
 * @example formatUSDC("1000000") → "0.10 USDC"
 */
export function formatUSDC(raw: string | number | bigint): string {
  const units = Number(raw) / 1e7;
  return `${units.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC`;
}

/**
 * Format a raw stroops value as XLM (7 decimal places).
 * @example formatXLM("10000000") → "1.00 XLM"
 */
export function formatXLM(raw: string | number | bigint): string {
  const units = Number(raw) / 1e7;
  return `${units.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 7 })} XLM`;
}

/**
 * Format an on-chain amount with a custom decimal precision and symbol.
 */
export function formatAmount(raw: string | number | bigint, decimals: number, symbol: string): string {
  const units = Number(raw) / Math.pow(10, decimals);
  return `${units.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: decimals })} ${symbol}`;
}

// ── Governance Validation ─────────────────────────────────────────────────────

/**
 * Returns an error message if the threshold is invalid for the given member count,
 * or `null` if it is valid.
 */
export function validateThreshold(threshold: number, memberCount: number): string | null {
  if (!Number.isInteger(threshold) || threshold < 1) {
    return "Threshold must be a positive integer.";
  }
  if (memberCount === 0) {
    return "Cannot set a threshold with no members.";
  }
  if (threshold > memberCount) {
    return `Threshold (${threshold}) cannot exceed the number of members (${memberCount}).`;
  }
  return null;
}

/**
 * Returns `true` if the given array of addresses contains any duplicates.
 */
export function hasDuplicateMembers(members: string[]): boolean {
  return new Set(members).size !== members.length;
}

/**
 * Truncates a proposal description to a maximum character length, appending
 * an ellipsis if trimmed.
 */
export function truncateDescription(text: string, maxLength = 120): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
}

// ── Date Helpers ──────────────────────────────────────────────────────────────

/**
 * Returns a human-readable relative time string (e.g. "2 hours ago", "in 3 days").
 * Accepts a Unix timestamp in seconds.
 */
export function formatRelativeTime(unixSeconds: number): string {
  const diffMs = unixSeconds * 1000 - Date.now();
  const diffSec = Math.round(diffMs / 1000);
  const abs = Math.abs(diffSec);
  const past = diffSec < 0;

  if (abs < 60) return past ? "just now" : "in a moment";
  if (abs < 3600) {
    const m = Math.round(abs / 60);
    return past ? `${m}m ago` : `in ${m}m`;
  }
  if (abs < 86400) {
    const h = Math.round(abs / 3600);
    return past ? `${h}h ago` : `in ${h}h`;
  }
  const d = Math.round(abs / 86400);
  return past ? `${d}d ago` : `in ${d}d`;
}

// ── Stroop / Amount Helpers ───────────────────────────────────────────────────

/**
 * Converts a human-readable decimal string to raw stroops (multiplied by 10^7).
 * Returns NaN if the input is not a valid number.
 * @example parseStroops("1.5") → 15000000
 */
export function parseStroops(humanAmount: string): number {
  const n = parseFloat(humanAmount);
  if (isNaN(n)) return NaN;
  return Math.round(n * 1e7);
}

/**
 * Clamps a numeric amount between a min and max (inclusive).
 * @example clampAmount(150, 0, 100) → 100
 */
export function clampAmount(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Returns `true` if the given string represents a positive non-zero number.
 */
export function isPositiveAmount(value: string): boolean {
  const n = parseFloat(value);
  return !isNaN(n) && n > 0;
}

/**
 * Returns `true` if the given Unix timestamp (seconds) falls on today's date (local time).
 */
export function isToday(unixSeconds: number): boolean {
  const d = new Date(unixSeconds * 1000);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

/**
 * Formats a Unix timestamp (seconds) as a short date string.
 * Shows "Today" if the date is today, otherwise shows "MMM D, YYYY".
 * @example formatShortDate(1700000000) → "Nov 14, 2023"
 */
export function formatShortDate(unixSeconds: number): string {
  if (isToday(unixSeconds)) return "Today";
  return new Date(unixSeconds * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
