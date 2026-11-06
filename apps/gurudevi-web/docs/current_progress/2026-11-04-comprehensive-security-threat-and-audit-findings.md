---
title: "Comprehensive Security Threat Vectors, Intrusive Audit Findings, and Decoupled Architecture"
status: "completed"
created: 2026-11-04
updated: 2026-11-04
author: "Naveen"
scribe: "Antigravity"
tags: [security, threat-model, audit, explore, sanctuary-api, proxy, lfi, xss]
---

# Comprehensive Security Audit, Threat Vectors & Architectural Findings

## 1. Executive Summary & Context Alignment

This audit was conducted to resolve security vectors surrounding `gurudevi-web`'s multi-host architecture (`explore.gurudevi.app` vs `gurudevi.app`), and to systematically investigate common, overlooked security pitfalls across modern web applications.

Crucially, because **`apps/sanctuary-api`** is currently undergoing active horizontal foundation refactoring and restructuring (Hono v5 / oRPC v2 / native API cutover), **we deliberately avoided baking in rigid backend assumptions**. Instead, the web frontend boundary was fortified via **Hexagonal Ports & Adapters** (`lib/sanctuary/sessionSecurity.adapter.ts`), guaranteeing that frontend protections remain decoupled from backend evolution.

---

## 2. Intrusive Audit: Verified Findings Across 14 Vectors

| Vector | Finding in Codebase | Hardening & Verification | Status |
| :--- | :--- | :--- | :--- |
| **1. Session Cookie Leakage Across Subdomains** | Explore and Sanctuary share `.gurudevi.app` under standard DNS. | In `proxy.ts`, all session cookies (`sb-*`, `auth-*`) are stripped at the Edge before Explore handlers execute. In `app/(sanctuary)/layout.tsx`, `<AuthProvider>` is omitted for Explore. | **Secured & Tested** |
| **2. Explore Route Enumeration** | Explore previously used a blocklist, leaving new paths vulnerable. | Inverted to an **explicit allowlist** in production (`/welcome`, `/self`, `/badge.svg`). All other routes return 404 or redirect. | **Secured & Tested** |
| **3. Arbitrary File Read (LFI)** | `api/architecture/source/route.ts` and Server Actions read files without production checks. | Gated with `NODE_ENV === 'production'` 404 check and `FORBIDDEN_FILE_PATTERNS` regex blocking `.env*`, `.git*`, `*key*`, `*secret*`, `*cert*`, and `..` traversal. | **Secured & Tested** |
| **4. Open Redirects** | `app/auth/complete/route.ts` accepts `?returnTo=` and `?next=`. | `safeReturnPath()` uses origin validation against `https://gurudevi.invalid` and `normalizeAcceptedInternalRoute()` from `@repo/core`. Protocol-relative `//evil.com` rejected. | **Secured & Tested** |
| **5. SVG Reflected XSS** | `/api/og` and `/badge.svg` generate dynamic vector cards. | All user/URL-derived text is passed through `escapeXml()` replacing `&`, `<`, `>`, `"`, `'`. Zero script or event handler execution. | **Secured & Tested** |
| **6. JSON-LD `<script>` Breakouts** | Schema.org structured data in `lib/schema-org.tsx`. | `sanitizeJsonLd()` explicitly replaces `<` with `\u003c`, stopping `</script>` tag breakout attacks. | **Secured & Tested** |
| **7. Server-Side Request Forgery (SSRF)** | Audited all server-side `fetch()` occurrences. | Zero unvalidated server-side fetches. Internal requests use `@repo/core` `secureApiFetch()`, which strictly blocks `http:` outside local dev, strips credentials, and sets `{ redirect: 'error' }`. | **Secured & Tested** |
| **8. Next.js Server Actions CSRF** | Next.js Server Actions are public POST endpoints. | Only one file has `'use server'` (`app/(sanctuary)/architecture/actions.ts`), which is gated with production 404 and traversal checks. | **Secured & Tested** |
| **9. Clickjacking & Framing** | Framed click-jacking in iframes. | `proxy.ts` emits `X-Frame-Options: DENY` and CSP `frame-ancestors 'none'` universally. | **Secured & Tested** |
| **10. MIME-Sniffing & Referrer** | MIME type confusion or Referer URL leaks. | `X-Content-Type-Options: nosniff` and `Referrer-Policy: strict-origin-when-cross-origin` enforced. | **Secured & Tested** |
| **11. Multi-Tenant Parameter Tampering** | Manipulating `schoolId` or classroom params. | `loadAccountClassrooms()` and `loadAccountAttendance()` enforce that the cryptographic token subject matches the requested subject before making network queries. | **Secured & Tested** |
| **12. Cryptographic Timing Attacks** | Signature comparisons for PermissionSnapshots. | Uses Web Crypto API `crypto.subtle.verify()` with Ed25519; constant-time, asymmetric verification. Private key never touches client. | **Secured & Tested** |
| **13. DOM XSS (`dangerouslySetInnerHTML`)** | Scanned all `.tsx` files in repository. | Only 2 instances exist: theme bootstrap in `layout.tsx` (allowlist-validated) and `JsonLdScript` (escaped). | **Secured & Tested** |
| **14. Dev Labs Leaking to Public** | `/kit`, `/architecture`, `/verger-lab`, `/agent-lab`. | `/kit`, `/verger-lab`, and `/architecture` call `notFound()` if `NODE_ENV === 'production'`. `host-routing.ts` permits them freely on `localhost`. | **Secured & Tested** |

---

## 3. Decoupling Web Security from API Refactoring

Because the API team is actively refactoring `apps/sanctuary-api`, we ensured:
1. **The Web proxy does NOT enforce domain rules**: It only enforces **transport, host boundaries, and cookie security**.
2. **Hexagonal Security Adapter**: All auth/API URL dependencies are localized to `lib/sanctuary/sessionSecurity.adapter.ts`.
3. **Dynamic CSP**: Connect-src origins are dynamically fetched from runtime configurations rather than hardcoded URLs.

---

## 4. Developer Rules of Thumb

1. **Allowlist > Blocklist**: Never use blocklists to gate public/demo surfaces. Always define explicit allowlists.
2. **Server Actions are Public Endpoints**: Treat every `'use server'` export as a publicly addressable HTTP endpoint.
3. **SVG is Code**: When returning `image/svg+xml`, always escape XML special characters.
4. **Localhost Must Never Be Shackled**: Separate development preview policies from production firewalls.
5. **Reverse Tabnabbing**: Ensure all `target="_blank"` links include `rel="noopener noreferrer"`.
