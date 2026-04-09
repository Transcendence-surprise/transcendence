#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/.."

services=(
  "backend/core"
  "backend/auth"
  "backend/gateway"
  "backend/migration"
  "backend/game"
)

echo "🛠️  Fixing npm audit issues in backend services..."

for svc in "${services[@]}"; do
  echo "-------------------------------"
  echo "📂 Entering $svc"
  cd "$REPO_ROOT/$svc"
  
  echo "🔧 Installing dependencies (just in case)..."
  npm install

  echo "🩺 Running npm audit fix..."
  npm audit fix || echo "⚠️ Some issues could not be fixed automatically in $svc"

  echo "✅ Done with $svc"
done

echo "✅✅✅ Finished running npm audit fix for all backend services!"