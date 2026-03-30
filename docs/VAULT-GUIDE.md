# HashiCorp Vault — Dev Setup Guide

Vault centralizes secrets management in development. No secrets are stored
on disk in the project — no `.env` file, no key files. Backend services
fetch secrets directly from Vault at runtime.

## Prerequisites

- Docker & Docker Compose
- `curl` and `jq` installed on the host

## Quick Start

### 1. Create your personal secrets file (outside the project)

Copy the template and fill in real values:

```bash
cp .env.example ~/transcendence-secrets.env
# Edit ~/transcendence-secrets.env with your real API keys, passwords, etc.
```

This file lives **outside the project directory** and is never committed.

### 2. Start Vault and seed it

```bash
make vault-init                              # starts Vault container
make vault-seed FILE=~/transcendence-secrets.env  # imports secrets
```

### 3. Start the dev stack

```bash
make dev
```

Backend services automatically fetch secrets from Vault at startup.

Or combine everything in one command:

```bash
make dev-vault FILE=~/transcendence-secrets.env
```

## How It Works

```
~/secrets.env        vault-seed         ┌──────────────┐
(outside project) ─────────────────────►│ Vault Server │
                                        │ (vault-dev)  │
                                        │ dev mode     │
                                        │ token:       │
                   loadVaultSecrets()    │ dev-root-    │
┌──────────────┐ ◄──────────────────────│ token        │
│ Backend      │    fetch at startup    └──────────────┘
│ Services     │                          port 8200
│ (NestJS)     │                          UI available
└──────────────┘

┌──────────────┐
│ DB, Nginx    │  ← hardcoded dev defaults in docker-compose.dev.yml
│ Migration    │     (transcendence/transcendence/transcendence)
└──────────────┘
```

- Backend services (core, auth, gateway, game) get `VAULT_ADDR` and `VAULT_TOKEN`
  from docker-compose and fetch all other secrets from Vault at startup.
- DB, migration, and nginx get non-secret dev defaults directly from
  docker-compose environment blocks.
- **No `.env` file** is needed in the project.

## Makefile Targets

| Target             | Description                                                |
|--------------------|------------------------------------------------------------|
| `make vault-init`  | Start Vault container (dev mode)                           |
| `make vault-seed FILE=<path>`  | Import secrets from a file into Vault        |
| `make vault-stop`  | Stop Vault container                                       |
| `make vault-ui`    | Print Vault UI URL and token                               |
| `make dev-vault [FILE=<path>]` | Start Vault, optionally seed, start dev stack |

## Vault UI

Access the web UI at **http://localhost:8200/ui**.

Sign in with the **Token** method: `dev-root-token`

Secrets are stored at **Secrets Engines > secret > transcendence**.

### Edit secrets via UI

1. Open http://localhost:8200/ui, sign in with `dev-root-token`
2. Navigate to **secret > transcendence**
3. Click **Create new version**, edit values, save
4. Restart the backend services to pick up changes: `make restart`

## Files

```
vault/
├── config/
│   └── vault.hcl            # Server mode config (kept for reference)
├── policies/
│   └── app-policy.hcl       # Read-only policy for app secrets
├── scripts/
│   └── vault-seed.sh        # Import KEY=VALUE file into Vault
└── .gitignore
```

## Important Notes

- **Dev mode** — Vault runs in dev mode. Data is stored in memory and
  lost when the container restarts. After a restart, re-run
  `make vault-seed FILE=~/transcendence-secrets.env`.
- **Fixed token** — The root token is `dev-root-token`, hardcoded in
  `docker-compose.dev.yml`. This is fine for local development.
- **No `.env` needed** — Backend services fetch secrets from Vault.
  DB/migration/nginx use hardcoded dev defaults from docker-compose.
- **Your secrets file** — Keep `~/transcendence-secrets.env` (or wherever
  you put it) safe. It's your personal file, never inside the project.
- **Without Vault** — If `VAULT_TOKEN` is not set (e.g., Vault isn't
  running), backend services fall back to environment variables from
  `.env` if one exists. The old workflow still works.
- **Production** — For production, switch Vault to server mode with
  persistent storage and proper authentication (AppRole, cloud auto-unseal).
  See `vault/config/vault.hcl` for the server mode configuration.
