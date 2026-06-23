# Backend — README

## Prerequisites

- **JDK 21** (LTS) — [Eclipse Temurin 21](https://adoptium.net/temurin/releases/?version=21)

  ```bash
  # Windows (winget)
  winget install EclipseAdoptium.Temurin.21.JDK
  ```

  Verify that Maven uses Java 21:

  ```bash
  mvn -version   # must show Java version: 21.x.x
  ```

  If it shows a different version, set `JAVA_HOME` in your shell profile:

  ```bash
  # ~/.bashrc (Git Bash)
  export JAVA_HOME="/c/Program Files/Eclipse Adoptium/jdk-21.0.11.10-hotspot"
  export PATH="$JAVA_HOME/bin:$PATH"
  ```

- **Maven 3.9+**
- **Docker Desktop** — for the local PostgreSQL instance

## Local startup

```bash
docker compose up -d postgres   # start PostgreSQL + pgAdmin
mvn quarkus:dev                  # start Quarkus with hot reload
```

Flyway migrations run automatically at startup. The API is available at `http://localhost:8080`.

## Environment variables

The backend reads these environment variables. Defaults work out of the box for local development:

| Variable | Default | Description |
| --- | --- | --- |
| `DB_URL` | `jdbc:postgresql://localhost:5432/calendariomorbido` | JDBC connection URL |
| `DB_USER` | `postgres` | Database username |
| `DB_PASSWORD` | `postgres` | Database password |
| `KEYCLOAK_URL` | `http://localhost:8180/realms/calendariomorbido` | Keycloak server (not required in dev) |
| `CORS_ORIGINS` | `http://localhost:3000` | Allowed CORS origins |

In dev mode (`mvn quarkus:dev`) OIDC is disabled via the `%dev` profile — Keycloak is not required.

## Debug with VS Code

Install the **Java Extension Pack** (`vscjava.vscode-java-pack`).

Add the following files to the repository root:

**`.vscode/tasks.json`**

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "DB: Start",
      "type": "shell",
      "command": "docker compose up -d postgres",
      "options": { "cwd": "${workspaceFolder}/backend" },
      "presentation": { "reveal": "silent", "panel": "shared" },
      "problemMatcher": []
    },
    {
      "label": "Backend: Quarkus Dev",
      "type": "shell",
      "command": "mvn quarkus:dev",
      "options": {
        "cwd": "${workspaceFolder}/backend",
        "env": {
          "DB_URL": "jdbc:postgresql://localhost:5432/calendariomorbido",
          "DB_USER": "postgres",
          "DB_PASSWORD": "postgres",
          "KEYCLOAK_URL": "http://localhost:8180/realms/calendariomorbido",
          "CORS_ORIGINS": "http://localhost:3000"
        }
      },
      "dependsOn": "DB: Start",
      "isBackground": true,
      "presentation": { "reveal": "always", "panel": "new" },
      "problemMatcher": {
        "pattern": { "regexp": "^$", "file": 1, "location": 2, "message": 3 },
        "background": {
          "activeOnStart": true,
          "beginsPattern": "Listening for transport dt_socket",
          "endsPattern": "started in"
        }
      }
    },
    {
      "label": "DB: Stop",
      "type": "shell",
      "command": "docker compose down",
      "options": { "cwd": "${workspaceFolder}/backend" },
      "presentation": { "reveal": "silent", "panel": "shared" },
      "problemMatcher": []
    }
  ]
}
```

**`.vscode/launch.json`**

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "java",
      "request": "attach",
      "name": "Debug: Quarkus Backend",
      "hostName": "localhost",
      "port": 5005,
      "preLaunchTask": "Backend: Quarkus Dev"
    }
  ]
}
```

Press **F5**: VS Code starts the DB, then Quarkus, then attaches the Java debugger to port 5005 (opened automatically by `quarkus:dev`).

## Useful endpoints

| Tool | URL | Description |
| --- | --- | --- |
| API | <http://localhost:8080> | REST API |
| Swagger UI | <http://localhost:8080/q/swagger-ui> | Interactive API documentation |
| pgAdmin | <http://localhost:5050> | PostgreSQL dashboard (<admin@admin.com> / admin) |
