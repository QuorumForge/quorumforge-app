"use client";

import { useWallet } from "@/lib/wallet";
import { Button } from "@/components/ui/button";
import { truncateAddress } from "@/lib/utils";
import { Wallet, ChevronDown, LogOut, Loader2 } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

export function WalletConnectButton() {
  const { address, network, isConnecting, error, connect, disconnect } = useWallet();

  if (!address) {
    return (
      <Button
        onClick={connect}
        disabled={isConnecting}
        size="sm"
        aria-busy={isConnecting}
        aria-label={isConnecting ? "Connecting to Freighter wallet" : "Connect Freighter wallet"}
      >
        {isConnecting ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" aria-hidden="true" />
        ) : (
          <Wallet className="h-4 w-4 mr-2" aria-hidden="true" />
        )}
        {isConnecting ? "Connecting..." : "Connect Freighter"}
      </Button>
    );
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald" />
          <span className="font-mono">{truncateAddress(address)}</span>
          {network && (
            <span className="text-xs text-foreground-secondary">
              {network === "testnet" ? "Testnet" : "Mainnet"}
            </span>
          )}
          <ChevronDown className="h-3.5 w-3.5 text-foreground-secondary" />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 min-w-[180px] rounded-lg border border-border bg-surface p-1 shadow-lg animate-fade-in"
          align="end"
          sideOffset={6}
        >
          <div className="px-3 py-2 border-b border-border mb-1">
            <p className="text-xs text-foreground-secondary">Connected wallet</p>
            <p className="font-mono text-xs text-foreground mt-0.5">{truncateAddress(address, 6)}</p>
          </div>
          <DropdownMenu.Item
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm cursor-pointer hover:bg-muted text-red-400 outline-none"
            onSelect={disconnect}
          >
            <LogOut className="h-4 w-4" />
            Disconnect
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
