import { describe, expect, it } from 'vitest';
import { EXPERIENCE_LEVER_IDS, experienceOf } from './experience';
import { GURUDEVI_MOBILE_HOST, GURUDEVI_WEB_HOST, WEB_VIEW_LEVER_IDS } from './host';

describe("Gurudevi's experience view", () => {
  it('every lever it reads is governed on mobile (a missing one would read as full quality)', () => {
    const governed = new Set(GURUDEVI_MOBILE_HOST.levers.map((lever) => lever.id));
    expect(EXPERIENCE_LEVER_IDS.filter((id) => !governed.has(id))).toEqual([]);
  });

  it('safe mode takes everything to its cheapest but never turns on what the user turned off', () => {
    const view = experienceOf(
      { levels: {}, capacityClass: 'high' },
      { fidelity: 'auto', hapticsEnabled: false, safeMode: true },
    );
    expect(view).toMatchObject({
      quality: 'essential',
      allowBlur: false,
      shouldPrefetchAssets: false,
    });
    expect(view.experience).toMatchObject({
      motion: 'off',
      sound: 'off',
      haptics: 'off',
      maxParticles: 0,
    });
  });

  it('shimmer and the list window follow their levers; at rest the list keeps its own default', () => {
    const view = (levels: Record<string, number>) =>
      experienceOf({ levels, capacityClass: 'high' }, { fidelity: 'auto' });
    expect(view({})).toMatchObject({ allowShimmer: true, listDrawDistance: undefined });
    expect(view({ 'loading-shimmer': 1, 'list-window': 1 })).toMatchObject({
      allowShimmer: false,
      listDrawDistance: 125,
    });
    expect(view({ 'list-window': 2 }).listDrawDistance).toBe(60);
    expect(
      experienceOf({ levels: {}, capacityClass: 'high' }, { fidelity: 'auto', safeMode: true }),
    ).toMatchObject({ allowShimmer: false, listDrawDistance: 60 });
  });

  it('the web governs only what its pages apply, and app-wide reduced motion', () => {
    expect(GURUDEVI_WEB_HOST.levers.map((lever) => lever.id).sort()).toEqual(
      ['global-motion', ...WEB_VIEW_LEVER_IDS].sort(),
    );
  });
});
