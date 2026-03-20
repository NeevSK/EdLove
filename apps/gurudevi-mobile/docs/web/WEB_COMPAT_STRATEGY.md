# Gurudevi Web Compatibility — Architecture Decision Record

> **Audience:** Any developer, architect, or AI agent working on this codebase.
> **Purpose:** Captures *why* the web strategy works the way it does, *what* needs dual files and what doesn't, the complete status of what's done vs remaining, and the rules for every new file added.
> **Last updated:** March 2026

---

## 1. The Core Question (The One You Came Here For)

> **"Do I have to write every screen twice?"**

**No. You write business logic exactly once.**

Only components that talk to *native hardware or native graphics APIs* need a second file. Everything else — auth flows, CRUD, state, forms, lists, modals — runs identically on both platforms without any extra file.

The complete list of things that genuinely need two files is **10 files across the entire codebase**, enumerated in Section 4. There are 21+ screens and all of them work on web without a `.web.tsx`.

---

## 2. Why This Approach (Not Expo Router)

### 2a. What we have: React Navigation + Metro `.web.tsx`

The app uses React Navigation v7 with Metro as the web bundler. Metro has a built-in platform-resolution rule:

```
import X from './Foo'
→ Metro first looks for:  Foo.web.tsx  (on web platform)
→ Falls back to:          Foo.tsx      (if no .web.tsx)
```

This means a `.web.tsx` file *completely replaces* its `.tsx` counterpart on web. The native file is never loaded. There is no inheritance or merging — it's full replacement.

### 2b. What Expo Router is

Expo Router v4 (SDK 52+) is file-based routing built *on top of* React Navigation. The file system becomes the route map. It also enables static HTML output (`output: 'static'` in app.json) for SEO.

### 2c. The honest TCO comparison

| | Current (React Nav + `.web.tsx`) | Expo Router |
|---|---|---|
| **New screen cost** | 1 file in 99% of cases | 1 file in 99% of cases |
| **Nav chrome** | 1 `.web.tsx` override total (done) | 1 `_layout.tsx` handles both |
| **Deep links** | Manual `LinkingOptions` config in App.tsx | Automatic (file path = URL) |
| **SEO** | SPA — blank HTML, JS renders everything | Static HTML per route possible |
| **Migration cost from here** | 0 (already here) | ~2–3 eng-weeks (55 `navigate()` call sites, 5 stack navigators, all packages need `useLocalSearchParams` swap) |
| **Risk** | Low — working today | Medium — all 5 packages (`@repo/classroom`, `@repo/community`, etc.) use `useNavigation()` internally |
| **Web UI flexibility** | ✅ Full — `.web.tsx` can be anything | ✅ Same (`.web.tsx` still works in Expo Router) |

### 2d. The decision

**Stay on current approach** for the following reasons:

1. **The double-file problem is largely a myth.** 10 files out of the entire codebase need a second version. The navigation chrome (`TabNavigator.web.tsx`) is the biggest one, and it's already done.

2. **The migration cost is real.** Every package (`@repo/classroom`, `@repo/community`, `@repo/library`, `@repo/profile`, `@repo/self`) uses `useNavigation()` and `route.params` directly. Migrating them all simultaneously is a multi-week coordinated refactor with real regression risk.

3. **The only real benefit we're leaving on the table is SEO** (static HTML per route). For an app behind auth (teachers, students, principals), SEO is not a meaningful concern today.

4. **If SEO becomes important** — for a public landing page, teacher discovery, school onboarding — the right answer is the existing `apps/gurudevi-marketingWeb` Astro site, not migrating the app router.

### 2e. When to reconsider

Migrate to Expo Router if/when:
- You need per-route static HTML for SEO (not behind auth)
- The team grows and the manual `LinkingOptions` config becomes a maintenance burden
- You're doing a major version bump anyway (SDK upgrade) and can do it together

---

