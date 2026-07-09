"use client";

import { truncateAddress, stellarExpertContractUrl } from "@/lib/utils";
import { ExternalLink, CheckCircle2, Circle } from "lucide-react";
import type { BoardMember } from "@/types";
import type { Network } from "@/types";
import { cn } from "@/lib/utils";

interface MemberListProps {
  members: BoardMember[];
  threshold: number;
  network: Network;
  connectedAddress?: string | null;
}

export function MemberList({ members, threshold, network, connectedAddress }: MemberListProps) {
  return (
    <div className="card-surface overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-semibold">Board Members</h3>
        <span className="text-xs text-foreground-secondary">
          {threshold}-of-{members.length} required
        </span>
      </div>
      <ul className="divide-y divide-border" role="list" aria-label="Board members">
        {members.map((member) => {
          const isYou = connectedAddress === member.address;
          const activityPct =
            member.totalProposals > 0
              ? Math.round((member.signedCount / member.totalProposals) * 100)
              : 0;

          return (
            <li
              key={member.address}
              className={cn(
                "flex items-center justify-between px-4 py-3 text-sm",
                isYou && "bg-primary/5"
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-mono text-primary">
                  {member.address.slice(1, 3)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs">{truncateAddress(member.address, 6)}</span>
                    {isYou && (
                      <span className="text-xs text-primary font-medium">(you)</span>
                    )}
                    <a
                      href={stellarExpertContractUrl(member.address, network)}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`View ${truncateAddress(member.address, 4)} on Stellar Expert`}
                      className="text-foreground-secondary hover:text-primary transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    </a>
                  </div>
                  <p className="text-xs text-foreground-secondary mt-0.5">
                    {member.signedCount}/{member.totalProposals} signatures
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right">
                  <div className="text-xs font-medium">{activityPct}%</div>
                  <div
                    className="w-16 h-1 bg-muted rounded-full mt-1 overflow-hidden"
                    role="progressbar"
                    aria-valuenow={activityPct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${activityPct}% participation rate`}
                  >
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${activityPct}%` }}
                    />
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
