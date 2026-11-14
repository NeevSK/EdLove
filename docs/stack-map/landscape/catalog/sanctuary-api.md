# @repo/sanctuary-api — dependency footprint

> Part of the [Stack Catalog](../stack-map.md) · auto-generated · links point back to the master

Empty canonical API with verified horizontal Hono/oRPC, Cedar, identity and durable-operation seams.

## Workspace packages used

| Package | Layer | Purpose |
| :--- | :--- | :--- |
| [@repo/core](../stack-map.md#repocore) | core | Platform spine — shared contracts & infrastructure every domain relies on. |
| [@repo/policies](../stack-map.md#repopolicies) | domain | Authorization policy domain — Cedar WASM decision engine (permissions as data). |

## External deps (9 direct)

```text
@hono/node-server
@orpc/client
@orpc/contract
@orpc/server
effect
hono
jose
pg
zod
```

## Dev tooling (8)

```text
@biomejs/biome
@types/pg
@vitest/coverage-v8
cross-env
tsup
tsx
typescript
vitest
```

## Coupling notes

Binds core contracts + policies + pg for SQL-owned controls. ZenStack remains the domain ORM authority; client/business rebuild is deferred.