## 3. The Three Patterns (Decision Tree for Every New File)

### Pattern A — `.web.tsx` full replacement

**Use when:** The component/screen uses a native hardware API or native rendering API that has no web equivalent.

```
Foo.tsx         ← native implementation
Foo.web.tsx     ← full web replacement; Metro picks this on web
```

The `.web.tsx` file:
- Has the **same props/interface** as the native file
- Has **same business logic** (or imports it from a shared hook)
- Has **different rendering** — uses browser APIs instead of native modules

### Pattern B — `Platform.OS === 'web'` inline guard

**Use when:** 99% of the component is identical, and only 1–3 lines differ.

```tsx
// ✅ right use of Pattern B
const redirectTo = Platform.OS === 'web'
  ? 'https://app.gurudevi.edlove.org/auth/callback'
  : 'gurudevi://auth/callback';
```

**Do not** use Pattern B to hide large blocks of code. If the web branch is more than ~10 lines, it's a sign Pattern A is needed.

### Pattern C — Metro `WEB_SHIMS` redirect

**Use when:** A native-only *package* is imported at the top of a file that you cannot replace with Pattern A (because the file is shared and serves both platforms).

```js
// metro.config.js WEB_SHIMS entry:
'expo-file-system': path.resolve(projectRoot, 'src/shims/expo-file-system-web.js'),
```

The shim file provides no-ops or browser-native equivalents. It is never a true substitute — it just prevents build crashes when Metro walks the dependency graph.

### Decision tree

```
Adding a new file or feature?
│
├─ Does it use native hardware? (camera, mic, GPS, haptics, accelerometer)
│   ├─ YES → Does the package ship web no-ops already?
│   │         (expo-haptics ✅, expo-location ✅, expo-clipboard ✅)
│   │         └─ YES → Just use it. No extra file needed.
│   │         └─ NO  → Pattern A (.web.tsx)
│   └─ NO  → No extra file needed.
│
├─ Does it use native rendering? (Skia, FlashList, BlurView)
│   ├─ expo-blur ✅ ships CSS backdrop-filter on web → no extra file
│   ├─ @shopify/react-native-skia → Pattern A (.web.tsx) ← DONE
│   └─ @shopify/flash-list → Pattern A (.web.tsx) ← DONE
│
├─ Does it use native media? (expo-av, expo-audio, expo-camera)
│   └─ YES → Pattern A (.web.tsx) ← ALL DONE
│
├─ Does it use native file APIs? (expo-file-system, expo-sharing)
│   └─ YES → Pattern A (.web.tsx) + Pattern C (shim) ← DONE
│
└─ Is it business logic, state, forms, lists, navigation within a screen?
    └─ Use one file. React Native primitives render fine on web via react-native-web.
```

---

## 4. Complete Inventory: What Needs Two Files and What Doesn't

### 4a. Files that DO need (and have) a `.web.tsx`

These are the **10 dual files in the entire codebase**. Once a `.web.tsx` exists, it is complete — you maintain both only if the underlying feature changes.

| File | Why two versions? | Status |
|---|---|---|
| `src/navigation/TabNavigator.tsx` | Native uses `BlurView` bottom tabs; web needs sidebar layout | ✅ Done |
| `src/screens/WelcomeScreen.tsx` | Web has 2-col split-panel; auth logic identical | ✅ Done |
| `src/components/self/VoiceJournaling.tsx` | `expo-audio` JSI hooks → `MediaRecorder` Web API | ✅ Done |
| `packages/library/src/screens/PDFViewerScreen.tsx` | `expo-file-system` → `<iframe>` + `window.open()` | ✅ Done |
| `packages/library/src/screens/VideoPlayerScreen.tsx` | `expo-av` `<Video>` → HTML `<video>` element | ✅ Done |
| `packages/scanner-kit/src/ScannerModal.tsx` | `expo-camera` → manual text input fallback | ✅ Done |
| `packages/ui/src/components-native/LivingCard.tsx` | `@shopify/react-native-skia` → plain `<View>` | ✅ Done |
| `packages/ui/src/components-native/NoiseOverlay.tsx` | Skia grain → `null` (decorative, not critical) | ✅ Done |
| `packages/ui/src/components-native/TemporalGlass.tsx` | Skia border → CSS `borderColor` | ✅ Done |
| `packages/ui/src/components/SanctuaryFlashList.tsx` | `@shopify/flash-list` → `FlatList` | ✅ Done |

