---
title: "Dependency Intelligence — Master Architecture"
status: "active"
created: 2026-09-26
updated: 2026-09-26
author: "Naveen"
scribe: "Antigravity + Codex synthesis"
tags: [dependency-intelligence, architecture, knowledge-graph, supabase, rn-terrain, mcp]
canonical_for: "system-wide dependency intelligence architecture"
---

# Dependency Intelligence — Master Architecture

> This document is the highest-level abstraction over the entire dependency intelligence system.
> It integrates two independently designed layers into one coherent whole.
> Read this before reading either layer document.

---

## ONE SENTENCE

A living, Supabase-backed knowledge graph that gives any developer or agent — starting cold — dated, cited, source-tiered answers about what every mobile-native dependency actually does in this project, what changed between releases, what breaks together, and what the locally correct migration action is.

---

## THE TWO LAYERS AND WHAT THEY OWN

The system is designed in two layers, each with a distinct canonical document. Neither document alone describes the full system.

```
┌─────────────────────────────────────────────────────────────────────────┐
│  LAYER A — KNOWLEDGE MODEL (what the data IS and HOW it is classified)  │
│                                                                         │
│  Document: changelog-intelligence-universal-architecture.md             │
│  Owner:    rn-terrain / Antigravity                                     │
│                                                                         │
│  Defines:                                                               │
│  • 12-role functional taxonomy — what every dep DOES                    │
│  • Tier algorithm — computed from cascade × surface × velocity          │
│  • Entry schema — what a single changelog event looks like              │
│  • Impact type vocabulary — 14 canonical change classifications         │
│  • Seeding protocol — 6-step process to onboard any package             │
│  • Horizon system — tracking packages before they exist                 │
│  • Agent-view synthesis protocol — DANGER-ZONES, CURRENT-STATE          │
└─────────────────────────────────────────────────────────────────────────┘
          │ content governance feeds into ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  LAYER B — PERSISTENCE + ACCESS (WHERE data lives, HOW it is queried)   │
│                                                                         │
│  Document: dependency-intelligence-graph.md                             │
│  Owner:    x workspace / Codex                                          │
│                                                                         │
│  Defines:                                                               │
│  • Supabase `dependency_intelligence` schema — durable relational graph │
│  • 4-tier evidence policy — Official → First-party → Community → Lead  │
│  • Human review lifecycle — candidates promoted by weekly queue         │
│  • 7 read-only RPC functions — queryable by agents and tools            │
│  • @repo/platform-mcp tools — agent-facing dependency queries           │
│  • Local impact scanner — which files in THIS repo touch each dep       │
│  • Upgrade gate — missing coverage blocks foundational upgrades         │
│  • Operational cadence — 6h official, daily community, weekly review   │
└─────────────────────────────────────────────────────────────────────────┘
```

**Rule**: Neither layer document is the master. This document is.
When the two layers make conflicting decisions, update this document to resolve the conflict, then cascade to both layer documents.

---

## THE INTEGRATED DATA MODEL

This section maps Layer A concepts (knowledge model) to Layer B concepts (database tables). An implementer working in either layer must use this mapping to stay aligned.

### Package Classification

| Layer A concept | Layer B table / field | Notes |
|---|---|---|
| `PackageNode` (registry) | `packages` table | npm name is the stable key in both |
| `primary_role` (12 roles) | `packages.category` + custom `role` field | Layer B uses broader categories; Layer A's 12 roles refine within them |
| `tier` + `tier_score` | `packages.importance_dimension` matrix | Layer B scores 6 impact dimensions; Layer A computes a single tier score. Both are stored. |
| `vendor` | `packages.owner` | Same concept, different field name |
| `audit_start_version` | `packages.historical_window_from` | Same intent |
| `audit_status` | `packages.coverage_state` | PENDING / IN_PROGRESS / COMPLETE / STALE / HORIZON |
| `HorizonNode` | `packages` row with `coverage_state = 'horizon'` | Layer B did not originally model this; Layer A adds it |

### Change Events

