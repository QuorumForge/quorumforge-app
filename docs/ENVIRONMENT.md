# Environment Variables

This document describes every environment variable used by QuorumForge, with descriptions, valid values, and examples.

---

## Quick Start

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values. Variables prefixed `NEXT_PUBLIC_` are embedded into the browser bundle at build time; keep secrets in server-only variables.

---

## Variables

### `DATABASE_URL`

| | |
|-|-|
| **Required** | ✅ Yes |
| **Runtime** | Server only |
| **Example** | `postgresql://user:pass@localhost:5432/quorumforge` |

PostgreSQL connection string used by Prisma. Supports all PostgreSQL-compatible connection string formats.

**Supabase example:**
```
postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxx.supabase.co:5432/postgres
```

**Local Docker example:**
```
postgresql://postgres:postgres@localhost:5432/quorumforge
```

---

### `NEXT_PUBLIC_APP_URL`

| | |
|-|-|
| **Required** | ✅ Yes |
| **Runtime** | Browser + Server |
| **Example** | `https://quorumforge.app` |

The fully-qualified URL of the deployed application. Used for:
- `metadataBase` in Next.js `<head>` (OG image absolute URLs)
- Webhook payloads (deep links back to proposals)

For local development, use `http://localhost:3000`.

---

### `NEXT_PUBLIC_SOROBAN_RPC_TESTNET`

| | |
|-|-|
| **Required** | ✅ Yes |
| **Runtime** | Browser |
| **Default** | `https://soroban-testnet.stellar.org` |

Soroban RPC endpoint for the Stellar testnet. Used to read contract state, simulate transactions, and submit signed XDR.

The default Stellar Foundation endpoint is suitable for development and low-traffic production use. For high-volume applications, consider a dedicated RPC provider.

---

### `NEXT_PUBLIC_SOROBAN_RPC_MAINNET`

| | |
|-|-|
| **Required** | ✅ Yes (for mainnet boards) |
| **Runtime** | Browser |
| **Default** | `https://soroban-mainnet.stellar.org` |

Soroban RPC endpoint for the Stellar mainnet.

---

### `NOTIFICATION_WEBHOOK_URL`

| | |
|-|-|
| **Required** | ❌ Optional |
| **Runtime** | Server only |
| **Example** | `https://hooks.slack.com/services/T.../B.../xxx` |

When set, QuorumForge will `POST` a JSON payload to this URL whenever:
- A new proposal is created
- A proposal is nearing expiry (within 24 hours)
- A proposal is executed

**Payload format:**
```json
{
  "proposalId": "42",
  "boardId": "cuid...",
  "event": "created",
  "recipients": ["GABC...", "GXYZ..."],
  "timestamp": "2026-06-18T12:00:00.000Z",
  "appUrl": "https://quorumforge.app"
}
```

Compatible with Slack Incoming Webhooks, Discord webhooks, n8n, and any HTTP endpoint that accepts JSON POST.

---

## Setting Variables in Vercel

In the [Vercel dashboard](https://vercel.com/dashboard), navigate to your project → **Settings** → **Environment Variables**.

Add each variable and select the appropriate environments (Production, Preview, Development).

> **Note:** `NEXT_PUBLIC_*` variables must be set before the build runs. Changing them requires a new deployment.

---

## Local `.env.local` Example

```env
# Required
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/quorumforge
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SOROBAN_RPC_TESTNET=https://soroban-testnet.stellar.org
NEXT_PUBLIC_SOROBAN_RPC_MAINNET=https://soroban-mainnet.stellar.org

# Optional
NOTIFICATION_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```
