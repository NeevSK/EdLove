/**
 * A world's moment of celebration: `celebrate("Lesson done")` from anywhere, and the host mounted
 * once over the stage plays it the active world's way (`momentOf`): petals, leaves, ripples, lamp
 * sparks, glints or strike lines, with the world's success touch and the words on a raised chip.
 * Verger decides how many pieces fly; with celebrations off or a still stage, only the words and
 * the touch remain. Screen readers hear the words. Touches pass through.
 */

import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { AccessibilityInfo, StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useVisualCapabilities } from '../../../context/VisualCapabilities';
import { type MomentShape, momentOf, momentPieces } from '../../../theme/moments';
import { useFeedback } from '../../../theme/native/feedback';
import { useWorldMotion } from '../../../theme/native/motion';
import { radiusStyle, shadowStyle } from '../../../theme/native/style';
import { useWorld } from '../../../theme/native/WorldContext';
import type { WorldTokens } from '../../../theme/types';
import { useStage } from '../Stage/StageContext';
import { Text } from '../Text/Text';

interface Moment {
  id: number;
  message?: string;
}

let current: Moment | null = null;
let nextId = 1;
const listeners = new Set<() => void>();
const emit = () => {
  for (const l of listeners) l();
};

/** Play the world's moment, with optional words ("Lesson done"). */
export function celebrate(message?: string): void {
  current = { id: nextId++, message };
  emit();
}

function finish(id: number) {
  if (current?.id !== id) return;
  current = null;
  emit();
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const read = () => current;

const MOMENT_MS = 1500;

/** A small fixed scatter, so each piece has its own path without randomness per frame. */
function seed(i: number, k: number): number {
  const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function shapeStyle(shape: MomentShape, colour: string): ViewStyle {
  switch (shape) {
    case 'petal':
      return { width: 11, height: 15, backgroundColor: colour, ...radiusStyle([11, 2, 11, 2]) };
    case 'leaf':
      return { width: 8, height: 17, backgroundColor: colour, ...radiusStyle([8, 1, 8, 1]) };
    case 'spark':
      return { width: 3, height: 13, borderRadius: 1.5, backgroundColor: colour };
    case 'diamond':
      return { width: 9, height: 9, backgroundColor: colour };
    case 'ring':
      return { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: colour };
    case 'line':
      return { width: 2, height: 20, backgroundColor: colour };
    default:
      return { width: 8, height: 8, borderRadius: 4, backgroundColor: colour };
  }
}

function Piece({
  index,
  count,
  progress,
  colour,
}: {
  index: number;
  count: number;
  progress: SharedValue<number>;
  colour: string;
}) {
  const world = useWorld();
  const style = momentOf(world.id);
  const angle = (index / count) * Math.PI * 2 + seed(index, 1) * 0.6;
  const reach = style.spread * (0.55 + 0.45 * seed(index, 2));
  const turn = (seed(index, 3) - 0.5) * 720;
  const ring = style.shape === 'ring';
  const radial = style.shape === 'spark' || style.shape === 'line';
  const baseDeg = (angle * 180) / Math.PI + 90;
  const delay = ring ? index / count : 0;
  const move = useAnimatedStyle(() => {
    const raw = progress.get();
    const p = ring ? Math.max(0, Math.min(1, (raw - delay * 0.5) / 0.5)) : raw;
    const out = 1 - (1 - p) * (1 - p);
    const x = ring ? Math.cos(angle) * reach * 0.3 : Math.cos(angle) * reach * out;
    const y = ring
      ? Math.sin(angle) * reach * 0.3
      : Math.sin(angle) * reach * out + style.fall * p * p;
    const fade = p < 0.65 ? 1 : Math.max(0, (1 - p) / 0.35);
    const rotate = radial ? baseDeg : style.spin ? turn * p : style.shape === 'diamond' ? 45 : 0;
    return {
      opacity: fade,
      transform: [
        { translateX: x },
        { translateY: y },
        { rotate: `${rotate}deg` },
        { scale: ring ? 0.3 + out * 1.6 : 1 },
      ],
    };
  });
  return <Animated.View style={[styles.piece, shapeStyle(style.shape, colour), move]} />;
}

function Play({ moment }: { moment: Moment }) {
  const world = useWorld();
  const t = world.tokens;
  const stage = useStage();
  const level = useVisualCapabilities().experience.celebration;
  const m = useWorldMotion();
  const feedback = useFeedback();
  const style = momentOf(world.id);
  const count = m.animates ? momentPieces(level, stage.tier) : 0;
  const progress = useSharedValue(0);
  const chip = useSharedValue(m.animates ? 0 : 1);

  useEffect(() => {
    feedback('success');
    if (moment.message) AccessibilityInfo.announceForAccessibility(moment.message);
    progress.set(0);
    progress.set(withTiming(1, { duration: MOMENT_MS, easing: Easing.linear }));
    if (m.animates) chip.set(withTiming(1, m.timing()));
    const done = setTimeout(() => finish(moment.id), MOMENT_MS + (moment.message ? 900 : 0));
    return () => clearTimeout(done);
  }, [moment.id, moment.message, feedback, progress, chip, m]);

  const chipStyle = useAnimatedStyle(() => ({
    opacity: chip.get(),
    transform: [{ translateY: (1 - chip.get()) * 10 }, { scale: 0.96 + chip.get() * 0.04 }],
  }));
  const colours = useMemo(
    () => style.colours.map((k) => t[k as keyof WorldTokens] as string),
    [style.colours, t],
  );
  const raised = world.recipes.surface.raised;

  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={styles.layer}
    >
      <View style={styles.origin}>
        {Array.from({ length: count }, (_, i) => (
          <Piece
            // biome-ignore lint/suspicious/noArrayIndexKey: pieces are fixed by position
            key={i}
            index={i}
            count={count}
            progress={progress}
            colour={colours[i % colours.length] ?? t.lamp}
          />
        ))}
      </View>
      {moment.message ? (
        <Animated.View
          style={[
            styles.chip,
            { backgroundColor: raised.fill ?? t.raised, borderColor: t.line },
            radiusStyle(world.definition.style.corner.chip),
            shadowStyle(raised.shadow),
            chipStyle,
          ]}
        >
          <Text kind="label">{moment.message}</Text>
        </Animated.View>
      ) : null}
    </View>
  );
}

/** Mount once, over the stage. Renders nothing between moments. */
export function WorldMomentHost() {
  const moment = useSyncExternalStore(subscribe, read, read);
  return moment ? <Play key={moment.id} moment={moment} /> : null;
}

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    zIndex: 900,
  },
  origin: { position: 'absolute', top: '38%', left: '50%', width: 0, height: 0 },
  piece: { position: 'absolute' },
  chip: {
    position: 'absolute',
    top: '46%',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
