export type Network = "testnet" | "mainnet";

export type ProposalType =
  | "ResolveIssue"
  | "TransferFunds"
  | "AddMember"
  | "RemoveMember"
  | "UpdateThreshold";

export type ProposalStatus = "Pending" | "Executed" | "Expired" | "Cancelled";

export interface BoardMember {
  address: string;
  signedCount: number;
  totalProposals: number;
  lastActiveAt?: string;
  isConnected?: boolean;
  /** Participation rate (0–100), derived from signedCount / totalProposals. */
  participationRate?: number;
}

export interface Proposal {
  id: string;
  boardContractId: string;
  type: ProposalType;
  description: string;
  payload: Record<string, unknown>;
  status: ProposalStatus;
  proposerAddress: string;
  createdAt: string;
  expiryLedger: number;
  currentLedger: number;
  signers: SignatureRecord[];
  requiredThreshold: number;
  executedAt?: string;
  cancelledAt?: string;
  txHash?: string;
  /** Total member count at the time of proposal creation. */
  totalMembers?: number;
}

export interface SignatureRecord {
  address: string;
  signedAt: string;
}

export interface Board {
  id: string;
  contractId: string;
  network: Network;
  name: string;
  deployerAddress: string;
  createdAt: string;
  members: BoardMember[];
  threshold: number;
  totalProposals: number;
  executedProposals: number;
  /** USDC balance held by the contract treasury (human-readable). */
  treasuryBalance?: string;
}

export interface DeployBoardInput {
  name: string;
  members: string[];
  threshold: number;
  initialFunding?: number;
  network: Network;
  /** Optional short description of the board's purpose (stored off-chain). */
  description?: string;
}

// API response shapes
export interface ApiBoard {
  id: string;
  contractId: string;
  network: string;
  name: string;
  deployerAddress: string;
  createdAt: string;
}

export interface LiveStats {
  totalBoards: number;
  proposalsExecuted: number;
  proposalsCreated: number;
  proposalsPending: number;
  usdcGoverned: number;
  /** Total signatures cast across all proposals. */
  totalSignatures: number;
  /** Most recently active board contract ID, if any. */
  latestBoardId?: string;
}
