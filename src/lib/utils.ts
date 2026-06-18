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
  return /^G[A-Z2-7]{55}$/.test(address);
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
