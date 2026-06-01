# CalendarioMorbido — MVP Temporaneo (Next.js + Supabase)

## Context

CalendarioMorbido è una web app per il tracciamento di eventi cicloturistici non competitivi in Italia. Finora esistono solo analisi funzionale, wireframe e decisioni architetturali (docs/, prototype/) — nessun codice. L'utente vuole una prima versione funzionante e veloce da deployare da un feature branch (`feat/quick-n-dirty`) per dare qualcosa agli stakeholder il prima possibile.

Lo stack originariamente pianificato (Fastify + Drizzle + Better Auth + Railway, servizi separati) viene deliberatamente sostituito per velocità con uno stack unico: **Next.js App Router (TypeScript) + Supabase (Postgres, Auth, Storage)**, deploy su **Vercel**. È un MVP temporaneo: scelte pragmatiche over completezza.

## Decisioni Concordate con l'Utente

- **Vista mappa**: placeholder statico (coordinate testuali / box "warm paper"), niente MapLibre/MapTiler per ora → nessuna API key richiesta, meno scope.
- **Setup/deploy**: lo sviluppatore scrive app + migration SQL + seed + istruzioni. L'utente crea il progetto Supabase, incolla l'SQL nel SQL Editor e configura gli env su Vercel.
- **Ambito**: completo — tutti gli schermi inclusa l'Area Gestore (admin).
- **Lingua UI**: italiano. Mobile-first. Estetica "warm paper" + accento verde hi-vis.

## Stack

- **Frontend**: Next.js (App Router, TypeScript, `src/`), Tailwind CSS v3.
- **Database & Auth**: Supabase (PostgreSQL + Auth email/password + Storage).
- **SDK**: `@supabase/supabase-js` + `@supabase/ssr` (client browser/server + middleware).
- **Storage**: bucket covers (pubblico, no signed URL).
- **Fonts**: Google Fonts via `next/font` — Caveat (titoli) + Patrick Hand (corpo).
- **Mappa**: nessuna dipendenza mappa (placeholder statico).

## Modello Dati (PostgreSQL su Supabase)

Tabelle in `public`:

### `profiles`
- `id` (uuid, PK) → `auth.users.id`
- `role` (text, default 'user') CHECK (`user` | `admin`)
- `created_at` (timestamp)

### `events`
- `id` (uuid, PK, default `gen_random_uuid()`)
- `proposal_id` (uuid, FK → `proposals.id`)
- `title` (text)
- `description` (text)
- `start_date` / `end_date` (date) CHECK `end_date >= start_date`
- `region` (text) CHECK (una delle 20 regioni italiane)
- `official_url` (text, nullable)
- `cover_image_key` (text, nullable) — e.g., `"covers/user-id/uuid-filename.jpg"`
- `start_location_name` (text)
- `start_lat` / `start_lng` (numeric(9,6))
- `end_location_name` (text, nullable)
- `end_lat` / `end_lng` (numeric(9,6), nullable)
- `created_at` / `updated_at` (timestamp)

**Indici**: `region`, `start_date`, `created_at`.

### `proposals`
- Tutti i campi di `events` più:
- `user_id` (uuid, FK → `auth.users.id`)
- `status` (text, default 'pending') CHECK (`pending` | `approved` | `rejected`)
- `rejection_reason` (text, nullable)
- `submitted_at` (timestamp)
- `reviewed_at` (timestamp, nullable)

**Indici**: `user_id`, `status`, `submitted_at`.

### `saved_events`
- `user_id` (uuid, FK → `auth.users.id`)
- `event_id` (uuid, FK → `events.id`)
- `saved_at` (timestamp)
- **PK composta**: (`user_id`, `event_id`)

### Costante TS per regioni
- File: `src/lib/constants/regions.ts`
- La lista deve combaciare **esattamente** con il CHECK su `events.region` e `proposals.region`.
- Usato in `<select>` dei form e validazione.

## Struttura del Progetto (File Chiave)

