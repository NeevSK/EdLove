/**
 * Renders each world's scene art still (Skia on CanvasKit) across hours, weathers and tiers, so a
 * floor can be reviewed without a phone. Run: pnpm scene:art [outDir] [world ...]
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import React from 'react';

const require = createRequire(import.meta.url);
(globalThis as { React?: unknown }).React = React;

async function main() {
  const outDir = process.argv[2] ?? '.scene-shots/art';
  const only = process.argv.slice(3);
  mkdirSync(outDir, { recursive: true });
  const besideSkia = createRequire(require.resolve('react-native-skia/package.json'));
  const CanvasKitInit = besideSkia('canvaskit-wasm/bin/full/canvaskit.js');
  (globalThis as { CanvasKit?: unknown }).CanvasKit = await CanvasKitInit();
  const headless = await import('react-native-skia');
  const { experienceOf } = await import('../../packages/core/src/verger/experience');
  const scene = await import('../../packages/ui/src/theme/scene/index');
  const { ArtStill } = await import('../../packages/ui/src/components/native/Stage/ArtStill');
  const { resolveWorld } = await import('../../packages/ui/src/theme/resolve');

  const budget = experienceOf({ levels: {}, capacityClass: 'high' }, { fidelity: 'auto' });
  const W = 390;
  const H = 844;
  const hours: [number, string][] = [
    [400, 'clear'],
    [600, 'mist'],
    [780, 'clear'],
    [1000, 'cloudy'],
    [1110, 'clear'],
    [1290, 'clear'],
  ];
  const worlds = only.length ? only : Object.keys(scene.WORLD_ART);
  for (const worldId of worlds) {
    for (const [minute, weather] of hours) {
      const phase = scene.phaseOfMinute(minute);
      const world = resolveWorld(worldId as never, phase, 'light');
      const s = scene.resolveScene({
        now: new Date(2026, 10, 10),
        minute,
        weather: weather as never,
        world: { id: worldId, glow: world.tokens.glow },
        room: 'self',
        presence: 'full',
        budget,
      });
      const art = scene.sceneArtOf(worldId, { width: W, height: H, scene: s, tokens: world.tokens });
      if (!art) continue;
      for (const tier of minute === 780 ? (['rich', 'floor'] as const) : (['rich'] as const)) {
        const surface = headless.makeOffscreenSurface(W * 2, H * 2);
        const element = React.createElement(
          headless.Group,
          { transform: [{ scale: 2 }] },
          React.createElement(ArtStill, { layers: art.layers, tier }),
        );
        const image = await headless.drawOffscreen(surface, element);
        const bytes = await image.encodeToBytes();
        const name = `${worldId}-${String(minute).padStart(4, '0')}-${weather}-${tier}.png`;
        writeFileSync(join(outDir, name), bytes);
        console.log(name);
      }
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
