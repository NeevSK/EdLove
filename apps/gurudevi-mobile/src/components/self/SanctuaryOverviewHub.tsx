import { usePerspectiveSwitch } from '@repo/core/logic';
import { useActiveSubTabsStore } from '@repo/core/store/useActiveSubTabsStore';
import { useStore } from '@repo/core/store/useStore';
import {
  ArrowRight,
  Bookmark,
  Compass,
  Heart,
  Pin,
  Sparkles,
  Wind,
} from '@repo/ui/icons';
import { Box, Pressable, Text } from '@repo/ui/primitives';
import { tokens } from '@repo/ui/tokens';
import { useScrollChromeCollapser } from '@repo/ui';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, useWindowDimensions } from 'react-native';
import { getSelfRegistry } from '@/navigation/registries/selfRegistry';
import type { MobileFeatureItem } from '@/navigation/registries/types';

interface SanctuaryOverviewHubProps {
  onOpenBreathingReset?: () => void;
}

export function SanctuaryOverviewHub({ onOpenBreathingReset }: SanctuaryOverviewHubProps) {
  const { width } = useWindowDimensions();
  const { activePerspective } = usePerspectiveSwitch();
  const user = useStore((state) => state.user);
  const displayName = user?.display_name?.split(' ')[0] || 'Seeker';

  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const openTab = useActiveSubTabsStore((s) => s.openTab);
  const pinnedIds = useActiveSubTabsStore((s) => s.pinnedFeatureIdsByDomain['self'] || []);
  const togglePin = useActiveSubTabsStore((s) => s.togglePinFeature);
  const { onScroll } = useScrollChromeCollapser();

  const currentCapacity = useMemo(() => {
    if (!activePerspective) return null;
    if (activePerspective.kind === 'institutional') return activePerspective.capacity;
    if (activePerspective.kind === 'guardian') return 'guardian';
    if (activePerspective.kind === 'commercial') return activePerspective.role;
    return null;
  }, [activePerspective]);

  const registry = useMemo(
    () => getSelfRegistry(currentCapacity),
    [currentCapacity],
  );

  // All features except the overview item itself
  const allFeatures = useMemo(
    () => registry.items.filter((item) => item.id !== 'self-overview'),
    [registry.items],
  );

  // Pinned feature items in order
  const pinnedFeatures = useMemo(() => {
    return pinnedIds
      .map((id) => allFeatures.find((f) => f.id === id))
      .filter((f): f is MobileFeatureItem => Boolean(f));
  }, [pinnedIds, allFeatures]);

  // Filtered features for catalog grid
  const filteredFeatures = useMemo(() => {
    if (selectedCategory === 'all') return allFeatures;
    return allFeatures.filter((f) => f.category === selectedCategory);
  }, [allFeatures, selectedCategory]);

  const handleLaunchFeature = (feature: MobileFeatureItem) => {
    openTab({
      id: `self-${feature.id}`,
      title: feature.title,
      route: '/self',
      params: { feature: feature.id },
      domain: 'self',
    });
    router.push({
      pathname: '/self',
      params: { feature: feature.id },
    } as any);
  };

  const cardWidth = useMemo(() => {
    // 2-column grid layout with spacing
    const padding = tokens.spacing.md * 2;
    const gap = tokens.spacing.sm;
    return (width - padding - gap) / 2;
  }, [width]);

  const categories = useMemo(
    () => [
      { id: 'all', label: 'All Spaces' },
      { id: 'wellbeing', label: 'Wellbeing' },
      { id: 'practice', label: 'Practice & Rhythm' },
      { id: 'growth', label: 'Growth' },
      { id: 'professional', label: 'Professional' },
    ],
    [],
  );

  return (
    <ScrollView
      onScroll={onScroll}
      scrollEventThrottle={16}
      contentContainerStyle={{
        paddingHorizontal: tokens.spacing.md,
        paddingTop: tokens.spacing.sm,
        paddingBottom: tokens.spacing.xl * 2,
        gap: tokens.spacing.lg,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Daily Rhythm & Pulse Hero Card */}
      <Box
        style={{
          borderRadius: tokens.radii.lg,
          backgroundColor: tokens.semantic.surface.elevated,
          borderColor: tokens.semantic.border.subtle,
          borderWidth: 1,
          padding: tokens.spacing.lg,
          gap: tokens.spacing.md,
        }}
      >
        <Box style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box style={{ gap: tokens.spacing.xs, flex: 1 }}>
            <Box style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing.xs }}>
              <Sparkles size={16} color={tokens.colors.primary} />
              <Text
                style={{
                  fontSize: tokens.typography.sizes.xs,
                  fontWeight: '700',
                  color: tokens.colors.primary,
                  textTransform: 'uppercase',
                  letterSpacing: 0.8,
                }}
              >
                {registry.title}
              </Text>
            </Box>
            <Text
              style={{
                fontSize: tokens.typography.sizes.xl,
                fontWeight: '800',
                color: tokens.semantic.text.primary,
              }}
            >
              Peace and presence, {displayName}
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.sizes.sm,
                color: tokens.semantic.text.secondary,
                lineHeight: 20,
              }}
            >
              {registry.subtitle}
            </Text>
          </Box>
        </Box>

        {/* Quick Sanctuary Action Pills */}
        <Box
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: tokens.spacing.sm,
            paddingTop: tokens.spacing.xs,
          }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Start 1 minute breathing reset"
            onPress={() => {
              if (onOpenBreathingReset) {
                onOpenBreathingReset();
              } else {
                handleLaunchFeature({
                  id: 'mood_lotus',
                  title: 'Mood Lotus',
                  description: 'Emotional balance',
                  route: '/self',
                  category: 'wellbeing',
                });
              }
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: tokens.spacing.xs,
              paddingVertical: tokens.spacing.sm,
              paddingHorizontal: tokens.spacing.md,
              backgroundColor: tokens.semantic.surface.interactive,
              borderRadius: tokens.radii.full,
            }}
          >
            <Wind size={15} color={tokens.semantic.text.primary} />
            <Text
              style={{
                fontSize: tokens.typography.sizes.xs,
                fontWeight: '700',
                color: tokens.semantic.text.primary,
              }}
            >
              Resonant Breath
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open Daily Pulse check-in"
            onPress={() =>
              handleLaunchFeature({
                id: 'daily_pulse',
                title: 'Daily Pulse',
                description: 'Inner pulse reflection',
                route: '/self',
                category: 'wellbeing',
              })
            }
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: tokens.spacing.xs,
              paddingVertical: tokens.spacing.sm,
              paddingHorizontal: tokens.spacing.md,
              backgroundColor: tokens.semantic.surface.interactive,
              borderRadius: tokens.radii.full,
            }}
          >
            <Heart size={15} color={tokens.colors.primary} />
            <Text
              style={{
                fontSize: tokens.typography.sizes.xs,
                fontWeight: '700',
                color: tokens.semantic.text.primary,
              }}
            >
              Check-in Pulse
            </Text>
          </Pressable>
        </Box>
      </Box>

      {/* 2. Pinned Quick Actions Carousel */}
      {pinnedFeatures.length > 0 && (
        <Box style={{ gap: tokens.spacing.sm }}>
          <Box
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: tokens.spacing.xs,
            }}
          >
            <Box style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing.xs }}>
              <Pin size={16} color={tokens.colors.primary} />
              <Text
                style={{
                  fontSize: tokens.typography.sizes.md,
                  fontWeight: '700',
                  color: tokens.semantic.text.primary,
                }}
              >
                Pinned Tasks
              </Text>
              <Box
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: tokens.radii.full,
                  backgroundColor: tokens.semantic.surface.interactive,
                }}
              >
                <Text
                  style={{
                    fontSize: tokens.typography.sizes.xs,
                    fontWeight: '700',
                    color: tokens.semantic.text.secondary,
                  }}
                >
                  {pinnedFeatures.length}
                </Text>
              </Box>
            </Box>
          </Box>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              gap: tokens.spacing.sm,
              paddingRight: tokens.spacing.md,
            }}
          >
            {pinnedFeatures.map((item) => {
              const IconComp = item.icon || Compass;
              return (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Open ${item.title} into active tab`}
                  onPress={() => handleLaunchFeature(item)}
                  style={{
                    width: 170,
                    borderRadius: tokens.radii.md,
                    backgroundColor: tokens.semantic.surface.elevated,
                    borderColor: tokens.semantic.border.subtle,
                    borderWidth: 1,
                    padding: tokens.spacing.md,
                    gap: tokens.spacing.sm,
                    justifyContent: 'space-between',
                  }}
                >
                  <Box
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                    }}
                  >
                    <Box
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: tokens.radii.md,
                        backgroundColor: tokens.semantic.surface.interactive,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <IconComp size={20} color={tokens.colors.primary} />
                    </Box>

                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Unpin ${item.title}`}
                      onPress={(e) => {
                        e.stopPropagation();
                        togglePin('self', item.id);
                      }}
                      hitSlop={8}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: tokens.radii.full,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Pin size={14} color={tokens.colors.primary} />
                    </Pressable>
                  </Box>

                  <Box style={{ gap: 2 }}>
                    <Text
                      numberOfLines={1}
                      style={{
                        fontSize: tokens.typography.sizes.sm,
                        fontWeight: '700',
                        color: tokens.semantic.text.primary,
                      }}
                    >
                      {item.title}
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={{
                        fontSize: tokens.typography.sizes.xs,
                        color: tokens.semantic.text.secondary,
                      }}
                    >
                      {item.badge || item.category || 'Space'}
                    </Text>
                  </Box>

                  <Box
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                      paddingTop: 2,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: tokens.typography.sizes.xs,
                        fontWeight: '600',
                        color: tokens.colors.primary,
                      }}
                    >
                      Open Tab
                    </Text>
                    <ArrowRight size={12} color={tokens.colors.primary} />
                  </Box>
                </Pressable>
              );
            })}
          </ScrollView>
        </Box>
      )}

      {/* 3. Categorized Sanctuary Catalog Grid */}
      <Box style={{ gap: tokens.spacing.md }}>
        <Box
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: tokens.spacing.xs,
          }}
        >
          <Text
            style={{
              fontSize: tokens.typography.sizes.md,
              fontWeight: '700',
              color: tokens.semantic.text.primary,
            }}
          >
            Sanctuary Catalog
          </Text>
          <Text
            style={{
              fontSize: tokens.typography.sizes.xs,
              color: tokens.semantic.text.secondary,
            }}
          >
            {allFeatures.length} capabilities
          </Text>
        </Box>

        {/* Category Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            gap: tokens.spacing.xs,
            paddingRight: tokens.spacing.md,
          }}
        >
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <Pressable
                key={cat.id}
                accessibilityRole="button"
                accessibilityLabel={`Filter by ${cat.label}`}
                onPress={() => setSelectedCategory(cat.id)}
                style={{
                  paddingVertical: tokens.spacing.xs + 2,
                  paddingHorizontal: tokens.spacing.md,
                  borderRadius: tokens.radii.full,
                  backgroundColor: isSelected
                    ? tokens.colors.primary
                    : tokens.semantic.surface.elevated,
                  borderColor: isSelected
                    ? tokens.colors.primary
                    : tokens.semantic.border.subtle,
                  borderWidth: 1,
                }}
              >
                <Text
                  style={{
                    fontSize: tokens.typography.sizes.xs,
                    fontWeight: isSelected ? '700' : '500',
                    color: isSelected
                      ? tokens.semantic.text.inverse
                      : tokens.semantic.text.primary,
                  }}
                >
                  {cat.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* 2-Column Responsive Grid of Feature Cards */}
        <Box
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: tokens.spacing.sm,
          }}
        >
          {filteredFeatures.map((item) => {
            const IconComp = item.icon || Compass;
            const isPinned = pinnedIds.includes(item.id);

            return (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                accessibilityLabel={`Open ${item.title}`}
                onPress={() => handleLaunchFeature(item)}
                style={{
                  width: cardWidth,
                  borderRadius: tokens.radii.md,
                  backgroundColor: tokens.semantic.surface.elevated,
                  borderColor: tokens.semantic.border.subtle,
                  borderWidth: 1,
                  padding: tokens.spacing.md,
                  gap: tokens.spacing.sm,
                  justifyContent: 'space-between',
                  minHeight: 140,
                }}
              >
                <Box
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <Box
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: tokens.radii.md,
                      backgroundColor: tokens.semantic.surface.interactive,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <IconComp size={18} color={tokens.colors.primary} />
                  </Box>

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={isPinned ? `Unpin ${item.title}` : `Pin ${item.title}`}
                    onPress={(e) => {
                      e.stopPropagation();
                      togglePin('self', item.id);
                    }}
                    hitSlop={8}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: tokens.radii.full,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isPinned
                        ? tokens.semantic.surface.interactive
                        : 'transparent',
                    }}
                  >
                    {isPinned ? (
                      <Pin size={14} color={tokens.colors.primary} />
                    ) : (
                      <Bookmark size={14} color={tokens.semantic.text.secondary} />
                    )}
                  </Pressable>
                </Box>

                <Box style={{ gap: 2 }}>
                  <Text
                    numberOfLines={1}
                    style={{
                      fontSize: tokens.typography.sizes.sm,
                      fontWeight: '700',
                      color: tokens.semantic.text.primary,
                    }}
                  >
                    {item.title}
                  </Text>
                  <Text
                    numberOfLines={2}
                    style={{
                      fontSize: tokens.typography.sizes.xs,
                      color: tokens.semantic.text.secondary,
                      lineHeight: 16,
                    }}
                  >
                    {item.description}
                  </Text>
                </Box>

                <Box
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: 4,
                    borderTopWidth: 1,
                    borderTopColor: tokens.semantic.border.subtle,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: '600',
                      color: tokens.colors.primary,
                    }}
                  >
                    Open Tab
                  </Text>
                  <ArrowRight size={12} color={tokens.colors.primary} />
                </Box>
              </Pressable>
            );
          })}
        </Box>
      </Box>
    </ScrollView>
  );
}
