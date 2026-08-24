---
title: "Gurudevi Web Platform â€” SSOT"
status: "active"
created: 2026-03-04
updated: 2026-08-13
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile]
---

# Gurudevi Web Platform — SSOT
*Last updated: 2026-03-01 | Status: ✅ LIVE — all critical fixes applied, build verified (0 import.meta)*

This is the **single source of truth** for everything related to deploying, maintaining, and enhancing the Gurudevi web app. All future web decisions are anchored here.

---

## 1. Architecture

-### Entry Point
- `package.json → "main": "expo-router/entry"` boots the file-based route tree under `app/`
- Expo Router owns the live web and native route graph
- `app.json` keeps the Expo Router plugin enabled for the live route system
- `app.json → expo.web.bundler: "metro"` is mandatory for Expo SDK 50+
- Nested layouts and divergent web/mobile shells are built with Expo Router route groups, layout files, and `.web.tsx` variants.
- If a screen needs different structure on web, prefer a web-specific route or layout boundary rather than reintroducing a navigator shell.

### Build Command
```bash
cd apps/gurudevi-mobile
pnpm build:web   # → expo export -p web --output-dir dist
```
Produces a **static site** in `apps/gurudevi-mobile/dist/` served from any static host.

### Hosting
- **GitHub Pages** → `app.gurudevi.edlove.org` (custom domain via `public/CNAME`)
- Deployed by `.github/workflows/web-deploy.yml`
  - Uses `actions/configure-pages@v4`, `actions/upload-pages-artifact@v3`, `actions/deploy-pages@v4`
  - Manual trigger (`workflow_dispatch`) supported on any branch
  - Auto-deploys `production` on push to `main`; `preview` on PR/other branches

### Metro Config (`metro.config.js`)
- `getSentryExpoConfig(projectRoot, { isCSSEnabled: true })` — required for CSS and web stylesheets
- `resolveRequest` shim system: redirects native-only packages to web no-ops for `platform === 'web'`
- `blockList` prevents packages finding duplicate React inside workspace packages

