import fs from 'node:fs';
import path from 'node:path';
import semver from 'semver';
import { supabase } from '@/db';
import { calculateVitalityScore } from '@/scoring';
import type {
  DeveloperContext,
  EcosystemTopology,
  ProjectAudit,
  VitalityCardFull,
  Warning,
} from '@/types';

// Helper to map DB row to canonical VitalityCard structure
function mapRowToCard(row: any): VitalityCardFull {
  const partialCard: Partial<VitalityCardFull> = {
    package_name: row.package_name,
    display_name: row.display_name || row.package_name,
    category: row.category,
    vendor: row.vendor,
    topology_layer: row.topology_layer || 'L3',
    use_case_tags: row.use_case_tags || [],

    // Platform compatibility
    compatibility: {
      ios: row.ios_support ?? false,
      android: row.android_support ?? false,
      web: row.web_support ?? false,
      expo_go: row.expo_go_compatible ?? false,
      windows: row.windows_support ?? false,
      macos: row.macos_support ?? false,
      new_architecture: row.new_architecture_status || 'unknown',
      hermes_v1: row.hermes_v1_compatible ?? null,
      expo_config_plugin: row.expo_config_plugin ?? false,
    },

    // Architecture & metrics
    architecture: {
      has_native_code: row.has_native_code ?? false,
      jsi_binding: row.jsi_binding_type || 'unknown',
      nitro_powered: row.nitro_modules_powered ?? false,
      wasm_compiled: row.wasm_compiled ?? false,
      wasm_size_bytes: row.wasm_size_bytes ?? 0,
      bundle_increment_bytes: row.bundle_increment_bytes ?? 0,
      dependency_fan_out: row.dependency_fan_out ?? 0,
      thread_safety: row.thread_safety || 'unknown',
      build_time_impact: row.build_time_impact || 'unknown',
    },

    // Version details
    version: {
      current: row.current_stable_version || '0.0.0',
      latest: row.latest_version || '0.0.0',
      lag: {
        major: row.version_lag_major ?? 0,
        minor: row.version_lag_minor ?? 0,
        patch: row.version_lag_patch ?? 0,
      },
      safety_band: row.update_safety_band || 'unknown',
      days_since_release: row.days_since_last_release || 30,
      changelog_url: row.changelog_url || undefined,
    },

    // V1 readiness
    v1_readiness: (() => {
      const dbStatus = row.v1_readiness || 'UNKNOWN';
      let status = dbStatus;
      let score = row.v1_readiness_score ?? 0;

      if (dbStatus === 'UNKNOWN') {
        if (row.new_architecture_status === 'native_jsi') {
          status = 'READY';
          score = 90;
        } else if (row.new_architecture_status === 'unsupported') {
          status = 'INCOMPATIBLE';
          score = 10;
        } else if ((row.downloads_weekly_npm ?? 0) > 50000) {
          status = 'READY';
          score = 80;
        } else {
          status = 'ADAPTING';
          score = 50;
        }
      }

      return {
        status: status as any,
        score,
        legacy_arch_code: row.legacy_arch_code_present ?? false,
        stable_js_api_compliant: row.stable_js_api_compliant ?? null,
        breaking_change_risk: row.breaking_change_risk_v1 || 'unknown',
        migration_notes: row.v1_migration_notes || undefined,
        vendor_maintained: row.vendor && row.vendor !== 'independent',
      };
    })(),

    // Deprecation
    deprecation: {
      npm_explicit: row.npm_deprecated ?? false,
      npm_message: row.npm_deprecated_message || undefined,
      api_level: row.has_api_deprecations ?? false,
      ecosystem_level: row.ecosystem_deprecated ?? false,
      platform_level: false,
      silent: (row.days_since_last_release ?? 0) > 180,
    },

    warnings: [],
    alternatives: [],
    known_conflicts: [],
    common_companions: [],
    links: {
      npm: `https://www.npmjs.com/package/${row.package_name}`,
      github: row.github_url || undefined,
      rn_directory: row.last_synced_rn_dir
        ? `https://reactnative.directory/detail/${row.package_name}`
        : undefined,
      changelog: row.changelog_url || undefined,
    },
    recent_events: [],
    last_updated: row.updated_at || new Date().toISOString(),
    data_freshness: 'fresh',
  };

  // Generate score breakdown
  const scoreBreakdown = calculateVitalityScore(partialCard);
  partialCard.vitality_score = scoreBreakdown.total;
  partialCard.score_breakdown = scoreBreakdown;

  // Determine standard warnings based on signals
  const warnings: Warning[] = [];
  if (partialCard.deprecation?.npm_explicit) {
    warnings.push({
      severity: 'critical',
      code: 'NPM_DEPRECATED',
      message: `NPM package is officially deprecated: ${row.npm_deprecated_message || 'Deprecated'}`,
    });
  }
  if (partialCard.deprecation?.silent) {
    warnings.push({
      severity: 'warning',
      code: 'SILENT_DECAY',
      message: 'No releases in over 180 days — potential silent decay',
    });
  }
  if (partialCard.architecture?.thread_safety === 'js_thread_blocks') {
    warnings.push({
      severity: 'warning',
      code: 'JS_THREAD_BLOCKING',
      message: 'Synchronous execution blocks the primary JavaScript thread',
    });
  }
  if (partialCard.compatibility?.new_architecture === 'unsupported') {
    warnings.push({
      severity: 'critical',
      code: 'NEW_ARCH_UNSUPPORTED',
      message: 'Does not support the React Native New Architecture (will fail post-0.84)',
    });
  }
  partialCard.warnings = warnings;

  // Set radar status based on score threshold if not set
  if (row.radar_status === 'ASSESS' || !row.radar_status) {
    if (partialCard.vitality_score >= 80) partialCard.radar_status = 'ADOPT';
    else if (partialCard.vitality_score >= 60) partialCard.radar_status = 'TRIAL';
    else if (partialCard.vitality_score >= 40) partialCard.radar_status = 'ASSESS';
    else partialCard.radar_status = 'HOLD';
  } else {
    partialCard.radar_status = row.radar_status;
  }

  // Capability Card (Layer 3)
  if (row.layer_completeness >= 3) {
    partialCard.capability = {
      package_name: row.package_name,
      primary_purpose: row.primary_purpose || 'N/A',
      key_capabilities: row.key_capabilities || [],
      known_limitations: row.known_limitations || [],
      performance_profile: {
        summary: 'Direct JSI binding performance profile',
        benchmarks: [],
        thread_model: (row.thread_model || 'unknown') as any,
        wasm_thread_model: (row.wasm_thread_model || 'unknown') as any,
        wasm_worklets_required: row.wasm_worklets_required ?? false,
        wasm_worklets_min_version: row.wasm_worklets_min_version || undefined,
      },
      context_requirements: {
        new_arch_required: row.new_architecture_status === 'native_jsi',
        expo_go_compatible: row.expo_go_compatible ?? false,
        expo_managed_compatible: true,
        bare_rn_compatible: true,
        requires_dev_build: !(row.expo_go_compatible ?? false),
        requires_native_build: row.has_native_code ?? false,
      },
      compatibility_matrix: row.compatibility_matrix || {
        animation: [],
        navigation: [],
        state: [],
        storage: [],
        ai_ml: [],
        camera: [],
        testing: [],
        build: [],
      },
      last_verified: row.updated_at,
      confidence: 'medium',
      sources: [row.github_url || 'NPM registry'],
    };
  }

  return partialCard as VitalityCardFull;
}

