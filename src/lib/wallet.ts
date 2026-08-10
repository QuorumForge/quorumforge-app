"use client";

import { useState, useCallback, useEffect } from "react";

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [network, setNetwork] = useState<"testnet" | "mainnet" | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("qf_wallet");
    if (stored) {
      const parsed = JSON.parse(stored) as { address: string; network: "testnet" | "mainnet" };
      setAddress(parsed.address);
      setNetwork(parsed.network);
    }
  }, []);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const freighter = await import("@stellar/freighter-api");
      const installed = await freighter.isConnected();
      if (!installed) {
        throw new Error("Freighter extension not found. Please install it.");
      }

      // requestAccess opens Freighter's "Connection Request" popup and returns G-address.
      const publicKey = await freighter.requestAccess();
      if (!publicKey) {
        throw new Error("Connection cancelled in Freighter.");
      }

      const details = await freighter.getNetworkDetails();
      const passphrase = details?.networkPassphrase ?? String(await freighter.getNetwork());
      const net = passphrase.includes("Test SDF") ? "testnet" : "mainnet";

      if (net !== "testnet") {
        throw new Error(
          "Freighter is on Mainnet. Switch to Testnet in Freighter (Settings → Network → Testnet), then connect again."
        );
      }

      setAddress(publicKey);
      setNetwork(net);
      sessionStorage.setItem(
        "qf_wallet",
        JSON.stringify({ address: publicKey, network: net })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setNetwork(null);
    sessionStorage.removeItem("qf_wallet");
  }, []);

  const isMember = useCallback(
    (members: string[]) => !!address && members.includes(address),
    [address]
  );

  return { address, network, isConnecting, error, connect, disconnect, isMember };
}
