# QuorumForge

> Trustless N-of-M maintainer boards on Stellar Soroban

[![License: MIT](https://img.shields.io/badge/License-MIT-violet.svg)](./LICENSE)
[![Built with Next.js 14](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)
[![Stellar Network](https://img.shields.io/badge/Network-Stellar-blue)](https://stellar.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)

QuorumForge replaces the single G-address bottleneck that plagues open-source Stellar projects with a transparent, auditable, N-of-M multi-signature governance board. Any maintainer can propose an action; the contract executes automatically once the required number of co-signers approve — no trusted intermediary, no ceremony.

---

## Table of Contents

- [Why QuorumForge](#why-quorumforge)
- [Features](#features)
- [Screenshots](#screenshots)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Database Setup](#database-setup)
  - [Running Locally](#running-locally)
- [Freighter Wallet Integration](#freighter-wallet-integration)
- [Deployment](#deployment)
  - [Vercel](#vercel)
  - [Self-hosted](#self-hosted)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [Security](#security)
- [Roadmap](#roadmap)
- [License](#license)

---

## Why QuorumForge

Most Stellar projects — grant recipients, open-source tools, DeFi protocols — manage their treasury and access controls via a single keypair. One leaked key, one phished maintainer, one accidental transaction and the project is drained.

QuorumForge makes the honest alternative easy:

| Before | After |
|--------|-------|
| Single G-address | N-of-M multisig board |
| Implicit trust in one person | Explicit on-chain threshold |
| No audit trail | Full public history |
| Manual coordination | Automatic execution |

---

## Features

- **Deploy a board** — initialize a Soroban multisig contract with any set of member addresses and an N-of-M threshold
- **Proposal lifecycle** — create, sign, auto-execute, or cancel proposals; five types supported out of the box
- **Public audit trail** — every proposal, signature, and execution is readable by anyone without a wallet
- **Freighter integration** — one-click connect, sign proposals without leaving the dashboard
- **Quick-sign dashboard** — see all boards you belong to and sign pending proposals from a single view
- **Real-time progress** — animated signature progress bars, signer avatars, time-remaining countdown
- **Notification webhooks** — notify unsigned members when a proposal is created or near expiry
- **OG image generation** — shareable board cards with live stats for social media

---

## Architecture

See [ARCHITECTURE.md](./docs/ARCHITECTURE.md) for the full system design, data flow diagrams, and Soroban contract interface specification.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS + shadcn/ui primitives |
| Animations | Framer Motion |
| Data fetching | TanStack React Query v5 |
| Forms | React Hook Form + Zod |
| Wallet | @stellar/freighter-api |
| Stellar SDK | @stellar/stellar-sdk |
| ORM | Prisma |
| Database | PostgreSQL |
| Deployment | Vercel (edge-compatible) |

---

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- pnpm / npm / yarn
- PostgreSQL 14+ (local or hosted — [Supabase](https://supabase.com) free tier works)
- [Freighter wallet extension](https://www.freighter.app/) for local wallet testing

### Installation

```bash
git clone https://github.com/your-org/quorumforge-app.git
cd quorumforge-app
npm install
```

### Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `NEXT_PUBLIC_APP_URL` | ✅ | Full app URL (e.g. `https://quorumforge.app`) |
| `NEXT_PUBLIC_SOROBAN_RPC_TESTNET` | ✅ | Soroban RPC for testnet (default provided) |
| `NEXT_PUBLIC_SOROBAN_RPC_MAINNET` | ✅ | Soroban RPC for mainnet |
| `NOTIFICATION_WEBHOOK_URL` | ❌ | Webhook to call when proposals are created or expiring |

See [ENVIRONMENT.md](./docs/ENVIRONMENT.md) for detailed descriptions and example values.

### Database Setup

```bash
# Push the schema to your database
npm run db:push

# (Optional) Open Prisma Studio
npm run db:studio
```

### Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Freighter Wallet Integration

QuorumForge uses the official [`@stellar/freighter-api`](https://docs.freighter.app) to:

1. Detect whether the extension is installed (`isConnected()`)
2. Request permission to read the wallet address (`setAllowed()`)
3. Read the connected address and active network (`getAddress()`, `getNetwork()`)
4. Sign Soroban XDR transactions (`signTransaction()`)

> **Important:** Freighter is a browser extension and is not available in SSR context. All wallet operations are lazy-imported inside client components and protected with `"use client"` directives.

See [docs/FREIGHTER.md](./docs/FREIGHTER.md) for step-by-step integration notes and gotchas.

---

## Deployment

### Vercel

The easiest deployment path. QuorumForge is fully compatible with Vercel's Edge Network.

```bash
npm i -g vercel
vercel
```

Or connect the GitHub repository in the [Vercel dashboard](https://vercel.com/new) and set the environment variables in the project settings.

The included `vercel.json` sets the correct build command and configures caching headers.

### Self-hosted

```bash
npm run build
npm start
```

Make sure `DATABASE_URL` points to a reachable PostgreSQL instance and all `NEXT_PUBLIC_*` variables are set at build time.

---

## Project Structure

```
quorumforge-app/
├── prisma/
│   └── schema.prisma          # Database schema (Board, ProposalNotification)
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout + providers
│   │   ├── page.tsx            # Landing page
│   │   ├── dashboard/          # Personal dashboard
│   │   ├── deploy/             # Board deployment form
│   │   ├── board/
│   │   │   └── [contractId]/
│   │   │       ├── page.tsx    # Board overview
│   │   │       └── proposal/
│   │   │           └── [proposalId]/page.tsx
│   │   ├── api/
│   │   │   ├── boards/         # Board metadata CRUD
│   │   │   └── proposals/[proposalId]/notify/
│   │   └── og/
│   │       ├── default/        # Static brand OG image
│   │       └── board/          # Dynamic board OG image
│   ├── components/
│   │   ├── ui/                 # Primitive UI components
│   │   ├── layout/             # Navbar
│   │   ├── providers/          # QueryProvider
│   │   ├── WalletConnectButton.tsx
│   │   ├── SignatureProgressBar.tsx
│   │   ├── ProposalCard.tsx
│   │   ├── MemberList.tsx
│   │   ├── CreateProposalModal.tsx
│   │   ├── BoardDeployForm.tsx
│   │   └── ProposalTimeline.tsx
│   ├── lib/
│   │   ├── prisma.ts           # Prisma client singleton
│   │   ├── utils.ts            # Helpers (address formatting, Stellar Expert URLs)
│   │   └── wallet.ts           # useWallet hook (Freighter)
│   └── types/
│       └── index.ts            # Shared TypeScript types
└── docs/
    ├── ARCHITECTURE.md
    ├── FREIGHTER.md
    ├── ENVIRONMENT.md
    └── API.md
```

---

## Contributing

We welcome contributions of all sizes! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a pull request.

Quick start for contributors:

```bash
git checkout -b feat/your-feature
# make changes
npm run lint
git commit -m "feat: describe your change"
gh pr create
```

---

## Security

Please do **not** open a public GitHub issue for security vulnerabilities. Instead, email `security@quorumforge.app` or use GitHub's private vulnerability reporting.

See [SECURITY.md](./SECURITY.md) for the full disclosure policy.

---

## Roadmap

See [docs/ROADMAP.md](./docs/ROADMAP.md) for planned features, including:

- Email notification channel (in addition to webhooks)
- Mainnet contract deployment
- Mobile-optimized signing flow
- Multi-asset treasury support (beyond USDC)
- DAO governance for the QuorumForge protocol itself

---

## License

[MIT](./LICENSE) — © 2026 QuorumForge contributors
