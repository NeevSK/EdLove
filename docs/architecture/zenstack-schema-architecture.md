---
title: "ZenStack Schema & Database Architecture"
status: "active"
created: 2026-06-26
updated: 2026-06-26
author: "Naveen"
scribe: "Antigravity"
tags: [architecture, zenstack, zod, schema, database]
---

# ZenStack Schema & Database Architecture

## Package Split: `@repo/schema` (L0) + `@repo/database` (L1)

| Package | Layer | Role | Key Dependencies |
|---|---|---|---|
| `@repo/schema` | L0 (kernel) | Shared schema definition, ORM metadata, Zod factories | `@zenstackhq/orm`, `@zenstackhq/zod`, `zod` |
| `@repo/database` | L1 (client factory) | ZenStack-enhanced Kysely client + test utilities | `@repo/schema`, `kysely`, `pg`, `@zenstackhq/orm` |

### Why two packages?

- **`@repo/schema` is dependency-free infrastructure** — no database drivers, no Kysely. Other packages (`@repo/core`) import types without pulling in DB runtime deps.
- **`@repo/database` creates the `ZenStackClient`** — the only consumer is `apps/sanctuary-api`. Kysely + pg + connection pooling stay contained.

## Schema Definition (`schema.zmodel`)

Location: `packages/schema/schema.zmodel` (1150 lines, 49 ZModel models)

### Plugins

```zmodel
plugin orm {
  provider = "@zenstackhq/orm"
  output = "./src/generated/orm"
}

plugin policy {
  provider = "@zenstackhq/plugin-policy"
}
```

- **`plugin orm`** generates model types, input types, and ORM metadata into `src/generated/orm/`.
- **`plugin policy`** is registered **without an `output` path**. The policy plugin is needed at compile time so the ZenStack language server can resolve `@@allow` / `@@deny` ReBAC attributes. No policy artifacts are emitted — runtime enforcement happens through `ZenStackClient`.
- **`plugin zod` was removed** (see Runtime Zod section below).

## Runtime Zod (V3 Pattern)

Instead of V2-style codegen via `plugin zod`, the V3 runtime pattern uses `createSchemaFactory` from `@zenstackhq/zod`:

```ts
import { createSchemaFactory } from '@zenstackhq/zod';
import { schema } from './generated/orm/schema';

const factory = createSchemaFactory(schema);
export const makeModelSchema = factory.makeModelSchema.bind(factory);
export const makeTypeSchema = factory.makeTypeSchema.bind(factory);
export const makeEnumSchema = factory.makeEnumSchema.bind(factory);
```

This is the recommended approach since ZenStack v3.4.0+. The factory generates Zod schemas at runtime using the ORM metadata, eliminating the codegen step while keeping full type safety.

All 23 schema files in `@repo/core` import Zod validation schemas via `makeModelSchema` / `makeTypeSchema`.

## ZenStack DB Client

Location: `packages/database/src/client.ts`

```ts
export function createZenStackDb(user?: UserIdentity): ZenStackClient
```

Creates a Kysely client wrapped with ZenStack's policy enforcement layer. The `user` parameter drives ReBAC filtering — all `@@allow` / `@@deny` rules in `schema.zmodel` are applied automatically.

## Version History

| Date | ZenStack | Zod | Changes |
|---|---|---|---|
| 2026-09-01 | 3.8.3 | 4.5.4 | Upgraded to Zod 4.5 (`z.compile()`, `@zod/mini`, `z.validate()`, ~9x memory reduction). |
| 2026-06-26 | 3.8.0 | 4.3.6 | Upgraded from 3.6.4. Removed dead `plugin zod` codegen. Cleaned stale database scripts. |

## ReBAC Policy Architecture

- **Data-layer access control**: `@@allow` / `@@deny` rules in `schema.zmodel` (enforced by `ZenStackClient` at query time)
- **App-layer access control**: CASL abilities in `@repo/core` (used by UI for showing/hiding actions)
- **Drift risk**: These two layers must stay synchronized. See `apps/gurudevi-mobile/docs/architecture/2026-05-16-gurudevi-architecture-audit.md` for the full drift analysis.

## ZenStack Agent Skills

Official ZenStack agent skills are published at [zenstackhq/skills](https://github.com/zenstackhq/skills) and installed via `npx skills`:

```bash
npx skills add zenstackhq/skills --all
```

9 skills installed in this workspace under `.agents/skills/`:

| Skill | Domain |
|---|---|
| `zenstack-schema-modeling` | Authoring ZModel schemas, models, fields, relations, enums, types |
| `zenstack-access-control` | `@@allow` / `@@deny` ReBAC policies, `auth()`, field-level rules |
| `zenstack-querying` | ZenStackClient ORM API, Kysely escape hatch, validation, transactions |
| `zenstack-crud-server` | REST/RPC server adapters (Hono, Express, etc.), client consumption |
| `zenstack-db-migration` | `zen migrate dev/deploy`, `db push`, `db pull`, seeding |
| `zenstack-project-setup` | Installing ZenStack, scaffolding, `zen` CLI usage |
| `zenstack-migrate-from-prisma` | Migrating from `prisma`/`@prisma/client` to ZenStack |
| `zenstack-migrate-from-v2` | Upgrading from ZenStack V2 to V3 |
| `zenstack-plugin-dev` | Building custom plugins, CLI generators, runtime hooks |

After installing, sync across agent environments:

```bash
node scripts/sync-skills.mjs
```

This consolidates all skills into `.github/copilot-instructions.md` and syncs globally to Antigravity and Codex.

## Upgrading ZenStack

1. Update `pnpm-workspace.yaml` overrides (the source of truth for resolution)
2. Update individual `package.json` files in `apps/gurudevi-mobile`, `packages/schema`, `packages/database`, and `packages/core`
3. Run `pnpm up --latest -r` to resolve
4. Run `pnpm exec zenstack generate --schema packages/schema/schema.zmodel` from root
5. Run tests
