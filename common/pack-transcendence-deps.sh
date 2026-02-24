#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/.."
DB_ENTITIES_DIR="$REPO_ROOT/common/db-entities"

services=("backend/core" "backend/auth" "backend/migration")

err() { echo "pack-transcendence-deps.sh: Error: $*" >&2; }
trap 'err "pack failed"; exit 1' ERR

cd "$DB_ENTITIES_DIR"

npm install
npm run build

for svc in "${services[@]}"; do
	dest="$REPO_ROOT/$svc/db-entities-dist"
	tmp="$dest.tmp.$$"

	rm -rf "$tmp"
	mkdir -p "$tmp"

	cp -a dist/. "$tmp/"
	cp -a package.json "$tmp/"

	rm -rf "$dest"
	mv "$tmp" "$dest"
done

echo "✅ db-entities dist copied to core, auth, and migration."
