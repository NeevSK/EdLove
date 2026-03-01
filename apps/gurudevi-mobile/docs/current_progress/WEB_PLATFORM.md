# Gurudevi Web Platform — SSOT
*Last updated: 2026-03-01 | Status: Pre-Release (white screen fix pending)*

This is the **single source of truth** for everything related to deploying, maintaining, and enhancing the Gurudevi web app. All future web decisions are anchored here.

---

## 1. Architecture

### Entry Point
- `package.json → "main": "index.ts"` → `App.tsx` via `registerRootComponent(App)`
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
- [ ] `App.tsx` — `NavigationContainer` `linking` config for URL-based deep links (Pattern C, `Platform.OS === 'web'` only)
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
| `EXPO_PUBLIC_SUPABASE_URL` | GH Secret `SUPABASE_URL` | ✅ Yes |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | GH Secret `SUPABASE_ANON_KEY` | ✅ Yes |
| `EXPO_PUBLIC_POSTHOG_API_KEY` | GH Secret `POSTHOG_API_KEY` | Optional |
| `EXPO_PUBLIC_POSTHOG_HOST` | GH Secret `POSTHOG_HOST` | Optional |
| `EXPO_PUBLIC_SENTRY_DSN` | GH Secret `SENTRY_DSN` | Optional |
| `SENTRY_AUTH_TOKEN` | GH Secret `SENTRY_AUTH_TOKEN` | Optional |

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
