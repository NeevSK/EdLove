---
title: "Explore ↔ Sanctuary Security Hardening"
status: "active"
created: 2026-11-04
updated: 2026-11-04
author: "Naveen"
scribe: "Antigravity"
tags: [security, explore, sanctuary, routing, CSP, threat-model]
---

# Explore ↔ Sanctuary Security Hardening

> **Attacker mindset first. Defence second.**

---

## 0. What Explore Actually Is (Ground Truth)

From `lib/explore/selfExplore.ts` and `lib/explore/types.ts`:
- **Data store:** `localStorage` / in-memory only. No server calls.
- **Identity:** `principal: { kind: 'guest', id: 'browser-explorer' }` — hardcoded guest, no real UID.
- **Write guard:** `assertLocalOnlyWrite()` — throws if production write is attempted.
- **Mutation:** All writes are local (`storage.setItem`). Zero Supabase RPCs.
- **Sample data:** Seeded at first load: one journal entry (`source: 'sample'`), one mood log. No real data.

Explore is a **static brochure-ware demo** bundled into the same Next.js binary as the real app. That co-location is the entire threat surface.

---

## 1. Attacker Playbook (What I Would Do)

### Attack 1 — Cookie Harvesting via Explore Host (HIGHEST VALUE)

```
Goal: Read a real user's Supabase session JWT from an explore page

Steps:
1. Send victim a link: explore.gurudevi.app/self?utm_source=promo
2. Victim has an active sanctuary session (sb-* cookies present)
3. explore.gurudevi.app shares *.gurudevi.app cookie domain → cookies are present
4. SanctuaryLayout skips <AuthProvider> for explore → but doesn't delete cookies
5. SelfFloor.tsx imports `createAccountSafeTrySelfPracticeAdapter` from selfExplore
6. That adapter uses createExploreStorage() (localStorage) — safe
7. BUT: SelfFloor also calls useExploreCapacity(), useSelfCanvas() — do these call Supabase?
8. If any component on /self calls createBrowserSupabaseClient(), it reads the real JWT
9. Even without calling it: if I inject a rogue script (XSS) on explore, I can call 
   document.cookie or supabase.auth.getSession() and exfiltrate the real token

Attack surface: No CSP = any XSS on explore instantly harvests real sanctuary session.
```

### Attack 2 — URL Parameter Injection on Welcome Page (OPEN REDIRECT CHAIN)

```
Goal: Redirect authenticated user to attacker-controlled site

From welcome/page.tsx:
  const surfaceMode = hostKind === 'sanctuary' ||
    params?.mode === 'sanctuary' ||      ← ATTACKER CONTROLLED
    params?.surface === 'sanctuary' || 
    isSanctuaryReturn                    ← checks returnTo prefixes

Steps:
1. Craft: explore.gurudevi.app/welcome?mode=sanctuary&returnTo=/self
2. surfaceMode becomes 'sanctuary'
3. If Supabase finds existing session → redirect(params?.returnTo || '/self')
4. returnTo passes through safeReturnPath() which uses normalizeAcceptedInternalRoute
5. If that function accepts /self → redirect to /self on explore host
6. NOT an open redirect (stays same-origin) but: 
7. Mode confusion: explore host renders in 'sanctuary' mode, 
   potentially showing authenticated UI without real auth guards
```

### Attack 3 — Explore as Phishing Staging Ground (SOCIAL ENGINEERING)

```
Goal: Use explore's legitimate-looking Gurudevi UI to harvest credentials

Steps:
1. I cannot inject JS (no XSS vector found, good)
2. BUT: explore.gurudevi.app renders the REAL sanctuary UI (same code)
3. /sign-in on explore → redirects to sanctuary.gurudevi.app/sign-in (legitimate)
4. I register: exploree.gurudevi.app (typo domain) or explore.gurudevii.app
5. Users conditioned to trust the explore → sanctuary bounce → they trust my fake
6. Even without typosquat: I can send users to explore with ?mode=sanctuary
   to show them the full authenticated-looking UI before redirecting them
```

### Attack 4 — Explore → Account Conversion Data Exfiltration

```
Goal: When a user converts from explore to real account, steal their explore data

From types.ts:
  exportForAccountConversion(): ExploreState  ← this method exists

Steps:
1. User fills in journal entries on explore (personal reflections)
2. User clicks "Create Account" → this triggers exportForAccountConversion()
3. The exported data is uploaded to Supabase on the server
4. If the upload endpoint (/api or /auth/complete) doesn't validate that 
   the data being migrated belongs to the requesting user (or has size limits):
   → Arbitrary data injection into real account
   → Potential server-side storage exhaustion (unbounded payload)
```

### Attack 5 — School Subdomain Squatting

```
Goal: Create a school vanity subdomain that looks like a system subdomain

From host-routing.ts:
  RESERVED_SUBDOMAINS = new Set(['sanctuary','explore','public','api','admin',
                                  'www','platform','status','mail','auth'])

NOT reserved: 'app', 'cdn', 'static', 'media', 'login', 'account', 'my'

Steps:
1. Register school named "login" or "account" or "my" 
2. Subdomain: login.gurudevi.app → routes as 'school', rewrites to /school/login
3. Looks like a legitimate login page to users
4. Not blocked by RESERVED_SUBDOMAINS
```

---

## 2. What's Already Solid (Don't Touch)

