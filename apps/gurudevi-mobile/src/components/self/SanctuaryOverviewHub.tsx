import {
  resolveWorkspaceAppearanceColor,
  resolveWorkspaceGroupOrder,
  usePerspectiveSwitch,
} from '@repo/core/logic';
import { useWorkspaceLayoutSync } from '@repo/core/native';
import { useActiveSubTabsStore } from '@repo/core/store/useActiveSubTabsStore';
import { useStore } from '@repo/core/store/useStore';
import type { WorkspaceAppearance } from '@repo/core/types';
import { useResponsiveGrid, useScrollChromeCollapser } from '@repo/ui';
import { ArrowRight, Bookmark, Compass, Pin, Sparkles } from '@repo/ui/icons';
import { Box, Pressable, Text } from '@repo/ui/primitives';
import { tokens } from '@repo/ui/tokens';
import { router } from 'expo-router';
import { type ReactNode, useMemo, useState } from 'react';
import { ScrollView, useWindowDimensions } from 'react-native';
import { getSelfRegistry } from '@/navigation/registries/selfRegistry';
import type { MobileFeatureItem } from '@/navigation/registries/types';

type CatalogCategory = 'all' | NonNullable<MobileFeatureItem['category']>;

const categoryLabels: Record<Exclude<CatalogCategory, 'all'>, string> = {
  identity: 'Identity',
  wellbeing: 'Wellbeing',
  growth: 'Growth',
  practice: 'Practice & rhythm',
  professional: 'Professional',
};

/** The Self Overview is a domain floor, never an active task. */
export function SanctuaryOverviewHub() {
  const { width } = useWindowDimensions();
  const { columns, gutter } = useResponsiveGrid();
  const { activePerspective } = usePerspectiveSwitch();
  const user = useStore((state) => state.user);
  const displayName = user?.display_name?.split(' ')[0] || 'Seeker';
  const appearanceSync = useWorkspaceLayoutSync({
    workspaceId: 'self',
    userId: user?.id,
    surfaces: [],
  });
  const appearance: WorkspaceAppearance = appearanceSync.layout?.appearance ?? {
    preset: 'default',
    motion: 'off',
  };
  const [selectedCategory, setSelectedCategory] = useState<CatalogCategory>('all');
  const openTab = useActiveSubTabsStore((state) => state.openTab);
  const pinnedIds = useActiveSubTabsStore((state) => state.pinnedFeatureIdsByDomain.self || []);
  const togglePin = useActiveSubTabsStore((state) => state.togglePinFeature);
  const { onScroll } = useScrollChromeCollapser();

  const currentCapacity = useMemo(() => {
    if (!activePerspective) return null;
    if (activePerspective.kind === 'institutional') return activePerspective.capacity;
    if (activePerspective.kind === 'guardian') return 'guardian';
    if (activePerspective.kind === 'commercial') return activePerspective.role;
    return null;
  }, [activePerspective]);
  const registry = useMemo(() => getSelfRegistry(currentCapacity), [currentCapacity]);
  const features = useMemo(
    () => registry.items.filter((item) => !item.defaultSubTab),
    [registry.items],
  );
  const pinnedFeatures = useMemo(
    () =>
      pinnedIds
        .map((id) => features.find((feature) => feature.id === id))
        .filter((feature): feature is MobileFeatureItem => Boolean(feature)),
    [features, pinnedIds],
  );
  const categories = useMemo(() => {
    const available = new Set(features.map((feature) => feature.category).filter(Boolean));
    return [
      { id: 'all' as const, label: 'All spaces' },
      ...Object.entries(categoryLabels)
        .filter(([id]) => available.has(id))
        .map(([id, label]) => ({ id: id as CatalogCategory, label })),
    ];
  }, [features]);
  const orderedCategoryIds = useMemo(() => {
    const defaults = categories
      .map((category) => category.id)
      .filter((id): id is Exclude<CatalogCategory, 'all'> => id !== 'all');
    const stored = appearanceSync.layout?.groupOrder ?? [];
    return resolveWorkspaceGroupOrder(stored, defaults);
  }, [appearanceSync.layout?.groupOrder, categories]);
  const orderedCategories = useMemo(
    () => [
      categories.find((category) => category.id === 'all')!,
      ...orderedCategoryIds.flatMap((id) => {
        const category = categories.find((candidate) => candidate.id === id);
        return category ? [category] : [];
      }),
    ],
    [categories, orderedCategoryIds],
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

  const launchFeature = (feature: MobileFeatureItem) => {
    openTab({
      featureId: feature.id,
      title: feature.title,
      route: feature.route,
      params: { feature: feature.id },
      domain: 'self',
    });
    router.push({ pathname: '/self', params: { feature: feature.id } });
  };

  return (
    <ScrollView
      onScroll={onScroll}
      scrollEventThrottle={16}
      style={{ backgroundColor: mobileAppearanceColor(appearance.preset) }}
      contentContainerStyle={{
        paddingHorizontal: gutter,
        paddingTop: tokens.spacing.sm,
        paddingBottom: tokens.spacing.xl * 2,
        gap: tokens.spacing.xl,
      }}
      showsVerticalScrollIndicator={false}
    >
      <Box style={styles.orientationCard}>
        <Box style={{ gap: tokens.spacing.xs }}>
          <Box style={styles.eyebrow}>
            <Sparkles size={16} color={tokens.colors.primary} />
            <Text style={styles.eyebrowText}>{registry.title}</Text>
          </Box>
          <Text style={styles.orientationTitle}>Begin where you are, {displayName}</Text>
          <Text style={styles.orientationCopy}>{registry.subtitle}</Text>
        </Box>
        <Text style={styles.orientationHint}>
          Choose a space below. Open work stays available in your task strip.
        </Text>
      </Box>

      <FloorSection
        count={pinnedFeatures.length}
        icon={<Pin size={16} color={tokens.colors.primary} />}
        title="Pinned spaces"
      >
        {pinnedFeatures.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: tokens.spacing.sm, paddingRight: gutter }}
          >
            {pinnedFeatures.map((feature) => (
              <PinnedFeatureCard
                feature={feature}
                key={feature.id}
                onLaunch={() => launchFeature(feature)}
                onUnpin={() => togglePin('self', feature.id)}
              />
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.emptyCopy}>
            Pin the spaces you return to. They will appear here in your chosen order.
          </Text>
        )}
      </FloorSection>

      <FloorSection count={features.length} title="Sanctuary catalog">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: tokens.spacing.xs, paddingRight: gutter }}
        >
          {orderedCategories.map((category) => {
            const selected = selectedCategory === category.id;
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={`Show ${category.label}`}
                key={category.id}
                onPress={() => setSelectedCategory(category.id)}
                style={[styles.filterChip, selected && styles.filterChipSelected]}
              >
                <Text style={[styles.filterText, selected && styles.filterTextSelected]}>
                  {category.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
        <Box style={{ flexDirection: 'row', flexWrap: 'wrap', gap: cardGap }}>
          {visibleFeatures.map((feature) => (
            <CatalogFeatureCard
              feature={feature}
              isPinned={pinnedIds.includes(feature.id)}
              key={feature.id}
              onLaunch={() => launchFeature(feature)}
              onTogglePin={() => togglePin('self', feature.id)}
              width={cardWidth}
            />
          ))}
        </Box>
      </FloorSection>
    </ScrollView>
  );
}

function mobileAppearanceColor(preset: WorkspaceAppearance['preset']): string {
  return resolveWorkspaceAppearanceColor(preset);
}

function FloorSection({
  children,
  count,
  icon,
  title,
}: {
  children: ReactNode;
  count: number;
  icon?: ReactNode;
  title: string;
}) {
  return (
    <Box style={{ gap: tokens.spacing.md }}>
      <Box style={styles.sectionHeader}>
        <Box style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing.xs }}>
          {icon}
          <Text style={styles.sectionTitle}>{title}</Text>
        </Box>
        <Text style={styles.count}>{count}</Text>
      </Box>
      {children}
    </Box>
  );
}

