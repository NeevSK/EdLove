# Architecture Record: Explore Web and Mobile Local Guest Parity & Universal Ingress

**Status**: Accepted  
**Date**: 2026-11-08  
**Domain**: Cross-Surface Architecture (`apps/gurudevi-web`, `apps/gurudevi-mobile`, `@repo/core`)  
**Authors**: Senior Development & Solutions Architecture Pair

---

## 1. Context & Prime Invariant

The Gurudevi Platform provides **Unauthenticated First-Value Discovery**: letting a human experience the sanctuary, engage with the tools, and discover its pedagogical and reflective depth *before* demanding an account credential or payment method.

While the product concept is identical across platforms, the physical substrate dictates the implementation and presentation:

```
                       ┌──────────────────────────────────────────────────────────┐
                       │          THE CORE CONCEPT: FIRST-VALUE DISCOVERY         │
                       │     (Experience the Sanctuary without account barrier)   │
                       └────────────────────────────┬─────────────────────────────┘
                                                    │
                 ┌──────────────────────────────────┴──────────────────────────────────┐
                 ▼                                                                     ▼
    WEB SUBSTRATE: "Ephemeral Showroom"                                 MOBILE SUBSTRATE: "Sovereign Local Sandbox"
    (explore.gurudevi.app)                                              (apps/gurudevi-mobile)
  ──────────────────────────────────────────                          ────────────────────────────────────────────
  • Surface: explore.gurudevi.app subdomain                           • Surface: Native iOS / Android application
  • Isolation: Distinct subdomain & cookies                           • Isolation: OS process sandbox & SQLite WAL
  • Storage: Session memory / read-only fixtures                      • Storage: Durable device-local SQLite + MMKV
  • DB Sync: None (stateless HTTP)                                    • DB Sync: Disabled (zero cloud traffic / air-gapped)
  • Presentation: Live mock showroom + Tutii preview floors           • Presentation: Real native Sanctuary (Self, Pulse, etc.)
  • Conversion: Redirect to sanctuary.gurudevi.app                    • Conversion: Seamless local SQLite promotion to cloud
```

---

## 2. Substrate Parity Decisions

### A. Web Substrate: The Ephemeral Showroom (`explore.gurudevi.app`)
1. **Subdomain Isolation**: Web visitors arrive without prior installation. To prevent cookie/session poisoning and shield private API routes, guests are contained within `explore.gurudevi.app`.
2. **Channel Model**:
   * *Channel 1 (Live Mock Preview)*: Explorable read-only product pages (`/self`, `/workspace`, `/community`, `/library`).
   * *Channel 2 (In-Progress Showroom)*: Honest, branded preview floors (`ExplorePreviewFloor.tsx`) featuring Tutii and conversion CTAs.
   * *Channel 3 (Single Gateway Redirect)*: Private administration/staff routes (`/admin`, `/account-recovery`, `/verger-lab`) redirect with HTTP 307 to `https://sanctuary.gurudevi.app/welcome?returnTo=...`.
3. **Stateless Edge**: Edge reverse proxy (`proxy.ts`) enforces RFC 7807 problem details, CDN caching (`public, max-age=3600`), and COOP (`same-origin-allow-popups`).

### B. Mobile Substrate: The Sovereign Local Sandbox (`apps/gurudevi-mobile`)
1. **No "Explore" Subdomain Inside the App**:
   The native app **is** the Sanctuary. When a mobile user taps *"Explore as Guest"*, they enter the **authentic local Sanctuary** (`/self`, `/workspace`). There are no mock web pages inside mobile.
2. **Durable Local Storage with Zero DB Sync**:
   * **Zero Cloud Traffic**: PowerSync replication stays dormant (`syncAdmission: denied_unauthenticated`). No network calls are made to Supabase or cloud Postgres. The database remains protected from anonymous bot spam.
   * **Full-Fidelity Silicon Persistence**: Reflections, somatic sessions, and onboarding choices write locally to SQLite WAL and MMKV under a 15-day guest lease (`GuestPersistenceNotice.tsx`).
   * **Air-Gapped Operation**: The entire guest experience works 100% offline in airplane mode.
3. **Lossless Conversion**:
   When the guest eventually signs in, `GuestConversionBoundary.tsx` atomically attaches their local SQLite rows to their new canonical account UUIDv8 (`public.users.id`). Zero work is discarded.

---

## 3. The Universal Link Ingress Handshake

When a user clicks or scans an `explore.gurudevi.app` URL on a mobile device where the Gurudevi app is installed:

1. **System Ingress**:
   * iOS (`associatedDomains` in `app.json`): `applinks:explore.gurudevi.app`
   * Android (`intentFilters` in `app.json`): `https://explore.gurudevi.app` with `autoVerify: true`
2. **Route Classification (`@repo/core/logic/deeplink`)**:
   * `ALLOWED_WEB_HOSTS` includes `explore.gurudevi.app`.
   * `ALLOWED_WEB_PATH_PREFIXES` includes `/workspace`, `/self`, `/intro`, `/welcome`, `/atlas`, `/pulse`.
   * `classifyRouteIntent` normalizes the URL and classifies it as an `internalRoute` (e.g. `https://explore.gurudevi.app/workspace` $\rightarrow$ `/workspace`).
3. **Route Admission (`SessionRouteGate.tsx`)**:
   * If the user already has a session or completed local guest onboarding, they land immediately in the requested sanctuary floor.
   * If unauthenticated, `pendingIntentStore` stashes the target path and safely preserves it across guest activation.
   * Public routes (`/pulse`, `/qr`, `/intro`, `/welcome`, `/atlas`) are marked in `isPublicPath` and render immediately without redirection.

---

## 4. Verification & Invariant Matrix

| Test Suite | File | Invariant Verified |
| :--- | :--- | :--- |
| **Deep Link Policy Pipeline** | [`deepLinkPolicyPipeline.test.ts`](file:///c:/x/packages/core/src/logic/deeplink/__tests__/deepLinkPolicyPipeline.test.ts) | Verifies `explore.gurudevi.app` is admitted and classified as `internalRoute`. |
| **Native Intent Middleware** | [`nativeIntent.test.ts`](file:///c:/x/apps/gurudevi-mobile/src/__tests__/entry/nativeIntent.test.ts) | Verifies `+native-intent.tsx` rewrites explore URLs and stashes pending intents. |
| **Route Flow Decisions** | [`route-flow-decision.test.ts`](file:///c:/x/apps/gurudevi-mobile/src/__tests__/architecture/route-flow-decision.test.ts) | Verifies unauthenticated visitors access `/pulse`, `/qr`, `/intro` directly without `/welcome` bounce. |
| **Route Flow Parity** | [`route-flow-parity.test.ts`](file:///c:/x/apps/gurudevi-mobile/src/__tests__/architecture/route-flow-parity.test.ts) | Verifies identical auth decision logic across Web and Mobile entrypoints. |

