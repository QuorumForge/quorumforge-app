import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Toaster } from "@/components/ui/toaster";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://quorumforge.app";

export const metadata: Metadata = {
  title: {
    default: "QuorumForge — Trustless Maintainer Boards on Stellar",
    template: "%s | QuorumForge",
  },
  description:
    "Replace your single G-address with a trustless N-of-M maintainer board. Deploy multi-sig governance for any Stellar project in minutes.",
  metadataBase: new URL(APP_URL),
  openGraph: {
    type: "website",
    siteName: "QuorumForge",
    title: "QuorumForge — Trustless Maintainer Boards on Stellar",
    description:
      "N-of-M multi-sig governance for Stellar projects. Transparent, auditable, trustless.",
    images: [{ url: "/og/default", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "QuorumForge",
    description: "Trustless maintainer boards on Stellar",
    images: ["/og/default"],
  },
  icons: {
    icon: "/favicon.ico",
  },
  keywords: ["stellar", "multisig", "governance", "quorumforge", "soroban", "web3"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground">
        <QueryProvider>
          <Navbar />
          <main>{children}</main>
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
