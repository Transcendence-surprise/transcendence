#!/usr/bin/env bash
set -euo pipefail

VAULT_ADDR="${VAULT_ADDR:-http://127.0.0.1:8200}"
VAULT_TOKEN="${VAULT_TOKEN:-dev-root-token}"
SECRET_PATH="secret/data/transcendence"

for cmd in curl jq; do
  if ! command -v "$cmd" &>/dev/null; then
    echo "ERROR: '$cmd' is required. Install it with: sudo apt install $cmd"
    exit 1
  fi
done

if [ $# -eq 0 ]; then
  echo "Usage: $0 <path-to-secrets-file>"
  echo ""
  echo "The file should contain KEY=VALUE pairs (like .env format)."
  echo "Example: $0 ~/my-secrets.env"
  exit 1
fi

FILE="$1"

if [ ! -f "$FILE" ]; then
  echo "ERROR: File not found: $FILE"
  exit 1
fi

echo "Waiting for Vault at ${VAULT_ADDR}..."
for _ in $(seq 1 30); do
  if curl -sf "${VAULT_ADDR}/v1/sys/health" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

if ! curl -sf "${VAULT_ADDR}/v1/sys/health" >/dev/null 2>&1; then
  echo "ERROR: Vault not available at ${VAULT_ADDR}"
  exit 1
fi

curl -sf -X POST "${VAULT_ADDR}/v1/sys/mounts/secret" \
  -H "X-Vault-Token: ${VAULT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"type": "kv", "options": {"version": "2"}}' >/dev/null 2>&1 || true

ENV_JSON=$(awk '
BEGIN { first = 1 }
/^[[:space:]]*(#|$)/ { next }
{
  idx = index($0, "=")
  if (idx == 0) next
  key = substr($0, 1, idx - 1)
  val = substr($0, idx + 1)
  gsub(/\\/, "\\\\", val)
  gsub(/"/, "\\\"", val)
  if (!first) printf ","
  printf "\"%s\":\"%s\"", key, val
  first = 0
}' "$FILE")

curl -sf -X POST "${VAULT_ADDR}/v1/${SECRET_PATH}" \
  -H "X-Vault-Token: ${VAULT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"data\": {${ENV_JSON}}}" >/dev/null

COUNT=$(echo "{${ENV_JSON}}" | jq 'length')
echo "Imported ${COUNT} secrets into Vault from $(basename "$FILE")"
echo "Vault UI: ${VAULT_ADDR}/ui (token: dev-root-token)"