// Fetch a single package's card
export async function getVitalityCard(
  packageName: string,
  _context?: DeveloperContext,
): Promise<VitalityCardFull | null> {
  const { data, error } = await supabase
    .from('packages')
    .select('*')
    .eq('package_name', packageName)
    .single();

  if (error || !data) return null;
  return mapRowToCard(data);
}

// Fetch recommended alternatives
export async function getAlternatives(
  packageName: string,
  maxResults: number = 5,
): Promise<VitalityCardFull[]> {
  const sourceCard = await getVitalityCard(packageName);
  if (!sourceCard) return [];

  const { data, error } = await supabase
    .from('packages')
    .select('*')
    .eq('category', sourceCard.category)
    .neq('package_name', packageName)
    .order('vitality_score', { ascending: false })
    .limit(maxResults);

  if (error || !data) return [];
  return data.map(mapRowToCard);
}

export function calculateVersionLag(current: string, latest: string) {
  const cleanCurrent = semver.coerce(current);
  const cleanLatest = semver.coerce(latest);

  if (!cleanCurrent || !cleanLatest) {
    return { lag: { major: 0, minor: 0, patch: 0 }, safety_band: 'unknown' as const };
  }

  const major = Math.max(0, cleanLatest.major - cleanCurrent.major);
  const minor = major > 0 ? cleanLatest.minor : Math.max(0, cleanLatest.minor - cleanCurrent.minor);
  const patch =
    major > 0 || minor > 0
      ? cleanLatest.patch
      : Math.max(0, cleanLatest.patch - cleanCurrent.patch);

  let safety_band: 'safe' | 'caution' | 'breaking' | 'unknown' = 'safe';
  if (major > 0) safety_band = 'breaking';
  else if (minor > 0) safety_band = 'caution';

  return { lag: { major, minor, patch }, safety_band };
}

