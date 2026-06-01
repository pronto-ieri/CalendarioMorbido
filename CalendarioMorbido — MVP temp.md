CalendarioMorbido — MVP temporaneo (Next.js + Supabase)

Context

CalendarioMorbido è una web app per il tracciamento di eventi cicloturistici non
competitivi in Italia. Finora esistono solo analisi funzionale, wireframe e
decisioni architetturali (docs/, prototype/) — nessun codice. L'utente vuole
una prima versione funzionante e veloce da deployare da un feature branch
(feat/quick-n-dirty) per dare qualcosa agli stakeholder il prima possibile.

Lo stack originariamente pianificato (Fastify + Drizzle + Better Auth + Railway,
servizi separati) viene deliberatamente sostituito per velocità con uno stack
unico: Next.js App Router (TypeScript) + Supabase (Postgres, Auth, Storage),
deploy su Vercel. È un MVP temporaneo: scelte pragmatiche over completezza.

Decisioni concordate con l'utente

- Vista mappa: placeholder statico (coordinate testuali / box "warm paper"), niente
  MapLibre/MapTiler per ora → nessuna API key richiesta, meno scope.
- Setup/deploy: io scrivo app + migration SQL + seed + istruzioni. L'utente crea il
  progetto Supabase, incolla l'SQL nel SQL Editor e configura gli env su Vercel.
- Ambito: completo — tutti gli schermi inclusa l'Area Gestore (admin).
- Lingua UI: italiano. Mobile-first. Estetica "warm paper" + accento verde hi-vis.

Stack

- Next.js (App Router, TypeScript, src/), Tailwind CSS v3.
- @supabase/supabase-js + @supabase/ssr (client browser/server + middleware).
- Supabase: Postgres + Auth (email/password) + Storage (bucket covers, pubblico).
- Font Google via next/font: Caveat (titoli) + Patrick Hand (corpo).
- Nessuna dipendenza mappa (placeholder statico).

Modello dati (Postgres su Supabase)

Tabelle in public: profiles, events, proposals, saved_events.

- profiles: id uuid pk → auth.users, role text default 'user' check(user|admin), created_at.
- events: id uuid pk default gen_random_uuid(), proposal_id uuid → proposals, title,
  description, start_date/end_date date, region text (check 20 regioni), official_url,
  cover_image_key, start_location_name, start_lat/lng numeric(9,6), end_location_name,
  end_lat/lng numeric(9,6) null, created_at/updated_at. Check end_date >= start_date.
- proposals: come events + user_id uuid → auth.users, status text default 'pending'
  (check pending|approved|rejected), rejection_reason, submitted_at, reviewed_at.
- saved_events: user_id, event_id, saved_at, PK composta (user_id, event_id).
- Region = una delle 20 regioni italiane; costante TS in lib/constants/regions.ts è la
  single source of truth per i <select> e deve combaciare con il CHECK SQL.

Struttura del progetto (file chiave)

package.json, next.config.ts, tsconfig.json, tailwind.config.ts, postcss.config.mjs
.env.local (gitignored), .env.example (committato)
middleware.ts # refresh sessione @supabase/ssr
supabase/migrations/0001_init.sql # schema + RLS + funzioni + storage
supabase/migrations/0002_seed.sql # ~10 eventi di esempio
src/app/
layout.tsx, globals.css, page.tsx # "/" Calendario Pubblico
eventi/[id]/page.tsx # Dettaglio Evento
mappa/page.tsx # Vista Mappa (placeholder statico)
accedi/page.tsx, registrati/page.tsx # Auth
calendario/page.tsx # Calendario Personale [auth]
proponi/page.tsx # Proponi un Evento [auth]
gestore/page.tsx # Area Gestore [admin]
auth/signout/route.ts
src/components/
layout/Header.tsx, Footer.tsx
events/EventCard.tsx, EventGrid.tsx, EventFilters.tsx, SaveButton.tsx, StaticMapBox.tsx
proposals/ProposalForm.tsx, StatusBadge.tsx
admin/AdminProposalCard.tsx
ui/Button.tsx, Field.tsx, Tabs.tsx, Chip.tsx
src/lib/
supabase/client.ts, server.ts, middleware.ts
actions/saved-events.ts, proposals.ts, admin.ts, auth.ts # 'use server'
constants/regions.ts, types/db.ts, utils/dates.ts, auth/require-user.ts

SQL (in 0001_init.sql)

1.  Schema delle 4 tabelle (FK events.proposal_id aggiunta dopo la creazione di
    proposals), indici su region/start_date/status/user_id, CHECK su regioni e date.
2.  Trigger handle_new_user() (SECURITY DEFINER) su auth.users → crea la riga profiles.
3.  Helper public.is_admin() SECURITY DEFINER STABLE (legge profiles, bypassa RLS →
    evita la ricorsione RLS quando le policy controllano il ruolo).
4.  RLS: events select pubblica (nessuna scrittura client); profiles select owner/admin;
    proposals insert own (status='pending'), select owner-or-admin, update admin; saved_events
    CRUD owner.
5.  RPC approve_proposal(p_proposal_id uuid) SECURITY DEFINER: controllo admin, SELECT … FOR UPDATE, guardia status='pending', INSERT atomico in events (copia campi + proposal_id)
    e UPDATE proposta a approved/reviewed_at=now(). Reject = UPDATE semplice dalla Server Action.
6.  Storage: bucket pubblico covers + policy insert per authenticated, select per tutti.

- 0002_seed.sql: ~10 eventi approvati realistici in più regioni (con coordinate; cover_image_key
  null → placeholder warm-paper in EventCard). Commento con SQL per promuovere admin:
  update public.profiles set role='admin' where id=(select id from auth.users where email='puccio-94@live.it');

