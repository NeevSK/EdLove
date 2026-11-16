# Enterprise Hardening Strategies & Architectural Doctrines: Blueprint for Production Resilience

**Status**: Published Architecture Specification  
**Date**: 2026-11-08  
**Domain**: Cross-Surface Resilience (`apps/gurudevi-web`, `apps/gurudevi-mobile`, `@repo/core`, `@repo/ui`)  
**Authors**: Senior Systems Architect & Solutions Engineering Team  
**Scope**: Strategy & Invariant Specification (No Implementation — Pure Blueprint)

---

## 1. Executive Summary & The Prime Hardening Doctrine

To transition the Gurudevi Platform from a working prototype into an enterprise, national-scale system, architecture must assume that **networks will flap, hardware will be constrained, devices will be shared, URLs will be corrupted, and runtimes will be hostile**.

This specification defines the **Concrete Strategies** for every failure mode cataloged in [`2026-11-08-enterprise-production-edge-cases-and-failure-modes.md`](2026-11-08-enterprise-production-edge-cases-and-failure-modes.md) and codifies the **Generalized Meta-Doctrines** that prevent future architectural regressions.

---

## 2. Concrete Architectural Strategies for Identified Seams

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        THE 6 PRODUCTION HARDENING STRATEGIES                           │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ Strategy 1: Edge Proxy Host Sanitization & OPTIONS Preflight Contract                  │
│ Strategy 2: Deep Link Ingress Canonical Scrubbing & Normalization                      │
│ Strategy 3: Active Choice Invalidation (Killing Ghost Intents on Voluntary Divergence) │
│ Strategy 4: The Explicit Disambiguation Gate (Zero-Silent-Merge on Shared Devices)     │
│ Strategy 5: Storage Pre-Flight Probing & Graceful SQLite Degradation                   │
│ Strategy 6: WebKit Synchronous User-Gesture Preservation Contract                      │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### Strategy 1: Edge Proxy Host Sanitization & OPTIONS Preflight Contract
* **Target Boundary**: Layer 1 (Ingress / Edge Reverse Proxy — [`apps/gurudevi-web/proxy.ts`](file:///c:/x/apps/gurudevi-web/proxy.ts) & [`lib/host-routing.ts`](file:///c:/x/apps/gurudevi-web/lib/host-routing.ts))
* **Grounding Standard**: RFC 7239 §5.3 (Forwarded Host Validation) & RFC 9110 (HTTP Method Semantics).

#### Architectural Mechanism:
1. **Validated Host Extraction Pipeline**:
   * Never blindly read `request.headers.get('host')` (which internal Kubernetes/ALB clusters mutate).
   * Never blindly read `X-Forwarded-Host` (which external attackers can spoof).
   * Implement a two-tiered resolver:
     ```
     Incoming Request
           │
           ▼
     [Is connection from Trusted Proxy Subnet / Cloudflare IP?]
           ├── YES ──► Extract candidate from `X-Forwarded-Host` or `Forwarded: host=...`
           └── NO  ──► Extract candidate from transport `Host` header
           │
           ▼
     [Match candidate strictly against ALLOWED_APPLICATION_HOSTS allowlist]
           ├── MATCH   ──► Use validated domain (e.g. explore.gurudevi.app)
           └── UNKNOWN ──► Fall back to default canonical host (gurudevi.app); log warning
     ```
   * Strip port numbers defensively (`:443`, `:80`, `:3000`) before classification.
2. **First-Class OPTIONS Preflight Handling**:
   * In `host-routing.ts`, explicitly intercept `request.method === 'OPTIONS'`.
   * Return an immediate HTTP 204 (No Content) with appropriate CORS headers (`Access-Control-Allow-Origin`, `Access-Control-Allow-Methods: GET, HEAD, OPTIONS`, `Access-Control-Max-Age: 86400`) rather than returning 404.

---

### Strategy 2: Deep Link Ingress Canonical Scrubbing & Normalization
* **Target Boundary**: Layer 4 (State Machine & Intent Lifecycle — [`apps/gurudevi-mobile/app/+native-intent.tsx`](file:///c:/x/apps/gurudevi-mobile/app/+native-intent.tsx) & [`@repo/core/logic/deeplink/deepLinkPolicyPipeline.ts`](file:///c:/x/packages/core/src/logic/deeplink/deepLinkPolicyPipeline.ts))

#### Architectural Mechanism:
1. **The Canonical URL Scrubber**:
   Before classifying or stashing any route intent in `pendingIntentStore`, pass the incoming URL through a deterministic sanitizer:
   * **Strip Third-Party Tracking Parameters**: Remove `fbclid`, `gclid`, `utm_*`, `msclkid`, `mc_eid`, `openExternalBrowser`.
   * **Strip Hash Fragments**: Remove URL fragments (`#_=_`, `#intent_redirect`) that confuse native route segment matching.
   * **Path Normalization**: Lowercase canonical stems, strip double slashes (`//workspace` $\rightarrow$ `/workspace`), and strip trailing slashes (`/workspace/` $\rightarrow$ `/workspace`).
   * **Query Preservation**: Retain strictly whitelisted application parameters (`?feature=...`, `?entry=...`, `?step=...`, `?code=...`).
2. **JSI Cold-Boot Deferred Bridge**:
   If `+native-intent.tsx` executes before `coreRuntime.storage` is fully polyfilled by Hermes Nitro JSI, queue the serialized intent in an in-memory high-priority boot buffer. A dedicated boot subscriber flushes this buffer to persistent MMKV as soon as `coreRuntime.register()` commits.

---

### Strategy 3: Active Choice Invalidation (Killing Ghost Intents)
* **Target Boundary**: Layer 4 (Intent Lifecycle & Navigation Stack — [`apps/gurudevi-mobile/src/entry/entryNavigation.ts`](file:///c:/x/apps/gurudevi-mobile/src/entry/entryNavigation.ts) & [`SessionRouteGate.tsx`](file:///c:/x/apps/gurudevi-mobile/src/entry/SessionRouteGate.tsx))

#### Architectural Mechanism:
1. **The Voluntary Divergence Sensor**:
   * An incoming deep link to a protected destination (e.g. `/workspace`) establishes an entrance intent.
   * If the user is unauthenticated, they land on `/welcome`.
   * If the user explicitly selects a different top-level action from `/welcome` (e.g. tapping "Somatic Breathing" $\rightarrow$ `/pulse`, or tapping "Explore Library" $\rightarrow$ `/library`):
     * The navigation action is flagged as a **Voluntary Human Decision**.
     * `pendingIntentStore.getState().clearPendingIntent()` is immediately invoked.
2. **Intent Invalidation Invariant**:
   * A deferred intent is valid **only if the user follows the linear onboarding/authentication funnel**. The moment they branch away to an unrelated surface, the deferred intent is considered abandoned and must not jolt them in the future.

---

### Strategy 4: The Explicit Disambiguation Gate (Zero-Silent-Merge)
* **Target Boundary**: Layer 3 (Identity Authority & Shared Devices — [`apps/gurudevi-mobile/src/entry/GuestConversionBoundary.tsx`](file:///c:/x/apps/gurudevi-mobile/src/entry/GuestConversionBoundary.tsx))

#### Architectural Mechanism:
1. **The Zero-Silent-Merge Law**:
   * An anonymous local guest session must **never** be automatically merged into an authenticated cloud account without explicit, human-confirmed disambiguation.
2. **The Disambiguation UI Protocol**:
   When an unauthenticated guest session with existing local records (reflections, journal notes, custom widgets) establishes a new cloud login:
   * **Interception**: `GuestConversionBoundary` halts the login finalization and presents an un-dismissible disambiguation modal:
     ```
     ┌────────────────────────────────────────────────────────┐
     │           LOCAL WORK FOUND ON THIS DEVICE              │
     ├────────────────────────────────────────────────────────┤
     │ We found reflections and notes created in Guest Mode   │
     │ on this device.                                        │
     │                                                        │
     │ What would you like to do with this work?              │
     │                                                        │
     │ [ A. Claim to My Account (teacher.b@schools.lk) ]      │
     │ [ B. Start Fresh (Clear local guest work from device)] │
     │ [ C. Review Local Work First ]                         │
     └────────────────────────────────────────────────────────┘
     ```
   * **Option A**: Runs the transactional migration pipeline, linking SQLite rows to the new account UUIDv8.
   * **Option B**: Purges the local guest SQLite partition and starts with a pristine cloud profile. This completely eliminates the communal school tablet data contamination catastrophe.

---

### Strategy 5: Storage Pre-Flight Probing & Graceful SQLite Degradation
* **Target Boundary**: Layer 5 (Persistence Substrate & Flash NAND — Local SQLite WAL engine)

#### Architectural Mechanism:
1. **Pre-Flight Disk Space Probing**:
   * Before committing heavy transactions or database mutations, query device storage headroom via native OS signals (`expo-file-system` / native driver).
   * If free storage $< 50\text{MB}$:
     * Set storage state to `critically_constrained`.
     * Disable heavy image/audio attachments.
     * Surface a persistent, calm amber warning banner: *"Device storage is almost full. Your work is kept in lightweight memory."*
2. **Atomic Safe-Write Transaction Envelope**:
   * Wrap all local SQLite writes in a specialized boundary:
     ```typescript
     try {
       await db.executeTransaction(tx);
     } catch (error) {
       if (isSqliteFullError(error)) {
         // Fail gracefully: preserve user input in volatile React state; do NOT crash app
         notifyStorageFull(draft);
         return { ok: false, reason: 'disk_full' };
       }
       throw error;
     }
     ```

---

### Strategy 6: WebKit Synchronous User-Gesture Preservation Contract
* **Target Boundary**: Layer 6 (User-Agent Interface & Mobile Safari — [`packages/ui/src/utils/linking.ts`](file:///c:/x/packages/ui/src/utils/linking.ts) & [`linking.web.ts`](file:///c:/x/packages/ui/src/utils/linking.web.ts))
* **Grounding Standard**: WebKit Transient User Activation & HTML Living Standard §8.3.

#### Architectural Mechanism:
1. **The Synchronous Click Window Protocol**:
   * When a user taps an external link in a web browser, **the window must be claimed synchronously within the original gesture event loop tick**.
   * If preference is known (in-memory cache): Dispatch `window.open(url, '_blank', 'noopener,noreferrer')` immediately with zero microtask awaits.
   * If preference is unknown (modal prompt needed):
     * Do NOT attempt to run `window.open` after an asynchronous prompt resolution.
     * Instead, inside the preference modal itself, **the user's tap on the option button (e.g. "Open in New Tab") IS the new direct user gesture**.
     * Execute `window.open(url, '_blank')` **synchronously inside that modal button's `onPress`/`onClick` handler**, and perform the preference storage write (`setItem`) asynchronously in the background.

---

## 3. Generalized Meta-Doctrines (The Platform Resilience Invariants)

These four overarching architectural doctrines must govern all future development:

### Doctrine 1: The Principle of Fail-Closed Ingress with Graceful Visual Degradation
* Ingress layers (edge proxies, deep link policy pipelines, native intent receivers) must **fail closed** when presented with unmapped, invalid, or corrupted input. 
* However, "fail closed" at the network boundary must translate into **graceful visual degradation** at the presentation boundary. Never display a raw 0-byte error, a blank white screen, or an uncaught native exception; always render the branded Tutii mascot fallback.

### Doctrine 2: The Zero-Silent-Merge Identity Invariant
* No piece of client-generated data may cross identity boundaries (e.g. Guest $\rightarrow$ User, User A $\rightarrow$ User B, School A $\rightarrow$ School B) without explicit, auditable, and human-acknowledged intent.
* Silicon locality must never be conflated with identity ownership.

### Doctrine 3: The Synchronous User-Gesture Preservation Law
* Privileged platform capabilities governed by operating system or browser security heuristics (opening windows, accessing camera/microphone, triggering biometric prompts) must execute synchronously within the user gesture context.
* Asynchronous metadata logging, preference saving, or network reporting must be decoupled and executed out-of-band.

### Doctrine 4: The Idempotent Two-Phase Promotion Protocol
* Any promotion of data from offline silicon (SQLite WAL) to cloud systems (Postgres/Supabase) must be **two-phase and idempotent**:
  1. **Phase 1 (Remote Staging & Validation)**: Upload with client-generated idempotency UUIDv8 keys; verify server acknowledgment.
  2. **Phase 2 (Local Commit & Lease Retirement)**: Mark local records as committed only after server-signed confirmation. If a network connection drops at any millisecond, a subsequent retry is completely non-destructive and produces zero duplicate records.

---

## 4. Hardening Roadmap & Operational Phasing

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        PHASED HARDENING IMPLEMENTATION PLAN                            │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ PHASE 1: EDGE & INGRESS SHIELDING                                                      │
│ • Reverse proxy validated host resolver (RFC 7239 allowlist)                           │
│ • Subdomain CORS OPTIONS 204 handler                                                   │
│ • Universal link canonical query & fragment scrubber                                   │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ PHASE 2: INTENT & NAVIGATION SANITY                                                    │
│ • Voluntary navigation intent invalidation (killing ghost intents)                     │
│ • Cold-boot deferred intent JSI flush bridge                                           │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ PHASE 3: IDENTITY & DATA INTEGRITY                                                     │
│ • Explicit Disambiguation Modal for guest-to-account conversion                        │
│ • Communal device protection (claim vs discard flow)                                   │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ PHASE 4: PERSISTENCE & SUBSTRATE RESILIENCE                                            │
│ • Storage pre-flight probing & SQLITE_FULL error boundary                              │
│ • Safari synchronous modal-click window dispatch contract                              │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