// Scan dependencies in package.json
export async function scanProject(packageJsonPath: string): Promise<ProjectAudit> {
  let pkgJson: any = {};
  try {
    const raw = fs.readFileSync(path.resolve(packageJsonPath), 'utf8');
    pkgJson = JSON.parse(raw);
  } catch (_e) {
    throw new Error(`Failed to read package.json at ${packageJsonPath}`);
  }

  const dependencies = {
    ...pkgJson.dependencies,
    ...pkgJson.devDependencies,
  };

  const packageNames = Object.keys(dependencies);
  const cards: VitalityCardFull[] = [];

  for (const name of packageNames) {
    const card = await getVitalityCard(name);
    if (card) {
      const localRange = dependencies[name] || '*';
      const latest = card.version.latest || card.version.current;
      const { lag, safety_band } = calculateVersionLag(localRange, latest);

      card.version.current = localRange;
      card.version.lag = lag;
      card.version.safety_band = safety_band;

      cards.push(card);
    }
  }

  const summary = {
    adopt: cards.filter((c) => c.radar_status === 'ADOPT').length,
    trial: cards.filter((c) => c.radar_status === 'TRIAL').length,
    assess: cards.filter((c) => c.radar_status === 'ASSESS').length,
    hold: cards.filter((c) => c.radar_status === 'HOLD').length,
    unknown: packageNames.length - cards.length,
  };

  return {
    scanned_at: new Date().toISOString(),
    package_json_path: packageJsonPath,
    total_packages: packageNames.length,
    summary,
    v1_ready_count: cards.filter((c) => c.v1_readiness.status === 'READY').length,
    v1_at_risk_count: cards.filter((c) => c.v1_readiness.status === 'AT_RISK').length,
    packages: cards,
    critical_warnings: cards.flatMap((c) => c.warnings).filter((w) => w.severity === 'critical'),
    ecosystem_news: [],
    migration_suggestions: [],
  };
}

// Get the macro view of ecosystem topology
export async function getEcosystemTopology(category?: string): Promise<EcosystemTopology> {
  let query = supabase.from('packages').select('*');
  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;
  if (error || !data) {
    return {
      total_packages_tracked: 0,
      by_layer: { L2: 0, L3: 0, L4: 0 },
      by_radar: { ADOPT: 0, TRIAL: 0, ASSESS: 0, HOLD: 0 },
      new_arch_adoption_pct: 0,
      expo_compatible_pct: 0,
      hermes_v1_ready_pct: 0,
      v1_ready_pct: 0,
      actively_maintained_pct: 0,
      by_category: [],
      ecosystem_health_trend: 'stable',
      last_updated: new Date().toISOString(),
    };
  }

  const cards = data.map(mapRowToCard);
  const total = cards.length;

  const getPct = (count: number) => (total > 0 ? Math.round((count / total) * 100) : 0);

  return {
    total_packages_tracked: total,
    by_layer: {
      L2: cards.filter((c) => c.topology_layer === 'L2').length,
      L3: cards.filter((c) => c.topology_layer === 'L3').length,
      L4: cards.filter((c) => c.topology_layer === 'L4').length,
    },
    by_radar: {
      ADOPT: cards.filter((c) => c.radar_status === 'ADOPT').length,
      TRIAL: cards.filter((c) => c.radar_status === 'TRIAL').length,
      ASSESS: cards.filter((c) => c.radar_status === 'ASSESS').length,
      HOLD: cards.filter((c) => c.radar_status === 'HOLD').length,
    },
    new_arch_adoption_pct: getPct(
      cards.filter((c) => c.compatibility.new_architecture === 'native_jsi').length,
    ),
    expo_compatible_pct: getPct(
      cards.filter((c) => c.compatibility.expo_go || c.compatibility.expo_config_plugin).length,
    ),
    hermes_v1_ready_pct: getPct(cards.filter((c) => c.compatibility.hermes_v1 === true).length),
    v1_ready_pct: getPct(cards.filter((c) => c.v1_readiness.status === 'READY').length),
    actively_maintained_pct: getPct(cards.filter((c) => !c.deprecation.silent).length),
    by_category: [],
    ecosystem_health_trend: 'stable',
    last_updated: new Date().toISOString(),
  };
}
