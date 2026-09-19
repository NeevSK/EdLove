---
title: "Custom Domain Routing & Cloudflare DNS SOP (intuituilabs.studio)"
status: "active"
created: 2026-09-19
updated: 2026-09-19
author: "Naween"
scribe: "Antigravity"
tags: [infrastructure, dns, cloudflare, vercel, intuituilabs, edlove, sop]
---

# Custom Domain Routing & Cloudflare DNS SOP

> **Scope**: Standard Operating Procedure (SOP) for configuring custom domains registered via third-party registrars (e.g. Porkbun, Namecheap), managed by Cloudflare DNS, and hosted on Vercel's global edge network.
> **Reference Domain**: `intuituilabs.studio` / `www.intuituilabs.studio`
> **Associated Project**: `intuituilabs-web` (`C:\projects\intuitui-web`)

---

## 1. Architecture Overview

```
[User Browser]
       │
       ▼ (HTTPS / 443)
[Cloudflare Nameservers] (gene.ns.cloudflare.com / west.ns.cloudflare.com)
       │
       ▼ (DNS Resolution: DNS Only / Gray Cloud initially)
[Vercel Global Edge Network] (76.76.21.21 / cname.vercel-dns.com)
       │
       ▼
[Deployed Web Application] (intuituilabs-web / Astro + Svelte + Tailwind)
```

---

## 2. Dev Tooling Setup (Preventing Repeated NPX Downloads)

To prevent wasting bandwidth, data, and time by running `npx` repeatedly, install the necessary management CLI tools locally as project `devDependencies`:

```bash
# In the project directory:
pnpm add -D vercel wrangler
```

### Authentication:
```bash
# One-time interactive terminal logins:
pnpm exec vercel login
pnpm exec wrangler login
```

Verify authentication status:
```bash
pnpm exec vercel whoami
pnpm exec wrangler whoami
```

---

## 3. Step-by-Step Domain Wiring Runbook

### Step 3.1: Add Domain to Vercel Project
From the project folder, attach both the root (apex) and `www` subdomains to the target Vercel project:

```bash
pnpm exec vercel domains add intuituilabs.studio intuituilabs-web
pnpm exec vercel domains add www.intuituilabs.studio intuituilabs-web
```

---

### Step 3.2: Configure Cloudflare DNS Records
In **Cloudflare Dashboard** &rarr; Select Domain &rarr; **DNS** &rarr; **Records**:

1. **Delete Conflicting / Default Records**:
   - Remove default registrar parking `A` records (e.g., old Porkbun/Namecheap parking IPs like `207.207.210.x`).
   - Remove default parking `CNAME` records (e.g., `pixie.porkbun.com`).

2. **Add Vercel DNS Records**:

| Type | Name / Host | Target / Content | Proxy Status | TTL | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **A** | `@` *(or root domain)* | `76.76.21.21` | **DNS Only** (Gray Cloud) | Auto | Direct apex routing to Vercel |
| **CNAME** | `www` | `cname.vercel-dns.com` | **DNS Only** (Gray Cloud) | Auto | Subdomain routing |
| **CNAME** | `*` *(Optional)* | `cname.vercel-dns.com` | **DNS Only** (Gray Cloud) | Auto | Wildcard routing if required |

> [!IMPORTANT]
> **Keep Proxy Status set to "DNS Only" (Gray Cloud)** during initial certificate generation. Cloudflare proxying (Orange Cloud) can interfere with Let's Encrypt HTTP-01 challenge verification if SSL mode is mismatched.

---

### Step 3.3: Verify Domain & Issue SSL Certificates via Vercel CLI

Verify domain configuration status:
```bash
pnpm exec vercel domains verify intuituilabs.studio
pnpm exec vercel domains verify www.intuituilabs.studio
```

Issue/Provision Let's Encrypt SSL/TLS certificates:
```bash
pnpm exec vercel certs issue intuituilabs.studio www.intuituilabs.studio
```

Inspect active certificates:
```bash
pnpm exec vercel certs ls
```

---

### Step 3.4: Set Cloudflare SSL/TLS Encryption Mode
In **Cloudflare Dashboard** &rarr; Select Domain &rarr; **SSL/TLS** &rarr; **Overview**:
- Set Encryption Mode to **Full (strict)**.
- *Rationale*: Prevents `ERR_TOO_MANY_REDIRECTS` loops between Cloudflare edge and Vercel edge.

---

## 4. Verification & Testing

Verify that DNS propagation and SSL handshakes succeed:

```powershell
# Verbose TLS handshake check:
curl.exe -Iv https://intuituilabs.studio
curl.exe -Iv https://www.intuituilabs.studio
```

Expected HTTP response:
```http
HTTP/1.1 200 OK
Server: Vercel
Strict-Transport-Security: max-age=63072000
X-Vercel-Cache: HIT (or MISS)
```

---

## 5. Troubleshooting & FAQ

| Issue / Symptom | Root Cause | Solution |
| :--- | :--- | :--- |
| `invalid_configuration` on Vercel | Residual default registrar parking `A` records exist. | In Cloudflare DNS, delete any `A` records pointing to registrar default IPs. |
| `HandshakeFailure` / SSL Error | SSL certificate not yet issued by Vercel. | Run `pnpm exec vercel certs issue <domain> <www.domain>`. |
| `ERR_TOO_MANY_REDIRECTS` | Cloudflare SSL mode is set to "Flexible". | Change Cloudflare SSL/TLS mode to **Full (strict)**. |
| `wrangler` cannot edit DNS | Wrangler CLI is designed for Workers/Pages/R2/D1, not general DNS zones. | Use Cloudflare Dashboard or Cloudflare REST API for DNS records. |
