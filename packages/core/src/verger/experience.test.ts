import { describe, expect, it } from 'vitest';
import { EXPERIENCE_LEVER_IDS, experienceOf } from './experience';
import { GURUDEVI_MOBILE_HOST } from './host';

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
});
