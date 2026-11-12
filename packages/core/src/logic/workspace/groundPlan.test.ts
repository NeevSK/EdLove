import type {
  FloorWallpaperConfig,
  SceneGroundMode,
  WorkspaceAppearance,
  WorkspaceAppearancePreset,
  WorkspaceWallpaper,
} from '@repo/core/types';
import { describe, expect, it } from 'vitest';
import {
  GROUND_OPTIONS,
  type GroundAllowance,
  type GroundStage,
  type GroundTexture,
  groundControls,
  groundPolicyOf,
  NOTHING_ALLOWED,
  planGround,
} from './groundPlan';

const photo = (id: string): WorkspaceWallpaper => ({
  provider: 'preset',
  url: `/p/${id}.jpg`,
  publicId: id,
  width: 1920,
  height: 1080,
});
const A = photo('a');
const B = photo('b');

const GROUNDS: (SceneGroundMode | undefined)[] = [undefined, 'live', 'still', 'image', 'quiet'];
const PRESETS: WorkspaceAppearancePreset[] = ['default', 'dawn', 'garden', 'night', 'none'];
const TEXTURES: (GroundTexture | undefined | 'old-junk')[] = [
  undefined,
  'none',
  'washi-grain',
  'aurora-mesh',
  'celestial-embers',
  'old-junk',
];
const WALLPAPERS: (WorkspaceWallpaper | null | undefined)[] = [undefined, null, A];
const CONFIGS: (FloorWallpaperConfig | null | undefined)[] = [
  undefined,
  null,
  { mode: 'off', items: [], slideshowIntervalSeconds: 300 },
  { mode: 'single', items: [A, B], slideshowIntervalSeconds: 300, activeId: 'b' },
  { mode: 'slideshow', items: [A], slideshowIntervalSeconds: 0 },
  { mode: 'slideshow', items: [A, B], slideshowIntervalSeconds: 0, customWashColor: '#a85022' },
];
const WORLD_PHOTOS: WorkspaceWallpaper[][] = [[], [B]];
const ALLOWANCES: GroundAllowance[] = [
  NOTHING_ALLOWED,
  { photos: true, ambient: true, blur: true, subtleMotion: true },
  { photos: true, ambient: false, blur: false, subtleMotion: false },
  { photos: false, ambient: true, blur: true, subtleMotion: true },
];

function* everyLook(): Generator<WorkspaceAppearance> {
  for (const groundMode of GROUNDS)
    for (const preset of PRESETS)
      for (const atmosphere of TEXTURES)
        for (const wallpaper of WALLPAPERS)
          for (const wallpaperConfig of CONFIGS) {
            const look: WorkspaceAppearance = { preset, motion: 'off' };
            if (groundMode !== undefined) look.groundMode = groundMode;
            if (atmosphere !== undefined) look.atmosphere = atmosphere;
            if (wallpaper !== undefined) look.wallpaper = wallpaper;
            if (wallpaperConfig !== undefined) look.wallpaperConfig = wallpaperConfig;
            yield look;
          }
}

