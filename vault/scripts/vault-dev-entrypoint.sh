#!/usr/bin/env bash
set -euo pipefail

VAULT_LISTEN_ADDRESS="${VAULT_DEV_LISTEN_ADDRESS:-0.0.0.0:8200}"
VAULT_ROOT_TOKEN_ID="${VAULT_DEV_ROOT_TOKEN_ID:-dev-root-token}"
VAULT_SEED_FILE="${VAULT_SEED_FILE:-/vault/seeds/.env}"
VAULT_ADDR="http://127.0.0.1:8200"

for cmd in curl jq vault; do
  if ! command -v "$cmd" &>/dev/null; then
    echo "ERROR: '$cmd' is required."
    exit 1
  fi
done

start_vault() {
  echo "Starting Vault dev server..."
  vault server -dev -dev-root-token-id="$VAULT_ROOT_TOKEN_ID" -dev-listen-address="$VAULT_LISTEN_ADDRESS" &
  VAULT_PID=$!

  trap 'echo "Stopping Vault..."; kill "$VAULT_PID"; wait "$VAULT_PID" || true' EXIT
}

wait_for_vault() {
  echo "Waiting for Vault to become available..."
  for i in $(seq 1 30); do
    if curl -sf "$VAULT_ADDR/v1/sys/health" >/dev/null 2>&1; then
      echo "Vault is available."
      return
    fi
    sleep 1
  done

  echo "ERROR: Vault did not become available in time."
  exit 1
}

seed_vault() {
  if [ ! -f "$VAULT_SEED_FILE" ]; then
    echo "WARNING: seed file not found: $VAULT_SEED_FILE"
    echo "Skipping Vault seed. Create the file or set VAULT_SEED_FILE to a valid path."
    return
  fi

  echo "Seeding Vault from $VAULT_SEED_FILE..."
  VAULT_TOKEN="$VAULT_ROOT_TOKEN_ID" VAULT_ADDR="$VAULT_ADDR" "/vault/scripts/vault-seed.sh" "$VAULT_SEED_FILE"
}

start_vault
wait_for_vault
seed_vault

wait "$VAULT_PID"
