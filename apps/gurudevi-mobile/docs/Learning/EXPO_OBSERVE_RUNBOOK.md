---
title: "Expo Observe Runbook — EAS Performance Monitoring for Gurudevi Mobile"
status: "active"
created: 2026-08-28
updated: 2026-08-28
author: "Naveen"
scribe: "opencode"
tags: [expo, observe, performance, EAS, TTI, beast]
---

# Expo Observe Runbook — EAS Performance Monitoring for Gurudevi Mobile

> **For Gurudevi Mobile only** (`apps/gurudevi-mobile`). App-specific runbook per `docs/SOP`. Root `docs/` remains for platform-wide playbooks.

---

## 1) What Observe Is (and Isn't)

**Observe** (`expo-observe` + **EAS Observe** service) is Expo's production perf monitor, GA Aug 25 2026 (`expo.dev/solutions/expo-observe`, `docs.expo.dev/eas/observe/*`).

- **Tracks:** cold/warm launch, bundle load, time-to-first-render (TTR), time-to-interactive (TTI), EAS Update download, per-route render/TTI (SDK 56+), `Observe.logEvent` custom events, JS errors (preview, SDK 57+). Stats: median/avg/min/max/p90/p99 + per-release markers + per-session timeline.
- **Does not track (yet):** native crashes (use Sentry `packages/core/src/lib/monitoring/sentry.ts:11`), alerting/webhooks (in progress), session replay/APM/backend tracing. Not available in Expo Go (needs dev/prod build).

**Why we have it plus Sentry + PostHog:**

| System | Owns | Gurudevi location |
|--------|------|-------------------|
| **Observe** | Startup + per-route perf on real builds/OTAs | `app/_layout.tsx` `ObserveRoot` + `markInteractive()` |
| **Sentry** | Crash + traces `tracesSampleRate:0.1` | `packages/core/src/lib/monitoring/sentry.ts:11`, `app/_layout.tsx:175` |
| **PostHog** | Product analytics | `packages/analytics/src/engine/PostHogAnalytics.ts:10`, `app/_layout.tsx:177-188` |
| **Effect/OTel future** | Backend tracing | Deferred per `decisions/2026-07-26-effect-observability-boundary.md` |

Rule: Observe `sampleRate` + Sentry `tracesSampleRate` + PostHog `isAnalyticsEnabled` all respect `useConsentStore` PDPA (`app/_layout.tsx:153-190`).

---

## 2) Prerequisites

- **SDK 55+** required; we are **57** (`apps/gurudevi-mobile/package.json:115`) — eligible.
- **EAS project** linked (`app.json:82-86` `projectId: 1701dfb9-c59e-45c6-a391-58c061a0b8ce`, `owner: neevsk`). If not linked, `eas init`.
- **Not Expo Go** — requires dev or prod build (`android/` is gitignored ephemeral, built via EAS `apps/gurudevi-mobile/docs/Learning/EXPO_BUILD_RUNBOOK.md`).

---

## 3) Install (one-time, P0)

```bash
# From repo root
pnpm --filter gurudevi-mobile exec npx expo install expo-observe

# Verify SDK + doctor (DO NOT use --fix, per AGENTS.md)
pnpm --filter gurudevi-mobile exec expo-doctor
```

**`app.json` plugins:** no plugin entry needed for `expo-observe` (native autolinking). If a future version adds a plugin, add via `app.json:87-159` → `plugins` array, never hand-edit `android/`.

**`eas.json` — enable source maps (required for symbolicated Observe Errors):**

```json
{
  "build": {
    "production": { "uploadSourceMaps": true },
    "preview": { "uploadSourceMaps": true },
    "development": { "developmentClient": true, "uploadSourceMaps": true }
  }
}
```

See `plugins/withSentryProperties.js:9`/`withSentryGradleDisabled.js:8` — web maps were suppressed; Observe needs the same flag flipped.

---

## 4) Wiring — `app/_layout.tsx`

Wrap root with `ObserveRoot` (SDK 56+ name; SDK 55 used `AppMetricsRoot`) and call `markInteractive()` when truly interactive (splash + first data in, per Callstack TTI guidance):

```tsx
// app/_layout.tsx
import { ObserveRoot, useObserve } from 'expo-observe';

// In RootShell, wrap the QueryClientProvider/GlobalProvider tree:
<ObserveRoot>{/* existing providers + AppContent */}</ObserveRoot>

// In each entry screen (welcome/auth/onboarding + each tab + deep-link targets):
function SelfScreenInner() {
  const { markInteractive } = useObserve();
  useEffect(() => {
    if (dataLoaded && !isProfileResolving) markInteractive({ routeName: 'self' });
  }, [dataLoaded, isProfileResolving]);
  // Or declarative: <ObserveInteractiveMarker /> when ready
}
```

**Critical:** Call `markInteractive()` on **every** entry screen (onboarding, login, deep-link `qr`, `public-form/[slug]`, plus each tab). If only one screen calls it, TTI is not recorded when the app cold-starts via another route (`docs.expo.dev/eas/observe/get-started`).

**Configuration (consent-gated):**

