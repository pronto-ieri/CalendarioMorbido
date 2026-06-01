# CalendarioMorbido — Setup MVP (Next.js + Supabase)

MVP temporaneo per gli stakeholder. Frontend e backend in **Next.js**, mentre
**Supabase** fornisce database (Postgres), autenticazione (email/password) e
storage immagini. Deploy su **Vercel** dal branch `feat/quick-n-dirty`.

## 1. Crea il progetto Supabase

1. Vai su https://supabase.com → **New project**. Scegli nome, password DB e regione (es. EU - Frankfurt).
2. Attendi il provisioning (~2 min).
3. **Project Settings → API**: copia
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (solo server, opzionale)

## 2. Esegui le migration

Nel pannello Supabase → **SQL Editor** → **New query**, incolla ed esegui in ordine:

1. Il contenuto di [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql)
   (schema, RLS, funzioni `is_admin` / `approve_proposal`, bucket storage `covers`).
2. Il contenuto di [`supabase/migrations/0002_seed.sql`](supabase/migrations/0002_seed.sql)
   (~11 eventi di esempio).

> In alternativa con la CLI: `supabase link --project-ref <ref>` poi `supabase db push`.

## 3. Disattiva la conferma email (solo per la demo)

**Authentication → Sign In / Providers → Email** → disattiva **Confirm email**.
Così la registrazione effettua il login immediato. Riattivala dopo la demo.

## 4. Avvio locale

```bash
cp .env.example .env.local   # poi inserisci i valori del punto 1
npm install
npm run dev                  # http://localhost:3000
```

La home mostra gli eventi di esempio. Registrati su `/registrati`.

## 5. Diventa amministratore

Dopo esserti registrato, nel **SQL Editor** esegui (con la tua email):

```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'puccio-94@live.it');
```

Ora vedrai il link **Gestore** e potrai approvare/rifiutare le proposte.

## 6. Deploy su Vercel

1. https://vercel.com → **Add New… → Project** → importa il repo Git.
2. **Branch**: seleziona `feat/quick-n-dirty` (deploy di anteprima/preview).
3. **Environment Variables**: aggiungi `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` e (opzionale) `SUPABASE_SERVICE_ROLE_KEY`.
4. **Deploy**. Vercel rileva Next.js automaticamente (build `next build`).
5. Apri l'URL di preview e condividilo con gli stakeholder.

> Le push successive sul branch rigenerano l'anteprima.

## Funzionalità incluse

- **Ospite**: calendario pubblico con filtri (regione, durata), dettaglio evento, vista mappa (placeholder).
- **Utente registrato**: salva eventi nel calendario personale, propone eventi (con upload copertina), vede lo stato delle proprie proposte.
- **Gestore (admin)**: coda proposte con approva/rifiuta; l'approvazione crea l'evento in modo atomico.

## Semplificazioni MVP (da rivedere in seguito)

Conferma email disattivata · bucket storage pubblico · niente paginazione ·
vista mappa come placeholder (MapLibre/MapTiler rinviati) · coordinate inserite
a mano nel form · admin assegnato via SQL · nessun test automatico.
