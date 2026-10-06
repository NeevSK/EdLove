---
title: "Dependency Intelligence Graph Implementation Plan"
status: "active"
created: 2026-09-26
updated: 2026-09-26
author: "Naveen"
scribe: "Codex"
tags: [dependencies, react-native, expo, supabase, graph, implementation-plan]
---

# Dependency Intelligence Graph Implementation Plan

## Status and authority

This is the active execution plan for the Dependency Intelligence Graph. The durable architecture, scope, evidence policy, data model, and operational contracts are defined in [Dependency Intelligence Graph](../architecture/dependency-intelligence-graph.md). This plan does not authorize a package upgrade or native configuration change.

The delivery target is an internal, Supabase-backed knowledge system for mobile-native dependency history. It makes the current resolved graph, upstream release chronology, local impact, compatibility constraints, and community workaround evidence queryable without depending on an agent’s stale training data.

## Delivery order

### Phase 0 — Establish the baseline

- [ ] Snapshot direct production dependencies from `apps/gurudevi-mobile/package.json` and mobile-relevant root dependencies.
- [ ] Resolve the actual pnpm graph from `pnpm-lock.yaml`; record declaration/resolution differences and peer context.
- [ ] Inventory mobile configuration and local imports/call sites without editing product behavior.
- [ ] Classify every scoped dependency across runtime, build/release, data/correctness, functional capability, UX/accessibility, and observability/recovery.
- [ ] Identify the platform spine and its compatibility train before lower-risk capability packages are analysed.
- [ ] Link older dependency reports as historical evidence; create explicit findings for stale SDK/version statements rather than treating them as current guidance.

**Exit condition:** every scoped package has a stable name, declaration, resolved version, owner/category, impact profile, and baseline observation date.

### Phase 1 — Create durable graph storage

- [ ] Add a versioned Supabase migration for the restricted `dependency_intelligence` schema.
- [ ] Create normalized package, release, API, lifecycle event, compatibility, local-surface, evidence, workaround, review, and typed-edge tables.
- [ ] Add semver/range validation, unique source/hash/idempotency constraints, timestamps, provenance fields, full-text indexes, and pgvector support.
- [ ] Create RLS/grants so only service-side ingestion can write; expose only authenticated, read-only developer surfaces as required.
- [ ] Implement read-only profile, timeline, compatibility-path, local-impact, workaround, search, and coverage functions/views.
- [ ] Confirm GraphQL relationship exposure deliberately; do not expose raw evidence or write tables merely because they exist in the schema.

**Exit condition:** migrations apply cleanly, prohibited writes fail under RLS, read functions return typed empty results safely, and schema tests cover constraints and traversal boundaries.

### Phase 2 — Ingest release and evidence history

- [ ] Implement official-release ingestion for npm/maintainer release channels, official changelogs, API docs, migration guides, compatibility matrices, and verified maintainer issue responses.
- [ ] Implement source adapters for permitted community discovery: GitHub issues/discussions, Reddit, public X material, Stack Overflow, and selected technical blogs.
- [ ] Ingest every stable release in each scoped package’s current and immediately previous major, including patches; record omissions as coverage gaps.
- [ ] Extract release/API lifecycle events, exact applicable version ranges, compatibility relationships, and recommended migration actions.
- [ ] Retain community metadata and bounded excerpts only; attach confidence, environment/version scope, error signature, and source tier.
- [ ] Deduplicate by canonical URL/content hash and cluster repeated field reports without converting a cluster into a fact.
- [ ] Embed normalized documents for semantic retrieval while retaining the original structured facts and citations.

**Exit condition:** a complete two-major timeline is queryable for the platform spine and the system exposes coverage/gaps for all remaining scoped packages.

### Phase 3 — Connect local impact and access surfaces

- [ ] Build a deterministic local scanner for package imports, public APIs, config plugins, build settings, native module registration, routes/providers, tests, and platform-specific files.
- [ ] Persist findings as reviewed or candidate local surfaces, never as a replacement for source review.
- [ ] Add Supabase GraphQL documentation and read-only RPC access for exact version/path queries.
- [ ] Add the seven read-only Platform MCP tools specified by the canonical architecture document.
- [ ] Generate schema-versioned JSON snapshots and the dependency-intelligence documentation tree under `docs/stack-map/`; update indexes without hand-editing generated content.
- [ ] Ensure all results visibly separate official facts, local observations, reviewed field workarounds, and unreviewed leads.

