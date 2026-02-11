#!/bin/bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/.."
DB_ENTITIES_DIR="$REPO_ROOT/common/db-entities"

echo "Building db-entities..."
cd "$DB_ENTITIES_DIR"
npm install
npm run build

echo "Copying dist to backend services..."

# list of services that should receive the packaged db-entities
services=("backend/core" "backend/auth")

# tolerate empty dist/ (avoid cp errors)
shopt -s nullglob
for svc in "${services[@]}"; do
	echo "  → $svc"
	dest="$REPO_ROOT/$svc/db-entities-dist"
	rm -rf "$dest"
	mkdir -p "$dest"
	files=(dist/*)
	if (( ${#files[@]} )); then
		cp -r "${files[@]}" "$dest/"
	fi
	cp package.json "$dest/"
done
shopt -u nullglob

echo "✅ db-entities dist copied to core and auth."