| Layer A concept | Layer B table / field | Notes |
|---|---|---|
| `EntryNode` (entry file) | `lifecycle_events` row | One entry file = one or more lifecycle_event rows |
| `impact_type` (14 types) | `lifecycle_events.event_class` (controlled vocab) | Vocabularies must be harmonized — see table below |
| `severity` | `lifecycle_events.severity` | Shared: CRITICAL / HIGH / MEDIUM / LOW |
| `api_pattern_before` | `api_surfaces.symbol` (deprecated/removed surface) | Layer B normalizes API surfaces separately |
| `api_pattern_after` | `api_surfaces.symbol` (replacement surface) | Linked via `lifecycle_events.migration_action` |
| `scope` (code/config/native/build) | `lifecycle_events.impact_dimensions` | Layer B uses 6 impact dimensions; Layer A uses 6 scope flags — mapped below |
| `cascade_deps` | `graph_edges` (CASCADES_TO relation) | Layer A's flat array becomes typed edges in Layer B |
| `workaround_exists` | `workaround_reports` table | Layer A embeds in entry; Layer B normalizes to separate table |
| `agent_confidence` | `evidence_items.confidence` + `evidence_items.source_tier` | Layer B is more granular — source tier + confidence are separate |

### Impact Type Vocabulary Harmonization

Layer A impact types → Layer B event_class controlled vocabulary:

| Layer A `impact_type` | Layer B `event_class` | Notes |
|---|---|---|
| `BREAKING_API_CHANGE` | `breaking` | Exact match |
| `SILENT_BEHAVIORAL_BREAK` | `breaking` + `silent: true` flag | Layer B needs `silent` flag added |
| `DEPRECATION_WARNING` | `deprecated` | Exact match |
| `REMOVAL` | `removed` | Exact match |
| `PEER_DEP_BREAK` | `compatibility` + `breaking: true` | Layer B models this as a compatibility_claims entry |
| `SETUP_CHANGE` | `build` or `runtime` (depends on scope) | Disambiguated by Layer A's `scope` field |
| `TYPE_SYSTEM_CHANGE` | `changed` + `typescript: true` flag | Layer B needs `typescript` flag added |
| `BUILD_PIPELINE_CHANGE` | `build` | Exact match |
| `NATIVE_LAYER_CHANGE` | `runtime` | Exact match |
| `NEW_CAPABILITY` | `added` | Exact match |
| `PERFORMANCE_CHANGE` | `performance` | Exact match |
| `WORKAROUND` | → `workaround_reports` table | Layer B separates workarounds from events |
| `BUG_FIX` | `fixed` | Exact match |
| `HORIZON_SIGNAL` | `documentation` + `horizon: true` flag | Layer B needs `horizon` flag added |

**Action**: Layer B's `lifecycle_events` table needs three additional boolean flags: `silent`, `typescript`, `horizon`. This is an additive, non-breaking schema change.

### Scope → Impact Dimension Mapping

| Layer A `scope` flag | Layer B `impact_dimensions` dimension |
|---|---|
| `scope.code` | `functional_capability` or `ux_accessibility` |
| `scope.config` | `build_and_release` |
| `scope.native` | `build_and_release` + `runtime` |
| `scope.build` | `build_and_release` |
| `scope.peer_dep` | `runtime` (if foundational) or `functional_capability` |
| `scope.runtime` | `runtime` |

### Evidence and Trust

| Layer A concept | Layer B concept | Notes |
|---|---|---|
| `agent_confidence: HIGH` | `source_tier: official` | Direct mapping |
| `agent_confidence: MEDIUM` | `source_tier: community_field_evidence` | Direct mapping |
| `agent_confidence: LOW` | `source_tier: unverified` | Direct mapping |
| `needs_verification: true` | `review_state: candidate` | Direct mapping |
| (not modeled) | `review_state: promoted / rejected` | Layer B adds human review lifecycle — Layer A defers to this |
| `community_thread_urls[]` | `evidence_sources` + `evidence_items` rows | Layer A stores URLs; Layer B normalizes to full evidence records |

---