**Exit condition:** an agent can ask why a package is installed, what changed from the resolved version to a proposed version, which local surfaces are exposed, and which recommendations are official versus field evidence.

### Phase 4 — Operate and gate upgrades

- [ ] Schedule 6-hour official scans, daily community and local-drift scans, and a weekly review queue in the server-side worker topology.
- [ ] Record fetch/retry/rate-limit/deletion failures without deleting earlier reviewed evidence.
- [ ] Define reviewer assignment, promotion/rejection rationale, and supersession handling.
- [ ] Require a fresh dependency dossier/query snapshot on every scoped dependency upgrade proposal.
- [ ] Add coverage/freshness reporting as a dependency-change gate. A missing profile blocks foundational upgrades; lower-tier exceptions require explicit rationale.
- [ ] Audit active dependency documentation and explicitly supersede or correct conflicting living guidance.

**Exit condition:** continuous collection, weekly review, generated outputs, and upgrade-gate reporting run without adding a mobile runtime dependency or weakening existing quality gates.

## Non-negotiable implementation constraints

- Follow `AGENTS.md`: never use `expo install --fix` or `expo install --check`; never edit `android/` or `ios/`; preserve sacred package pins unless the user explicitly authorizes a change.
- Use Supabase as a relational property graph. pgvector assists semantic search; it is not a substitute for typed relationships, semver ranges, or chronology.
- Keep collectors and credentials server-side. The Expo app does not query, mutate, or bundle this system.
- Treat all community material as evidence with uncertainty and provenance. Do not bulk-copy third-party posts.
- Preserve repository dirt and unrelated work. Do not regenerate existing stack-map outputs except through their owning script and only when their inputs change.
- Do not weaken tests, RLS, quality gates, or documentation status rules to satisfy an implementation shortcut.

## Acceptance matrix

| Area | Evidence of completion |
|---|---|
| Inventory | All scoped direct mobile-native packages are classified; declarations and lockfile resolutions are linked. |
| History | Each scoped package has stable release rows for current major and previous major, or an explicit coverage-gap row. |
| Trust | Every trusted event has a release/range, citation, source tier, review state, and action classification. |
| Graph | Compatibility and impact traversal returns cited paths and terminates safely on gaps/cycles. |
| Local impact | Found local imports/config/tests are queryable with repository-relative paths and observation date. |
| Search | Exact filters work without embeddings; hybrid search returns cited results and explains its non-authoritative ranking. |
| Access | GraphQL/RPC/MCP are read-only and enforce source-tier visibility and RLS. |
| Docs | Generated dossiers, indexes, and dated snapshots are deterministic and linked from stack-map navigation. |
| Operations | Collectors are idempotent, retry safely, retain failures, and produce a weekly human review queue. |
| Upgrade use | A sample upgrade review uses the system to identify version changes, local exposure, compatibility constraints, and field workarounds. |

## Required verification

Implementation verification includes G0/G1 tests for migration constraints, semver/range parsing, source-tier separation, review transitions, idempotent ingestion, query functions, and generated-output snapshots. G2 scenarios must cover a multi-package compatibility train, a deprecation-to-removal path, a local-impact trace, an official migration recommendation, and a separately labelled community workaround.

Any claim about a test run must follow the repository test-claim protocol: command/configuration, evidence level, engine/runtime, exact files/scenarios and counts, what assertions prove, and what they do not prove. Database fixtures and mocks do not prove Expo/Metro/native build/device behavior. Native verification remains subject to the Android/Expo rules in `AGENTS.md`.

## Handoff checklist for a fresh agent

1. Read the canonical architecture document first.
2. Read `AGENTS.md` before touching Expo, React Native, Gradle, config plugins, or dependency manifests.
3. Inspect current graph coverage and review queue before designing an ingestion adapter or querying a package.
4. Use the existing migration conventions under `apps/gurudevi-mobile/supabase/migrations/`; do not hand-edit generated native directories.
5. Extend `@repo/platform-mcp` only with read-only dependency-intelligence tools unless a separate decision authorizes writes.
6. Treat missing evidence as a visible gap. Do not invent a timeline, compatibility statement, or workaround.
7. Update this dated plan only to record new execution state; update the living architecture document when the system contract changes.

## Known starting context

The workspace already has a generated stack map, curated dependency annotations, a technology radar, dependency-audit history, and an RNGH/Reanimated migration audit. These are inputs and historical evidence, not a unified release-history graph. The current mobile baseline includes Expo SDK 57 and React Native 0.86; exact declared and resolved versions must always be re-read from the manifests and lockfile at implementation time.