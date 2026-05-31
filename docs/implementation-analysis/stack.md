# Tech Stack — CalendarioMorbido

## Final Stack

```
Railway
├── Next.js (TypeScript)        → Frontend
├── Fastify (TypeScript)        → API Backend
└── PostgreSQL + Drizzle        → Database + Migrations

MapLibre GL JS                  → Map rendering (frontend)
MapTiler                        → Tile hosting (free tier, OSM-based)
```

All services are deployed on **Railway** as a single platform. Services communicate over Railway's internal private network.

---

## Frontend — Next.js (TypeScript)

- Server-side rendering for the public calendar and event pages (SEO + mobile performance)
- Auth-gated sections (personal calendar, proposal form) rendered client-side
- Mobile-first, Italian-language UI
- Deployed on Railway as a service separate from the backend

---

## Backend — Fastify (TypeScript)

An explicit API layer, decoupled from the frontend. Chosen over Next.js API routes for:
- Clear separation of concerns
- Greater control over backend logic
- Independent scalability

### Authentication

Handled by Better Auth running inside the Fastify process. See [Authentication](./authentication.md) for the full decision rationale.

---

## Database — PostgreSQL + Drizzle ORM

### Why Drizzle

- Schema defined in TypeScript — single source of truth
- `drizzle-kit generate` produces SQL migration files from schema diffs
- `drizzle-kit migrate` applies pending migrations
- Migration files are plain SQL — easy to review in PRs
- Lightweight, no hidden magic, compatible with Fastify

### Migration management on deploy

```
git push
  → Railway builds the Fastify service
  → runs: npx drizzle-kit migrate   ← applies pending migrations
  → starts: node server.js
```

The migration command is configured as a pre-start command in the Railway service settings.

> Avoid destructive migrations (DROP COLUMN, RENAME) without a transition period if frontend and backend deploy independently. Not a concern for MVP.

---

## Map — MapLibre GL JS + MapTiler

Mapbox was considered and ruled out due to:
- Proprietary licence (GL JS v2+)
- MAU-based pricing (50k map loads/month on the free tier)

**MapLibre GL JS** is the open-source fork of Mapbox GL JS v1:
- Nearly identical API to Mapbox
- Completely free, no vendor lock-in
- Supports clustering, custom styles, smooth mobile interaction

**MapTiler** provides the tiles (OSM-based imagery and roads):
- Free tier: 100,000 tile requests/month
- Migrating to another provider is straightforward thanks to MapLibre

The map is a first-class feature of the application, not a secondary one.

---

## User Roles & Permissions

| Role | Capabilities |
| --- | --- |
| **Guest** | Browse public calendar, filter events, view event details and map |
| **Registered User** | Save events to personal calendar, propose new events, track proposal status |
| **Administrator** | Direct DB access to approve/reject proposals (MVP) |

Permissions are enforced at the Fastify middleware level using the role encoded in the JWT.

---

## Open Decisions

- Mandatory vs optional fields in the event proposal form
- Login/registration flow (not yet wireframed)
