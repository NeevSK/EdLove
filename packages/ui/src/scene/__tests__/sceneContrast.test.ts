import {
  contrastRatio,
  daylightAt,
  landscapeColours,
  mixHex,
  resolveScene,
  type SceneWeather,
  WEATHER,
} from '@repo/core/scene';
import { experienceOf } from '@repo/core/verger';
import { resolveWorld } from '../../world/resolve';
import type { WorldPhase } from '../../world/types';
import { WORLD_IDS } from '../../world/worlds';
import { BAND_WASH_TEXT } from '../wash';

const budget = experienceOf({ levels: {}, capacityClass: 'high' }, { fidelity: 'auto' });
const WEATHERS = Object.keys(WEATHER) as SceneWeather[];
const DARK: readonly WorldPhase[] = ['predawn', 'dusk', 'night'];

describe('scene band contrast', { tags: ['a11y', 'unit'] }, () => {
  it('header text keeps 4.5:1 over the band in every world, hour and weather', () => {
    const failures: string[] = [];
    for (const id of WORLD_IDS) {
      for (const weather of WEATHERS) {
        for (let minute = 0; minute < 1440; minute += 15) {
          const probe = resolveScene({
            now: new Date(2026, 9, 26),
            minute,
            weather,
            world: { id, glow: '#FFFFFF' },
            room: 'classroom',
            presence: 'band',
            budget,
          });
          const world = resolveWorld(
            id,
            probe.phase,
            DARK.includes(probe.phase) ? 'dark' : 'light',
          );
          const scene = resolveScene({
            now: new Date(2026, 9, 26),
            minute,
            weather,
            world: { id, glow: world.tokens.glow },
            room: 'classroom',
            presence: 'band',
            budget,
          });
          const p = scene.palette;
          if (!p) continue;
          const c = landscapeColours(p, daylightAt(minute), world.tokens.glow);
          // A band draws the sun's halo and the moon's glow but never their discs (SceneStill).
          const behind = [
            p.top,
            p.horizon,
            p.hillFar,
            p.hillNear,
            c.shore,
            ...c.waterStops,
            mixHex(p.top, p.halo, 0.85),
          ];
          for (const colour of behind) {
            const veiled = mixHex(colour, world.tokens.ground, BAND_WASH_TEXT);
            for (const ink of [world.tokens.ink, world.tokens.inkSoft]) {
              const ratio = contrastRatio(ink, veiled);
              if (ratio < 4.5)
                failures.push(`${id} ${weather} ${minute} ${colour} ${ratio.toFixed(2)}`);
            }
          }
        }
      }
    }
    expect(failures.length, failures.slice(0, 8).join('\n')).toBe(0);
  });
});
