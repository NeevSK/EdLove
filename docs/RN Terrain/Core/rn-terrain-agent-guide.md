---
title: "RN Terrain - Agent Operationalization Guide"
status: "active"
created: 2026-06-02
updated: 2026-06-02
author: "Claude"
tags: [rn-terrain, guide, agentic]
---
# RN Terrain â€” Agent Operationalization Guide
## End-to-End Build Instructions for AI Coding Agents
*For Claude Code, Cursor, or any agent building RN Terrain*

---

## CRITICAL CONTEXT â€” READ FIRST

You are building **RN Terrain** â€” a live intelligence layer
for the React Native ecosystem. The architect is Neev.
You are the hands. Neev makes product decisions.
You make implementation decisions within the spec.

**The golden rule:**
When the spec is ambiguous â†’ ask Neev before building.
When the implementation detail is ambiguous â†’ use best judgment,
document what you chose and why, ask for review.

**The output that matters most:**
`npx rn-eval react-native-reanimated` â†’ prints a VitalityCard.
Everything in this guide exists to make that happen first.
Then we expand.

---

## REPOSITORY STRUCTURE

Set up this monorepo structure from day one.
Do not deviate from it.

```
rn-terrain/
â”œâ”€â”€ packages/
â”‚   â”œâ”€â”€ core/                    # @rn-terrain/core
â”‚   â”‚   â”œâ”€â”€ src/
â”‚   â”‚   â”‚   â”œâ”€â”€ types/           # All TypeScript interfaces
â”‚   â”‚   â”‚   â”œâ”€â”€ signals/         # Signal collectors per tier
â”‚   â”‚   â”‚   â”œâ”€â”€ scoring/         # Vitality score calculation
â”‚   â”‚   â”‚   â”œâ”€â”€ sync/            # Data sync jobs
â”‚   â”‚   â”‚   â””â”€â”€ index.ts
â”‚   â”‚   â”œâ”€â”€ package.json
â”‚   â”‚   â””â”€â”€ tsconfig.json
â”‚   â”‚
â”‚   â”œâ”€â”€ cli/                     # @rn-terrain/cli
â”‚   â”‚   â”œâ”€â”€ src/
â”‚   â”‚   â”‚   â”œâ”€â”€ commands/        # rn-eval subcommands
â”‚   â”‚   â”‚   â”œâ”€â”€ ui/              # Terminal rendering
â”‚   â”‚   â”‚   â””â”€â”€ index.ts
â”‚   â”‚   â”œâ”€â”€ package.json
â”‚   â”‚   â””â”€â”€ tsconfig.json
â”‚   â”‚
â”‚   â””â”€â”€ mcp/                     # @rn-terrain/mcp
â”‚       â”œâ”€â”€ src/
â”‚       â”‚   â”œâ”€â”€ tools/           # MCP tool definitions
â”‚       â”‚   â””â”€â”€ index.ts
â”‚       â”œâ”€â”€ package.json
â”‚       â””â”€â”€ tsconfig.json
â”‚
â”œâ”€â”€ apps/
â”‚   â””â”€â”€ web/                     # Next.js (Bloom 2 â€” not yet)
â”‚
â”œâ”€â”€ supabase/
â”‚   â”œâ”€â”€ migrations/              # SQL migration files
â”‚   â””â”€â”€ seed/                    # Initial package seed data
â”‚
â”œâ”€â”€ scripts/
â”‚   â”œâ”€â”€ seed-packages.ts         # Manual seed script
â”‚   â””â”€â”€ sync-daily.ts            # Daily delta sync
â”‚
â”œâ”€â”€ pnpm-workspace.yaml
â”œâ”€â”€ package.json                 # Root workspace config
â””â”€â”€ tsconfig.base.json
```

---

## STEP 1 â€” REPOSITORY BOOTSTRAP

```bash
# Initialize monorepo
mkdir rn-terrain && cd rn-terrain
git init
corepack enable
pnpm init

# Create pnpm-workspace.yaml
cat > pnpm-workspace.yaml << 'YAML'
packages:
  - 'packages/*'
  - 'apps/*'
YAML

# Create root tsconfig
cat > tsconfig.base.json << 'JSON'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
JSON

# Initialize packages
mkdir -p packages/core/src/{types,signals,scoring,sync}
mkdir -p packages/cli/src/{commands,ui}
mkdir -p packages/mcp/src/tools
mkdir -p supabase/{migrations,seed}
mkdir -p scripts
```

---

## STEP 2 â€” SUPABASE SCHEMA

Create this migration file first. Everything else depends on it.

**File:** `supabase/migrations/001_initial_schema.sql`

```sql
-- ============================================================
-- RN TERRAIN â€” CORE SCHEMA
-- ============================================================

-- EXTENSION
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PACKAGES TABLE â€” The main intelligence store
-- ============================================================
CREATE TABLE packages (
  id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Tier 1: Identity
  package_name                TEXT UNIQUE NOT NULL,
  display_name                TEXT,
  description                 TEXT,
  vendor                      TEXT DEFAULT 'independent',
  -- 'expo' | 'software-mansion' | 'callstack' | 'meta' | 'independent'
  category                    TEXT NOT NULL,
  -- 'navigation' | 'storage' | 'media' | 'auth' | 'sensors' |
  -- 'ui' | 'animation' | 'networking' | 'ai' | 'testing' | 'tooling' | 'other'
  use_case_tags               TEXT[] DEFAULT '{}',
  topology_layer              TEXT DEFAULT 'L3',
  -- 'L2' | 'L3' | 'L4'
  radar_status                TEXT DEFAULT 'ASSESS',
  -- 'ADOPT' | 'TRIAL' | 'ASSESS' | 'HOLD'
  vitality_score              INTEGER DEFAULT 0,
  -- 0â€“100 composite score
  v1_readiness                TEXT DEFAULT 'UNKNOWN',
  -- 'READY' | 'ADAPTING' | 'AT_RISK' | 'INCOMPATIBLE' | 'UNKNOWN'

  -- Tier 2: RN Directory signals
  android_support             BOOLEAN DEFAULT false,
  ios_support                 BOOLEAN DEFAULT false,
  web_support                 BOOLEAN DEFAULT false,
  expo_go_compatible          BOOLEAN DEFAULT false,
  new_architecture_status     TEXT DEFAULT 'unknown',
  -- 'native_jsi' | 'compatibility_layer' | 'unsupported' | 'not_applicable' | 'unknown'
  typescript_support          BOOLEAN DEFAULT false,
  rn_dir_maintained           BOOLEAN DEFAULT true,
  expo_config_plugin          BOOLEAN DEFAULT false,
  windows_support             BOOLEAN DEFAULT false,
  macos_support               BOOLEAN DEFAULT false,
  visionos_support            BOOLEAN DEFAULT false,

  -- Tier 3: Version intelligence (taze-inspired)
  current_stable_version      TEXT,
  latest_version              TEXT,
  version_lag_major           INTEGER DEFAULT 0,
  version_lag_minor           INTEGER DEFAULT 0,
  version_lag_patch           INTEGER DEFAULT 0,
  update_safety_band          TEXT DEFAULT 'unknown',
  -- 'safe' | 'caution' | 'breaking' | 'unknown'
  maturity_period_days        INTEGER,
  last_major_bump_date        DATE,
  breaking_change_frequency_months FLOAT,
  changelog_url               TEXT,
  release_notes_quality       TEXT DEFAULT 'unknown',
  -- 'detailed' | 'minimal' | 'none' | 'unknown'

  -- Tier 4: GitHub vitality
  github_url                  TEXT,
  npm_package_name            TEXT,
  bus_factor                  INTEGER DEFAULT 1,
  lindy_age_months            INTEGER DEFAULT 0,
  stars_total                 INTEGER DEFAULT 0,
  stars_30d_delta             INTEGER DEFAULT 0,
  stars_trajectory            TEXT DEFAULT 'unknown',
  forks_total                 INTEGER DEFAULT 0,
  contributors_total          INTEGER DEFAULT 0,
  contributors_active_90d     INTEGER DEFAULT 0,
  top_contributor_pct         FLOAT DEFAULT 100,
  commit_count_30d            INTEGER DEFAULT 0,
  commit_count_90d            INTEGER DEFAULT 0,
  avg_gap_between_commits_days FLOAT,
  last_commit_date            TIMESTAMPTZ,
  last_meaningful_commit_date TIMESTAMPTZ,
  open_issues_count           INTEGER DEFAULT 0,
  closed_issues_ratio         FLOAT DEFAULT 0,
  open_prs_count              INTEGER DEFAULT 0,
  avg_pr_merge_days           FLOAT,
  last_release_date           TIMESTAMPTZ,
  days_since_last_release     INTEGER,

  -- Tier 5: Architecture & runtime
  has_native_code             BOOLEAN DEFAULT false,
  native_languages            TEXT[] DEFAULT '{}',
  jsi_binding_type            TEXT DEFAULT 'unknown',
  -- 'fabric' | 'turbomodule' | 'nitro' | 'legacy_bridge' | 'pure_js' | 'unknown'
  nitro_modules_powered       BOOLEAN DEFAULT false,
  hermes_v1_compatible        BOOLEAN,
  wasm_compiled               BOOLEAN DEFAULT false,
  wasm_source_language        TEXT DEFAULT 'none',
  wasm_binary_size_bytes      INTEGER DEFAULT 0,
  prebuilt_ios_binary         BOOLEAN DEFAULT false,
  bundle_increment_bytes      INTEGER DEFAULT 0,
  dependency_fan_out          INTEGER DEFAULT 0,
  peer_dependency_count       INTEGER DEFAULT 0,
  build_time_impact           TEXT DEFAULT 'unknown',
  -- 'negligible' | 'minor' | 'significant' | 'heavy' | 'unknown'
  thread_safety               TEXT DEFAULT 'unknown',
  -- 'main_thread_safe' | 'js_thread_blocks' | 'async_native' | 'unknown'

  -- Tier 6: Ecosystem position
  adoption_rank_in_category   INTEGER,
  downloads_weekly_npm        INTEGER DEFAULT 0,
  download_trajectory         TEXT DEFAULT 'unknown',
  used_by_expo_sdk            BOOLEAN DEFAULT false,
  superseded_by               TEXT,
  supersedes                  TEXT,

  -- Tier 7: V1 readiness
  v1_readiness_score          INTEGER DEFAULT 0,
  legacy_arch_code_present    BOOLEAN DEFAULT false,
  stable_js_api_compliant     BOOLEAN,
  breaking_change_risk_v1     TEXT DEFAULT 'unknown',
  -- 'none' | 'low' | 'medium' | 'high' | 'unknown'
  v1_migration_notes          TEXT,

  -- Deprecation signals
  npm_deprecated              BOOLEAN DEFAULT false,
  npm_deprecated_message      TEXT,
  has_api_deprecations        BOOLEAN DEFAULT false,
  ecosystem_deprecated        BOOLEAN DEFAULT false,

  -- Meta
  last_synced_github          TIMESTAMPTZ,
  last_synced_npm             TIMESTAMPTZ,
  last_synced_rn_dir          TIMESTAMPTZ,
  manually_curated            BOOLEAN DEFAULT false,
  created_at                  TIMESTAMPTZ DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ECOSYSTEM EVENTS â€” The append-only history log
-- ============================================================
CREATE TABLE ecosystem_events (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type    TEXT NOT NULL,
  entity_name   TEXT NOT NULL,
  entity_type   TEXT NOT NULL DEFAULT 'package',
  -- 'package' | 'tool' | 'vendor' | 'person' | 'ecosystem'
  event_date    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  summary       TEXT NOT NULL,
  source_url    TEXT,
  severity      TEXT DEFAULT 'info',
  -- 'info' | 'warning' | 'critical'
  affects       TEXT[] DEFAULT '{}',
  raw_data      JSONB,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- KNOWN CONFLICTS â€” Package incompatibility pairs
-- ============================================================
CREATE TABLE package_conflicts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  package_a       TEXT NOT NULL REFERENCES packages(package_name),
  package_b       TEXT NOT NULL REFERENCES packages(package_name),
  severity        TEXT DEFAULT 'warning',
  reason          TEXT NOT NULL,
  rn_version_range TEXT,
  workaround      TEXT,
  source_url      TEXT,
  resolved        BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- COMMON COMPANIONS â€” Packages often used together
-- ============================================================
CREATE TABLE package_companions (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  package_name          TEXT NOT NULL REFERENCES packages(package_name),
  companion_name        TEXT NOT NULL REFERENCES packages(package_name),
  co_occurrence_score   FLOAT DEFAULT 0,
  context               TEXT,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ALTERNATIVES â€” Package substitution graph
-- ============================================================
CREATE TABLE package_alternatives (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  package_name        TEXT NOT NULL REFERENCES packages(package_name),
  alternative_name    TEXT NOT NULL REFERENCES packages(package_name),
  comparison_summary  TEXT,
  migration_effort    TEXT,
  -- 'trivial' | 'moderate' | 'significant' | 'major_rewrite'
  migration_notes     TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- KEY PERSONS â€” Signal-weighted people
-- ============================================================
CREATE TABLE key_persons (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  github_handle   TEXT,
  twitter_handle  TEXT,
  affiliation     TEXT,
  -- 'meta' | 'expo' | 'software-mansion' | 'callstack' | 'independent'
  signal_weight   INTEGER DEFAULT 5,
  -- 1â€“10, higher = more weight given to their signals
  focus_areas     TEXT[] DEFAULT '{}',
  active          BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_packages_name ON packages(package_name);
CREATE INDEX idx_packages_category ON packages(category);
CREATE INDEX idx_packages_vendor ON packages(vendor);
CREATE INDEX idx_packages_radar_status ON packages(radar_status);
CREATE INDEX idx_packages_topology_layer ON packages(topology_layer);
CREATE INDEX idx_packages_vitality_score ON packages(vitality_score DESC);
CREATE INDEX idx_packages_v1_readiness ON packages(v1_readiness);
CREATE INDEX idx_packages_new_arch ON packages(new_architecture_status);
CREATE INDEX idx_packages_expo_go ON packages(expo_go_compatible);
CREATE INDEX idx_events_entity ON ecosystem_events(entity_name, event_date DESC);
CREATE INDEX idx_events_type ON ecosystem_events(event_type, event_date DESC);
CREATE INDEX idx_events_severity ON ecosystem_events(severity, event_date DESC);

-- ============================================================
-- AUTO-UPDATE updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER packages_updated_at
  BEFORE UPDATE ON packages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## STEP 3 â€” CORE TYPESCRIPT TYPES

**File:** `packages/core/src/types/index.ts`

```typescript
// ============================================================
// RN TERRAIN â€” CANONICAL TYPES
// Everything in this codebase is typed against these.
// Do not change interfaces without Neev's approval.
// ============================================================

