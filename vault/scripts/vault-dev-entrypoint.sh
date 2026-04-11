#!/bin/sh
set -eu

VAULT_LISTEN_ADDRESS="0.0.0.0:8200"
VAULT_ROOT_TOKEN_ID="${VAULT_TOKEN:-dev-root-token}"
VAULT_SEED_FILE="/vault/seeds/.env"
VAULT_ADDR="http://127.0.0.1:8200"

if ! command -v vault >/dev/null 2>&1; then
  echo "ERROR: 'vault' CLI is required."
  exit 1
fi

BOOTSTRAP_PID=""

cleanup_bootstrap() {
  if [ -n "$BOOTSTRAP_PID" ]; then
    kill "$BOOTSTRAP_PID" >/dev/null 2>&1 || true
    wait "$BOOTSTRAP_PID" >/dev/null 2>&1 || true
    BOOTSTRAP_PID=""
  fi
}

start_bootstrap_vault() {
  echo "Starting temporary Vault dev process for setup..."
  vault server -dev -dev-root-token-id="$VAULT_ROOT_TOKEN_ID" -dev-listen-address="$VAULT_LISTEN_ADDRESS" &
  BOOTSTRAP_PID=$!
  trap 'cleanup_bootstrap' EXIT INT TERM
}

wait_for_vault() {
  echo "Waiting for Vault to become available..."
  for _ in $(seq 1 30); do
    if VAULT_ADDR="$VAULT_ADDR" vault status >/dev/null 2>&1; then
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

  export VAULT_ADDR
  export VAULT_TOKEN="$VAULT_ROOT_TOKEN_ID"

  # Ensure KV v2 engine exists at secret/
  vault secrets enable -path=secret -version=2 kv >/dev/null 2>&1 || true

  set --
  while IFS= read -r line || [ -n "$line" ]; do
    case "$line" in
      ''|\#*) continue ;;
    esac

    case "$line" in
      *=*) ;;
      *) continue ;;
    esac

    key="${line%%=*}"
    val="${line#*=}"
    set -- "$@" "$key=$val"
  done < "$VAULT_SEED_FILE"

  if [ "$#" -eq 0 ]; then
    echo "No valid KEY=VALUE entries found in seed file."
    return
  fi

  vault kv put secret/transcendence "$@" >/dev/null
  echo "Seeded $# entries into secret/transcendence"
}

start_main_seed_helper() {
  (
    echo "Waiting for main Vault PID 1 dev process..."
    for _ in $(seq 1 30); do
      if VAULT_ADDR="$VAULT_ADDR" vault status >/dev/null 2>&1; then
        break
      fi
      sleep 1
    done

    seed_vault
  ) &
}

start_bootstrap_vault
wait_for_vault
seed_vault

cleanup_bootstrap

start_main_seed_helper

echo "Starting Vault dev server as PID 1..."
exec vault server -dev -dev-root-token-id="$VAULT_ROOT_TOKEN_ID" -dev-listen-address="$VAULT_LISTEN_ADDRESS"
