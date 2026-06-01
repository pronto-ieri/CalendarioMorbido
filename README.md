# CalendarioMorbido

Web app per il calendario di eventi cicloturistici non competitivi in Italia.

Questo branch (`feat/quick-n-dirty`) contiene un **MVP temporaneo** in **Next.js +
Supabase** (Postgres, Auth, Storage), pensato per una demo rapida agli stakeholder.
Sostituisce, solo per la demo, lo stack originariamente pianificato
(Fastify + Drizzle + Better Auth + Railway) documentato in [`docs/`](docs/).

## Avvio rapido

Vedi **[SETUP.md](SETUP.md)** per le istruzioni complete (creazione progetto
Supabase, migration SQL, variabili d'ambiente, deploy su Vercel).

```bash
cp .env.example .env.local   # inserisci URL e anon key di Supabase
npm install
npm run dev                  # http://localhost:3000
```

## Struttura

- `src/app` — pagine (App Router): calendario, dettaglio evento, mappa, auth, calendario personale, proponi, area gestore.
- `src/components` — componenti UI.
- `src/lib` — client Supabase, server actions, costanti, utilità.
- `supabase/migrations` — schema, RLS, funzioni e dati di esempio.
- `docs/` · `prototype/` — analisi funzionale, modello dati e wireframe originali.