| Control | Location | Why It Works |
|---|---|---|
| `assertLocalOnlyWrite()` | `selfExplore.ts:146` | Throws if explore tries to write to production |
| `safeReturnPath()` | `routeSafety.ts` | Validates returnTo against `normalizeAcceptedInternalRoute` |
| Non-GET/HEAD blocked on explore | `host-routing.ts:154` | Blocks CSRF/POST mutations from explore host |
| `getClaims()` not `getSession()` | `supabase/proxy.ts:27` | Correct JWT validation on sanctuary paths |
| `X-Frame-Options: DENY` | `proxy.ts:59` | Clickjacking blocked |
| `signOut scope: 'local'` | `auth/signout/route.ts:23` | Doesn't nuke other devices on sign-out |
| `Cache-Control: private, no-store` | `auth/complete/route.ts:13` | Auth callbacks never cached |

---

## 3. The Defence Architecture

### Reactive (Fix What's Broken Now)

**R1 — Cookie Amputation on Explore Host** _(10 lines, highest value)_
In `proxy.ts`: when request arrives on explore host, delete `sb-*` cookies from response.
This physically severs the hidden door between explore and sanctuary session state.

**R2 — Content-Security-Policy + HSTS** _(20 lines)_  
Add CSP that blocks explore from connecting to Supabase endpoints.
Even if R1 somehow fails, the browser itself refuses to send the JWT.
Add HSTS to prevent downgrade attacks across subdomains.

**R3 — Allowlist Routing (not Blocklist)** _(10 lines)_
Flip `exploreDeniedPrefixes` to `exploreAllowedPaths`.
Default: block everything on explore. Explicit opt-in for each demo route.
Fixes the "rules feel outdated" problem: new routes are safe by default.

**R4 — Welcome Page `mode` Parameter Sanitization** _(5 lines)_
Strip `mode` and `surface` query params on explore host before passing to WelcomeStage.
The host should determine mode, not an attacker-controlled query param.

**R5 — School Subdomain Reserved Word Expansion** _(5 lines)_
Add `'login', 'account', 'my', 'app', 'cdn', 'static', 'media', 'help', 'docs'`
to `RESERVED_SUBDOMAINS`. Squatting attack closed.

### Proactive (Prevent Future Drift)

**P1 — Explore Capability Firewall Comment** 
Document in `SanctuaryLayout` that explore-host must NEVER be given `AuthProvider`.
Make it a code comment + test assertion.

**P2 — CSP Nonce Pattern for Inline Scripts**  
The `dangerouslySetInnerHTML` theme bootstrap in `app/layout.tsx` needs a nonce.
Without it, CSP `script-src` must use `unsafe-inline` which defeats XSS protection.

**P3 — Architecture Test: Explore Cannot Import Supabase**  
Add a vitest test that imports all explore lib files and asserts no Supabase client
is instantiated. Prevents accidental wiring of explore to real data.

---

## 4. Implementation Plan (Ordered)

| Step | File | Change | Risk |
|---|---|---|---|
| 1 | `proxy.ts` | Add `clearExploreCookies()` + call in explore branch | Zero — only deletes cookies for explore host |
| 2 | `proxy.ts` | Add CSP + HSTS to `applySecurityHeaders()` | Low — need nonce for inline script |
| 3 | `lib/host-routing.ts` | Flip to allowlist for explore | Medium — verify tests pass |
| 4 | `app/layout.tsx` | Add nonce generation for CSP | Medium — theme bootstrap script |
| 5 | `lib/host-routing.ts` | Expand `RESERVED_SUBDOMAINS` | Zero |
| 6 | `app/(sanctuary)/welcome/page.tsx` | Strip `mode`/`surface` params on explore host | Low |
| 7 | `lib/host-routing.test.ts` | Add allowlist tests | Zero |
| 8 | `app/(sanctuary)/layout.tsx` | Add guard comment + architecture note | Zero |

---

## 5. Hexagonal Decoupling (Session Security Adapter)

To avoid hardcoding Supabase-specific vendor details (`sb-`, `*.supabase.co`) into the edge router/proxy, the security layer was decoupled into an explicit Hexagonal Boundary:

- **Adapter (`lib/sanctuary/sessionSecurity.adapter.ts`)**:
  - `isPlatformSessionCookie(name)`: Detects both vendor-specific session tokens (`sb-`) and generic platform session cookies (`auth-`, `session-`, `gd_session`, `__Host-`, `__Secure-`).
  - `resolveSanctuaryConnectOrigins()`: Dynamically inspects environment configuration (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_API_URL`) to build CSP allowed network origins at runtime.
  - `refreshSanctuarySession(request)`: Abstract boundary for session cookie refreshing.
- **Benefits**:
  - If the auth provider or API transport changes in the future (e.g., custom JWT, oRPC session, self-hosted auth domain), only `sessionSecurity.adapter.ts` adapts.
  - The edge proxy (`proxy.ts`), cookie amputation, and Explore host isolation remain completely provider-agnostic.

---

## 6. Localhost Developer Experience vs Production Security

To ensure developers can freely prototype and vibe-code without host-routing getting in the way:
- **Local Preview (`isLocalPreviewHost: true`, e.g. `*.localhost`, `127.0.0.1`)**:
  - All routes (including `/kit`, `/icon-lab`, `/verger-lab`, new prototypes, and experimental floors) are **100% permitted** and never 404'd by host routing.
  - Development CSP enables `'unsafe-eval'` and `ws:` so React DevTools, source maps, and Next.js Fast Refresh/HMR run seamlessly.
- **Production (`isLocalPreviewHost: false`, e.g. `*.gurudevi.app`)**:
  - Strict guest allowlist is rigorously enforced on `explore.gurudevi.app` (`/welcome`, `/self`, `/badge.svg`). Everything else is 404.
  - Cookie amputation, strict production CSP without `unsafe-eval`, and anti-squatting checks are fully active.


