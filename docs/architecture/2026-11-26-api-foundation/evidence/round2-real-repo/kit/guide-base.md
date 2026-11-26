# Adding or changing a v1 API capability (this repository's layout)

A capability such as `ops.institutions.createInviteCode` lives in these places, and the fitness tests keep them in step:

1. `packages/core/src/api/v1/contract.ts`: Zod input/output schemas (with exported types) and the entry in `appContract`. Errors every capability may return come from `foundation`; add capability-specific ones with `.errors({ CODE: {} })` before `.input()`.
2. `apps/sanctuary-api/src/institutions/institutions.ts`: the handler function `(db, accountId, input)`, raw SQL on the account's own transaction.
3. `apps/sanctuary-api/src/core/router.ts`: wires the contract entry to the handler through `asAccount`.
4. `apps/sanctuary-api/src/modules/catalog.ts`: a `CapabilityManifest` entry (kind query/command, channels, assurance, status, requiredEvidence).
5. `docs/architecture/domains/ops/institutions.md`: the module card lists the capability under Commands or Queries.
6. `apps/sanctuary-api/src/modules/contractPaths.test.ts`: the expected list of capability names.
7. Tests in `apps/sanctuary-api/src/institutions/__tests__/institutions.test.ts`.

Throw `new ORPCError('CODE')` from `@orpc/server` for errors. Run `./eval-check.sh` at the repository root.