export type RadarStatus = 'ADOPT' | 'TRIAL' | 'ASSESS' | 'HOLD'
export type TopologyLayer = 'L2' | 'L3' | 'L4'
export type V1Readiness = 'READY' | 'ADAPTING' | 'AT_RISK' | 'INCOMPATIBLE' | 'UNKNOWN'
export type UpdateSafetyBand = 'safe' | 'caution' | 'breaking' | 'unknown'
export type NewArchStatus = 'native_jsi' | 'compatibility_layer' | 'unsupported' | 'not_applicable' | 'unknown'
export type JSIBindingType = 'fabric' | 'turbomodule' | 'nitro' | 'legacy_bridge' | 'pure_js' | 'unknown'
export type Trajectory = 'growing' | 'plateau' | 'declining' | 'unknown'
export type Severity = 'info' | 'warning' | 'critical'
export type MigrationEffort = 'trivial' | 'moderate' | 'significant' | 'major_rewrite'

// ============================================================
// SCORE BREAKDOWN â€” Always shown alongside the score
// ============================================================
export interface ScoreBreakdown {
  total: number                    // 0â€“100
  maintenance: {
    score: number                  // 0â€“30
    max: 30
    bus_factor: { score: number; max: 10; detail: string }
    commit_rhythm: { score: number; max: 10; detail: string }
    issue_response: { score: number; max: 10; detail: string }
  }
  architecture: {
    score: number                  // 0â€“25
    max: 25
    new_arch: { score: number; max: 10; detail: string }
    hermes_v1: { score: number; max: 5; detail: string }
    wasm_cost: { score: number; max: 5; detail: string }
    thread_safety: { score: number; max: 5; detail: string }
  }
  temporal: {
    score: number                  // 0â€“20
    max: 20
    lindy_age: { score: number; max: 8; detail: string }
    version_trajectory: { score: number; max: 6; detail: string }
    decay_signal: { score: number; max: 6; detail: string }
  }
  ecosystem: {
    score: number                  // 0â€“15
    max: 15
    adoption_rank: { score: number; max: 5; detail: string }
    vendor_backing: { score: number; max: 5; detail: string }
    alternatives: { score: number; max: 5; detail: string }
  }
  cost: {
    score: number                  // 0â€“10
    max: 10
    bundle_impact: { score: number; max: 5; detail: string }
    dependency_fanout: { score: number; max: 5; detail: string }
  }
}

// ============================================================
// WARNING â€” A signal that needs developer attention
// ============================================================
export interface Warning {
  severity: Severity
  code: string                     // e.g. "JS_THREAD_BLOCKING"
  message: string                  // human-readable
  detail?: string                  // additional context
  source_url?: string              // link to evidence
}

// ============================================================
// DEPRECATION RADAR â€” 5 levels
// ============================================================
export interface DeprecationRadar {
  npm_explicit: boolean
  npm_message?: string
  api_level: boolean
  api_details?: string
  ecosystem_level: boolean
  ecosystem_reason?: string
  platform_level: boolean
  platform_details?: string
  silent: boolean                  // detected by vitality decay
  silent_signals?: string[]
}

// ============================================================
// V1 READINESS REPORT
// ============================================================
export interface V1ReadinessReport {
  status: V1Readiness
  score: number                    // 0â€“100
  legacy_arch_code: boolean
  stable_js_api_compliant: boolean | null
  breaking_change_risk: 'none' | 'low' | 'medium' | 'high' | 'unknown'
  migration_notes?: string
  vendor_maintained: boolean
}

// ============================================================
// VITALITY CARD â€” The canonical output
// This is what every adapter (CLI, MCP, web) renders.
// ============================================================
export interface VitalityCard {
  // Identity
  package_name: string
  display_name?: string
  category: string
  use_case_tags: string[]
  vendor: string
  topology_layer: TopologyLayer

  // The verdict
  radar_status: RadarStatus
  vitality_score: number
  score_breakdown: ScoreBreakdown

  // Version intelligence
  version: {
    current: string
    latest: string
    lag: { major: number; minor: number; patch: number }
    safety_band: UpdateSafetyBand
    days_since_release: number
    changelog_url?: string
  }

  // Platform compatibility
  compatibility: {
    ios: boolean
    android: boolean
    web: boolean
    expo_go: boolean
    windows: boolean
    macos: boolean
    new_architecture: NewArchStatus
    hermes_v1: boolean | null
    expo_config_plugin: boolean
  }

  // Architecture signals
  architecture: {
    has_native_code: boolean
    jsi_binding: JSIBindingType
    nitro_powered: boolean
    wasm_compiled: boolean
    wasm_size_bytes: number
    bundle_increment_bytes: number
    dependency_fan_out: number
    thread_safety: string
    build_time_impact: string
  }

  // V1 readiness
  v1_readiness: V1ReadinessReport

  // Deprecation
  deprecation: DeprecationRadar

  // Warnings (ordered by severity)
  warnings: Warning[]

  // Relationships
  alternatives: Array<{
    package_name: string
    vitality_score: number
    comparison_summary: string
    migration_effort: MigrationEffort
  }>
  known_conflicts: Array<{
    package_name: string
    severity: Severity
    reason: string
    workaround?: string
  }>
  common_companions: Array<{
    package_name: string
    context?: string
  }>

  // Links â€” every signal anchored to its source
  links: {
    npm: string
    github?: string
    rn_directory?: string
    changelog?: string
    open_issues?: string
    bundle_analysis?: string
  }

  // Recent ecosystem events for this package
  recent_events: Array<{
    event_type: string
    event_date: string
    summary: string
    severity: Severity
    source_url?: string
  }>

  // Meta
  last_updated: string             // ISO 8601
  data_freshness: 'fresh' | 'stale' | 'cached'
}

// ============================================================
// PROJECT AUDIT â€” Result of scanning package.json
// ============================================================
export interface ProjectAudit {
  scanned_at: string
  package_json_path: string
  total_packages: number
  summary: {
    adopt: number
    trial: number
    assess: number
    hold: number
    unknown: number
  }
  v1_ready_count: number
  v1_at_risk_count: number
  packages: VitalityCard[]
  critical_warnings: Warning[]
  ecosystem_news: EcosystemEvent[]
  migration_suggestions: MigrationSuggestion[]
}

export interface EcosystemEvent {
  event_type: string
  entity_name: string
  event_date: string
  summary: string
  severity: Severity
  source_url?: string
}

export interface MigrationSuggestion {
  from_package: string
  to_package: string
  reason: string
  effort: MigrationEffort
  migration_notes?: string
}

// ============================================================
// ECOSYSTEM TOPOLOGY â€” The macro view
// ============================================================
export interface EcosystemTopology {
  total_packages_tracked: number
  by_layer: { L2: number; L3: number; L4: number }
  by_radar: { ADOPT: number; TRIAL: number; ASSESS: number; HOLD: number }
  new_arch_adoption_pct: number
  expo_compatible_pct: number
  hermes_v1_ready_pct: number
  v1_ready_pct: number
  actively_maintained_pct: number
  by_category: CategorySummary[]
  ecosystem_health_trend: 'improving' | 'stable' | 'declining'
  last_updated: string
}

export interface CategorySummary {
  category: string
  total: number
  adopt_count: number
  trial_count: number
  assess_count: number
  hold_count: number
  top_package?: string
}

// ============================================================
// DEVELOPER CONTEXT â€” The CÃ— profile
// ============================================================
export interface DeveloperContext {
  workflow: 'expo_managed' | 'expo_bare' | 'pure_rn'
  architecture_requirement: 'new_arch_only' | 'both' | 'legacy_ok'
  bundle_sensitivity: 'minimal' | 'moderate' | 'relaxed'
  team_size: 'solo' | 'small' | 'enterprise'
  ios_min_version?: string
  android_min_sdk?: number
  offline_first?: boolean
  expo_go_required?: boolean
}
```

---

## STEP 4 â€” SCORING ENGINE

**File:** `packages/core/src/scoring/index.ts`

```typescript
import type { VitalityCard, ScoreBreakdown, RadarStatus } from '../types'

// ============================================================
// VITALITY SCORE CALCULATION
// These weights are the product decisions.
// Do not change without Neev's approval.
// ============================================================

export function calculateVitalityScore(data: Partial<VitalityCard>): ScoreBreakdown {
  const maintenance = scoreMaintenanceHealth(data)
  const architecture = scoreArchitecturalSafety(data)
  const temporal = scoreTemporalStamina(data)
  const ecosystem = scoreEcosystemPosition(data)
  const cost = scoreCostFactors(data)

  const total = maintenance.score + architecture.score +
    temporal.score + ecosystem.score + cost.score

  return {
    total: Math.min(100, Math.max(0, total)),
    maintenance,
    architecture,
    temporal,
    ecosystem,
    cost
  }
}

function scoreMaintenanceHealth(data: Partial<VitalityCard>) {
  // BUS FACTOR (0â€“10)
  // Higher bus factor = more resilient
  const bf = data.architecture?.has_native_code ? 1 : 0  // placeholder
  const busFactorScore = Math.min(10, (bf / 3) * 10)

  // COMMIT RHYTHM (0â€“10)
  // We score the gap, not just recency
  // avg gap under 14 days = 10, over 180 = 0
  const avgGap = 30 // placeholder â€” from DB
  const commitRhythmScore = avgGap <= 14 ? 10
    : avgGap <= 30 ? 8
    : avgGap <= 60 ? 6
    : avgGap <= 90 ? 4
    : avgGap <= 180 ? 2
    : 0

  // ISSUE RESPONSE (0â€“10)
  // closed_issues_ratio: 0.9 = 10pts, 0.5 = 5pts
  const ratio = 0.7 // placeholder â€” from DB
  const issueScore = Math.round(ratio * 10)

  const score = busFactorScore + commitRhythmScore + issueScore

  return {
    score,
    max: 30 as const,
    bus_factor: {
      score: busFactorScore,
      max: 10 as const,
      detail: `Bus factor: ${bf} active contributors`
    },
    commit_rhythm: {
      score: commitRhythmScore,
      max: 10 as const,
      detail: `Avg ${avgGap} day gap between commits`
    },
    issue_response: {
      score: issueScore,
      max: 10 as const,
      detail: `${Math.round(ratio * 100)}% issues closed`
    }
  }
}

