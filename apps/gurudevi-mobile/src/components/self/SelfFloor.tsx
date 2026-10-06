import { useScrollChromeCollapser } from '@repo/ui';
import { ArrowRight, Bookmark, Compass, Pin, Sparkles } from '@repo/ui/icons';
import { Box, Pressable, Text } from '@repo/ui/primitives';
import { tokens } from '@repo/ui/tokens';
import { type ReactNode } from 'react';
import { ScrollView } from 'react-native';
import { useSelfCanvas } from '@/hooks/useSelfCanvas';
import type { MobileFeatureItem } from '@/navigation/registries/types';

/**
 * SelfFloor is the human visual floor for the personal inner domain.
 * Consumes the headless useSelfCanvas for spatial arrangement and sync.
 */
export function SelfFloor() {
  const canvas = useSelfCanvas();
  const { onScroll } = useScrollChromeCollapser();

  return (
    <ScrollView
      onScroll={onScroll}
      scrollEventThrottle={16}
      style={{ backgroundColor: canvas.floorColor }}
      contentContainerStyle={{
        paddingHorizontal: canvas.gutter,
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
            <Text style={styles.eyebrowText}>{canvas.registry.title}</Text>
          </Box>
          <Text style={styles.orientationTitle}>Begin where you are, {canvas.displayName}</Text>
          <Text style={styles.orientationCopy}>{canvas.registry.subtitle}</Text>
        </Box>
        <Text style={styles.orientationHint}>
          Choose a personal practice below. Open work stays available in your task strip.
        </Text>
      </Box>

      <FloorSection
        count={canvas.pinnedFeatures.length}
        icon={<Pin size={16} color={tokens.colors.primary} />}
        title="Pinned practices"
      >
        {canvas.pinnedFeatures.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: tokens.spacing.sm, paddingRight: canvas.gutter }}
          >
            {canvas.pinnedFeatures.map((feature) => (
              <PinnedFeatureCard
                feature={feature}
                key={feature.id}
                onLaunch={() => canvas.launchFeature(feature)}
                onUnpin={() => canvas.togglePin(feature.id)}
              />
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.emptyCopy}>
            Pin the practices you return to. They will appear here in your chosen order.
          </Text>
        )}
      </FloorSection>

      <FloorSection count={canvas.features.length} title="Self practices">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: tokens.spacing.xs, paddingRight: canvas.gutter }}
        >
          {canvas.categories.map((category) => {
            const selected = canvas.selectedCategory === category.id;
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={`Show ${category.label}`}
                key={category.id}
                onPress={() => canvas.setSelectedCategory(category.id)}
                style={[styles.filterChip, selected && styles.filterChipSelected]}
              >
                <Text style={[styles.filterText, selected && styles.filterTextSelected]}>
                  {category.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
        <Box style={{ flexDirection: 'row', flexWrap: 'wrap', gap: canvas.cardGap }}>
          {canvas.visibleFeatures.map((feature) => (
            <CatalogFeatureCard
              feature={feature}
              isPinned={canvas.effectivePinnedIds.includes(feature.id)}
              key={feature.id}
              onLaunch={() => canvas.launchFeature(feature)}
              onTogglePin={() => canvas.togglePin(feature.id)}
              width={canvas.cardWidth}
            />
          ))}
        </Box>
      </FloorSection>
    </ScrollView>
  );
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
          {feature.badge || feature.category || 'Practice'}
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
  },
  sectionTitle: {
    color: tokens.semantic.text.primary,
    fontSize: tokens.typography.sizes.md,
    fontWeight: '700' as const,
  },
  count: {
    color: tokens.semantic.text.secondary,
    fontSize: tokens.typography.sizes.sm,
    fontWeight: '600' as const,
  },
  emptyCopy: {
    color: tokens.semantic.text.secondary,
    fontSize: tokens.typography.sizes.sm,
    lineHeight: 20,
  },
  pinnedCard: {
    width: 140,
    minHeight: 110,
    borderRadius: tokens.radii.md,
    backgroundColor: tokens.semantic.surface.elevated,
    borderColor: tokens.semantic.border.subtle,
    borderWidth: 1,
    padding: tokens.spacing.md,
    justifyContent: 'space-between' as const,
    gap: tokens.spacing.xs,
  },
  cardTopline: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  cardTitle: {
    color: tokens.semantic.text.primary,
    fontSize: tokens.typography.sizes.sm,
    fontWeight: '700' as const,
  },
  cardMeta: {
    color: tokens.semantic.text.secondary,
    fontSize: tokens.typography.sizes.xs,
    textTransform: 'capitalize' as const,
  },
  cardDescription: {
    color: tokens.semantic.text.secondary,
    fontSize: tokens.typography.sizes.xs,
    lineHeight: 16,
  },
  pinButton: {
    width: 28,
    height: 28,
    borderRadius: tokens.radii.full,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  pinButtonActive: {
    backgroundColor: tokens.semantic.surface.interactive,
  },
  catalogCard: {
    minHeight: 130,
    borderRadius: tokens.radii.md,
    backgroundColor: tokens.semantic.surface.elevated,
    borderColor: tokens.semantic.border.subtle,
    borderWidth: 1,
    padding: tokens.spacing.md,
    justifyContent: 'space-between' as const,
    gap: tokens.spacing.sm,
  },
  filterChip: {
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.xs,
    borderRadius: tokens.radii.full,
    backgroundColor: tokens.semantic.surface.elevated,
    borderColor: tokens.semantic.border.subtle,
    borderWidth: 1,
    minHeight: 36,
    justifyContent: 'center' as const,
  },
  filterChipSelected: {
    backgroundColor: tokens.colors.primary,
    borderColor: tokens.colors.primary,
  },
  filterText: {
    color: tokens.semantic.text.secondary,
    fontSize: tokens.typography.sizes.xs,
    fontWeight: '600' as const,
  },
  filterTextSelected: {
    color: '#ffffff',
  },
  cardAction: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
    alignSelf: 'flex-start' as const,
  },
  cardActionText: {
    color: tokens.colors.primary,
    fontSize: tokens.typography.sizes.xs,
    fontWeight: '700' as const,
  },
};
