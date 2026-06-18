"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Copy, ExternalLink, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProposalCard } from "@/components/ProposalCard";
import { MemberList } from "@/components/MemberList";
import { CreateProposalModal } from "@/components/CreateProposalModal";
import { useWallet } from "@/lib/wallet";
import { stellarExpertContractUrl, truncateAddress } from "@/lib/utils";
import type { Board, Proposal, ProposalStatus } from "@/types";

const TABS: ProposalStatus[] = ["Pending", "Executed", "Expired", "Cancelled"];

// Mock data loader — replace with real Soroban contract reads
async function fetchBoard(contractId: string): Promise<Board> {
  return {
    id: contractId,
    contractId,
    network: "testnet",
    name: "Demo Maintainers",
    deployerAddress: "GABC1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890",
    createdAt: new Date().toISOString(),
    members: [
      { address: "GABC1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890", signedCount: 5, totalProposals: 6 },
      { address: "GXYZ0987654321ABCDEF0987654321ABCDEF0987654321ABCDEF0987654321", signedCount: 4, totalProposals: 6 },
      { address: "GDEF5678901234ABCDEF5678901234ABCDEF5678901234ABCDEF5678901234", signedCount: 3, totalProposals: 6 },
    ],
    threshold: 2,
    totalProposals: 6,
    executedProposals: 4,
  };
}

async function fetchProposals(contractId: string): Promise<Proposal[]> {
  return [
    {
      id: "prop-1",
      boardContractId: contractId,
      type: "TransferFunds",
      description: "Transfer 1,000 USDC to fund the annual security audit",
      payload: { recipient: "GABC...", amount: 1000, asset: "USDC" },
      status: "Pending",
      proposerAddress: "GABC1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      expiryLedger: 5000100,
      currentLedger: 4999000,
      signers: [{ address: "GABC1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890", signedAt: new Date().toISOString() }],
      requiredThreshold: 2,
    },
    {
      id: "prop-2",
      boardContractId: contractId,
      type: "AddMember",
      description: "Add new core contributor to the maintainer board",
      payload: { newMember: "GNEW..." },
      status: "Executed",
      proposerAddress: "GXYZ0987654321ABCDEF0987654321ABCDEF0987654321ABCDEF0987654321",
      createdAt: new Date(Date.now() - 604800000).toISOString(),
      expiryLedger: 4990000,
      currentLedger: 4999000,
      signers: [
        { address: "GABC1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890", signedAt: new Date().toISOString() },
        { address: "GXYZ0987654321ABCDEF0987654321ABCDEF0987654321ABCDEF0987654321", signedAt: new Date().toISOString() },
      ],
      requiredThreshold: 2,
      executedAt: new Date(Date.now() - 518400000).toISOString(),
      txHash: "abc123",
    },
  ];
}

export default function BoardPage() {
  const { contractId } = useParams<{ contractId: string }>();
  const { address, isMember } = useWallet();
  const [activeTab, setActiveTab] = useState<ProposalStatus>("Pending");
  const [copied, setCopied] = useState(false);

  const { data: board, isLoading: boardLoading } = useQuery({
    queryKey: ["board", contractId],
    queryFn: () => fetchBoard(contractId),
  });

  const { data: proposals = [] } = useQuery({
    queryKey: ["proposals", contractId],
    queryFn: () => fetchProposals(contractId),
  });

  const copyAddress = () => {
    navigator.clipboard.writeText(contractId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (boardLoading || !board) {
    return <div className="flex items-center justify-center min-h-[60vh] text-foreground-secondary">Loading board…</div>;
  }

  const memberAddresses = board.members.map((m) => m.address);
  const canManage = isMember(memberAddresses);
  const filtered = proposals.filter((p) => p.status === activeTab);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">{board.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="code-address">{truncateAddress(contractId, 8)}</span>
            <button onClick={copyAddress} className="text-foreground-secondary hover:text-primary transition-colors">
              {copied ? <Check className="h-3.5 w-3.5 text-emerald" /> : <Copy className="h-3.5 w-3.5" />}
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
            <Badge variant={board.network === "testnet" ? "amber" : "emerald"}>{board.network}</Badge>
            <span className="text-sm text-foreground-secondary">
              {board.threshold}-of-{board.members.length} required
            </span>
          </div>
        </div>
        {canManage && (
          <CreateProposalModal
            boardContractId={contractId}
            memberCount={board.members.length}
            onSubmit={async (data) => {
              console.log("Create proposal:", data);
            }}
          />
        )}
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        {/* Proposals */}
        <div>
          {/* Tabs */}
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
                    <span className="ml-1.5 text-xs rounded-full bg-muted px-1.5 py-0.5">{count}</span>
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
                  canSign={canManage && !p.signers.some((s) => s.address === address)}
                  onSign={(id) => console.log("Sign", id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
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
