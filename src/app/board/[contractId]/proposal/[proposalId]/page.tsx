"use client";

import { useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ExternalLink, ArrowLeft, Pen, Ban } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SignatureProgressBar } from "@/components/SignatureProgressBar";
import { ProposalTimeline } from "@/components/ProposalTimeline";
import { useWallet } from "@/lib/wallet";
import { stellarExpertTxUrl, truncateAddress, formatTimeRemaining } from "@/lib/utils";
import {
  cancelProposalLive,
  fetchBoardLive,
  fetchProposalLive,
  signProposalLive,
} from "@/lib/soroban";

export default function ProposalDetailPage() {
  const { contractId, proposalId } = useParams<{ contractId: string; proposalId: string }>();
  const { address, isMember, connect } = useWallet();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState<"sign" | "cancel" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: board } = useQuery({
    queryKey: ["board", contractId],
    queryFn: () => fetchBoardLive(contractId),
  });

  const {
    data: proposal,
    isLoading,
    error: loadError,
  } = useQuery({
    queryKey: ["proposal", contractId, proposalId],
    queryFn: () => fetchProposalLive(contractId, proposalId),
    refetchInterval: 10_000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-foreground-secondary">
        Loading proposal from chain…
      </div>
    );
  }

  if (loadError || !proposal) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 gap-2">
        <p className="text-red-400 text-sm">Failed to load proposal.</p>
        <p className="text-xs text-foreground-secondary">
          {loadError instanceof Error ? loadError.message : "Not found"}
        </p>
      </div>
    );
  }

  const memberAddresses = board?.members.map((m) => m.address) ?? [];
  const hasSigned = proposal.signers.some((s) => s.address === address);
  const canSign =
    !!address &&
    isMember(memberAddresses) &&
    !hasSigned &&
    proposal.status === "Pending";
  const canCancel = address === proposal.proposerAddress && proposal.status === "Pending";
  const timeRemaining = formatTimeRemaining(proposal.expiryLedger, proposal.currentLedger);
  const payloadEntries = Object.entries(proposal.payload as Record<string, unknown>);

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["proposal", contractId, proposalId] }),
      queryClient.invalidateQueries({ queryKey: ["proposals", contractId] }),
      queryClient.invalidateQueries({ queryKey: ["board", contractId] }),
    ]);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6">
      <Link
        href={`/board/${contractId}`}
        className="inline-flex items-center gap-1.5 text-sm text-foreground-secondary hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Board
      </Link>

      {error && (
        <div className="mb-4 rounded-md border border-red-800 bg-red-950 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_280px] gap-6">
        <div className="flex flex-col gap-5">
          <div className="card-surface p-5">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <Badge variant="default">{proposal.type}</Badge>
              <Badge
                variant={
                  proposal.status === "Executed"
                    ? "emerald"
                    : proposal.status === "Pending"
                      ? "amber"
                      : "muted"
                }
              >
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

          <div className="card-surface p-5">
            <h2 className="text-sm font-semibold mb-4">Signatures</h2>
            <SignatureProgressBar
              collected={proposal.signers.length}
              required={proposal.requiredThreshold}
              total={board?.members.length ?? proposal.requiredThreshold + 1}
              signers={proposal.signers}
              size="lg"
              showLabel
              showAvatars
            />
            {proposal.signers.length > 0 && (
              <ul className="mt-4 flex flex-col gap-2">
                {proposal.signers.map((s) => (
                  <li key={s.address} className="flex items-center justify-between text-xs">
                    <span className="font-mono text-foreground-secondary">
                      {truncateAddress(s.address, 8)}
                    </span>
                    <span className="text-foreground-secondary">
                      {new Date(s.signedAt).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {proposal.status === "Executed" && (
            <div className="card-surface p-5 border-emerald/30">
              <h2 className="text-sm font-semibold text-emerald mb-2">Executed on-chain</h2>
              {proposal.executedAt && (
                <p className="text-xs text-foreground-secondary mb-2">
                  {new Date(proposal.executedAt).toLocaleString()}
                </p>
              )}
              {proposal.txHash && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-mono text-foreground-secondary">
                    {truncateAddress(proposal.txHash, 8)}
                  </span>
                  <a
                    href={stellarExpertTxUrl(proposal.txHash, "testnet")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald hover:underline flex items-center gap-0.5"
                  >
                    View on Stellar Expert <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
          )}

          {(canSign || canCancel || !address) && proposal.status === "Pending" && (
            <div className="flex gap-3">
              {!address ? (
                <Button className="flex-1 gap-2" onClick={() => connect()}>
                  Connect Freighter to Sign
                </Button>
              ) : (
                <>
                  {canSign && (
                    <Button
                      className="flex-1 gap-2"
                      disabled={busy !== null}
                      onClick={async () => {
                        setBusy("sign");
                        setError(null);
                        try {
                          await signProposalLive(contractId, proposalId, address);
                          await invalidate();
                        } catch (err) {
                          setError(err instanceof Error ? err.message : "Sign failed");
                        } finally {
                          setBusy(null);
                        }
                      }}
                    >
                      <Pen className="h-4 w-4" />
                      {busy === "sign" ? "Signing…" : "Sign Proposal"}
                    </Button>
                  )}
                  {canCancel && (
                    <Button
                      variant="outline"
                      className="gap-2 text-red-400 border-red-800 hover:bg-red-950"
                      disabled={busy !== null}
                      onClick={async () => {
                        setBusy("cancel");
                        setError(null);
                        try {
                          await cancelProposalLive(contractId, proposalId, address);
                          await invalidate();
                        } catch (err) {
                          setError(err instanceof Error ? err.message : "Cancel failed");
                        } finally {
                          setBusy(null);
                        }
                      }}
                    >
                      <Ban className="h-4 w-4" />
                      {busy === "cancel" ? "Cancelling…" : "Cancel"}
                    </Button>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <div className="card-surface p-5 h-fit">
          <h2 className="text-sm font-semibold mb-4">Timeline</h2>
          <ProposalTimeline proposal={proposal} />
        </div>
      </div>
    </div>
  );
}
