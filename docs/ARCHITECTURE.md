# Architecture

This document describes the system architecture of QuorumForge: how data flows between the browser, the Next.js server, the PostgreSQL database, and the Stellar/Soroban blockchain.

---

## Table of Contents

- [Overview](#overview)
- [High-Level Diagram](#high-level-diagram)
- [Layer Breakdown](#layer-breakdown)
  - [Frontend (Next.js App Router)](#frontend-nextjs-app-router)
  - [Off-chain Backend (API Routes + Prisma)](#off-chain-backend-api-routes--prisma)
  - [On-chain Layer (Soroban Contract)](#on-chain-layer-soroban-contract)
- [Data Flow: Signing a Proposal](#data-flow-signing-a-proposal)
- [Data Flow: Deploying a Board](#data-flow-deploying-a-board)
- [Soroban Contract Interface](#soroban-contract-interface)
- [Database Schema](#database-schema)
- [Key Design Decisions](#key-design-decisions)

---

## Overview

QuorumForge has three distinct layers:

1. **Frontend** — a Next.js 14 App Router application that renders the governance dashboard, connects to Freighter, and reads on-chain state.
2. **Off-chain backend** — lightweight API routes (Next.js Route Handlers) that persist board metadata and proposal notification records in PostgreSQL. *No sensitive business logic lives here; the contract is the source of truth.*
3. **On-chain layer** — a Soroban smart contract that stores members, threshold, proposals, and signatures, and executes proposals trustlessly when the threshold is met.

The database is a convenience layer only. If it were deleted, all governance state could be reconstructed from on-chain data. The database stores:
- Human-readable board names (not stored on-chain to save costs)
- Notification delivery receipts

---

## High-Level Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                              │
│                                                             │
│   ┌──────────────┐   ┌───────────────┐  ┌───────────────┐  │
│   │  Next.js UI  │   │   Freighter   │  │ React Query   │  │
│   │  (RSC + CC)  │◄─►│  Extension    │  │  Cache        │  │
│   └──────┬───────┘   └───────┬───────┘  └───────┬───────┘  │
└──────────┼───────────────────┼──────────────────┼──────────┘
           │ HTTP              │ Sign XDR          │ fetch
           ▼                   │                   ▼
┌──────────────────────┐       │      ┌────────────────────────┐
│  Next.js Server      │       │      │  Soroban RPC Node      │
│  (Vercel Edge)       │       │      │  (testnet / mainnet)   │
│                      │       │      │                        │
│  /api/boards         │       │      │  simulateTransaction   │
│  /api/.../notify     │       │      │  sendTransaction       │
│  /og/*               │       │      │  getContractData       │
└──────────┬───────────┘       │      └────────────┬───────────┘
           │                   │                   │
           ▼                   │                   ▼
┌──────────────────────┐       │      ┌────────────────────────┐
│  PostgreSQL          │       │      │  Soroban Contract      │
│  (Prisma ORM)        │       └─────►│  QuorumForge Multisig  │
│                      │              │                        │
│  Board               │              │  members[]             │
│  ProposalNotification│              │  threshold             │
└──────────────────────┘              │  proposals{}           │
                                      │  signatures{}          │
                                      └────────────────────────┘
```

---

## Layer Breakdown

### Frontend (Next.js App Router)

- **Server Components** render the initial page shell (SEO-friendly, no wallet dependency).
- **Client Components** (marked `"use client"`) handle all wallet interactions, live data fetching via React Query, and animations via Framer Motion.
- **`useWallet` hook** (`src/lib/wallet.ts`) lazily imports `@stellar/freighter-api` to avoid SSR errors. Session is persisted in `sessionStorage`.
- **React Query** caches all on-chain reads. Cache is invalidated after successful transactions.

### Off-chain Backend (API Routes + Prisma)

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/boards` | GET | List all known boards (explore page) |
| `/api/boards` | POST | Save board metadata after deployment |
| `/api/proposals/[id]/notify` | POST | Record notification and fire webhook |

These routes run on Vercel's Node.js runtime (not Edge) to allow Prisma's connection pool. OG image routes run on the Edge runtime.

### On-chain Layer (Soroban Contract)

The Soroban contract is the authoritative source of truth. The frontend reads from it via the Soroban RPC (no indexer required for basic operations). Writes (deploy, create proposal, sign, cancel) are constructed as Soroban XDR, simulated, signed by Freighter, and submitted.

---

## Data Flow: Signing a Proposal

```
1. User clicks "Sign"
   │
2. Frontend calls simulateTransaction(signProposalXDR) → fee estimate
   │
3. Frontend calls freighter.signTransaction(simulatedXDR)
   → Freighter opens popup, user confirms
   │
4. Frontend submits signed XDR to Soroban RPC sendTransaction()
   │
5. Contract checks: caller is a member, proposal is Pending, not already signed
   Contract appends caller to proposal.signers
   If signers.length >= threshold → execute() is called automatically
   │
6. Frontend invalidates React Query cache for this board/proposal
   UI re-renders with updated signature count
```

---

## Data Flow: Deploying a Board

```
1. User fills BoardDeployForm (name, members[], threshold)
   │
2. Frontend constructs initialize() Soroban invocation XDR
   │
3. Simulate → get fee
4. freighter.signTransaction() → user confirms
5. sendTransaction() → get contractId from result
   │
6. POST /api/boards { name, contractId, network, deployerAddress }
   Saved to PostgreSQL for display purposes
   │
7. router.push(`/board/${contractId}`)
```

---

## Soroban Contract Interface

> The contract source lives in a separate repository. The interface expected by this frontend is:

```rust
// Initialize a new board
fn initialize(
    env: Env,
    members: Vec<Address>,
    threshold: u32,
) -> Address; // returns contract ID

// Create a proposal
fn create_proposal(
    env: Env,
    proposer: Address,
    proposal_type: ProposalType,
    description: String,
    payload: Map<Symbol, Val>,
    ttl_ledgers: u32,
) -> u64; // returns proposal ID

// Sign/approve a proposal
fn sign_proposal(
    env: Env,
    signer: Address,
    proposal_id: u64,
);

// Cancel a proposal (proposer or admin only)
fn cancel_proposal(
    env: Env,
    caller: Address,
    proposal_id: u64,
);

// Read methods (no auth required)
fn get_proposal(env: Env, proposal_id: u64) -> Proposal;
fn get_members(env: Env) -> Vec<Address>;
fn get_threshold(env: Env) -> u32;
```

`ProposalType` is an enum: `ResolveIssue | TransferFunds | AddMember | RemoveMember | UpdateThreshold`.

---

## Database Schema

```prisma
model Board {
  id              String   @id @default(cuid())
  contractId      String   @unique          // on-chain contract address
  network         String                    // "testnet" | "mainnet"
  name            String                    // human-readable, off-chain only
  deployerAddress String                    // G-address of deployer
  createdAt       DateTime @default(now())

  notifications ProposalNotification[]
}

model ProposalNotification {
  id               String   @id @default(cuid())
  boardId          String
  proposalId       String                   // on-chain proposal ID
  sentAt           DateTime @default(now())
  recipientAddress String                   // G-address of recipient
  channel          String                   // "webhook" | "email"

  board Board @relation(fields: [boardId], references: [id])
}
```

---

## Key Design Decisions

**Why PostgreSQL for board metadata?**
On-chain string storage on Soroban is expensive. Board names and notification delivery records are off-chain conveniences. The contract is always the source of governance truth.

**Why lazy-import Freighter?**
`@stellar/freighter-api` reads `window.freighter` on import. In SSR (Next.js server), `window` doesn't exist, causing a hard crash. Lazy-importing inside async functions avoids this entirely.

**Why React Query instead of server-side fetching for on-chain data?**
On-chain state changes with each ledger (~5s). React Query's background refetching keeps the UI fresh without full page reloads. The `staleTime: 30_000` default prevents unnecessary RPC calls.

**Why not an indexer?**
For the initial version, direct Soroban RPC reads are sufficient and require no infrastructure. An indexer (e.g. Subquery, Goldsky) can be added later for historical analytics without changing the contract.

**Why Edge runtime for OG images?**
`ImageResponse` from `next/og` is only available on the Edge runtime and executes at the CDN edge for low latency.
