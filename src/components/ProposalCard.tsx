"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Ban,
  Pen,
  ChevronRight,
  Hash,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SignatureProgressBar } from "@/components/SignatureProgressBar";
import { formatTimeRemaining, cn, truncateAddress } from "@/lib/utils";
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
  const isExecuted = proposal.status === "Executed";
  const createdDate = new Date(proposal.createdAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "card-elevated p-5 group relative overflow-hidden",
        isExecuted && "border-emerald/20"
      )}
    >
      {isExecuted && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald/0 via-emerald/60 to-emerald/0" />
      )}

      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-foreground-secondary bg-muted/60 px-2 py-0.5 rounded-md">
            <Hash className="h-3 w-3" />
            {proposal.id}
          </span>
          <Badge variant="default">{TYPE_LABELS[proposal.type]}</Badge>
          <Badge variant={STATUS_VARIANTS[proposal.status]} className="gap-1" role="status">
            {STATUS_ICONS[proposal.status]}
            {proposal.status}
          </Badge>
        </div>
        {proposal.status === "Pending" && (
          <span className="flex items-center gap-1 text-xs text-amber shrink-0 font-medium">
            <Clock className="h-3 w-3" />
            {timeRemaining}
          </span>
        )}
      </div>

      <Link
        href={`/board/${proposal.boardContractId}/proposal/${proposal.id}`}
        className="block group/link"
      >
        <p className="text-[15px] font-medium leading-snug mb-2 group-hover/link:text-primary transition-colors line-clamp-2">
          {proposal.description}
        </p>
        <p className="text-xs text-foreground-secondary mb-4">
          Proposed {createdDate} by{" "}
          <span className="font-mono">{truncateAddress(proposal.proposerAddress, 4)}</span>
        </p>
      </Link>

      <SignatureProgressBar
        collected={proposal.signers.length}
        required={proposal.requiredThreshold}
        total={proposal.requiredThreshold + 1}
        signers={proposal.signers}
        size="sm"
        showAvatars
      />

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/60">
        {canSign && proposal.status === "Pending" ? (
          <Button
            size="sm"
            onClick={() => onSign?.(proposal.id)}
            disabled={isSigning}
            className="gap-2"
            aria-label={`Sign proposal: ${proposal.description}`}
          >
            <Pen className="h-3.5 w-3.5" aria-hidden="true" />
            {isSigning ? "Signing…" : "Sign proposal"}
          </Button>
        ) : (
          <span className="text-xs text-foreground-secondary">
            {proposal.signers.length}/{proposal.requiredThreshold} signatures
          </span>
        )}
        <Link
          href={`/board/${proposal.boardContractId}/proposal/${proposal.id}`}
          className="inline-flex items-center gap-0.5 text-xs text-foreground-secondary hover:text-primary transition-colors"
        >
          Details <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </motion.article>
  );
}
