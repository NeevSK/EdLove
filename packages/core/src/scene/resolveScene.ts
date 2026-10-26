import type { GurudeviExperience } from '../verger/experience';
import {
  type Celestial,
  celestialAt,
  clampMinute,
  contrastRatio,
  isDarkPhase,
  isPoya,
  mixHex,
  moonPhaseAt,
  phaseOfMinute,
  type ScenePhase,
  type SceneSeason,
  type SceneWeather,
  type SkyPalette,
  seasonOfMonth,
  skyPaletteAt,
  WEATHER,
} from './sky';

/**
 * One answer to "what does the app look like right now", for every painter. The world is the
 * skin, the room is the view, and the hour, season and weather are the light; verger's
 * experience decides how much of it may move (docs/Core/design/2026-10-26-world-model.md).
 * Pure: no clocks, no platform, so web, mobile and explore resolve the same scene.
 */

export type SceneRoom = 'self' | 'classroom' | 'community' | 'library' | 'profile';
export type SceneView = 'veranda' | 'school' | 'ambalama' | 'temple-library' | 'hilltop';
/** Whether the view follows the room (default), the world, or stays one scene everywhere. */
export type SceneFollows = 'room' | 'world' | 'one';
/** How much of the scene a screen allows: a room's home, a working screen, or a focused one. */
export type ScenePresence = 'full' | 'band' | 'quiet';
export type SceneGround =
  | { readonly kind: 'sky' }
  | { readonly kind: 'solid'; readonly colour: string }
  | { readonly kind: 'plain' };
export type SceneTier = 'rich' | 'balanced' | 'essential';
export type SceneSurface = 'paper' | 'frost';
/** What paints the back layer: the scene, one solid colour, or nothing (the world's own ground). */
export type ScenePaint = 'scene' | 'colour' | 'none';

/** The part of verger's experience the scene reads. */
export type SceneBudget = Pick<GurudeviExperience, 'quality' | 'effectiveFidelity'> & {
  readonly experience: Pick<
    GurudeviExperience['experience'],
    'motion' | 'visualEffects' | 'celebration'
  >;
};

export interface SceneWorld {
  readonly id: string;
  /** The world's glow, which warms the sky a little. */
  readonly glow: string;
}

export interface SceneInput {
  /** The Now clock: drives the sky, the season and the moon. */
  readonly now: Date;
  /** A pinned minute after midnight (a pinned phase, or play the day); the clock's otherwise. */
  readonly minute?: number | null;
  readonly season?: SceneSeason | null;
  /** The sky from a coarse forecast or the person; unknown reads as clear. */
  readonly weather?: SceneWeather | null;
  readonly world: SceneWorld;
  readonly room: SceneRoom;
  readonly follows?: SceneFollows;
  readonly presence: ScenePresence;
  readonly ground?: SceneGround;
  readonly surface?: SceneSurface;
  readonly budget: SceneBudget;
  /** Whether the screen is on show (verger's visibility); a hidden scene never moves. */
  readonly visible?: boolean;
}

export interface SceneParticles {
  readonly rain: number;
  readonly fireflies: number;
  readonly stars: number;
  readonly lightning: boolean;
  readonly mist: boolean;
}

export interface Scene {
  readonly minute: number;
  readonly phase: ScenePhase;
  readonly dark: boolean;
  readonly season: SceneSeason;
  readonly weather: SceneWeather;
  readonly moonPhase: number;
  readonly poya: boolean;
  readonly room: SceneRoom;
  readonly view: SceneView;
  readonly presence: ScenePresence;
  readonly paint: ScenePaint;
  /** The solid colour when `paint` is `colour`. */
  readonly colour: string | null;
  readonly tier: SceneTier;
  /** The sky's colours when `paint` is `scene`. */
  readonly palette: SkyPalette | null;
  readonly celestial: Celestial;
  /** Frames a second for the moving layer: 0 means the scene holds still. */
  readonly fps: 0 | 15 | 30;
  /** How often the still layers repaint, or null when nothing is painted. */
  readonly repaintEveryMs: number | null;
  readonly particles: SceneParticles;
  /** The card material over the scene; frost falls back to paper when the budget is short. */
  readonly surface: SceneSurface;
  /** Text colour for words written straight on the backdrop (greetings, headers); null means the world's own ink. */
  readonly skyInk: string | null;
  /** Room-change crossfade. */
  readonly transitionMs: number;
}

export const ROOM_VIEW: Readonly<Record<SceneRoom, SceneView>> = {
  self: 'veranda',
  classroom: 'school',
  community: 'ambalama',
  library: 'temple-library',
  profile: 'hilltop',
};

/** Each world's home view, for "the scene follows the world" (first sketch). */
const WORLD_VIEW: Readonly<Record<string, SceneView>> = {
  sanctuary: 'school',
  kandyan: 'temple-library',
  wewa: 'ambalama',
  kele: 'veranda',
  angampora: 'hilltop',
  ratna: 'veranda',
};

