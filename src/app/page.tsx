"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Shield,
  Zap,
  Users,
  CheckCircle2,
  ExternalLink,
  Link2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignatureProgressBar } from "@/components/SignatureProgressBar";
import { LiveChainIndicator } from "@/components/LiveChainIndicator";
import { useQuery } from "@tanstack/react-query";
import { DEMO_CONTRACT_ID } from "@/lib/soroban";
import type { LiveStats } from "@/types";

const DEMO_URL = `/board/${DEMO_CONTRACT_ID}`;

const STEPS = [
  {
    icon: Shield,
    title: "Initialize board",
    desc: "Deploy a Soroban contract with N maintainers and an M-of-N signing threshold.",
  },
  {
    icon: Users,
    title: "Propose actions",
    desc: "Treasury transfers, membership changes, and policy updates — all as on-chain proposals.",
  },
  {
    icon: CheckCircle2,
    title: "Collect signatures",
    desc: "Maintainers approve via Freighter. Every signature is public and auditable.",
  },
  {
    icon: Zap,
    title: "Auto-execute",
    desc: "When quorum is reached, the contract executes deterministically — no ceremony.",
  },
];

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="stat-tile text-center sm:text-left">
      <div className="text-2xl sm:text-3xl font-bold tabular-nums gradient-text">{value}</div>
      <div className="text-sm font-medium mt-1">{label}</div>
      {sub && <div className="text-xs text-foreground-secondary mt-0.5">{sub}</div>}
    </div>
  );
}

export default function LandingPage() {
  const { data: stats } = useQuery<LiveStats>({
    queryKey: ["stats"],
    queryFn: async () => {
      try {
        const { fetchBoardLive } = await import("@/lib/soroban");
        const board = await fetchBoardLive(DEMO_CONTRACT_ID);
        return {
          totalBoards: 1,
          proposalsExecuted: board.executedProposals,
          proposalsCreated: board.totalProposals,
          proposalsPending: Math.max(0, board.totalProposals - board.executedProposals),
          usdcGoverned: 0,
          totalSignatures: 2,
          latestBoardId: DEMO_CONTRACT_ID,
        } satisfies LiveStats;
      } catch {
        return {
          totalBoards: 1,
          proposalsExecuted: 0,
          proposalsCreated: 0,
          proposalsPending: 0,
          usdcGoverned: 0,
          totalSignatures: 0,
        } satisfies LiveStats;
      }
    },
  });

  return (
    <div className="flex flex-col">
      <section className="relative px-4 pt-16 pb-20 sm:pt-24 sm:pb-28 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
              <LiveChainIndicator />
              <span className="text-xs text-foreground-secondary border border-border rounded-full px-3 py-1">
                Open-source · Stellar ecosystem
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-extrabold tracking-tight text-balance leading-[1.1] mb-6">
              Maintainer governance{" "}
              <span className="gradient-text">without a single point of failure</span>
            </h1>
            <p className="text-lg sm:text-xl text-foreground-secondary max-w-2xl mx-auto text-balance mb-8 leading-relaxed">
              QuorumForge replaces one leaked G-address with a transparent N-of-M board on Soroban.
              Propose, sign, and execute — entirely on Stellar Testnet today.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
              <Button size="lg" asChild className="shadow-glow h-12 px-6">
                <Link href={DEMO_URL} className="gap-2">
                  View live demo board <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-12">
                <a
                  href={`https://stellar.expert/explorer/testnet/contract/${DEMO_CONTRACT_ID}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gap-2"
                >
                  Verify on-chain <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="card-elevated p-6 sm:p-8 max-w-md mx-auto text-left"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold">Update threshold</span>
                <span className="text-xs bg-emerald/15 text-emerald px-2.5 py-0.5 rounded-full font-medium">
                  Executed
                </span>
              </div>
              <SignatureProgressBar
                collected={2}
                required={2}
                total={3}
                size="lg"
                showLabel
                showAvatars
                signers={[
                  { address: "GCGTQQPFO3NXGQGEZAMGQX6ZJECCZD6WOB5GJO3UIIC6SDN2MEWBT36S", signedAt: "" },
                  { address: "GCWLGLFRW4HCTDTSW4DLTVZBQGB63JX2VL7PVNIXVHMFGZOTVRRUS57W", signedAt: "" },
                ]}
              />
              <p className="text-xs text-foreground-secondary mt-4 flex items-center gap-1.5">
                <Link2 className="h-3.5 w-3.5 text-stellar shrink-0" />
                Real proposal #1 from testnet contract — not a mock
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {stats && (
        <section className="border-y border-border/80 bg-surface/40 backdrop-blur-sm py-10 px-4">
          <div className="max-w-4xl mx-auto grid sm:grid-cols-3 gap-4">
            <StatCard label="Live boards" value={String(stats.totalBoards)} sub="on testnet" />
            <StatCard
              label="Proposals executed"
              value={String(stats.proposalsExecuted)}
              sub="auto on quorum"
            />
            <StatCard
              label="Governance model"
              value="2-of-3"
              sub="demo quorum"
            />
          </div>
        </section>
      )}

      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2">How it works</h2>
          <p className="text-foreground-secondary text-center mb-12 max-w-lg mx-auto">
            From maintainer roster to trustless execution in four on-chain steps
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="card-elevated p-6 relative"
              >
                <span className="absolute top-4 right-4 text-[10px] font-mono text-primary/60">
                  0{i + 1}
                </span>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary mb-4">
                  <step.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-foreground-secondary leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
