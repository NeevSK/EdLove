/**
 * The moving layer: rain and fireflies, on its own transparent canvas above the still layer, so
 * only this layer redraws each frame. Runs on the UI thread, capped at the scene's fps (30, 15,
 * or not at all), and stops whenever the scene says so: a hidden screen, verger's still motion,
 * or no particles. Positions are a pure function of time, so nothing is allocated per drop.
 */

import { SCENE_LIGHT, type Scene } from '@repo/core/scene';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { useDerivedValue, useFrameCallback, useSharedValue } from 'react-native-reanimated';
import { BlurMask, Canvas, Path, Skia } from 'react-native-skia';

export interface SceneWeatherProps {
  scene: Scene;
  width: number;
  height: number;
  /** Rain colour, from the sky. */
  rainColour: string;
}

const WIND = 0.18;

export function SceneWeather({ scene, width, height, rainColour }: SceneWeatherProps) {
  const fps = scene.fps;
  const drops = scene.particles.rain;
  const flies = scene.particles.fireflies;
  const active = fps > 0 && (drops > 0 || flies > 0);
  const time = useSharedValue(0);
  const last = useSharedValue(0);
  const frameMs = fps > 0 ? 1000 / fps : 1000;

  const frames = useFrameCallback((info) => {
    'worklet';
    const now = info.timeSinceFirstFrame;
    if (now - last.value >= frameMs) {
      last.value = now;
      time.value = now;
    }
  }, false);

  useEffect(() => {
    frames.setActive(active);
    return () => frames.setActive(false);
  }, [active, frames]);

  const rain = useDerivedValue(() => {
    const path = Skia.PathBuilder.Make();
    const t = time.value / 1000;
    for (let i = 0; i < drops; i++) {
      // Two cheap hashes give each drop a lane and a speed.
      const a = Math.sin(i * 12.9898) * 43758.5453;
      const b = Math.sin(i * 78.233) * 12345.6789;
      const lane = a - Math.floor(a);
      const speed = 0.55 + (b - Math.floor(b)) * 0.45;
      const fall = height * 1.1;
      const y = ((lane * fall + t * speed * 620) % fall) - 20;
      const x = (((lane * 7.31) % 1) * width * 1.2 - width * 0.1 + y * WIND) % (width * 1.1);
      const len = 8 + speed * 10;
      path.moveTo(x, y);
      path.lineTo(x - len * WIND, y - len);
    }
    return path.detach();
  });

  const fireflies = useDerivedValue(() => {
    const path = Skia.PathBuilder.Make();
    const t = time.value / 1000;
    for (let i = 0; i < flies; i++) {
      const s = Math.sin(i * 91.7) * 9999.1;
      const seed = s - Math.floor(s);
      const x = width * ((seed + Math.sin(t * 0.07 + i) * 0.06 + 1) % 1);
      const y = height * (0.72 + seed * 0.24) + Math.sin(t * 0.5 + i * 2.1) * 8;
      const glow = Math.max(0, Math.sin(t * 2.2 + seed * 6.28));
      if (glow > 0.15) path.addCircle(x, y, 1.6 + glow * 1.8);
    }
    return path.detach();
  });

  if (!active) return null;
  return (
    <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
      {drops > 0 ? <Path path={rain} style="stroke" strokeWidth={1} color={rainColour} /> : null}
      {flies > 0 ? (
        <Path path={fireflies} color={`${SCENE_LIGHT.firefly}D9`}>
          <BlurMask blur={3} style="solid" />
        </Path>
      ) : null}
    </Canvas>
  );
}
