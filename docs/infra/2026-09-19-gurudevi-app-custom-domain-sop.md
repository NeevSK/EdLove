---
title: "Custom Domain SOP: gurudevi.app (Cloudflare DNS & Vercel Hosting)"
status: "active"
created: 2026-09-19
updated: 2026-09-19
author: "Naween"
scribe: "Antigravity"
tags: [infrastructure, dns, cloudflare, vercel, gurudevi, domain, sop]
---

# Custom Domain SOP: gurudevi.app

> **Scope**: Standard Operating Procedure (SOP) for configuring `gurudevi.app` with Cloudflare DNS, Vercel edge hosting (targeting `apps/gurudevi-web`), and setting up native deep linking.

---

## 1. Architecture Topology

```
                      [User / Browser / Mobile App]
                                    │
                                    ▼ (HTTPS / 443)
              [Cloudflare Nameservers for gurudevi.app]
              (DNS Resolution: DNS Only / Gray Cloud initially)
                                    │
          ┌─────────────────────────┴─────────────────────────┐
          │                                                   │
          ▼                                                   ▼
[Vercel Global Edge (76.76.21.21)]               [Subdomain Routing / API]
 (Host: gurudevi.app & www.gurudevi.app)          (sanctuary.gurudevi.app / api)
          │
          ▼
[apps/gurudevi-web (Next.js 16 App Router)]
```

---

## 2. Dev Tooling & CLI Prerequisites

Ensure local CLI tools are installed in the workspace/project without relying on repetitive npx downloads:

```bash
# In the project or apps/gurudevi-web directory:
pnpm add -D vercel wrangler
```

Verify authentication:
```bash
pnpm exec vercel whoami
pnpm exec wrangler whoami
```

---

## 3. Step-by-Step Vercel & Cloudflare Configuration

### Step 3.1: Attach Domain in Vercel Project
Link `gurudevi.app` and `www.gurudevi.app` to the `gurudevi-web` Vercel project:

```bash
pnpm exec vercel domains add gurudevi.app gurudevi-web
pnpm exec vercel domains add www.gurudevi.app gurudevi-web
```

---

### Step 3.2: Configure DNS Records in Cloudflare Dashboard

In **Cloudflare Dashboard** &rarr; Select `gurudevi.app` &rarr; **DNS** &rarr; **Records**:

1. **Delete any registrar parking records** (e.g. default Porkbun / Namecheap parking IPs or CNAMEs).
2. **Add Vercel DNS Records**:

| Type | Name / Host | Target / Content | Proxy Status | TTL | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **A** | `@` *(root)* | `76.76.21.21` | **DNS Only** (Gray Cloud) | Auto | Apex routing to Vercel |
| **CNAME** | `www` | `cname.vercel-dns.com` | **DNS Only** (Gray Cloud) | Auto | Subdomain routing to Vercel |
| **CNAME** | `sanctuary` | `cname.vercel-dns.com` | **DNS Only** (Gray Cloud) | Auto | Authenticated sanctuary route |

> [!IMPORTANT]
> **Keep Proxy Status set to "DNS Only" (Gray Cloud)** initially so Vercel can complete the Let's Encrypt HTTP-01 challenge and issue SSL/TLS certificates smoothly.

---

### Step 3.3: Verify Domain & Issue SSL Certificates via Vercel CLI

Verify domain configuration status:
```bash
pnpm exec vercel domains verify gurudevi.app
pnpm exec vercel domains verify www.gurudevi.app
```

Issue/Provision Let's Encrypt SSL/TLS certificates:
```bash
pnpm exec vercel certs issue gurudevi.app www.gurudevi.app
```

---

### Step 3.4: Set Cloudflare SSL/TLS Encryption Mode
In **Cloudflare Dashboard** &rarr; Select `gurudevi.app` &rarr; **SSL/TLS** &rarr; **Overview**:
- Set Encryption Mode to **Full (strict)**.
- *Rationale*: Prevents `ERR_TOO_MANY_REDIRECTS` loops between Cloudflare edge and Vercel edge.

---

## 4. Supabase & Auth Redirect Whitelisting

Update Supabase project authentication settings for `gurudevi.app`:

1. **Site URL**:
   - `https://gurudevi.app`
2. **Redirect URLs (Wildcard whitelist)**:
   - `https://gurudevi.app/**`
   - `https://www.gurudevi.app/**`
   - `https://sanctuary.gurudevi.app/**`
   - `gurudevi://auth/callback`

---

## 5. Mobile App Universal Links & Deep Linking (`apps/gurudevi-mobile`)

For iOS Associated Domains and Android App Links, configure `gurudevi.app` host:

- **iOS `associatedDomains`**: `applinks:gurudevi.app`, `applinks:sanctuary.gurudevi.app`
- **Android `intentFilters`**:
  ```json
  {
    "action": "VIEW",
    "autoVerify": true,
    "data": [
      {
        "scheme": "https",
        "host": "gurudevi.app",
        "pathPrefix": "/qr"
      }
    ],
    "category": ["BROWSABLE", "DEFAULT"]
  }
  ```

---

## 6. Future Migration Runbook: Vercel &rarr; Cloudflare Pages / Workers

When scaling and moving out of Vercel to Cloudflare to avoid egress/seat limits:

1. **Deploy Build to Cloudflare Pages**:
   ```bash
   pnpm exec wrangler pages project create gurudevi-web
   # For static/OpenNext export:
   pnpm exec wrangler pages deploy .vercel/output/static --project-name=gurudevi-web
   ```
2. **Attach Custom Domain in Cloudflare Dashboard**:
   - **Workers & Pages** &rarr; `gurudevi-web` &rarr; **Custom Domains** &rarr; Add `gurudevi.app`.
   - Cloudflare will automatically update internal DNS records and enable **Proxied** (Orange Cloud).
3. **Remove Domain from Vercel**:
   - `pnpm exec vercel domains rm gurudevi.app`
   - `pnpm exec vercel domains rm www.gurudevi.app`
