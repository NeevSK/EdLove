/**
 * Each world's sign for "wait a moment", drawn from its own ornament
 * (docs/Core/design/2026-10-26-world-model.md, "Nothing is outside the world").
 *
 * One looping value drives every sign, so a sign costs a few views and one
 * animation on the UI thread. The loop runs at the world's tempo. When verger
 * calms motion to essential the sign only breathes; when motion is off it rests
 * in a pose that still reads as waiting.
 */

import { type ReactNode, useEffect } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useVisualCapabilities } from '../../context/VisualCapabilities';
import type { WorldId, WorldTokens } from '../types';
import { useWorld } from './WorldContext';

export type SignKind =
  | 'flame'
  | 'ripple'
  | 'glint'
  | 'leaf'
  | 'rows'
  | 'band'
  | 'lamp'
  | 'beat'
  | 'petal'
  | 'signal'
  | 'charge';

export const SIGNS: Readonly<Record<WorldId, SignKind>> = {
  sanctuary: 'flame',
  wewa: 'ripple',
  ratna: 'glint',
  kele: 'leaf',
  tea: 'rows',
  kandyan: 'band',
  angampora: 'lamp',
  perahera: 'beat',
  rosa: 'petal',
  colombo: 'signal',
  spark: 'charge',
};

/** One loop of each sign at tempo 1, in ms. */
const CYCLE: Readonly<Record<SignKind, number>> = {
  flame: 2400,
  ripple: 2400,
  glint: 2000,
  leaf: 2800,
  rows: 1800,
  band: 2200,
  lamp: 2000,
  beat: 1200,
  petal: 2600,
  signal: 1400,
  charge: 1600,
};

/** Where each sign rests when it cannot move: a pose that still says "waiting". */
const REST: Readonly<Record<SignKind, number>> = {
  flame: 0.25,
  ripple: 0.35,
  glint: 0.5,
  leaf: 0,
  rows: 0.55,
  band: 0.4,
  lamp: 0.45,
  beat: 0.1,
  petal: 0.3,
  signal: 0.2,
  charge: 0.5,
};

interface Part {
  p: SharedValue<number>;
  s: number;
  t: WorldTokens;
}

/** A smooth 0 → 1 → 0 over one loop, offset by `phase`. */
function wave(p: number, phase = 0): number {
  'worklet';
  return 0.5 - 0.5 * Math.cos(2 * Math.PI * (p + phase));
}

/** Position within one loop, offset by `phase`, wrapped to 0–1. */
function at(p: number, phase: number): number {
  'worklet';
  const v = p + phase;
  return v - Math.floor(v);
}

function Flame({ p, s, t }: Part) {
  const glow = useAnimatedStyle(() => ({ opacity: 0.18 + 0.3 * wave(p.value) }));
  const flame = useAnimatedStyle(() => ({
    transform: [{ scaleY: 0.92 + 0.12 * wave(p.value) }, { rotate: '45deg' }],
  }));
  const d = s * 0.36;
  return (
    <>
      <Animated.View
        style={[circle(s * 0.8), { position: 'absolute', backgroundColor: t.glow }, glow]}
      />
      <Animated.View
        style={[
          {
            width: d,
            height: d,
            marginTop: s * 0.08,
            backgroundColor: t.lamp,
            borderTopLeftRadius: 0,
            borderTopRightRadius: d / 2,
            borderBottomRightRadius: d / 2,
            borderBottomLeftRadius: d / 2,
            transformOrigin: 'center',
          },
          flame,
        ]}
      />
    </>
  );
}

function Ring({ p, s, t, phase }: Part & { phase: number }) {
  const style = useAnimatedStyle(() => {
    const v = at(p.value, phase);
    return { opacity: 0.85 * (1 - v), transform: [{ scale: 0.25 + 0.75 * v }] };
  });
  return (
    <Animated.View
      style={[
        circle(s),
        { position: 'absolute', borderWidth: 1.5, borderColor: t.ornament },
        style,
      ]}
    />
  );
}

function Ripple(part: Part) {
  return (
    <>
      <Ring {...part} phase={0} />
      <Ring {...part} phase={0.5} />
      <View style={[circle(part.s * 0.14), { backgroundColor: part.t.lamp }]} />
    </>
  );
}

function Glint({ p, s, t }: Part) {
  const d = s * 0.6;
  const sweep = useAnimatedStyle(() => ({
    transform: [{ translateX: (p.value * 2 - 1) * d }, { rotate: '-45deg' }],
    opacity: wave(p.value),
  }));
  return (
    <View
      style={{
        width: d,
        height: d,
        borderWidth: 1.5,
        borderColor: t.ornament,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ rotate: '45deg' }],
      }}
    >
      <View style={{ width: d * 0.34, height: d * 0.34, backgroundColor: t.lamp, opacity: 0.85 }} />
      <Animated.View
        style={[
          { position: 'absolute', width: 3, height: d * 1.6, backgroundColor: t.glow },
          sweep,
        ]}
      />
    </View>
  );
}

