/**
 * The companion out on the floor: the person's own pet or friend, sitting in their world. It is
 * drawn as a soft pebble in a tone of the world with its photo (or its first letter) as its face,
 * a shadow under it, and a way of being: resting breathes slowly, wandering strolls side to side,
 * perching sits up high and sways. The motion is a Reanimated CSS animation on the UI thread, so
 * it costs nothing per frame; at the bare tier it simply sits still.
 */

import { Image, Text as RNText, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useCompanionOut } from '../../../context/Companions';
import { alpha, clearestOn } from '../../../theme/color';
import { useWorld } from '../../../theme/native/WorldContext';
import type { Stage } from '../../../theme/stage';

const SIZE = 54;

export function CompanionOnFloor({ stage }: { stage: Stage }) {
  const companion = useCompanionOut();
  const world = useWorld();
  const { width, height } = useWindowDimensions();
  if (!companion) return null;
  const t = world.tokens;
  const tone = t[companion.tone] ?? t.lamp;
  const still = stage.tier === 'bare';
  const perch = companion.way === 'perch';
  // On its side the rooms rail covers the left edge, so the companion keeps clear of it.
  const sideways = width > height;
  const bottom = height * (perch ? 0.34 : sideways ? 0.12 : 0.17);
  const left = sideways
    ? Math.max(width * (perch ? 0.72 : 0.12), 104)
    : width * (perch ? 0.72 : 0.08);

  const walk = still
    ? null
    : companion.way === 'wander'
      ? {
          animationName: {
            from: { transform: [{ translateX: 0 }] },
            to: { transform: [{ translateX: width * 0.22 }] },
          },
          animationDuration: 9000,
          animationDirection: 'alternate',
          animationIterationCount: 'infinite',
          animationTimingFunction: 'ease-in-out',
        }
      : null;
  const breathe = still
    ? null
    : {
        animationName: perch
          ? { from: { transform: [{ rotate: '-4deg' }] }, to: { transform: [{ rotate: '4deg' }] } }
          : { from: { transform: [{ scale: 1 }] }, to: { transform: [{ scale: 1.05 }] } },
        animationDuration: perch ? 2600 : 3200,
        animationDirection: 'alternate',
        animationIterationCount: 'infinite',
        animationTimingFunction: 'ease-in-out',
      };

  return (
    <Animated.View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[{ position: 'absolute', left, bottom, alignItems: 'center' }, walk as object]}
    >
      <Animated.View
        style={[
          styles.pebble,
          { backgroundColor: tone, borderColor: alpha(t.ground, 0.9), shadowColor: t.ink },
          breathe as object,
        ]}
      >
        {companion.photo ? (
          <Image source={{ uri: companion.photo }} style={styles.photo} />
        ) : (
          <RNText style={[styles.letter, { color: clearestOn(tone, [t.onLamp, t.ink, t.ground]) }]}>
            {companion.name.slice(0, 1).toUpperCase()}
          </RNText>
        )}
      </Animated.View>
      <View style={[styles.shadow, { backgroundColor: alpha(t.ink, 0.22) }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pebble: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    elevation: 3,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  photo: { width: SIZE, height: SIZE },
  letter: { fontSize: 22, fontWeight: '700' },
  shadow: { width: SIZE * 0.7, height: 6, borderRadius: 3, marginTop: 3 },
});
