---
title: "Quick Start Commands"
status: "active"
created: 2026-02-11
updated: 2026-02-11
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile]
---

# Quick Start Commands

> **Copy-paste ready commands** for daily development 🚀

## 📱 Development

```bash
# Start dev server
npx expo start

# Start with clear cache (recommended when errors appear)
npx expo start --clear

# Run on specific platform
npx expo start --ios
npx expo start --android
```

## 🔍 Check Health

```bash
# Check TypeScript errors
npx tsc --noEmit

# Check package health
npx expo-doctor

# Check for security issues
pnpm audit
```

## 📦 Package Management

```bash
# Install all dependencies
pnpm install

# Add new package
pnpm add <package-name>

# Add native module (use Expo's installer for compatibility)
pnpm exec expo install <package-name>

# See installed packages
pnpm list --depth=0

# Check for updates (but don't update yet!)
pnpm outdated
```

## 🔧 Troubleshooting

```bash
# Clear all caches (fixes 90% of weird issues)
npx expo start --clear

# Nuclear option - full reset
rm -rf node_modules
pnpm install
npx expo start --clear

# Check what's wrong
git status
git diff
npx tsc --noEmit
```

## 🌳 Git Workflow

```bash
# Check current status
git status

# See changes
git diff

# Stage and commit
git add .
git commit -m "feat: your message here"

# Create new branch
git checkout -b feature/feature-name

# Switch branches
git checkout main
git checkout foundation/phase-1-complete

# Push to remote
git push origin <branch-name>
```

## 📝 Common Tasks

### Add a new translation
```bash
# 1. Edit these files:
# - src/i18n/locales/si.json
# - src/i18n/locales/ta.json
# - src/i18n/locales/en.json

# 2. Use in component:
# {t('your.new.key')}
```

### Change theme colors
```bash
# Edit: src/constants/Theme.ts
# Find: sanctuarySaffron: '#E67E22'
# Change color → entire app updates!
```

### Check if app works
```bash
npx expo start --clear    # Start fresh
npx tsc --noEmit          # Check types
git status                # See what changed
```

---

**Tip:** Bookmark this file! Open it whenever you need quick commands.