**That's the complete list. It will not grow unless a new native hardware/graphics API is added.**

### 4b. Metro shims (Pattern C)

These prevent build crashes from transitive imports. They're in `apps/gurudevi-mobile/src/shims/`.

| Shim | Package it replaces |
|---|---|
| `sentry-web.js` | `@sentry/react-native` |
| `posthog-web.js` | `posthog-react-native` |
| `get-random-values-web.js` | `react-native-get-random-values` |
| `url-polyfill-web.js` | `react-native-url-polyfill/auto` |
| `ml-kit-text-recognition-web.js` | `@react-native-ml-kit/text-recognition` |
| `ml-kit-barcode-scanning-web.js` | `@react-native-ml-kit/barcode-scanning` |
| `expo-file-system-web.js` | `expo-file-system` |
| `expo-sharing-web.js` | `expo-sharing` |

### 4c. Screens that work on web WITHOUT any extra file

All 21 app screens use only React Native primitives (`View`, `Text`, `Pressable`, `ScrollView`, `FlatList`) plus `@repo/ui` and `@repo/core`. These render correctly in the browser via `react-native-web`. **No `.web.tsx` needed, none planned.**

```
src/screens/
  AIAssistantScreen.tsx       ✅ web-safe as-is
  AppSettingsScreen.tsx       ✅ web-safe as-is
  AuthScreen.tsx              ✅ web-safe as-is
  ErrorMessageDemo.tsx        ✅ web-safe as-is
  InvitationWelcomeScreen.tsx ✅ web-safe as-is
  InviteCodeEntry.tsx         ✅ web-safe as-is
  OnboardingScreen.tsx        ✅ web-safe as-is
  ProfileScreen.tsx           ✅ web-safe as-is (Platform.OS guards already in place)
  QRHandlerScreen.tsx         ✅ web-safe as-is
  SchoolCreationScreen.tsx    ✅ web-safe as-is
  SelfScreen.tsx              ✅ web-safe as-is
  ThuthimalClaimScreen.tsx    ✅ web-safe as-is
  community/AnnouncementsScreen.tsx  ✅ web-safe as-is
  profile/FullProfileScreen.tsx      ✅ web-safe as-is
  self/AdminSelfView.tsx      ✅ web-safe as-is
  self/FounderSelfView.tsx    ✅ web-safe as-is
  self/PrincipalSelfView.tsx  ✅ web-safe as-is
  self/PulseDashboard.tsx     ✅ web-safe as-is
  self/StudentSelfView.tsx    ✅ web-safe as-is
  self/TeacherSelfView.tsx    ✅ web-safe as-is
  self/WelcomeScreen.tsx      (has .web.tsx for cosmetic layout only)
```

### 4d. Packages — web-safe status

```
@repo/core        ✅ Pure TypeScript + AsyncStorage. No native modules.
@repo/ui          ✅ React Native primitives + theme. Skia components have .web.tsx.
@repo/classroom   ✅ Business logic only. Uses @repo/ui. Safe.
@repo/community   ✅ Business logic only. Safe.
@repo/library     ✅ PDFViewer/VideoPlayer have .web.tsx. LibraryScreen safe.
@repo/profile     ✅ Safe.
@repo/self        ✅ Safe.
@repo/scanner-kit ✅ ScannerModal.web.tsx exists.
```

---

