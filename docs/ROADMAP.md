# Roadmap

This document tracks planned features, improvements, and long-term goals for QuorumForge. Items are roughly ordered by priority.

---

## Near-term (v0.2)

- [x] **Real Soroban contract integration** — live `get_board` / proposals / sign / create via Freighter + generated bindings against testnet contract `CANU3HVHBFRT2CSZ73ZVDYKYNZMRP6J65KGO4QOTVA45AKORFA46UQ3V`
- [ ] **Email notifications** — send proposal alerts via SMTP (Resend / SendGrid) in addition to webhooks
- [ ] **Proposal search and filtering** — filter proposals by type, date range, proposer
- [ ] **Copy-to-clipboard with toast** — feedback when copying contract addresses
- [ ] **Mobile-responsive signing flow** — optimized layout for small screens
- [ ] **Browser wasm deploy** — deploy a fresh board instance from the UI (demo currently uses the shared testnet board)

## Medium-term (v0.3)

- [ ] **Mainnet support** — switch boards from testnet to mainnet with a single flag
- [ ] **Board explorer page** — public listing of all known boards with search
- [ ] **Signer activity heatmap** — visual calendar of member signing activity (GitHub-style)
- [ ] **Proposal comments** — off-chain threaded discussion attached to proposals
- [ ] **Deep-link share cards** — OG images automatically included when sharing proposal URLs
- [ ] **CSV export** — download full proposal/signature history as CSV for audit purposes

## Long-term (v1.0)

- [ ] **Multi-asset treasury** — govern XLM, any Stellar asset, and arbitrary Soroban contract calls, not just USDC transfers
- [ ] **Sub-boards** — nested governance structures (e.g. a parent DAO with per-project sub-boards)
- [ ] **Delegated voting** — allow members to temporarily delegate their signing power
- [ ] **DAO governance for QuorumForge itself** — the protocol contract governed by a public QuorumForge board
- [ ] **SDK / embed widget** — `<QuorumForgeBoard contractId="..." />` React component that any project can embed
- [ ] **Hardware wallet support** — Ledger signing via Stellar Laboratory integration

## Completed

- [x] Next.js 14 App Router scaffold
- [x] Freighter wallet connect / disconnect
- [x] Board overview page (proposals, members, threshold)
- [x] Proposal detail page (payload, signatures, timeline)
- [x] Deploy board form (member addresses, threshold, preview)
- [x] Personal dashboard (boards + pending signatures)
- [x] API: board metadata CRUD
- [x] API: proposal notification + webhook
- [x] OG image generation (static brand + dynamic board card)
- [x] Full documentation (README, ARCHITECTURE, API, FREIGHTER, ENVIRONMENT, CONTRIBUTING, SECURITY)

---

Want to work on something from this list? Check [CONTRIBUTING.md](../CONTRIBUTING.md) and open an issue to claim a task.
