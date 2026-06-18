"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Zap, Users, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignatureProgressBar } from "@/components/SignatureProgressBar";
import { useQuery } from "@tanstack/react-query";
import type { LiveStats } from "@/types";

const STEPS = [
  { icon: <Shield className="h-5 w-5" />, title: "Deploy Board", desc: "Initialize your N-of-M multisig contract on Stellar with any set of maintainer addresses." },
  { icon: <Users className="h-5 w-5" />, title: "Create Proposal", desc: "Any board member can propose an action — fund transfers, member changes, or policy updates." },
  { icon: <CheckCircle2 className="h-5 w-5" />, title: "Collect Signatures", desc: "Members review and sign proposals using their Freighter wallet. Progress is public." },
  { icon: <Zap className="h-5 w-5" />, title: "Auto-Execute", desc: "Once the threshold is reached, the contract executes the action trustlessly on-chain." },
];

function AnimatedProgressDemo() {
  return (
    <div className="card-surface p-6 max-w-sm mx-auto">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium">Transfer 5,000 USDC</span>
        <span className="text-xs bg-amber/20 text-amber px-2 py-0.5 rounded-full">Pending</span>
      </div>
      <SignatureProgressBar
        collected={2}
        required={3}
        total={5}
        size="lg"
        showLabel
        showAvatars
        signers={[
          { address: "GABCDEF1234567890", signedAt: "" },
          { address: "GXYZ0987654321ABC", signedAt: "" },
        ]}
      />
      <p className="text-xs text-foreground-secondary mt-3 text-center">
        1 more signature needed to execute
      </p>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl font-bold gradient-text">{value}</div>
      <div className="text-sm text-foreground-secondary mt-1">{label}</div>
    </div>
  );
}

export default function LandingPage() {
  const { data: stats } = useQuery<LiveStats>({
    queryKey: ["stats"],
    queryFn: async () => {
      const r = await fetch("/api/boards");
      const boards = await r.json();
      return {
        totalBoards: boards.length ?? 0,
        proposalsExecuted: 0,
        usdcGoverned: 0,
      };
    },
  });

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center text-center px-4 pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(124,58,237,0.15),transparent)] pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Built on Stellar Soroban
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-balance mb-6">
            Replace your single G-address with a{" "}
            <span className="gradient-text">trustless maintainer board</span>
          </h1>
          <p className="text-lg text-foreground-secondary mb-8 max-w-2xl mx-auto text-balance">
            N-of-M multi-sig governance for any Stellar project. Transparent proposals,
            on-chain audit trail, no trusted intermediaries.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/deploy" className="gap-2">
                Deploy Your Board <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/dashboard">Join Existing Board</Link>
            </Button>
          </div>
        </motion.div>

        {/* Animated demo */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 w-full max-w-sm"
        >
          <AnimatedProgressDemo />
        </motion.div>
      </section>

      {/* Live stats */}
      {stats && (
        <section className="border-y border-border py-12 px-4">
          <div className="max-w-3xl mx-auto grid grid-cols-3 gap-8">
            <StatCard label="Boards Deployed" value={stats.totalBoards.toLocaleString()} />
            <StatCard label="Proposals Executed" value={stats.proposalsExecuted.toLocaleString()} />
            <StatCard
              label="USDC Governed"
              value={`$${stats.usdcGoverned.toLocaleString()}`}
            />
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3">How It Works</h2>
          <p className="text-foreground-secondary text-center mb-12">
            Four steps from idea to trustless execution
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STEPS.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card-surface p-5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary mb-4">
                  {step.icon}
                </div>
                <div className="text-xs text-primary font-mono mb-1">0{i + 1}</div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-foreground-secondary">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-xl mx-auto card-surface p-10">
          <h2 className="text-2xl font-bold mb-3">Ready to decentralize your project?</h2>
          <p className="text-foreground-secondary mb-6">
            Deploy your first board in under 5 minutes. No code required.
          </p>
          <Button size="lg" asChild>
            <Link href="/deploy" className="gap-2">
              Deploy Your Board <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
