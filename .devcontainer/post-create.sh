#!/usr/bin/env bash
# .devcontainer/post-create.sh
# Runs once after container creation - heavy setup tasks

set -euo pipefail

echo "🚀 [post-create] Setting up Polymath Platform development environment..."

# Ensure we're in the workspace
cd /workspaces/EdLove

# Install dependencies (uses cached node_modules if available)
echo "📦 [post-create] Installing dependencies..."
pnpm install --frozen-lockfile --fetch-timeout 120000

# Generate Android native code (if not already generated)
if [ ! -d "apps/gurudevi-mobile/android" ]; then
  echo "🤖 [post-create] Generating Android native project..."
  cd apps/gurudevi-mobile
  pnpm exec expo prebuild --no-install --platform android
  cd /workspaces/EdLove
fi

# Install Playwright browsers
echo "🌐 [post-create] Installing Playwright browsers..."
cd apps/gurudevi-mobile
pnpm exec playwright install --with-deps chromium
cd /workspaces/EdLove

# Generate types for Astro apps (edlove-web, gurudevi-marketingWeb)
echo "🔮 [post-create] Generating Astro types..."
for app in apps/edlove-web apps/gurudevi-marketingWeb; do
  if [ -d "$app" ]; then
    echo "  → $app"
    cd "$app"
    pnpm run astro:sync 2>/dev/null || echo "    (astro:sync not available or failed)"
    cd /workspaces/EdLove
  fi
done

# Verify toolchain
echo "🔧 [post-create] Verifying toolchain..."
node scripts/check-toolchain.mjs

echo "✅ [post-create] Development environment ready!"
echo ""
echo "Next steps:"
echo "  - Run 'pnpm dev' to start development servers"
echo "  - Run 'pnpm --filter gurudevi-mobile dev:no-doppler' for mobile without Doppler"
echo "  - Run 'pnpm --filter gurudevi-mobile web' for web at localhost:8081"
echo "  - Run 'pnpm check-types && pnpm lint && pnpm test' for quality gates"