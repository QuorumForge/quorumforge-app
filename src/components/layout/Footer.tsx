import Link from "next/link";
import { ExternalLink } from "lucide-react";

export function Footer() {
  const contractId = "CANU3HVHBFRT2CSZ73ZVDYKYNZMRP6J65KGO4QOTVA45AKORFA46UQ3V";

  return (
    <footer className="border-t border-border/80 mt-auto">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="font-semibold gradient-text">QuorumForge</p>
            <p className="text-xs text-foreground-secondary mt-1 max-w-sm">
              Trustless N-of-M governance for Stellar open-source maintainers. Built on Soroban.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-xs text-foreground-secondary">
            <Link
              href={`/board/${contractId}`}
              className="hover:text-primary transition-colors"
            >
              Live demo board
            </Link>
            <a
              href={`https://stellar.expert/explorer/testnet/contract/${contractId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-stellar transition-colors"
            >
              Contract on-chain <ExternalLink className="h-3 w-3" />
            </a>
            <a
              href="https://soroban.stellar.org"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Soroban docs
            </a>
            <a
              href="https://github.com/QuorumForge"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
        <p className="text-[11px] text-foreground-secondary/70 mt-6">
          Testnet deployment for evaluation — not financial advice.
        </p>
      </div>
    </footer>
  );
}