function Leaf({ p, s, t }: Part) {
  const d = s * 0.5;
  const sway = useAnimatedStyle(() => {
    const v = Math.sin(2 * Math.PI * p.value);
    return { transform: [{ translateY: v * s * 0.04 }, { rotate: `${-45 + v * 18}deg` }] };
  });
  return (
    <Animated.View
      style={[
        {
          width: d,
          height: d,
          backgroundColor: t.lamp,
          borderTopLeftRadius: d,
          borderBottomRightRadius: d,
          borderWidth: 1.5,
          borderColor: t.ornament,
        },
        sway,
      ]}
    />
  );
}

function Bar({ p, s, t, index, count }: Part & { index: number; count: number }) {
  const fill = useAnimatedStyle(() => {
    // Each row fills in its share of the loop, then all fade together at the end.
    const start = index / (count + 1);
    const v = Math.min(1, Math.max(0, (p.value - start) * (count + 1)));
    return { transform: [{ scaleX: v }], opacity: p.value > 0.9 ? (1 - p.value) * 10 : 1 };
  });
  return (
    <View
      style={{
        width: s * (0.8 - index * 0.12),
        height: 3,
        backgroundColor: t.line,
        borderRadius: 2,
      }}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: t.lamp, borderRadius: 2, transformOrigin: 'left center' },
          fill,
        ]}
      />
    </View>
  );
}

function Rows(part: Part) {
  return (
    <View style={{ gap: part.s * 0.12, alignItems: 'center' }}>
      {[0, 1, 2].map((i) => (
        <Bar key={i} {...part} index={i} count={3} />
      ))}
    </View>
  );
}

function Rule({ p, s, t, phase }: Part & { phase: number }) {
  const draw = useAnimatedStyle(() => {
    const v = at(p.value, phase);
    return { transform: [{ scaleX: Math.min(1, v * 1.6) }], opacity: v > 0.8 ? (1 - v) * 5 : 1 };
  });
  return (
    <Animated.View
      style={[
        { width: s * 0.9, height: 2, backgroundColor: t.ornament, transformOrigin: 'left center' },
        draw,
      ]}
    />
  );
}

function Band(part: Part) {
  const d = part.s * 0.16;
  return (
    <View style={{ alignItems: 'center', gap: part.s * 0.14 }}>
      <Rule {...part} phase={0} />
      <View
        style={{
          width: d,
          height: d,
          backgroundColor: part.t.lamp,
          transform: [{ rotate: '45deg' }],
        }}
      />
      <Rule {...part} phase={0.1} />
    </View>
  );
}

function Lamp({ p, s, t }: Part) {
  // The flame lights quickly, holds, then dims: a lamp being lit, not a pulse.
  const flame = useAnimatedStyle(() => {
    const v = p.value < 0.25 ? p.value * 4 : p.value > 0.8 ? (1 - p.value) * 5 : 1;
    return { opacity: 0.25 + 0.75 * v, transform: [{ scale: 0.7 + 0.3 * v }] };
  });
  return (
    <View style={{ alignItems: 'center' }}>
      <Animated.View style={[circle(s * 0.26), { backgroundColor: t.lamp }, flame]} />
      <View style={{ width: s * 0.12, height: s * 0.14, backgroundColor: t.ornament }} />
      <View style={{ width: s * 0.56, height: s * 0.08, backgroundColor: t.ornament }} />
    </View>
  );
}

function Dot({
  p,
  s,
  color,
  phase,
  square,
}: Part & { phase: number; color: string; square?: boolean }) {
  const beat = useAnimatedStyle(() => {
    // A struck beat: fast up, slower down.
    const v = at(p.value, phase);
    const hit = v < 0.15 ? v / 0.15 : Math.max(0, 1 - (v - 0.15) / 0.45);
    return { opacity: 0.35 + 0.65 * hit, transform: [{ scale: 0.8 + 0.35 * hit }] };
  });
  const d = s * 0.18;
  return (
    <Animated.View
      style={[
        { width: d, height: d, borderRadius: square ? 2 : d / 2, backgroundColor: color },
        beat,
      ]}
    />
  );
}

function Beat(part: Part) {
  const colors = [part.t.lamp, part.t.ornament, part.t.lamp];
  return (
    <View style={{ flexDirection: 'row', gap: part.s * 0.1, alignItems: 'center' }}>
      {colors.map((c, i) => (
        <Dot key={i} {...part} color={c} phase={-i / 3} />
      ))}
    </View>
  );
}

