-- ============================================================
-- RN TERRAIN — CORE SCHEMA
-- ============================================================

-- EXTENSION
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PACKAGES TABLE — The main intelligence store
-- ============================================================
CREATE TABLE IF NOT EXISTS packages (
  id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Tier 1: Identity
  package_name                TEXT UNIQUE NOT NULL,
  display_name                TEXT,
  description                 TEXT,
  vendor                      TEXT DEFAULT 'independent',
  category                    TEXT NOT NULL,
  use_case_tags               TEXT[] DEFAULT '{}',
  topology_layer              TEXT DEFAULT 'L3',
  radar_status                TEXT DEFAULT 'ASSESS',
  vitality_score              INTEGER DEFAULT 0,
  v1_readiness                TEXT DEFAULT 'UNKNOWN',

  -- Tier 2: RN Directory signals
  android_support             BOOLEAN DEFAULT false,
  ios_support                 BOOLEAN DEFAULT false,
  web_support                 BOOLEAN DEFAULT false,
  expo_go_compatible          BOOLEAN DEFAULT false,
  new_architecture_status     TEXT DEFAULT 'unknown',
  typescript_support          BOOLEAN DEFAULT false,
  rn_dir_maintained           BOOLEAN DEFAULT true,
  expo_config_plugin          BOOLEAN DEFAULT false,
  windows_support             BOOLEAN DEFAULT false,
  macos_support               BOOLEAN DEFAULT false,
  visionos_support            BOOLEAN DEFAULT false,

  -- Tier 3: Version intelligence
  current_stable_version      TEXT,
  latest_version              TEXT,
  version_lag_major           INTEGER DEFAULT 0,
  version_lag_minor           INTEGER DEFAULT 0,
  version_lag_patch           INTEGER DEFAULT 0,
  update_safety_band          TEXT DEFAULT 'unknown',
  maturity_period_days        INTEGER,
  last_major_bump_date        DATE,
  breaking_change_frequency_months FLOAT,
  changelog_url               TEXT,
  release_notes_quality       TEXT DEFAULT 'unknown',

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
  thread_safety               TEXT DEFAULT 'unknown',

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
-- ECOSYSTEM EVENTS — The append-only history log
-- ============================================================
CREATE TABLE IF NOT EXISTS ecosystem_events (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type    TEXT NOT NULL,
  entity_name   TEXT NOT NULL,
  entity_type   TEXT NOT NULL DEFAULT 'package',
  event_date    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  summary       TEXT NOT NULL,
  source_url    TEXT,
  severity      TEXT DEFAULT 'info',
  affects       TEXT[] DEFAULT '{}',
  raw_data      JSONB,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- KNOWN CONFLICTS — Package incompatibility pairs
-- ============================================================
CREATE TABLE IF NOT EXISTS package_conflicts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  package_a       TEXT NOT NULL REFERENCES packages(package_name) ON DELETE CASCADE,
  package_b       TEXT NOT NULL REFERENCES packages(package_name) ON DELETE CASCADE,
  severity        TEXT DEFAULT 'warning',
  reason          TEXT NOT NULL,
  rn_version_range TEXT,
  workaround      TEXT,
  source_url      TEXT,
  resolved        BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- COMMON COMPANIONS — Packages often used together
-- ============================================================
CREATE TABLE IF NOT EXISTS package_companions (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  package_name          TEXT NOT NULL REFERENCES packages(package_name) ON DELETE CASCADE,
  companion_name        TEXT NOT NULL REFERENCES packages(package_name) ON DELETE CASCADE,
  co_occurrence_score   FLOAT DEFAULT 0,
  context               TEXT,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ALTERNATIVES — Package substitution graph
-- ============================================================
CREATE TABLE IF NOT EXISTS package_alternatives (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  package_name        TEXT NOT NULL REFERENCES packages(package_name) ON DELETE CASCADE,
  alternative_name    TEXT NOT NULL REFERENCES packages(package_name) ON DELETE CASCADE,
  comparison_summary  TEXT,
  migration_effort    TEXT,
  migration_notes     TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- KEY PERSONS — Signal-weighted people
-- ============================================================
CREATE TABLE IF NOT EXISTS key_persons (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  github_handle   TEXT,
  twitter_handle  TEXT,
  affiliation     TEXT,
  signal_weight   INTEGER DEFAULT 5,
  focus_areas     TEXT[] DEFAULT '{}',
  active          BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_packages_name ON packages(package_name);
CREATE INDEX IF NOT EXISTS idx_packages_category ON packages(category);
CREATE INDEX IF NOT EXISTS idx_packages_vendor ON packages(vendor);
CREATE INDEX IF NOT EXISTS idx_packages_radar_status ON packages(radar_status);
CREATE INDEX IF NOT EXISTS idx_packages_topology_layer ON packages(topology_layer);
CREATE INDEX IF NOT EXISTS idx_packages_vitality_score ON packages(vitality_score DESC);
CREATE INDEX IF NOT EXISTS idx_packages_v1_readiness ON packages(v1_readiness);
CREATE INDEX IF NOT EXISTS idx_packages_new_arch ON packages(new_architecture_status);
CREATE INDEX IF NOT EXISTS idx_packages_expo_go ON packages(expo_go_compatible);
CREATE INDEX IF NOT EXISTS idx_events_entity ON ecosystem_events(entity_name, event_date DESC);
CREATE INDEX IF NOT EXISTS idx_events_type ON ecosystem_events(event_type, event_date DESC);
CREATE INDEX IF NOT EXISTS idx_events_severity ON ecosystem_events(severity, event_date DESC);

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

DROP TRIGGER IF EXISTS packages_updated_at ON packages;
CREATE TRIGGER packages_updated_at
  BEFORE UPDATE ON packages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
