---
name: zenstack
description: "Comprehensive guide for ZenStack V3 ORM, ZModel schema modeling, access control policies (@@allow/@@deny), database migrations, and client querying. Trigger when editing .zmodel schemas, writing access control rules, running zen generate/migrate, or querying ZenStackClient."
---

# ZenStack V3 Suite Director

Hierarchical director for all ZenStack V3 data modeling, policy enforcement, migrations, and ORM operations.

## Progressive Disclosure Router

Consult the targeted domain reference based on your task intent:

| Task Intent | Target Reference | Key Workflows & Triggers |
| :--- | :--- | :--- |
| **Schema Modeling** | [`references/schema-modeling.md`](./references/schema-modeling.md) | Models, relations, attributes (@id, @default), enums, custom types, @@delegate |
| **Access Control Policies** | [`references/access-control.md`](./references/access-control.md) | @@allow / @@deny rules, auth() context, field-level rules, post-update policies |
| **Querying & Mutations** | [`references/querying.md`](./references/querying.md) | ZenStackClient, findMany/create/update, transactions, Kysely escape hatch ($qb) |
| **Database Migrations** | [`references/migrations.md`](./references/migrations.md) | zen migrate dev/deploy/reset, zen db push, seed scripts, schema sync |
| **CRUD Web APIs** | [`references/crud-server.md`](./references/crud-server.md) | Server adapters (Hono, Next.js, Express), RPC endpoints, getClient |
| **Plugin Development** | [`references/plugin-dev.md`](./references/plugin-dev.md) | Custom plugins, generator extensions, runtime hooks |
| **Setup & Project Config** | [`references/project-setup.md`](./references/project-setup.md) | Project initialization, zen CLI commands, dependencies |
| **Prisma / V2 Migrations** | [`references/migrate-from-prisma.md`](./references/migrate-from-prisma.md) | Upgrading from Prisma or ZenStack V2 to ZenStack V3 |
