"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletConnectButton } from "@/components/WalletConnectButton";
import { LiveChainIndicator } from "@/components/LiveChainIndicator";
import { cn } from "@/lib/utils";
import { Layers } from "lucide-react";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/deploy", label: "Boards" },
];

export function Navbar() {
  const pathname = usePathname();
  const isBoard = pathname.startsWith("/board/");

  return (
    <nav className="sticky top-0 z-50 border-b border-border/80 glass-panel">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6 sm:gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 border border-primary/30 text-primary group-hover:bg-primary/30 transition-colors">
              <Layers className="h-4 w-4" />
            </div>
            <span className="text-base font-bold tracking-tight gradient-text hidden sm:inline">
              QuorumForge
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  pathname === href || pathname.startsWith(href + "/")
                    ? "bg-primary/10 text-primary"
                    : "text-foreground-secondary hover:text-foreground hover:bg-muted/50"
                )}
              >
                {label}
              </Link>
            ))}
          </div>
          {isBoard && (
            <div className="hidden lg:block">
              <LiveChainIndicator compact />
            </div>
          )}
        </div>
        <WalletConnectButton />
      </div>
    </nav>
  );
}
