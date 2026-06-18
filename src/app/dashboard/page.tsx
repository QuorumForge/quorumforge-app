"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { motion } from "framer-motion";
import { Wallet, ArrowRight, Pen, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProposalCard } from "@/components/ProposalCard";
import { useWallet } from "@/lib/wallet";
import { truncateAddress } from "@/lib/utils";
import type { Board, Proposal } from "@/types";

// Mock fetchers — replace with real contract reads
async function fetchMemberBoards(_address: string): Promise<Board[]> {
  return [
    {
      id: "1",
      contractId: "CDEMOBRD1234567890",
      network: "testnet",
      name: "Demo Maintainers",
      deployerAddress: _address,
      createdAt: new Date().toISOString(),
      members: [],
      threshold: 2,
      totalProposals: 6,
      executedProposals: 4,
    },
  ];
}

async function fetchPendingForAddress(_address: string): Promise<Proposal[]> {
  return [];
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
      const freighter = await import("@stellar/freighter-api");
      // Placeholder: build sign XDR, sign with Freighter, submit
      console.log("Signing proposal", proposalId);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pending-proposals"] }),
  });

  if (!address) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <Wallet className="h-14 w-14 text-foreground-secondary mb-4" />
        <h1 className="text-2xl font-bold mb-2">Your Dashboard</h1>
        <p className="text-foreground-secondary mb-6 max-w-sm">
          Connect your Freighter wallet to view your boards and pending proposals.
        </p>
        <Button onClick={connect} disabled={isConnecting} className="gap-2">
          <Wallet className="h-4 w-4" />
          {isConnecting ? "Connecting..." : "Connect Freighter"}
        </Button>
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
            Deploy New Board <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        {/* Pending signatures */}
        <section>
          <h2 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wide mb-3">
            Awaiting Your Signature
          </h2>
          {pendingLoading ? (
            <div className="text-foreground-secondary text-sm">Loading…</div>
          ) : pending.length === 0 ? (
            <div className="card-surface p-8 text-center text-sm text-foreground-secondary">
              No proposals awaiting your signature. 🎉
            </div>
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

        {/* My boards */}
        <section>
          <h2 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wide mb-3">
            Your Boards
          </h2>
          {boardsLoading ? (
            <div className="text-foreground-secondary text-sm">Loading…</div>
          ) : boards.length === 0 ? (
            <div className="card-surface p-6 text-center text-sm text-foreground-secondary">
              You are not a member of any board yet.{" "}
              <Link href="/deploy" className="text-primary hover:underline">Deploy one</Link>.
            </div>
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
                        <Badge variant={board.network === "testnet" ? "amber" : "emerald"} className="text-[10px]">
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
                    <span>{board.threshold}-of-M required</span>
                    <span>{board.executedProposals}/{board.totalProposals} executed</span>
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
