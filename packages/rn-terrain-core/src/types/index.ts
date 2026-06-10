// ============================================================
// RN TERRAIN — CANONICAL TYPES
// Everything in this codebase is typed against these.
// ============================================================

export type RadarStatus = 'ADOPT' | 'TRIAL' | 'ASSESS' | 'HOLD';
export type TopologyLayer = 'L2' | 'L3' | 'L4';
export type V1Readiness = 'READY' | 'ADAPTING' | 'AT_RISK' | 'INCOMPATIBLE' | 'UNKNOWN';
export type UpdateSafetyBand = 'safe' | 'caution' | 'breaking' | 'unknown';
export type NewArchStatus =
  | 'native_jsi'
  | 'compatibility_layer'
  | 'unsupported'
  | 'not_applicable'
  | 'unknown';
export type JSIBindingType =
  | 'fabric'
  | 'turbomodule'
  | 'nitro'
  | 'legacy_bridge'
  | 'pure_js'
  | 'unknown';
export type Trajectory = 'growing' | 'plateau' | 'declining' | 'unknown';
export type Severity = 'info' | 'warning' | 'critical';
export type MigrationEffort = 'trivial' | 'moderate' | 'significant' | 'major_rewrite';

// ============================================================
// SCORE BREAKDOWN — Always shown alongside the score
// ============================================================
export interface ScoreBreakdown {
  total: number; // 0–100
  maintenance: {
    score: number; // 0–30
    max: 30;
    bus_factor: { score: number; max: 10; detail: string };
    commit_rhythm: { score: number; max: 10; detail: string };
    issue_response: { score: number; max: 10; detail: string };
  };
  architecture: {
    score: number; // 0–25
    max: 25;
    new_arch: { score: number; max: 10; detail: string };
    hermes_v1: { score: number; max: 5; detail: string };
    wasm_cost: { score: number; max: 5; detail: string };
    thread_safety: { score: number; max: 5; detail: string };
  };
  temporal: {
    score: number; // 0–20
    max: 20;
    lindy_age: { score: number; max: 8; detail: string };
    version_trajectory: { score: number; max: 6; detail: string };
    decay_signal: { score: number; max: 6; detail: string };
  };
  ecosystem: {
    score: number; // 0–15
    max: 15;
    adoption_rank: { score: number; max: 5; detail: string };
    vendor_backing: { score: number; max: 5; detail: string };
    alternatives: { score: number; max: 5; detail: string };
  };
  cost: {
    score: number; // 0–10
    max: 10;
    bundle_impact: { score: number; max: 5; detail: string };
    dependency_fanout: { score: number; max: 5; detail: string };
  };
}

// ============================================================
// WARNING — A signal that needs developer attention
// ============================================================
export interface Warning {
  severity: Severity;
  code: string; // e.g. "JS_THREAD_BLOCKING"
  message: string; // human-readable
  detail?: string; // additional context
  source_url?: string; // link to evidence
}

// ============================================================
// DEPRECATION RADAR — 5 levels
// ============================================================
export interface DeprecationRadar {
  npm_explicit: boolean;
  npm_message?: string;
  api_level: boolean;
  api_details?: string;
  ecosystem_level: boolean;
  ecosystem_reason?: string;
  platform_level: boolean;
  platform_details?: string;
  silent: boolean; // detected by vitality decay
  silent_signals?: string[];
}

// ============================================================
// V1 READINESS REPORT
// ============================================================
export interface V1ReadinessReport {
  status: V1Readiness;
  score: number; // 0–100
  legacy_arch_code: boolean;
  stable_js_api_compliant: boolean | null;
  breaking_change_risk: 'none' | 'low' | 'medium' | 'high' | 'unknown';
  migration_notes?: string;
  vendor_maintained: boolean;
}

// ============================================================
// VITALITY CARD — The canonical output
// This is what every adapter (CLI, MCP, web) renders.
// ============================================================
export interface VitalityCard {
  // Identity
  package_name: string;
  display_name?: string;
  category: string;
  use_case_tags: string[];
  vendor: string;
  topology_layer: TopologyLayer;

