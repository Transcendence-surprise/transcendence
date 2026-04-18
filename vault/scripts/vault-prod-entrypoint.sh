#!/bin/sh
set -eu

VAULT_ADDR="${VAULT_ADDR:-http://127.0.0.1:8200}"
VAULT_CONFIG_FILE="/vault/config/vault.hcl"
VAULT_UNSEAL_KEYS_FILE="/vault/config/.unseal_keys"
VAULT_SECRET_PATH="secret/data/transcendence"

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
  echo "Starting temporary Vault process for setup checks..."
  vault server -config="$VAULT_CONFIG_FILE" &
  BOOTSTRAP_PID=$!
  trap 'cleanup_bootstrap' EXIT INT TERM
}

status_output() {
  VAULT_ADDR="$VAULT_ADDR" vault status 2>/dev/null || true
}

status_field() {
  field_name="$1"
  status_output | awk -v key="$field_name" '$1 == key { print $2 }' | tail -n 1
}

is_initialized() {
  [ "$(status_field Initialized)" = "true" ]
}

wait_for_vault() {
  echo "Waiting for Vault to become available..."
  for _ in $(seq 1 60); do
    out="$(status_output)"
    if echo "$out" | grep -q '^Initialized'; then
      echo "Vault is reachable."
      return
    fi
    sleep 1
  done

  echo "ERROR: Vault did not become available in time."
  exit 1
}

initialize_if_needed() {
  if is_initialized; then
    echo "Vault already initialized."
    return
  fi

  echo "Vault is not initialized yet. Starting server and skipping unseal/seed checks."
}

auto_unseal() {
  sealed="$(status_field Sealed)"

  if [ "$sealed" = "false" ]; then
    echo "Vault already unsealed."
    return
  fi

  if [ ! -f "$VAULT_UNSEAL_KEYS_FILE" ]; then
    echo "ERROR: Vault is sealed but unseal keys file is missing: $VAULT_UNSEAL_KEYS_FILE"
    exit 1
  fi

  echo "Applying unseal keys from $VAULT_UNSEAL_KEYS_FILE..."
  count=0
  while IFS= read -r key || [ -n "$key" ]; do
    [ -n "$key" ] || continue
    VAULT_ADDR="$VAULT_ADDR" vault operator unseal "$key" >/dev/null
    count=$((count + 1))

    sealed="$(status_field Sealed)"
    if [ "$sealed" = "false" ]; then
      echo "Vault unsealed using $count key(s)."
      return
    fi

    if [ "$count" -ge 3 ]; then
      break
    fi
  done < "$VAULT_UNSEAL_KEYS_FILE"

  sealed="$(status_field Sealed)"
  if [ "$sealed" != "false" ]; then
    echo "ERROR: Vault is still sealed after applying keys from $VAULT_UNSEAL_KEYS_FILE"
    exit 1
  fi
}

require_seeded_secret() {
  if VAULT_ADDR="$VAULT_ADDR" vault kv get "$VAULT_SECRET_PATH" >/dev/null 2>&1; then
    echo "Vault secret '$VAULT_SECRET_PATH' is present."
    return
  fi

  echo "ERROR: Required Vault secret '$VAULT_SECRET_PATH' is missing."
  echo "Seed it manually before starting app services."
}

start_main_unseal_helper() {
  (
    echo "Waiting for main Vault PID 1 process to come up for auto-unseal..."
    for _ in $(seq 1 60); do
      out="$(status_output)"
      if echo "$out" | grep -q '^Initialized'; then
        break
      fi
      sleep 1
    done

    auto_unseal
    require_seeded_secret
  ) &
}

start_bootstrap_vault
wait_for_vault
initialize_if_needed

if ! is_initialized; then
  cleanup_bootstrap
  echo "Starting Vault server mode as PID 1 (uninitialized)."
  exec vault server -config="$VAULT_CONFIG_FILE"
fi

auto_unseal
require_seeded_secret

cleanup_bootstrap

start_main_unseal_helper

echo "Starting Vault server mode as PID 1..."
exec vault server -config="$VAULT_CONFIG_FILE"