function scoreArchitecturalSafety(data: Partial<VitalityCard>) {
  // NEW ARCH (0â€“10)
  const archMap: Record<string, number> = {
    'native_jsi': 10,
    'nitro': 10,
    'compatibility_layer': 6,
    'not_applicable': 10,
    'unsupported': 0,
    'unknown': 3
  }
  const newArchScore = archMap[data.compatibility?.new_architecture ?? 'unknown'] ?? 3

  // HERMES V1 (0â€“5)
  const hermesScore = data.compatibility?.hermes_v1 === true ? 5
    : data.compatibility?.hermes_v1 === false ? 0
    : 3  // unknown = partial credit

  // WASM COST (0â€“5) â€” penalize large WASM binaries
  const wasmBytes = data.architecture?.wasm_size_bytes ?? 0
  const wasmScore = wasmBytes === 0 ? 5
    : wasmBytes < 100_000 ? 4
    : wasmBytes < 500_000 ? 3
    : wasmBytes < 1_000_000 ? 2
    : 1

  // THREAD SAFETY (0â€“5)
  const threadMap: Record<string, number> = {
    'main_thread_safe': 5,
    'async_native': 5,
    'js_thread_blocks': 0,
    'unknown': 2
  }
  const threadScore = threadMap[data.architecture?.thread_safety ?? 'unknown'] ?? 2

  const score = newArchScore + hermesScore + wasmScore + threadScore

  return {
    score,
    max: 25 as const,
    new_arch: {
      score: newArchScore,
      max: 10 as const,
      detail: `Architecture: ${data.compatibility?.new_architecture ?? 'unknown'}`
    },
    hermes_v1: {
      score: hermesScore,
      max: 5 as const,
      detail: data.compatibility?.hermes_v1 === true
        ? 'Hermes V1 confirmed compatible'
        : data.compatibility?.hermes_v1 === false
        ? 'Hermes V1 incompatible âš ï¸'
        : 'Hermes V1 compatibility unknown'
    },
    wasm_cost: {
      score: wasmScore,
      max: 5 as const,
      detail: wasmBytes > 0
        ? `WASM binary: +${Math.round(wasmBytes / 1024)}kb`
        : 'No WASM binary'
    },
    thread_safety: {
      score: threadScore,
      max: 5 as const,
      detail: `Thread safety: ${data.architecture?.thread_safety ?? 'unknown'}`
    }
  }
}

function scoreTemporalStamina(data: Partial<VitalityCard>) {
  // LINDY AGE (0â€“8)
  // Older = more proven
  const lindyMonths = 24 // placeholder
  const lindyScore = lindyMonths >= 36 ? 8
    : lindyMonths >= 24 ? 7
    : lindyMonths >= 18 ? 6
    : lindyMonths >= 12 ? 4
    : lindyMonths >= 6 ? 2
    : 1

  // VERSION TRAJECTORY (0â€“6)
  // Regular releases = healthy
  const daysSinceRelease = data.version?.days_since_release ?? 999
  const versionScore = daysSinceRelease <= 30 ? 6
    : daysSinceRelease <= 60 ? 5
    : daysSinceRelease <= 90 ? 4
    : daysSinceRelease <= 180 ? 3
    : daysSinceRelease <= 365 ? 1
    : 0

  // DECAY SIGNAL (0â€“6)
  // Combine multiple decay indicators
  const decayScore = versionScore > 3 ? 6
    : versionScore > 1 ? 4
    : 2

  const score = lindyScore + versionScore + decayScore

  return {
    score,
    max: 20 as const,
    lindy_age: {
      score: lindyScore,
      max: 8 as const,
      detail: `${lindyMonths} months in ecosystem`
    },
    version_trajectory: {
      score: versionScore,
      max: 6 as const,
      detail: `${daysSinceRelease} days since last release`
    },
    decay_signal: {
      score: decayScore,
      max: 6 as const,
      detail: decayScore >= 5 ? 'Healthy activity pattern'
        : decayScore >= 3 ? 'Moderate activity â€” watch'
        : 'Low activity â€” decay risk'
    }
  }
}

function scoreEcosystemPosition(data: Partial<VitalityCard>) {
  // ADOPTION RANK (0â€“5)
  const rank = 1 // placeholder
  const adoptionScore = rank === 1 ? 5
    : rank <= 3 ? 4
    : rank <= 5 ? 3
    : rank <= 10 ? 2
    : 1

  // VENDOR BACKING (0â€“5)
  const majorVendors = ['expo', 'software-mansion', 'callstack', 'meta']
  const vendorScore = majorVendors.includes(data.vendor ?? '') ? 5 : 2

  // ALTERNATIVES (0â€“5)
  // Fewer strong alternatives = more dominant
  const altCount = data.alternatives?.length ?? 0
  const altScore = altCount === 0 ? 5
    : altCount === 1 ? 4
    : altCount === 2 ? 3
    : 2

  const score = adoptionScore + vendorScore + altScore

  return {
    score,
    max: 15 as const,
    adoption_rank: {
      score: adoptionScore,
      max: 5 as const,
      detail: `Rank #${rank} in ${data.category}`
    },
    vendor_backing: {
      score: vendorScore,
      max: 5 as const,
      detail: `Vendor: ${data.vendor}`
    },
    alternatives: {
      score: altScore,
      max: 5 as const,
      detail: `${altCount} alternative${altCount !== 1 ? 's' : ''} available`
    }
  }
}

function scoreCostFactors(data: Partial<VitalityCard>) {
  // BUNDLE IMPACT (0â€“5)
  const bundleBytes = data.architecture?.bundle_increment_bytes ?? 0
  const bundleScore = bundleBytes < 10_000 ? 5
    : bundleBytes < 50_000 ? 4
    : bundleBytes < 200_000 ? 3
    : bundleBytes < 500_000 ? 2
    : 1

  // DEPENDENCY FAN-OUT (0â€“5)
  const fanOut = data.architecture?.dependency_fan_out ?? 0
  const fanOutScore = fanOut <= 5 ? 5
    : fanOut <= 15 ? 4
    : fanOut <= 30 ? 3
    : fanOut <= 50 ? 2
    : 1

  const score = bundleScore + fanOutScore

  return {
    score,
    max: 10 as const,
    bundle_impact: {
      score: bundleScore,
      max: 5 as const,
      detail: bundleBytes > 0
        ? `+${Math.round(bundleBytes / 1024)}kb bundle`
        : 'Bundle impact unknown'
    },
    dependency_fanout: {
      score: fanOutScore,
      max: 5 as const,
      detail: `${fanOut} transitive dependencies`
    }
  }
}

export function scoreToRadarStatus(score: number): RadarStatus {
  if (score >= 80) return 'ADOPT'
  if (score >= 60) return 'TRIAL'
  if (score >= 40) return 'ASSESS'
  return 'HOLD'
}

export function scoreToTopologyLayer(
  score: number,
  lindyMonths: number
): 'L2' | 'L3' | 'L4' {
  if (score >= 75 && lindyMonths >= 24) return 'L2'
  if (score >= 50) return 'L3'
  return 'L4'
}
```

---

## STEP 5 â€” SIGNAL COLLECTORS

**File:** `packages/core/src/signals/rn-directory.ts`

```typescript
// Consumes the public RN Directory API
// Returns raw signal data for Tier 2 fields

export interface RNDirectoryPackage {
  npmPkg: string
  githubUrl: string
  ios: boolean
  android: boolean
  web: boolean
  expoGo: boolean
  windows: boolean
  macos: boolean
  visionos: boolean
  newArchitecture: boolean
  unmaintained: boolean
  dev: boolean
  expoPlugin?: boolean
  score: number
  github: {
    urls: { repo: string }
    stats: {
      hasIssues: boolean
      hasTopics: boolean
      updatedAt: string
      stars: number
      forks: number
      subscribers: number
      issues: number
    }
    license: { key: string }
    lastRelease: { publishedAt: string; tagName: string }
    hasTypes: boolean
    newArchitecture: boolean
  }
}

export async function fetchRNDirectoryPackage(
  packageName: string
): Promise<RNDirectoryPackage | null> {
  try {
    const url = `https://reactnative.directory/api/libraries?search=${encodeURIComponent(packageName)}`
    const res = await fetch(url)
    if (!res.ok) return null
    const data = await res.json()
    const libraries = data.libraries as RNDirectoryPackage[]
    return libraries.find(l =>
      l.npmPkg === packageName ||
      l.githubUrl?.includes(packageName)
    ) ?? null
  } catch {
    return null
  }
}

export async function fetchRNDirectoryAll(): Promise<RNDirectoryPackage[]> {
  const res = await fetch('https://reactnative.directory/api/libraries')
  if (!res.ok) throw new Error('RN Directory API unavailable')
  const data = await res.json()
  return data.libraries as RNDirectoryPackage[]
}
```

**File:** `packages/core/src/signals/github.ts`

```typescript
// GitHub API signal collector
// Requires GITHUB_TOKEN env variable
// Computes bus factor, commit rhythm, lindy age, etc.

const GITHUB_API = 'https://api.github.com'

function headers() {
  return {
    'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
  }
}

function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/)
  if (!match) return null
  return { owner: match[1], repo: match[2].replace('.git', '') }
}

export interface GitHubSignals {
  stars: number
  forks: number
  open_issues: number
  subscribers: number
  created_at: string
  pushed_at: string
  license: string | null
  topics: string[]
  contributors_count: number
  top_contributor_pct: number
  commits_30d: number
  commits_90d: number
  avg_gap_days: number
  last_meaningful_commit: string | null
  closed_issues_ratio: number
  open_prs: number
  avg_pr_merge_days: number | null
  last_release_date: string | null
  last_release_tag: string | null
}

export async function fetchGitHubSignals(
  repoUrl: string
): Promise<GitHubSignals | null> {
  const parsed = parseGitHubUrl(repoUrl)
  if (!parsed) return null
  const { owner, repo } = parsed

  try {
    // Repo metadata
    const repoRes = await fetch(
      `${GITHUB_API}/repos/${owner}/${repo}`,
      { headers: headers() }
    )
    if (!repoRes.ok) return null
    const repoData = await repoRes.json()

    // Contributors (for bus factor)
    const contribRes = await fetch(
      `${GITHUB_API}/repos/${owner}/${repo}/contributors?per_page=10`,
      { headers: headers() }
    )
    const contributors = contribRes.ok ? await contribRes.json() : []
    const totalContribs = contributors.reduce(
      (sum: number, c: { contributions: number }) => sum + c.contributions, 0
    )
    const topContribPct = contributors.length > 0
      ? (contributors[0].contributions / totalContribs) * 100
      : 100

    // Recent commits for rhythm analysis
    const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const since90 = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()

    const commits30Res = await fetch(
      `${GITHUB_API}/repos/${owner}/${repo}/commits?since=${since30}&per_page=100`,
      { headers: headers() }
    )
    const commits90Res = await fetch(
      `${GITHUB_API}/repos/${owner}/${repo}/commits?since=${since90}&per_page=100`,
      { headers: headers() }
    )

    const commits30 = commits30Res.ok ? await commits30Res.json() : []
    const commits90 = commits90Res.ok ? await commits90Res.json() : []

    // Calculate avg gap between commits
    let avgGapDays = 999
    if (commits90.length > 1) {
      const dates = commits90.map((c: { commit: { author: { date: string } } }) =>
        new Date(c.commit.author.date).getTime()
      ).sort((a: number, b: number) => b - a)
      const gaps = []
      for (let i = 0; i < dates.length - 1; i++) {
        gaps.push((dates[i] - dates[i+1]) / (1000 * 60 * 60 * 24))
      }
      avgGapDays = gaps.reduce((s, g) => s + g, 0) / gaps.length
    }

    // Latest release
    const releasesRes = await fetch(
      `${GITHUB_API}/repos/${owner}/${repo}/releases/latest`,
      { headers: headers() }
    )
    const latestRelease = releasesRes.ok ? await releasesRes.json() : null

    return {
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      open_issues: repoData.open_issues_count,
      subscribers: repoData.subscribers_count,
      created_at: repoData.created_at,
      pushed_at: repoData.pushed_at,
      license: repoData.license?.key ?? null,
      topics: repoData.topics ?? [],
      contributors_count: contributors.length,
      top_contributor_pct: Math.round(topContribPct),
      commits_30d: Array.isArray(commits30) ? commits30.length : 0,
      commits_90d: Array.isArray(commits90) ? commits90.length : 0,
      avg_gap_days: Math.round(avgGapDays * 10) / 10,
      last_meaningful_commit: repoData.pushed_at,
      closed_issues_ratio: 0.7,   // TODO: calculate from issues API
      open_prs: 0,                // TODO: fetch from PRs API
      avg_pr_merge_days: null,    // TODO: calculate
      last_release_date: latestRelease?.published_at ?? null,
      last_release_tag: latestRelease?.tag_name ?? null
    }
  } catch (err) {
    console.error(`GitHub signals failed for ${repoUrl}:`, err)
    return null
  }
}

