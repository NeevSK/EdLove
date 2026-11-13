/**
 * The Self room's front screen, worn by the world: the world's floor shows in full behind it (no
 * page colour of its own), a greeting on the world's raised surface, pinned practices as pebbles,
 * and every practice as a card in the world's shape. Reading down tucks the chrome away and pauses
 * the floor's life; the cards arrive the way the world moves.
 *
 * Turned on its side, the greeting and the pinned practices sit next to each other (the screen is
 * short, so they share a row instead of stacking), and the practice cards fill as many columns as
 * the width beside the rail holds.
 */

import {
  Card,
  Chip,
  Chips,
  IconButton,
  Pebble,
  Surface,
  Text,
  useScreenGround,
  useRoomScroll,
  useShellLayout,
} from '@repo/ui/components/native';
import { Bookmark, Compass, Pin, Sparkles } from '@repo/ui/icons';
import type { KitIconProps } from '@repo/ui/theme';
import { useWorld, WorldEnter } from '@repo/ui/theme/native';
import { type ComponentType, type ReactNode, useState } from 'react';
import { type LayoutChangeEvent, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelfCanvas } from '@/hooks/useSelfCanvas';
import type { MobileFeatureItem } from '@/navigation/registries/types';

const kit = (Glyph: unknown) => Glyph as ComponentType<KitIconProps>;

/** A practice card is never narrower than this; the grid adds columns as the width allows. */
const MIN_CARD = 160;

/** How many cards fit across `width`, and how wide each one is. */
export function practiceGrid(width: number, gap: number): { columns: number; card: number } {
  if (width <= 0) return { columns: 2, card: 0 };
  const columns = Math.max(2, Math.floor((width + gap) / (MIN_CARD + gap)));
  return { columns, card: (width - gap * (columns - 1)) / columns };
}

export function SelfFloor() {
  useScreenGround('room');
  const canvas = useSelfCanvas();
  const scroll = useRoomScroll();
  const insets = useSafeAreaInsets();
  const shell = useShellLayout();
  const t = useWorld().tokens;
  // The grid's own width, measured, so the rail and the cutouts are already taken out.
  const [gridWidth, setGridWidth] = useState(0);
  const grid = practiceGrid(gridWidth, canvas.cardGap);
  const sideBySide = shell.posture === 'landscape';
  const gutter = Math.max(canvas.gutter, shell.gutter);

  return (
    <ScrollView
      {...scroll}
      style={styles.screen}
      contentContainerStyle={{
        paddingLeft: gutter + shell.edges.left,
        paddingRight: gutter + shell.edges.right,
        paddingTop: shell.stance === 'hud' ? shell.rhythm.top : 8,
        // Upright, the rooms bar floats over the bottom; on a rail only the action button does.
        paddingBottom: insets.bottom + (shell.tabs === 'rail' ? 96 : 140),
        gap: shell.stance === 'hud' ? 20 : 28,
      }}
    >
      <View style={sideBySide ? styles.pair : styles.stack}>
        <WorldEnter index={0} style={sideBySide ? styles.half : undefined}>
          <Surface tone="raised" style={styles.greeting}>
            <View style={styles.eyebrow}>
              <Sparkles size={16} color={t.lampDeep} aria-hidden />
              <Text kind="label" tone="soft">
                {canvas.registry.title}
              </Text>
            </View>
            <Text kind="title">Begin where you are, {canvas.displayName}</Text>
            <Text kind="body" tone="soft">
              {canvas.registry.subtitle}
            </Text>
            <Text kind="caption" tone="faint">
              Choose a practice below. Open work stays in your task strip.
            </Text>
          </Surface>
        </WorldEnter>

        <WorldEnter index={1} style={sideBySide ? styles.half : undefined}>
          <FloorSection
            count={canvas.pinnedFeatures.length}
            icon={<Pin size={16} color={t.lampDeep} aria-hidden />}
            title="Pinned practices"
          >
            {canvas.pinnedFeatures.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 10, paddingRight: gutter }}
              >
                {canvas.pinnedFeatures.map((feature) => (
                  <Pebble
                    key={feature.id}
                    title={feature.title}
                    icon={feature.icon || Compass}
                    gear="compact"
                    width={90}
                    cornerBadge={{
                      mode: 'pin',
                      isPinned: true,
                      onAction: () => canvas.togglePin(feature.id),
                    }}
                    onPress={() => canvas.launchFeature(feature)}
                  />
                ))}
              </ScrollView>
            ) : (
              <Text kind="body" tone="soft">
                Pin the practices you return to. They will appear here in your chosen order.
              </Text>
            )}
          </FloorSection>
        </WorldEnter>
      </View>

      <WorldEnter index={2}>
        <FloorSection count={canvas.features.length} title="Self practices">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: gutter }}
          >
            <Chips label="Show practices" single>
              {canvas.categories.map((category) => (
                <Chip
                  key={category.id}
                  kind="radio"
                  label={category.label}
                  selected={canvas.selectedCategory === category.id}
                  onPress={() => canvas.setSelectedCategory(category.id)}
                />
              ))}
            </Chips>
          </ScrollView>
          <View
            style={[styles.grid, { gap: canvas.cardGap }]}
            onLayout={(e: LayoutChangeEvent) => setGridWidth(e.nativeEvent.layout.width)}
          >
            {canvas.visibleFeatures.map((feature) => (
              <PracticeCard
                key={feature.id}
                feature={feature}
                isPinned={canvas.effectivePinnedIds.includes(feature.id)}
                onLaunch={() => canvas.launchFeature(feature)}
                onTogglePin={() => canvas.togglePin(feature.id)}
                width={grid.card || canvas.cardWidth}
              />
            ))}
          </View>
        </FloorSection>
      </WorldEnter>
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
    <View style={{ gap: 14 }}>
      <View style={styles.sectionHeader}>
        <View style={styles.eyebrow}>
          {icon}
          <Text kind="label" accessibilityRole="header">
            {title}
          </Text>
        </View>
        <Text kind="caption" tone="soft">
          {count}
        </Text>
      </View>
      {children}
    </View>
  );
}

function PracticeCard({
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
  return (
    <View style={{ width }}>
      <Card
        title={feature.title}
        meta={feature.description}
        icon={kit(feature.icon || Compass)}
        shape="tile"
        size="sm"
        accessibilityLabel={`Open ${feature.title}`}
        onPress={onLaunch}
        style={styles.card}
      />
      <View style={styles.pin}>
        <IconButton
          icon={kit(isPinned ? Pin : Bookmark)}
          label={isPinned ? `Unpin ${feature.title}` : `Pin ${feature.title}`}
          variant={isPinned ? 'secondary' : 'quiet'}
          size="sm"
          onPress={onTogglePin}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: 'transparent' },
  stack: { gap: 28 },
  pair: { flexDirection: 'row', alignItems: 'stretch', gap: 20 },
  half: { flex: 1, minWidth: 0 },
  greeting: { padding: 20, gap: 10 },
  eyebrow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  card: { minHeight: 130 },
  pin: { position: 'absolute', top: 6, right: 6 },
});