### Babel Config (`babel.config.js`)
- `unstable_transformImportMeta: true` — **required** for web builds
  - `zustand@5` and similar packages ship pre-compiled code that contains `import.meta.env.MODE`
  - Metro serves the web bundle as a classic `<script>` (no `type="module"`), so bare `import.meta`
    causes `SyntaxError: Cannot use 'import.meta' outside a module`
  - This option rewrites every `import.meta` → `globalThis.__ExpoImportMetaRegistry` (set up by
    Expo's winter runtime before the app boots) — fixes the crash with zero output-format change

---

## 2. Web Compatibility Map — Full Audit (2026-03-01)

| Package | Web Status | Fix Applied | Pattern |
|---|---|---|---|
| `@sentry/react-native` | ❌ Native only | ✅ Shimmed → `src/shims/sentry-web.js` | B (Metro resolveRequest) |
| `posthog-react-native` | ❌ Native only | ✅ Shimmed → `src/shims/posthog-web.js` | B (Metro resolveRequest) |
| `react-native-mmkv` | ❌ Native only | ✅ `Platform.OS === 'web'` guard → AsyncStorage fallback | C (inline guard) in `packages/core/src/lib/storage.ts` |
| `@shopify/react-native-skia` | ⚠ WASM setup needed | ✅ `.web.tsx` fallbacks exist | A (platform file pair) |
| `@shopify/flash-list` | ⚠ Native recycler | ✅ `SanctuaryFlashList.web.tsx` → FlatList | A (platform file pair) |
| `expo-haptics` | ✅ Official web no-op | ✅ No change needed | — |
| `expo-blur` | ✅ Works on web | ✅ No change needed | — |
| `expo-image-picker` | ✅ Works on web | ✅ No change needed | — |
| `expo-image-manipulator` | ✅ Works on web | ✅ No change needed | — |
| `expo-clipboard` | ✅ Works on web | ✅ No change needed | — |
| `expo-device` | ✅ Returns null safely | ✅ Guarded in DeviceUtils | — |
| `@react-native-community/netinfo` | ✅ Works on web | ✅ No change needed | — |
| `react-native-reanimated` | ✅ CSS fallbacks built-in | ✅ Babel plugin already present in `babel.config.js` | — |
| `react-native-gesture-handler` | ✅ Ships own web entry | ✅ No change needed | — |
| `expo-audio` | ⚠ Playback OK, recording limited | ✅ `setAudioModeAsync` + `requestRecordingPermissionsAsync` guarded with `Platform.OS !== 'web'` in `VoiceJournaling.tsx` | C |
| `expo-camera` | ❌ Native only | ✅ `ScannerModal.web.tsx` fallback (paste-QR UI) | A |
| `@react-native-ml-kit/barcode-scanning` | ❌ Native only | ✅ Already lazy `try/catch require` in ScannerModal | — won't crash |
| `@react-native-ml-kit/text-recognition` | ❌ Native only | Scanner/OCR unavailable on web by design | — |
| `expo-file-system/legacy` | ❌ No web impl | ✅ Guard with `Platform.OS !== 'web'` → `fetch+arrayBuffer` | C |
| **`zustand@5`** | ⚠ Ships `import.meta.env.MODE` | ✅ `unstable_transformImportMeta: true` in `babel.config.js` rewrites to `globalThis.__ExpoImportMetaRegistry` | Babel transform |

### `.web.tsx` Overrides in Place
| Component | Native version | Web version |
|---|---|---|
| `LivingCard` | Skia canvas with subsurface scattering | Plain `<View>` with phase-aware background color |
| `NoiseOverlay` | Skia film grain texture | `null` (decorative, not critical) |
| `TemporalGlass` | Skia luminous phase-aware border | CSS `borderColor` from PHASE_BORDER map |
| `SanctuaryFlashList` | `@shopify/flash-list` recycler | `FlatList` |
| `ScannerModal` | `expo-camera` + ML Kit OCR | Elegant paste-QR fallback (Vellum bg, Saffron icon) |
| `WelcomeScreen` | Mobile-style centred card | Two-column split-panel landing page |
| `app/(tabs)` layout | Bottom tab bar | Fixed left sidebar (220px, collapsible to 64px) |

---

## 3. Completed Fixes (as of 2026-03-01)

All P0 and most P1/P2 items are now resolved:

### P0 — Resolved
- [x] `ScannerModal.web.tsx` — elegant paste-QR fallback
- [x] `babel.config.js` — `unstable_transformImportMeta: true` fixes zustand `import.meta` crash

### P1 — Resolved
- [x] `app.json` — PWA manifest: `name`, `shortName`, `display: "standalone"`, `themeColor`, `backgroundColor`, `description`
- [x] `dist/CNAME` — `app.gurudevi.edlove.org` included after `pnpm build:web`
- [x] `public/index.html` — canonical link, format-detection, mobile-web-app-capable, apple-mobile-web-app-*, application-name, on-brand noscript
- [x] `public/robots.txt` — created with allow/disallow rules

### P2 — Resolved
- [x] Root route layouts — URL-based deep links and `document.title` follow the active pathname
- [x] `AuthScreen.tsx` — `autoComplete` + `textContentType` on email/password fields
- [x] `AuthScreen.tsx` — OAuth `redirectTo` fixed to `window.location.origin`
- [x] `SanctuaryCard.tsx` — hover: `cursor: 'pointer'` via `hoverStyle`
- [x] `VoiceJournaling.tsx` — `setAudioModeAsync` + `requestRecordingPermissionsAsync` guarded for web
- [x] `NetworkStatusBanner.tsx` — safe-area `insets.top` guarded for web
- [x] `CommandPalette.tsx` — `pointerEvents` moved from prop to `style`
- [x] `app/(tabs)/_layout.web.tsx` — sidebar has `accessibilityRole="navigation"` + `accessibilityLabel`
- [x] `useQRDeepLink.ts` — documented web no-op behaviour

### P3 — Completed
- [x] Community post share → `expo-clipboard` + Web Share API in `PostCard.tsx` (share button added)
- [x] Profile linktree "Copy/Share Profile Link" → `ContactLinktree.tsx` (Web Share API + clipboard fallback)
- [x] `ProfileScreen.tsx` — `CARD_WIDTH` now reactive via `useWindowDimensions` (responds to browser resize)
- [x] `app.json` — removed duplicate `description` field (was causing two `<meta name="description">` in dist)

### P4 — Future
- [ ] PWA service worker / offline support via Workbox
- [ ] Tree shaking (experimental in SDK 52) — reduce 7.2 MB bundle
- [ ] Lighthouse audit — target <3s load, >90 Performance

---

## 4. Patterns Reference

*Per `AGENT_PROMPT_LENS.md — WEB PLATFORM INVARIANTS`*

| Pattern | When to use | Example |
|---|---|---|
| **A** — `.web.tsx` platform file | Components you OWN that import native-only packages | `ScannerModal.web.tsx`, `SanctuaryFlashList.web.tsx` |
| **B** — Metro `resolveRequest` shim | Third-party packages you can't modify | `@sentry/react-native` → `sentry-web.js` |
| **C** — `Platform.OS` guard | In-source conditional for shared files | `storage.ts` MMKV bypass, `VoiceJournaling.tsx` audio guard |
| **Babel** — `unstable_transformImportMeta` | Third-party packages that use `import.meta` | zustand@5 → `globalThis.__ExpoImportMetaRegistry` |

---

## 5. Environment Variables (Required at Build Time)

| Variable | Source | Required? |
|---|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Doppler `gurudevi-mobile` config | ✅ Yes |
| `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Doppler `gurudevi-mobile` config | ✅ Yes |
| `EXPO_PUBLIC_POSTHOG_API_KEY` | Doppler `gurudevi-mobile` config | Optional |
| `EXPO_PUBLIC_POSTHOG_HOST` | Doppler `gurudevi-mobile` config | Optional |
| `EXPO_PUBLIC_SENTRY_DSN` | Doppler `gurudevi-mobile` config | Optional |
| `SENTRY_AUTH_TOKEN` | Doppler protected CI config | Optional |

---

## 6. Supabase Auth — Web-Specific Config

1. **Authentication → URL Configuration → Site URL:** `https://app.gurudevi.edlove.org`
2. **Redirect URLs allowlist:** `https://app.gurudevi.edlove.org/**`
3. **Google OAuth Origins:** Add `https://app.gurudevi.edlove.org` in Google Cloud Console

> ⚠ Without steps 1 & 2, OAuth login will fail on production web.

---

## 7. Verification Protocol

After any web change, run and confirm all green:

```bash
cd apps/gurudevi-mobile
EXPO_PUBLIC_SUPABASE_URL=... EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=... pnpm build:web
npx -y serve dist -l 4000
# Manual checks at http://localhost:4000:
```

| Check | Expected |
|---|---|
| Page load | WelcomeScreen or LoginScreen renders (NOT blank white) |
| DevTools Console | Zero uncaught SyntaxErrors / TypeErrors |
| `dist/CNAME` exists | Contains `app.gurudevi.edlove.org` |
| Scanner screen | Shows elegant paste-QR fallback UI |
| Auth form | `autoComplete` works; Enter key submits |
| Chrome → Address bar | Install app icon appears (PWA manifest present) |
| `dist/robots.txt` exists | Correct allow/disallow rules |

---

## 8. Community Best Practices (Research Summary, 2026-03-01)

- **Pattern A is the gold standard** — `.web.tsx` files universally recommended for components you own
- **Reanimated works on web** — CSS-backed, Babel plugin is enough
- **expo-haptics is a no-op on web** — no shim needed
- **PWA via app.json is free** — `display: "standalone"`, `themeColor` generate manifest with zero deps
- **Hover via `Pressable`** — `onHoverIn`/`onHoverOut` are official react-native-web APIs
- **Keyboard events** — `onKeyDown`/`onKeyUp` supported on web via `View` and `Pressable`
- **URL deep links on web** — React Navigation maps screen names to URL paths automatically
- **Clipboard on web** — `expo-clipboard.setStringAsync` works; `getString` is browser-restricted
- **`import.meta` in classic scripts** — guard with `unstable_transformImportMeta: true`; affects any package that uses Vite-style env detection

---

*Maintained by: AI Agent + Architect (Naveen)*
*Update this file whenever a new native package is added, a .web.tsx is created, or web config changes.*


This is the **single source of truth** for everything related to deploying, maintaining, and enhancing the Gurudevi web app. All future web decisions are anchored here.

---

## 1. Architecture

### Entry Point
- `package.json → "main": "expo-router/entry"` boots the route tree under `app/`
- Uses **classic Expo entry**, NOT expo-router file-based routing
- `expo-router` plugin is intentionally absent from `app.json` — adding it breaks web silently
- `app.json → expo.web.bundler: "metro"` is mandatory for Expo SDK 50+

### Build Command
```bash
cd apps/gurudevi-mobile
pnpm build:web   # → expo export -p web --output-dir dist
```
Produces a **static site** in `apps/gurudevi-mobile/dist/` served from any static host.

### Hosting
- **GitHub Pages** → `app.gurudevi.edlove.org` (custom domain via `public/CNAME`)
- Deployed by `.github/workflows/web-deploy.yml`
  - Uses `actions/configure-pages@v4`, `actions/upload-pages-artifact@v3`, `actions/deploy-pages@v4`
  - Manual trigger (`workflow_dispatch`) supported on any branch
  - Auto-deploys `production` on push to `main`; `preview` on PR/other branches

### Metro Config (`metro.config.js`)
- `getSentryExpoConfig(projectRoot, { isCSSEnabled: true })` — required for CSS and web stylesheets
- `resolveRequest` shim system: redirects native-only packages to web no-ops for `platform === 'web'`
- `blockList` prevents packages finding duplicate React inside workspace packages

---

## 2. Web Compatibility Map — Full Audit (2026-03-01)

| Package | Web Status | Fix Applied | Pattern |
|---|---|---|---|
| `@sentry/react-native` | ❌ Native only | ✅ Shimmed → `src/shims/sentry-web.js` | B (Metro resolveRequest) |
| `posthog-react-native` | ❌ Native only | ✅ Shimmed → `src/shims/posthog-web.js` | B (Metro resolveRequest) |
| `react-native-mmkv` | ❌ Native only | ✅ `Platform.OS === 'web'` guard → AsyncStorage fallback | C (inline guard) in `packages/core/src/lib/storage.ts` |
| `@shopify/react-native-skia` | ⚠ WASM setup needed | ✅ `.web.tsx` fallbacks exist | A (platform file pair) |
| `@shopify/flash-list` | ⚠ Native recycler | ✅ `SanctuaryFlashList.web.tsx` → FlatList | A (platform file pair) |
| `expo-haptics` | ✅ Official web no-op | ✅ No change needed | — |
| `expo-blur` | ✅ Works on web | ✅ No change needed | — |
| `expo-image-picker` | ✅ Works on web | ✅ No change needed | — |
| `expo-image-manipulator` | ✅ Works on web | ✅ No change needed | — |
| `expo-clipboard` | ✅ Works on web | ✅ No change needed | — |
| `expo-device` | ✅ Returns null safely | ✅ Guarded in DeviceUtils | — |
| `@react-native-community/netinfo` | ✅ Works on web | ✅ No change needed | — |
| `react-native-reanimated` | ✅ CSS fallbacks built-in | ✅ Babel plugin already present in `babel.config.js` | — |
| `react-native-gesture-handler` | ✅ Ships own web entry | ✅ No change needed | — |
| `expo-audio` | ⚠ Playback OK, recording limited | Guard `requestRecordingPermissionsAsync` with `Platform.OS !== 'web'` | C |
| **`expo-camera`** | ❌ Native only | ❌ **NOT YET FIXED — ROOT CAUSE OF WHITE SCREEN** | **A → `ScannerModal.web.tsx` needed** |
| `@react-native-ml-kit/barcode-scanning` | ❌ Native only | ✅ Already lazy `try/catch require` in ScannerModal | — won't crash |
| `@react-native-ml-kit/text-recognition` | ❌ Native only | Scanner/OCR unavailable on web by design | — |
| `expo-file-system/legacy` | ❌ No web impl | Guard with `Platform.OS !== 'web'` → `fetch+arrayBuffer` | C |

### `.web.tsx` Overrides Already in Place
| Component | Native version | Web version |
|---|---|---|
| `LivingCard` | Skia canvas with subsurface scattering | Plain `<View>` with phase-aware background color |
| `NoiseOverlay` | Skia film grain texture | `null` (decorative, not critical) |
| `TemporalGlass` | Skia luminous phase-aware border | CSS `borderColor` from phase PHASE_EDGES map |
| `SanctuaryFlashList` | `@shopify/flash-list` recycler | `FlatList` |

---

## 3. The White Screen — Root Cause

**`expo-camera` is imported unconditionally at the top of `packages/scanner-kit/src/ScannerModal.tsx`:**

```ts
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera'; // line 3 — CRASHES WEB
```

This throws before React mounts. Everything else was already handled. One file causes the entire app to show a blank white page.

**Fix:** Create `packages/scanner-kit/src/ScannerModal.web.tsx` (Pattern A).

---

## 4. Pending Work

### P0 — Bug Fix (Required for any web functionality)
- [ ] `packages/scanner-kit/src/ScannerModal.web.tsx`
  - Elegant on-brand web fallback (Vellum bg, Saffron icon)
  - Manual QR code paste input with Enter-key submit
  - Dismiss button functional
  - *Note: paste-QR is often better than camera for admin users on desktop*

### P1 — Quick Wins (High impact, low effort)
- [ ] `app.json` — Add PWA manifest fields: `name`, `shortName`, `display: "standalone"`, `themeColor: "#D4843A"`, `backgroundColor: "#F5EDD6"`, `description`
- [ ] Supabase Dashboard — Set Site URL + Redirect URLs to `https://app.gurudevi.edlove.org`
- [ ] Verify `dist/CNAME` is included after `pnpm build:web`

### P2 — Web-Excellence Features
- [ ] Route-group refinements for URL-based deep links and document title behavior as the tree expands
  - `app.gurudevi.edlove.org/auth`, `app.gurudevi.edlove.org/ai`
- [ ] Auth screen — Enter key submits login form (in `ScannerModal.web.tsx` and `AuthScreen.tsx` via `onKeyDown`)
- [ ] `SanctuaryCard` — Hover state via `onHoverIn`/`onHoverOut` (Platform C inline)
  - `hovered && { opacity: 0.92, transform: [{ scale: 1.01 }] }`
- [ ] Community post share — Web uses `expo-clipboard` to copy link URL instead of native Share sheet (Pattern C)
- [ ] Profile linktree — "Copy Link" copies `window.location.href` on web

### P3 — Future Consideration
- [ ] PWA service worker / offline support via Workbox (disabled by default in Expo SDK 39+)
- [ ] Tree shaking (experimental in SDK 52) — reduce bundle size
- [ ] Lighthouse audit — target <3s load time, >90 Performance score

---

## 5. Patterns Reference

*Per `AGENT_PROMPT_LENS.md — WEB PLATFORM INVARIANTS`*

| Pattern | When to use | Example |
|---|---|---|
| **A** — `.web.tsx` platform file | Components you OWN that import native-only packages | `ScannerModal.web.tsx`, `SanctuaryFlashList.web.tsx` |
| **B** — Metro `resolveRequest` shim | Third-party packages you can't modify | `@sentry/react-native` → `sentry-web.js` |
| **C** — `Platform.OS` guard | In-source conditional for shared files | `storage.ts` MMKV bypass, community share handler |

---

## 6. Environment Variables (Required at Build Time)

| Variable | Source | Required? |
|---|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Doppler `gurudevi-mobile` config | ✅ Yes |
| `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Doppler `gurudevi-mobile` config | ✅ Yes |
| `EXPO_PUBLIC_POSTHOG_API_KEY` | Doppler `gurudevi-mobile` config | Optional |
| `EXPO_PUBLIC_POSTHOG_HOST` | Doppler `gurudevi-mobile` config | Optional |
| `EXPO_PUBLIC_SENTRY_DSN` | Doppler `gurudevi-mobile` config | Optional |
| `SENTRY_AUTH_TOKEN` | Doppler protected CI config | Optional |

---

## 7. Supabase Auth — Web-Specific Config

1. **Authentication → URL Configuration → Site URL:** `https://app.gurudevi.edlove.org`
2. **Redirect URLs allowlist:** `https://app.gurudevi.edlove.org/**`
3. **Google OAuth Origins:** Add `https://app.gurudevi.edlove.org` in Google Cloud Console

> ⚠ Without step 1 & 2, OAuth login will fail on production web. Works locally because Supabase defaults to localhost.

---

## 8. Verification Protocol

After any web change, run and confirm all green:

```powershell
cd apps/gurudevi-mobile
pnpm build:web 2>&1 | Out-File -Encoding utf8 build.log
# Check build.log for errors

npx -y serve dist -l 4000
# Manual checks at http://localhost:4000:
```

| Check | Expected |
|---|---|
| Page load | WelcomeScreen or LoginScreen renders (NOT blank white) |
| DevTools Console | Zero uncaught TypeErrors |
| `dist/CNAME` exists | Contains `app.gurudevi.edlove.org` |
| Scanner screen | Shows elegant paste-QR fallback UI |
| Auth form | Enter key submits (after P2 work) |
| Chrome → Address bar | Install app icon appears (after PWA manifest added) |

---

## 9. Community Best Practices (Research Summary, 2026-03-01)

- **Pattern A is the gold standard** — `.web.tsx` files are universally recommended over runtime shims for components you own
- **Reanimated works on web** — CSS-backed, Babel plugin is enough, no special config
- **expo-haptics is a no-op on web** — no shim needed (official Expo behavior)
- **PWA via app.json is free** — `display: "standalone"`, `themeColor` etc. generate manifest with zero dependencies  
- **Hover via `Pressable`** — `onHoverIn`/`onHoverOut` are official react-native-web APIs
- **Keyboard events** — `onKeyDown`/`onKeyUp` supported on web via `View` and `Pressable`
- **URL deep links on web = free shareability** — React Navigation maps screen names to URL paths automatically
- **Clipboard on web** — `expo-clipboard.setStringAsync` works; `getString` is browser-restricted

---

*Maintained by: AI Agent + Architect (Naveen)*  
*Update this file whenever a new native package is added, a .web.tsx is created, or web config changes.*