// Bus factor from contributors
export function calculateBusFactor(
  topContribPct: number,
  activeContributors: number
): number {
  if (activeContributors === 0) return 1
  if (topContribPct > 90) return 1
  if (topContribPct > 75) return 2
  if (topContribPct > 60) return 3
  if (activeContributors >= 10) return 8
  if (activeContributors >= 5) return 6
  return Math.min(activeContributors, 5)
}

// Lindy age in months from created_at
export function calculateLindyAge(createdAt: string): number {
  const created = new Date(createdAt)
  const now = new Date()
  return Math.floor(
    (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24 * 30)
  )
}
```

---

## STEP 6 â€” CLI IMPLEMENTATION

**File:** `packages/cli/src/commands/eval.ts`

```typescript
import { defineCommand } from 'citty'
import { getVitalityCard } from '@rn-terrain/core'
import { renderVitalityCard } from '../ui/card'

export const evalCommand = defineCommand({
  meta: {
    name: 'eval',
    description: 'Evaluate a React Native package'
  },
  args: {
    package: {
      type: 'positional',
      description: 'Package name to evaluate',
      required: true
    },
    json: {
      type: 'boolean',
      description: 'Output as JSON',
      default: false
    }
  },
  async run({ args }) {
    const packageName = args.package as string

    console.log(`\nâŸ³ Evaluating ${packageName}...`)

    const card = await getVitalityCard(packageName)

    if (!card) {
      console.error(`\nâœ— Package "${packageName}" not found in RN Terrain.\n`)
      process.exit(1)
    }

    if (args.json) {
      console.log(JSON.stringify(card, null, 2))
      return
    }

    renderVitalityCard(card)
  }
})
```

**File:** `packages/cli/src/ui/card.ts`

```typescript
import chalk from 'chalk'
import type { VitalityCard, RadarStatus } from '@rn-terrain/core'

const VERDICT_COLORS: Record<RadarStatus, chalk.Chalk> = {
  ADOPT:  chalk.bgGreen.black,
  TRIAL:  chalk.bgCyan.black,
  ASSESS: chalk.bgYellow.black,
  HOLD:   chalk.bgRed.white
}

const VERDICT_ICONS: Record<RadarStatus, string> = {
  ADOPT:  'âœ“',
  TRIAL:  'â—Ž',
  ASSESS: 'âš ',
  HOLD:   'âœ—'
}

function bar(score: number, max: number, width = 20): string {
  const filled = Math.round((score / max) * width)
  return chalk.green('â–ˆ'.repeat(filled)) +
    chalk.gray('â–‘'.repeat(width - filled))
}

function scoreColor(score: number): chalk.Chalk {
  if (score >= 80) return chalk.green
  if (score >= 60) return chalk.cyan
  if (score >= 40) return chalk.yellow
  return chalk.red
}

export function renderVitalityCard(card: VitalityCard): void {
  const verdict = card.radar_status
  const score = card.vitality_score
  const bd = card.score_breakdown

  console.log()
  console.log(
    chalk.bold(card.display_name ?? card.package_name) +
    chalk.gray(` v${card.version.current}`)
  )
  console.log(chalk.gray(`${card.category} Â· ${card.vendor} Â· ${card.topology_layer}`))
  console.log()

  // VERDICT + SCORE
  console.log(
    VERDICT_COLORS[verdict](` ${VERDICT_ICONS[verdict]} ${verdict} `) +
    '  ' +
    scoreColor(score).bold(`${score}/100`)
  )
  console.log()

  // SCORE BREAKDOWN
  console.log(chalk.bold('VITALITY BREAKDOWN'))
  console.log(chalk.gray('â”€'.repeat(50)))

  const sections = [
    { label: 'Maintenance Health  ', s: bd.maintenance.score, max: 30 },
    { label: 'Architectural Safety', s: bd.architecture.score, max: 25 },
    { label: 'Temporal Stamina    ', s: bd.temporal.score, max: 20 },
    { label: 'Ecosystem Position  ', s: bd.ecosystem.score, max: 15 },
    { label: 'Cost Factors        ', s: bd.cost.score, max: 10 }
  ]

  for (const { label, s, max } of sections) {
    console.log(
      chalk.gray(label) +
      '  ' +
      bar(s, max) +
      '  ' +
      scoreColor(s / max * 100)(`${s}/${max}`)
    )
  }

  console.log()

  // V1 READINESS
  const v1 = card.v1_readiness
  const v1Color = v1.status === 'READY' ? chalk.green
    : v1.status === 'ADAPTING' ? chalk.yellow
    : chalk.red
  console.log(
    chalk.bold('V1 READINESS  ') +
    v1Color(v1.status)
  )

  // WARNINGS
  if (card.warnings.length > 0) {
    console.log()
    console.log(chalk.bold('SIGNALS'))
    for (const w of card.warnings) {
      const icon = w.severity === 'critical' ? chalk.red('âœ—')
        : w.severity === 'warning' ? chalk.yellow('âš ')
        : chalk.blue('â„¹')
      console.log(`  ${icon}  ${w.message}`)
      if (w.detail) console.log(chalk.gray(`     ${w.detail}`))
    }
  }

  // LINKS
  console.log()
  console.log(chalk.bold('LINKS'))
  const links = card.links
  if (links.npm) console.log(chalk.cyan(`  npm      ${links.npm}`))
  if (links.github) console.log(chalk.cyan(`  github   ${links.github}`))
  if (links.rn_directory) console.log(chalk.cyan(`  rn dir   ${links.rn_directory}`))
  if (links.changelog) console.log(chalk.cyan(`  changes  ${links.changelog}`))
  if (links.open_issues) console.log(chalk.cyan(`  issues   ${links.open_issues}`))

  console.log()
}
```

---

## STEP 7 â€” MCP SERVER

**File:** `packages/mcp/src/index.ts`

```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import {
  getVitalityCard,
  scanProject,
  getEcosystemTopology,
  getAlternatives
} from '@rn-terrain/core'

const server = new McpServer({
  name: 'rn-terrain',
  version: '1.0.0'
})

// TOOL 1: Audit a single package
server.tool(
  'audit_package',
  'Audit a React Native or Expo package. Returns vitality score, ' +
  'architectural safety, V1 readiness, deprecation signals, ' +
  'alternatives, and links. Call this before any npx expo install command.',
  {
    packageName: z.string().describe('NPM package name e.g. react-native-reanimated'),
    context: z.object({
      workflow: z.enum(['expo_managed', 'expo_bare', 'pure_rn']).optional(),
      new_arch_only: z.boolean().optional(),
      bundle_sensitive: z.boolean().optional()
    }).optional().describe('Developer context for personalized verdict')
  },
  async ({ packageName, context }) => {
    const card = await getVitalityCard(packageName, context)

    if (!card) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            error: 'Package not found in RN Terrain registry',
            package: packageName,
            recommendation: 'Proceed with caution â€” unvetted package',
            action: 'Manual review recommended before installing'
          }, null, 2)
        }]
      }
    }

    // Compact but complete output for agent consumption
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          package: card.package_name,
          verdict: card.radar_status,
          score: card.vitality_score,
          v1_ready: card.v1_readiness.status,
          new_arch: card.compatibility.new_architecture,
          hermes_v1: card.compatibility.hermes_v1,
          critical_warnings: card.warnings
            .filter(w => w.severity === 'critical')
            .map(w => w.message),
          warnings: card.warnings
            .filter(w => w.severity === 'warning')
            .map(w => w.message),
          alternatives: card.radar_status === 'HOLD'
            ? card.alternatives.slice(0, 3).map(a => ({
                name: a.package_name,
                score: a.vitality_score,
                effort: a.migration_effort
              }))
            : [],
          links: card.links,
          action_required: card.radar_status === 'HOLD'
            ? `DO NOT INSTALL. Use alternatives: ${card.alternatives[0]?.package_name ?? 'see alternatives'}`
            : card.radar_status === 'ASSESS'
            ? 'REVIEW WARNINGS before installing'
            : 'APPROVED for installation'
        }, null, 2)
      }]
    }
  }
)

// TOOL 2: Scan project
server.tool(
  'scan_project',
  'Scan all dependencies in a package.json file and return a ' +
  'full project vitality audit. Use this for project health checks ' +
  'and to find packages that need migration.',
  {
    packageJsonPath: z.string()
      .describe('Absolute path to package.json')
      .default('./package.json')
  },
  async ({ packageJsonPath }) => {
    const audit = await scanProject(packageJsonPath)
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          total: audit.total_packages,
          summary: audit.summary,
          v1_ready: audit.v1_ready_count,
          v1_at_risk: audit.v1_at_risk_count,
          critical_warnings: audit.critical_warnings.slice(0, 10),
          packages_needing_attention: audit.packages
            .filter(p => p.radar_status === 'HOLD' || p.radar_status === 'ASSESS')
            .map(p => ({
              name: p.package_name,
              verdict: p.radar_status,
              score: p.vitality_score,
              top_warning: p.warnings[0]?.message
            })),
          migration_suggestions: audit.migration_suggestions
        }, null, 2)
      }]
    }
  }
)

// TOOL 3: Ecosystem topology
server.tool(
  'ecosystem_map',
  'Get the macro view of the RN ecosystem. ' +
  'Returns health stats, category breakdown, V1 readiness, ' +
  'and overall ecosystem trajectory.',
  {
    category: z.string().optional()
      .describe('Filter by category: navigation, storage, media, auth, etc.')
  },
  async ({ category }) => {
    const topology = await getEcosystemTopology(category)
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(topology, null, 2)
      }]
    }
  }
)

// TOOL 4: Get alternatives
server.tool(
  'get_alternatives',
  'Get recommended alternatives for a package, ' +
  'especially useful when a package verdict is HOLD.',
  {
    packageName: z.string(),
    maxResults: z.number().min(1).max(10).default(5)
  },
  async ({ packageName, maxResults }) => {
    const alternatives = await getAlternatives(packageName, maxResults)
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(alternatives, null, 2)
      }]
    }
  }
)

// Boot
async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
}

main().catch(console.error)
```

---

## STEP 8 â€” SEED DATA

**File:** `supabase/seed/top-packages.ts`

Start with these 20 packages for proof-of-life.
Manually curate key fields. Run sync for the rest.

```typescript
export const SEED_PACKAGES = [
  { package_name: 'react-native-reanimated', category: 'animation', vendor: 'software-mansion' },
  { package_name: 'react-native-gesture-handler', category: 'ui', vendor: 'software-mansion' },
  { package_name: 'react-native-mmkv', category: 'storage', vendor: 'independent' },
  { package_name: '@react-navigation/native', category: 'navigation', vendor: 'independent' },
  { package_name: 'expo-router', category: 'navigation', vendor: 'expo' },
  { package_name: 'react-native-screens', category: 'navigation', vendor: 'software-mansion' },
  { package_name: 'react-native-safe-area-context', category: 'ui', vendor: 'software-mansion' },
  { package_name: 'expo-camera', category: 'media', vendor: 'expo' },
  { package_name: '@shopify/react-native-skia', category: 'ui', vendor: 'shopify' },
  { package_name: 'react-native-vision-camera', category: 'media', vendor: 'independent' },
  { package_name: 'react-native-async-storage', category: 'storage', vendor: 'independent' },
  { package_name: 'expo-notifications', category: 'sensors', vendor: 'expo' },
  { package_name: 'react-native-maps', category: 'sensors', vendor: 'independent' },
  { package_name: 'react-native-svg', category: 'ui', vendor: 'software-mansion' },
  { package_name: 'expo-image', category: 'media', vendor: 'expo' },
  { package_name: 'react-native-webview', category: 'ui', vendor: 'independent' },
  { package_name: 'react-native-pager-view', category: 'ui', vendor: 'software-mansion' },
  { package_name: 'react-native-paper', category: 'ui', vendor: 'callstack' },
  { package_name: '@legendapp/state', category: 'storage', vendor: 'independent' },
  { package_name: 'react-native-nitro-modules', category: 'tooling', vendor: 'independent' }
]
```

---

## STEP 9 â€” ENVIRONMENT VARIABLES

**File:** `.env.local` (never commit this)

```bash
# Supabase
SUPABASE_URL=your_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key

