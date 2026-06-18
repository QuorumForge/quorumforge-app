# API Reference

QuorumForge exposes a small set of HTTP API routes for persisting off-chain board metadata and sending proposal notifications. All routes return JSON.

---

## Base URL

| Environment | Base URL |
|-------------|----------|
| Local | `http://localhost:3000` |
| Production | `https://quorumforge.app` (or your custom domain) |

---

## Authentication

The API routes are currently unauthenticated. They are intended to be called from the QuorumForge frontend only. For production deployments with a public API, consider adding an API key or rate limiting.

---

## Endpoints

### `GET /api/boards`

Returns all boards saved in the database.

**Response `200 OK`**

```json
[
  {
    "id": "clxyz123",
    "contractId": "CABC1234567890",
    "network": "testnet",
    "name": "My Project Maintainers",
    "deployerAddress": "GABC...",
    "createdAt": "2026-06-18T12:00:00.000Z"
  }
]
```

---

### `POST /api/boards`

Saves board metadata after a successful on-chain deployment.

**Request body**

```json
{
  "name": "My Project Maintainers",
  "contractId": "CABC1234567890",
  "network": "testnet",
  "deployerAddress": "GABC1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | string | ✅ | Min 3 characters |
| `contractId` | string | ✅ | Soroban contract address |
| `network` | `"testnet"` \| `"mainnet"` | ✅ | |
| `deployerAddress` | string | ✅ | Valid Stellar G-address |

**Response `201 Created`**

```json
{
  "id": "clxyz123",
  "contractId": "CABC1234567890",
  "network": "testnet",
  "name": "My Project Maintainers",
  "deployerAddress": "GABC...",
  "createdAt": "2026-06-18T12:00:00.000Z"
}
```

**Response `400 Bad Request`** — validation error

```json
{
  "error": {
    "fieldErrors": { "deployerAddress": ["Invalid Stellar address"] },
    "formErrors": []
  }
}
```

**Response `409 Conflict`** — duplicate contractId

```json
{
  "error": "Board with this contractId already exists"
}
```

---

### `POST /api/proposals/[proposalId]/notify`

Records a notification delivery and fires the configured webhook (if `NOTIFICATION_WEBHOOK_URL` is set).

**URL parameter**

| Parameter | Description |
|-----------|-------------|
| `proposalId` | The on-chain proposal ID (string) |

**Request body**

```json
{
  "boardId": "clxyz123",
  "recipientAddresses": [
    "GABC1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890",
    "GXYZ0987654321ABCDEF0987654321ABCDEF0987654321ABCDEF0987654321"
  ],
  "event": "created"
}
```

| Field | Type | Required | Values |
|-------|------|----------|--------|
| `boardId` | string | ✅ | Database board ID |
| `recipientAddresses` | string[] | ✅ | Valid G-addresses, min 1 |
| `event` | string | ✅ | `"created"` \| `"expiring_soon"` \| `"executed"` |

**Response `200 OK`**

```json
{
  "notified": 2,
  "webhook": { "sent": true }
}
```

If `NOTIFICATION_WEBHOOK_URL` is not set:

```json
{
  "notified": 2,
  "webhook": { "skipped": true }
}
```

**Response `400 Bad Request`** — validation error

```json
{
  "error": {
    "fieldErrors": { "event": ["Invalid enum value"] },
    "formErrors": []
  }
}
```

---

## OG Image Routes

These routes return PNG images (not JSON) rendered on the Edge runtime.

### `GET /og/default`

Static QuorumForge brand card (1200×630).

### `GET /og/board`

Dynamic board share card.

**Query parameters**

| Parameter | Description | Example |
|-----------|-------------|---------|
| `name` | Board name | `My+Maintainers` |
| `threshold` | Required signatures | `2` |
| `members` | Total members | `5` |
| `network` | Network | `testnet` |
| `executed` | Executed proposal count | `12` |

**Example URL:**

```
/og/board?name=My+Maintainers&threshold=2&members=5&network=testnet&executed=12
```

Use this URL as the `og:image` meta tag when sharing board links.
