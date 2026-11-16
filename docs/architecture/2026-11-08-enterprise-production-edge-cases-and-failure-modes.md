# Enterprise Production Reality Audit: Real-World Edge Cases, Failure Modes & Substrate Latencies

**Status**: Published Architecture Analysis  
**Date**: 2026-11-08  
**Domain**: Cross-Surface Resilience (`apps/gurudevi-web`, `apps/gurudevi-mobile`, `@repo/core`, `@repo/ui`)  
**Authors**: Senior Systems Architect & Solutions Engineering Team  
**Scope**: Operational Reality Audit (No Implementation — Pure Diagnostic Analysis)

---

## 1. Executive Summary: Theory vs. Production Reality

In academic or test-harness settings, systems execute under idealized assumptions: clean query strings, stable single-user devices, infinite disk storage, synchronous gesture contexts, and compliant single-hop network transports.

In a **national-scale enterprise deployment** (e.g. 10,000+ Sri Lankan schools, rural 3G cellular backhauls, low-end Android hardware with constrained storage, shared communal tablets, and complex multi-CDN reverse proxy meshes), these idealized assumptions collapse.

This document systematically records the **empirical failure modes, latent bugs, and fragile seams** in the current Gurudevi Platform architecture where code will fail when meeting production reality.

---

## 2. Failure Mode Catalog by Physical Boundary

### A. Edge & Reverse Proxy Boundary (`apps/gurudevi-web`)

