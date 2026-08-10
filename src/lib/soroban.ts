"use client";

import {
  Client,
  networks,
  type BoardConfig,
  type Proposal as OnChainProposal,
  type ProposalPayload,
  type ProposalStatus as OnChainStatus,
  type ProposalType as OnChainType,
  type Stats,
} from "@/lib/bindings/quorumforge/src";
import type { Board, BoardMember, Proposal, ProposalStatus, ProposalType } from "@/types";

export const DEMO_CONTRACT_ID =
  process.env.NEXT_PUBLIC_CONTRACT_ID ?? networks.testnet.contractId;

export const TESTNET_PASSPHRASE = networks.testnet.networkPassphrase;

const RPC_URL =
  process.env.NEXT_PUBLIC_SOROBAN_RPC_TESTNET ?? "https://soroban-testnet.stellar.org";

function tagOf<T extends string>(v: { tag: T } | T): T {
  return typeof v === "string" ? v : v.tag;
}

function toIso(seconds: bigint | number | null | undefined): string | undefined {
  if (seconds === null || seconds === undefined) return undefined;
  const n = typeof seconds === "bigint" ? Number(seconds) : seconds;
  if (!n) return undefined;
  return new Date(n * 1000).toISOString();
}

function mapPayload(payload: ProposalPayload): Record<string, unknown> {
  const tag = payload.tag;
  const values = payload.values?.[0] as unknown as Record<string, unknown> | undefined;
  if (!values) return { type: tag };
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(values)) {
    out[k] = typeof v === "bigint" ? v.toString() : v;
  }
  return out;
}

export function mapOnChainProposal(
  p: OnChainProposal,
  contractId: string,
  threshold: number
): Proposal {
  const status = tagOf(p.status) as ProposalStatus;
  const type = tagOf(p.proposal_type) as ProposalType;
  const createdAt = toIso(p.created_at) ?? new Date().toISOString();
  const expiresAt = toIso(p.expires_at) ?? createdAt;

  return {
    id: String(p.proposal_id),
    boardContractId: contractId,
    type,
    description: p.description,
    payload: mapPayload(p.payload),
    status,
    proposerAddress: p.proposer,
    createdAt,
    // UI helpers historically used ledgers; map unix seconds so countdowns still work roughly
    expiryLedger: Number(p.expires_at),
    currentLedger: Math.floor(Date.now() / 1000),
    signers: (p.signatures ?? []).map((address) => ({
      address,
      signedAt: createdAt,
    })),
    requiredThreshold: threshold,
    executedAt: toIso(p.executed_at ?? undefined),
    cancelledAt: toIso(p.cancelled_at ?? undefined),
    totalMembers: undefined,
  };
}

async function freighterSign(xdr: string, opts?: { networkPassphrase?: string; address?: string }) {
  const freighter = await import("@stellar/freighter-api");
  const signed = await freighter.signTransaction(xdr, {
    networkPassphrase: opts?.networkPassphrase ?? TESTNET_PASSPHRASE,
    accountToSign: opts?.address,
  });
  if (typeof signed === "string") {
    return { signedTxXdr: signed, signerAddress: opts?.address };
  }
  if (signed && typeof signed === "object" && "signedTxXdr" in (signed as object)) {
    return signed as { signedTxXdr: string; signerAddress?: string };
  }
  throw new Error("Freighter did not return a signed transaction");
}

export function createClient(contractId: string, publicKey?: string) {
  return new Client({
    contractId,
    networkPassphrase: TESTNET_PASSPHRASE,
    rpcUrl: RPC_URL,
    publicKey,
    signTransaction: publicKey
      ? async (xdr, opts) =>
          freighterSign(xdr, {
            networkPassphrase: opts?.networkPassphrase,
            address: publicKey,
          })
      : undefined,
  });
}

export async function fetchBoardLive(contractId: string): Promise<Board> {
  const client = createClient(contractId);
  const [boardTx, statsTx, adminTx] = await Promise.all([
    client.get_board(),
    client.get_stats(),
    client.get_admin(),
  ]);

  const board = boardTx.result as BoardConfig;
  const stats = statsTx.result as Stats;
  const admin = adminTx.result as string;

  const members: BoardMember[] = board.members.map((address) => ({
    address,
    signedCount: 0,
    totalProposals: Number(stats.total_proposals),
  }));

  return {
    id: contractId,
    contractId,
    network: "testnet",
    name: contractId === DEMO_CONTRACT_ID ? "QuorumForge Demo Board" : "Maintainer Board",
    deployerAddress: admin,
    createdAt: toIso(board.created_at) ?? new Date().toISOString(),
    members,
    threshold: board.threshold,
    totalProposals: Number(stats.total_proposals),
    executedProposals: Number(stats.executed),
  };
}

