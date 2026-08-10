"use client";

import {
  Users,
  FileCheck,
  Clock,
  Shield,
  Copy,
  Check,
  ExternalLink,
  PenLine,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LiveChainIndicator } from "@/components/LiveChainIndicator";
import { SignatureProgressBar } from "@/components/SignatureProgressBar";
import { truncateAddress, stellarExpertContractUrl } from "@/lib/utils";
import type { Board } from "@/types";

interface BoardHeroProps {
  board: Board;
  contractId: string;
  pendingCount: number;
  copied: boolean;
  onCopy: () => void;
  canManage: boolean;
  onConnect?: () => void;
  connected: boolean;
  action?: React.ReactNode;
}

export function BoardHero({
  board,
  contractId,
  pendingCount,
  copied,
  onCopy,
  canManage,
  onConnect,
  connected,
  action,
}: BoardHeroProps) {
  const created = new Date(board.createdAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-board-hero shadow-card mb-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.08),transparent_50%)] pointer-events-none" />
      <div className="relative p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <LiveChainIndicator network={board.network} />
              <Badge variant={board.network === "testnet" ? "amber" : "emerald"}>
                {board.network}
              </Badge>
              <Badge variant="muted" className="font-mono">
                Soroban
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
              {board.name}
            </h1>
            <p className="text-sm text-foreground-secondary max-w-xl mb-4">
              On-chain N-of-M maintainer governance. Every proposal, signature, and execution
              is verifiable on Stellar — no trusted coordinator.
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <code className="code-address max-w-full truncate">{contractId}</code>
              <button
                type="button"
                onClick={onCopy}
                className="p-1.5 rounded-md text-foreground-secondary hover:text-foreground hover:bg-muted/60 transition-colors"
                aria-label="Copy contract ID"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-emerald" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
              <a
                href={stellarExpertContractUrl(contractId, board.network)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-stellar hover:underline"
              >
                Stellar Expert <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <p className="text-xs text-foreground-secondary mt-2">
              Initialized {created} · Admin {truncateAddress(board.deployerAddress, 6)}
            </p>
          </div>

          <div className="flex flex-col items-stretch sm:items-end gap-3 shrink-0">
            {canManage && action}
            {!connected && !canManage && onConnect && (
              <Button onClick={onConnect} variant="outline" className="gap-2">
                <PenLine className="h-4 w-4" />
                Connect Freighter
              </Button>
            )}
            {!canManage && connected && (
              <p className="text-xs text-foreground-secondary text-right max-w-[220px]">
                Viewing as guest. Only board members can propose and sign.
              </p>
            )}

            <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-surface/60 px-4 py-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{board.threshold}</div>
                <div className="text-[10px] uppercase tracking-wider text-foreground-secondary">
                  of {board.members.length}
                </div>
              </div>
              <div className="h-10 w-px bg-border" />
              <SignatureProgressBar
                collected={board.threshold}
                required={board.threshold}
                total={board.members.length}
                size="sm"
                showLabel={false}
              />
              <div className="text-xs text-foreground-secondary whitespace-nowrap">
                quorum rule
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
          <StatTile
            icon={Users}
            label="Members"
            value={String(board.members.length)}
            hint="maintainers"
          />
          <StatTile
            icon={Shield}
            label="Threshold"
            value={`${board.threshold}-of-${board.members.length}`}
            hint="required"
          />
          <StatTile
            icon={FileCheck}
            label="Executed"
            value={String(board.executedProposals)}
            hint="on-chain"
            accent="emerald"
          />
          <StatTile
            icon={Clock}
            label="Pending"
            value={String(pendingCount)}
            hint="awaiting votes"
            accent="amber"
          />
        </div>
      </div>
    </div>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint: string;
  accent?: "emerald" | "amber";
}) {
  return (
    <div className="stat-tile">
      <div className="flex items-center gap-2 mb-2">
        <Icon
          className={`h-4 w-4 ${
            accent === "emerald"
              ? "text-emerald"
              : accent === "amber"
                ? "text-amber"
                : "text-primary"
          }`}
        />
        <span className="text-xs text-foreground-secondary uppercase tracking-wide">
          {label}
        </span>
      </div>
      <div className="text-xl font-semibold tabular-nums">{value}</div>
      <div className="text-[11px] text-foreground-secondary mt-0.5">{hint}</div>
    </div>
  );
}
