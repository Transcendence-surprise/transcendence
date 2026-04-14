#!/usr/bin/env bash
set -euo pipefail

VAULT_ADDR="${VAULT_ADDR:-http://127.0.0.1:8200}"
# Must be passed inline: VAULT_TOKEN=<root-token> make vault-seed
# The root token is required because the app's AppRole is read-only.
VAULT_TOKEN="${VAULT_TOKEN:?ERROR: VAULT_TOKEN is required. Usage: VAULT_TOKEN=<root-token> make vault-seed}"
SECRET_PATH="secret/data/transcendence"

# Verify required CLI tools are present before doing anything.
for cmd in curl jq; do
  if ! command -v "$cmd" &>/dev/null; then
    echo "ERROR: '$cmd' is required. Install it with: sudo apt install $cmd"
    exit 1
  fi
done

# Expect exactly one argument: the path to the secrets file.
if [ $# -eq 0 ]; then
  echo "Usage: $0 <path-to-secrets-file>"
  echo ""
  echo "The file should contain KEY=VALUE pairs (like .env format)."
  echo "Example: $0 ~/transcendence-secrets.env"
  exit 1
fi

FILE="$1"

if [ ! -f "$FILE" ]; then
  echo "ERROR: File not found: $FILE"
  exit 1
fi

# Wait for Vault to respond over HTTP before trying to write.
# Vault may still be starting up or may be sealed (sealed returns 503, which is fine here —
# we just need the process to be up; the token write will fail if it is sealed).
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

# Ensure the KV v2 secret engine is mounted at 'secret/'.
# The `|| true` suppresses the error if it is already enabled.
curl -sf -X POST "${VAULT_ADDR}/v1/sys/mounts/secret" \
  -H "X-Vault-Token: ${VAULT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"type": "kv", "options": {"version": "2"}}' >/dev/null 2>&1 || true

# Parse the KEY=VALUE file into a JSON object.
# - Skip blank lines and comments (lines starting with #).
# - Split on the first '=' only, so values containing '=' are preserved.
# - Escape backslashes and double-quotes to produce valid JSON strings.
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

# Write all secrets in a single KV v2 write.
# KV v2 wraps the payload in a "data" key: POST secret/data/<name> { data: {...} }
# Each write creates a new version — previous versions are retained by Vault.
curl -sf -X POST "${VAULT_ADDR}/v1/${SECRET_PATH}" \
  -H "X-Vault-Token: ${VAULT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"data\": {${ENV_JSON}}}" >/dev/null

COUNT=$(echo "{${ENV_JSON}}" | jq 'length')
echo "Imported ${COUNT} secrets into Vault from $(basename "$FILE")"
echo "Vault UI: ${VAULT_ADDR}/ui (token: ${VAULT_TOKEN})"
