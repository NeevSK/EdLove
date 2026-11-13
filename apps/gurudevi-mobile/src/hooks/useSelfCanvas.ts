import { useScopeSessionStore } from '@repo/core/store/scopeSession';
import { useActiveSubTabsStore } from '@repo/core/store/useActiveSubTabsStore';
import { useAuthStore } from '@repo/core/store/useAuthStore';
import type { Bond } from '@repo/core/logic/schemas/identity.schema';
import { useResponsiveGrid } from '@repo/ui';
import { tokens } from '@repo/ui/tokens';
import { useCallback, useMemo, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { getSelfRegistry } from '@/navigation/registries/selfRegistry';
import type { MobileFeatureItem } from '@/navigation/registries/types';
import { useNavigator } from '@/navigation/navigator';

const EMPTY_AVAILABLE_BONDS: readonly Bond[] = [];
const EMPTY_PINNED_IDS: string[] = [];

export type SelfCategory = 'all' | NonNullable<MobileFeatureItem['category']>;

export const SELF_CATEGORY_LABELS: Record<Exclude<SelfCategory, 'all'>, string> = {
  identity: 'Identity',
  wellbeing: 'Wellbeing',
  growth: 'Growth',
  practice: 'Practice & rhythm',
  professional: 'Professional',
};

export type SelfAtmospherePreset = 'default' | 'dawn' | 'garden' | 'night';

export function resolveSelfFloorColor(preset: SelfAtmospherePreset = 'default'): string {
  if (preset === 'dawn') return '#fff6e8';
  if (preset === 'garden') return '#f3f7ec';
  if (preset === 'night') return '#202326';
  return '#faf7ed';
}

function resolveCategoryOrder<TId extends string>(
  stored: readonly string[] | undefined,
  defaults: readonly TId[],
): TId[] {
  const allowed = new Set(defaults);
  const selected = (stored ?? []).filter((id): id is TId => allowed.has(id as TId));
  return Array.from(new Set([...selected, ...defaults]));
}

/**
 * Headless Canvas hook for the Native Self domain.
 * Governs spatial arrangement, layout synchronization, responsive columns, and pinned practices.
 * Treats the user as one whole person across all their capacities, decoupled from institutional tenancy.
 */
export function useSelfCanvas() {
  const router = useNavigator();
  const { width } = useWindowDimensions();
  const { columns, gutter } = useResponsiveGrid();
  const user = useAuthStore((state) => state.user);
  const availableBonds = useScopeSessionStore(
    (state) => state.snapshot?.availableBonds ?? EMPTY_AVAILABLE_BONDS,
  );
  const displayName = user?.display_name?.split(' ')[0] || 'Seeker';

  const [selectedCategory, setSelectedCategory] = useState<SelfCategory>('all');
  const openTab = useActiveSubTabsStore((state) => state.openTab);
  const localPinnedIds = useActiveSubTabsStore(
    (state) => state.pinnedFeatureIdsByDomain.self ?? EMPTY_PINNED_IDS,
  );
  const toggleLocalPin = useActiveSubTabsStore((state) => state.togglePinFeature);

  // Derive the complete set of capacities this human holds across all active bonds
  const userCapacities = useMemo(() => {
    const roles = new Set<string>();
    if (user?.capacity) roles.add(user.capacity);
    availableBonds?.forEach((bond) => {
      if (bond.capacity) roles.add(bond.capacity);
    });
    return Array.from(roles);
  }, [user, availableBonds]);

  const registry = useMemo(() => getSelfRegistry(userCapacities), [userCapacities]);
  const features = useMemo(
    () => registry.items.filter((item) => !item.defaultSubTab),
    [registry.items],
  );

  const preset: SelfAtmospherePreset = 'default';
  const effectivePinnedIds = localPinnedIds;

  const togglePin = useCallback(
    (featureId: string) => {
      toggleLocalPin('self', featureId);
    },
    [toggleLocalPin],
  );

  const pinnedFeatures = useMemo(
    () =>
      effectivePinnedIds
        .map((id) => features.find((feature) => feature.id === id))
        .filter((feature): feature is MobileFeatureItem => Boolean(feature)),
    [features, effectivePinnedIds],
  );

  const rawCategories = useMemo(() => {
    const available = new Set(features.map((feature) => feature.category).filter(Boolean));
    return [
      { id: 'all' as const, label: 'All spaces' },
      ...Object.entries(SELF_CATEGORY_LABELS)
        .filter(([id]) => available.has(id as Exclude<SelfCategory, 'all'>))
        .map(([id, label]) => ({ id: id as SelfCategory, label })),
    ];
  }, [features]);

  const orderedCategoryIds = useMemo(() => {
    const defaults = rawCategories
      .map((c) => c.id)
      .filter((id): id is Exclude<SelfCategory, 'all'> => id !== 'all');
    return resolveCategoryOrder([], defaults);
  }, [rawCategories]);

  const categories = useMemo(
    () => [
      rawCategories.find((c) => c.id === 'all')!,
      ...orderedCategoryIds.flatMap((id) => {
        const category = rawCategories.find((c) => c.id === id);
        return category ? [category] : [];
      }),
    ],
    [rawCategories, orderedCategoryIds],
  );

  const visibleFeatures = useMemo(
    () =>
      selectedCategory === 'all'
        ? features
        : features.filter((feature) => feature.category === selectedCategory),
    [features, selectedCategory],
  );

  const cardGap = tokens.spacing.sm;
  const catalogColumns = Math.max(1, columns);
  const cardWidth = Math.max(
    0,
    (width - gutter * 2 - cardGap * (catalogColumns - 1)) / catalogColumns,
  );

  const launchFeature = useCallback(
    (feature: MobileFeatureItem) => {
      openTab({
        featureId: feature.id,
        title: feature.title,
        route: feature.route,
        params: { feature: feature.id },
        domain: 'self',
      });
      router.push({ pathname: '/self', params: { feature: feature.id } });
    },
    [openTab, router],
  );

  return {
    displayName,
    registry,
    features,
    pinnedFeatures,
    categories,
    selectedCategory,
    setSelectedCategory,
    visibleFeatures,
    effectivePinnedIds,
    togglePin,
    launchFeature,
    cardWidth,
    cardGap,
    gutter,
    preset,
    floorColor: resolveSelfFloorColor(preset),
    isTablet: width >= 768,
  };
}