# GitHub (required for vitality signals)
GITHUB_TOKEN=your_personal_access_token
# Needs: public_repo read access only

# Optional future
TWITTER_BEARER_TOKEN=
NPM_REGISTRY_TOKEN=
```

---

## STEP 10 â€” PROOF OF LIFE TEST

When Bloom 1 is complete, this should work:

```bash
# Install globally or use npx
npx rn-eval react-native-reanimated

# Expected output:
# react-native-reanimated v3.x.x
# animation Â· software-mansion Â· L2
#
#  âœ“ ADOPT   86/100
#
# VITALITY BREAKDOWN
# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
# Maintenance Health    â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ  24/30
# Architectural Safety  â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ  21/25
# ...
# V1 READINESS  READY
#
# LINKS
#   npm      https://npmjs.com/package/react-native-reanimated
#   github   https://github.com/software-mansion/react-native-reanimated
# ...
```

This is the milestone. Everything else is Bloom 2+.

---

## AGENT OPERATING PRINCIPLES

**1. Types first, always.**
The TypeScript interfaces in `packages/core/src/types/index.ts`
are the contract. Build to them. Never change them without
flagging to Neev.

**2. Database is the source of truth.**
All signals come from Supabase. Collectors populate it.
Adapters (CLI, MCP, web) read from it. Never query
GitHub/npm/RNDir directly from a CLI command â€” always
go through the DB layer with a freshness check.

**3. Graceful degradation everywhere.**
If GitHub API fails â†’ return cached data with staleness flag.
If package not in DB â†’ return "unvetted" card, not an error.
If score calculation fails â†’ return partial card with warning.
Never crash. Never block the developer's workflow.

**4. Links are mandatory.**
Every signal must have a source URL in the VitalityCard.
If you can't link to it, you can't show it.

**5. The event log is append-only.**
Never UPDATE ecosystem_events. Only INSERT.
This is the ecosystem's memory.

**6. Test on real packages.**
After any change to scoring logic, run against:
react-native-reanimated (should be ADOPT)
react-native-async-storage (should be TRIAL or ASSESS)
A clearly abandoned package (should be HOLD)
If the verdicts feel wrong, flag to Neev.

---

*Build the core. Wire one package end to end.*
*Print the VitalityCard in the terminal.*
*That is Bloom 1.*
*Everything else follows.*



---

# APPENDIX A â€” RSS MONITORING PIPELINE

## Implementation for the Push Layer (Bloom 2)

**File:** `packages/core/src/sync/rss-monitor.ts`

```typescript
// RSS/Atom feed monitor
// Runs every 15 minutes via cron
// No scraping needed â€” sources publish feeds natively

export const RSS_SOURCES = [
  {
    name: 'expo-blog',
    url: 'https://blog.expo.dev/rss.xml',
    cluster: 'expo',
    type: 'blog' as const
  },
  {
    name: 'rn-blog',
    url: 'https://reactnative.dev/blog/rss.xml',
    cluster: 'rn-core',
    type: 'blog' as const
  },
  {
    name: 'swm-blog',
    url: 'https://blog.swmansion.com/rss',
    cluster: 'swm',
    type: 'blog' as const
  },
  {
    name: 'callstack-blog',
    url: 'https://www.callstack.com/blog-feed.xml',
    cluster: 'callstack',
    type: 'blog' as const
  },
  {
    name: 'reddit-reactnative',
    url: 'https://www.reddit.com/r/reactnative.rss',
    cluster: 'community',
    type: 'community' as const
  },
  // GitHub release feeds â€” add per tracked package
  // github.com/:owner/:repo/releases.atom
]

// YouTube channels â€” RSS without API key
export const YOUTUBE_CHANNELS = [
  {
    name: 'appjs-conf',
    channelId: 'UCk7kFKPMSBnj4t1lqoK-cRA',
    cluster: 'conference'
  },
  {
    name: 'chain-react',
    channelId: 'UCwpSood0XtTvmes_e69nHhQ',
    cluster: 'conference'
  },
]

// YouTube RSS URL builder
export function youtubeRSSUrl(channelId: string): string {
  return `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`
}

// Event classification from RSS entry
export function classifyFeedEntry(entry: {
  title: string
  url: string
  source: string
  cluster: string
}): {
  event_type: string
  severity: 'info' | 'warning' | 'critical'
  affects: string[]
} {
  const title = entry.title.toLowerCase()

  // Critical signals
  if (title.includes('deprecated') || title.includes('deprecation'))
    return { event_type: 'deprecation_notice', severity: 'critical', affects: [] }
  if (title.includes('breaking change') || title.includes('breaking:'))
    return { event_type: 'breaking_change', severity: 'critical', affects: [] }
  if (title.includes('security') || title.includes('vulnerability'))
    return { event_type: 'security_notice', severity: 'critical', affects: [] }

  // SDK/Version releases
  if (title.match(/sdk\s*\d+/i) && entry.cluster === 'expo')
    return { event_type: 'expo_sdk_released', severity: 'warning', affects: [] }
  if (title.match(/react native \d+\.\d+/i))
    return { event_type: 'rn_version_released', severity: 'warning', affects: [] }
  if (title.match(/v1\.0|version 1\.0|1\.0 release/i))
    return { event_type: 'rn_v1_milestone', severity: 'warning', affects: [] }

  // Conference / talks
  if (entry.cluster === 'conference')
    return { event_type: 'conference_talk_published', severity: 'info', affects: [] }

  // Default
  return { event_type: 'ecosystem_update', severity: 'info', affects: [] }
}
```

---

# APPENDIX B â€” KEY PERSON CLUSTER SEEDING

**File:** `supabase/seed/key-persons.ts`

```typescript
import type { Database } from '../types'

type KeyPerson = Database['public']['Tables']['key_persons']['Insert']

export const KEY_PERSONS: KeyPerson[] = [
  // CLUSTER 1: RN Core (Meta)
  {
    name: 'Nicola Corti',
    github_handle: 'cortinico',
    twitter_handle: 'cortinico',
    affiliation: 'meta',
    signal_weight: 10,
    focus_areas: ['new-architecture', 'v1-roadmap', 'hermes', 'core']
  },
  {
    name: 'Lorenzo Sciandra',
    github_handle: 'kelset',
    twitter_handle: 'kelset',
    affiliation: 'meta',
    signal_weight: 10,
    focus_areas: ['releases', 'core', 'community', 'v1-roadmap']
  },
  {
    name: 'Riccardo Cipolleschi',
    github_handle: 'cipolleschi',
    twitter_handle: 'cipolleschi',
    affiliation: 'meta',
    signal_weight: 10,
    focus_areas: ['new-architecture', 'fabric', 'turbomodules', 'ios']
  },

  // CLUSTER 2: Expo
  {
    name: 'Evan Bacon',
    github_handle: 'EvanBacon',
    twitter_handle: 'Baconbrix',
    affiliation: 'expo',
    signal_weight: 10,
    focus_areas: ['expo-router', 'expo-agent', 'web', 'tooling']
  },
  {
    name: 'Brent Vatne',
    github_handle: 'brentvatne',
    twitter_handle: 'notbrent',
    affiliation: 'expo',
    signal_weight: 10,
    focus_areas: ['expo-sdk', 'managed-workflow', 'community']
  },
  {
    name: 'Cedric van Putten',
    github_handle: 'EvanBacon',  // placeholder â€” update
    twitter_handle: 'cedricvanputten',
    affiliation: 'expo',
    signal_weight: 9,
    focus_areas: ['expo-modules', 'native-modules', 'tooling']
  },

  // CLUSTER 3: Software Mansion
  {
    name: 'Krzysztof Magiera',
    github_handle: 'kmagiera',
    twitter_handle: 'kzzzf',
    affiliation: 'software-mansion',
    signal_weight: 10,
    focus_areas: ['reanimated', 'gesture-handler', 'jsi', 'new-architecture']
  },
  {
    name: 'MichaÅ‚ PierzchaÅ‚a',
    github_handle: 'thymikee',
    twitter_handle: 'thymikee',
    affiliation: 'software-mansion',
    signal_weight: 9,
    focus_areas: ['radon-ide', 'testing', 'tooling', 'jest']
  },
  {
    name: 'Oskar KwaÅ›niewski',
    github_handle: 'okwasniewski',
    twitter_handle: 'okwasniewski',
    affiliation: 'software-mansion',
    signal_weight: 9,
    focus_areas: ['nitro-modules', 'jsi', 'ios', 'new-architecture']
  },

  // CLUSTER 4: Callstack
  {
    name: 'Mike Grabowski',
    github_handle: 'grabbou',
    twitter_handle: 'grabbou',
    affiliation: 'callstack',
    signal_weight: 10,
    focus_areas: ['re-pack', 'enterprise-rn', 'community', 'tooling']
  },
  {
    name: 'Satya Sahoo',
    github_handle: 'satya164',
    twitter_handle: 'satya164',
    affiliation: 'callstack',
    signal_weight: 9,
    focus_areas: ['react-navigation', 'ui-libraries', 'community']
  },

  // CLUSTER 5: Independent Innovators
  {
    name: 'Marc Rousavy',
    github_handle: 'mrousavy',
    twitter_handle: 'mrousavy',
    affiliation: 'independent',
    signal_weight: 10,
    focus_areas: ['nitro-modules', 'vision-camera', 'native-perf', 'jsi']
  },
  {
    name: 'Anthony Fu',
    github_handle: 'antfu',
    twitter_handle: 'antfu7',
    affiliation: 'independent',
    signal_weight: 9,
    focus_areas: ['tooling', 'taze', 'ecosystem', 'dx']
  },
  {
    name: 'Fernando Rojo',
    github_handle: 'nandorojo',
    twitter_handle: 'fernandotherojo',
    affiliation: 'independent',
    signal_weight: 8,
    focus_areas: ['solito', 'cross-platform', 'moti', 'dripsy']
  },
  {
    name: 'William Candillon',
    github_handle: 'wcandillon',
    twitter_handle: 'wcandillon',
    affiliation: 'independent',
    signal_weight: 8,
    focus_areas: ['skia', 'shader-ui', 'animation', 'wasm']
  }
]
```

---

# APPENDIX C â€” AGENT WORKING RULES SUMMARY

Quick reference. Pin this at the top of your context.

```
WHAT YOU ARE BUILDING:
  RN Terrain â€” live intelligence layer for React Native ecosystem
  Architect: Neev. You are the hands.

BLOOM 1 ONLY (until Neev says otherwise):
  âœ“ @rn-terrain/core with VitalityCard output
  âœ“ @rn-terrain/cli with `npx rn-eval <package>` working
  âœ“ @rn-terrain/mcp with audit_package tool working
  âœ— Web surface â€” Bloom 2
  âœ— VS Code extension â€” Bloom 2
  âœ— Push/digest â€” Bloom 2

THE CONTRACT (never change without Neev):
  packages/core/src/types/index.ts
  VitalityCard interface is immutable

THE PROOF OF LIFE:
  npx rn-eval react-native-reanimated
  â†’ prints VitalityCard with score + breakdown
  â†’ verdict: ADOPT
  â†’ V1 readiness: READY
  â†’ links: npm + github + rn-directory

GRACEFUL DEGRADATION:
  GitHub API fails â†’ return cached + staleness flag
  Package not in DB â†’ return "unvetted" card
  Score calc fails â†’ return partial card + warning
  NEVER crash. NEVER block developer workflow.

TEST VERDICTS (run after any scoring change):
  react-native-reanimated     â†’ should be ADOPT
  react-native-async-storage  â†’ should be TRIAL/ASSESS  
  [any clearly abandoned pkg] â†’ should be HOLD

THE EVENT LOG:
  ecosystem_events is APPEND ONLY
  Never UPDATE. Never DELETE.
  Only INSERT.

LINKS ARE MANDATORY:
  Every signal needs source_url in VitalityCard
  No source = don't show the signal