describe('every combination of floor settings gives a plan that can be drawn', () => {
  it('holds the rules for all combinations, on every kind of device', () => {
    let checked = 0;
    for (const look of everyLook())
      for (const worldPhotos of WORLD_PHOTOS)
        for (const allow of ALLOWANCES) {
          const plan = planGround(look, worldPhotos, allow);
          const where = JSON.stringify({ look, worldPhotos: worldPhotos.length, allow });
          checked++;

          // A photo is drawn exactly when the surface is a photo, and only if the device allows it.
          expect(plan.surface === 'photo', where).toBe(plan.photo !== null);
          if (plan.surface === 'photo') expect(allow.photos, where).toBe(true);
          // Photo settings only act on a photo.
          if (plan.surface !== 'photo') {
            expect(plan.tint, where).toBeNull();
            expect(plan.pure, where).toBe(false);
            expect(plan.slideshow, where).toBeNull();
            expect(plan.breathe, where).toBe(false);
          }
          // Tint and pure never both.
          expect(Boolean(plan.tint) && plan.pure, where).toBe(false);
          // A slideshow has at least two photos and a positive cadence.
          if (plan.slideshow) {
            expect(plan.slideshow.items.length, where).toBeGreaterThanOrEqual(2);
            expect(plan.slideshow.seconds, where).toBeGreaterThan(0);
          }
          // Textures the device cannot afford are off, never half-on.
          if (!allow.ambient) expect(['none', 'washi-grain'], where).toContain(plan.texture);
          if (!allow.blur) expect(plan.texture, where).not.toBe('aurora-mesh');
          // What was asked is kept, so the studio still shows the person's choice.
          expect(plan.asked, where).toBe(look.groundMode ?? (look.wallpaper ? 'image' : 'live'));
          // Rooms keep the full scene; no veil.
          expect(plan.veil, where).toBe(0);
          // Anything turned down says why.
          if (plan.asked === 'image' && plan.surface !== 'photo')
            expect(plan.notes.length, where).toBeGreaterThan(0);
          // The studio shows photo settings exactly when Photo is chosen.
          const controls = groundControls(look);
          expect(controls.tint, where).toBe(plan.asked === 'image');
          expect(controls.photoPicker, where).toBe(plan.asked === 'image');
        }
    expect(checked).toBeGreaterThan(10_000);
  });

  it('every option the studio offers is one the plan understands', () => {
    for (const { id } of GROUND_OPTIONS.texture) {
      const plan = planGround({ preset: 'default', motion: 'off', atmosphere: id }, [], {
        photos: true,
        ambient: true,
        blur: true,
        subtleMotion: true,
      });
      expect(plan.texture).toBe(id);
    }
    for (const { id } of GROUND_OPTIONS.ground) {
      expect(
        planGround({ preset: 'default', motion: 'off', groundMode: id }, [A], NOTHING_ALLOWED)
          .asked,
      ).toBe(id);
    }
  });

  it('focus screens get a calmer ground of the same world, on every combination', () => {
    const allow = { photos: true, ambient: true, blur: true, subtleMotion: true };
    for (const look of everyLook()) {
      const plan = planGround(look, [B], allow, undefined, 'focus');
      expect(plan.surface).not.toBe('live');
      expect(plan.slideshow).toBeNull();
      expect(['none', 'washi-grain']).toContain(plan.texture);
      expect(plan.breathe).toBe(false);
      expect(plan.dim).toBe(plan.surface === 'photo');
      expect(plan.veil).toBe(plan.surface === 'paper' ? 0 : 0.65);
      // Same world: the person's choice of ground and photo is kept.
      expect(plan.asked).toBe(planGround(look, [B], allow).asked);
      expect(plan.photo).toEqual(planGround(look, [B], allow).photo);
    }
  });

  describe('ground policy (the person and verger decide, no screen hardcodes it)', () => {
    const allow = { photos: true, ambient: true, blur: true, subtleMotion: true };
    const stages: GroundStage[] = ['room', 'screen', 'focus'];
    const sky: WorkspaceAppearance = { preset: 'default', motion: 'off', groundMode: 'live' };

    it('balanced (the default) with an unknown or capable device: rooms and screens full, focus calm', () => {
      for (const experience of [
        null,
        { quality: 'full' as const },
        { quality: 'reduced' as const },
      ]) {
        const policy = groundPolicyOf({ experience });
        expect(policy.liveliness).toBe('balanced');
        expect(policy.strength).toEqual({ room: 'full', screen: 'full', focus: 'calm' });
        expect(policy.reason).toBe('chosen');
      }
    });

    it('verger only calms: an essential device calms every screen but the rooms, whatever was chosen', () => {
      for (const liveliness of ['lively', 'balanced'] as const) {
        const policy = groundPolicyOf({ liveliness, experience: { quality: 'essential' } });
        expect(policy.strength).toEqual({ room: 'full', screen: 'calm', focus: 'calm' });
        expect(policy.reason).toBe('device-essential');
        expect(planGround(sky, [], allow, undefined, 'screen', policy).surface).toBe('still');
        expect(planGround(sky, [], allow, undefined, 'room', policy).surface).toBe('live');
      }
      expect(
        groundPolicyOf({ liveliness: 'calm', experience: { quality: 'essential' } }).reason,
      ).toBe('chosen');
    });

    it('calm calms rooms too', () => {
      const policy = groundPolicyOf({ liveliness: 'calm' });
      for (const stage of stages) {
        const plan = planGround(sky, [], allow, undefined, stage, policy);
        expect(plan.surface).toBe('still');
        // A calm room keeps no veil (its cards carry the words); other screens keep the reading veil.
        expect(plan.veil).toBe(stage === 'room' ? 0 : 0.65);
      }
    });

    it('lively keeps the full ground everywhere, but never thins the reading veil', () => {
      const policy = groundPolicyOf({ liveliness: 'lively' });
      const focus = planGround(sky, [], allow, undefined, 'focus', policy);
      expect(focus.surface).toBe('live');
      expect(focus.veil).toBe(0.65);
      expect(planGround(sky, [], allow, undefined, 'screen', policy).veil).toBe(0.45);
    });

    it('the device allowance still applies under every choice', () => {
      for (const liveliness of ['lively', 'balanced', 'calm'] as const) {
        const plan = planGround(
          {
            preset: 'default',
            motion: 'off',
            groundMode: 'image',
            wallpaper: A,
            atmosphere: 'celestial-embers',
          },
          [],
          NOTHING_ALLOWED,
          undefined,
          'room',
          groundPolicyOf({ liveliness }),
        );
        expect(plan.surface).toBe('paper');
        expect(plan.texture).toBe('none');
      }
    });
  });

  it('photos paused by the device fall back to paper and say why', () => {
    const plan = planGround(
      { preset: 'dawn', motion: 'off', groundMode: 'image', wallpaper: A },
      [],
      NOTHING_ALLOWED,
    );
    expect(plan).toMatchObject({
      surface: 'paper',
      photo: null,
      tint: null,
      notes: ['photos-paused'],
    });
  });
});