## THE INTEGRATED ARCHITECTURE DIAGRAM

```
                     ┌──────────────────────────────┐
                     │   KNOWLEDGE MODEL LAYER (A)   │
                     │  changelog-intelligence-       │
                     │  universal-architecture.md     │
                     │                               │
                     │  Role taxonomy (12 roles)     │
                     │  Tier algorithm               │
                     │  Entry schema                 │
                     │  Impact type vocabulary       │
                     │  Seeding protocol             │
                     │  Horizon system               │
                     └──────────────┬────────────────┘
                                    │ governs content of
                                    ▼
              ┌─────────────────────────────────────────────┐
              │        PERSISTENCE LAYER (B)                │
              │      Supabase `dependency_intelligence`      │
              │                                             │
              │  packages ──── releases ──── api_surfaces   │
              │      │              │                        │
              │  lifecycle_events ◄─┘    compatibility_claims│
              │      │                                       │
              │  evidence_items ──── evidence_sources        │
              │      │                                       │
              │  workaround_reports ──── reviews             │
              │      │                                       │
              │  local_surfaces ──── graph_edges             │
              └───────────────┬─────────────────────────────┘
                              │ queried via
              ┌───────────────┴──────────────────────────────┐
              │           ACCESS LAYER                        │
              │                                              │
              │  Supabase GraphQL ── RPC functions (7)       │
              │  @repo/platform-mcp (7 MCP tools)            │
              │  Generated docs (timelines/, snapshots/)     │
              └───────────────┬──────────────────────────────┘
                              │ surfaces to
              ┌───────────────┴──────────────────────────────┐
              │      AGENT + DEVELOPER SURFACES               │
              │                                              │
              │  DANGER-ZONES.md ── CURRENT-STATE.md         │
              │  (Layer A agent-views, generated from B)     │
              │                                              │
              │  dependency dossier per package              │
              │  upgrade gate queries                        │
              │  MCP tool responses at agent task time       │
              └──────────────────────────────────────────────┘
```

---

## INGESTION PIPELINE: HOW LAYER A FEEDS LAYER B

This is the critical operational bridge between the two layers.

### The Seeding Protocol as Ingestion

Layer A's 6-step seeding protocol is the **content governance protocol** for Layer B's Phase 2 ingestion. Each step maps to a database operation:

```
STEP 1: REGISTER
  → INSERT into packages (role, vendor, audit_start_version, coverage_state='IN_PROGRESS')
  → INSERT into releases (all stable versions in audit window, coverage_state='pending')

STEP 2: CALIBRATE
  → UPDATE packages SET historical_window_from = audit_start_version
  → Record major_like_minors[] as releases with major_like=true flag

STEP 3: CHANGELOG ARCHAEOLOGY
  → For each event found:
    INSERT into lifecycle_events (event_class, severity, version range)
    INSERT into evidence_sources (url, source_tier, retrieved_at)
    INSERT into evidence_items (excerpt, confidence, linked to event)
  → Events from official sources → review_state='trusted'
  → Events from community → review_state='candidate'

STEP 4: CASCADE MAPPING
  → INSERT into graph_edges (from=this_package, relation='CASCADES_TO', to=downstream_package)
  → INSERT into compatibility_claims (source_range, target_package_range, confidence)

STEP 5: GENERATE GRAPH CONTRIBUTION
  → Run generate-graph.ts → updates INDEX.json (Layer A's local graph mirror)
  → Layer B's GraphQL + RPC functions are the authoritative query surface

STEP 6: SYNTHESIZE AGENT VIEWS
  → Trigger doc export job → regenerates timelines/{package}.md
  → Updates agent-views/DANGER-ZONES.md from lifecycle_events with api_pattern_before
  → Updates agent-views/CURRENT-STATE.md from current version's api_surfaces
```

### Evidence Tier → Database State

