/**
 * The rooms, worn by the world. Three layouts, one set of items:
 *
 * - docked: along the bottom edge on the world's ground, a hairline above. Small phones.
 * - floating: a raised panel in the world's corners, lifted off the edge so the floor shows around
 *   it. Most phones.
 * - rail: a column at the side, for tablets and wide screens.
 *
 * The room you are in is the lit thing: a soft well of the world's lamp behind its sign, and its
 * name at full ink. Names are always shown (signs alone are guesses). A long press opens the
 * room's catalogue where a room has one.
 */

import type { ComponentType } from 'react';
import { Pressable, Text as RNText, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { alpha, mix } from '../../../theme/color';
import type { KitIconProps } from '../../../theme/contracts';
import { useFeedback } from '../../../theme/native/feedback';
import { useLivingStyle, usePressMotion } from '../../../theme/native/motion';
import { radiusStyle, shadowStyle, typeStyle } from '../../../theme/native/style';
import { useWorldContext } from '../../../theme/native/WorldContext';

export interface WorldTabItem {
  key: string;
  label: string;
  icon: ComponentType<KitIconProps>;
  focused: boolean;
  onPress: () => void;
  onLongPress?: () => void;
  /** Said when a long press does something ("Hold for all of Self"). */
  longPressHint?: string;
  /** A quiet dot that something waits in this room. */
  signal?: boolean;
}

export interface WorldTabBarProps {
  items: readonly WorldTabItem[];
  layout: 'docked' | 'floating' | 'rail';
  insets: { top: number; bottom: number; left: number; right: number };
  /** Hidden while the person reads (scroll hides chrome). */
  hidden?: boolean;
  label?: string;
}

const RAIL_WIDTH = 88;

function Item({ item, layout }: { item: WorldTabItem; layout: WorldTabBarProps['layout'] }) {
  const { world, language } = useWorldContext();
  const t = world.tokens;
  const feedback = useFeedback();
  const press = usePressMotion();
  const well = useLivingStyle({
    backgroundColor: item.focused ? mix(t.sunken, t.lamp, 0.24) : alpha(t.sunken, 0),
  });
  const Glyph = item.icon;
  const rail = layout === 'rail';
  return (
    <Pressable
      role="tab"
      aria-selected={item.focused}
      accessibilityLabel={item.label}
      accessibilityHint={item.longPressHint}
      onPressIn={press.pressIn}
      onPressOut={press.pressOut}
      onPress={() => {
        if (!item.focused) feedback('select');
        item.onPress();
      }}
      onLongPress={
        item.onLongPress
          ? () => {
              feedback('press');
              item.onLongPress?.();
            }
          : undefined
      }
      style={[styles.item, rail ? styles.railItem : null]}
    >
      <Animated.View style={[styles.well, well, press.style]}>
        <Glyph size={22} color={item.focused ? t.lampDeep : t.inkSoft} aria-hidden />
        {item.signal ? (
          <View
            pointerEvents="none"
            style={[styles.signal, { backgroundColor: t.lamp, borderColor: t.ground }]}
          />
        ) : null}
      </Animated.View>
      <RNText
        numberOfLines={1}
        maxFontSizeMultiplier={1.4}
        style={[
          typeStyle(world.recipes.text.caption, language, world, 11.5),
          { color: item.focused ? t.ink : t.inkSoft, fontWeight: item.focused ? '700' : '500' },
        ]}
      >
        {item.label}
      </RNText>
    </Pressable>
  );
}

export function WorldTabBar({
  items,
  layout,
  insets,
  hidden = false,
  label = 'Rooms',
}: WorldTabBarProps) {
  const { world } = useWorldContext();
  const t = world.tokens;
  const raised = world.recipes.surface.raised;
  if (hidden) return null;

  if (layout === 'rail') {
    return (
      <View
        role="tablist"
        aria-label={label}
        style={[
          styles.rail,
          {
            width: RAIL_WIDTH + insets.left,
            paddingTop: insets.top + 12,
            paddingBottom: insets.bottom + 12,
            paddingLeft: insets.left,
            backgroundColor: alpha(t.ground, 0.9),
            borderRightColor: t.line,
            borderRightWidth: world.definition.style.lineWeight,
          },
        ]}
      >
        {items.map((item) => (
          <Item key={item.key} item={item} layout={layout} />
        ))}
      </View>
    );
  }

  if (layout === 'floating') {
    return (
      <View
        pointerEvents="box-none"
        style={[styles.floatWrap, { paddingBottom: Math.max(insets.bottom, 8) + 6 }]}
      >
        <View
          role="tablist"
          aria-label={label}
          style={[
            styles.row,
            styles.float,
            { backgroundColor: alpha(raised.fill ?? t.raised, 0.96), borderColor: t.line },
            radiusStyle(world.recipes.surface.raised.radius),
            shadowStyle(raised.shadow),
          ]}
        >
          {items.map((item) => (
            <Item key={item.key} item={item} layout={layout} />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View
      role="tablist"
      aria-label={label}
      style={[
        styles.row,
        {
          paddingBottom: Math.max(insets.bottom, 6),
          paddingLeft: insets.left,
          paddingRight: insets.right,
          backgroundColor: t.ground,
          borderTopColor: t.line,
          borderTopWidth: world.definition.style.lineWeight,
        },
      ]}
    >
      {items.map((item) => (
        <Item key={item.key} item={item} layout={layout} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'stretch', paddingTop: 6 },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    minHeight: 56,
    paddingVertical: 4,
  },
  railItem: { flex: 0, width: RAIL_WIDTH, minHeight: 72 },
  well: { width: 56, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  signal: {
    position: 'absolute',
    top: 4,
    right: 12,
    width: 9,
    height: 9,
    borderRadius: 5,
    borderWidth: 1.5,
  },
  floatWrap: { paddingHorizontal: 12, backgroundColor: 'transparent' },
  float: {
    paddingBottom: 6,
    borderWidth: StyleSheet.hairlineWidth,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 520,
  },
  rail: { alignItems: 'center', gap: 6 },
});
