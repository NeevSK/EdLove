/**
 * The stage: one answer to "what can this phone afford right now", for the floor, the kit and the
 * shell alike. The world is the mother (how things look); verger is the father (how much of it
 * the phone can carry). Every visual-level or performance choice the person makes goes into
 * verger first (fidelity, reduced motion, power cut, data saver), and comes out here as one tier.
 * Nothing below this decides on its own. Pure: no React, no platform.
 *
 * Tiers, richest first:
 * - `rich`: full living scene, 30 fps life, shaders, every particle.
 * - `middle`: full scene drawn once, life at 15 fps, half the particles, paused while scrolling.
 * - `floor`: the scene drawn once without its finest layers; life is two or three soft overlays
 *   moved by native transforms, never a frame loop. Still alive, almost free.
 * - `bare`: the world's ground tinted by the hour; nothing moves (reduced motion, power cut).
 */

import type { GurudeviExperience } from '@repo/core/verger';

export type StageTier = 'rich' | 'middle' | 'floor' | 'bare';

/** Tiers in order, richest first; an index says how rich a tier is. */
export const STAGE_TIERS: readonly StageTier[] = ['rich', 'middle', 'floor', 'bare'];

/** The parts of verger's experience the stage reads. */
export type StageBudget = Pick<GurudeviExperience, 'quality' | 'effectiveFidelity'> & {
  readonly experience: Pick<
    GurudeviExperience['experience'],
    'motion' | 'visualEffects' | 'celebration'
  >;
};

export interface Stage {
  readonly tier: StageTier;
  /** Frames a second for the floor's moving layer; 0 holds it still. */
  readonly fps: 0 | 15 | 30;
  /** Share of each world's particles that may fly (0 to 1). */
  readonly particles: number;
  /** Skia shaders (water, mist, light) may run. */
  readonly shaders: boolean;
  /** Soft overlays moved by native transforms (the floor tier's life). */
  readonly overlays: boolean;
  /** Raised surfaces keep their wash and tinted shadow; flat fill and an edge otherwise. */
  readonly richSurfaces: boolean;
  /** Presses scale with the world's spring; colour only otherwise. */
  readonly pressScale: boolean;
  /** Screen and sheet entrances: the world's own motion, a short fade, or none. */
  readonly transition: 'world' | 'fade' | 'none';
  /** The floor may show through the header as a washed band. */
  readonly headerBand: boolean;
  /** How a world's moments (success, streaks) are drawn. */
  readonly moments: 'full' | 'small' | 'toast';
}

const STAGES: Readonly<Record<StageTier, Stage>> = {
  rich: {
    tier: 'rich',
    fps: 30,
    particles: 1,
    shaders: true,
    overlays: true,
    richSurfaces: true,
    pressScale: true,
    transition: 'world',
    headerBand: true,
    moments: 'full',
  },
  middle: {
    tier: 'middle',
    fps: 15,
    particles: 0.5,
    shaders: true,
    overlays: true,
    richSurfaces: true,
    pressScale: true,
    transition: 'world',
    headerBand: true,
    moments: 'small',
  },
  floor: {
    tier: 'floor',
    fps: 0,
    particles: 0,
    shaders: false,
    overlays: true,
    richSurfaces: false,
    pressScale: false,
    transition: 'fade',
    headerBand: false,
    moments: 'toast',
  },
  bare: {
    tier: 'bare',
    fps: 0,
    particles: 0,
    shaders: false,
    overlays: false,
    richSurfaces: false,
    pressScale: false,
    transition: 'none',
    headerBand: false,
    moments: 'toast',
  },
};

/** The tier verger's experience allows. */
export function stageTierOf(budget: StageBudget): StageTier {
  const motion = budget.experience.motion;
  if (motion === 'off') return 'bare';
  if (budget.quality === 'essential' || budget.effectiveFidelity === 'low') return 'floor';
  if (budget.quality === 'full' && motion === 'rich') return 'rich';
  return 'middle';
}

/** The stage for a tier, optionally capped (a preview, a screen that asks for less). */
export function stageOf(budget: StageBudget, cap?: StageTier): Stage {
  const allowed = stageTierOf(budget);
  const tier =
    cap && STAGE_TIERS.indexOf(cap) > STAGE_TIERS.indexOf(allowed) ? cap : allowed;
  return STAGES[tier];
}

/** The stage of a named tier (tests, the on-phone stage panel). */
export function stageNamed(tier: StageTier): Stage {
  return STAGES[tier];
}

/** Whether `tier` is at least as rich as `floor`. */
export function atLeast(tier: StageTier, floor: StageTier): boolean {
  return STAGE_TIERS.indexOf(tier) <= STAGE_TIERS.indexOf(floor);
}
