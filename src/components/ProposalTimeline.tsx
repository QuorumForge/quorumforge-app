"use client";

import { CheckCircle2, Clock, XCircle, Pen, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Proposal } from "@/types";

interface TimelineStep {
  label: string;
  sublabel?: string;
  status: "complete" | "active" | "pending";
  icon: React.ReactNode;
}

export function ProposalTimeline({ proposal }: { proposal: Proposal }) {
  const signerSteps: TimelineStep[] = proposal.signers.map((s, i) => ({
    label: `Signed by ${s.address.slice(0, 6)}…${s.address.slice(-4)}`,
    sublabel: new Date(s.signedAt).toLocaleString(),
    status: "complete" as const,
    icon: <Pen className="h-3.5 w-3.5" />,
  }));

  const steps: TimelineStep[] = [
    {
      label: "Proposal Created",
      sublabel: new Date(proposal.createdAt).toLocaleString(),
      status: "complete",
      icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    },
    ...signerSteps,
    proposal.status === "Executed"
      ? {
          label: "Executed On-Chain",
          sublabel: proposal.executedAt ? new Date(proposal.executedAt).toLocaleString() : undefined,
          status: "complete" as const,
          icon: <Zap className="h-3.5 w-3.5" />,
        }
      : proposal.status === "Expired"
      ? {
          label: "Expired",
          status: "complete" as const,
          icon: <XCircle className="h-3.5 w-3.5" />,
        }
      : {
          label: `Awaiting signatures (${proposal.signers.length}/${proposal.requiredThreshold})`,
          status: "active" as const,
          icon: <Clock className="h-3.5 w-3.5" />,
        },
  ];

  return (
    <ol className="relative ml-3 border-l border-border">
      {steps.map((step, i) => (
        <li key={i} className="mb-5 ml-5 last:mb-0">
          <span
            className={cn(
              "absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full border",
              step.status === "complete"
                ? "bg-emerald/20 border-emerald text-emerald"
                : step.status === "active"
                ? "bg-amber/20 border-amber text-amber"
                : "bg-muted border-border text-foreground-secondary"
            )}
          >
            {step.icon}
          </span>
          <p className="text-sm font-medium">{step.label}</p>
          {step.sublabel && (
            <p className="text-xs text-foreground-secondary mt-0.5">{step.sublabel}</p>
          )}
        </li>
      ))}
    </ol>
  );
}
