/**
 * The rooms, worn by the world. Three layouts, one set of items:
 *
 * - docked: along the bottom edge on the world's ground, a hairline above. Small phones.
 * - floating: a raised panel in the world's corners, lifted off the edge so the floor shows around
 *   it. Most phones.
 * - rail: a column at the side, for tablets and wide screens.
 *
 * The room you are in is the lit thing, marked the world's own way (`roomMarkOf`): a well in the
 * world's chip shape, a lamp line, a halo, or an ornament frame. The mark glides from room to room
 * on the world's curve (it simply moves when motion is off), and the name goes to full ink. Names
 * are always shown (signs alone are guesses). A long press opens the room's catalogue.
 */

import { type ComponentType, useCallback, useEffect, useState } from 'react';
import { type LayoutChangeEvent, Pressable, Text as RNText, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { alpha, mix } from '../../../theme/color';
import type { KitIconProps } from '../../../theme/contracts';
import { useFeedback } from '../../../theme/native/feedback';
import { usePressMotion, useWorldMotion } from '../../../theme/native/motion';
import { radiusStyle, shadowStyle, typeStyle } from '../../../theme/native/style';
import { useWorldContext } from '../../../theme/native/WorldContext';
import { fitRadius, type RoomMark, roomMarkOf } from '../../../theme/shellMarks';

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
const WELL_W = 56;
const WELL_H = 32;

type Spot = { x: number; y: number };

/** The "you are here" mark, drawn the world's way, gliding to the focused room's sign. */
function GlideMark({ spot, kind }: { spot: Spot; kind: RoomMark }) {
  const { world } = useWorldContext();
  const t = world.tokens;
  const m = useWorldMotion();
  const x = useSharedValue(spot.x);
  const y = useSharedValue(spot.y);
  useEffect(() => {
    if (!m.animates) {
      x.set(spot.x);
      y.set(spot.y);
      return;
    }
    x.set(m.spring ? withSpring(spot.x, m.spring) : withTiming(spot.x, m.timing()));
    y.set(withTiming(spot.y, m.timing()));
  }, [spot.x, spot.y, m, x, y]);
  const move = useAnimatedStyle(() => ({
    transform: [{ translateX: x.get() }, { translateY: y.get() }],
  }));
  const line = Math.max(1, world.definition.style.lineWeight);
  return (
    <Animated.View pointerEvents="none" style={[styles.mark, move]}>
      {kind === 'well' ? (
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: mix(t.sunken, t.lamp, 0.24) },
            radiusStyle(fitRadius(world.definition.style.corner.chip, WELL_H)),
          ]}
        />
      ) : kind === 'glow' ? (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              borderRadius: WELL_H / 2,
              backgroundColor: alpha(t.lamp, 0.16),
              boxShadow: `0 0 14px 2px ${alpha(t.glow, 0.4)}`,
            },
          ]}
        />
      ) : kind === 'underline' ? (
        <View
          style={[
            styles.underline,
            { backgroundColor: t.lamp, height: line + 2, borderRadius: (line + 2) / 2 },
          ]}
        />
      ) : (
        <>
          <View style={[styles.frameLine, { top: 0, height: line, backgroundColor: t.lamp }]} />
          <View style={[styles.frameLine, { bottom: 0, height: line, backgroundColor: t.lamp }]} />
          <View style={[styles.frameKnot, { top: -2.5, backgroundColor: t.lamp }]} />
          <View style={[styles.frameKnot, { bottom: -2.5, backgroundColor: t.lamp }]} />
        </>
      )}
    </Animated.View>
  );
}

function Item({
  item,
  layout,
  onSpot,
}: {
  item: WorldTabItem;
  layout: WorldTabBarProps['layout'];
  onSpot: (key: string, part: 'item' | 'well', at: Spot) => void;
}) {
  const { world, language } = useWorldContext();
  const t = world.tokens;
  const feedback = useFeedback();
  const press = usePressMotion();
  const Glyph = item.icon;
  const rail = layout === 'rail';
  return (
    <Pressable
      onLayout={(e: LayoutChangeEvent) => onSpot(item.key, 'item', e.nativeEvent.layout)}
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
      <Animated.View
        onLayout={(e: LayoutChangeEvent) => onSpot(item.key, 'well', e.nativeEvent.layout)}
        style={[styles.well, press.style]}
      >
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

/**
 * Reading tucks the bar away: it slides off the bottom edge (it never leaves the layout, so the
 * page does not jump) and comes back on the world's curve. A rail stays; it costs no height.
 */
export function WorldTabBar(props: WorldTabBarProps) {
  const m = useWorldMotion();
  const tucked = props.hidden === true && props.layout !== 'rail';
  const away = useSharedValue(tucked ? 1 : 0);
  useEffect(() => {
    away.set(m.animates ? withTiming(tucked ? 1 : 0, m.timing()) : tucked ? 1 : 0);
  }, [tucked, m, away]);
  const slide = useAnimatedStyle(() => ({
    opacity: 1 - away.get(),
    transform: [{ translateY: away.get() * (96 + props.insets.bottom) }],
  }));
  return (
    <Animated.View
      pointerEvents={tucked ? 'none' : 'box-none'}
      accessibilityElementsHidden={tucked}
      importantForAccessibility={tucked ? 'no-hide-descendants' : 'auto'}
      style={slide}
    >
      <Bar {...props} />
    </Animated.View>
  );
}

function Bar({ items, layout, insets, label = 'Rooms' }: WorldTabBarProps) {
  const { world } = useWorldContext();
  const t = world.tokens;
  const raised = world.recipes.surface.raised;
  const kind = roomMarkOf(world.id);
  // Where each item and its sign sit, so the mark can travel between them.
  const [spots, setSpots] = useState<Record<string, { item?: Spot; well?: Spot }>>({});
  const onSpot = useCallback((key: string, part: 'item' | 'well', at: Spot) => {
    setSpots((prev) => {
      const old = prev[key]?.[part];
      if (old && old.x === at.x && old.y === at.y) return prev;
      return { ...prev, [key]: { ...prev[key], [part]: { x: at.x, y: at.y } } };
    });
  }, []);

  const focused = items.find((i) => i.focused);
  const at = focused ? spots[focused.key] : undefined;
  const mark =
    at?.item && at.well ? (
      <GlideMark kind={kind} spot={{ x: at.item.x + at.well.x, y: at.item.y + at.well.y }} />
    ) : null;
  const rows = items.map((item) => (
    <Item key={item.key} item={item} layout={layout} onSpot={onSpot} />
  ));

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
        {mark}
        {rows}
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
          {mark}
          {rows}
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
      {mark}
      {rows}
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
  well: { width: WELL_W, height: WELL_H, alignItems: 'center', justifyContent: 'center' },
  mark: { position: 'absolute', left: 0, top: 0, width: WELL_W, height: WELL_H },
  underline: { position: 'absolute', bottom: -4, left: (WELL_W - 24) / 2, width: 24 },
  frameLine: { position: 'absolute', left: 10, right: 10 },
  frameKnot: {
    position: 'absolute',
    left: WELL_W / 2 - 3,
    width: 6,
    height: 6,
    transform: [{ rotate: '45deg' }],
  },
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