function PinnedFeatureCard({
  feature,
  onLaunch,
  onUnpin,
}: {
  feature: MobileFeatureItem;
  onLaunch: () => void;
  onUnpin: () => void;
}) {
  const Icon = feature.icon || Compass;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${feature.title}`}
      onPress={onLaunch}
      style={styles.pinnedCard}
    >
      <Box style={styles.cardTopline}>
        <Icon size={20} color={tokens.colors.primary} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Unpin ${feature.title}`}
          hitSlop={8}
          onPress={(event) => {
            event.stopPropagation();
            onUnpin();
          }}
          style={styles.pinButton}
        >
          <Pin size={14} color={tokens.colors.primary} />
        </Pressable>
      </Box>
      <Box style={{ gap: 2 }}>
        <Text numberOfLines={1} style={styles.cardTitle}>
          {feature.title}
        </Text>
        <Text numberOfLines={1} style={styles.cardMeta}>
          {feature.badge || feature.category || 'Space'}
        </Text>
      </Box>
      <CardAction />
    </Pressable>
  );
}

function CatalogFeatureCard({
  feature,
  isPinned,
  onLaunch,
  onTogglePin,
  width,
}: {
  feature: MobileFeatureItem;
  isPinned: boolean;
  onLaunch: () => void;
  onTogglePin: () => void;
  width: number;
}) {
  const Icon = feature.icon || Compass;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${feature.title}`}
      onPress={onLaunch}
      style={[styles.catalogCard, { width }]}
    >
      <Box style={styles.cardTopline}>
        <Icon size={18} color={tokens.colors.primary} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isPinned ? `Unpin ${feature.title}` : `Pin ${feature.title}`}
          hitSlop={8}
          onPress={(event) => {
            event.stopPropagation();
            onTogglePin();
          }}
          style={[styles.pinButton, isPinned && styles.pinButtonActive]}
        >
          {isPinned ? (
            <Pin size={14} color={tokens.colors.primary} />
          ) : (
            <Bookmark size={14} color={tokens.semantic.text.secondary} />
          )}
        </Pressable>
      </Box>
      <Box style={{ flex: 1, gap: tokens.spacing.xs }}>
        <Text numberOfLines={1} style={styles.cardTitle}>
          {feature.title}
        </Text>
        <Text numberOfLines={2} style={styles.cardDescription}>
          {feature.description}
        </Text>
      </Box>
      <CardAction />
    </Pressable>
  );
}

function CardAction() {
  return (
    <Box style={styles.cardAction}>
      <Text style={styles.cardActionText}>Open</Text>
      <ArrowRight size={12} color={tokens.colors.primary} />
    </Box>
  );
}

const styles = {
  orientationCard: {
    borderRadius: tokens.radii.lg,
    backgroundColor: tokens.semantic.surface.elevated,
    borderColor: tokens.semantic.border.subtle,
    borderWidth: 1,
    gap: tokens.spacing.lg,
    padding: tokens.spacing.lg,
  },
  eyebrow: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: tokens.spacing.xs },
  eyebrowText: {
    color: tokens.colors.primary,
    fontSize: tokens.typography.sizes.xs,
    fontWeight: '700' as const,
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
  },
  orientationTitle: {
    color: tokens.semantic.text.primary,
    fontSize: tokens.typography.sizes.xl,
    fontWeight: '800' as const,
  },
  orientationCopy: {
    color: tokens.semantic.text.secondary,
    fontSize: tokens.typography.sizes.sm,
    lineHeight: 20,
  },
  orientationHint: {
    color: tokens.semantic.text.secondary,
    fontSize: tokens.typography.sizes.xs,
    lineHeight: 18,
  },
  sectionHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: tokens.spacing.xs,
  },
  sectionTitle: {
    color: tokens.semantic.text.primary,
    fontSize: tokens.typography.sizes.md,
    fontWeight: '700' as const,
  },
  count: {
    color: tokens.semantic.text.secondary,
    fontSize: tokens.typography.sizes.xs,
    fontWeight: '600' as const,
  },
  emptyCopy: {
    color: tokens.semantic.text.secondary,
    fontSize: tokens.typography.sizes.sm,
    lineHeight: 20,
    paddingHorizontal: tokens.spacing.xs,
  },
  filterChip: {
    backgroundColor: tokens.semantic.surface.elevated,
    borderColor: tokens.semantic.border.subtle,
    borderRadius: tokens.radii.full,
    borderWidth: 1,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.xs + 2,
  },
  filterChipSelected: {
    backgroundColor: tokens.colors.primary,
    borderColor: tokens.colors.primary,
  },
  filterText: {
    color: tokens.semantic.text.primary,
    fontSize: tokens.typography.sizes.xs,
    fontWeight: '500' as const,
  },
  filterTextSelected: { color: tokens.semantic.text.inverse, fontWeight: '700' as const },
  pinnedCard: {
    backgroundColor: tokens.semantic.surface.elevated,
    borderColor: tokens.semantic.border.subtle,
    borderRadius: tokens.radii.md,
    borderWidth: 1,
    gap: tokens.spacing.sm,
    justifyContent: 'space-between' as const,
    padding: tokens.spacing.md,
    width: 176,
  },
  catalogCard: {
    backgroundColor: tokens.semantic.surface.elevated,
    borderColor: tokens.semantic.border.subtle,
    borderRadius: tokens.radii.md,
    borderWidth: 1,
    gap: tokens.spacing.sm,
    minHeight: 148,
    padding: tokens.spacing.md,
  },
  cardTopline: {
    alignItems: 'flex-start' as const,
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
  },
  pinButton: {
    alignItems: 'center' as const,
    borderRadius: tokens.radii.full,
    height: 28,
    justifyContent: 'center' as const,
    width: 28,
  },
  pinButtonActive: { backgroundColor: tokens.semantic.surface.interactive },
  cardTitle: {
    color: tokens.semantic.text.primary,
    fontSize: tokens.typography.sizes.sm,
    fontWeight: '700' as const,
  },
  cardMeta: { color: tokens.semantic.text.secondary, fontSize: tokens.typography.sizes.xs },
  cardDescription: {
    color: tokens.semantic.text.secondary,
    fontSize: tokens.typography.sizes.xs,
    lineHeight: 16,
  },
  cardAction: {
    alignItems: 'center' as const,
    borderTopColor: tokens.semantic.border.subtle,
    borderTopWidth: 1,
    flexDirection: 'row' as const,
    gap: 4,
    paddingTop: tokens.spacing.sm,
  },
  cardActionText: {
    color: tokens.colors.primary,
    fontSize: tokens.typography.sizes.xs,
    fontWeight: '700' as const,
  },
};
