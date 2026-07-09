"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, CheckCircle2, XCircle, Ban, Pen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SignatureProgressBar } from "@/components/SignatureProgressBar";
import { formatTimeRemaining, cn } from "@/lib/utils";
import type { Proposal, ProposalType, ProposalStatus } from "@/types";

const TYPE_LABELS: Record<ProposalType, string> = {
  ResolveIssue: "Resolve Issue",
  TransferFunds: "Transfer Funds",
  AddMember: "Add Member",
  RemoveMember: "Remove Member",
  UpdateThreshold: "Update Threshold",
};

const STATUS_ICONS: Record<ProposalStatus, React.ReactNode> = {
  Pending: <Clock className="h-3.5 w-3.5" />,
  Executed: <CheckCircle2 className="h-3.5 w-3.5" />,
  Expired: <XCircle className="h-3.5 w-3.5" />,
  Cancelled: <Ban className="h-3.5 w-3.5" />,
};

const STATUS_VARIANTS: Record<ProposalStatus, "amber" | "emerald" | "muted" | "destructive"> = {
  Pending: "amber",
  Executed: "emerald",
  Expired: "muted",
  Cancelled: "destructive",
};

interface ProposalCardProps {
  proposal: Proposal;
  canSign?: boolean;
  onSign?: (proposalId: string) => void;
  isSigning?: boolean;
}

export function ProposalCard({ proposal, canSign, onSign, isSigning }: ProposalCardProps) {
  const timeRemaining = formatTimeRemaining(proposal.expiryLedger, proposal.currentLedger);
  const alreadySigned = proposal.signers.some((s) => s.address === proposal.proposerAddress);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-surface p-4 hover:border-border/80 transition-colors group"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="default">{TYPE_LABELS[proposal.type]}</Badge>
          <Badge variant={STATUS_VARIANTS[proposal.status]} className="gap-1" role="status">
            {STATUS_ICONS[proposal.status]}
            {proposal.status}
          </Badge>
        </div>
        {proposal.status === "Pending" && (
          <span className="flex items-center gap-1 text-xs text-amber shrink-0">
            <Clock className="h-3 w-3" />
            {timeRemaining}
          </span>
        )}
      </div>

      <Link
        href={`/board/${proposal.boardContractId}/proposal/${proposal.id}`}
        className="block group-hover:text-primary transition-colors"
      >
        <p className="text-sm font-medium line-clamp-2 mb-3">{proposal.description}</p>
      </Link>

      <SignatureProgressBar
        collected={proposal.signers.length}
        required={proposal.requiredThreshold}
        total={proposal.requiredThreshold + 1}
        signers={proposal.signers}
        size="sm"
      />

      {canSign && proposal.status === "Pending" && (
        <div className="mt-3 pt-3 border-t border-border">
          <Button
            size="sm"
            onClick={() => onSign?.(proposal.id)}
            disabled={isSigning}
            className="w-full gap-2"
            aria-label={`Sign proposal: ${proposal.description}`}
          >
            <Pen className="h-3.5 w-3.5" aria-hidden="true" />
            {isSigning ? "Signing..." : "Sign Proposal"}
          </Button>
        </div>
      )}
    </motion.div>
  );
}
