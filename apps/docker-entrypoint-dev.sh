#!/bin/bash
set -e

echo "🔧 Installing bcrypt with native bindings for Alpine Linux..."
cd /app
pnpm add bcrypt@5.1.1 --force

echo "✅ Native modules installed successfully"

echo "🚀 Starting NestJS in development mode..."
cd /app/apps
exec "$@"
