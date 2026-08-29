import type { AccessibleFeature } from '@repo/self/features/accessPolicy';
import type { SelfFeatureZone } from '@repo/self/features/userPreferences';

export type FeatureZone = 'today' | 'private' | 'shared';
export type ResolverCategory = AccessibleFeature['category'];

export interface ResolvedFeatureSet {
  all: AccessibleFeature[];
  selected: AccessibleFeature[];
  discoverable: AccessibleFeature[];
  byZone: Record<FeatureZone, AccessibleFeature[]>;
  byCategory: Record<ResolverCategory, AccessibleFeature[]>;
}

export interface ResolverPreferences {
  selectedIds: string[];
  customOrder: string[];
  hiddenIds: string[];
  zoneOverrides?: Partial<Record<string, FeatureZone>>;
  roleWeights?: Record<string, number>;
}

export function resolveFeatureZone(
  feature: AccessibleFeature,
  zoneOverrides: Partial<Record<string, SelfFeatureZone>> = {},
): FeatureZone {
  return zoneOverrides[feature.id] ?? (feature.defaultZone as FeatureZone);
}

export interface ScoringStrategy {
  score(feature: AccessibleFeature, roleWeights: Record<string, number>, phase: 'morning' | 'afternoon' | 'night'): number;
}
export class RoleAffinityStrategy implements ScoringStrategy {
  score(feature: AccessibleFeature, roleWeights: Record<string, number>): number {
    return roleWeights[feature.id] ?? feature.roleAffinity ?? 0;
  }
}
export class TemporalPhaseStrategy implements ScoringStrategy {
  score(feature: AccessibleFeature, _roleWeights: Record<string, number>, phase: 'morning' | 'afternoon' | 'night'): number {
    return feature.timing?.preferredPhase === phase ? 50 : 0;
  }
}
export class CompositeScoringStrategy implements ScoringStrategy {
  constructor(private readonly strategies: ScoringStrategy[]) {}
  score(feature: AccessibleFeature, roleWeights: Record<string, number>, phase: 'morning' | 'afternoon' | 'night'): number {
    return this.strategies.reduce((s, strat) => s + strat.score(feature, roleWeights, phase), 0) - feature.defaultOrder * 0.01;
  }
}
const defaultScoring = new CompositeScoringStrategy([new RoleAffinityStrategy(), new TemporalPhaseStrategy()]);

function sortDiscoverable(
  features: AccessibleFeature[],
  roleWeights: Record<string, number>,
  scoring: ScoringStrategy = defaultScoring,
): AccessibleFeature[] {
  const nowHour = new Date().getHours();
  const phase: 'morning' | 'afternoon' | 'night' =
    nowHour >= 5 && nowHour < 12 ? 'morning' : nowHour >= 18 || nowHour < 5 ? 'night' : 'afternoon';
  return [...features].sort((a, b) => scoring.score(b, roleWeights, phase) - scoring.score(a, roleWeights, phase));
}

function groupBy<T, K extends string>(items: T[], keyFn: (item: T) => K): Record<K, T[]> {
  const out = {} as Record<K, T[]>;
  for (const item of items) {
    const k = keyFn(item);
    if (!out[k]) out[k] = [];
    out[k].push(item);
  }
  return out;
}

/**
 * Pure resolver — combines accessible features + user preferences.
 * No hooks, fully testable.
 */
export function resolveFeatureSet(
  accessible: AccessibleFeature[],
  preferences: ResolverPreferences,
): ResolvedFeatureSet {
  const { selectedIds, customOrder, hiddenIds, roleWeights = {}, zoneOverrides = {} } = preferences;

  const visible = accessible.filter((f) => !hiddenIds.includes(f.id));

  const selected: AccessibleFeature[] =
    customOrder.length > 0
      ? (customOrder.map((id) => accessible.find((f) => f.id === id)).filter(Boolean) as AccessibleFeature[])
      : visible.filter((f) => selectedIds.includes(f.id));

  const discoverableRaw = visible.filter((f) => !selected.some((s) => s.id === f.id));
  const discoverable = sortDiscoverable(discoverableRaw, roleWeights);

  const byZone = groupBy(visible, (feature) => resolveFeatureZone(feature, zoneOverrides)) as Record<
    FeatureZone,
    AccessibleFeature[]
  >;
  const byCategory = groupBy(visible, (f) => f.category as ResolverCategory) as Record<ResolverCategory, AccessibleFeature[]>;

  // Ensure all zones present
  (['today', 'private', 'shared'] as FeatureZone[]).forEach((z) => {
    if (!byZone[z]) byZone[z] = [];
  });

  return { all: accessible, selected, discoverable, byZone, byCategory };
}
