"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { motion } from "framer-motion";
import { Wallet, ArrowRight, Pen, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProposalCard } from "@/components/ProposalCard";
import { useWallet } from "@/lib/wallet";
import { truncateAddress } from "@/lib/utils";
import {
  DEMO_CONTRACT_ID,
  fetchBoardLive,
  fetchProposalsLive,
  signProposalLive,
} from "@/lib/soroban";
import type { Board, Proposal } from "@/types";

async function fetchMemberBoards(address: string): Promise<Board[]> {
  // Demo board is always available; include it if the wallet is a member.
  try {
    const board = await fetchBoardLive(DEMO_CONTRACT_ID);
    if (board.members.some((m) => m.address === address)) {
      return [board];
    }
    // Show demo board for discoverability when wallet is not a member
    return [board];
  } catch {
    return [];
  }
}

async function fetchPendingForAddress(address: string): Promise<Proposal[]> {
  try {
    const board = await fetchBoardLive(DEMO_CONTRACT_ID);
    if (!board.members.some((m) => m.address === address)) return [];
    const proposals = await fetchProposalsLive(DEMO_CONTRACT_ID);
    return proposals.filter(
      (p) =>
        p.status === "Pending" && !p.signers.some((s) => s.address === address)
    );
  } catch {
    return [];
  }
}

export default function DashboardPage() {
  const { address, connect, isConnecting } = useWallet();
  const queryClient = useQueryClient();

  const { data: boards = [], isLoading: boardsLoading } = useQuery({
    queryKey: ["member-boards", address],
    queryFn: () => fetchMemberBoards(address!),
    enabled: !!address,
  });

  const { data: pending = [], isLoading: pendingLoading } = useQuery({
    queryKey: ["pending-proposals", address],
    queryFn: () => fetchPendingForAddress(address!),
    enabled: !!address,
  });

  const signMutation = useMutation({
    mutationFn: async (proposalId: string) => {
      if (!address) throw new Error("Wallet not connected");
      await signProposalLive(DEMO_CONTRACT_ID, proposalId, address);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-proposals"] });
      queryClient.invalidateQueries({ queryKey: ["proposals"] });
      queryClient.invalidateQueries({ queryKey: ["board"] });
    },
  });

  if (!address) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <Wallet className="h-14 w-14 text-foreground-secondary mb-4" />
        <h1 className="text-2xl font-bold mb-2">Your Dashboard</h1>
        <p className="text-foreground-secondary mb-6 max-w-sm">
          Connect your Freighter wallet (Testnet) to view boards and pending proposals.
        </p>
        <Button onClick={connect} disabled={isConnecting} className="gap-2">
          <Wallet className="h-4 w-4" />
          {isConnecting ? "Connecting..." : "Connect Freighter"}
        </Button>
        <p className="mt-6 text-xs text-foreground-secondary">
          Demo board:{" "}
          <Link href={`/board/${DEMO_CONTRACT_ID}`} className="text-primary hover:underline font-mono">
            {truncateAddress(DEMO_CONTRACT_ID, 6)}
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-foreground-secondary mt-1 font-mono">
            {truncateAddress(address, 8)}
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/deploy" className="gap-1.5">
            Register Board <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <section>
          <h2 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wide mb-3">
            Awaiting Your Signature
          </h2>
          {pendingLoading ? (
            <div className="text-foreground-secondary text-sm">Loading…</div>
          ) : pending.length === 0 ? (
            <EmptyState
              icon={Pen}
              title="No pending signatures"
              description="You're all caught up. No proposals awaiting your signature."
            />
          ) : (
            <div className="flex flex-col gap-3">
              {pending.map((p) => (
                <ProposalCard
                  key={p.id}
                  proposal={p}
                  canSign
                  onSign={(id) => signMutation.mutate(id)}
                  isSigning={signMutation.isPending}
                />
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wide mb-3">
            Your Boards
          </h2>
          {boardsLoading ? (
            <div className="text-foreground-secondary text-sm">Loading…</div>
          ) : boards.length === 0 ? (
            <EmptyState
              title="No boards yet"
              description="You are not a member of any board."
              action={
                <Button asChild size="sm" variant="outline">
                  <Link href={`/board/${DEMO_CONTRACT_ID}`}>Open demo board</Link>
                </Button>
              }
            />
          ) : (
            <div className="flex flex-col gap-3">
              {boards.map((board) => (
                <motion.div
                  key={board.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card-surface p-4 hover:border-border/80 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-sm">{board.name}</h3>
                        <Badge
                          variant={board.network === "testnet" ? "amber" : "emerald"}
                          className="text-[10px]"
                        >
                          {board.network}
                        </Badge>
                      </div>
                      <p className="text-xs text-foreground-secondary font-mono">
                        {truncateAddress(board.contractId, 6)}
                      </p>
                    </div>
                    <Link
                      href={`/board/${board.contractId}`}
                      className="text-foreground-secondary hover:text-primary transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-xs text-foreground-secondary">
                    <span>
                      {board.threshold}-of-{board.members.length} required
                    </span>
                    <span>
                      {board.executedProposals}/{board.totalProposals} executed
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
