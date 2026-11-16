---
title: "Subdomain Edge Routing, Session Isolation, and External Window Security Architecture"
status: "active"
created: 2026-11-08
updated: 2026-11-08
author: "Naveen"
scribe: "Antigravity"
tags: [security, routing, subdomain, proxy, CSP, COOP, external-links, session-isolation, enterprise-architecture, unified-routing-standard]
---

# Subdomain Edge Routing, Session Isolation, and External Window Security Architecture

> **Executive Summary**: This document specifies the comprehensive production and enterprise-grade architecture for multi-subdomain partitioning (`gurudevi.app`, `sanctuary.gurudevi.app`, `explore.gurudevi.app`, and school vanity subdomains), edge proxy request validation, session cookie isolation, safe cross-origin window management, data exfiltration defense, and the **Unified Tri-Surface Non-Discriminatory Routing Standard**.

---

## 1. The Unified Tri-Surface Routing Standard (The Law of Consistent Treatment)

Previously, the platform suffered from **discriminatory, ad-hoc routing treatments** across its three primary surfaces:
- If an explorer on `explore.gurudevi.app` clicked legal or informational links (`/privacy`, `/terms`, `/faq`, `/about`), they were hit with a raw **404**, whereas on `sanctuary.gurudevi.app`, those exact same links gracefully redirected to `gurudevi.app`.
- The interactive Tutti Walkthrough Tour (`/intro`) was completely blocked on Explore and Sanctuary.

We have eliminated all discriminatory special-casing by establishing a **single, unified routing standard** across all three surfaces:

| Route Classification | On Public Web (`gurudevi.app`) | On Sanctuary Web (`sanctuary.gurudevi.app`) | On Explore Web (`explore.gurudevi.app`) |
| :--- | :--- | :--- | :--- |
| **1. Public Content** (`/about`, `/faq`, `/terms`, `/privacy`, `/journal`, `/status`, `/thuthimal`) | **Render Directly (200 OK)** | **Redirect (HTTP 307)** to `https://gurudevi.app${pathname}` (preserves path) | **Redirect (HTTP 307)** to `https://gurudevi.app${pathname}` (*No discriminatory 404s!*) |
| **2. Interactive Guide Tour** (`/intro`, `/explore-intro`) | **Render Directly (200 OK)** | **Render Directly (200 OK)** (Interactive Tutti tour admitted) | **Render Directly (200 OK)** (Interactive Tutti tour admitted) |
| **3. Guest Showroom** (`/self`, `/workspace`, `/community`, `/library`, `/atlas`, `/settings`, `/notifications`, `/profile`, `/support`) | **Redirect (HTTP 307)** to `sanctuary.gurudevi.app${pathname}` | **Render Authenticated (200 OK)** (or challenge login via `/welcome?returnTo=...`) | **Render Guest Showroom (200 OK)** (Mock fixtures, local storage, zero Supabase credentials) |
| **4. Private Staff/Admin** (`/admin`, `/account-recovery`, `/verger-lab`, `/onboarding`) | **Redirect (HTTP 307)** to Sanctuary Welcome Gateway | **Render Authenticated (200 OK)** (Guarded by session contracts) | **Redirect (HTTP 307)** to Sanctuary Welcome Gateway (`/welcome?returnTo=...`) |
| **5. Auth Flows** (`/sign-in`, `/sign-up`, `/auth/*`) | **Redirect (HTTP 307)** to `sanctuary.gurudevi.app${pathname}` | **Render Auth Engine (200 OK)** | **Redirect (HTTP 307)** to `sanctuary.gurudevi.app${pathname}` |
| **6. Truly Unmapped** (Typos, deleted endpoints, invalid garbage) | **Rewrite to `/not-found`** (HTTP 404 Branded Tutii Page) | **Rewrite to `/not-found`** (HTTP 404 Branded Tutii Page) | **Rewrite to `/not-found`** (HTTP 404 Branded Tutii Page) |

---

## 2. Threat Model & Failure Modes

### Threat 1: The "0-Byte 404" Chromium Drop
- **Mechanism**: The edge proxy rejects unadmitted paths with `new NextResponse(null, { status: 404 })`.
- **Impact**: Chromium and WebKit detect empty bodies on top-level navigation and replace the page with a browser-native crash UI (*"This page can't be found - HTTP ERROR 404"*).
- **Remediation**: Rewrite unmapped document requests to the internal `/not-found` component so users receive a branded, navigable error screen.

### Threat 2: The Wildcard Domain Cookie Harvest & Accidental Global Logout
- **Mechanism**: If auth cookies are scoped to `.gurudevi.app`, the browser automatically sends them to `explore.gurudevi.app` and any school vanity subdomain.
- **Remediation**: 
  1. Enforce **Host-Only Cookies** on `sanctuary.gurudevi.app` without the `Domain` attribute.
  2. Implement `__Host-` prefixed auth cookies (`__Host-sb-token`) as mandated by RFC 6265bis.
  3. Explore cookie amputation (`Max-Age=0`) acts as defense-in-depth on the edge.

### Threat 3: Asynchronous Popup Blocker Interception
- **Mechanism**: User clicks an external link $\rightarrow$ application awaits an async preference lookup $\rightarrow$ `window.open()` is called. Browser blocks it as an unsolicited popup because transient user activation expired.
- **Remediation**: Pre-resolve user open preferences synchronously on component mount. Attach `window.open()` directly to the synchronous user click event handler.

### Threat 4: Reverse Tabnabbing & Process Concurrency Hijacking
- **Mechanism**: Links opened with `target="_blank"` without `rel="noopener noreferrer"` leave `window.opener` bound to the parent tab.
- **Remediation**: Enforce `EXTERNAL_LINK_PROPS` (`target: '_blank'`, `rel: 'noopener noreferrer'`) and set `Cross-Origin-Opener-Policy: same-origin-allow-popups` (COOP).

---

## 3. Defense-in-Depth HTTP Header Matrix

| Header | Production Directive | Purpose |
| :--- | :--- | :--- |
| **Content-Security-Policy (Explore)** | `default-src 'self'; connect-src 'self'; frame-ancestors 'none'; form-action 'self'` | Mathematically prevents demo surface from exfiltrating data or receiving Supabase tokens |
| **Content-Security-Policy (Sanctuary)** | `default-src 'self'; connect-src 'self' [dynamic auth/api origins]; frame-ancestors 'none'; form-action 'self'` | Dynamic, environment-derived backend connections |
| **Cross-Origin-Opener-Policy** | `same-origin-allow-popups` | Isolates browsing context thread from external popups/tabs |
| **Referrer-Policy** | `strict-origin-when-cross-origin` | Strips paths and query tokens when leaving origin |
| **X-Frame-Options** | `DENY` | Anti-clickjacking protection |
| **X-Content-Type-Options** | `nosniff` | MIME-type sniffing defense |
| **Strict-Transport-Security** | `max-age=63072000; includeSubDomains; preload` | Enforces HTTPS strictly across all subdomains |
