"use client";

import { truncateAddress, stellarExpertAccountUrl } from "@/lib/utils";
import { ExternalLink, Crown } from "lucide-react";
import type { BoardMember } from "@/types";
import type { Network } from "@/types";
import { cn } from "@/lib/utils";

interface MemberListProps {
  members: BoardMember[];
  threshold: number;
  network: Network;
  connectedAddress?: string | null;
  adminAddress?: string;
}

function memberGradient(address: string) {
  const hue = (address.charCodeAt(1) * 7 + address.charCodeAt(2) * 3) % 360;
  return `linear-gradient(135deg, hsl(${hue} 60% 45%) 0%, hsl(${(hue + 40) % 360} 55% 35%) 100%)`;
}

export function MemberList({
  members,
  threshold,
  network,
  connectedAddress,
  adminAddress,
}: MemberListProps) {
  return (
    <div className="card-elevated overflow-hidden sticky top-20">
      <div className="px-5 py-4 border-b border-border/80 bg-surface-elevated/50">
        <h3 className="text-sm font-semibold">Maintainer board</h3>
        <p className="text-xs text-foreground-secondary mt-0.5">
          {members.length} members · {threshold}-of-{members.length} quorum
        </p>
      </div>
      <ul className="divide-y divide-border/60" role="list" aria-label="Board members">
        {members.map((member, index) => {
          const isYou = connectedAddress === member.address;
          const isAdmin = adminAddress === member.address;

          return (
            <li
              key={member.address}
              className={cn(
                "flex items-center gap-3 px-5 py-4 transition-colors",
                isYou && "bg-primary/5"
              )}
            >
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm"
                style={{ background: memberGradient(member.address) }}
                aria-hidden
              >
                {member.address.slice(1, 3).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-mono text-xs font-medium">
                    {truncateAddress(member.address, 6)}
                  </span>
                  {isYou && (
                    <span className="text-[10px] uppercase tracking-wide text-primary font-semibold">
                      you
                    </span>
                  )}
                  {isAdmin && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] uppercase tracking-wide text-amber font-semibold">
                      <Crown className="h-3 w-3" /> admin
                    </span>
                  )}
                  <a
                    href={stellarExpertAccountUrl(member.address, network)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`View ${truncateAddress(member.address, 4)} on Stellar Expert`}
                    className="text-foreground-secondary hover:text-stellar transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  </a>
                </div>
                <p className="text-[11px] text-foreground-secondary mt-1">
                  Member #{index + 1}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
      <div className="px-5 py-3 border-t border-border/60 bg-muted/20">
        <p className="text-[11px] text-foreground-secondary leading-relaxed">
          Quorum requires {threshold} independent signatures before any action executes on-chain.
        </p>
      </div>
    </div>
  );
}
