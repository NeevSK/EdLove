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
  /** A calmer ground for screens where people read or work: the photo shows more faintly. */
  dim: boolean;
  /**
   * How much of the world's own paper is laid over the ground (0 to 1), so words placed straight
   * on the floor (titles, small print between cards) stay readable on a sky or a photo.
   */
  veil: number;
  notes: GroundNote[];
}

/**
 * Where a ground is shown. Every screen stands on the world's ground; screens where people
 * read or work for long (a book, a chat, a form, a kiosk) get a calmer version of it.
 */
export type GroundStage = 'room' | 'screen' | 'focus';
export type GroundStrength = 'full' | 'calm';

/**
 * The person's own say on how lively the ground is (a Visual setting; on the phone it is
 * `Comfort.ground`). `balanced` is the default table below; `lively` keeps the full ground on
 * every screen; `calm` asks for the quieter ground everywhere, rooms included. Verger can only
 * calm it further, never liven it.
 */
export type GroundLiveliness = 'lively' | 'balanced' | 'calm';
export const GROUND_LIVELINESS_CHOICES: readonly GroundLiveliness[] = [
  'lively',
  'balanced',
  'calm',
];
export const DEFAULT_GROUND_LIVELINESS: GroundLiveliness = 'balanced';

export function isGroundLiveliness(value: unknown): value is GroundLiveliness {
  return value === 'lively' || value === 'balanced' || value === 'calm';
}

/** The table: how strong the ground is per kind of screen, for each choice. Change it here. */
export const GROUND_LIVELINESS_DIALS: Readonly<
  Record<GroundLiveliness, Readonly<Record<GroundStage, GroundStrength>>>
> = {
  lively: { room: 'full', screen: 'full', focus: 'full' },
  balanced: { room: 'full', screen: 'full', focus: 'calm' },
  calm: { room: 'calm', screen: 'calm', focus: 'calm' },
};

/** The balanced row, kept by name for callers that read it. */
export const GROUND_STAGE_DEFAULTS: Readonly<Record<GroundStage, GroundStrength>> =
  GROUND_LIVELINESS_DIALS.balanced;

/**
 * The paper veil per kind of screen. Rooms are built from cards and keep the full scene; other
 * screens put more words straight on the floor; reading and work screens most of all. This is a
 * readability floor (the world's limit), so no choice lowers it.
 */
export const GROUND_VEIL_DEFAULTS: Readonly<Record<GroundStage, number>> = {
  room: 0,
  screen: 0.45,
  focus: 0.65,
};

/** Why the policy came out as it did, so a settings screen can say so. */
export type GroundPolicyReason = 'chosen' | 'device-essential';

/** How loud the ground is on each kind of screen. Both apps ask `groundPolicyOf`; nothing else. */
export interface GroundPolicy {
  readonly liveliness: GroundLiveliness;
  readonly strength: Readonly<Record<GroundStage, GroundStrength>>;
  readonly veil: Readonly<Record<GroundStage, number>>;
  readonly reason: GroundPolicyReason;
}

export const DEFAULT_GROUND_POLICY: GroundPolicy = {
  liveliness: DEFAULT_GROUND_LIVELINESS,
  strength: GROUND_LIVELINESS_DIALS[DEFAULT_GROUND_LIVELINESS],
  veil: GROUND_VEIL_DEFAULTS,
  reason: 'chosen',
};

/**
 * The one ground policy: the person's choice picks a row of the table, then verger may only calm
 * it. A device verger has put at essential quality (safe mode, a power cut, "Lighter" detail on a
 * struggling device) gets the calm ground on every screen but the rooms; rooms already lose their
 * costly parts through the allowance. Unknown verger (server, first paint) changes nothing. The
 * veil is the world's readability floor, so no choice thins it.
 */
export function groundPolicyOf(input: {
  liveliness?: GroundLiveliness | null;
  experience?: Pick<GurudeviExperience, 'quality'> | null;
}): GroundPolicy {
  const liveliness = input.liveliness ?? DEFAULT_GROUND_LIVELINESS;
  const chosen = GROUND_LIVELINESS_DIALS[liveliness];
  if (
    input.experience?.quality === 'essential' &&
    (chosen.screen !== 'calm' || chosen.focus !== 'calm')
  ) {
    return {
      liveliness,
      strength: { ...chosen, screen: 'calm', focus: 'calm' },
      veil: GROUND_VEIL_DEFAULTS,
      reason: 'device-essential',
    };
  }
  return { liveliness, strength: chosen, veil: GROUND_VEIL_DEFAULTS, reason: 'chosen' };
}

/** The same world, quieter: no moving sky, no slideshow, no animated texture, a fainter photo. */
export function calmPlan(plan: GroundPlan, veil: number = GROUND_VEIL_DEFAULTS.focus): GroundPlan {
  return {
    ...plan,
    surface: plan.surface === 'live' ? 'still' : plan.surface,
    slideshow: null,
    texture: plan.texture === 'none' ? 'none' : 'washi-grain',
    breathe: false,
    dim: plan.surface === 'photo',
    veil: plan.surface === 'paper' ? 0 : Math.max(plan.veil, veil),
  };
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
  stage: GroundStage = 'room',
  policy: GroundPolicy = DEFAULT_GROUND_POLICY,
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

  const plan: GroundPlan = {
    asked,
    surface,
    photo,
    slideshow,
    tint,
    pure,
    texture,
    breathe: onPhoto && allow.subtleMotion,
    dim: false,
    // Paper needs no veil: it is the world's paper already.
    veil: surface === 'paper' ? 0 : policy.veil[stage],
    notes,
  };
  if (policy.strength[stage] !== 'calm') return plan;
  // A calm room keeps its own veil (none); other screens take at least the reading veil.
  return calmPlan(plan, stage === 'room' ? policy.veil.room : policy.veil.focus);
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
