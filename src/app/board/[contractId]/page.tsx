"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, ExternalLink, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProposalCard } from "@/components/ProposalCard";
import { MemberList } from "@/components/MemberList";
import { CreateProposalModal } from "@/components/CreateProposalModal";
import { useWallet } from "@/lib/wallet";
import { stellarExpertContractUrl, truncateAddress } from "@/lib/utils";
import {
  createProposalLive,
  fetchBoardLive,
  fetchProposalsLive,
  signProposalLive,
  type CreateProposalInput,
} from "@/lib/soroban";
import type { ProposalStatus } from "@/types";

const TABS: ProposalStatus[] = ["Pending", "Executed", "Expired", "Cancelled"];

export default function BoardPage() {
  const { contractId } = useParams<{ contractId: string }>();
  const { address, isMember, connect } = useWallet();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<ProposalStatus>("Pending");
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

  if (boardLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-foreground-secondary">
        Loading board from Stellar Testnet…
      </div>
    );
  }

  if (boardError || !board) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 gap-2">
        <p className="text-red-400 text-sm">Failed to load board from chain.</p>
        <p className="text-foreground-secondary text-xs font-mono break-all">{contractId}</p>
        <p className="text-foreground-secondary text-xs max-w-md">
          {boardError instanceof Error ? boardError.message : "Unknown error"}
        </p>
      </div>
    );
  }

  const memberAddresses = board.members.map((m) => m.address);
  const canManage = isMember(memberAddresses);
  const filtered = proposals.filter((p) => p.status === activeTab);

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["board", contractId] }),
      queryClient.invalidateQueries({ queryKey: ["proposals", contractId] }),
    ]);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">{board.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="code-address">{truncateAddress(contractId, 8)}</span>
            <button
              onClick={copyAddress}
              className="text-foreground-secondary hover:text-primary transition-colors"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
            <a
              href={stellarExpertContractUrl(contractId, board.network)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground-secondary hover:text-primary transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={board.network === "testnet" ? "amber" : "emerald"}>
              {board.network}
            </Badge>
            <span className="text-sm text-foreground-secondary">
              {board.threshold}-of-{board.members.length} required · live Soroban
            </span>
          </div>
        </div>
        {canManage ? (
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
        ) : !address ? (
          <button
            onClick={() => connect()}
            className="text-sm text-primary hover:underline self-start"
          >
            Connect Freighter to manage
          </button>
        ) : null}
      </div>

      {actionError && (
        <div className="mb-4 rounded-md border border-red-800 bg-red-950 px-4 py-3 text-sm text-red-400">
          {actionError}
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        <div>
          <div className="flex gap-1 mb-4 border-b border-border">
            {TABS.map((tab) => {
              const count = proposals.filter((p) => p.status === tab).length;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
                    activeTab === tab
                      ? "border-primary text-primary"
                      : "border-transparent text-foreground-secondary hover:text-foreground"
                  }`}
                >
                  {tab}
                  {count > 0 && (
                    <span className="ml-1.5 text-xs rounded-full bg-muted px-1.5 py-0.5">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {filtered.length === 0 ? (
            <p className="text-center text-foreground-secondary py-12 text-sm">
              No {activeTab.toLowerCase()} proposals.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
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
        </div>

        <MemberList
          members={board.members}
          threshold={board.threshold}
          network={board.network}
          connectedAddress={address}
        />
      </div>
    </div>
  );
}
