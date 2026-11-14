import { type ReactNode, useCallback, useEffect, useMemo } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useVisualCapabilities } from '../../context/VisualCapabilities';
import type { HapticImpact } from '../../utils/haptics';
import { type ResolvedMotion, resolveMotion } from '../motion';
import { useWorld } from './WorldContext';

export interface WorldMotionTokens extends ResolvedMotion {
  /** A Reanimated timing config on the world's curve. */
  timing: (length?: keyof ResolvedMotion['duration']) => {
    duration: number;
    easing: ReturnType<typeof Easing.bezier>;
  };
  /** The impact a press makes in this world. */
  impact: HapticImpact;
}

/** The active world's motion, calmed to the level verger allows for motion. */
export function useWorldMotion(): WorldMotionTokens {
  const world = useWorld();
  const level = useVisualCapabilities().experience.motion;
  const motion = world.definition.motion;

  return useMemo(() => {
    const m = resolveMotion(motion, level);
    const curve = Easing.bezier(...m.easing);
    return {
      ...m,
      timing: (length = 'transition') => ({ duration: m.duration[length], easing: curve }),
      impact: m.haptic === 'crisp' ? 'medium' : 'light',
    };
  }, [motion, level]);
}

export interface WorldEnterProps {
  children: ReactNode;
  /** Position among siblings entering together; each waits one stagger more. */
  index?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Brings its children in the way the world moves: Wewa rises slowly, Colombo
 * slides from the side and stops, Spark snaps in with a small overshoot. At
 * the essential level it only fades; when motion is off it simply appears.
 */
export function WorldEnter({ children, index = 0, style }: WorldEnterProps) {
  const m = useWorldMotion();
  const progress = useSharedValue(m.animates ? 0 : 1);

  useEffect(() => {
    if (!m.animates) {
      progress.set(1);
      return;
    }
    const delay = index * m.stagger;
    const to = m.spring ? withSpring(1, m.spring) : withTiming(1, m.timing());
    progress.set(delay > 0 ? withDelay(delay, to) : to);
  }, [m, index, progress]);

  const { x, y } = m.from;
  const animated = useAnimatedStyle(() => {
    const rest = 1 - progress.value;
    return {
      // Opacity never overshoots, even when the position does.
      opacity: Math.min(1, progress.value),
      transform: [{ translateX: x * rest }, { translateY: y * rest }],
    };
  });

  return <Animated.View style={[style, animated]}>{children}</Animated.View>;
}

/**
 * The world's press: controls shrink to its press scale and settle back on its
 * spring (or its timing curve when it has none). Nothing moves when the world's
 * motion level is off. Spread `pressIn`/`pressOut` onto a Pressable and put
 * `style` on the Animated.View that wraps it.
 */
export function usePressMotion() {
  const m = useWorldMotion();
  const material = useWorld().recipes.material;
  const scale = useSharedValue(1);
  const lift = useSharedValue(0);
  const to = useCallback(
    (pressed: boolean) => {
      if (!m.animates) return;
      // Living light: the fill brightens from within while held.
      lift.set(
        withTiming(pressed ? material.states.press.lift : 0, { duration: material.responseMs }),
      );
      if (m.press >= 1) return;
      const value = pressed ? m.press : 1;
      scale.set(m.spring ? withSpring(value, m.spring) : withTiming(value, m.timing('micro')));
    },
    [m, material, scale, lift],
  );
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));
  /** For a non-interactive layer filling the control, coloured `light.color`. */
  const glow = useAnimatedStyle(() => ({ opacity: lift.get() }));
  return {
    style,
    light: { style: glow, color: material.states.press.glow },
    pressIn: () => to(true),
    pressOut: () => to(false),
  };
}

/** How far a shake travels, in dp, and how many times it turns. */
const SHAKE = { distance: 6, turns: 3 } as const;

/**
 * The error motion from the feedback grammar: a short sideways shake, so a
 * failure is noticed without relying on colour. Still when motion is off.
 */
export function useShake() {
  const m = useWorldMotion();
  const x = useSharedValue(0);
  const shake = useCallback(() => {
    if (!m.animates) return;
    const leg = Math.max(40, Math.round(m.duration.micro / 3));
    const steps = Array.from({ length: SHAKE.turns * 2 }, (_, i) =>
      withTiming((i % 2 === 0 ? 1 : -1) * SHAKE.distance * (1 - i / (SHAKE.turns * 2)), {
        duration: leg,
      }),
    );
    x.set(withSequence(...steps, withTiming(0, { duration: leg })));
  }, [m, x]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateX: x.get() }] }));
  return { style, shake };
}

/** Style keys whose colours living light may move. */
export type LivingColorKey =
  | 'backgroundColor'
  | 'borderColor'
  | 'borderBottomColor'
  | 'shadowColor'
  | 'color';

/**
 * Living light: colours glide to their new state instead of snapping (an edge
 * warms on focus, a fill brightens on press, an error edge flares). Pass the
 * colours the recipe gives for the current state; the move takes the world's
 * `material.responseMs` on the UI thread. Still when motion is off.
 */
export function useLivingStyle(colors: Partial<Record<LivingColorKey, string>>) {
  const m = useWorldMotion();
  const ms = useWorld().recipes.material.responseMs;
  const from = useSharedValue(colors);
  const to = useSharedValue(colors);
  const progress = useSharedValue(1);
  // Callers pass a fresh object each render; the JSON is its identity.
  const signature = JSON.stringify(colors);
  useEffect(() => {
    from.set(to.get());
    to.set(JSON.parse(signature) as Partial<Record<LivingColorKey, string>>);
    if (!m.animates) {
      progress.set(1);
      return;
    }
    progress.set(0);
    progress.set(withTiming(1, { duration: ms, easing: m.timing().easing }));
  }, [signature, m, ms, from, to, progress]);
  return useAnimatedStyle(() => {
    const out: Partial<Record<LivingColorKey, string>> = {};
    const target = to.get();
    const start = from.get();
    for (const key of Object.keys(target) as LivingColorKey[]) {
      const end = target[key];
      if (end === undefined) continue;
      out[key] = interpolateColor(progress.get(), [0, 1], [start[key] ?? end, end]);
    }
    return out;
  });
}