export async function fetchProposalsLive(contractId: string): Promise<Proposal[]> {
  const client = createClient(contractId);
  const boardTx = await client.get_board();
  const board = boardTx.result as BoardConfig;
  const threshold = board.threshold;

  const statuses: OnChainStatus[] = [
    { tag: "Pending", values: undefined as unknown as void },
    { tag: "Executed", values: undefined as unknown as void },
    { tag: "Expired", values: undefined as unknown as void },
    { tag: "Cancelled", values: undefined as unknown as void },
  ];

  const batches = await Promise.all(
    statuses.map((status) => client.get_proposals_by_status({ status }))
  );

  const all: Proposal[] = [];
  for (const batch of batches) {
    const list = (batch.result ?? []) as OnChainProposal[];
    for (const p of list) {
      all.push(mapOnChainProposal(p, contractId, threshold));
    }
  }

  return all.sort((a, b) => Number(b.id) - Number(a.id));
}

export async function fetchProposalLive(
  contractId: string,
  proposalId: string
): Promise<Proposal> {
  const client = createClient(contractId);
  const [boardTx, propTx] = await Promise.all([
    client.get_board(),
    client.get_proposal({ proposal_id: BigInt(proposalId) }),
  ]);
  const board = boardTx.result as BoardConfig;
  return mapOnChainProposal(propTx.result as OnChainProposal, contractId, board.threshold);
}

export async function signProposalLive(
  contractId: string,
  proposalId: string,
  signer: string
): Promise<string> {
  const client = createClient(contractId, signer);
  const tx = await client.sign_proposal({
    signer,
    proposal_id: BigInt(proposalId),
  });
  const sent = await tx.signAndSend();
  return sent.sendTransactionResponse?.hash ?? sent.getTransactionResponse?.txHash ?? "";
}

export async function cancelProposalLive(
  contractId: string,
  proposalId: string,
  canceller: string
): Promise<string> {
  const client = createClient(contractId, canceller);
  const tx = await client.cancel_proposal({
    proposal_id: BigInt(proposalId),
    canceller,
  });
  const sent = await tx.signAndSend();
  return sent.sendTransactionResponse?.hash ?? "";
}

export type CreateProposalInput = {
  type: ProposalType;
  description: string;
  ttlDays: number;
  // type-specific
  newMember?: string;
  member?: string;
  newThreshold?: number;
  recipient?: string;
  amount?: number;
  asset?: string;
  issueUrl?: string;
  contributor?: string;
  issueNumber?: number;
};

function buildTypeAndPayload(input: CreateProposalInput): {
  proposal_type: OnChainType;
  payload: ProposalPayload;
} {
  switch (input.type) {
    case "AddMember":
      if (!input.newMember) throw new Error("newMember is required");
      return {
        proposal_type: { tag: "AddMember", values: undefined as unknown as void },
        payload: {
          tag: "AddMember",
          values: [{ new_member: input.newMember }],
        },
      };
    case "RemoveMember":
      if (!input.member) throw new Error("member is required");
      return {
        proposal_type: { tag: "RemoveMember", values: undefined as unknown as void },
        payload: {
          tag: "RemoveMember",
          values: [{ member: input.member }],
        },
      };
    case "UpdateThreshold":
      if (!input.newThreshold) throw new Error("newThreshold is required");
      return {
        proposal_type: { tag: "UpdateThreshold", values: undefined as unknown as void },
        payload: {
          tag: "UpdateThreshold",
          values: [{ new_threshold: input.newThreshold }],
        },
      };
    case "TransferFunds":
      if (!input.recipient || !input.amount || !input.asset) {
        throw new Error("recipient, amount, and asset are required");
      }
      // Asset must be a contract/address — for demo accept C/G address string
      return {
        proposal_type: { tag: "TransferFunds", values: undefined as unknown as void },
        payload: {
          tag: "TransferFunds",
          values: [
            {
              recipient: input.recipient,
              amount: BigInt(Math.round(input.amount * 10_000_000)),
              asset: input.asset,
              memo: input.description.slice(0, 28),
            },
          ],
        },
      };
    case "ResolveIssue":
      throw new Error(
        "ResolveIssue requires contributor, issue number, amount, and asset address. Use UpdateThreshold or AddMember for the testnet demo."
      );
    default:
      throw new Error(`Unsupported proposal type: ${input.type}`);
  }
}

export async function createProposalLive(
  contractId: string,
  proposer: string,
  input: CreateProposalInput
): Promise<string> {
  const client = createClient(contractId, proposer);
  const { proposal_type, payload } = buildTypeAndPayload(input);
  const ttl_seconds = BigInt(Math.max(1, input.ttlDays) * 24 * 60 * 60);

  const tx = await client.create_proposal({
    proposer,
    proposal_type,
    payload,
    description: input.description,
    ttl_seconds,
  });
  const sent = await tx.signAndSend();
  const id = tx.result !== undefined ? String(tx.result) : "";
  return id || (sent.sendTransactionResponse?.hash ?? "");
}

/** Register off-chain metadata for an already-deployed / initialized board. */
export async function registerBoardMetadata(input: {
  name: string;
  contractId: string;
  deployerAddress: string;
  network?: "testnet" | "mainnet";
}) {
  const res = await fetch("/api/boards", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: input.name,
      contractId: input.contractId,
      network: input.network ?? "testnet",
      deployerAddress: input.deployerAddress,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to save board metadata");
  }
  return res.json();
}
