# Keycloak

Identity and Access Management for CalendarioMorbido. Handles user authentication and role-based authorization (`user` / `admin`) for the Quarkus backend.

## What's in this folder

| File | Description |
|---|---|
| `Dockerfile` | Custom Keycloak image that auto-imports the realm on first startup |
| `realm.json` | Realm configuration: roles, clients (`backend`, `frontend`) |

## Realm overview

- **Realm**: `calendariomorbido`
- **Roles**: `user` (default for all new registrations), `admin`
- **Client `backend`**: bearer-only — the Quarkus API uses it to validate JWT tokens
- **Client `frontend`**: public, PKCE — the Next.js app uses it to authenticate users

## Deploy on Railway

### Prerequisites

- A PostgreSQL service already running on Railway with a `keycloak` database created:
  ```sql
  CREATE DATABASE keycloak;
  ```

### Steps

1. **Add a new service** in your Railway project → Deploy from GitHub repo → set root directory to `keycloak/`

2. **Set environment variables**:

| Variable | Value |
|---|---|
| `KEYCLOAK_ADMIN` | `admin` |
| `KEYCLOAK_ADMIN_PASSWORD` | *(choose a strong password)* |
| `KC_DB` | `postgres` |
| `KC_DB_URL` | `jdbc:postgresql://${{your-db-service.PGHOST}}:${{your-db-service.PGPORT}}/keycloak` |
| `KC_DB_USERNAME` | `${{your-db-service.PGUSER}}` |
| `KC_DB_PASSWORD` | `${{your-db-service.PGPASSWORD}}` |
| `KC_HOSTNAME` | *(Railway public URL assigned to this service, e.g. `keycloak-xxx.railway.app`)* |
| `KC_HTTP_ENABLED` | `true` |
| `KC_PROXY_HEADERS` | `xforwarded` |

3. **Deploy** — Keycloak imports `realm.json` automatically on first startup.

4. **Update the Quarkus backend** with these variables:

| Variable | Value |
|---|---|
| `QUARKUS_OIDC_ENABLED` | `true` |
| `QUARKUS_OIDC_AUTH_SERVER_URL` | `https://<keycloak-url>/realms/calendariomorbido` |

### Verify

Open `https://<keycloak-url>/realms/calendariomorbido/.well-known/openid-configuration` — if it returns JSON, Keycloak is up and the realm is configured.

## Promote a user to admin

In the Keycloak admin console (`https://<keycloak-url>/admin`):

1. Go to **Users** → select the user
2. Tab **Role mapping** → **Assign role** → select `admin`
