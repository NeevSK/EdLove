/**
 * Our own keypad for numbers (marks, PINs, amounts, counts), worn by the world. A field asks
 * for it with `keypad="number"` and the phone's keyboard stays away.
 *
 * Where it sits follows how the phone is held, the way a game puts its controls by the thumbs:
 *
 * - Upright: a short, flat pad along the bottom, lower than the system keyboard, so more of the
 *   page stays in view.
 * - Sideways: a full-height panel on the side of the person's chosen hand (Reading and comfort),
 *   leaving the rest of the wide screen to the page. The page moves aside by the same width
 *   (`useKeypadSpace`).
 *
 * Its head always echoes the field's name and value, large, so the number is seen even if the
 * field is behind the pad. Keys are big and spaced by the person's comfort size; each key gives a
 * light tap. Mount `KeypadHost` once, at the root.
 */

import { useEffect } from 'react';
import { Pressable, Text as RNText, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useComfort } from '../../../context/ComfortPreferences';
import { mix } from '../../../theme/color';
import { useFeedback } from '../../../theme/native/feedback';
import { usePressMotion, useWorldMotion } from '../../../theme/native/motion';
import { radiusStyle, typeStyle } from '../../../theme/native/style';
import { useWorldContext } from '../../../theme/native/WorldContext';
import { fitRadius } from '../../../theme/shellMarks';
import { surfaceStyle } from '../Surface/Surface';
import { type KeypadTarget, pressKey, updateKeypadValue, useKeypadTarget } from './focus';

/** Width of the side panel when the phone is on its side. */
export const KEYPAD_SIDE_WIDTH = 272;
/** Height of the flat pad when upright (keys and head, before the safe area). */
export const KEYPAD_FLAT_HEIGHT = 268;

const ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
] as const;

/** How much room the open keypad takes, for pages to keep clear of it. */
export function useKeypadSpace(): { left: number; right: number; bottom: number } {
  const target = useKeypadTarget();
  const comfort = useComfort();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  if (!target) return { left: 0, right: 0, bottom: 0 };
  if (width > height) {
    const side = KEYPAD_SIDE_WIDTH + (comfort.hand === 'left' ? insets.left : insets.right);
    return comfort.hand === 'left'
      ? { left: side, right: 0, bottom: 0 }
      : { left: 0, right: side, bottom: 0 };
  }
  return { left: 0, right: 0, bottom: KEYPAD_FLAT_HEIGHT + insets.bottom };
}

function Key({
  label,
  name,
  onPress,
  wide = false,
  tone = 'plain',
  height,
}: {
  label: string;
  name: string;
  onPress: () => void;
  wide?: boolean;
  tone?: 'plain' | 'quiet' | 'lamp';
  height: number;
}) {
  const { world, language } = useWorldContext();
  const t = world.tokens;
  const press = usePressMotion();
  const fill =
    tone === 'lamp' ? t.lamp : tone === 'quiet' ? t.sunken : mix(t.raised, t.ground, 0.2);
  const ink = tone === 'lamp' ? t.onLamp : t.ink;
  return (
    <Pressable
      role="button"
      accessibilityLabel={name}
      onPressIn={press.pressIn}
      onPressOut={press.pressOut}
      onPress={onPress}
      style={{ flex: wide ? 2 : 1 }}
    >
      <Animated.View
        style={[
          styles.key,
          { height, backgroundColor: fill, borderColor: t.line },
          radiusStyle(fitRadius(world.definition.style.corner.control, height)),
          press.style,
        ]}
      >
        <RNText
          maxFontSizeMultiplier={1.4}
          style={[typeStyle(world.recipes.text.title, language, world, 22), { color: ink }]}
        >
          {label}
        </RNText>
      </Animated.View>
    </Pressable>
  );
}

