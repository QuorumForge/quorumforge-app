"use client";

import { useQuery } from "@tanstack/react-query";
import type { Proposal, ProposalStatus } from "@/types";

export interface ProposalStats {
  total: number;
  pending: number;
  executed: number;
  cancelled: number;
  expired: number;
  /** Ratio of executed proposals to total (0–1). */
  executionRate: number;
}

function computeStats(proposals: Proposal[]): ProposalStats {
  const counts: Record<ProposalStatus, number> = {
    Pending: 0,
    Executed: 0,
    Cancelled: 0,
    Expired: 0,
  };

  for (const p of proposals) {
    counts[p.status]++;
  }

  const total = proposals.length;
  const executionRate = total > 0 ? counts.Executed / total : 0;

  return {
    total,
    pending: counts.Pending,
    executed: counts.Executed,
    cancelled: counts.Cancelled,
    expired: counts.Expired,
    executionRate,
  };
}

/**
 * Fetches proposals for a board and returns computed status statistics.
 * Re-fetches every 30 seconds while the tab is focused.
 */
export function useProposalStats(boardContractId: string | null) {
  return useQuery<ProposalStats>({
    queryKey: ["proposal-stats", boardContractId],
    queryFn: async () => {
      if (!boardContractId) return computeStats([]);
      const res = await fetch(`/api/proposals?contractId=${encodeURIComponent(boardContractId)}`);
      if (!res.ok) throw new Error("Failed to fetch proposals");
      const proposals: Proposal[] = await res.json();
      return computeStats(proposals);
    },
    enabled: !!boardContractId,
    refetchInterval: 30_000,
    staleTime: 15_000,
  });
}