```



---

# APPENDIX D â€” CAPABILITY CARD TYPES & IMPLEMENTATION

## New TypeScript Interfaces

**Add to:** `packages/core/src/types/index.ts`

```typescript
// ============================================================
// THREAD MODEL â€” how computation runs
// ============================================================
export type ThreadModel =
  | 'js_thread_blocking'      // blocks JS thread
  | 'js_thread_nonblocking'   // async on JS thread
  | 'jsi_direct'              // JSI C++ fast path
  | 'worklet_offloaded'       // separate worklet thread
  | 'native_thread'           // fully native thread
  | 'unknown'

export type WASMThreadModel =
  | 'js_thread_blocking'      // WASM on JS thread â€” flag this
  | 'worklet_offloaded'       // WASM via RN Worklets 8.0+
  | 'unknown'

// ============================================================
// COMPATIBILITY ENTRY
// ============================================================
export type CompatibilityStatus =
  | 'confirmed'    // official/maintainer documented
  | 'community'    // 3+ community reports
  | 'partial'      // works but with caveats
  | 'incompatible' // documented breakage
  | 'untested'     // no data either way â€” honest default

export interface CompatibilityEntry {
  package_name: string
  status: CompatibilityStatus
  confidence: ConfidenceLevel
  notes?: string
  source_url?: string
  last_verified?: string
}

// ============================================================
// CAPABILITY CARD
// ============================================================
export interface CapabilityCard {
  package_name: string
  primary_purpose: string           // one line, no jargon
  key_capabilities: string[]        // specific and technical
  known_limitations: string[]       // what it cannot do
  performance_profile: {
    summary: string
    benchmarks: Array<{
      metric: string
      value: string
      vs_alternative?: string
      source_url?: string
    }>
    thread_model: ThreadModel
    wasm_thread_model?: WASMThreadModel
    wasm_worklets_required?: boolean
    wasm_worklets_min_version?: string
  }
  context_requirements: {
    new_arch_required: boolean
    expo_go_compatible: boolean
    expo_managed_compatible: boolean
    bare_rn_compatible: boolean
    min_rn_version?: string
    min_ios?: string
    min_android_sdk?: number
    requires_dev_build: boolean
    requires_native_build: boolean
    additional?: string[]
  }
  compatibility_matrix: {
    animation: CompatibilityEntry[]
    navigation: CompatibilityEntry[]
    state: CompatibilityEntry[]
    storage: CompatibilityEntry[]
    ai_ml: CompatibilityEntry[]
    camera: CompatibilityEntry[]
    testing: CompatibilityEntry[]
    build: CompatibilityEntry[]
  }
  last_verified: string
  confidence: ConfidenceLevel
  sources: string[]
}

// ============================================================
// STACK POSITION â€” where package lives in dependency graph
// ============================================================
export interface StackPosition {
  package_name: string
  depends_on: Array<{
    package_name: string
    is_peer: boolean
    is_optional: boolean
    vitality_score?: number
    radar_status?: RadarStatus
  }>
  depended_on_by_count: number      // how many packages need this
  cascade_risk: 'low' | 'medium' | 'high' | 'critical'
  cascade_notes?: string            // what breaks if this breaks
  commonly_paired: Array<{
    package_name: string
    context: string
    co_occurrence_score: number
  }>
}

// ============================================================
// EXTENDED VITALITY CARD â€” adds capability + stack
// ============================================================
export interface VitalityCardFull extends VitalityCard {
  capability?: CapabilityCard       // Layer 3 â€” loaded on demand
  stack_position?: StackPosition    // Layer 3 â€” loaded on demand
}
```

## New Schema Fields

**Add to:** `supabase/migrations/002_capability_fields.sql`

```sql
-- WASM thread model â€” critical for architecture scoring
ALTER TABLE packages ADD COLUMN IF NOT EXISTS
  wasm_thread_model TEXT DEFAULT 'unknown';
  -- 'js_thread_blocking' | 'worklet_offloaded' | 'unknown'

ALTER TABLE packages ADD COLUMN IF NOT EXISTS
  wasm_worklets_required BOOLEAN DEFAULT false;

ALTER TABLE packages ADD COLUMN IF NOT EXISTS
  wasm_worklets_min_version TEXT;

-- Capability card fields
ALTER TABLE packages ADD COLUMN IF NOT EXISTS
  primary_purpose TEXT;

ALTER TABLE packages ADD COLUMN IF NOT EXISTS
  key_capabilities TEXT[] DEFAULT '{}';

ALTER TABLE packages ADD COLUMN IF NOT EXISTS
  known_limitations TEXT[] DEFAULT '{}';

ALTER TABLE packages ADD COLUMN IF NOT EXISTS
  thread_model TEXT DEFAULT 'unknown';

-- Compatibility matrix (stored as JSONB for flexibility)
ALTER TABLE packages ADD COLUMN IF NOT EXISTS
  compatibility_matrix JSONB DEFAULT '{}';

-- Stack position
ALTER TABLE packages ADD COLUMN IF NOT EXISTS
  depended_on_by_count INTEGER DEFAULT 0;

ALTER TABLE packages ADD COLUMN IF NOT EXISTS
  cascade_risk TEXT DEFAULT 'low';

-- Progressive disclosure: which layer is data complete for
ALTER TABLE packages ADD COLUMN IF NOT EXISTS
  layer_completeness INTEGER DEFAULT 1;
  -- 1 = identity only, 2 = signals, 3 = capability card
```

## Progressive Disclosure in CLI Rendering

**Update:** `packages/cli/src/ui/card.ts`

```typescript
export type DisclosureLayer = 0 | 1 | 2 | 3 | 4

export function renderVitalityCard(
  card: VitalityCardFull,
  layer: DisclosureLayer = 1
): void {
  // Layer 0 â€” single line
  if (layer === 0) {
    renderLayer0(card)
    return
  }

  // Layer 1 â€” default
  renderLayer1(card)
  if (layer === 1) return

  // Layer 2 â€” adds breakdown + capability summary
  renderScoreBreakdown(card.score_breakdown)
  renderCapabilitySummary(card.capability)
  if (layer === 2) return

  // Layer 3 â€” full card
  renderFullCapabilityCard(card.capability)
  renderStackPosition(card.stack_position)
  renderFullEventHistory(card.recent_events)
  if (layer === 3) return

  // Layer 4 â€” JSON output (handled by --json flag)
}

function renderLayer0(card: VitalityCardFull): void {
  const score = card.vitality_score
  const verdict = card.radar_status
  const color = scoreColor(score)

  console.log(
    chalk.bold(card.package_name) +
    chalk.gray('  ') +
    chalk.gray(card.capability?.primary_purpose ?? card.category) +
    chalk.gray('  ') +
    color(`${score}`) +
    chalk.gray('  ') +
    VERDICT_COLORS[verdict](` ${verdict} `)
  )
}

function renderCapabilitySummary(cap?: CapabilityCard): void {
  if (!cap) return
  console.log()
  console.log(chalk.bold('CAPABILITY'))
  console.log(chalk.gray('  ') + cap.primary_purpose)
  if (cap.known_limitations.length > 0) {
    console.log(
      chalk.yellow('  âœ— ') +
      chalk.gray(cap.known_limitations[0])
    )
  }
  if (cap.performance_profile.wasm_thread_model === 'js_thread_blocking') {
    console.log(
      chalk.red('  âš  ') +
      chalk.gray('WASM present but JS-thread blocking â€” no performance benefit')
    )
  }
}
```

---

# APPENDIX E â€” LIST RENDERING DECISION TREE

## For Gate 1 Discovery â€” Category: list-rendering

When a developer asks "I need a list component" â€”
the ecosystem_map tool should surface this decision tree
rather than just ranking by vitality score.

```typescript
// packages/mcp/src/tools/guided-selection.ts

// Category-specific decision guides
// These are curated expert thinking made accessible

export const LIST_RENDERING_GUIDE = {
  category: 'list-rendering',
  packages: ['@shopify/flash-list', '@legendapp/list', 'react-native'],
  decision_tree: [
    {
      question: 'How many items in your list?',
      options: [
        {
          answer: 'Under 300',
          recommendation: 'react-native FlatList',
          reason: 'Built-in, no dependency, sufficient for small lists'
        },
        {
          answer: '300+',
          next_question: 'Are you on New Architecture?'
        }
      ]
    },
    {
      question: 'Are you on New Architecture?',
      options: [
        {
          answer: 'No / unsure',
          next_question: 'Do items have dynamic heights?'
        },
        {
          answer: 'Yes â€” New Arch only',
          next_question: 'Do you need chat UI or bidirectional scroll?'
        }
      ]
    },
    {
      question: 'Do items have dynamic/unpredictable heights?',
      options: [
        {
          answer: 'No â€” uniform heights',
          recommendation: '@shopify/flash-list',
          reason: '5-10x faster than FlatList, optimized for uniform items'
        },
        {
          answer: 'Yes â€” dynamic heights',
          recommendation: '@legendapp/list',
          reason: 'Handles dynamic heights natively, zero config'
        }
      ]
    },
    {
      question: 'Do you need chat UI or bidirectional scroll?',
      options: [
        {
          answer: 'Yes',
          recommendation: '@legendapp/list',
          reason: 'Built specifically for chat UI and bidirectional infinite scroll'
        },
        {
          answer: 'No',
          next_question: 'Do items have dynamic heights?'
        }
      ]
    }
  ]
}

// This pattern extends to every category where
// capability-fit matters as much as vitality score.
// Navigation, storage, camera, state â€” all get guided selection.
```



---

# APPENDIX F â€” SUSTAINABILITY & APPRECIATION LAYER

## New Schema Fields

**Add to:** `supabase/migrations/003_sustainability_fields.sql`

```sql
-- SUSTAINABILITY
ALTER TABLE packages ADD COLUMN IF NOT EXISTS
  sustainability_model TEXT DEFAULT 'unknown';
  -- 'corporate_backed' | 'foundation' | 'sponsored' |
  -- 'unfunded_solo' | 'community' | 'crisis_risk' | 'unknown'

ALTER TABLE packages ADD COLUMN IF NOT EXISTS
  has_verified_funding BOOLEAN DEFAULT false;

ALTER TABLE packages ADD COLUMN IF NOT EXISTS
  funding_github_sponsors TEXT;   -- verified URL only

ALTER TABLE packages ADD COLUMN IF NOT EXISTS
  funding_open_collective TEXT;   -- verified URL only

ALTER TABLE packages ADD COLUMN IF NOT EXISTS
  funding_npm_field JSONB;        -- raw npm funding field

ALTER TABLE packages ADD COLUMN IF NOT EXISTS
  bus_factor_level TEXT DEFAULT 'unknown';
  -- 'solo' | 'small' (2-4) | 'team' (5+) | 'corporate' | 'unknown'

-- BINDING TYPE
ALTER TABLE packages ADD COLUMN IF NOT EXISTS
  binding_type TEXT DEFAULT 'unknown';
  -- 'pure_js' | 'expo_modules' | 'nitro_modules' |
  -- 'jsi_cpp' | 'uniffi_rust' | 'legacy_bridge' | 'unknown'

-- INSTALL METHOD
ALTER TABLE packages ADD COLUMN IF NOT EXISTS
  install_method TEXT DEFAULT 'npm';
  -- 'npm' | 'github' | 'manual_bindings' | 'cli_generated'

ALTER TABLE packages ADD COLUMN IF NOT EXISTS
  install_notes TEXT;

-- BADGE
ALTER TABLE packages ADD COLUMN IF NOT EXISTS
  badge_url TEXT;   -- generated: rnterrain.dev/badge/:name

-- RHYTHM SIGNALS
ALTER TABLE packages ADD COLUMN IF NOT EXISTS
  release_cadence_days FLOAT;     -- avg days between releases
ALTER TABLE packages ADD COLUMN IF NOT EXISTS
  commit_cadence_days FLOAT;      -- avg days between commits
ALTER TABLE packages ADD COLUMN IF NOT EXISTS
  release_deviation_factor FLOAT; -- current gap / normal cadence
ALTER TABLE packages ADD COLUMN IF NOT EXISTS
  commit_deviation_factor FLOAT;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS
  rhythm_status TEXT DEFAULT 'unknown';
  -- 'normal' | 'slow' | 'concerning' | 'silent'
```

## New TypeScript Types

**Add to:** `packages/core/src/types/index.ts`

```typescript
// ============================================================
// SUSTAINABILITY
// ============================================================
export type SustainabilityModel =
  | 'corporate_backed'
  | 'foundation'
  | 'sponsored'
  | 'unfunded_solo'
  | 'community'
  | 'crisis_risk'     // Marak threshold crossed
  | 'unknown'

