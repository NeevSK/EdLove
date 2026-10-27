import { describe, expect, it } from 'vitest';
import { experienceOf } from '../verger/experience';
import {
  behindGreeting,
  resolveScene,
  roomOfPath,
  type SceneBudget,
  type SceneInput,
  sceneTierOf,
} from './resolveScene';
import {
  celestialAt,
  contrastRatio,
  moonPhaseAt,
  phaseOfMinute,
  type SceneWeather,
  seasonOfMonth,
  skyPaletteAt,
  WEATHER,
} from './sky';

const budget = (
  levels: Record<string, number> = {},
  capacityClass: 'low' | 'mid' | 'high' = 'high',
) => experienceOf({ levels, capacityClass }, { fidelity: 'auto' });

const base = (over: Partial<SceneInput> = {}): SceneInput => ({
  now: new Date(2026, 9, 26, 7, 30),
  world: { id: 'sanctuary', glow: '#F6C27E' },
  room: 'classroom',
  presence: 'full',
  budget: budget(),
  ...over,
});

const WEATHERS = Object.keys(WEATHER) as SceneWeather[];

describe('resolveScene: verger decides how much', () => {
  it('full motion runs at 30 fps; paced motion at 15; still motion holds the scene still', () => {
    expect(resolveScene(base()).fps).toBe(30);
    expect(resolveScene(base({ budget: budget({ 'ambient-motion': 1 }) })).fps).toBe(15);
    const still = resolveScene(base({ budget: budget({ 'ambient-motion': 2 }) }));
    expect(still).toMatchObject({
      fps: 0,
      tier: 'balanced',
      paint: 'scene',
      repaintEveryMs: 60_000,
    });
  });

  it('a hidden screen never moves, but keeps its painted scene', () => {
    const scene = resolveScene(base({ visible: false, weather: 'monsoon' }));
    expect(scene).toMatchObject({ fps: 0, paint: 'scene' });
    expect(scene.particles.rain).toBe(0);
  });

  it('a low phone, low fidelity or safe mode paints no scene: the world ground carries the hour', () => {
    expect(resolveScene(base({ budget: budget({}, 'low') }))).toMatchObject({
      tier: 'essential',
      paint: 'none',
      palette: null,
      fps: 0,
      repaintEveryMs: null,
    });
    const safe = experienceOf(
      { levels: {}, capacityClass: 'high' },
      { fidelity: 'auto', safeMode: true },
    );
    expect(sceneTierOf(safe)).toBe('essential');
  });

  it('particles follow the particles lever: full, half, none', () => {
    const rain = (level: number) =>
      resolveScene(base({ weather: 'monsoon', budget: budget({ particles: level }) })).particles
        .rain;
    expect(rain(0)).toBe(WEATHER.monsoon.rain);
    expect(rain(1)).toBe(Math.round(WEATHER.monsoon.rain / 2));
    expect(rain(2)).toBe(0);
  });

  it('frost falls back to paper when blur is at its flat tint, or nothing is painted', () => {
    expect(resolveScene(base({ surface: 'frost' })).surface).toBe('frost');
    expect(resolveScene(base({ surface: 'frost', budget: budget({ blur: 2 }) })).surface).toBe(
      'paper',
    );
    expect(resolveScene(base({ surface: 'frost', presence: 'quiet' })).surface).toBe('paper');
  });

  it('the room crossfade shortens, then cuts, as transitions are lowered', () => {
    const fade = (budgetIn: SceneBudget) => resolveScene(base({ budget: budgetIn })).transitionMs;
    expect(fade(budget())).toBeGreaterThan(fade(budget({ 'ambient-motion': 2 })));
    expect(fade(budget({ transitions: 2 }))).toBe(0);
  });
});

