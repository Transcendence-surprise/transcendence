#!/usr/bin/env bash
# Initializes a fresh production Vault: unseals it, sets up KV engine,
# creates the app policy, enables AppRole, and prints credentials.
# Run once on a brand-new Vault. Safe to re-run — exits early if already init'd.
set -euo pipefail

VAULT_ADDR="${VAULT_ADDR:-http://127.0.0.1:8200}"
POLICY_FILE="$(dirname "$0")/../policies/app-policy.hcl"

for cmd in curl jq; do
  if ! command -v "$cmd" &>/dev/null; then
    echo "ERROR: '$cmd' is required."
    exit 1
  fi
done

# Wait for Vault to accept connections (sealed is fine — HTTP 503 is OK)
echo "Waiting for Vault at ${VAULT_ADDR}..."
for i in $(seq 1 30); do
  CODE=$(curl -sf -o /dev/null -w "%{http_code}" "${VAULT_ADDR}/v1/sys/health" 2>/dev/null || echo "000")
  if [ "$CODE" != "000" ]; then break; fi
  echo "  attempt $i/30..."
  sleep 1
done
if [ "$CODE" = "000" ]; then
  echo "ERROR: Vault is not reachable at ${VAULT_ADDR}"
  exit 1
fi

# Check if already initialized
INITIALIZED=$(curl -sf "${VAULT_ADDR}/v1/sys/init" | jq -r .initialized)
if [ "$INITIALIZED" = "true" ]; then
  echo "Vault is already initialized."
  echo "If it is sealed, run:  make vault-unseal-prod KEY=<unseal-key>  (3 times)"
  exit 0
fi

echo ""
echo "Initializing Vault (5 key shares, threshold 3)..."
INIT=$(curl -sf -X POST "${VAULT_ADDR}/v1/sys/init" \
  -H "Content-Type: application/json" \
  -d '{"secret_shares": 5, "secret_threshold": 3}')

ROOT_TOKEN=$(echo "$INIT" | jq -r .root_token)
mapfile -t KEYS < <(echo "$INIT" | jq -r '.keys[]')

echo ""
echo "================================================================"
echo " VAULT INITIALIZED — SAVE THE FOLLOWING SOMEWHERE SAFE"
echo "================================================================"
echo ""
echo " Root Token:  $ROOT_TOKEN"
echo ""
echo " Unseal Keys (need any 3 of 5 to unseal after restart):"
for i in "${!KEYS[@]}"; do
  echo "   Key $((i+1)): ${KEYS[$i]}"
done
echo ""
echo " WARNING: These are shown only once. Store them outside the project."
echo "================================================================"
echo ""

# Unseal automatically with the first 3 keys
echo "Unsealing Vault..."
for i in 0 1 2; do
  curl -sf -X POST "${VAULT_ADDR}/v1/sys/unseal" \
    -H "Content-Type: application/json" \
    -d "{\"key\": \"${KEYS[$i]}\"}" > /dev/null
  echo "  Unseal key $((i+1))/3 applied"
done
echo "Vault is unsealed."
echo ""

# Enable KV v2 secret engine at 'secret/'
echo "Enabling KV v2 secret engine..."
curl -sf -X POST "${VAULT_ADDR}/v1/sys/mounts/secret" \
  -H "X-Vault-Token: $ROOT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"kv","options":{"version":"2"}}' >/dev/null 2>&1 || echo "  (already enabled)"

# Write app policy
echo "Writing transcendence-app policy..."
POLICY=$(cat "$POLICY_FILE")
curl -sf -X PUT "${VAULT_ADDR}/v1/sys/policies/acl/transcendence-app" \
  -H "X-Vault-Token: $ROOT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"policy\": $(echo "$POLICY" | jq -Rs .)}" > /dev/null

# Enable AppRole auth method
echo "Enabling AppRole auth method..."
curl -sf -X POST "${VAULT_ADDR}/v1/sys/auth/approle" \
  -H "X-Vault-Token: $ROOT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"approle"}' >/dev/null 2>&1 || echo "  (already enabled)"

# Create the transcendence role
echo "Creating 'transcendence' AppRole..."
curl -sf -X POST "${VAULT_ADDR}/v1/auth/approle/role/transcendence" \
  -H "X-Vault-Token: $ROOT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "policies": ["transcendence-app"],
    "token_ttl": "1h",
    "token_max_ttl": "24h",
    "secret_id_num_uses": 0,
    "token_num_uses": 0
  }' > /dev/null

ROLE_ID=$(curl -sf "${VAULT_ADDR}/v1/auth/approle/role/transcendence/role-id" \
  -H "X-Vault-Token: $ROOT_TOKEN" | jq -r .data.role_id)

SECRET_ID=$(curl -sf -X POST "${VAULT_ADDR}/v1/auth/approle/role/transcendence/secret-id" \
  -H "X-Vault-Token: $ROOT_TOKEN" | jq -r .data.secret_id)

echo ""
echo "================================================================"
echo " APPROLE CREDENTIALS — add to your production environment"
echo "================================================================"
echo ""
echo " VAULT_ROLE_ID=$ROLE_ID"
echo " VAULT_SECRET_ID=$SECRET_ID"
echo ""
echo " Export on the VPS before starting the stack, or put in .env:"
echo "   export VAULT_ROLE_ID=$ROLE_ID"
echo "   export VAULT_SECRET_ID=$SECRET_ID"
echo "================================================================"
echo ""
echo "Next steps:"
echo "  1. Seed secrets:"
echo "     VAULT_TOKEN=$ROOT_TOKEN make vault-seed FILE=~/transcendence-secrets.env"
echo "  2. Start the prod stack:"
echo "     make prod"
