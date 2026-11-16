import { describe, expect, it } from 'vitest';
import { FEEDBACK_SCENE_GEOMETRY, feedbackScene, feedbackSceneColors } from '../feedbackScene';
import { resolveWorld } from '../../../theme/resolve';
import { WORLD_IDS } from '../../../theme/worlds';

describe('feedback scene fallback', () => {
  it('retains the existing static silhouette and stops', () => {
    expect(FEEDBACK_SCENE_GEOMETRY).toMatchObject({ defaultSize: 156, viewBox: '0 0 240 260', center: { x: 120, y: 130 }, haloRadius: 106, coreRadius: 52, outerRadius: 18, innerRadius: 8, innerOpacity: 0.9 });
    expect(FEEDBACK_SCENE_GEOMETRY.haloStops.map((stop) => stop.opacity)).toEqual([0.32, 0]);
    expect(FEEDBACK_SCENE_GEOMETRY.coreStops.map((stop) => stop.opacity)).toEqual([0.95, 0.8, 0]);
  });
  it('preserves feedback state meanings and interrupted opacity', () => {
    expect(feedbackScene('loading')).toMatchObject({ pathInk: 'lamp', mascotInk: 'glow' });
    expect(feedbackScene('empty')).toMatchObject({ pathInk: 'ornament', mascotInk: 'glow' });
    expect(feedbackScene('offline')).toMatchObject({ pathInk: 'inkFaint', mascotInk: 'glow' });
    expect(feedbackScene('error')).toMatchObject({ pathInk: 'inkFaint', mascotInk: 'inkFaint', outerOpacity: 0.35 });
    expect(feedbackScene('success')).toMatchObject({ pathInk: 'success', mascotInk: 'glow' });
  });
  it('resolves colors from every active world rather than fixed colors', () => {
    for (const world of WORLD_IDS) {
      const tokens = resolveWorld(world).tokens;
      expect(feedbackSceneColors('loading', tokens)).toEqual({ path: tokens.lamp, mascot: tokens.glow, center: tokens.raised });
      expect(feedbackSceneColors('error', tokens)).toEqual({ path: tokens.inkFaint, mascot: tokens.inkFaint, center: tokens.raised });
    }
  });
});