describe('resolveScene: presence and ground', () => {
  it('a band moves at most at 15 fps with half the rain and no fireflies', () => {
    const band = resolveScene(base({ presence: 'band', weather: 'drizzle', minute: 1170 }));
    expect(band.fps).toBe(15);
    expect(band.particles.rain).toBe(Math.round(WEATHER.drizzle.rain / 2));
    expect(band.particles.fireflies).toBe(0);
  });

  it('a quiet screen paints nothing and uses the world ink', () => {
    expect(resolveScene(base({ presence: 'quiet' }))).toMatchObject({
      paint: 'none',
      skyInk: null,
    });
  });

  it('a solid colour is honoured on any phone, with ink that reads on it', () => {
    const scene = resolveScene(
      base({ ground: { kind: 'solid', colour: '#1B2A3A' }, budget: budget({}, 'low') }),
    );
    expect(scene).toMatchObject({ paint: 'colour', colour: '#1B2A3A', fps: 0 });
    expect(contrastRatio(scene.skyInk as string, '#1B2A3A')).toBeGreaterThanOrEqual(4.5);
  });

  it('plain ground paints nothing', () => {
    expect(resolveScene(base({ ground: { kind: 'plain' } })).paint).toBe('none');
  });
});

describe('resolveScene: rooms', () => {
  it('the view follows the room by default, the world when asked, or stays one scene', () => {
    expect(resolveScene(base({ room: 'library' })).view).toBe('temple-library');
    expect(resolveScene(base({ room: 'library', follows: 'world' })).view).toBe('school');
    expect(resolveScene(base({ room: 'self', follows: 'one' })).view).toBe('school');
  });

  it('routes map to rooms, with route groups ignored', () => {
    expect(roomOfPath('/(tabs)/self/journal')).toBe('self');
    expect(roomOfPath('/library/123')).toBe('library');
    expect(roomOfPath('/(tabs)/community')).toBe('community');
    expect(roomOfPath('/classroom/7b/attendance')).toBe('classroom');
    expect(roomOfPath('/')).toBe('classroom');
  });
});

describe('the sky', () => {
  it('words on the sky stay readable at every minute and in every weather (large text, 3:1)', () => {
    for (const weather of WEATHERS) {
      for (let minute = 0; minute < 1440; minute += 10) {
        const scene = resolveScene(base({ minute, weather }));
        const palette = scene.palette;
        if (!palette || !scene.skyInk) throw new Error('expected a painted sky');
        expect(contrastRatio(scene.skyInk, behindGreeting(palette))).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it('phases match the app clock; dark through predawn, dusk and night', () => {
    expect(phaseOfMinute(5 * 60)).toBe('predawn');
    expect(phaseOfMinute(7 * 60)).toBe('dawn');
    expect(phaseOfMinute(21 * 60)).toBe('night');
    expect(resolveScene(base({ minute: 18 * 60 })).dark).toBe(true);
    expect(resolveScene(base({ minute: 10 * 60 })).dark).toBe(false);
  });

  it('the sun is high at noon and the moon rides the night', () => {
    expect(celestialAt(12 * 60 + 30)).toMatchObject({ body: 'sun' });
    expect(celestialAt(12 * 60 + 30).lift).toBeGreaterThan(0.7);
    expect(celestialAt(23 * 60).body).toBe('moon');
  });

  it('Sri Lankan seasons by month, and the moon cycle around a known full moon', () => {
    expect(seasonOfMonth(0)).toBe('maha');
    expect(seasonOfMonth(2)).toBe('harvest');
    expect(seasonOfMonth(5)).toBe('yala');
    expect(seasonOfMonth(9)).toBe('inter2');
    // 2026-10-26 is close to the Il poya full moon.
    expect(moonPhaseAt(new Date(Date.UTC(2026, 9, 26, 12)))).toBeGreaterThan(0.45);
    expect(moonPhaseAt(new Date(Date.UTC(2026, 9, 26, 12)))).toBeLessThan(0.6);
  });

  it('rain greys and dims the day sky', () => {
    const clear = skyPaletteAt(13 * 60, 'yala', 'clear', '#F6C27E');
    const storm = skyPaletteAt(13 * 60, 'yala', 'storm', '#F6C27E');
    expect(clear.top).not.toBe(storm.top);
  });
});
