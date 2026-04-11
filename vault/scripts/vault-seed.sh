#!/usr/bin/env bash
set -euo pipefail

VAULT_ADDR="${VAULT_ADDR:-http://127.0.0.1:8200}"
VAULT_TOKEN="${VAULT_TOKEN:-}"
TOKEN_SOURCE="environment"
VAULT_SECRET_PATH="secret/data/transcendence"

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

if [ -z "$VAULT_TOKEN" ] && grep -q '^VAULT_TOKEN=' "$FILE"; then
  VAULT_TOKEN="$(grep -E '^VAULT_TOKEN=' "$FILE" | tail -n 1 | cut -d '=' -f2-)"
  TOKEN_SOURCE="file"
fi

if [ -z "$VAULT_TOKEN" ]; then
  VAULT_TOKEN="dev-root-token"
  TOKEN_SOURCE="fallback"
fi

echo "Using VAULT_TOKEN from ${TOKEN_SOURCE}."

echo "Waiting for Vault at ${VAULT_ADDR}..."
READY=0
for _ in $(seq 1 30); do
  HEALTH_JSON="$(curl -s "${VAULT_ADDR}/v1/sys/health" 2>/dev/null || true)"
  if [ -n "$HEALTH_JSON" ] && echo "$HEALTH_JSON" | jq -e '.initialized == true and .sealed == false' >/dev/null 2>&1; then
    READY=1
    break
  fi
  sleep 1
done

if [ "$READY" -ne 1 ]; then
  echo "ERROR: Vault is not ready for writes at ${VAULT_ADDR} (must be initialized and unsealed)."
  echo "Tip: run 'curl -s ${VAULT_ADDR}/v1/sys/health | jq'."
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

WRITE_RESP="$(mktemp)"
HTTP_CODE=$(curl -sS -o "$WRITE_RESP" -w "%{http_code}" -X POST "${VAULT_ADDR}/v1/${VAULT_SECRET_PATH}" \
  -H "X-Vault-Token: ${VAULT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"data\": {${ENV_JSON}}}")

if [ "$HTTP_CODE" -ge 400 ]; then
  echo "ERROR: Failed to write secrets to ${VAULT_SECRET_PATH} (HTTP ${HTTP_CODE})."
  cat "$WRITE_RESP"
  echo ""
  if [ "$VAULT_TOKEN" = "dev-root-token" ]; then
    echo "Hint: dev-root-token works only with dev Vault. Set VAULT_TOKEN to your prod root token for prod Vault."
  fi
  rm -f "$WRITE_RESP"
  exit 1
fi

rm -f "$WRITE_RESP"

COUNT=$(echo "{${ENV_JSON}}" | jq 'length')
echo "Imported ${COUNT} secrets into Vault from $(basename "$FILE")"
echo "Vault UI: ${VAULT_ADDR}/ui (token: ${VAULT_TOKEN})"
