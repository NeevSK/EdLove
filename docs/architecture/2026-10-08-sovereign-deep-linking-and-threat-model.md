---
title: "Sovereign Deep Linking, Google Install Referrer & Threat Mitigation Architecture"
status: "active"
created: 2026-10-08
updated: 2026-10-08
author: "Naveen"
scribe: "Antigravity (DeepMind Advanced Agentic)"
tags: [architecture, security, deeplinks, google-referrer, effect-v4, owasp, expo-router]
---

# Sovereign Deep Linking, Google Install Referrer & Threat Mitigation Architecture

## 1. Executive Summary & Zero-Cost Mandate

This architecture document defines the **production-hardened, zero-cost, sovereign deep linking architecture** for Gurudevi Mobile (Expo SDK 58 / React Native) and Gurudevi Web (Next.js 16).

### The Zero-Cost / No-SaaS Rule
Commercial deep-linking SDKs and hosted services (Branch.io, AppsFlyer, Detour hosted cloud) introduce recurring subscription fees, proprietary vendor lock-in, external hosting overhead, and third-party data tracking. 

Gurudevi operates under a **sovereign, zero-cost principle**:
1. **Zero External Hosting Overhead**: All routing and verification are handled by first-party domains (`gurudevi.app`, `sanctuary.gurudevi.app`) and on-device native runtimes.
2. **Google Play Install Referrer API**: Android deferred deep linking across app installation uses Google Play's native client API (`InstallReferrerClient`), which is 100% free, maintained by Google Play Services, and requires no intermediate servers.
3. **First-Party Universal Links**: iOS and Android OS-level app associations use standard Apple App Site Association (`apple-app-site-association`) and Android Digital Asset Links (`assetlinks.json`) hosted statically in the Next.js web app.
4. **Effect-TS v4 Functional Core**: All input validation, sanitization, intent classification, and referrer decoding are built on pure, type-safe Effect v4 pipelines in `@repo/core`.

---

## 2. Threat Modeling & Defense Matrix (OWASP MASVS & Web Standards)

Deep links, Universal Links, QR codes, and install referrers represent **untrusted external input channels** crossing from the operating system and internet into the app boundary.

### 2.1 Threat Actors

| Actor ID | Threat Actor | Capability & Motivation |
| :--- | :--- | :--- |
| **ACTOR-1** | **Hostile Local App** | A malicious application installed on the same device. Attempts to squat custom URL schemes (`gurudevi://`), intercept broadcast intents, or inject forged intents into exported activities. |
| **ACTOR-2** | **Network Adversary (MitM)** | Attacker on untrusted public Wi-Fi or compromised DNS. Attempts to inspect traffic, spoof domains, or tamper with deep link payloads. |
| **ACTOR-3** | **Social Engineering Phisher** | Attacker who distributes weaponized links or QR codes via chat/email containing path traversal, unauthorized redirects, or forged authentication states. |
| **ACTOR-4** | **Install Referrer Tamperer** | Attacker crafting malicious Play Store install campaigns to inject SQL/script characters or privilege-escalating payloads into the referral string. |
| **ACTOR-5** | **Shared Device Snooper** | Unauthorized person with physical access to the device attempting to extract unencrypted tokens or cached deep link payloads from `AsyncStorage`. |

---

### 2.2 Attack Axes & OWASP Defense Matrix