export type BusFactorLevel =
  | 'solo'            // Bus Factor = 1
  | 'small'           // 2â€“4
  | 'team'            // 5+
  | 'corporate'       // vendor-backed team
  | 'unknown'

export interface SustainabilityCard {
  model: SustainabilityModel
  bus_factor: number
  bus_factor_level: BusFactorLevel
  has_verified_funding: boolean
  funding_links: {
    github_sponsors?: string
    open_collective?: string
    npm_funding?: object
    polar?: string
  }
  is_marak_risk: boolean          // computed flag
  weekly_downloads: number        // context for risk assessment
  appreciation_cta: string        // generated message
}

// ============================================================
// BINDING TYPE
// ============================================================
export type BindingType =
  | 'pure_js'
  | 'expo_modules'
  | 'nitro_modules'
  | 'jsi_cpp'
  | 'uniffi_rust'     // Rust via UniFFI â€” new category
  | 'legacy_bridge'
  | 'unknown'

export type InstallMethod =
  | 'npm'
  | 'github'
  | 'manual_bindings'
  | 'cli_generated'

// ============================================================
// RHYTHM SIGNALS
// ============================================================
export interface RhythmSignals {
  release_cadence_days: number
  commit_cadence_days: number
  release_deviation_factor: number    // current / normal
  commit_deviation_factor: number
  status: 'normal' | 'slow' | 'concerning' | 'silent'
}

// ============================================================
// SYMBOL SET â€” for CLI and VS Code rendering
// ============================================================
export const SYMBOLS = {
  verdict: {
    ADOPT:  'âœ“',
    TRIAL:  'â—Ž',
    ASSESS: 'âš ',
    HOLD:   'âœ—',
  },
  architecture: {
    native_jsi:           'ðŸ—',
    compatibility_layer:  'ðŸŒ‰',
    pure_js:              'ðŸŸ°',
    legacy_bridge:        'âš™ï¸',
    uniffi_rust:          'ðŸ¦€',
    nitro:                'ðŸ¦…',
    wasm:                 'ðŸ“¦',
    worklet:              'ðŸ§µ',
  },
  sustainability: {
    funded:               'ðŸ’›',
    solo:                 'ðŸ‘¤',
    small_team:           'ðŸ‘¥',
    corporate:            'ðŸ¢',
    foundation:           'ðŸ›ï¸',
    crisis:               'ðŸ†˜',
    burnout_risk:         'â¤ï¸â€ðŸ”¥',
  },
  health: {
    normal:               'ðŸ’š',
    slow:                 'ðŸ’›',
    concerning:           'ðŸ§¡',
    silent:               'â¤ï¸',
    deprecated:           'ðŸ’€',
  },
  bundle: {
    tiny:                 'ðŸª¶',   // < 10kb
    moderate:             'ðŸ“',   // 10â€“200kb
    heavy:                'ðŸ‹ï¸',   // 200kbâ€“1mb
    very_heavy:           'ðŸ˜',   // > 1mb
  },
  temporal: {
    v1_ready:             'âš¡',
    active:               'ðŸ”„',
    stale:                'ðŸ“…',
    new_package:          'ðŸŒ±',   // Lindy < 6mo
    mature:               'ðŸŒ³',   // Lindy > 24mo
  },
  confidence: {
    verified:             'â—',
    high:                 'â—',
    medium:               'â—‰',
    low:                  'â—‹',
    unknown:              '?',
  },
  special: {
    non_npm_install:      'âš ',
    expo_go_incompatible: 'ðŸ”Œ',
    experimental:         'ðŸ§ª',
    recommended:          'ðŸŽ¯',
    key_person_signal:    'ðŸ“£',
    in_digest:            'ðŸ—žï¸',
  }
} as const

// ============================================================
// MARAK THRESHOLD CHECK
// ============================================================
export function isMarakRiskProfile(pkg: {
  bus_factor: number
  sustainability_model: SustainabilityModel
  downloads_weekly_npm: number
  has_verified_funding: boolean
  rhythm_status: string
}): boolean {
  return (
    pkg.bus_factor === 1 &&
    pkg.sustainability_model === 'unfunded_solo' &&
    pkg.downloads_weekly_npm > 100_000 &&
    !pkg.has_verified_funding &&
    (pkg.rhythm_status === 'concerning' || pkg.rhythm_status === 'silent')
  )
}

// ============================================================
// COMPACT LINE RENDERER â€” for CLI --compact and scan output
// ============================================================
export function renderCompactLine(card: VitalityCard): string {
  const v = SYMBOLS.verdict[card.radar_status]
  const score = card.vitality_score
  const arch = SYMBOLS.architecture[card.compatibility.new_architecture] ?? ''
  const v1 = card.v1_readiness.status === 'READY' ? SYMBOLS.temporal.v1_ready : ''
  const funded = card.sustainability?.has_verified_funding
    ? SYMBOLS.sustainability.funded : ''
  const solo = card.sustainability?.bus_factor_level === 'solo'
    ? SYMBOLS.sustainability.solo : ''
  const rhythm = card.rhythm?.status
    ? SYMBOLS.health[card.rhythm.status] ?? '' : ''

  const signals = [arch, v1, funded, solo, rhythm]
    .filter(Boolean).join('')

  return `${v}${score} ${signals}  ${card.package_name}`
}

// Example outputs:
// âœ“89 ðŸ—âš¡ðŸ’›  react-native-reanimated
// âœ—12 âš™ï¸ðŸ’€ðŸ‘¤ðŸ†˜  react-native-camera
// â—Ž62 ðŸ¦€âš¡     mopro-ffi
```

## Funding Verification Service

**File:** `packages/core/src/signals/funding.ts`

```typescript
// Verifies funding links through official APIs only
// Never scrapes README â€” too dangerous

export interface FundingLinks {
  github_sponsors?: string
  open_collective?: string
  npm_funding?: object
  polar?: string
}

// Check npm package.json funding field (most reliable)
export async function getNpmFunding(
  packageName: string
): Promise<object | null> {
  const res = await fetch(
    `https://registry.npmjs.org/${packageName}/latest`
  )
  if (!res.ok) return null
  const data = await res.json()
  return data.funding ?? null
}

// Verify GitHub Sponsors existence
export async function verifyGitHubSponsors(
  githubHandle: string
): Promise<string | null> {
  const res = await fetch(
    `https://api.github.com/users/${githubHandle}`,
    { headers: headers() }
  )
  if (!res.ok) return null
  const data = await res.json()
  // Check if user has sponsors enabled
  const sponsorRes = await fetch(
    `https://api.github.com/users/${githubHandle}/sponsoring`,
    { headers: headers() }
  )
  if (sponsorRes.ok) {
    return `https://github.com/sponsors/${githubHandle}`
  }
  return null
}

// Verify Open Collective
export async function verifyOpenCollective(
  slug: string
): Promise<string | null> {
  try {
    const res = await fetch(
      `https://opencollective.com/${slug}/settings.json`
    )
    if (res.ok) return `https://opencollective.com/${slug}`
    return null
  } catch {
    return null
  }
}

// Compute sustainability model from available signals
export function computeSustainabilityModel(pkg: {
  vendor: string
  bus_factor: number
  has_verified_funding: boolean
  contributors_active_90d: number
}): SustainabilityModel {
  const corporateVendors = ['expo', 'software-mansion', 'callstack', 'meta', 'shopify']
  if (corporateVendors.includes(pkg.vendor)) return 'corporate_backed'

  if (pkg.bus_factor >= 5 && pkg.has_verified_funding) return 'foundation'
  if (pkg.has_verified_funding) return 'sponsored'
  if (pkg.bus_factor === 1) return 'unfunded_solo'
  if (pkg.contributors_active_90d >= 2) return 'community'

  return 'unknown'
}
```

## Badge Generation Endpoint

**File:** `apps/web/app/badge/[package]/route.ts` (Bloom 2)

```typescript
// shields.io compatible badge endpoint
// GET /badge/react-native-reanimated
// Returns SVG badge

import { getVitalityCard } from '@rn-terrain/core'

export async function GET(
  request: Request,
  { params }: { params: { package: string } }
) {
  const card = await getVitalityCard(params.package)

  if (!card) {
    return new Response(
      generateBadge('RN Terrain', 'unknown', 'lightgrey'),
      { headers: { 'Content-Type': 'image/svg+xml' } }
    )
  }

  const label = 'RN Terrain'
  const message = `${card.radar_status} ${card.vitality_score}`
  const color = card.vitality_score >= 80 ? 'brightgreen'
    : card.vitality_score >= 60 ? 'green'
    : card.vitality_score >= 40 ? 'yellow'
    : 'red'

  // Redirect to shields.io with our data
  const shieldsUrl = `https://img.shields.io/badge/${
    encodeURIComponent(label)
  }-${
    encodeURIComponent(message)
  }-${color}`

  return Response.redirect(shieldsUrl)
}
```

---

# APPENDIX G â€” DISCOVERY PIPELINE IMPLEMENTATION

## GitHub Topic Discovery

**File:** `packages/core/src/sync/discovery.ts`

```typescript
// Weekly discovery scan for unlisted packages

const DISCOVERY_TOPIC_COMBOS = [
  ['react-native', 'zero-knowledge'],
  ['react-native', 'wasm'],
  ['react-native', 'rust'],
  ['react-native', 'ai'],
  ['react-native', 'machine-learning'],
  ['react-native', 'ffi'],
  ['react-native', 'cryptography'],
  ['react-native', 'bluetooth'],
  ['expo', 'rust'],
  ['expo', 'ffi'],
  ['expo', 'uniffi'],
]

export async function runDiscoveryScan(): Promise<DiscoveredPackage[]> {
  const discovered: DiscoveredPackage[] = []

  for (const [topic1, topic2] of DISCOVERY_TOPIC_COMBOS) {
    const query = `topic:${topic1}+topic:${topic2}`
    const res = await fetch(
      `https://api.github.com/search/repositories?q=${query}&sort=updated&per_page=30`,
      { headers: headers() }
    )
    if (!res.ok) continue

    const data = await res.json()
    for (const repo of data.items) {
      // Check if already tracked
      const existing = await checkIfTracked(repo.full_name)
      if (!existing) {
        discovered.push({
          github_url: repo.html_url,
          name: repo.name,
          description: repo.description,
          topics: repo.topics,
          stars: repo.stargazers_count,
          discovery_source: `topics:${topic1}+${topic2}`,
          needs_review: true
        })
      }
    }
  }

  // Log all discoveries to review queue
  await insertDiscoveryQueue(discovered)
  return discovered
}

interface DiscoveredPackage {
  github_url: string
  name: string
  description?: string
  topics: string[]
  stars: number
  discovery_source: string
  needs_review: boolean
}
```

---

# APPENDIX H â€” AGENT WORKING RULES UPDATE

## Updated Quick Reference

```
NEW FIELDS TO POPULATE (add to seed + sync):
  sustainability_model      compute from vendor + bus_factor + funding
  has_verified_funding      check npm funding field + GitHub Sponsors API
  funding_github_sponsors   verified URL only â€” never README scraped
  bus_factor_level          derived from bus_factor number
  binding_type              uniffi_rust | jsi_cpp | expo_modules | etc.
  install_method            npm | github | manual_bindings
  release_cadence_days      computed from release history
  commit_cadence_days       computed from commit history
  release_deviation_factor  current_gap / release_cadence_days
  rhythm_status             normal | slow | concerning | silent

MARAK THRESHOLD â€” check on every sync:
  isMarakRiskProfile() â†’ if true:
    sustainability_model = 'crisis_risk'
    log ecosystem_event: 'sustainability_crisis'
    trigger alert to subscribers

SYMBOLS â€” use SYMBOLS constant from types:
  Never hardcode emoji strings
  Import from @rn-terrain/core types
  Consistent across CLI + VS Code + MCP

FUNDING LINKS â€” safety rule:
  ONLY show links from:
    getNpmFunding() â†’ npm funding field
    verifyGitHubSponsors() â†’ GitHub API
    verifyOpenCollective() â†’ OC API
  NEVER scrape README
  NEVER show unverified URLs

BADGE URL:
  Auto-generate for every package:
  badge_url = `https://rnterrain.dev/badge/${packageName}`
  Store in DB. Render in web surface Bloom 2.

