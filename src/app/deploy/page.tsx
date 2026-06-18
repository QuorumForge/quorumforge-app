"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BoardDeployForm } from "@/components/BoardDeployForm";
import { useWallet } from "@/lib/wallet";
import { Button } from "@/components/ui/button";
import { Wallet, Shield } from "lucide-react";

export default function DeployPage() {
  const router = useRouter();
  const { address, connect, isConnecting } = useWallet();
  const [isDeploying, setIsDeploying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDeploy = async (data: {
    name: string;
    members: string[];
    threshold: number;
    initialFunding?: number;
  }) => {
    if (!address) return;
    setIsDeploying(true);
    setError(null);
    try {
      // 1. Build and sign the Soroban initialize transaction via Freighter
      const freighter = await import("@stellar/freighter-api");
      // Placeholder: in production, construct the Soroban contract invocation XDR
      // const txXdr = await buildInitializeTx({ ...data, deployer: address });
      // const signed = await freighter.signTransaction(txXdr, { networkPassphrase: ... });
      // const result = await submitTx(signed);

      // 2. Save board metadata to DB
      const res = await fetch("/api/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          contractId: `C${Math.random().toString(36).slice(2, 12).toUpperCase()}`, // replace with real contract ID
          network: "testnet",
          deployerAddress: address,
        }),
      });

      if (!res.ok) throw new Error("Failed to save board metadata");
      const board = await res.json();
      router.push(`/board/${board.contractId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Deployment failed");
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 sm:px-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Deploy a New Board</h1>
            <p className="text-sm text-foreground-secondary">
              Create a trustless N-of-M maintainer board on Stellar
            </p>
          </div>
        </div>
      </div>

      {!address ? (
        <div className="card-surface p-8 text-center">
          <Wallet className="h-12 w-12 text-foreground-secondary mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Connect Your Wallet</h2>
          <p className="text-sm text-foreground-secondary mb-6">
            You need to connect your Freighter wallet to deploy a board.
          </p>
          <Button onClick={connect} disabled={isConnecting} className="gap-2">
            <Wallet className="h-4 w-4" />
            {isConnecting ? "Connecting..." : "Connect Freighter"}
          </Button>
        </div>
      ) : (
        <div className="card-surface p-6">
          {error && (
            <div className="mb-4 rounded-md border border-red-800 bg-red-950 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}
          <BoardDeployForm onDeploy={handleDeploy} isDeploying={isDeploying} />
        </div>
      )}
    </div>
  );
}