Auth/sessione (@supabase/ssr — pattern standard)

- lib/supabase/client.ts → createBrowserClient. lib/supabase/server.ts → createServerClient
  async (cookies() è async in Next 15), getAll/setAll con try/catch per i RSC read-only.
- middleware.ts + lib/supabase/middleware.ts → updateSession (refresh via getUser()),
  matcher esclude asset statici.
- Flussi via Server Actions: signUp/signInWithPassword/signOut poi redirect().
  Email confirmation disattivata per la demo (signup immediato).
- Gating: pagine protette (calendario, proponi, gestore) chiamano getUser() nel Server
  Component → redirect('/accedi') se assente; gestore controlla anche il ruolo via is_admin
  RPC / query profiles → redirect se non admin. Guest: SaveButton/CTA mostrano link a /accedi.

Punti delicati

- Ricorsione RLS sul ruolo → risolta da is_admin() SECURITY DEFINER, mai policy su
  profiles che legge profiles direttamente.
- Approvazione atomica → RPC plpgsql in singola transazione con FOR UPDATE + guardia stato;
  dopo il successo revalidatePath('/gestore') e revalidatePath('/').
- Upload immagine → ProposalForm client carica su covers/${user.id}/${uuid}-${file} con
  lo storage client; il path (key) finisce in campo nascosto → la Server Action inserisce la
  proposta con cover_image_key. Render via getPublicUrl(key); <img> semplice + host in
  next.config.ts images.remotePatterns se si usa next/image. Placeholder se key null.
- Mappa → StaticMapBox mostra nome luoghi + coordinate (partenza→arrivo) in un box stilizzato;
  componente isolato da rimpiazzare poi con MapLibre.
- Revalidate dopo ogni mutation così i Server Component rileggono i dati.

Ordine di build (deployabile presto)

1.  create-next-app (root, mantiene docs//prototype/), commit, deploy preview su Vercel (de-risk).
2.  Progetto Supabase + esecuzione 0001/0002 nel SQL Editor; 4 env var in .env.local e Vercel.
3.  Client Supabase + middleware; verifica refresh sessione.
4.  Calendario Pubblico (/): lettura events, EventCard/Grid, filtri regione+durata via
    searchParams. Centro della demo, prova reads+RLS+seed.
5.  Dettaglio Evento (/eventi/[id]): tutti i campi, cover, link ufficiale, route, CTA salva.
6.  Auth (/accedi, /registrati, signout, stato auth in Header).
7.  Salva eventi (actions/saved-events.ts + SaveButton).
8.  Calendario Personale (/calendario): salvati + tab "Le mie proposte" con badge stato.
9.  Proponi Evento (/proponi): form + upload Storage + action submit.
10. Area Gestore (/gestore): lista pending, approva (RPC) / rifiuta (update). Promuovi il
    proprio account ad admin via SQL.
11. Vista Mappa (/mappa): placeholder statico + toggle Lista/Mappa.
12. Pass styling: tema warm-paper, variabili OKLch, font Caveat/Patrick Hand, mobile-first.

Tema (globals.css): --accent: oklch(0.84 0.19 128), --accent-deep: oklch(0.66 0.16 128),
--paper: oklch(0.985 0.006 95), --ink:#29261b; font esposti come CSS var e mappati in Tailwind.

Semplificazioni per l'MVP temporaneo

Email confirmation off; bucket pubblico senza signed URL; niente paginazione/envelope
{data,total,page,limit} (≈10 eventi → render completo); niente resize/thumbnail immagini;
niente griglia calendario mensile (solo card+filtri); niente edit proposta da parte dell'admin
(approva as-is / rifiuta con motivo); niente test/Drizzle/backend separato; admin via SQL manuale;
coordinate inserite a mano nel form proposta; un solo ambiente (preview Vercel del branch).
{data,total,page,limit} (≈10 eventi → render completo); niente resize/thumbnail immagini;
niente griglia calendario mensile (solo card+filtri); niente edit proposta da parte dell'admin
(approva as-is / rifiuta con motivo); niente test/Drizzle/backend separato; admin via SQL manuale;
coordinate inserite a mano nel form proposta; un solo ambiente (preview Vercel del branch).

     Env var necessarie

     NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
     (solo server, opzionale per questo MVP). Documentate in .env.example.

     Verifica end-to-end

     1. npm install && npm run dev → / mostra gli eventi seed con filtri funzionanti.
     2. Registrazione su /registrati → login automatico; Header riflette lo stato auth.
     3. Apri un evento /eventi/[id] → "Aggiungi al mio calendario" → compare in /calendario.
     4. /proponi: invia una proposta con upload immagine → appare in "Le mie proposte" come "In sospeso".
     5. Promuovi l'utente ad admin via SQL → /gestore elenca la proposta → Approva: l'evento compare
     in / (RPC atomica). Testa anche Rifiuta con motivo → badge "Rifiutato" in "Le mie proposte".
     6. Logout → le pagine protette reindirizzano a /accedi; le pagine pubbliche restano accessibili.
     7. Build di produzione npm run build ok → push branch → deploy preview Vercel verde con env configurati.

     Consegna all'utente (manuale)

     Fornire istruzioni passo-passo: creare progetto Supabase, eseguire 0001/0002 nel SQL Editor,
     disattivare email confirmation, copiare URL+anon key, creare bucket covers (o creato da SQL),
     configurare gli env su Vercel, collegare il repo/branch e deployare, promuovere admin via SQL.