  // The verdict
  radar_status: RadarStatus;
  vitality_score: number;
  score_breakdown: ScoreBreakdown;

  // Version intelligence
  version: {
    current: string;
    latest: string;
    lag: { major: number; minor: number; patch: number };
    safety_band: UpdateSafetyBand;
    days_since_release: number;
    changelog_url?: string;
  };

  // Platform compatibility
  compatibility: {
    ios: boolean;
    android: boolean;
    web: boolean;
    expo_go: boolean;
    windows: boolean;
    macos: boolean;
    new_architecture: NewArchStatus;
    hermes_v1: boolean | null;
    expo_config_plugin: boolean;
  };

  // Architecture signals
  architecture: {
    has_native_code: boolean;
    jsi_binding: JSIBindingType;
    nitro_powered: boolean;
    wasm_compiled: boolean;
    wasm_size_bytes: number;
    bundle_increment_bytes: number;
    dependency_fan_out: number;
    thread_safety: string;
    build_time_impact: string;
  };

  // V1 readiness
  v1_readiness: V1ReadinessReport;

  // Deprecation
  deprecation: DeprecationRadar;

  // Warnings (ordered by severity)
  warnings: Warning[];

  // Relationships
  alternatives: Array<{
    package_name: string;
    vitality_score: number;
    comparison_summary: string;
    migration_effort: MigrationEffort;
  }>;
  known_conflicts: Array<{
    package_name: string;
    severity: Severity;
    reason: string;
    workaround?: string;
  }>;
  common_companions: Array<{
    package_name: string;
    context?: string;
  }>;

  // Links — every signal anchored to its source
  links: {
    npm: string;
    github?: string;
    rn_directory?: string;
    changelog?: string;
    open_issues?: string;
    bundle_analysis?: string;
  };

  // Recent ecosystem events for this package
  recent_events: Array<{
    event_type: string;
    event_date: string;
    summary: string;
    severity: Severity;
    source_url?: string;
  }>;

  // Meta
  last_updated: string; // ISO 8601
  data_freshness: 'fresh' | 'stale' | 'cached';
}

// ============================================================
// PROJECT AUDIT — Result of scanning package.json
// ============================================================
export interface ProjectAudit {
  scanned_at: string;
  package_json_path: string;
  total_packages: number;
  summary: {
    adopt: number;
    trial: number;
    assess: number;
    hold: number;
    unknown: number;
  };
  v1_ready_count: number;
  v1_at_risk_count: number;
  packages: VitalityCard[];
  critical_warnings: Warning[];
  ecosystem_news: EcosystemEvent[];
  migration_suggestions: MigrationSuggestion[];
}

export interface EcosystemEvent {
  event_type: string;
  entity_name: string;
  event_date: string;
  summary: string;
  severity: Severity;
  source_url?: string;
}

export interface MigrationSuggestion {
  from_package: string;
  to_package: string;
  reason: string;
  effort: MigrationEffort;
  migration_notes?: string;
}

// ============================================================
// DEVELOPER CONTEXT — The C× profile
// ============================================================
export interface DeveloperContext {
  workflow: 'expo_managed' | 'expo_bare' | 'pure_rn';
  architecture_requirement: 'new_arch_only' | 'both' | 'legacy_ok';
  bundle_sensitivity: 'minimal' | 'moderate' | 'relaxed';
  team_size: 'solo' | 'small' | 'enterprise';
  ios_min_version?: string;
  android_min_sdk?: number;
  offline_first?: boolean;
  expo_go_required?: boolean;
}

// ============================================================
// THREAD MODEL — how computation runs
// ============================================================
export type ThreadModel =
  | 'js_thread_blocking' // blocks JS thread
  | 'js_thread_nonblocking' // async on JS thread
  | 'jsi_direct' // JSI C++ fast path
  | 'worklet_offloaded' // separate worklet thread
  | 'native_thread' // fully native thread
  | 'unknown';