```
Official source (changelog, migration guide)
  → evidence_items.source_tier = 'official'
  → lifecycle_events.review_state = 'trusted'
  → No weekly queue needed

Community source (Reddit, GitHub issue, Discord)
  → evidence_items.source_tier = 'community_field_evidence'
  → lifecycle_events.review_state = 'candidate'
  → Enters weekly human review queue
  → Only promoted to 'reviewed_workaround' — NEVER to official compatibility

Horizon signal (announced but not released)
  → packages.coverage_state = 'horizon'
  → lifecycle_events.event_class = 'documentation', horizon=true
  → Surfaced separately from proven facts in all query outputs
```

---

## THE INTEGRATED EXECUTION PLAN

This supersedes and integrates the Codex 4-phase plan and our seeding protocol into a single phased execution order.

### Phase 0 — Foundation (do first, highest ROI per hour)

**Supabase (Layer B):**
- [ ] Add `dependency_intelligence` schema migration
- [ ] Create all normalized tables with RLS, constraints, pgvector, idempotency keys
- [ ] Add schema extension fields: `lifecycle_events.silent`, `.typescript`, `.horizon`; `packages.primary_role`, `.tier_score`, `.coverage_state`
- [ ] Add 7 read-only RPC functions (stubs returning typed empty results)
- [ ] Add `horizon` coverage_state to packages enum

**Registry + Taxonomy (Layer A):**
- [ ] Create `registry.json` — seeded with all Tier 0 + Tier 1 packages classified by role
- [ ] Create `entry.schema.json` — canonical entry schema
- [ ] Create `registry.schema.json` — validates registry.json
- [ ] Create `CONTRIBUTING.md` — seeding protocol for agents and humans

**Agent Views (immediately useful):**
- [ ] Write `agent-views/DANGER-ZONES.md` — first 8 entries (Reanimated, RNGH, expo-router, MMKV)
- [ ] Write `agent-views/CURRENT-STATE.md` — first 5 packages at current installed version

**Exit condition:** Schema applies cleanly with RLS. Registry covers all Tier 0+1 packages. DANGER-ZONES prevents the 5 most common agent errors today.

---

### Phase 1 — Baseline Inventory

**Local scanner (Layer B Phase 0/3):**
- [ ] Snapshot direct production deps from `apps/gurudevi-mobile/package.json`
- [ ] Resolve pnpm graph from `pnpm-lock.yaml` — record declaration vs resolution differences
- [ ] Scan local imports → populate `local_surfaces` table
- [ ] INSERT all scoped packages into `packages` table with role + tier classification

**Historical window (Layer B Phase 2 start):**
- [ ] For platform spine only: INSERT all stable releases for current + previous major
  - Priority order: react-native → expo (SDK) → expo-router → reanimated → RNGH → MMKV
- [ ] Record omissions as explicit coverage gap rows

**Exit condition:** Every scoped package has a profile row, impact classification, and either a complete release history for its audit window or an explicit gap record.

---

### Phase 2 — Release History + Evidence (Tier A packages first)

**Seeding protocol runs per package in priority order:**

Priority 1 (Tier A — generate wrong code right now):
- [ ] react-native-reanimated: v3.0 → 4.6.0 (full audit)
- [ ] expo-router: v3 → SDK 57 (full audit, critical SDK 56 entry)
- [ ] react-native-gesture-handler: v2.0 → 3.3.0 (full audit)

Priority 2 (Tier B — peer dep cascade):
- [ ] expo SDK: 52 → 57 (all milestone entries)
- [ ] react-native: 0.76 → 0.86 (key milestones)
- [ ] react-native-mmkv: v3 → 4.3.2 (5 entries, mostly verified)

Priority 3 (Tier B/C):
- [ ] react-native-worklets: full history from v0.1
- [ ] react-native-nitro-modules: full history
- [ ] nativewind: v4 → v5 RC tracking

**For each package seeded:**
- Official events → review_state='trusted'
- Community events → review_state='candidate' → weekly review queue
- Cascade edges → graph_edges table

**Exit condition:** Complete two-major timeline queryable for platform spine. Tier A packages fully seeded with official sources. Community candidates in review queue.

---

### Phase 3 — Access Surfaces + Agent Integration

