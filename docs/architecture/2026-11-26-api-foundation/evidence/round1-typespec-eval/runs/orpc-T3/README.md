# How operations are added here (oRPC-first)
1. `contract.ts`: add the operation under its domain object: `oc.errors({...}).meta(cedar('<Action>'), route('<operationId>', '<path>'))`, then `.input(zod)` and `.output(zod)`. Use `z.strictObject` for every object. For a request header, pass `true` as the 3rd argument of `route` so the input becomes `{ headers, body }` (see `erp.invoices.create`).
2. `router.ts`: implement it with `os.<path>.handler(({ input }) => ...)`. Throw `new ORPCError('NOT_FOUND' | 'CONFLICT' | 'FORBIDDEN')` for errors (they must be listed in `.errors`).
3. Run `./check.sh` (type check). Fix and repeat until it passes.
