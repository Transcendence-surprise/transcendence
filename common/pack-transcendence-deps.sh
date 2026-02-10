#!/bin/bash
set -e

echo "🔨 Building and packing db-entities..."
cd common/db-entities
npm run build
npm pack

TARBALL=$(ls transcendence-db-entities-*.tgz)

echo "📦 Distributing $TARBALL to backend services..."
cp "$TARBALL" ../../backend/core/
cp "$TARBALL" ../../backend/auth/
# cp "$TARBALL" ../backend/game/
# cp "$TARBALL" ../backend/gateway/
# cp "$TARBALL" ../database/

echo "✅ Done! Tarball distributed to all services."