```
package.json, next.config.ts, tsconfig.json, tailwind.config.ts, postcss.config.mjs
.env.local (gitignored)
.env.example (committato)
middleware.ts                              # refresh sessione @supabase/ssr

supabase/migrations/
  0001_init.sql                            # schema + RLS + funzioni + storage
  0002_seed.sql                            # ~10 eventi di esempio approvati

src/app/
  layout.tsx                               # Root layout, Header/Footer
  globals.css                              # Tema OKLch, variabili CSS
  page.tsx                                 # "/" Calendario Pubblico
  eventi/[id]/page.tsx                     # Dettaglio Evento
  mappa/page.tsx                           # Vista Mappa (placeholder statico)
  accedi/page.tsx                          # Login
  registrati/page.tsx                      # Sign up
  calendario/page.tsx                      # Calendario Personale [auth]
  proponi/page.tsx                         # Proponi un Evento [auth]
  gestore/page.tsx                         # Area Gestore [admin]
  auth/signout/route.ts                    # POST /auth/signout

src/components/
  layout/
    Header.tsx                             # Nav, auth status, breadcrumb
    Footer.tsx
  events/
    EventCard.tsx                          # Card singolo evento
    EventGrid.tsx                          # Griglia card
    EventFilters.tsx                       # Filtri regione/durata
    SaveButton.tsx                         # Aggiungi/Rimuovi dal mio calendario
    StaticMapBox.tsx                       # Placeholder coordinate
  proposals/
    ProposalForm.tsx                       # Form proposta + upload
    StatusBadge.tsx                        # Badge stato proposta
  admin/
    AdminProposalCard.tsx                  # Card per Area Gestore
  ui/
    Button.tsx, Field.tsx, Tabs.tsx, Chip.tsx  # Componenti base

src/lib/
  supabase/
    client.ts                              # createBrowserClient
    server.ts                              # createServerClient (async)
    middleware.ts                          # updateSession
  actions/
    saved-events.ts                        # 'use server' CRUD saved_events
    proposals.ts                           # 'use server' submit proposal
    admin.ts                               # 'use server' approve/reject (RPC)
    auth.ts                                # 'use server' signUp/signIn/signOut
  constants/
    regions.ts                             # Array di 20 regioni italiane
  types/
    db.ts                                  # Type-safe tipo
  utils/
    dates.ts                               # Formattazione date
  auth/
    require-user.ts                        # Helper async: getUser() con redirect fallback
```

## SQL (in `0001_init.sql`)

1. **Schema** delle 4 tabelle:
   - Chiave primaria uuid per `profiles`, `events`, `proposals`.
   - FK `events.proposal_id` → `proposals.id`.
   - CHECK su `region` (lista 20 regioni), `end_date >= start_date`, status enum.
   - Indici su `region`, `start_date`, `status`, `user_id`, `submitted_at`.

2. **Trigger** `handle_new_user()` (SECURITY DEFINER):
   - Su `auth.users` INSERT → crea riga in `profiles` con `role='user'`.

3. **Helper function** `is_admin()`:
   - SECURITY DEFINER, STABLE.
   - Legge `profiles` table e bypassa RLS → evita ricorsione quando policy controllano il ruolo.

4. **Row-Level Security (RLS)**:
   - `events`: SELECT pubblica (nessuna UPDATE/DELETE client).
   - `profiles`: SELECT solo owner o admin.
   - `proposals`: INSERT (solo owner, status='pending' forzato), SELECT (owner o admin), UPDATE (solo admin).
   - `saved_events`: Full CRUD per owner.

5. **RPC** `approve_proposal(p_proposal_id uuid)`:
   - SECURITY DEFINER.
   - Controllo: `is_admin()` ✓, status='pending' ✓.
   - `SELECT … FOR UPDATE` sulla proposta → lock.
   - INSERT atomica in `events` (copia tutti i campi + `proposal_id`).
   - UPDATE proposta: `status='approved'`, `reviewed_at=now()`.
   - Transazione singola → atomicità garantita.

6. **Reject** (semplice UPDATE da Server Action):
   - UPDATE proposta: `status='rejected'`, `rejection_reason=?`, `reviewed_at=now()`.

