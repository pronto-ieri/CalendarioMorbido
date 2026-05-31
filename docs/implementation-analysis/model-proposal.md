# Data Model — Proposal

## Preliminary Decisions

| Topic | Decision |
| --- | --- |
| Proposals vs Events | Separate tables — the public `events` table contains approved events only |
| Coordinates | Map picker (explicit lat/lng); `locationName` field is compatible with future server-side geocoding without migrations |
| Blob storage | Opaque key (`coverImageKey`) resolved to a URL by the `StorageService` — provider is swappable |

---

## Better Auth Tables (auto-generated)

Better Auth with Drizzle generates and manages autonomously:

- `user` — id, email, name, emailVerified, createdAt — extended with the `role` field
- `session`, `account`, `verification`

The `role: 'user' | 'admin'` field is added as an extension on the `user` table via Better Auth's plugin system.

---

## Drizzle Schema

### Enums

```ts
const regionEnum = pgEnum('region', [
  'Valle d\'Aosta', 'Piemonte', 'Lombardia', 'Trentino-Alto Adige',
  'Veneto', 'Friuli-Venezia Giulia', 'Liguria', 'Emilia-Romagna',
  'Toscana', 'Umbria', 'Marche', 'Lazio', 'Abruzzo', 'Molise',
  'Campania', 'Puglia', 'Basilicata', 'Calabria', 'Sicilia', 'Sardegna',
])

const proposalStatusEnum = pgEnum('proposal_status', [
  'pending', 'approved', 'rejected',
])
```

### events

Approved and published events only.

```ts
const events = pgTable('events', {
  id:                uuid().primaryKey().defaultRandom(),
  proposalId:        uuid().references(() => proposals.id).unique(),

  title:             text().notNull(),
  description:       text(),
  startDate:         date().notNull(),
  endDate:           date().notNull(),
  region:            regionEnum().notNull(),
  officialUrl:       text(),
  coverImageKey:     text(),            // e.g. "covers/abc123.jpg"

  startLocationName: text().notNull(),  // display label + future geocoding input
  startLat:          numeric({ precision: 9, scale: 6 }).notNull(),
  startLng:          numeric({ precision: 9, scale: 6 }).notNull(),

  endLocationName:   text(),            // null = circular route
  endLat:            numeric({ precision: 9, scale: 6 }),
  endLng:            numeric({ precision: 9, scale: 6 }),

  createdAt:         timestamp().defaultNow().notNull(),
  updatedAt:         timestamp().defaultNow().notNull(),
})
```

### proposals

User submissions with lifecycle: pending → approved | rejected.

```ts
const proposals = pgTable('proposals', {
  id:                uuid().primaryKey().defaultRandom(),
  userId:            text().notNull().references(() => user.id),
  status:            proposalStatusEnum().default('pending').notNull(),
  rejectionReason:   text(),

  title:             text().notNull(),
  description:       text(),
  startDate:         date().notNull(),
  endDate:           date().notNull(),
  region:            regionEnum().notNull(),
  officialUrl:       text(),
  coverImageKey:     text(),

  startLocationName: text().notNull(),
  startLat:          numeric({ precision: 9, scale: 6 }).notNull(),
  startLng:          numeric({ precision: 9, scale: 6 }).notNull(),

  endLocationName:   text(),
  endLat:            numeric({ precision: 9, scale: 6 }),
  endLng:            numeric({ precision: 9, scale: 6 }),

  submittedAt:       timestamp().defaultNow().notNull(),
  reviewedAt:        timestamp(),
})
```

### saved_events

Personal calendar for registered users.

```ts
const savedEvents = pgTable('saved_events', {
  userId:  text().notNull().references(() => user.id),
  eventId: uuid().notNull().references(() => events.id),
  savedAt: timestamp().defaultNow().notNull(),
}, (t) => [primaryKey({ columns: [t.userId, t.eventId] })])
```

---

## Design Notes

**`startLocationName` / `endLocationName`** — in the map picker the user types a text label and selects coordinates on the map. With future server-side geocoding, the same field receives the typed address and the backend computes the coordinates. No migration required.

**`coverImageKey`** — opaque string (e.g. `"covers/abc123.jpg"`). The `StorageService` in the backend resolves it to a presigned URL. The frontend never knows the underlying provider.

**`proposalId` on `events`** — optional FK back to the originating proposal for audit purposes. Set by the admin at approval time.

**`endLocationName/Lat/Lng` nullable** — supports circular routes where start and end locations coincide.
