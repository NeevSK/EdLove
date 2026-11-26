# Adding or changing a v1 API capability (this repository's layout)

A capability such as `ops.institutions.createInviteCode` is written in two files:

1. `packages/core/src/api/v1/ops/institutions/<name>.ts`: Zod input/output schemas (with exported types) and `export const <name> = foundation...input(...).output(...).meta(capability({ kind: 'query' | 'command' }))`. Errors every capability may return come from `foundation`; add capability-specific ones with `.errors({ CODE: {} })` before `.input()`. Shared shapes such as `InviteCodeItem` are in `_shared.ts` there.
2. `apps/sanctuary-api/src/institutions/capabilities/<name>.ts`: `export async function run(db, accountId, input)`, raw SQL on the account's own transaction. Shared helpers (such as `assertSchoolAuthority`) are in `_shared.ts` there.

Everything else is generated or derived by `apps/sanctuary-api/scripts/gen-capabilities.ts` (run by `./eval-check.sh`): the contract index, the router branch, the catalog entry (read from the `.meta` kind) and the module card's Commands/Queries lists. Do not edit `*.generated.ts` or `src/core/generated/`. Tests go in `apps/sanctuary-api/src/institutions/__tests__/institutions.test.ts`.

Throw `new ORPCError('CODE')` from `@orpc/server` for errors. Run `./eval-check.sh` at the repository root.
