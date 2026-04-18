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

## Makefile Targets (dev)

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

---

## Production Setup

Production Vault runs in **server mode** with persistent file storage (Docker volume). Data survives container restarts, but Vault starts **sealed** — an operator must unseal it manually with 3 of 5 unseal keys before services can start.

Backend services authenticate via **AppRole** (`VAULT_ROLE_ID` + `VAULT_SECRET_ID`) instead of the root token.

### First-time production setup

#### 1. Start the prod Vault container

```bash
make vault-start-prod
```

#### 2. Initialize Vault (run once only)

```bash
make vault-init-prod
```

This script:
- Initializes Vault (generates 5 unseal keys, threshold 3)
- Unseals Vault automatically with the first 3 keys
- Enables KV v2 secret engine
- Creates the `transcendence-app` policy (read-only to secrets)
- Enables AppRole auth and creates the `transcendence` role
- Prints **unseal keys**, **root token**, and **AppRole credentials**

**Save the output** — unseal keys and root token are shown only once.

#### 3. Seed secrets into Vault

```bash
VAULT_TOKEN=<root-token> make vault-seed FILE=~/transcendence-secrets.env
```

#### 4. Export AppRole credentials on the VPS

The init script prints `VAULT_ROLE_ID` and `VAULT_SECRET_ID`. Set them in the shell environment before starting the stack (or put them in a gitignored `.env` file):

```bash
export VAULT_ROLE_ID=<role-id-from-init>
export VAULT_SECRET_ID=<secret-id-from-init>
```

#### 5. Start the prod stack

```bash
make prod
```

Services will authenticate to Vault via AppRole and load secrets at startup.

---

### After a production Vault restart

Vault data persists (volume), but it starts **sealed**. Unseal with 3 keys before starting the app:

```bash
make vault-unseal-prod KEY=<key-1>
make vault-unseal-prod KEY=<key-2>
make vault-unseal-prod KEY=<key-3>
make prod
```

Check seal status at any time:

```bash
make vault-status-prod
```

---

### Makefile Targets (prod)

| Target | Description |
|--------|-------------|
| `make vault-start-prod` | Start only the prod Vault container |
| `make vault-init-prod` | Initialize Vault, create AppRole, print credentials |
| `make vault-unseal-prod KEY=<key>` | Apply one unseal key (run 3×) |
| `make vault-status-prod` | Show initialized/sealed status |
| `make vault-seed FILE=<path>` | Import secrets (set `VAULT_TOKEN` to root token) |

---

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
- **Production** — Vault runs in server mode with file storage (persistent
  Docker volume). Services authenticate via AppRole. Data survives restarts
  but Vault must be manually unsealed (3 of 5 keys) after each container
  restart. See the **Production Setup** section above.