function Pad({ target, sideways }: { target: KeypadTarget; sideways: boolean }) {
  const { world, language } = useWorldContext();
  const comfort = useComfort();
  const feedback = useFeedback();
  const t = world.tokens;
  const keyH = comfort.size === 'large' ? 56 : comfort.size === 'compact' ? 42 : 48;
  const gap = comfort.size === 'large' ? 10 : 8;

  const type = (key: string) => {
    const next = pressKey(target.value, key, target.kind, target.maxLength);
    if (next === target.value) {
      feedback('warning');
      return;
    }
    feedback('step');
    updateKeypadValue(next);
    target.onChange(next);
  };
  const shown = target.secret ? '•'.repeat(target.value.length) : target.value;

  return (
    <View style={{ gap }}>
      {/* The echo: the field's name and its value, large, always in view. */}
      <View style={styles.head} accessibilityLiveRegion="polite">
        <RNText
          numberOfLines={1}
          style={[typeStyle(world.recipes.text.caption, language, world), { color: t.inkSoft }]}
        >
          {target.label}
        </RNText>
        <RNText
          numberOfLines={1}
          ellipsizeMode="head"
          style={[
            typeStyle(world.recipes.text.display, language, world, sideways ? 30 : 26),
            { color: shown ? t.ink : t.inkFaint },
          ]}
        >
          {shown || '–'}
        </RNText>
      </View>
      {ROWS.map((row) => (
        <View key={row.join('')} style={[styles.row, { gap }]}>
          {row.map((k) => (
            <Key key={k} label={k} name={k} height={keyH} onPress={() => type(k)} />
          ))}
        </View>
      ))}
      <View style={[styles.row, { gap }]}>
        {target.kind === 'decimal' ? (
          <Key label="." name="Decimal point" height={keyH} onPress={() => type('.')} />
        ) : (
          <Key label="⌫" name="Delete" tone="quiet" height={keyH} onPress={() => type('back')} />
        )}
        <Key label="0" name="0" height={keyH} onPress={() => type('0')} />
        {target.kind === 'decimal' ? (
          <Key label="⌫" name="Delete" tone="quiet" height={keyH} onPress={() => type('back')} />
        ) : (
          <Key
            label="Done"
            name="Done"
            tone="lamp"
            height={keyH}
            onPress={() => {
              feedback('commit');
              target.onDone();
            }}
          />
        )}
      </View>
      {target.kind === 'decimal' ? (
        <View style={[styles.row, { gap }]}>
          <Key
            label="Done"
            name="Done"
            tone="lamp"
            height={keyH}
            onPress={() => {
              feedback('commit');
              target.onDone();
            }}
          />
        </View>
      ) : null}
    </View>
  );
}

/** Mount once, at the root, inside the world and the safe area. */
export function KeypadHost() {
  const target = useKeypadTarget();
  const { world } = useWorldContext();
  const comfort = useComfort();
  const m = useWorldMotion();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const sideways = width > height;
  const shown = useSharedValue(0);
  useEffect(() => {
    const to = target ? 1 : 0;
    shown.set(m.animates ? withTiming(to, m.timing()) : to);
  }, [target, m, shown]);
  const left = comfort.hand === 'left';
  const slide = useAnimatedStyle(() => {
    const away = 1 - shown.get();
    return {
      opacity: shown.get(),
      transform: sideways
        ? [{ translateX: away * (left ? -KEYPAD_SIDE_WIDTH : KEYPAD_SIDE_WIDTH) }]
        : [{ translateY: away * KEYPAD_FLAT_HEIGHT }],
    };
  });
  if (!target) return null;
  const panel = world.recipes.overlay.panel;
  return (
    <Animated.View
      role="toolbar"
      aria-label={`Keypad for ${target.label}`}
      style={[
        surfaceStyle(panel, true),
        styles.host,
        sideways
          ? {
              top: 0,
              bottom: 0,
              width: KEYPAD_SIDE_WIDTH + (left ? insets.left : insets.right),
              [left ? 'left' : 'right']: 0,
              paddingTop: Math.max(insets.top, 12),
              paddingBottom: Math.max(insets.bottom, 12),
              paddingLeft: 14 + (left ? insets.left : 0),
              paddingRight: 14 + (left ? 0 : insets.right),
              justifyContent: 'center',
            }
          : {
              left: 0,
              right: 0,
              bottom: 0,
              paddingTop: 12,
              paddingHorizontal: 16 + Math.max(insets.left, insets.right),
              paddingBottom: Math.max(insets.bottom, 12),
            },
        sideways ? null : radiusStyle(world.recipes.overlay.sheetRadius),
        slide,
      ]}
    >
      <View style={sideways ? null : styles.flatInner}>
        <Pad target={target} sideways={sideways} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  host: { position: 'absolute', zIndex: 50 },
  flatInner: { width: '100%', maxWidth: 420, alignSelf: 'center' },
  head: { gap: 2, paddingHorizontal: 4, paddingBottom: 4 },
  row: { flexDirection: 'row' },
  key: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
});