| Attack Axis | OWASP Category | Vulnerability & Vector | Severity | Sovereign Defense Mechanism (Effect v4 Pipeline) |
| :--- | :--- | :--- | :--- | :--- |
| **AXIS-1: Custom Scheme Hijacking** | **OWASP M1 & M8** | Rogue app registers `gurudevi://` in its `AndroidManifest.xml` to steal OAuth codes or invite tokens. | **Critical** | Custom scheme `gurudevi://` is strictly demoted to internal fallback. All public share links mandate HTTPS Universal Links (`https://gurudevi.app`). All OAuth code exchanges require **PKCE** (RFC 7636) with client-generated secret verifier, rendering stolen authorization codes useless without the verifier. |
| **AXIS-2: Path Traversal & Open Redirect** | **OWASP M4** | Attacker supplies `/../../../admin` or `%2e%2e` or `javascript:...` to escape intended route boundaries. | **High** | `validateDeepLinkEffect` strictly normalizes paths, enforces `MAX_DEEP_LINK_LENGTH = 8192`, blocks traversal (`containsTraversal`), forbids control chars, and verifies paths against `APP_ROUTES` manifest. |
| **AXIS-3: OAuth CSRF & State Injection** | **OWASP M1 & M3** | Attacker forces victim into an attacker-controlled session by crafting a link with attacker's code. | **High** | `DeepLinkStateGuard` enforces cryptographic 32-character hex client-side state tokens with 15-minute TTL. State tokens are single-use and invalidated immediately upon first verification. |
| **AXIS-4: Credential & PII Leakage** | **OWASP M9** | Access tokens, refresh tokens, passwords, or emails exposed in URLs, intent logs, crash reports, or analytics. | **High** | `classifyAuthCallback` explicitly rejects URLs containing raw tokens (`access_token`, `refresh_token`, `token`). Telemetry scrubber `trackDeepLink` redacts credentials and PII prior to logging. |
| **AXIS-5: Install Referrer Injection** | **OWASP M4** | Hostile parameters in Google Play referrer (`referrer=...`) containing malicious payloads. | **Medium** | `decodeInstallReferrerEffect` treats referrer strings as untrusted binary input. Decodes via URI components, validates with strict schemas, and caps length at 1024 characters. |
| **AXIS-6: Auto-Action Privilege Escalation** | **OWASP M1** | Opening a deep link automatically triggers a destructive action (joining a classroom, initiating a transfer). | **High** | **Inviolable Principle: Links only declare navigation intent.** A link never mutates state. State mutations require explicit user confirmation and authenticated server authorization. |
| **AXIS-7: Replay & Stale Intent Attacks** | **OWASP M1** | Re-dispatching an old invite link or cached deferred intent days later. | **Medium** | Pending intents stashed in `pendingIntentStore` enforce an explicit 15-minute TTL. Expired intents are automatically discarded upon startup. |

---

## 3. URL Shortening: The Technical Reality & Sovereign Solution

### 3.1 Why URL Shortening Is Deeply Related to Deep Linking
1. **SMS & Social Messaging Constraints**: Native deep links with tracking parameters (`utm_source`, `ref`, `inviteCode`) are lengthy (100+ characters), look spammy in messaging apps, and easily get wrapped or truncated.
2. **The Universal Link Breakdown Problem**:
   - Universal Links (iOS) and App Links (Android) rely on the OS recognizing the URL's domain against a cryptographically verified domain list on the device.
   - When using a third-party shortener (e.g., `bit.ly/xyz` or `tinyurl.com/abc`), the OS does **not** recognize `bit.ly` as Gurudevi's domain.
   - The OS opens the browser (Safari/Chrome). The browser follows the HTTP 301/302 redirect to `https://gurudevi.app/...`.
   - **Crucial Mobile Browser Security Policy**: Mobile Safari and Chrome **deliberately DO NOT trigger Universal Links on server-side HTTP 302 redirects** to prevent malicious pages from kicking users out of the browser without consent!
   - **Result**: Third-party URL shorteners completely break seamless deep linking.

### 3.2 The Sovereign Zero-Cost Alternative: First-Party Slug Routing
Gurudevi avoids external URL shorteners entirely by implementing **first-party vanity slug routes** on `gurudevi.app`:
- Instead of `bit.ly/3xY8z`, shareable links use:
  ```text
  https://gurudevi.app/c/MATHTEACHERS26    (Classroom Invite)
  https://gurudevi.app/f/admission-2026    (Public Form)
  ```
- **Why this is superior**:
  1. **Direct OS Interception**: Because the domain is `gurudevi.app`, Android and iOS recognize it immediately and launch the app without opening a browser or following redirects.
  2. **Zero Cost**: Handled directly in Next.js routing / Cloudflare worker routing.
  3. **OWASP Trust**: Users see the official Gurudevi brand domain, eliminating phishing suspicion.

---

## 4. Google Play Install Referrer (Zero-Cost Deferred Deep Linking)

### 4.1 Architecture & Flow

```
[User clicks invite link on Android device without Gurudevi installed]
                           │
                           ▼
[Next.js Web Landing (gurudevi.app/c/CODE)]
  - Detects Android user agent
  - Redirects to Google Play Store with encoded referrer:
    https://play.google.com/store/apps/details?id=app.gurudevi.sanctuary
    &referrer=utm_source%3Dinvite%26inviteCode%3DCODE%26intent%3Dclassroom
                           │
                           ▼
[User Installs App from Google Play Store]
                           │
                           ▼
[First App Launch (Cold Start)]
  - app/+native-intent.tsx initializes
  - Android InstallReferrerClient queries Play Store service on-device (zero network/zero SaaS)
  - decodeInstallReferrerEffect (Effect v4) parses and validates referrer payload
  - If user is not authenticated: stashes { inviteCode, intentKind: 'classroomInvite' } in pendingIntentStore
  - Once user signs in / completes onboarding, SessionRouteGate drains intent and navigates to classroom!
```

### 4.2 Effect v4 Referrer Parsing Pipeline

