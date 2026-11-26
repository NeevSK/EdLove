# How operations are added here (TypeSpec spec → generated contract)
1. `spec/main.tsp`: add models and the operation inside its domain namespace, following the existing ones: `@extension("x-cedar-action", "<Action>")`, `@operationId("<id>")`, `@post @route("<path>")`, `op name(@body body: Input): Output | NotFound | Conflict | ...;`. A header is a parameter `@header("name") name: string`. Optional field = `name?: T`; nullable = `T | null`. Discriminated union: see `Payment` (`@discriminated(#{ envelope: "none", discriminatorPropertyName: "kind" })`).
2. Run `./check.sh`: it regenerates `out/openapi.json` and `gen/*.gen.ts` from the spec and type-checks. Never edit `gen/` or `out/`.
3. `router.ts`: implement it with `os.<path>.handler(({ input }) => ...)`; input is `{ body, headers? }` (see existing handlers). Throw `new ORPCError('NOT_FOUND' | 'CONFLICT' | 'FORBIDDEN')`.
4. Run `./check.sh` again until it passes.