export type WASMThreadModel =
  | 'js_thread_blocking' // WASM on JS thread — flag this
  | 'worklet_offloaded' // WASM via RN Worklets 8.0+
  | 'unknown';

// ============================================================
// COMPATIBILITY ENTRY
// ============================================================
export type CompatibilityStatus =
  | 'confirmed' // official/maintainer documented
  | 'community' // 3+ community reports
  | 'partial' // works but with caveats
  | 'incompatible' // documented breakage
  | 'untested'; // no data either way — honest default

export interface CompatibilityEntry {
  package_name: string;
  status: CompatibilityStatus;
  confidence: ConfidenceLevel;
  notes?: string;
  source_url?: string;
  last_verified?: string;
}

export type ConfidenceLevel =
  | 'verified' // manually confirmed by human or 3+ source agreement
  | 'high' // direct from authoritative API, recent, cross-validated
  | 'medium' // single authoritative source, or computed from reliable data
  | 'low' // estimated, inferred, single source unverified
  | 'unknown'; // not enough data to assess

// ============================================================
// CAPABILITY CARD
// ============================================================
export interface CapabilityCard {
  package_name: string;
  primary_purpose: string; // one line, no jargon
  key_capabilities: string[]; // specific and technical
  known_limitations: string[]; // what it cannot do
  performance_profile: {
    summary: string;
    benchmarks: Array<{
      metric: string;
      value: string;
      vs_alternative?: string;
      source_url?: string;
    }>;
    thread_model: ThreadModel;
    wasm_thread_model?: WASMThreadModel;
    wasm_worklets_required?: boolean;
    wasm_worklets_min_version?: string;
  };
  context_requirements: {
    new_arch_required: boolean;
    expo_go_compatible: boolean;
    expo_managed_compatible: boolean;
    bare_rn_compatible: boolean;
    min_rn_version?: string;
    min_ios?: string;
    min_android_sdk?: number;
    requires_dev_build: boolean;
    requires_native_build: boolean;
    additional?: string[];
  };
  compatibility_matrix: {
    animation: CompatibilityEntry[];
    navigation: CompatibilityEntry[];
    state: CompatibilityEntry[];
    storage: CompatibilityEntry[];
    ai_ml: CompatibilityEntry[];
    camera: CompatibilityEntry[];
    testing: CompatibilityEntry[];
    build: CompatibilityEntry[];
  };
  last_verified: string;
  confidence: ConfidenceLevel;
  sources: string[];
}

// ============================================================
// STACK POSITION — where package lives in dependency graph
// ============================================================
export interface StackPosition {
  package_name: string;
  depends_on: Array<{
    package_name: string;
    is_peer: boolean;
    is_optional: boolean;
    vitality_score?: number;
    radar_status?: RadarStatus;
  }>;
  depended_on_by_count: number; // how many packages need this
  cascade_risk: 'low' | 'medium' | 'high' | 'critical';
  cascade_notes?: string; // what breaks if this breaks
  commonly_paired: Array<{
    package_name: string;
    context: string;
    co_occurrence_score: number;
  }>;
}

// ============================================================
// EXTENDED VITALITY CARD — adds capability + stack
// ============================================================
export interface VitalityCardFull extends VitalityCard {
  capability?: CapabilityCard; // Layer 3 — loaded on demand
  stack_position?: StackPosition; // Layer 3 — loaded on demand
}

// ============================================================
// ECOSYSTEM TOPOLOGY
// ============================================================
export interface EcosystemTopology {
  total_packages_tracked: number;
  by_layer: { L2: number; L3: number; L4: number };
  by_radar: { ADOPT: number; TRIAL: number; ASSESS: number; HOLD: number };
  new_arch_adoption_pct: number;
  expo_compatible_pct: number;
  hermes_v1_ready_pct: number;
  v1_ready_pct: number;
  actively_maintained_pct: number;
  by_category: Array<{ category: string; count: number }>;
  ecosystem_health_trend: 'improving' | 'stable' | 'declining';
  last_updated: string;
}