```typescript
import { Data, Effect } from 'effect';

export class ReferrerLengthError extends Data.TaggedError('ReferrerLengthError')<{
  readonly length: number;
}> {}

export class ReferrerFormatError extends Data.TaggedError('ReferrerFormatError')<{
  readonly raw: string;
}> {}

export interface ValidatedReferrerIntent {
  readonly inviteCode?: string;
  readonly utmSource?: string;
  readonly campaign?: string;
}

export const decodeInstallReferrerEffect = (
  rawReferrer: string,
): Effect.Effect<ValidatedReferrerIntent, ReferrerLengthError | ReferrerFormatError> =>
  Effect.gen(function* () {
    if (!rawReferrer || rawReferrer.length > 1024) {
      return yield* Effect.fail(new ReferrerLengthError({ length: rawReferrer.length }));
    }

    const decoded = yield* Effect.try({
      try: () => decodeURIComponent(rawReferrer),
      catch: () => new ReferrerFormatError({ raw: rawReferrer }),
    });

    const params = new URLSearchParams(decoded);
    const inviteCode = params.get('inviteCode') ?? params.get('c');
    const utmSource = params.get('utm_source');
    const campaign = params.get('utm_campaign');

    // Strict sanitization: invite code must be alphanumeric 4-32 characters
    const sanitizedInvite = inviteCode && /^[A-Za-z0-9_-]{4,32}$/.test(inviteCode)
      ? inviteCode
      : undefined;

    return {
      inviteCode: sanitizedInvite,
      utmSource: utmSource ? utmSource.slice(0, 64) : undefined,
      campaign: campaign ? campaign.slice(0, 64) : undefined,
    };
  });
```

---

## 5. Expo Router Pre-Routing Middleware (`app/+native-intent.tsx`)

In Expo Router (Expo SDK 58), `app/+native-intent.tsx` is the **canonical pre-routing gate**:

```typescript
// apps/gurudevi-mobile/app/+native-intent.tsx
import { classifyRouteIntent, normalizeAcceptedInternalRoute } from '@repo/core/logic/deeplink/deepLinkPolicyPipeline';
import { pendingIntentStore } from '@repo/core/logic/deeplink/pendingIntentStore';

export async function redirectSystemPath({
  path,
  initial,
}: {
  path: string;
  initial: boolean;
}): Promise<string> {
  // 1. Process intent through pure Effect policy pipeline
  const intent = classifyRouteIntent(path);

  switch (intent.kind) {
    case 'authCallback':
      // Let auth callback route handle token exchange
      return `/auth/callback?${new URL(intent.url).searchParams.toString()}`;

    case 'classroomInvite':
      // Stash intent for authenticated resumption
      pendingIntentStore.getState().setPendingIntent({
        targetPath: `/community?inviteCode=${encodeURIComponent(intent.inviteCode)}`,
        intentKind: 'classroomInvite',
        params: { inviteCode: intent.inviteCode },
        timestamp: Date.now(),
      });
      // Return safe route: if already authenticated, SessionRouteGate will immediately drain intent
      return '/community';

    case 'qr':
      return `/qr?payload=${encodeURIComponent(JSON.stringify(intent.payload))}`;

    case 'rejected':
    case 'unsupported':
    default:
      // Prevent open redirect; fall back to safe home route
      return '/';
  }
}
```

---

## 6. Phased Implementation Roadmap

1. **Phase 1: Effect v4 Policy & Pending Intent Store (`@repo/core`)**
   - Implement `pendingIntentStore` with Zustand + `coreRuntime.storage` and 15-minute TTL.
   - Upgrade `deepLinkPolicyPipeline.ts` to pure Effect v4 generator syntax with tagged errors.
   - Implement `decodeInstallReferrerEffect`.

2. **Phase 2: Expo Router `+native-intent.tsx` & Android Intent Filters (`gurudevi-mobile`)**
   - Create `app/+native-intent.tsx` with `redirectSystemPath`.
   - Update `app.json` intent filters for Android (`gurudevi://invite/*`, `gurudevi://qr/*`, `gurudevi://auth/*`).
   - Remove duplicate `Linking.addEventListener` listeners from `DeepLinkProvider.tsx`.

3. **Phase 3: Resilient Post-Auth Resumption (`SessionRouteGate.tsx`)**
   - Connect `pendingIntentStore` to `SessionRouteGate`.
   - When session transitions to `'app'` state, drain pending intent and route smoothly.

4. **Phase 4: Web Domain Association Endpoints (`gurudevi-web`)**
   - Deploy `.well-known/assetlinks.json` and `.well-known/apple-app-site-association`.
   - Configure web fallback for `/c/:code` and `/invite/classroom/:code`.

5. **Phase 5: Verification & Adversarial Test Harness**
   - Test against OWASP vectors: path traversal (`%2e%2e`), overlong URLs, state injection, and unauthenticated invite link retention.