function Petal({ s, t, turn }: Omit<Part, 'p'> & { turn: number }) {
  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        { alignItems: 'center', transform: [{ rotate: `${turn}deg` }] },
      ]}
    >
      <View
        style={{
          width: s * 0.24,
          height: s * 0.4,
          marginTop: s * 0.06,
          borderRadius: s * 0.12,
          backgroundColor: t.lamp,
          opacity: 0.82,
        }}
      />
    </View>
  );
}

function Bloom({ p, s, t }: Part) {
  const open = useAnimatedStyle(() => {
    const v = wave(p.value);
    return { transform: [{ scale: 0.62 + 0.38 * v }, { rotate: `${v * 24}deg` }] };
  });
  return (
    <>
      <Animated.View style={[{ width: s, height: s }, open]}>
        {[0, 72, 144, 216, 288].map((turn) => (
          <Petal key={turn} s={s} t={t} turn={turn} />
        ))}
      </Animated.View>
      <View style={[circle(s * 0.16), { position: 'absolute', backgroundColor: t.ornament }]} />
    </>
  );
}

function Signal(part: Part) {
  return (
    <View style={{ flexDirection: 'row', gap: part.s * 0.08, alignItems: 'center' }}>
      {[0, 1, 2, 3].map((i) => (
        <Dot key={i} {...part} color={part.t.lamp} phase={-i / 4} square />
      ))}
    </View>
  );
}

function Segment({ p, t, index, w, h }: Omit<Part, 's'> & { index: number; w: number; h: number }) {
  const lit = useAnimatedStyle(() => ({
    opacity: p.value * 5 > index && p.value < 0.95 ? 1 : 0.12,
  }));
  return <Animated.View style={[{ width: w, height: h, backgroundColor: t.lamp }, lit]} />;
}

function Charge({ p, s, t }: Part) {
  const h = s * 0.3;
  const w = s * 0.13;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View
        style={{
          flexDirection: 'row',
          gap: 2,
          padding: 3,
          borderWidth: 1.5,
          borderColor: t.ink,
          borderTopRightRadius: 6,
          borderBottomLeftRadius: 6,
          transform: [{ skewX: '-12deg' }],
        }}
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <Segment key={i} p={p} t={t} index={i} w={w} h={h} />
        ))}
      </View>
      <View style={{ width: 3, height: h * 0.5, backgroundColor: t.ink, marginLeft: 1 }} />
    </View>
  );
}

const DRAW: Readonly<Record<SignKind, (part: Part) => ReactNode>> = {
  flame: Flame,
  ripple: Ripple,
  glint: Glint,
  leaf: Leaf,
  rows: Rows,
  band: Band,
  lamp: Lamp,
  beat: Beat,
  petal: Bloom,
  signal: Signal,
  charge: Charge,
};

function circle(d: number): ViewStyle {
  return { width: d, height: d, borderRadius: d / 2 };
}

export interface WaitingSignProps {
  /** Width and height in dp. */
  size?: number;
  /** Draw another world's sign (previews); defaults to the active world's. */
  kind?: SignKind;
  /** Hold still regardless of verger (a sign used as an illustration, not a loader). */
  still?: boolean;
}

/**
 * The world's waiting sign. Decorative: put the words ("Loading") on the
 * element around it, as `WorldLoading` does.
 */
export function WaitingSign({ size = 40, kind, still = false }: WaitingSignProps) {
  const world = useWorld();
  const level = useVisualCapabilities().experience.motion;
  const sign = kind ?? SIGNS[world.id];
  const moving = !still && (level === 'rich' || level === 'refined');
  const breathing = !still && level === 'essential';
  const cycle = Math.round(CYCLE[sign] * world.definition.motion.tempo);

  const p = useSharedValue(REST[sign]);
  const breath = useSharedValue(1);

  useEffect(() => {
    if (moving) {
      p.value = 0;
      p.value = withRepeat(withTiming(1, { duration: cycle, easing: Easing.linear }), -1, false);
    } else {
      p.value = REST[sign];
    }
    breath.value = breathing
      ? withRepeat(withTiming(0.5, { duration: 1200, easing: Easing.inOut(Easing.sin) }), -1, true)
      : 1;
    return () => {
      cancelAnimation(p);
      cancelAnimation(breath);
    };
  }, [moving, breathing, cycle, sign, p, breath]);

  const fade = useAnimatedStyle(() => ({ opacity: breath.value }));
  const Draw = DRAW[sign];

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, fade]}
      testID={`waiting-sign-${sign}`}
    >
      <Draw p={p} s={size} t={world.tokens} />
    </Animated.View>
  );
}