```tsx
import { Observe } from 'expo-observe';

// In BootstrapSideEffects, after hasDecidedConsent && analyticsConsentGranted:
Observe.configure({
  environment: process.env.EXPO_PUBLIC_APP_ENV ?? 'production',
  sampleRate: 0.2,                 // 20% of installs, deterministic per device
  dispatchInDebug: false,          // never send debug builds
  dispatchingEnabled: analyticsConsentGranted,
  integrations: { expoRouter: true } // per-route TTR/TTI
});

// Flush on demand (offline metrics dispatch on background, but explicit flush helps E2E):
Observe.dispatchEvents();
```

**Not needed:** No `init` call — installing the lib is enough to start `cold launch`/`bundle load`/`TTR` capture in release builds.

---

## 5) EAS Update Download Tracking

Automatic — no code. Every `eas update` publish gets a release marker on Observe charts; download/apply time appears alongside TTI so a slow OTA does not masquerade as slow app (`expo.dev/blog/introducing-observe`).

---

## 6) Custom Events & Errors (preview)

```tsx
import { Observe } from 'expo-observe';

// User-defined: appears in Observe Events tab + eas observe:events
Observe.logEvent('self_voice_recorded', { durationMs: 1234, tab: 'self' });
Observe.logEvent('library_search', { queryLen: 8, offline: true });
Observe.logEvent('message_sent', { conversationType: 'group' });

// Errors (SDK 57+ preview): alongside Sentry, for perf-correlated errors
import { ObserveErrorBoundary } from 'expo-observe';
// Wrap: <ObserveErrorBoundary><App /></ObserveErrorBoundary>
Observe.reportError(new Error('STT failed'), { handled: true });
```

Events land on the same session timeline as startup metrics — so the release that raised TTR and introduced an error are visible together.

---

## 7) Local CLI — Query Metrics Without the Dashboard

Requires `eas-cli` authenticated (`eas login`) and EAS project linked.

```bash
eas observe:versions                         # app versions + build/update IDs + dates
eas observe:metrics-summary --platform android --environment production
eas observe:metrics --metric cold_launch --platform android --limit 20
eas observe:routes --platform android        # per-route cold/warm TTR + TTI (needs router integration)
eas observe:session --session-id <id>        # full event timeline for one slow session
eas observe:events --limit 20                # your Observe.logEvent stream
eas observe:metrics --help                   # flags, metric names, filters
```

**Dashboard:** `expo.dev/accounts/[account]/projects/[project]/observe` → filter by platform/environment/time-range/release; toggle `Show builds`/`Show updates`; click release marker for popover delta; `Handoff to AI` copies structured prompt for Claude/Cursor.

Data retained **≥60 days** (`docs.expo.dev/eas/observe/reference/metrics`).

---

## 8) Build & Verify (P0/P1)

```bash
# Dev build (first markers):
pnpm --filter gurudevi-mobile exec eas build --profile development --platform android

# Production check:
pnpm --filter gurudevi-mobile exec eas build --profile production --platform android
# Then:
eas observe:metrics-summary --platform android
eas observe:routes --platform android
```

If `eas observe:metrics-summary` returns 0 rows after a build, check:
- `expo-observe` installed and `ObserveRoot` mounted (`app/_layout.tsx`)?
- `markInteractive()` called on the cold-start route? (If only `self` has it but you cold-started `auth`, TTI won't record.)
- Build is production/dev build, not Expo Go? (`expo-observe` not in Go)
- `Observe.configure({dispatchingEnabled:false})` or `sampleRate:0` or out-of-sample device (deterministic per install — try another device)?
- Metrics dispatch on background — background the app once, or call `Observe.dispatchEvents()`.

---

## 9) Student Mode — Troubleshooting / Extensible Scoring (low priority now)

Per `docs/plans/student-exp-contract.md` low-priority extensible scoring: Observe per-route TTI could surface slow `student/[classroomId]` routes for future student-UX work, but no action now. Keeping for lineage.

---

## 10) Don't Do

- **Don't `npx expo install --fix`** to add `expo-observe` — use `npx expo install expo-observe` (honors sacred pins). Verify with `expo-doctor` only.
- **Don't hand-edit `android/`** to enable Observe — via `app.json`/`eas.json` only; `android/` is gitignored ephemeral (`AGENTS.md:3`).
- **Don't rely on Observe for native crashes** — keep Sentry (`packages/core/src/lib/monitoring/sentry.ts:11`).
- **Don't expect alerting/replay** — not shipped yet; cron a `eas observe:metrics-summary` check if you need a gate.

---

## 11) References

- `expo.dev/solutions/expo-observe` (marketing + pricing)
- `docs.expo.dev/eas/observe/introduction` + `/get-started` + `/configuration` + `/reference/metrics` + `/eas-cli` + `/dashboard`
- `docs.expo.dev/versions/latest/sdk/observe` (API: `ObserveRoot`, `useObserve`, `logEvent`, `reportError`, `configure`, `dispatchEvents`, `ObserveErrorBoundary`)
- `expo.dev/blog/introducing-observe` (Aug 25 2026 GA annc, release markers, pricing)
- `callstack.com/ebooks/the-ultimate-guide-to-react-native-optimization` (doctrine for P1, see `2026-08-28-callstack-perf-checklist.md`)