COMPACT LINE FORMAT:
  Use renderCompactLine() from types
  Format: [verdict][score] [symbols]  [package_name]
  Example: âœ“89 ðŸ—âš¡ðŸ’›  react-native-reanimated
```



---

# APPENDIX I â€” PR/ISSUE INTELLIGENCE IMPLEMENTATION

**File:** `packages/core/src/signals/issue-intelligence.ts`

```typescript
// Computes quality signals from GitHub issues and PRs
// Goes beyond raw counts to surface meaningful patterns

export async function fetchIssueIntelligence(
  owner: string,
  repo: string
): Promise<IssueIntelligence> {
  // Fetch recent issues
  const issuesRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/issues?state=all&per_page=100&sort=updated`,
    { headers: headers() }
  )
  if (!issuesRes.ok) throw new Error('Issues fetch failed')
  const issues = await issuesRes.json()

  const openIssues = issues.filter((i: any) => i.state === 'open')
  const closedIssues = issues.filter((i: any) => i.state === 'closed')

  // Maintainer response rate
  // An issue is "responded" if any comment exists from a repo contributor
  const collaboratorsRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/collaborators`,
    { headers: headers() }
  )
  const collaborators = collaboratorsRes.ok
    ? (await collaboratorsRes.json()).map((c: any) => c.login)
    : []

  // Self-closed issues â€” user closed their own issue
  // Proxy: issue opened by X, closed by X, no maintainer comment
  const selfClosed = closedIssues.filter((i: any) =>
    i.user.login === i.closed_by?.login &&
    !collaborators.includes(i.user.login)
  )

  // "Is this maintained?" issues
  const maintainedQuestions = openIssues.filter((i: any) =>
    /maintained|abandoned|dead|active|alive/i.test(i.title)
  )

  // High-reaction issues with no maintainer response
  const highReactionUnresponded = openIssues
    .filter((i: any) => i.reactions?.total_count > 5)
    .map((i: any) => ({
      issue_number: i.number,
      reactions: i.reactions.total_count,
      days_open: Math.floor(
        (Date.now() - new Date(i.created_at).getTime()) / 86400000
      ),
      maintainer_responded: false, // simplified â€” check comments in full impl
      title: i.title
    }))
    .sort((a: any, b: any) => b.reactions - a.reactions)
    .slice(0, 5)

  // Theme clustering â€” simple keyword extraction
  const themes = extractThemes(openIssues.map((i: any) => i.title))

  // Momentum
  const now = Date.now()
  const thirtyDaysAgo = now - 30 * 86400000
  const opened30d = issues.filter((i: any) =>
    new Date(i.created_at).getTime() > thirtyDaysAgo
  ).length
  const closed30d = closedIssues.filter((i: any) =>
    new Date(i.closed_at).getTime() > thirtyDaysAgo
  ).length
  const momentum = closed30d > opened30d ? 'improving'
    : closed30d < opened30d * 0.5 ? 'degrading'
    : 'stable'

  return {
    open_count: openIssues.length,
    closed_count: closedIssues.length,
    closed_ratio: closedIssues.length / Math.max(issues.length, 1),
    maintainer_response_rate: 0,       // TODO: check comments per issue
    avg_first_response_days: 0,        // TODO: compute from comment dates
    avg_resolution_days: 0,            // TODO: compute from created/closed
    oldest_open_issue_days: openIssues.length > 0
      ? Math.floor(
          (Date.now() - new Date(
            openIssues[openIssues.length - 1].created_at
          ).getTime()) / 86400000
        )
      : 0,
    user_self_closed_count: selfClosed.length,
    is_maintained_questions: maintainedQuestions.length,
    high_reaction_unresponded: highReactionUnresponded,
    recurring_themes: themes,
    issues_opened_30d: opened30d,
    issues_closed_30d: closed30d,
    momentum
  }
}

// Simple theme extraction from issue titles
function extractThemes(titles: string[]): Array<{
  theme: string
  issue_count: number
  is_resolved: boolean
}> {
  const THEME_PATTERNS = [
    { theme: 'new_architecture', pattern: /new arch|fabric|turbomodule|jsi|bridgeless/i },
    { theme: 'expo_build', pattern: /expo|eas build|managed workflow/i },
    { theme: 'babel_config', pattern: /babel|transform|decorator/i },
    { theme: 'typescript', pattern: /typescript|type error|\.d\.ts/i },
    { theme: 'android', pattern: /android|gradle|kotlin/i },
    { theme: 'ios', pattern: /ios|swift|xcode|cocoapod/i },
    { theme: 'performance', pattern: /slow|performance|lag|fps|memory/i },
    { theme: 'crash', pattern: /crash|exception|fatal|segfault/i },
    { theme: 'sync', pattern: /sync|offline|conflict|replicate/i },
  ]

  return THEME_PATTERNS.map(({ theme, pattern }) => ({
    theme,
    issue_count: titles.filter(t => pattern.test(t)).length,
    is_resolved: false  // simplified
  })).filter(t => t.issue_count > 0)
    .sort((a, b) => b.issue_count - a.issue_count)
}
```

**File:** `packages/core/src/signals/changelog.ts`

```typescript
// Parses changelog and release intelligence

export async function fetchChangelogIntelligence(
  owner: string,
  repo: string,
  packageName: string
): Promise<ChangelogIntelligence> {
  // Fetch GitHub releases (most structured)
  const releasesRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/releases?per_page=10`,
    { headers: headers() }
  )
  const releases = releasesRes.ok ? await releasesRes.json() : []

  // Fetch npm dist-tags
  const npmRes = await fetch(
    `https://registry.npmjs.org/${packageName}`
  )
  const npmData = npmRes.ok ? await npmRes.json() : {}
  const distTags = npmData['dist-tags'] ?? {}

  // Parse last 3 releases
  const last3 = releases.slice(0, 3).map((r: any) => {
    const notes = r.body ?? ''
    return {
      version: r.tag_name,
      date: r.published_at,
      summary: extractSummary(notes),
      has_breaking_changes: /breaking|BREAKING/i.test(notes),
      has_deprecations: /deprecat/i.test(notes),
      has_new_arch_mention: /new arch|fabric|turbomodule|jsi|bridgeless/i.test(notes),
      has_babel_mention: /babel/i.test(notes),
      full_notes_url: r.html_url
    }
  })

  // Key events from changelog
  const keyEvents = extractKeyEvents(releases)

  return {
    last_3_releases: last3,
    pre_release_channels: {
      beta: distTags.beta,
      next: distTags.next,
      canary: distTags.canary,
      rc: distTags.rc
    },
    breaking_change_frequency: calculateBreakingFrequency(releases),
    last_breaking_change_version: findLastBreaking(releases)?.tag_name ?? 'unknown',
    last_breaking_change_date: findLastBreaking(releases)?.published_at ?? 'unknown',
    key_events_from_changelog: keyEvents,
    changelog_url: `https://github.com/${owner}/${repo}/blob/master/CHANGELOG.md`,
    releases_url: `https://github.com/${owner}/${repo}/releases`
  }
}

function extractSummary(notes: string): string {
  // Take first meaningful line that isn't a header
  const lines = notes.split('\n')
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('#') && !l.startsWith('-'))
  return lines[0]?.slice(0, 120) ?? 'No summary available'
}

function extractKeyEvents(releases: any[]): any[] {
  const events = []
  for (const r of releases) {
    const notes = r.body ?? ''
    if (/new arch|fabric|turbomodule/i.test(notes)) {
      events.push({
        version: r.tag_name,
        event_type: 'new_arch_mention',
        description: 'New Architecture changes',
        date: r.published_at
      })
    }
    if (/BREAKING/i.test(notes)) {
      events.push({
        version: r.tag_name,
        event_type: 'breaking_change',
        description: 'Breaking changes introduced',
        date: r.published_at
      })
    }
    if (/deprecat/i.test(notes)) {
      events.push({
        version: r.tag_name,
        event_type: 'deprecation',
        description: 'Deprecations announced',
        date: r.published_at
      })
    }
  }
  return events.slice(0, 10)
}

function calculateBreakingFrequency(releases: any[]): number {
  const breakingReleases = releases.filter(r =>
    /BREAKING/i.test(r.body ?? '')
  )
  if (breakingReleases.length < 2) return 0
  // avg versions between breaking changes
  return releases.length / breakingReleases.length
}

function findLastBreaking(releases: any[]): any {
  return releases.find(r => /BREAKING/i.test(r.body ?? ''))
}
```

---

# APPENDIX J â€” NEW SCHEMA FIELDS FOR THIS SESSION

**File:** `supabase/migrations/004_intelligence_fields.sql`

```sql
-- PR/ISSUE INTELLIGENCE
ALTER TABLE packages ADD COLUMN IF NOT EXISTS
  maintainer_response_rate FLOAT;       -- % issues with maintainer reply

ALTER TABLE packages ADD COLUMN IF NOT EXISTS
  avg_first_response_days FLOAT;        -- days to first maintainer comment

ALTER TABLE packages ADD COLUMN IF NOT EXISTS
  oldest_open_issue_days INTEGER;       -- age of oldest open issue

ALTER TABLE packages ADD COLUMN IF NOT EXISTS
  user_self_closed_count INTEGER DEFAULT 0;  -- "giving up" signal

ALTER TABLE packages ADD COLUMN IF NOT EXISTS
  is_maintained_questions INTEGER DEFAULT 0; -- explicit decay questions

ALTER TABLE packages ADD COLUMN IF NOT EXISTS
  high_reaction_unresponded JSONB;      -- top 5 ignored community needs

ALTER TABLE packages ADD COLUMN IF NOT EXISTS
  recurring_themes JSONB;               -- theme clusters from issue titles

ALTER TABLE packages ADD COLUMN IF NOT EXISTS
  issue_momentum TEXT DEFAULT 'unknown';
  -- 'improving' | 'stable' | 'degrading'

-- CHANGELOG INTELLIGENCE
ALTER TABLE packages ADD COLUMN IF NOT EXISTS
  last_3_releases JSONB;                -- parsed recent releases

ALTER TABLE packages ADD COLUMN IF NOT EXISTS
  pre_release_channels JSONB;           -- { beta, next, canary, rc }

ALTER TABLE packages ADD COLUMN IF NOT EXISTS
  breaking_change_frequency FLOAT;      -- avg versions between breaking

ALTER TABLE packages ADD COLUMN IF NOT EXISTS
  changelog_url TEXT;

ALTER TABLE packages ADD COLUMN IF NOT EXISTS
  releases_url TEXT;

ALTER TABLE packages ADD COLUMN IF NOT EXISTS
  key_changelog_events JSONB;           -- significant historical events

-- MAINTAINER PROFILE
ALTER TABLE packages ADD COLUMN IF NOT EXISTS
  primary_maintainer_handle TEXT;       -- GitHub handle

ALTER TABLE packages ADD COLUMN IF NOT EXISTS
  maintainer_still_active BOOLEAN;      -- any recent GitHub activity

ALTER TABLE packages ADD COLUMN IF NOT EXISTS
  maintainer_left_original_org BOOLEAN DEFAULT false;

ALTER TABLE packages ADD COLUMN IF NOT EXISTS
  maintainer_has_consulting BOOLEAN DEFAULT false;

ALTER TABLE packages ADD COLUMN IF NOT EXISTS
  maintainer_codeberg_mirror BOOLEAN DEFAULT false;

-- FINANCIAL TRANSPARENCY
ALTER TABLE packages ADD COLUMN IF NOT EXISTS
  financial_transparency TEXT DEFAULT 'none';
  -- 'open_collective_public' | 'github_sponsors_public' |
  -- 'foundation_audited' | 'self_reported' | 'none'

ALTER TABLE packages ADD COLUMN IF NOT EXISTS
  open_collective_url TEXT;             -- verified OC link

ALTER TABLE packages ADD COLUMN IF NOT EXISTS
  open_collective_monthly_income INTEGER; -- from OC API if public

-- SOURCE OVERLAY FLAGS
-- which external tools show data for this package
ALTER TABLE packages ADD COLUMN IF NOT EXISTS
  shown_in_bundlephobia BOOLEAN DEFAULT false;

ALTER TABLE packages ADD COLUMN IF NOT EXISTS
  shown_in_rn_directory BOOLEAN DEFAULT false;

ALTER TABLE packages ADD COLUMN IF NOT EXISTS
  shown_in_npm_registry BOOLEAN DEFAULT true;

ALTER TABLE packages ADD COLUMN IF NOT EXISTS
  bundlephobia_data JSONB;              -- cached bundlephobia API response
```


