---
title: "PowerSync Capabilities and Future Directions"
status: "active"
created: 2026-08-10
updated: 2026-08-10
author: "Codex"
tags: [powersync, capabilities, roadmap, offline-first, attachments, sync-streams, platform]
---

# PowerSync Capabilities and Future Directions

The product update describes a wider platform than the part currently used by Gurudevi. The useful question is not “what can PowerSync do in general?” but “which capabilities are mature enough, relevant to our product, and safe to introduce behind our data-highway boundaries?”

## Capability maturity

PowerSync distinguishes released functionality from maturity. The current official feature-status page marks Sync Streams and the JavaScript/Web, React Native, React Hooks, and Swift/Kotlin SDKs as GA. Drizzle, Kysely, OP-SQLite, the Node SDK, Capacitor, and the CLI have lower maturity labels. Azure DocumentDB and Convex connectors are experimental. Treat those labels as engineering constraints, not marketing detail.

## Available now and relevant to Gurudevi

### JavaScript SDK v2

The v2 line provides a cleaner public API, simpler database/connect configuration, a smaller logger surface, lazy WebSocket loading, ESM-only packages, and current native/web SDK behavior. This is the main immediate opportunity because it improves the foundation we already have, but it requires a deliberate migration.

### Sync Streams

Sync Streams can subscribe on demand, use authentication/connection/subscription parameters, retain data with a configurable TTL, and support UI-managed subscriptions. They are now listed as GA and are recommended for new projects. This maps well to Gurudevi’s school, classroom, role, and account scopes.

Potential product uses:

- subscribe to one classroom roster only while the classroom workflow is active;
- prefetch a teacher’s assigned classrooms for a bounded offline window;
- keep identity and policy data auto-subscribed;
- release large or sensitive streams when leaving a workflow;
- use TTL as a warm-cache policy, not as an authorization boundary.

### Browser-local data

The Web SDK supports browser-local SQLite through WASQLite and selectable VFS strategies. OPFS is the preferred persistence direction where browser support and private-mode behavior are acceptable, with an IndexedDB fallback strategy. This can make the web surface genuinely local-first, but it requires verified workers/assets, account scoping, multi-tab tests, browser compatibility checks, and a clear encryption posture.

### Built-in attachment utilities

The standalone JavaScript attachment helper is deprecated. Current SDKs provide built-in attachment functionality, with platform-specific storage adapters. This opens a path for offline-first photos, scanned documents, student work, and teacher resources:

- write attachment metadata and the domain record atomically;
- persist the file locally;
- upload later with retry and observable state;
- store files in a remote object store rather than in the relational sync payload;
- keep permission, retention, and deletion rules separate from the file queue.

The JavaScript attachment library and React Native storage adapter are still alpha-level in the official feature matrix, so this belongs after core data sync is stable.

### Diagnostics and operations

The PowerSync ecosystem now includes a Sync Diagnostics Client, searchable instance logs, CLI validation/deployment commands, monitoring guidance, replication-lag documentation, and a Terraform provider. These are high-value operational capabilities even when the app’s feature set stays unchanged.

Recommended uses:

- validate Sync Streams in CI;
- pull and diff deployed service configuration;
- provision non-production instances with Terraform;
- track sync connection failures, upload failures, download failures, and replication lag;
- attach a diagnostics workflow to support cases without exposing user data.

## Interesting but not immediate

### Multi-process Swift access

Swift App Groups and extension/widget access are relevant to a future iOS widget or share extension. They are not a React Native v2 migration task and have known early-release footguns. Revisit only after the mobile database lifecycle is stable.

### Additional source databases

Azure DocumentDB and Convex connectors expand where PowerSync can sit, but both are experimental. Gurudevi currently has a Supabase/Postgres-shaped connector and should not add a second source database merely because it is available.

### Other SDKs

Node.js, .NET, Tauri, Rust, Capacitor, TanStack DB, and new ORM integrations create future options for admin tools, desktop utilities, background processors, and local AI workflows. They should be evaluated per product need; they are not reasons to broaden the mobile dependency graph now.

### Local-first AI workflows

PowerSync’s community examples show the shape of a powerful future: aggregate governed data into local SQLite and let agents query it from a local UI, CLI, Slack integration, or offline model. For Gurudevi, that could become offline teacher assistance, local classroom search, or policy-aware personal analytics. It must be built on explicit data minimization, local authorization, model-boundary controls, and stale-data disclosure; it is a product direction, not an automatic consequence of adding PowerSync.

## Proposals, not commitments

The mail mentions proposals for SQLite/MySQL bucket storage and connection-count/error metrics. These are valuable signals for self-hosting and observability, but they are not capabilities to design against until released and documented as supported. Keep them in the watch list.

## Recommended opportunity order

1. Upgrade the JavaScript SDK family and make the existing core reliable.
2. Activate one tested, narrowly scoped Sync Stream vertical slice.
3. Add durable observability and diagnostics.
4. Complete browser-local support only for explicitly selected workflows.
5. Add attachments for a real product scenario with retention and authorization rules.
6. Explore local-first AI or widgets after the data and security contracts are proven.

## Sources

- [PowerSync feature status](https://docs.powersync.com/resources/feature-status)
- [Sync Streams overview](https://docs.powersync.com/sync/overview)
- [Supported platforms](https://docs.powersync.com/resources/supported-platforms)
- [Client SDK overview](https://docs.powersync.com/client-sdks/overview)
- [PowerSync Terraform provider](https://docs.powersync.com/tools/terraform-provider)
- [PowerSync CLI](https://docs.powersync.com/tools/cli)
- [Improved JavaScript attachment utilities](https://releases.powersync.com/announcements/improved-attachment-utilities-in-the-javascript-sdks)
- [PowerSync roadmap](https://roadmap.powersync.com/)