7. **Storage** (bucket `covers`):
   - Pubblico (no signed URL).
   - Policy: INSERT per authenticated, SELECT per tutti.
   - Path: `covers/{user_id}/{uuid}-{filename}`.

### 0002_seed.sql

- ~10 eventi approvati realistici in più regioni.
- Coordinate realistiche (es. partenza: Roma, arrivo: Assisi).
- `cover_image_key` NULL → placeholder warm-paper in `EventCard`.
- **Commento SQL**: comando per promuovere l'utente ad admin:
  ```sql
  update public.profiles set role='admin' 
  where id=(select id from auth.users where email='puccio-94@live.it');
  ```

## Auth & Sessione (@supabase/ssr)

### Client & Server Setup
- `lib/supabase/client.ts` → `createBrowserClient`.
- `lib/supabase/server.ts` → `createServerClient` (async, `cookies()` è async in Next 15).
  - Try/catch per read-only RSC.

### Middleware
- `middleware.ts` + `lib/supabase/middleware.ts` → `updateSession()`.
- Refresh della sessione via `getUser()`.
- Matcher esclude asset statici (`.next`, `_next`, etc.).

### Flussi Auth
- **SignUp**: `signUpWithPassword(email, password)` → email confirmation OFF → login immediato.
- **SignIn**: `signInWithPassword(email, password)`.
- **SignOut**: POST a `/auth/signout` via Server Action → `signOut()` + redirect.
- Gestiti via Server Actions in `lib/actions/auth.ts`.

### Gating Pagine
- **Pagine protette** (`/calendario`, `/proponi`, `/gestore`):
  - Server Component chiama `getUser()` (da `lib/auth/require-user.ts`).
  - Se assente → `redirect('/accedi')`.
  - Se gestore → controlla `is_admin()` RPC oppure query `profiles` → redirect se non admin.
- **Pagine pubbliche**: `SaveButton` e CTA mostrano link a `/accedi` se user assente.

## Punti Delicati

### Ricorsione RLS sul Ruolo
**Problema**: policy su `profiles` che legge `profiles` direttamente causa ricorsione RLS.  
**Soluzione**: funzione `is_admin()` SECURITY DEFINER (bypassa RLS). Le policy usano `is_admin()` anziché leggere `profiles` direttamente.

### Approvazione Atomica
- RPC `approve_proposal` in singola transazione.
- `SELECT … FOR UPDATE` → lock durante transazione.
- Guardia stato='pending'.
- INSERT atomica in `events`.
- Successo → `revalidatePath('/gestore')` + `revalidatePath('/')`.

### Upload Immagine
1. Client (browser) carica su `covers/{user.id}/{uuid}-{file}` usando Supabase Storage client.
2. Callback con il path (key).
3. ProposalForm: key finisce in hidden field.
4. Server Action: inserisce proposta con `cover_image_key=key`.
5. Render: `getPublicUrl(key)` oppure `<img src={url} />` (no placeholder se key null).
6. Next.config.ts: aggiungere Supabase domain a `images.remotePatterns` se si usa `next/image`.

### Mappa
- `StaticMapBox`: mostra nome luoghi + coordinate testuali (partenza → arrivo).
- Box stilizzato con warm-paper background.
- Componente isolato: facile sostituire con MapLibre dopo MVP.

### Revalidazione
- Dopo ogni mutation (proposta creata, evento salvato, etc.) → `revalidatePath()`.
- Server Component rileggono i dati.

## Ordine di Build (Deployabile Presto)

1. **create-next-app** (root, mantiene `docs/`, `prototype/`).
   - Commit, deploy preview su Vercel (de-risk).

2. **Progetto Supabase** + esecuzione `0001_init.sql` e `0002_seed.sql` nel SQL Editor.
   - 4 env var in `.env.local` e su Vercel.

3. **Client Supabase + middleware**.
   - Verifica refresh sessione.

4. **Calendario Pubblico** (`/`):
   - Lettura `events`.
   - `EventCard` / `EventGrid`, filtri `region` + `durata` via `searchParams`.
   - Centro della demo: prova reads + RLS + seed.

