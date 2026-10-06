#!/usr/bin/env bash
# .devcontainer/post-start.sh
# Runs every time container starts - lightweight setup

set -euo pipefail

echo "🔄 [post-start] Starting development session..."

cd /workspaces/EdLove

# Ensure pnpm is in PATH
export PNPM_HOME="/home/node/.local/share/pnpm"
export PATH="${PNPM_HOME}:${PATH}"

# Verify pnpm lockfile integrity (fast check)
if [ -f pnpm-lock.yaml ]; then
  echo "🔍 [post-start] Verifying lockfile..."
  pnpm install --frozen-lockfile --prefer-offline 2>/dev/null || echo "  (offline install failed, will retry online on first pnpm command)"
fi

# Start Supabase if config exists (for local DB development)
if [ -f apps/gurudevi-mobile/supabase/config.toml ]; then
  echo "🐘 [post-start] Supabase config found - run 'supabase start' manually if needed"
fi

# Show available commands
echo ""
echo "📋 Quick commands:"
echo "  pnpm dev                          # Start all dev servers"
echo "  pnpm --filter gurudevi-mobile dev:no-doppler  # Mobile without Doppler"
echo "  pnpm --filter gurudevi-mobile web # Web at http://localhost:8081"
echo "  pnpm check-types && pnpm lint && pnpm test    # Quality gates"
echo "  pnpm --filter gurudevi-mobile build:web       # Build web export"
echo "  supabase start                    # Start local Supabase (if configured)"
echo ""
echo "🌐 Ports forwarded:"
echo "  8081   → Metro Bundler"
echo "  19000  → Expo Dev Server"
echo "  54321  → Supabase API"
echo "  54322  → Supabase DB"
echo "  54323  → Supabase Studio"
echo ""
echo "Happy coding! 🚀"