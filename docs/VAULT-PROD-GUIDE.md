# Vault Production Guide

Step-by-step guide for setting up and operating HashiCorp Vault in production.
Intended for a DevOps engineer deploying the app on the Hetzner VPS for the
first time, or resuming operations after a server restart.

---

## How It Works in Production

```
~/transcendence-secrets.env
  (filled once by operator)
         │
         │ make vault-seed
         ▼
  ┌─────────────┐   AppRole login   ┌────────────────┐
  │    Vault    │ ◄──────────────── │ Backend service│
  │ server mode │                   │ (core/auth/    │
  │ port 8200   │ ──secrets──────►  │  game/gateway) │
  │ persistent  │                   └────────────────┘
  │ file storage│
  └─────────────┘
  bound to 127.0.0.1:8200
  (not reachable from internet)
```

- Vault runs as a Docker container in **server mode** with a persistent named
  volume (`vault_data`). Data survives container restarts.
- On every restart Vault starts **sealed**. An operator must unseal it manually
  before the app services can start.

### Sealed vs Unsealed

**Sealed** means Vault is running but refuses to serve any secrets. It holds
all data encrypted on disk but does not know the encryption key yet.

**Unsealed** means Vault has reconstructed the encryption key and is fully
operational.

This works via **Shamir's Secret Sharing**: when Vault is first initialized it
generates a master encryption key and immediately splits it into **5 key
fragments**. No single fragment is the key — you need **any 3 of the 5** to
reconstruct it. Vault never stores the full key; only the operator holds the
fragments.

Every time the Vault process starts, it loads the encrypted data from disk but
has no idea what the encryption key is. It waits sealed until an operator
provides 3 fragments:

```
Start  →  Sealed (1/3 keys provided)
       →  Sealed (2/3 keys provided)
       →  UNSEALED — master key reconstructed, data decrypted, ready
```

This is a security feature: if the server is stolen or compromised, the
attacker gets only encrypted data — the key never exists on disk and only lives
in memory while Vault is running.
- Services authenticate to Vault via **AppRole** (role_id + secret_id). These
  credentials are set as environment variables on the VPS (Virtual Private Server) before starting the
  stack — they are never committed to git.
- Port 8200 is bound to `127.0.0.1` only — not reachable from the internet.
  Access via SSH port-forwarding if you need the UI from your laptop.

---

## Prerequisites

- SSH access to the VPS
- Docker and Docker Compose v5 installed on the VPS
- `curl` and `jq` installed on the VPS (`sudo apt install curl jq`)
- Your secrets file prepared: a copy of `.env.example` with all `SECRET` fields
  filled in, stored at `~/transcendence-secrets.env` **on the VPS**

---

## Part 1 — First-Time Setup

Do this once on a brand-new deployment (or after `make prod-fclean` which
destroys the vault volume).

### Step 1 — Install dependencies

```bash
make dev-install
```

### Step 2 — Prepare the secrets file on the VPS

```bash
cp .env.example ~/transcendence-secrets.env
```

The file must stay outside the project directory and must never be committed.

### Step 3 — Start the prod Vault container

```bash
make vault-start-prod
```

This starts only the Vault container in server mode. The app services are not
started yet.

Verify it is running:

```bash
docker ps | grep vault-prod
```

Expected output: container is `Up`, status is not yet `healthy` — that is
normal, Vault is uninitialized and sealed.

### Step 4 — Initialize Vault

```bash
make vault-init-prod
```

The script will print output similar to this:

```
================================================================
 VAULT INITIALIZED — SAVE THE FOLLOWING SOMEWHERE SAFE
================================================================

 Root Token:  hvs.XXXXXXXXXXXXXXXXXXXXXXXX

 Unseal Keys (need any 3 of 5 to unseal after restart):
   Key 1: aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
   Key 2: bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
   Key 3: cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
   Key 4: dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd
   Key 5: eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee

 WARNING: These are shown only once. Store them outside the project.
================================================================

================================================================
 APPROLE CREDENTIALS — add to your production environment
================================================================

 VAULT_ROLE_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
 VAULT_SECRET_ID=yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy
================================================================
```

**Copy and save this entire output immediately.** The unseal keys and root token
are shown only once and cannot be recovered if lost.

Recommended: save to a password manager or an encrypted file on a separate
machine — never inside this project.

After this step Vault is already unsealed (the script auto-unseals it using
keys 1–3) and ready to use.

### Step 5 — Seed secrets into Vault

Use the root token printed in Step 4:

```bash
VAULT_TOKEN=<root-token-from-step-4> make vault-seed FILE=~/transcendence-secrets.env
```

Expected output:

```
Imported 26 secrets into Vault from transcendence-secrets.env
Vault UI: http://127.0.0.1:8200/ui (token: hvs.XXXX...)
```

### Step 6 — Export the AppRole credentials

