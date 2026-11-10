import { experienceOf } from '@repo/core/verger';
import { describe, expect, it } from 'vitest';
import { WORLDS } from '../../worlds';
import { sceneArtOf, WORLD_ART } from '../art';
import { resolveScene } from '../resolveScene';

const budget = experienceOf({ levels: {}, capacityClass: 'high' }, { fidelity: 'auto' });
const NUM = /-?\d+(?:\.\d+)?(?:e-?\d+)?/g;

function artFor(id: string, minute: number, width = 390, height = 844) {
  const world = WORLDS[id as keyof typeof WORLDS];
  const scene = resolveScene({
    now: new Date(2026, 10, 10),
    minute,
    world: { id, glow: world.palette.light.glow },
    room: 'self',
    follows: 'world',
    presence: 'full',
    budget,
  });
  return sceneArtOf(id, { width, height, scene, tokens: world.palette.light });
}

describe.each(Object.keys(WORLD_ART))('scene art: %s', (id) => {
  it('is seeded: the same minute and size draw the same art', () => {
    expect(artFor(id, 780)).toEqual(artFor(id, 780));
  });

  it('draws only finite numbers and real colours, at phone and tablet sizes, day and night', () => {
    for (const [w, h] of [
      [320, 568],
      [390, 844],
      [800, 1280],
    ] as const) {
      for (const minute of [300, 420, 780, 1100, 1320]) {
        const art = artFor(id, minute, w, h)!;
        expect(art.layers.length).toBeGreaterThan(3);
        for (const layer of art.layers) {
          for (const shape of layer.shapes) {
            for (const v of shape.d.match(NUM) ?? []) expect(Number.isFinite(Number(v))).toBe(true);
            const colours = [
              shape.fill?.kind === 'solid' ? shape.fill.colour : undefined,
              ...(shape.fill && shape.fill.kind !== 'solid' ? shape.fill.stops.map((s) => s[0]) : []),
              shape.stroke?.colour,
            ].filter(Boolean) as string[];
            for (const c of colours) expect(c).toMatch(/^#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/);
          }
        }
      }
    }
  });

  it('keeps its finest layers off the floor tier, and moves only through described motion', () => {
    const art = artFor(id, 780)!;
    const ids = new Set(art.layers.map((l) => l.id));
    expect(ids.size).toBe(art.layers.length);
    for (const layer of art.layers) {
      if (layer.motion) expect(layer.motion.periodMs).toBeGreaterThan(1000);
    }
    expect(art.overlays.length).toBeGreaterThan(0);
  });
});

it('Classic has no scene art: its floor is plain', () => {
  expect(WORLDS.classic.floor).toBe('plain');
  expect(sceneArtOf('classic', { width: 1, height: 1, scene: {} as never, tokens: WORLDS.classic.palette.light })).toBeNull();
});
