#!/bin/bash
set -e

echo "🔧 Rebuilding native modules for Alpine Linux..."
cd /app
pnpm rebuild bcrypt

echo "✅ Native modules rebuilt successfully"

echo "🚀 Starting NestJS in development mode..."
cd /app/apps
exec "$@"
