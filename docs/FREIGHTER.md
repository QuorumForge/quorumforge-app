# Freighter Wallet Integration

This document covers how QuorumForge integrates with the [Freighter](https://www.freighter.app/) browser extension for Stellar wallet connectivity and transaction signing.

---

## Table of Contents

- [What is Freighter?](#what-is-freighter)
- [Installation](#installation)
- [How QuorumForge Uses Freighter](#how-quorumforge-uses-freighter)
- [The `useWallet` Hook](#the-usewallet-hook)
- [Signing a Soroban Transaction](#signing-a-soroban-transaction)
- [Network Detection](#network-detection)
- [Common Gotchas](#common-gotchas)
- [Testing Without Freighter](#testing-without-freighter)

---

## What is Freighter?

Freighter is a browser extension that acts as a non-custodial wallet for Stellar. It stores the user's secret key locally and exposes a JavaScript API (`window.freighter` / `@stellar/freighter-api`) that web applications can call to:

- Check if the extension is installed
- Request permission to read the wallet address
- Read the connected public key (G-address)
- Sign Stellar/Soroban transactions without ever exposing the secret key to the app

---

## Installation

Users must install the Freighter extension from:
- [Chrome Web Store](https://chrome.google.com/webstore/detail/freighter/bcacfldlkkdogcmkkibnjlakofdplcbk)
- [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/freighter/)

The app detects whether Freighter is installed and shows an appropriate prompt if it isn't.

---

## How QuorumForge Uses Freighter

### Connection flow

```
User clicks "Connect Freighter"
  → isConnected()           check extension is present
  → setAllowed()            request permission popup
  → getAddress()            read public key
  → getNetwork()            read active network (testnet/mainnet)
  → store in sessionStorage  restore on page reload
```

### Signing flow

```
User clicks "Sign Proposal" / "Deploy Board"
  → Build Soroban XDR (stellar-sdk)
  → simulateTransaction()   estimate fee, get auth entries
  → signTransaction(xdr, { networkPassphrase })
                            Freighter popup: user reviews + confirms
  → sendTransaction(signed) submit to Soroban RPC
  → poll getTransaction()   wait for confirmation
```

---

## The `useWallet` Hook

`src/lib/wallet.ts` exports a `useWallet()` hook that wraps all Freighter interactions:

```typescript
const {
  address,       // string | null — connected G-address
  network,       // "testnet" | "mainnet" | null
  isConnecting,  // boolean — connection in progress
  error,         // string | null — last error message
  connect,       // () => Promise<void>
  disconnect,    // () => void
  isMember,      // (members: string[]) => boolean
} = useWallet();
```

**Important:** `useWallet` must only be called inside a `"use client"` component. It lazy-imports `@stellar/freighter-api` inside the `connect` callback to prevent SSR crashes.

---

## Signing a Soroban Transaction

Here is the pattern used for any write operation (sign proposal, deploy board, etc.):

```typescript
import * as freighter from "@stellar/freighter-api"; // lazy-imported
import { SorobanRpc, TransactionBuilder, Networks } from "@stellar/stellar-sdk";

const server = new SorobanRpc.Server(process.env.NEXT_PUBLIC_SOROBAN_RPC_TESTNET!);

// 1. Build the transaction
const account = await server.getAccount(signerAddress);
const tx = new TransactionBuilder(account, { fee: "100" })
  .addOperation(/* contract.call("sign_proposal", ...) */)
  .setNetworkPassphrase(Networks.TESTNET)
  .setTimeout(60)
  .build();

// 2. Simulate to get fee + auth
const simResult = await server.simulateTransaction(tx);
if (SorobanRpc.Api.isSimulationError(simResult)) throw new Error(simResult.error);

// 3. Assemble (applies footprint, fee, auth)
const assembled = SorobanRpc.assembleTransaction(tx, simResult).build();

// 4. Sign with Freighter
const { signedTxXdr } = await freighter.signTransaction(
  assembled.toXDR(),
  { networkPassphrase: Networks.TESTNET }
);

// 5. Submit
const sendResult = await server.sendTransaction(
  TransactionBuilder.fromXDR(signedTxXdr, Networks.TESTNET)
);
```

---

## Network Detection

After connecting, QuorumForge reads the network from Freighter's `getNetwork()` and maps the `networkPassphrase` to `"testnet"` or `"mainnet"`. The app will warn if the wallet is on a different network than expected.

```typescript
const { networkPassphrase } = await freighter.getNetwork();
const net = networkPassphrase.includes("Test SDF") ? "testnet" : "mainnet";
```

---

## Common Gotchas

**`window is not defined` on the server**
Freighter reads `window.freighter` on import. Always lazy-import inside `async` functions or `useEffect` in client components. Never import at the top level in a file that might be executed server-side.

**`setAllowed()` must be called before `getAddress()`**
The first time a user connects, `setAllowed()` opens the permission popup. If you skip it, `getAddress()` returns an empty string.

**Transaction simulation must succeed before signing**
If `simulateTransaction` returns an error, do not proceed to sign. Surface the simulation error to the user — it usually indicates a contract revert reason.

**Freighter may return the wrong network**
Users can switch networks in the Freighter UI at any time. Always re-read the network before submitting a transaction and validate it matches your intended target.

**Ledger sequence numbers expire**
If the user takes too long to approve in the Freighter popup, the transaction's sequence number may expire. Rebuild the transaction and re-simulate.

---

## Testing Without Freighter

For CI or environments without the browser extension:

1. **Mock the module** — in tests, mock `@stellar/freighter-api` to return a fixed address.
2. **Stellar Laboratory** — you can manually construct and sign transactions at [laboratory.stellar.org](https://laboratory.stellar.org).
3. **Testnet Friendbot** — fund test accounts at `https://friendbot.stellar.org/?addr=G...`.