5. **Dettaglio Evento** (`/eventi/[id]`):
   - Tutti i campi, cover, link ufficiale, rotta, CTA salva.

6. **Auth** (`/accedi`, `/registrati`, signout, stato auth in Header).

7. **Salva Eventi**:
   - `actions/saved-events.ts` + `SaveButton`.
   - CRUD sulla junction table.

8. **Calendario Personale** (`/calendario`):
   - Salvati + tab "Le mie proposte" con badge stato.

9. **Proponi Evento** (`/proponi`):
   - Form proposta + upload Storage.
   - Server Action submit.

10. **Area Gestore** (`/gestore`):
    - Lista proposte pending.
    - Approva (RPC) / Rifiuta (update) + motivo.
    - Promuovi l'utente ad admin via SQL.

11. **Vista Mappa** (`/mappa`):
    - Placeholder statico + toggle Lista/Mappa.

12. **Pass Styling**:
    - Tema warm-paper.
    - Variabili OKLch.
    - Font Caveat/Patrick Hand.
    - Mobile-first Tailwind.

## Tema (globals.css)

CSS Custom Properties (variabili OKLch):

```css
--accent: oklch(0.84 0.19 128)                /* verde hi-vis */
--accent-deep: oklch(0.66 0.16 128)          /* verde scuro */
--paper: oklch(0.985 0.006 95)               /* crema warm */
--ink: #29261b                               /* marrone scuro */
```

Font esposti come CSS var e mappati in Tailwind config. Componenti usano `text-[var(--ink)]`, `bg-[var(--paper)]`, `accent-[var(--accent)]`.

## Semplificazioni per l'MVP Temporaneo

- Email confirmation **OFF** (signup immediato).
- Bucket pubblico, **NO** signed URL.
- **NO** paginazione/envelope `{data, total, page, limit}` (~10 eventi → render completo).
- **NO** resize/thumbnail immagini.
- **NO** griglia calendario mensile (solo card + filtri).
- **NO** edit proposta da parte dell'admin (approva as-is / rifiuta con motivo).
- **NO** test, Drizzle, backend separato.
- Admin promosso via SQL manuale.
- Coordinate inserite a mano nel form proposta.
- Un solo ambiente (preview Vercel del branch).

## Env Var Necessarie

```
NEXT_PUBLIC_SUPABASE_URL          # URL progetto Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY     # Anon key (publica, client)
SUPABASE_SERVICE_ROLE_KEY         # Service role (solo server, opzionale per questo MVP)
```

Documentate in `.env.example`.

## Verifica End-to-End

1. `npm install && npm run dev` → `/` mostra gli eventi seed con filtri funzionanti.

2. Registrazione su `/registrati` → login automatico; Header riflette lo stato auth.

3. Apri un evento `/eventi/[id]` → "Aggiungi al mio calendario" → appare in `/calendario`.

4. `/proponi`: invia una proposta con upload immagine → appare in "Le mie proposte" come "In sospeso".

5. Promuovi l'utente ad admin via SQL → `/gestore` elenca la proposta:
   - **Approva**: l'evento compare in `/` (RPC atomica).
   - **Rifiuta**: badge "Rifiutato" + motivo in "Le mie proposte".

6. **Logout** → pagine protette reindirizzano a `/accedi`; pagine pubbliche restano accessibili.

7. `npm run build` ok → push branch → deploy preview Vercel con env configurati.

## Consegna all'Utente (Manuale)

**Istruzioni step-by-step per l'utente**:

1. Crea progetto Supabase.
2. SQL Editor: esegui `0001_init.sql` (schema + RLS + funzioni).
3. SQL Editor: esegui `0002_seed.sql` (dati di esempio).
4. **Email Confirmation**: disattiva in Auth Settings.
5. **Storage**: verifica bucket `covers` creato; è pubblico.
6. Copia `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` da Settings → API.
7. Configura env su Vercel (progetto collegato al repo/branch).
8. Deploy preview.
9. **Promuovi admin via SQL**:
   ```sql
   update public.profiles set role='admin' 
   where id=(select id from auth.users where email='puccio-94@live.it');
   ```
10. Testa accesso a `/gestore`.
