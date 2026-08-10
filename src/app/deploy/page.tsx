"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { BoardDeployForm } from "@/components/BoardDeployForm";
import { useWallet } from "@/lib/wallet";
import { Button } from "@/components/ui/button";
import { Wallet, Shield, ExternalLink } from "lucide-react";
import { DEMO_CONTRACT_ID, registerBoardMetadata } from "@/lib/soroban";
import { truncateAddress } from "@/lib/utils";

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
      // Appeal demo path: register metadata against the live testnet contract.
      // Full wasm deploy-from-browser lands next; the demo board is already initialized.
      const contractId = DEMO_CONTRACT_ID;
      await registerBoardMetadata({
        name: data.name,
        contractId,
        deployerAddress: address,
        network: "testnet",
      });
      router.push(`/board/${contractId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
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
            <h1 className="text-2xl font-bold">Open the Live Demo Board</h1>
            <p className="text-sm text-foreground-secondary">
              QuorumForge is live on Stellar Testnet. Register a display name, then propose &amp;
              sign with Freighter.
            </p>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-xs space-y-1">
          <p>
            <span className="text-foreground-secondary">Contract ID: </span>
            <span className="font-mono">{truncateAddress(DEMO_CONTRACT_ID, 10)}</span>
          </p>
          <a
            href={`https://stellar.expert/explorer/testnet/contract/${DEMO_CONTRACT_ID}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            View on Stellar Expert <ExternalLink className="h-3 w-3" />
          </a>
          <p className="text-foreground-secondary">
            Or skip registration and{" "}
            <Link href={`/board/${DEMO_CONTRACT_ID}`} className="text-primary hover:underline">
              open the board now
            </Link>
            .
          </p>
        </div>
      </div>

      {!address ? (
        <div className="card-surface p-8 text-center">
          <Wallet className="h-12 w-12 text-foreground-secondary mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Connect Your Wallet</h2>
          <p className="text-sm text-foreground-secondary mb-6">
            Use Freighter on <strong>Testnet</strong>. Fund via Friendbot if needed.
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
