# Deployment Guide — QuorumForge App

This guide covers deploying `quorumforge-app` to production on Vercel with a managed PostgreSQL database.

---

## Prerequisites

- Node.js 20+
- A [Vercel](https://vercel.com) account
- A PostgreSQL database (Vercel Postgres, Neon, Supabase, or any provider)
- The QuorumForge contract deployed on Stellar Mainnet (see `quorumforge-contract-` README)

---

## 1. Environment Variables

Copy `.env.example` to `.env.local` for local development, then set the following in your Vercel project settings for production:

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `NEXT_PUBLIC_SOROBAN_RPC_TESTNET` | ✅ | Soroban RPC endpoint for testnet |
| `NEXT_PUBLIC_SOROBAN_RPC_MAINNET` | ✅ | Soroban RPC endpoint for mainnet |
| `NEXT_PUBLIC_APP_URL` | ✅ | Public URL of the deployed app (e.g. `https://quorumforge.app`) |
| `NOTIFICATION_WEBHOOK_URL` | ☑️ | Optional webhook for proposal event notifications |

> **Tip:** Use a connection pooler (e.g. PgBouncer or Neon's pooled connection) for `DATABASE_URL` in serverless environments to avoid connection exhaustion.

---

## 2. Database Setup

Run the Prisma migration to create the schema:

```bash
npx prisma migrate deploy
```

For a fresh database, seed it first (if a seed script exists):

```bash
npx prisma db seed
```

To inspect the schema:

```bash
npx prisma studio
```

---

## 3. Local Development

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## 4. Deploy to Vercel

### Via CLI

```bash
npm install -g vercel
vercel --prod
```

### Via GitHub

1. Push the repo to GitHub.
2. Import the project into Vercel.
3. Add all environment variables under **Settings → Environment Variables**.
4. Vercel will build and deploy automatically on every push to `main`.

The `vercel.json` in the repo root configures edge rewrites for the Soroban RPC proxy.

---

## 5. Build

```bash
npm run build
```

The production build runs `next build`. TypeScript and ESLint errors will fail the build — fix them before deploying.

---

## 6. Monitoring

- **Vercel Analytics** — enable in the Vercel dashboard for Core Web Vitals.
- **Vercel Logs** — real-time serverless function logs under the **Deployments** tab.
- **Database** — monitor connection counts and query latency in your Postgres provider's dashboard.

---

## 7. Custom Domain

In Vercel → **Settings → Domains**, add your domain and update your DNS to point to Vercel's nameservers or add the CNAME/A records provided.

---

## 8. Updating the Contract Address

If you redeploy the Soroban contract, update the contract ID in your environment variables and redeploy the app. No code changes are needed unless the contract ABI changed.
