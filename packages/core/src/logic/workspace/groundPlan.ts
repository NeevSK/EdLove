import type {
  SceneGroundMode,
  WorkspaceAppearance,
  WorkspaceAppearancePreset,
  WorkspaceWallpaper,
} from '@repo/core/types';
import type { GurudeviExperience } from '@repo/core/verger';
import { type WallpaperReading, wallpaperAllowed } from '@repo/core/verger';

/**
 * The floor engine's ground: one place that turns a saved look into what is drawn.
 *
 * A saved look is a set of choices (ground, photo, playback, tint, texture). Not every
 * combination makes sense (a tint with no photo shows nothing) and not every device can draw
 * every choice (verger stops photos on metered data and animated textures on low phones). Every
 * room, on web and phone, asks `planGround` once and draws the plan it gets back, and the Floor
 * Studio asks `groundControls` which settings to show. No room keeps its own copy of these rules.
 *
 * World = mother (the look and its limits), verger = father (what this device may spend).
 */

/** What the floor stands on, after the device has had its say. */
export type GroundSurface = 'live' | 'still' | 'photo' | 'paper';

export type GroundTexture = 'none' | 'washi-grain' | 'aurora-mesh' | 'celestial-embers';

export type GroundTint = Exclude<WorkspaceAppearancePreset, 'none'>;

/** What this device may spend on the ground, from verger. */
export interface GroundAllowance {
  /** Photos may load (not low tier, not power saver, not metered data, page visible). */
  photos: boolean;
  /** Ambient extras may run (embers, drifting aurora). */
  ambient: boolean;
  /** Blur may be used (the aurora is a large blur). */
  blur: boolean;
  /** Slow background movement may run. */
  subtleMotion: boolean;
}

/** Before verger is known (server render, first paint) nothing optional is spent. */
export const NOTHING_ALLOWED: GroundAllowance = {
  photos: false,
  ambient: false,
  blur: false,
  subtleMotion: false,
};

export function groundAllowanceOf(
  experience: Pick<
    GurudeviExperience,
    'effectiveFidelity' | 'allowAmbientEffects' | 'allowBlur' | 'allowSubtleAnimation'
  >,
  reading: WallpaperReading,
): GroundAllowance {
  return {
    photos: wallpaperAllowed(experience, reading),
    ambient: experience.allowAmbientEffects,
    blur: experience.allowBlur,
    subtleMotion: experience.allowSubtleAnimation,
  };
}

/** Why the plan differs from what was asked, so the studio can say so in words. */
export type GroundNote =
  | 'photos-paused'
  | 'no-photo'
  | 'texture-paused'
  | 'slideshow-needs-two'
  | 'slideshow-paused';

export interface GroundPlan {
  /** The ground the person chose. */
  asked: SceneGroundMode;
  /** The ground drawn. */
  surface: GroundSurface;
  /** The photo drawn first (photo surface only). */
  photo: WorkspaceWallpaper | null;
  /** Photos to rotate through, when a slideshow runs. */
  slideshow: { items: WorkspaceWallpaper[]; seconds: number; startId: string | null } | null;
  /** The colour wash over a photo. Null: no wash (no photo, or the photo shown pure). */
  tint: { preset: GroundTint; color: string | null } | null;
  /** The photo shown stronger, with no wash (tint "Off"). Still inside the world's limit. */
  pure: boolean;
  texture: GroundTexture;
  /** The wash drifts slowly (photo surface only; verger's subtle motion). */
  breathe: boolean;
  notes: GroundNote[];
}

export const DEFAULT_TEXTURE: GroundTexture = 'washi-grain';
export const DEFAULT_SLIDESHOW_SECONDS = 300;

export function isGroundTexture(value: unknown): value is GroundTexture {
  return (
    value === 'none' ||
    value === 'washi-grain' ||
    value === 'aurora-mesh' ||
    value === 'celestial-embers'
  );
}

function textureFor(asked: GroundTexture, allow: GroundAllowance): GroundTexture {
  if (asked === 'celestial-embers') return allow.ambient ? asked : 'none';
  if (asked === 'aurora-mesh') return allow.ambient && allow.blur ? asked : 'none';
  return asked;
}

/**
 * The one plan for a look on this device. Total: every combination of choices gives a plan that
 * can be drawn, and choices that cannot show (tint without a photo, slideshow of one photo) are
 * left out of the plan rather than half-applied.
 */
