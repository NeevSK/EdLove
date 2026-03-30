# POA Foundation Progress - 2026-03-27

## Scope Completed In This Wave

This wave established the shared POA migration foundation and migrated the educational domain as the reference implementation.

Implemented:

- Contract coverage registry for API modules
- Strict unmapped-method detection in `createPOAProxy`
- Educational domain ports, services, and Supabase adapter
- Educational API modules routed through service and repository layers instead of direct Supabase calls
- Strict POA proxy coverage for:
  - `attendance`
  - `classrooms`
  - `lessons`
  - `students`
  - `assignments`
  - `classroomStudents`
  - `lessonMaterials`
  - `grading`
- Drift test for educational contract coverage

## Production-Shaped Areas

These now follow the intended architecture:

- `contracts -> POA proxy -> service -> repository port -> Supabase adapter`
- API surface authority is enforced before execution
- Educational data access is behind a modular adapter boundary
- Educational APIs can be swapped from Supabase to another adapter without changing UI call sites

Key files:

- `packages/core/src/api/contractCoverage.ts`
- `packages/core/src/api/poaProxy.ts`
- `packages/core/src/domains/educational/ports.ts`
- `packages/core/src/domains/educational/services.ts`
- `packages/core/src/domains/educational/runtime.ts`
- `packages/core/src/adapters/supabase/educationalRepository.ts`

## Verified

Passing focused tests:

- `apps/gurudevi-mobile/src/__tests__/architecture/poa_enforcement.test.ts`
- `apps/gurudevi-mobile/src/__tests__/architecture/educational-contract-coverage.test.ts`

What those tests prove:

- POA authorization is fail-fast for covered APIs
- Educational contract coverage is registered and enforced for the migrated modules

## Not Yet Production-Ready Platform-Wide

The platform is still not fully production-ready end to end.

Remaining blockers:

- ZenStack is not yet the active server-side persistence path for the migrated educational domain
- Many non-educational modules are still only partially contract-backed or still on older patterns
- Repo-wide TypeScript is still red due to pre-existing drift outside the new educational foundation
- Legacy sync wiring still points at old API method shapes in some places

Current repo-wide TypeScript blockers observed after this wave:

- missing legacy schema exports in `packages/core/src/api/schemas/*`
- outdated sync registry method expectations in `packages/core/src/lib/sync/registry.ts`
- CASL ability typing cleanup needed in `packages/core/src/permissions/abilities/base.ts`

## Recommended Next Wave

1. Migrate sync/consumer layers that still assume old student/resource methods onto the new contract-backed educational APIs.
2. Extend the contract coverage registry and strict proxy enforcement to `school`, `inventory`, `community`, and `staffManagement`.
3. Introduce a ZenStack-backed educational repository and move server-side execution onto it.
4. Add CI checks for:
   - contract without implementation
   - implementation without contract
   - proxy methods without contract metadata
5. Repeat the same service-port-adapter migration pattern for `self`, `library`, and `community`.
