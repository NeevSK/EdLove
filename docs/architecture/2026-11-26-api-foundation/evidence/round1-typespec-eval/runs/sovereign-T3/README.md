# How operations are added here (SovereignContract)
1. `contract.ts`: add a route entry `{ method: 'post', path, operationId, request: { body, headers? }, responses: { 200: { schema, description } }, errors: [...], metadata: { cedarAction, policy } }`. Use `z.strictObject` for every object.
2. `handlers.ts`: add a handler with the same key: `({ body, headers }) => result`. Throw `new ApiError('NOT_FOUND' | 'CONFLICT' | 'FORBIDDEN')` (the code must be listed in the route's `errors`).
3. Run `./check.sh` (type check). Fix and repeat until it passes.