- [ ] Expose Supabase GraphQL relationship browsing
- [ ] Wire 7 RPC functions to actual data (not stubs)
- [ ] Add 7 MCP tools to `@repo/platform-mcp`
- [ ] Generate schema-versioned JSON snapshots → `docs/stack-map/dependency-intelligence/snapshots/`
- [ ] Generate per-package dossiers → `docs/stack-map/dependency-intelligence/timelines/`
- [ ] Wire DANGER-ZONES.md + CURRENT-STATE.md to auto-generate from lifecycle_events

**Exit condition:** An agent can query any of the 7 MCP tools and get a typed response with source tier and review state visible.

---

### Phase 4 — Operations + Upgrade Gate

- [ ] Schedule 6-hour official release scan for all tracked packages
- [ ] Schedule daily community discovery scan
- [ ] Schedule daily local drift scan (lockfile + import changes)
- [ ] Weekly review queue workflow defined and operational
- [ ] Upgrade gate: any upgrade proposal for a scoped package requires a fresh dependency_profile + dependency_timeline query
- [ ] Missing coverage blocks foundational upgrades; lower-tier upgrades require explicit risk exception

**Exit condition:** Continuous collection running. Weekly review operational. Upgrade gate enforced.

---

### Phase 5 — Tier C/D packages + Horizon tracking

- [ ] Seed Tier C: zod, react-native-screens, react-native-safe-area-context, react-native-keyboard-controller
- [ ] Seed Tier D: skia, flash-list, bottom-sheet, maps, svg, lottie, pager-view, webview
- [ ] Seed Tier E: observability, state, utility packages
- [ ] Register all Horizon packages with HORIZON_SIGNAL entries
- [ ] Full MIGRATION-QUICK-REF.md generated from all entries with api_pattern_before + after

---

## NON-NEGOTIABLE CONSTRAINTS (inherited from both layers)

From Layer B (Codex):
- Never use `expo install --fix` or `expo install --check`
- Never edit `android/` or `ios/` directories
- Preserve sacred package pins
- Supabase is the relational graph — pgvector assists, does not replace typed relationships
- Keep collectors and credentials server-side — the Expo app receives no graph access
- Community material is labelled field evidence — it never silently becomes an official fact
- Ingestion is idempotent — fetch failures never erase reviewed evidence

From Layer A (Antigravity):
- Every package entry maps to exactly one primary role
- Tier is computed, not assigned by human judgment
- Horizon packages are registered before seeding begins
- Official and community evidence are always visually distinct in all output surfaces
- The seeding protocol is the only authorized way to onboard a new package

---

## DOCUMENT MAP

```
C:\x\docs\architecture\
  dependency-intelligence-graph.md          ← Layer B canonical spec (Codex)
  dependency-intelligence-master.md         ← THIS FILE — highest-level integration

c:\projects\rn-terrain\docs\architecture\
  changelog-intelligence-universal-architecture.md  ← Layer A knowledge model (Antigravity)

C:\x\docs\current_progress\
  2026-09-26-dependency-intelligence-graph-implementation-plan.md  ← execution checklist

c:\projects\rn-terrain\docs\decisions\
  2026-09-26-changelog-intelligence-system-plan-v1.md  ← superseded
  2026-09-26-changelog-intelligence-system-plan-v2.md  ← version-grounded calibration

docs/stack-map/dependency-intelligence/      ← GENERATED (never hand-edited)
  README.md
  coverage.md
  timelines/{package}.md
  indexes/breaking-deprecated-removed.md
  snapshots/{date}.json
```

**Reading order for a fresh agent or developer:**
1. This file (`dependency-intelligence-master.md`) — understand the system
2. `dependency-intelligence-graph.md` — understand the persistence + access layer
3. `changelog-intelligence-universal-architecture.md` — understand the knowledge model
4. `dependency-intelligence-graph-implementation-plan.md` — understand execution state

---

*Master architecture v1.0 — synthesizes Codex (Layer B) + Antigravity (Layer A)*
*Created: 2026-09-26 | Both layers active | Neither layer is the master — this document is*