#### Edge Case A.1: The Reverse Proxy `Host` Header Desynchronization
* **Physical Seam**: [`apps/gurudevi-web/proxy.ts`](file:///c:/x/apps/gurudevi-web/proxy.ts#L52) & [`lib/host-routing.ts`](file:///c:/x/apps/gurudevi-web/lib/host-routing.ts#L182)
* **Code State**:
  ```typescript
  const hostname = request.headers.get('host') ?? request.nextUrl.hostname;
  ```
* **Production Failure**:
  * In modern cloud infrastructures (Cloudflare $\rightarrow$ AWS ALB $\rightarrow$ Kubernetes Traefik/NGINX Ingress $\rightarrow$ Next.js Node container), the ingress controller often rewrites the internal HTTP `Host` header to the internal service cluster name (e.g., `gurudevi-web-internal.prod.svc.cluster.local:3000`).
  * The actual external host requested by the client browser is transmitted via standard RFC 7239 `Forwarded: host=...` or de facto `X-Forwarded-Host`.
  * Because `proxy.ts` strictly queries `request.headers.get('host')`:
    1. `classifyGurudeviHost(hostname)` classifies the internal cluster name as `'other'`.
    2. **Catastrophic Failure**: All subdomain classification, Single Gateway redirection, session cookie amputation on Explore, and Content Security Policy boundaries are **completely bypassed**.
    3. Conversely, if an application naively trusts `X-Forwarded-Host` without allowlist validation, it becomes vulnerable to **Host Header Injection, Password Reset Poisoning, and Cache Poisoning** (RFC 7239 §5.3 security hazard).

#### Edge Case A.2: CORS Preflight (`OPTIONS`) Black Hole on Subdomains
* **Physical Seam**: [`apps/gurudevi-web/lib/host-routing.ts`](file:///c:/x/apps/gurudevi-web/lib/host-routing.ts#L238)
* **Code State**:
  ```typescript
  if (method !== 'GET' && method !== 'HEAD') return { kind: 'not-found' };
  ```
* **Production Failure**:
  * Browsers (Chrome, Firefox, Safari) issue CORS preflight `OPTIONS` requests when fonts, service workers, or background scripts perform cross-subdomain telemetry or fetch pre-warming.
  * Because `host-routing.ts` immediately slams any non-GET/HEAD request with `{ kind: 'not-found' }`, `proxy.ts` returns HTTP 404 with no CORS headers.
  * The browser immediately drops the connection, reporting cross-origin resource blocked, causing broken fonts, failed service worker registrations, and silent asset drops.

#### Edge Case A.3: Trailing Slash & Matrix URI Route Divergence
* **Physical Seam**: Next.js App Router route resolution vs Host Routing path normalization.
* **Production Failure**:
  * Search engines and external link aggregators frequently append trailing slashes (e.g. `https://explore.gurudevi.app/workspace/`) or matrix parameters (`/workspace;jsessionid=...`).
  * While `host-routing.ts` strips trailing slashes with `.replace(/\/+$/, '')`, downstream Next.js middleware and page server components might trigger internal 308 redirects (`/workspace/` $\rightarrow$ `/workspace`), creating double-hop redirect cascades that degrade Core Web Vitals (LCP / TTFB) on mobile networks.

---

### B. Mobile Ingress & Universal Link Minefield (`apps/gurudevi-mobile`)

#### Edge Case B.1: The Ad-Tech Query Clutter Attack
* **Physical Seam**: [`apps/gurudevi-mobile/app/+native-intent.tsx`](file:///c:/x/apps/gurudevi-mobile/app/+native-intent.tsx#L32) & [`@repo/core/logic/deeplink/deepLinkPolicyPipeline.ts`](file:///c:/x/packages/core/src/logic/deeplink/deepLinkPolicyPipeline.ts#L246)
* **Production Failure**:
  * Real-world deep links distributed via WhatsApp, Telegram, Facebook, and Google Ads arrive decorated with tracking payloads:
    ```
    https://explore.gurudevi.app/workspace?fbclid=PAAa...&utm_source=whatsapp&utm_medium=chat&gclid=123#_=_
    ```
  * In `+native-intent.tsx`:
    ```typescript
    const targetPath = intent.path; // carries full raw query string
    return targetPath;
    ```
  * Expo Router attempts to match `/workspace?fbclid=...` against file routes. While Expo Router strips search for file routing, `pendingIntentStore` stores the full untrusted string.
  * If the query contains special URL-encoded characters (`%20`, `%3F`, `%23`) or hash fragments, downstream route gates and deep link parsers fail with URI malformed errors or corrupted parameter dictionaries.

#### Edge Case B.2: Cold-Start vs. Warm-Start Storage Race
* **Physical Seam**: [`packages/core/src/logic/deeplink/pendingIntentStore.ts`](file:///c:/x/packages/core/src/logic/deeplink/pendingIntentStore.ts#L61)
* **Production Failure**:
  * On a cold launch (app process was killed by OS under low memory), Android sends the `Intent.ACTION_VIEW` as part of the initial `Activity.onCreate()`.
  * `app/+native-intent.tsx` executes synchronously during early bundle evaluation.
  * However, Nitro Modules and MMKV storage polyfills (`coreRuntime.storage`) bind asynchronously via the JSI bridge.
  * In `setPendingIntent`:
    ```typescript
    try {
      if (coreRuntime.storage) {
        void coreRuntime.storage.setItem(LEGACY_DEFERRED_DEEP_LINK_KEY, raw);
      }
    } catch {}
    ```
  * If `coreRuntime.isRegistered()` is false during cold boot, the pending intent is stashed in in-memory Zustand only. If the app is killed before being admitted, the user's deep link is permanently lost.

#### Edge Case B.3: The Stale Ghost Intent Jolt
* **Physical Seam**: [`apps/gurudevi-mobile/src/entry/entryNavigation.ts`](file:///c:/x/apps/gurudevi-mobile/src/entry/entryNavigation.ts#L23)
* **Code State**:
  ```typescript
  if (routeTarget.decision === 'app' && pendingIntent?.targetPath) {
    return { consumePendingIntent: true, target: pendingIntent.targetPath };
  }
  ```
* **Production Failure**:
  * A user taps a link for `/workspace`. They are unauthenticated.
  * The intent is stashed with a 15-minute TTL. The user lands on `/welcome`.
  * The user ignores `/workspace`. They voluntarily tap "Try Breathing" $\rightarrow$ `/pulse`.
  * They complete somatic breathing, then tap "Join School" $\rightarrow$ `/onboarding`.
  * They finish onboarding. The moment `routeTarget.decision` flips to `'app'`, `getEntryNavigationAction` sees the stale pending intent from 12 minutes ago and **violently rips the user away from their intended destination back to `/workspace`**.
  * The system failed to recognize that **voluntary intermediate navigation invalidates deferred entrance intents**.

---

### C. Multi-User & Shared Device Boundary (The School Tablet Trap)

#### Edge Case C.1: Accidental Identity Hijack & Unchecked Data Absorption
* **Physical Seam**: [`apps/gurudevi-mobile/src/entry/GuestConversionBoundary.tsx`](file:///c:/x/apps/gurudevi-mobile/src/entry/GuestConversionBoundary.tsx) & [`packages/core/src/native/localGuestSession.ts`](file:///c:/x/packages/core/src/native/localGuestSession.ts)
* **Production Failure**:
  * In Sri Lankan rural schools and resource-constrained environments, **Android tablets are communal**.
  * **Teacher A** picks up the school tablet in the morning. She uses Gurudevi in **Guest Mode**. She creates private, un-synced pedagogical notes and disciplinary student observations in `/self` (stored locally in SQLite WAL).
  * She finishes and leaves the tablet in the staff room without factory resetting it.
  * **Teacher B** picks up the tablet in the afternoon. She logs into her own official Gurudevi account (`teacher.b@schools.lk`) via Google One-Tap or email password.
  * **The Fatal Bug**: `GuestConversionBoundary` detects that a local guest session exists and that an authenticated cloud session was just established. Without prompting, it automatically triggers `convertGuestDataToAccount()`.
  * **Result**: Teacher A's confidential reflections are uploaded and irreversibly merged into Teacher B's cloud account! Teacher B now owns Teacher A's notes, creating a severe data protection breach (FERPA / GDPR / National Data Protection violation).

---

### D. Offline, Storage Starvation & PowerSync Boundaries

#### Edge Case D.1: SQLite Disk Full (`SQLITE_FULL` / Code 13)
* **Physical Seam**: Local SQLite WAL engine on native mobile (`react-native-sqlite-storage` / PowerSync SQLite driver).
* **Production Failure**:
  * Budget Android devices routinely run with < 100MB of free flash storage.
  * When a guest creates a reflection or edits a document, SQLite attempts to append to the Write-Ahead Log (`-wal`).
  * If the disk is full, the OS denies the block allocation, throwing C++ native error `SQLITE_FULL`.
  * If unhandled by an application-level storage boundary, this causes an immediate native `SIGABRT` crash. The app closes instantly, leaving the user with corrupted or missing entries.

#### Edge Case D.2: Non-Atomic Conversion & Network Flapping
* **Physical Seam**: Guest-to-cloud sync pipeline under high packet loss.
* **Production Failure**:
  * A guest has 15 local records. They sign up on a spotty 3G cellular network (50% packet drop).
  * The conversion service uploads records sequentially over HTTP/WebSocket.
  * Records 1 through 7 succeed. On record 8, the cellular tower handoff drops the TCP socket.
  * If the conversion mechanism lacks a two-phase transactional commit or idempotent deduplication tokens, a retry will either:
    1. Re-upload records 1-7, causing duplicate database entries in cloud Postgres; OR
    2. Prematurely mark the local guest lease as claimed, leaving records 8-15 permanently stranded in local storage.

---

### E. WebKit / Safari User Activation Boundary (`packages/ui`)

#### Edge Case E.1: The Asynchronous Storage Tick Popup Suppression
* **Physical Seam**: [`packages/ui/src/utils/linking.ts`](file:///c:/x/packages/ui/src/utils/linking.ts#L181) & [`ExternalLinkContext.tsx`](file:///c:/x/packages/ui/src/context/ExternalLinkContext.tsx#L152)
* **Production Failure**:
  * In iOS Safari (WebKit engine), **Transient User Activation** (the browser's permission to call `window.open` without popup blocker interception) is bound strictly to the current callstack of a user gesture (`touchend` / `click`).
  * In `linking.ts`:
    ```typescript
    const resolution = await resolveOpenMethod(url, options, forcePrompt);
    // ... async storage calls ...
    await executeExternalOpen(url, resolution.method);
    ```
  * Even if `resolveOpenMethod` resolves quickly, the microtask yield (`await`) causes WebKit to deem the user gesture expired.
  * When `window.open(url, '_blank')` is called, Safari silently suppresses the window. No error is thrown to JavaScript; the user clicks "Open in Browser", nothing happens, and the UI appears dead.

---

## 3. Summary Risk Register

| Risk ID | Surface | Failure Mechanism | Severity | Impact |
| :--- | :--- | :--- | :--- | :--- |
| **R-EDGE-01** | `apps/gurudevi-web` | Reverse proxy cluster names bypass host routing if `X-Forwarded-Host` is omitted or unverified. | **CRITICAL** | Security boundary bypass; session cookie leakage on Explore. |
| **R-EDGE-02** | `apps/gurudevi-web` | CORS `OPTIONS` preflight requests returned as 404 on explore subdomains. | **HIGH** | Broken cross-origin assets, fonts, and telemetry pre-warming. |
| **R-INGR-01** | `apps/gurudevi-mobile` | Tracking query parameters (`fbclid`, `utm_*`) corrupting internal route resolution. | **MEDIUM** | Deep link navigation failures; URI malformed exceptions. |
| **R-INGR-02** | `apps/gurudevi-mobile` | Stale pending intents re-triggering after voluntary intermediate user navigation. | **MEDIUM** | User jolt; broken UX flow after onboarding completion. |
| **R-DATA-01** | `apps/gurudevi-mobile` | Silent auto-merging of local guest data into another user's account on communal tablets. | **CRITICAL** | Severe privacy violation; irreversible cloud data contamination. |
| **R-STOR-01** | `apps/gurudevi-mobile` | `SQLITE_FULL` crash on low-storage Android hardware during offline journaling. | **HIGH** | Native app crash; unrecoverable data loss for offline users. |
| **R-BROW-01** | `packages/ui` | Async microtask boundary causing iOS Safari to silently block external window popups. | **MEDIUM** | Broken external links; silent failure in Safari/WebKit. |