## 5. Rules for Contributors

### When adding a new screen

1. Write one `.tsx` file.
2. Use React Native primitives — `View`, `Text`, `Pressable`, `ScrollView`, `FlatList`.
3. Test on web with `pnpm web` in `apps/gurudevi-mobile`.
4. ✅ Done. No `.web.tsx` needed.

### When adding a new component that uses native hardware/graphics

1. Check the decision tree in Section 3.
2. If the package ships web no-ops (see packages below) — just use it.
3. If not — create both `Foo.tsx` and `Foo.web.tsx` with identical props interface.
4. Add a `// Web note:` comment at the top of each explaining the split.

### Packages that are web-safe without any extra work

- `expo-haptics` — ships no-ops on web (SDK 44+)
- `expo-blur` — uses CSS `backdrop-filter` on web
- `expo-clipboard` — uses `navigator.clipboard` on web
- `expo-linking` — uses `window.location` on web
- `expo-constants` — works on web
- `expo-font` — works on web
- `expo-linear-gradient` — works on web via CSS
- `react-native-reanimated` — supports web
- `react-native-gesture-handler` — supports web
- `react-native-safe-area-context` — returns 0 insets on web (correct)
- `react-native-svg` — works on web
- `@tanstack/react-query` — platform-agnostic
- All `@repo/*` packages — platform-agnostic

### Packages that need Pattern A or C

- `expo-audio` — no web impl → Pattern A ← DONE
- `expo-av` → Pattern A ← DONE
- `expo-camera` → Pattern A ← DONE
- `expo-file-system` → Pattern A + C ← DONE
- `expo-sharing` → Pattern A + C ← DONE
- `expo-document-picker` — web has partial support (file input); add shim if used
- `@shopify/react-native-skia` → Pattern A ← DONE
- `@shopify/flash-list` → Pattern A ← DONE
- `@sentry/react-native` → Pattern C ← DONE
- `posthog-react-native` → Pattern C ← DONE
- `react-native-mmkv` — uses `require()` inside `storage.ts`, guarded by `Platform.OS === 'web'` → SAFE
- `react-native-nitro-modules` — same guard as above → SAFE

---

## 6. The Maintenance Reality Check

### What "maintaining two files" actually means in practice

The dual files split on a single axis: **hardware/rendering API**. Everything else is shared.

```
TabNavigator.tsx (native)          TabNavigator.web.tsx (web)
─────────────────────────          ─────────────────────────
Same screens registered            Same screens registered
Same role-aware labels             Same role-aware labels
Same auth guards                   Same auth guards
Different chrome:                  Different chrome:
  BlurView bottom tabs               CSS sidebar with collapse
  TemporalGlass background           Phase accent border
```

