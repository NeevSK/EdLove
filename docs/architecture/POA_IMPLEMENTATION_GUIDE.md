# POA Implementation Guide

This document explains the implementation pattern that must be used when migrating a domain to production-grade POA.

## Required Layers

1. `contracts/`
2. `POA proxy`
3. `domain services`
4. `repository ports`
5. `adapters`

## Minimal Checklist

- Define or expand the `ts-rest` contract.
- Add `metadata.authority` to every route.
- Register coverage with `contractCoverage`.
- Wrap the exported API with `createPOAProxy`.
- Move orchestration into a domain service.
- Move persistence into a repository adapter.
- Add focused tests that prove fail-fast enforcement and coverage registration.

## Contract Coverage Rule

Every exported API method must satisfy one of these:

- direct route match
- route alias through a method mapping
- intentional internalization and removal from public export surface

## Reference Pattern

Reference implementation files:

- `packages/core/src/api/contractCoverage.ts`
- `packages/core/src/api/poaProxy.ts`
- `packages/core/src/domains/educational/*`
- `packages/core/src/adapters/supabase/educationalRepository.ts`

## Migration Warning

Do not simply add more proxies around raw database logic.

A migration is incomplete if:

- API modules still own raw persistence logic
- contracts do not cover the exported method surface
- strict unmapped-method detection is not enabled
- the data path cannot be swapped from Supabase to ZenStack or another adapter

## Transitional Bridge Rule

During package cleanup, an explicit public bridge API can be used as a temporary seam between workspace packages and domain packages.

That bridge is acceptable only if:

- it is publicly exported from the owning package
- it replaces direct feature imports or hidden deep coupling
- it is treated as transitional until the flow is moved behind a contract-covered POA path in `core` or the owning domain

A bridge is not a substitute for POA completion.
