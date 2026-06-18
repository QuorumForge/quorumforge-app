"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, ArrowLeft, Pen, Ban } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SignatureProgressBar } from "@/components/SignatureProgressBar";
import { ProposalTimeline } from "@/components/ProposalTimeline";
import { useWallet } from "@/lib/wallet";
import { stellarExpertTxUrl, truncateAddress, formatTimeRemaining } from "@/lib/utils";
import type { Proposal } from "@/types";

async function fetchProposal(_contractId: string, proposalId: string): Promise<Proposal> {
  return {
    id: proposalId,
    boardContractId: _contractId,
    type: "TransferFunds",
    description: "Transfer 1,000 USDC to fund the annual security audit by Trail of Bits.",
    payload: { recipient: "GABC1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890", amount: 1000, asset: "USDC" },
    status: "Pending",
    proposerAddress: "GABC1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    expiryLedger: 5000100,
    currentLedger: 4999000,
    signers: [
      { address: "GABC1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890", signedAt: new Date(Date.now() - 3600000).toISOString() },
    ],
    requiredThreshold: 2,
  };
}

export default function ProposalDetailPage() {
  const { contractId, proposalId } = useParams<{ contractId: string; proposalId: string }>();
  const { address, isMember } = useWallet();

  const { data: proposal, isLoading } = useQuery({
    queryKey: ["proposal", contractId, proposalId],
    queryFn: () => fetchProposal(contractId, proposalId),
  });

  if (isLoading || !proposal) {
    return <div className="flex items-center justify-center min-h-[60vh] text-foreground-secondary">Loading…</div>;
  }

  const hasSigned = proposal.signers.some((s) => s.address === address);
  const canSign = isMember([proposal.proposerAddress]) && !hasSigned && proposal.status === "Pending";
  const canCancel = (address === proposal.proposerAddress) && proposal.status === "Pending";
  const timeRemaining = formatTimeRemaining(proposal.expiryLedger, proposal.currentLedger);

  const payloadEntries = Object.entries(proposal.payload as Record<string, unknown>);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6">
      <Link href={`/board/${contractId}`} className="inline-flex items-center gap-1.5 text-sm text-foreground-secondary hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Board
      </Link>

      <div className="grid lg:grid-cols-[1fr_280px] gap-6">
        {/* Main content */}
        <div className="flex flex-col gap-5">
          {/* Header */}
          <div className="card-surface p-5">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <Badge variant="default">{proposal.type}</Badge>
              <Badge variant={proposal.status === "Executed" ? "emerald" : proposal.status === "Pending" ? "amber" : "muted"}>
                {proposal.status}
              </Badge>
              {proposal.status === "Pending" && (
                <span className="text-xs text-amber ml-auto">{timeRemaining}</span>
              )}
            </div>
            <h1 className="text-xl font-semibold mb-2">{proposal.description}</h1>
            <p className="text-xs text-foreground-secondary">
              Proposed by{" "}
              <span className="font-mono">{truncateAddress(proposal.proposerAddress, 6)}</span>
              {" · "}
              {new Date(proposal.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* Payload */}
          <div className="card-surface p-5">
            <h2 className="text-sm font-semibold mb-3">Payload</h2>
            <dl className="grid gap-2">
              {payloadEntries.map(([key, val]) => (
                <div key={key} className="flex items-start justify-between text-sm gap-4">
                  <dt className="text-foreground-secondary capitalize shrink-0">{key}</dt>
                  <dd className="font-mono text-xs text-right break-all">{String(val)}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Signatures */}
          <div className="card-surface p-5">
            <h2 className="text-sm font-semibold mb-4">Signatures</h2>
            <SignatureProgressBar
              collected={proposal.signers.length}
              required={proposal.requiredThreshold}
              total={proposal.requiredThreshold + 1}
              signers={proposal.signers}
              size="lg"
              showLabel
              showAvatars
            />
            {proposal.signers.length > 0 && (
              <ul className="mt-4 flex flex-col gap-2">
                {proposal.signers.map((s) => (
                  <li key={s.address} className="flex items-center justify-between text-xs">
                    <span className="font-mono text-foreground-secondary">{truncateAddress(s.address, 8)}</span>
                    <span className="text-foreground-secondary">{new Date(s.signedAt).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Execution result */}
          {proposal.txHash && (
            <div className="card-surface p-5 border-emerald/30">
              <h2 className="text-sm font-semibold text-emerald mb-2">Executed</h2>
              <div className="flex items-center gap-2 text-xs">
                <span className="font-mono text-foreground-secondary">{truncateAddress(proposal.txHash, 8)}</span>
                <a
                  href={stellarExpertTxUrl(proposal.txHash, "testnet")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald hover:underline flex items-center gap-0.5"
                >
                  View on Stellar Expert <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          )}

          {/* Actions */}
          {(canSign || canCancel) && (
            <div className="flex gap-3">
              {canSign && (
                <Button className="flex-1 gap-2" onClick={() => console.log("sign", proposalId)}>
                  <Pen className="h-4 w-4" /> Sign Proposal
                </Button>
              )}
              {canCancel && (
                <Button variant="outline" className="gap-2 text-red-400 border-red-800 hover:bg-red-950">
                  <Ban className="h-4 w-4" /> Cancel
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Timeline sidebar */}
        <div className="card-surface p-5 h-fit">
          <h2 className="text-sm font-semibold mb-4">Timeline</h2>
          <ProposalTimeline proposal={proposal} />
        </div>
      </div>
    </div>
  );
}