When a new tab is added → you add it to BOTH files (2-minute change, identical line).
When tab business logic changes → you change it in NEITHER file (it's in the screen component itself).
When the sidebar design changes → you only change `TabNavigator.web.tsx`.
When the bottom tab design changes → you only change `TabNavigator.tsx`.

**The overlap between the two files is the screen list (5 lines). That's the entirety of the "double maintenance".**

### The web-specific files that are truly independent

`WelcomeScreen.web.tsx` — The 2-column landing layout is web-only by nature. You'd never want the native full-screen card on desktop. These files diverge intentionally and rarely need to be kept in sync.

`VideoPlayerScreen.web.tsx` — Uses HTML `<video>` with browser controls. The native version uses expo-av. They implement the same interface but will evolve somewhat independently. This is fine — a browser video player and a native player ARE different products.

---

## 7. Status Dashboard

### ✅ Completed (web-compat work)

| Round | What was done |
|---|---|
| Pre-history | React Navigation + Metro web bundler set up |
| Pre-history | `public/index.html` with full PWA, SEO, temporal CSS |
| Pre-history | `SanctuaryFlashList.web.tsx` (FlatList fallback) |
| Pre-history | Skia component `.web.tsx` fallbacks (LivingCard, NoiseOverlay, TemporalGlass) |
| Pre-history | `ScannerModal.web.tsx` (manual entry fallback) |
| Pre-history | `TabNavigator.web.tsx` (sidebar navigation) |
| Pre-history | `WelcomeScreen.web.tsx` (split-panel landing) |
| Pre-history | Metro shims: sentry, posthog, get-random-values, url-polyfill, ml-kit |
| Pre-history | `babel.config.js` `unstable_transformImportMeta: true` |
| Pre-history | Metro `unstable_enablePackageExports` + CJS condition names |
| Pre-history | `App.tsx` web `LinkingOptions` config |
| Pre-history | `CommandPalette.tsx` (Cmd+K web power feature) |
| Pre-history | `PWAInstallBanner.tsx` |
| Pre-history | `useWebPageTitle.ts` (document.title sync) |
| Round 7 | `VoiceJournaling.web.tsx` (MediaRecorder fallback) |
| Round 7 | `PDFViewerScreen.web.tsx` (`<iframe>` embed) |
| Round 7 | `VideoPlayerScreen.web.tsx` (HTML `<video>`) |
| Round 7 | Metro shims: `expo-file-system`, `expo-sharing` |

### 🔲 Remaining web-compat work

| Item | Priority | Effort | Notes |
|---|---|---|---|
| `expo-document-picker` web shim | Low | 30 min | Used in library upload; `<input type="file">` on web |
| Web-specific keyboard navigation audit | Medium | 2h | Tab key through sidebar, forms |
| `<title>` per-route for modals | Low | 1h | AIAssistant, QRHandler already in ROUTE_LABELS |
| Web deep-link testing pass | Medium | 2h | Verify all `LinkingOptions` routes resolve |
| `FullProfileScreen` web layout check | Low | 1h | Wide-screen reflow — no new file, just check |
| `AppSettingsScreen` web layout check | Low | 30 min | Same |
| `ProfileScreen` web layout check | Low | 1h | Already has Platform.OS guards; verify visually |

### 🚫 Explicitly NOT planned (would require Expo Router)

- Static HTML per route (SEO)
- Per-route `<meta>` tags for social sharing
- Server-side rendering

---

## 8. Future Migration Path to Expo Router

If the team decides to migrate, the work is finite and mechanical:

**Phase 1 — File structure (1 week):**
```
mkdir app/(tabs)
# Move each screen into app/(tabs)/{screen}.tsx
# Replace src/navigation/ stack navigators with app/(tabs)/_layout.tsx
```

**Phase 2 — Navigation calls (1 week, ~55 sites):**
```typescript
// Before (React Navigation)
navigation.navigate('Classroom', { id: 'abc' })
route.params.id

// After (Expo Router)
router.push('/classroom/abc')
const { id } = useLocalSearchParams()
```

**Phase 3 — Package updates (0.5 week):**
All `@repo/*` packages that use `useNavigation()` internally need updating.

**Total: 2–3 weeks, low-risk if done with feature freeze.**

---

## 9. Quick Reference Card

```
NEW SCREEN?
  → Write ONE .tsx file. Done.

NEW COMPONENT WITH NATIVE API?
  → Check: does the package ship web no-ops? (see Section 5)
  → YES: use it directly
  → NO: create .web.tsx with same props, different implementation

NEW NATIVE-ONLY PACKAGE?
  → Add to metro.config.js WEB_SHIMS
  → Create src/shims/{package}-web.js with no-ops or browser equiv

CHANGING EXISTING SCREEN?
  → Change the .tsx file only
  → Only touch .web.tsx if the screen is in the "10 dual files" list

CHANGING BUSINESS LOGIC?
  → One file. Always.
```

---

*This document is the source of truth for web strategy decisions. Update Section 7 when work is completed. Keep Section 4 current when new files are added.*
