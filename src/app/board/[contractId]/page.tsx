"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, Inbox } from "lucide-react";
import { ProposalCard } from "@/components/ProposalCard";
import { MemberList } from "@/components/MemberList";
import { CreateProposalModal } from "@/components/CreateProposalModal";
import { BoardHero } from "@/components/BoardHero";
import { BoardPageSkeleton } from "@/components/BoardPageSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useWallet } from "@/lib/wallet";
import { cn } from "@/lib/utils";
import {
  createProposalLive,
  fetchBoardLive,
  fetchProposalsLive,
  signProposalLive,
  type CreateProposalInput,
} from "@/lib/soroban";
import type { ProposalStatus } from "@/types";

const TABS: ProposalStatus[] = ["Pending", "Executed", "Expired", "Cancelled"];

const TAB_HINTS: Record<ProposalStatus, string> = {
  Pending: "Awaiting maintainer signatures",
  Executed: "Quorum reached — actions applied on-chain",
  Expired: "Past TTL without quorum",
  Cancelled: "Withdrawn by proposer or admin",
};

export default function BoardPage() {
  const { contractId } = useParams<{ contractId: string }>();
  const { address, isMember, connect } = useWallet();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<ProposalStatus>("Executed");
  const [copied, setCopied] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [signingId, setSigningId] = useState<string | null>(null);

  const { data: board, isLoading: boardLoading, error: boardError } = useQuery({
    queryKey: ["board", contractId],
    queryFn: () => fetchBoardLive(contractId),
    refetchInterval: 15_000,
  });

  const { data: proposals = [] } = useQuery({
    queryKey: ["proposals", contractId],
    queryFn: () => fetchProposalsLive(contractId),
    refetchInterval: 15_000,
  });

  const copyAddress = () => {
    navigator.clipboard.writeText(contractId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (boardLoading) return <BoardPageSkeleton />;

  if (boardError || !board) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 gap-3">
        <div className="card-surface p-8 max-w-md">
          <p className="text-red-400 font-medium mb-2">Could not load board</p>
          <p className="text-foreground-secondary text-xs font-mono break-all mb-3">
            {contractId}
          </p>
          <p className="text-sm text-foreground-secondary">
            {boardError instanceof Error ? boardError.message : "RPC or contract unavailable"}
          </p>
        </div>
      </div>
    );
  }

  const memberAddresses = board.members.map((m) => m.address);
  const canManage = isMember(memberAddresses);
  const filtered = proposals.filter((p) => p.status === activeTab);
  const pendingCount = proposals.filter((p) => p.status === "Pending").length;

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["board", contractId] }),
      queryClient.invalidateQueries({ queryKey: ["proposals", contractId] }),
    ]);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 sm:px-6">
      <BoardHero
        board={board}
        contractId={contractId}
        pendingCount={pendingCount}
        copied={copied}
        onCopy={copyAddress}
        canManage={canManage}
        connected={!!address}
        onConnect={connect}
        action={
          <CreateProposalModal
            boardContractId={contractId}
            memberCount={board.members.length}
            onSubmit={async (data) => {
              if (!address) {
                await connect();
                throw new Error("Connect Freighter, then try again");
              }
              setActionError(null);
              try {
                await createProposalLive(contractId, address, data as CreateProposalInput);
                await invalidate();
              } catch (err) {
                const msg = err instanceof Error ? err.message : "Create proposal failed";
                setActionError(msg);
                throw err;
              }
            }}
          />
        }
      />

      {actionError && (
        <div className="mb-6 rounded-xl border border-red-900/50 bg-red-950/40 px-4 py-3 text-sm text-red-300">
          {actionError}
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_320px] gap-8">
        <section>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-5">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Proposals
              </h2>
              <p className="text-xs text-foreground-secondary mt-0.5">
                {TAB_HINTS[activeTab]}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6 p-1 rounded-xl bg-muted/30 border border-border/50">
            {TABS.map((tab) => {
              const count = proposals.filter((p) => p.status === tab).length;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "tab-pill flex items-center gap-1.5",
                    activeTab === tab ? "tab-pill-active" : "tab-pill-inactive"
                  )}
                >
                  {tab}
                  {count > 0 && (
                    <span
                      className={cn(
                        "text-[10px] min-w-[1.25rem] h-5 px-1.5 rounded-full flex items-center justify-center font-semibold",
                        activeTab === tab ? "bg-primary/25 text-primary" : "bg-muted text-foreground-secondary"
                      )}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title={`No ${activeTab.toLowerCase()} proposals`}
              description={
                activeTab === "Pending"
                  ? "When a maintainer creates a proposal, it will appear here for review and signing."
                  : "Switch tabs to browse the full on-chain governance history."
              }
            />
          ) : (
            <div className="flex flex-col gap-4">
              {filtered.map((p) => (
                <ProposalCard
                  key={p.id}
                  proposal={p}
                  canSign={
                    canManage &&
                    p.status === "Pending" &&
                    !p.signers.some((s) => s.address === address)
                  }
                  isSigning={signingId === p.id}
                  onSign={async (id) => {
                    if (!address) {
                      await connect();
                      return;
                    }
                    setSigningId(id);
                    setActionError(null);
                    try {
                      await signProposalLive(contractId, id, address);
                      await invalidate();
                    } catch (err) {
                      setActionError(err instanceof Error ? err.message : "Sign failed");
                    } finally {
                      setSigningId(null);
                    }
                  }}
                />
              ))}
            </div>
          )}
        </section>

        <aside>
          <MemberList
            members={board.members}
            threshold={board.threshold}
            network={board.network}
            connectedAddress={address}
            adminAddress={board.deployerAddress}
          />
        </aside>
      </div>
    </div>
  );
}
