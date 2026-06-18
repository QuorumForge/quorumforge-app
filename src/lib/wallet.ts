"use client";

import { useState, useCallback, useEffect } from "react";

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [network, setNetwork] = useState<"testnet" | "mainnet" | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Restore session on mount
  useEffect(() => {
    const stored = sessionStorage.getItem("qf_wallet");
    if (stored) {
      const { address, network } = JSON.parse(stored);
      setAddress(address);
      setNetwork(network);
    }
  }, []);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const freighter = await import("@stellar/freighter-api");
      const connected = await freighter.isConnected();
      if (!connected) {
        throw new Error("Freighter extension not found. Please install it.");
      }
      await freighter.setAllowed();
      const { address } = await freighter.getAddress();
      const { networkPassphrase } = await freighter.getNetwork();
      const net = networkPassphrase.includes("Test SDF") ? "testnet" : "mainnet";
      setAddress(address);
      setNetwork(net);
      sessionStorage.setItem("qf_wallet", JSON.stringify({ address, network: net }));
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
