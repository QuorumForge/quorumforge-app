# Changelog

All notable changes to `quorumforge-app` are documented here.
Follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

### Added
- `formatUSDC(raw)`, `formatXLM(raw)`, `formatAmount(raw, decimals, symbol)` — on-chain amount formatting utilities in `src/lib/utils.ts`.
- `validateThreshold(threshold, memberCount)` — returns an error string or `null`, used for client-side governance validation.
- `hasDuplicateMembers(members)` — detects duplicate addresses in a member list.
- `useLocalStorage<T>(key, initialValue)` — SSR-safe localStorage hook in `src/lib/useLocalStorage.ts`.
- `EmptyState` component (`src/components/ui/EmptyState.tsx`) — consistent empty-list placeholder with optional icon, description, and action slot.
- `CopyButton` component (`src/components/ui/CopyButton.tsx`) — clipboard copy with animated checkmark feedback.
- `useProposalStats(boardContractId)` hook — fetches proposals and computes per-status counts and execution rate.
- `LiveStats.proposalsCreated` and `LiveStats.proposalsPending` fields.
- `Board.treasuryBalance` optional field.
- Dashboard now uses `EmptyState` for empty proposal and board lists.
- `BoardDeployForm` now warns and blocks submission when duplicate member addresses are detected.

---

## [0.1.0] — 2025-06-01

### Added
- Initial release: Next.js 14 governance dashboard.
- Landing page with animated signature progress demo and live stats.
- `BoardDeployForm` — guided N-of-M board deployment with live threshold preview.
- `ProposalCard` — status-aware proposal card with one-click signing.
- `SignatureProgressBar` — animated progress bar with signer avatars.
- `MemberList` — board membership table with per-member participation rate.
- `CreateProposalModal` — full-featured proposal creation dialog with type-specific payload fields.
- `ProposalTimeline` — timeline of proposal lifecycle events.
- `WalletConnectButton` — Freighter wallet connection.
- Dashboard page with pending-signature queue and board overview.
- Deploy page.
- OG image generation for boards (`/api/og/board`).
- Prisma schema for board/proposal indexing.