The `VAULT_ROLE_ID` and `VAULT_SECRET_ID` printed in Step 4 must be available
as environment variables when the prod stack starts. The simplest way on a VPS
is to add them to the shell profile so they persist across sessions:

```bash
echo 'export VAULT_ROLE_ID=<role-id-from-step-4>' >> ~/.bashrc
echo 'export VAULT_SECRET_ID=<secret-id-from-step-4>' >> ~/.bashrc
source ~/.bashrc
```

Verify they are set:

```bash
echo $VAULT_ROLE_ID
echo $VAULT_SECRET_ID
```

### Step 7 — Start the full prod stack

```bash
make prod
```

Docker Compose will start all services. The backend containers (core, auth,
game, gateway) wait for Vault to report healthy before starting, then
authenticate via AppRole and load all secrets.

### Step 8 — Verify the app is running

Check container status:

```bash
docker ps
```

All containers should show `Up` and `healthy` (or `Up` for those without a
healthcheck). If any container exited, check its logs:

```bash
make log-core      # or log-auth, log-game, log-gateway
```

A successful Vault secret load looks like this in the logs:

```
Loaded 26 secrets from Vault
```

Check the app is reachable:

```bash
curl -sf https://valinor.ink/api/health
```

---

## Part 2 — After Every VPS / Vault Restart

Vault data persists in the Docker volume, but the container starts **sealed**
after every restart. Services cannot load secrets and will refuse to start
until Vault is unsealed.

### Step 1 — Check Vault status

```bash
make vault-status-prod
```

If Vault is sealed the output will show `"sealed": true`. If the container is
not running, start it first:

```bash
make vault-start-prod
```

### Step 2 — Unseal Vault (3 keys required)

Run this command three times, each time with a different unseal key from the
set you saved in Part 1, Step 4:

```bash
make vault-unseal-prod KEY=<key-1>
make vault-unseal-prod KEY=<key-2>
make vault-unseal-prod KEY=<key-3>
```

After the third key you will see:

```
Vault is UNSEALED and ready.
```

Confirm with:

```bash
make vault-status-prod
# expected: "sealed": false
```

### Step 3 — Start the prod stack

```bash
make prod
```

---

## Part 3 — Updating Secrets

When you need to add or change a secret value (e.g. rotate an OAuth key):

### Option A — Re-seed from file

Update `~/transcendence-secrets.env` on the VPS, then re-run seed with the
root token:

```bash
VAULT_TOKEN=<root-token> make vault-seed FILE=~/transcendence-secrets.env
```

Then restart services to pick up the new values:

```bash
make down && make prod
```

### Option B — Edit via Vault UI

Open the Vault UI via SSH port-forwarding from your laptop:

```bash
# On your laptop:
ssh -L 8200:127.0.0.1:8200 user@valinor.ink
```

Then open **http://localhost:8200/ui** in your browser and sign in with the
root token.

1. Navigate to **Secrets Engines → secret → transcendence**
2. Click **Create new version**
3. Edit the values and save

Restart services:

```bash
make down && make prod
```

---

## Part 4 — Full Reset (Destroy and Recreate)

To wipe Vault data and start from scratch (e.g. rotating all credentials):

```bash
make prod-fclean    # stops containers and removes ALL prod volumes including vault_data
```

Then repeat **Part 1** from Step 3 onward.

---

## Troubleshooting

### Services fail to start with "Failed to load secrets from Vault"

1. Check Vault is running: `docker ps | grep vault-prod`
2. Check seal status: `make vault-status-prod`
3. If sealed: unseal with 3 keys (Part 2, Step 2)
4. Check `VAULT_ROLE_ID` and `VAULT_SECRET_ID` are set: `echo $VAULT_ROLE_ID`
5. Retry: `make prod`

### "Vault is not reachable" from vault-init-prod

The Vault container is not up. Run `make vault-start-prod` first, wait a few
seconds, then retry `make vault-init-prod`.

### Lost unseal keys

There is no recovery. The only option is to destroy the volume and reinitialize:

```bash
make prod-fclean
# then repeat Part 1 from Step 3
```

### Lost AppRole credentials (VAULT_ROLE_ID / VAULT_SECRET_ID)

Log in to Vault UI with the root token, navigate to
**Access → Auth Methods → approle → transcendence**, and generate a new
`secret_id`. The `role_id` is always readable from the UI or via:

```bash
curl -sf http://127.0.0.1:8200/v1/auth/approle/role/transcendence/role-id \
  -H "X-Vault-Token: <root-token>" | jq -r .data.role_id
```

Update `~/.bashrc` with the new values and `source ~/.bashrc`, then restart
the stack.

### Vault UI is inaccessible (expected)

Port 8200 is bound to `127.0.0.1` and is not reachable from the internet by
design. Use SSH port-forwarding to access it from your laptop:

```bash
ssh -L 8200:127.0.0.1:8200 user@valinor.ink
# then open http://localhost:8200/ui
```