export function planGround(
  look: WorkspaceAppearance,
  worldPhotos: readonly WorkspaceWallpaper[],
  allow: GroundAllowance,
  legacyTexture?: GroundTexture,
): GroundPlan {
  const notes: GroundNote[] = [];
  const asked: SceneGroundMode = look.groundMode ?? (look.wallpaper ? 'image' : 'live');

  let surface: GroundSurface = asked === 'image' ? 'photo' : asked === 'quiet' ? 'paper' : asked;
  let photo: WorkspaceWallpaper | null = null;
  if (asked === 'image') {
    photo = look.wallpaper ?? worldPhotos[0] ?? null;
    if (!photo) {
      notes.push('no-photo');
      surface = 'paper';
    } else if (!allow.photos) {
      notes.push('photos-paused');
      surface = 'paper';
      photo = null;
    }
  }

  let slideshow: GroundPlan['slideshow'] = null;
  const config = look.wallpaperConfig;
  if (asked === 'image' && config?.mode === 'slideshow') {
    if (config.items.length < 2) notes.push('slideshow-needs-two');
    else if (surface !== 'photo') notes.push('slideshow-paused');
    else {
      slideshow = {
        items: [...config.items],
        seconds:
          config.slideshowIntervalSeconds > 0
            ? config.slideshowIntervalSeconds
            : DEFAULT_SLIDESHOW_SECONDS,
        startId: config.activeId ?? photo?.publicId ?? null,
      };
    }
  }

  const onPhoto = surface === 'photo';
  const pure = onPhoto && look.preset === 'none';
  const tint =
    onPhoto && look.preset !== 'none'
      ? { preset: look.preset, color: config?.customWashColor ?? null }
      : null;

  const askedTexture = isGroundTexture(look.atmosphere)
    ? look.atmosphere
    : (legacyTexture ?? DEFAULT_TEXTURE);
  const texture = textureFor(askedTexture, allow);
  if (texture !== askedTexture) notes.push('texture-paused');

  return {
    asked,
    surface,
    photo,
    slideshow,
    tint,
    pure,
    texture,
    breathe: onPhoto && allow.subtleMotion,
    notes,
  };
}

/** Which Floor Studio settings mean something for this look. Same answer on web and phone. */
export interface GroundControls {
  ground: true;
  photoPicker: boolean;
  playback: boolean;
  cadence: boolean;
  tint: boolean;
  texture: true;
}

export function groundControls(look: WorkspaceAppearance): GroundControls {
  const asked: SceneGroundMode = look.groundMode ?? (look.wallpaper ? 'image' : 'live');
  const photo = asked === 'image';
  return {
    ground: true,
    photoPicker: photo,
    playback: photo,
    cadence: photo && look.wallpaperConfig?.mode === 'slideshow',
    tint: photo,
    texture: true,
  };
}

/**
 * The settings a look is made of, in the order the studio shows them. Labels are English until
 * Neev supplies Sinhala and Tamil words.
 */
export const GROUND_OPTIONS = {
  ground: [
    { id: 'live', label: 'Live sky', hint: "The world's sky, following the hour" },
    { id: 'still', label: 'Still sky', hint: "The world's sky at midday, not moving" },
    { id: 'image', label: 'Photo', hint: 'A photo of the world, or one you add' },
    { id: 'quiet', label: 'Quiet', hint: "The world's plain paper" },
  ],
  tint: [
    { id: 'default', label: 'Sandstone' },
    { id: 'dawn', label: 'Dawn' },
    { id: 'garden', label: 'Garden' },
    { id: 'night', label: 'Night' },
    { id: 'none', label: 'Off' },
  ],
  texture: [
    { id: 'none', label: 'Plain' },
    { id: 'washi-grain', label: 'Paper grain' },
    { id: 'aurora-mesh', label: 'Aurora' },
    { id: 'celestial-embers', label: 'Embers' },
  ],
  cadence: [
    { id: 180, label: '3 min' },
    { id: 300, label: '5 min' },
    { id: 900, label: '15 min' },
  ],
} as const satisfies {
  ground: readonly { id: SceneGroundMode; label: string; hint: string }[];
  tint: readonly { id: WorkspaceAppearancePreset; label: string }[];
  texture: readonly { id: GroundTexture; label: string }[];
  cadence: readonly { id: number; label: string }[];
};

/** Words for a note, for the studio to show beside the setting it explains. */
export const GROUND_NOTE_TEXT: Record<GroundNote, string> = {
  'photos-paused':
    "Photos are paused on this device right now (saving data or battery), so the world's paper shows instead.",
  'no-photo': "No photo yet, so the world's paper shows.",
  'texture-paused': 'This texture is paused on this device right now to keep it smooth.',
  'slideshow-needs-two': 'A slideshow needs at least two photos.',
  'slideshow-paused': 'The slideshow is paused while photos are paused.',
};
