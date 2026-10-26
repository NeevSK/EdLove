/**
 * Renders the scene's still layer headless (Skia on CanvasKit) for a grid of worlds, hours and
 * weathers, so a look can be reviewed without a phone. Run: pnpm scene:shots [outDir]
 * (tsconfig.json here points `react-native-skia` at its headless build).
 * The moving layer (rain, fireflies) is not drawn here.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import React from 'react';

const require = createRequire(import.meta.url);
// The ui sources use the automatic JSX runtime; tsx may compile them classically.
(globalThis as { React?: unknown }).React = React;

async function main() {
  const outDir = process.argv[2] ?? '.scene-shots';
  mkdirSync(outDir, { recursive: true });
  // canvaskit-wasm is installed beside react-native-skia, not at the root.
  const besideSkia = createRequire(require.resolve('react-native-skia/package.json'));
  const CanvasKitInit = besideSkia('canvaskit-wasm/bin/full/canvaskit.js');
  (globalThis as { CanvasKit?: unknown }).CanvasKit = await CanvasKitInit();
  const headless = await import('react-native-skia');
  const { experienceOf } = await import('../../packages/core/src/verger/experience');
  const scene = await import('../../packages/core/src/scene/index');
  const { SceneStill } = await import('../../packages/ui/src/scene/native/SceneStill');
  const { resolveWorld } = await import('../../packages/ui/src/world/resolve');

  const budget = experienceOf({ levels: {}, capacityClass: 'high' }, { fidelity: 'auto' });
  const W = 390;
  const H = 760;
  const shots: [string, number, string][] = [
    ['sanctuary', 360, 'clear'],
    ['sanctuary', 450, 'monsoon'],
    ['sanctuary', 780, 'clear'],
    ['wewa', 1080, 'cloudy'],
    ['kandyan', 1110, 'clear'],
    ['ratna', 1290, 'clear'],
    ['kele', 600, 'mist'],
    ['angampora', 960, 'storm'],
  ];
  for (const [worldId, minute, weather] of shots) {
    const world = resolveWorld(
      worldId as never,
      scene.phaseOfMinute(minute),
      scene.isDarkPhase(scene.phaseOfMinute(minute)) ? 'dark' : 'light',
    );
    for (const presence of ['full', 'band'] as const) {
      const s = scene.resolveScene({
        now: new Date(2026, 9, 26),
        minute,
        weather: weather as never,
        world: { id: worldId, glow: world.tokens.glow },
        room: 'classroom',
        presence,
        budget,
      });
      if (!s.palette) continue;
      const h = presence === 'band' ? 120 : H;
      const ls = scene.landscapeOf(s.view, W, presence === 'band' ? h / 0.7 : H, true);
      const colours = scene.landscapeColours(
        s.palette,
        scene.daylightAt(minute),
        world.tokens.glow,
      );
      const surface = headless.makeOffscreenSurface(W * 2, h * 2);
      const element = React.createElement(
        headless.Group,
        { transform: [{ scale: 2 }] },
        React.createElement(SceneStill, {
          scene: s,
          landscape: ls,
          colours,
          glow: world.tokens.glow,
          clipHeight: presence === 'band' ? h : undefined,
        }),
        presence === 'band'
          ? React.createElement(headless.Rect, {
              x: 0,
              y: 0,
              width: W,
              height: h,
              color: world.tokens.ground + 'C7',
            })
          : null,
      );
      const image = await headless.drawOffscreen(surface, element);
      const bytes = image.encodeToBytes();
      const name = `${worldId}-${String(minute).padStart(4, '0')}-${weather}-${presence}.png`;
      writeFileSync(join(outDir, name), bytes);
      console.log(name);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
