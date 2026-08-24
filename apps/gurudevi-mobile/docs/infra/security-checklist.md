---
title: "Gurudevi Security Checklist"
status: "active"
created: 2026-07-28
updated: 2026-07-28
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile]
---

# Gurudevi Security Checklist
*MANDATORY review for every pull request touching an endpoint or database schema.*

## 🔐 1. Authentication
- [ ] Supabase Auth utilized for session management.
- [ ] JWT verification enforced on all server-side routes.
- [ ] Proper token expiry handling on client.

## 🛡️ 2. Authorization (The Triple Layer)
- [ ] **ZenStack API**: Permission policies defined in `.zmodel`.
- [ ] **Supabase RLS**: Row Level Security enabled on all participating tables.
- [ ] **CASL Ability**: Front-end UI matches server permissions.
- [ ] **Grants**: Any cross-tenant data flow is linked to a valid sovereignty grant.

## 🔍 3. Input & Data Safety
- [ ] **Zod Validation**: All user input parsed/validated via Zod schemas.
- [ ] **No Raw SQL**: Interactions limited to ZenStack/Kysely/Prisma.
- [ ] **Sensitive Data**: PII is excluded from logs and error messages.
- [ ] **Audit Trail**: High-stakes operations (Deletes, Grants) logged to `audit.logs`.

## 🔋 4. Reliability & Rate Limiting
- [ ] **Idempotency**: High-volume write endpoints utilize `Idempotency-Key`.
- [ ] **Rate Limiting**: Applied to Auth (5/min) and Write (30/min) endpoints.
- [ ] **Failure Mode**: App gracefully handles network failures without data corruption.

## 🏗️ 5. Infrastructure
- [ ] **Secrets**: No API keys or secrets in source code; use Supabase Vault.
- [ ] **PII isolation**: Child data never sent to external generic LLM APIs without self-hosting/consent.
