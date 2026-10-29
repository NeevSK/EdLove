/**
 * How the active world moves, at the level verger allows.
 *
 * A world's `WorldMotion` is its personality: Wewa is slow and settles like
 * water, Angampora strikes and stops, Spark snaps in sideways with a small
 * overshoot. Verger decides how much of that a phone (and the person) can
 * have; reduce motion in the OS already lowers verger's motion level.
 *
 *   rich       the world's full character
 *   refined    shorter travel, no overshoot, half the stagger
 *   essential  fades only, at the base tempo: nothing travels or bounces
 *   off        no animation at all
 *
 * Rules (docs/Core/design/2026-10-26-world-model.md, "Motion follows the
 * world"): durations stay within 120–600 ms (micro 80–300), only transform and
 * opacity animate, nothing eases in, and motion never carries meaning alone.
 */

import type { ExperienceLevel } from '@repo/core/verger';
import { duration as BASE } from '../components/motion';
import type { WorldMotion } from './types';

export type Bezier = readonly [number, number, number, number];

/** Curves per family. Strong ease-out for entrances, in-out for moving on screen. */
export const CURVES: Readonly<Record<Exclude<WorldMotion['curve'], 'spring'>, Bezier>> = {
  decelerate: [0.23, 1, 0.32, 1],
  standard: [0.77, 0, 0.175, 1],
  sharp: [0.16, 1, 0.3, 1],
};

export interface WorldSpring {
  damping: number;
  stiffness: number;
  mass: number;
}

export interface ResolvedMotion {
  level: ExperienceLevel;
  /** Whether anything animates at all. */
  animates: boolean;
  duration: { micro: number; transition: number; meaningful: number; breathe: number };
  /** Timing curve for timed animations (springs use `spring`). */
  easing: Bezier;
  /** Spring for entrances that settle, or null to use timing with `easing`. */
  spring: WorldSpring | null;
  /** Where an entering element starts, relative to its resting place, in dp. */
  from: { x: number; y: number };
  /** Delay between items entering together, in ms. */
  stagger: number;
  /** Press scale for buttons and cards (1 means none). */
  press: number;
  haptic: WorldMotion['haptic'];
}

const clamp = (v: number, lo: number, hi: number) => Math.round(Math.min(hi, Math.max(lo, v)));

function durationsAt(tempo: number): ResolvedMotion['duration'] {
  return {
    micro: clamp(BASE.micro * tempo, 80, 300),
    transition: clamp(BASE.transition * tempo, 120, 600),
    meaningful: clamp(BASE.meaningful * tempo, 120, 600),
    breathe: clamp(BASE.breathe * tempo, 2400, 6000),
  };
}

/**
 * Springs feel the world's tempo through stiffness (slower worlds are softer).
 * Overshoot keeps a small bounce (about 0.2); eased comes to rest without one.
 */
function springOf(settle: WorldMotion['settle'], tempo: number): WorldSpring | null {
  if (settle === 'none') return null;
  const stiffness = Math.round(200 / (tempo * tempo));
  const critical = 2 * Math.sqrt(stiffness);
  return {
    damping: Math.round(critical * (settle === 'overshoot' ? 0.62 : 1)),
    stiffness,
    mass: 1,
  };
}

function fromOf(axis: WorldMotion['axis'], travel: number): ResolvedMotion['from'] {
  if (axis === 'up') return { x: 0, y: travel };
  if (axis === 'side') return { x: travel, y: 0 };
  return { x: 0, y: 0 };
}

const STILL: Omit<ResolvedMotion, 'level' | 'haptic'> = {
  animates: false,
  duration: { micro: 0, transition: 0, meaningful: 0, breathe: 0 },
  easing: CURVES.decelerate,
  spring: null,
  from: { x: 0, y: 0 },
  stagger: 0,
  press: 1,
};

/** The world's motion as verger allows it. Pure: the same inputs give the same tokens. */
export function resolveMotion(m: WorldMotion, level: ExperienceLevel): ResolvedMotion {
  if (level === 'off') return { ...STILL, level, haptic: m.haptic };

  const easing = m.curve === 'spring' ? CURVES.decelerate : CURVES[m.curve];
  if (level === 'essential') {
    return {
      ...STILL,
      level,
      animates: true,
      duration: durationsAt(1),
      easing,
      press: 0.98,
      haptic: m.haptic,
    };
  }

  const rich = level === 'rich';
  // A spring world without its own settle still rests on a spring.
  const settle = m.curve === 'spring' && m.settle === 'none' ? 'eased' : m.settle;
  return {
    level,
    animates: true,
    duration: durationsAt(m.tempo),
    easing,
    spring: springOf(rich || settle === 'none' ? settle : 'eased', m.tempo),
    from: fromOf(m.axis, rich ? m.travel : Math.round(m.travel * 0.6)),
    stagger: rich ? m.stagger : Math.round(m.stagger / 2),
    press: m.haptic === 'crisp' ? 0.96 : 0.97,
    haptic: m.haptic,
  };
}
