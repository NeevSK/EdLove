# 🚀 Task List: Stabilizing Gurudevi Onboarding & Identity

## ✅ Completed
- [x] **Schema Synchronization**: Added `school_role`, `work_roles`, `tenant_kind`, and onboarding status flags to `schema.zmodel` and database.
- [x] **Type Reconciliation**: Updated `permissions.ts` and `profileRepository.ts` to reflect schema changes.
- [x] **API Stabilization**: Hardened Supabase fetch interceptor to handle `Request` objects.
- [x] **Build Fix**: Decoupled `database` from `core/zen` and fixed `tsc` errors.

## 🛠️ Phase 1: The "Truthful" Schema Extraction
*Goal: Resolve circular dependencies and enable sharing with marketing/event-bus.*
- [ ] **Task 1.1**: Create `packages/schema` directory and initialize `package.json`.
- [ ] **Task 1.2**: Move `schema.zmodel` to `packages/schema/zenstack/schema.zmodel`.
- [ ] **Task 1.3**: Update `generate` script to output to `packages/schema/src/generated`.
- [ ] **Task 1.4**: Update `@repo/core` and `@repo/database` to depend on `@repo/schema`.

## 🛡️ Phase 2: Repository Hardening
*Goal: Eliminate 'any' types and achieve 100% type safety.*
- [ ] **Task 2.1**: Refactor `profileRepository.ts` to use generated ZenStack types instead of `as any`.
- [ ] **Task 2.2**: Audit all other repositories in `core` for similar index-signature clashing.

## 🎭 Phase 3: Identity & Onboarding Elegance
*Goal: Move to state-driven onboarding and clean identity abstractions.*
- [ ] **Task 3.1**: Implement `OnboardingState` machine to replace manual column checks.
- [ ] **Task 3.2**: Refactor `identity.ts` to separate "Identity Provider" (Supabase) from "User Profile" (Gurudevi Domain).
