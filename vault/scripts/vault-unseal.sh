#!/usr/bin/env bash
# Apply one unseal key to Vault. Run 3 times with 3 different keys to unseal.
# Usage: ./vault-unseal.sh <unseal-key>
#        make vault-unseal KEY=<unseal-key>
set -euo pipefail

VAULT_ADDR="${VAULT_ADDR:-http://127.0.0.1:8200}"

if [ $# -eq 0 ] || [ -z "$1" ]; then
  echo "Usage: $0 <unseal-key>"
  exit 1
fi

for cmd in curl jq; do
  if ! command -v "$cmd" &>/dev/null; then
    echo "ERROR: '$cmd' is required."
    exit 1
  fi
done

RESULT=$(curl -sf -X POST "${VAULT_ADDR}/v1/sys/unseal" \
  -H "Content-Type: application/json" \
  -d "{\"key\": \"$1\"}")

SEALED=$(echo "$RESULT" | jq -r .sealed)
PROGRESS=$(echo "$RESULT" | jq -r .progress)
THRESHOLD=$(echo "$RESULT" | jq -r .t)

if [ "$SEALED" = "false" ]; then
  echo "Vault is UNSEALED and ready."
else
  echo "Unseal progress: $PROGRESS / $THRESHOLD keys provided. Run again with another key."
fi
