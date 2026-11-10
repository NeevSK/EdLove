/**
 * Scene art: a world's floor as plain data. A builder turns (size, light, palette, world inks)
 * into layers of shapes with resolved colours, plus descriptions of what moves. Painters stay
 * dumb: Skia draws it on the phone (once, as a still picture, with a light moving layer on top),
 * the headless renderer draws it for review, tests read it. No React, no platform.
 */

import type { StageTier } from '../../stage';

export type Point = readonly [number, number];

/** A colour stop: colour (#RRGGBB or #RRGGBBAA) at a position 0 to 1. */
export type Stop = readonly [string, number];

export type ArtFill =
  | { readonly kind: 'solid'; readonly colour: string }
  | { readonly kind: 'linear'; readonly from: Point; readonly to: Point; readonly stops: readonly Stop[] }
  | { readonly kind: 'radial'; readonly centre: Point; readonly radius: number; readonly stops: readonly Stop[] };

export interface ArtStroke {
  readonly colour: string;
  readonly width: number;
  readonly cap?: 'round' | 'butt';
}

export interface ArtShape {
  /** SVG path data, in the art's own pixels. */
  readonly d: string;
  readonly fill?: ArtFill;
  readonly stroke?: ArtStroke;
  /** Soft edge, in px (a Gaussian blur on the shape); keep it for mist and glow. */
  readonly blur?: number;
}

/**
 * How a layer moves in the richer tiers, as a transform of the whole layer around `origin`.
 * One sine each, so the painter needs only the clock.
 * - sway: rotate by `amount` degrees.
 * - drift: slide sideways by `amount` px and back.
 * - rise: slide up and down by `amount` px.
 * - breathe: scale by 1 ± `amount`.
 * - glow: fade between 1 - `amount` and 1.
 */
export interface ArtMotion {
  readonly kind: 'sway' | 'drift' | 'rise' | 'breathe' | 'glow';
  readonly amount: number;
  readonly periodMs: number;
  /** Phase offset, 0 to 1 of a period, so neighbours don't move in step. */
  readonly offset?: number;
  readonly origin?: Point;
}

export interface ArtLayer {
  readonly id: string;
  readonly shapes: readonly ArtShape[];
  readonly motion?: ArtMotion;
  /** The poorest tier this layer is drawn at (fine detail leaves the floor tier). */
  readonly from?: StageTier;
  readonly opacity?: number;
}

export type ParticleKind =
  | 'firefly'
  | 'petal'
  | 'pollen'
  | 'spark'
  | 'ember'
  | 'leaf'
  | 'mote'
  | 'glint'
  | 'lantern'
  | 'drop';

/** Particles drawn by the moving layer; positions are a pure function of time. */
export interface ArtParticles {
  readonly kind: ParticleKind;
  /** Count at the rich tier; the stage scales it down. */
  readonly count: number;
  readonly colour: string;
  /** Radius in px, smallest to largest. */
  readonly size: readonly [number, number];
  /** The box they live in. */
  readonly area: { readonly x: number; readonly y: number; readonly width: number; readonly height: number };
  /** Travel per second in px (x, y); they wrap around the box. */
  readonly drift: Point;
  /** Side-to-side wander in px. */
  readonly wander: number;
  /** Fade in and out as they go (fireflies, glints). */
  readonly twinkle: boolean;
  /** A soft halo around each one, in px. */
  readonly halo?: number;
  readonly seed: number;
}

/**
 * The floor tier's life: a soft shape (a mist band, a glow) moved by native transforms on the UI
 * thread, so a floor phone's scene still breathes without a frame loop.
 */
export interface ArtOverlay {
  readonly id: string;
  readonly kind: 'band' | 'glow';
  /** Top-left and size of the overlay, in px. */
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly colour: string;
  /** Peak opacity (0 to 1). */
  readonly opacity: number;
  readonly motion: ArtMotion;
}

/** A shader that the rich and middle tiers may run over a region (water, mist, light). */
export interface ArtShader {
  readonly kind: 'water' | 'mist' | 'rays' | 'heat';
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly colour: string;
  readonly strength: number;
}

export interface SceneArt {
  readonly width: number;
  readonly height: number;
  /** Back to front. */
  readonly layers: readonly ArtLayer[];
  readonly particles: readonly ArtParticles[];
  readonly overlays: readonly ArtOverlay[];
  readonly shaders: readonly ArtShader[];
}
