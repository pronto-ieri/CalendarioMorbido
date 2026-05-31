# API Surface

Protocol: **REST**. Base path: `/api`.

## Conventions

### Pagination

All paginated lists return a standard envelope:

```json
{
  "data": [...],
  "total": 120,
  "page": 1,
  "limit": 20
}
```

### Authentication

Protected endpoints require the session JWT issued by Better Auth in the header:

```
Authorization: Bearer <token>
```

### Errors

```json
{
  "error": "PROPOSAL_NOT_FOUND",
  "message": "The requested proposal does not exist."
}
```

---

## Events (public)

| Method | Path | Auth |
| --- | --- | --- |
| `GET` | `/api/events` | No |
| `GET` | `/api/events/map` | No |
| `GET` | `/api/events/:id` | No |

### `GET /api/events`

Query params:

| Param | Type | Default |
| --- | --- | --- |
| `region` | `RegionEnum` | — |
| `type` | `"single" \| "multi"` | — |
| `page` | `number` | `1` |
| `limit` | `number` | `20` |

### `GET /api/events/map`

Lightweight payload for map markers, no pagination.

```json
[
  {
    "id": "...",
    "title": "...",
    "startDate": "2026-06-01",
    "endDate": "2026-06-03",
    "startLat": 46.07,
    "startLng": 11.12,
    "endLat": 45.90,
    "endLng": 10.89
  }
]
```

---

## Auth (managed by Better Auth)

```
POST  /api/auth/sign-up
POST  /api/auth/sign-in
POST  /api/auth/sign-out
POST  /api/auth/reset-password
POST  /api/auth/verify-email
```

---

## Personal Calendar (authenticated user)

| Method | Path | Auth |
| --- | --- | --- |
| `GET` | `/api/me/saved-events` | Yes |
| `PUT` | `/api/me/saved-events/:eventId` | Yes |
| `DELETE` | `/api/me/saved-events/:eventId` | Yes |

---

## Proposals (authenticated user)

| Method | Path | Auth |
| --- | --- | --- |
| `GET` | `/api/me/proposals` | Yes |
| `GET` | `/api/me/proposals/:id` | Yes |
| `POST` | `/api/proposals` | Yes |

### `POST /api/proposals`

```json
{
  "title": "Granfondo Dolomiti",
  "description": "...",
  "startDate": "2026-06-01",
  "endDate": "2026-06-03",
  "region": "Trentino-Alto Adige",
  "officialUrl": "https://...",
  "coverImageKey": "covers/abc123.jpg",
  "startLocationName": "Trento, TN",
  "startLat": 46.07,
  "startLng": 11.12,
  "endLocationName": "Riva del Garda, TN",
  "endLat": 45.88,
  "endLng": 10.84
}
```

`endLocationName`, `endLat`, `endLng` are optional — omitted for circular routes.

---

## Admin

| Method | Path | Auth |
| --- | --- | --- |
| `GET` | `/api/admin/proposals` | Admin |
| `GET` | `/api/admin/proposals/:id` | Admin |
| `PATCH` | `/api/admin/proposals/:id` | Admin |

### `GET /api/admin/proposals`

Query params:

| Param | Type | Default |
| --- | --- | --- |
| `status` | `"pending" \| "approved" \| "rejected"` | `"pending"` |
| `page` | `number` | `1` |
| `limit` | `number` | `20` |

### `PATCH /api/admin/proposals/:id`

```json
{ "action": "approve" }
```

```json
{ "action": "reject", "rejectionReason": "Event already present in the calendar." }
```

When `action: "approve"`, the backend executes atomically in a single transaction:
1. Copies fields from the proposal and creates the record in `events`
2. Sets `proposals.status = "approved"`, `proposals.reviewedAt = now()`, `proposals.eventId = <new id>`

---

## Storage

| Method | Path | Auth |
| --- | --- | --- |
| `POST` | `/api/uploads/presign` | Yes |

### `POST /api/uploads/presign`

The backend generates a presigned URL via the `StorageService`. The frontend uploads directly to the provider and then includes the `key` in the proposal body.

**Response:**
```json
{
  "key": "covers/abc123.jpg",
  "uploadUrl": "https://..."
}
```