const ONE_SCENE: SceneView = 'school';
const STILL_REPAINT_MS = 60_000;
const SKY_INK_DARK = '#1E1A14';
const SKY_INK_LIGHT = '#FBF6EA';
const NO_PARTICLES: SceneParticles = {
  rain: 0,
  fireflies: 0,
  stars: 0,
  lightning: false,
  mist: false,
};

/** The room a route belongs to; anything unknown is the classroom, the app's working room. */
export function roomOfPath(pathname: string): SceneRoom {
  const path = pathname.replace(/^\/\([^)]*\)/, '');
  if (path.startsWith('/self')) return 'self';
  if (path.startsWith('/library')) return 'library';
  if (path.startsWith('/community')) return 'community';
  if (path.startsWith('/profile')) return 'profile';
  return 'classroom';
}

export function sceneTierOf(budget: SceneBudget): SceneTier {
  if (budget.quality === 'essential' || budget.effectiveFidelity === 'low') return 'essential';
  const motion = budget.experience.motion;
  return motion === 'rich' || motion === 'refined' ? 'rich' : 'balanced';
}

function viewOf(input: SceneInput): SceneView {
  const follows = input.follows ?? 'room';
  if (follows === 'one') return ONE_SCENE;
  if (follows === 'world') return WORLD_VIEW[input.world.id] ?? ONE_SCENE;
  return ROOM_VIEW[input.room];
}

function paintOf(input: SceneInput, tier: SceneTier): ScenePaint {
  if (input.presence === 'quiet') return 'none';
  const ground = input.ground ?? { kind: 'sky' };
  if (ground.kind === 'plain') return 'none';
  if (ground.kind === 'solid') return 'colour';
  return tier === 'essential' ? 'none' : 'scene';
}

function particleShare(celebration: SceneBudget['experience']['celebration']): number {
  if (celebration === 'rich') return 1;
  if (celebration === 'refined') return 0.5;
  return 0;
}

/** Dark or light ink, whichever reads better on a colour. */
export function inkOn(colour: string): string {
  return contrastRatio(SKY_INK_DARK, colour) >= contrastRatio(SKY_INK_LIGHT, colour)
    ? SKY_INK_DARK
    : SKY_INK_LIGHT;
}

/** The sky just behind the greeting: between the top and the horizon. */
export function behindGreeting(palette: SkyPalette): string {
  return mixHex(palette.top, palette.horizon, 0.45);
}

export function resolveScene(input: SceneInput): Scene {
  const minute = clampMinute(input.minute ?? input.now.getHours() * 60 + input.now.getMinutes());
  const phase = phaseOfMinute(minute);
  const season = input.season ?? seasonOfMonth(input.now.getMonth());
  const weather = input.weather ?? 'clear';
  const moonPhase = moonPhaseAt(input.now);
  const tier = sceneTierOf(input.budget);
  const paint = paintOf(input, tier);
  const palette =
    paint === 'scene' ? skyPaletteAt(minute, season, weather, input.world.glow) : null;
  const visible = input.visible ?? true;
  const motion = input.budget.experience.motion;
  const moving = paint === 'scene' && tier === 'rich' && visible;
  const band = input.presence === 'band';
  const fps: 0 | 15 | 30 = !moving ? 0 : motion === 'rich' && !band ? 30 : 15;

  const wx = WEATHER[weather];
  const share = moving ? particleShare(input.budget.experience.celebration) * (band ? 0.5 : 1) : 0;
  const night = phase === 'night' || phase === 'predawn';
  const evening = phase === 'dusk' || phase === 'night';
  const particles: SceneParticles =
    paint !== 'scene'
      ? NO_PARTICLES
      : {
          rain: Math.round(wx.rain * share),
          fireflies: evening && wx.rain === 0 && !band ? Math.round(12 * share) : 0,
          // Stars are painted into the still layer, so they show even when nothing moves.
          stars: night && wx.cloud < 0.7 ? (band ? 20 : 40) : 0,
          lightning: wx.lightning && fps === 30,
          mist: wx.mist,
        };

  const frostAllowed = paint === 'scene' && input.budget.experience.visualEffects !== 'essential';
  const ground = input.ground ?? { kind: 'sky' };
  const colour = paint === 'colour' && ground.kind === 'solid' ? ground.colour : null;
  return {
    minute,
    phase,
    dark: isDarkPhase(phase),
    season,
    weather,
    moonPhase,
    poya: isPoya(moonPhase),
    room: input.room,
    view: viewOf(input),
    presence: input.presence,
    paint,
    colour,
    tier,
    palette,
    celestial: celestialAt(minute),
    fps,
    repaintEveryMs: paint === 'scene' ? STILL_REPAINT_MS : null,
    particles,
    surface: input.surface === 'frost' && frostAllowed ? 'frost' : 'paper',
    skyInk: palette ? inkOn(behindGreeting(palette)) : colour ? inkOn(colour) : null,
    transitionMs: motion === 'off' ? 0 : motion === 'essential' ? 120 : 320,
  };
}
