---
title: "Identity Contract Audit"
status: "active"
created: 2026-06-26
updated: 2026-06-26
author: "Codex"
tags: [identity, onboarding, auth, supabase, zod, mobile, web]
---

# Identity Contract Audit

This note captures the current live identity rules after the guest-email drift cleanup.

## Current Contract

- `email` is optional and may be `null` for guest sessions.
- `display_name` is required for onboarding completion.
- `capacity` is required for onboarding completion.
- guest sessions are represented by `identity_state: anonymous` and `is_anonymous: true`.
- demo and sandbox are experience modes, not anonymous guest semantics.

## Canonical Sources

- Auth/session classification: `packages/core/src/logic/auth/identityState.ts`
- Session lifecycle: `packages/core/src/hooks/useAuthLifecycle.ts`
- Device account capture: `packages/core/src/accounts/deviceAccounts.ts`
- Identity API contract: `packages/core/src/api/identity.generated.ts`
- Onboarding server guard: `packages/core/src/api/handlers/onboarding.ts`

## Important Notes

- Do not infer guest state from `email` alone.
- Do not let developer or sandbox login bypass onboarding name/capacity collection.
- Demo mode should only be applied to existing accounts and should not create a new identity contract.

## Historical Docs

The older identity migration notes describe the evolution of the model and are still useful for context, but they should be treated as historical guidance, not the runtime contract.

