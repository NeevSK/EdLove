---
title: "EAS Build Setup for Gurudevi Mobile"
status: "active"
created: 2026-02-17
updated: 2026-02-17
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile]
---

# EAS Build Setup for Gurudevi Mobile

## Problem Statement
Local builds are slow and error-prone. The monorepo uses pnpm which requires special handling. Need a reliable cloud build solution using EAS Build.

## User Review Required

> [!IMPORTANT]
> **Build Strategy Decision**
> - **Development builds**: Fast iteration, includes dev client
> - **Preview builds**: APK for testing (Android), Ad-hoc distribution (iOS)
> - **Production builds**: App Store/Play Store submission
> 
> We'll configure all three profiles with pnpm support.

## Proposed Changes

### EAS Configuration

#### [MODIFY] [eas.json](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/eas.json)

Add comprehensive build profiles:
- **development**: Fast builds with dev client for testing
- **preview**: APK/Ad-hoc builds for stakeholder testing
- **production**: Optimized store builds

Configure pnpm-specific settings:
- Use pnpm instead of npm
- Enable proper workspace resolution
- Configure caching for faster builds

---

### Package Configuration

#### [MODIFY] [package.json](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/package.json)

Add EAS build scripts:
- `build:dev` - Development build
- `build:preview` - Preview APK/IPA
- `build:prod` - Production build
- `submit:android` - Submit to Play Store
- `submit:ios` - Submit to App Store

---

### Monorepo Support

#### [NEW] [.easignore](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/.easignore)

Exclude unnecessary files from upload to speed up builds:
- Node modules (will be installed fresh)
- Build artifacts
- Cache directories

#### [NEW] [.npmrc](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/.npmrc)

Configure pnpm for EAS Build compatibility:
- Enable hoisting for Expo compatibility
- Set strict peer dependencies handling

## Verification Plan

### Build Testing
1. Run `eas build --profile development --platform android` to test dev build
2. Verify build completes without errors
3. Test the resulting build on a device
4. Check build time (should be ~10-15 minutes for first build, ~5-8 for cached)

### Production Readiness
1. Ensure environment variables are configured in EAS
2. Verify signing credentials are set up
3. Test preview build before production
4. Document the build process for team
