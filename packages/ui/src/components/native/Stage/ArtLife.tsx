/**
 * The floor's moving layer: the art's front layers swaying, drifting or glowing, its particles
 * (fireflies, motes, leaves, petals) and its shader, on one transparent canvas above the still
 * picture, so only this canvas redraws. One clock on the UI thread, capped at the stage's frame
 * rate and stopped whenever the stage says so (a hidden screen, scrolling, the floor tier, reduced
 * motion). Every position is a pure function of time: nothing is allocated per particle.
 */

import { useEffect, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import {
  type SharedValue,
  useDerivedValue,
  useFrameCallback,
  useSharedValue,
} from 'react-native-reanimated';
import { BlurMask, Canvas, Group, Path, Rect, Shader, Skia } from 'react-native-skia';
import type {
  ArtLayer,
  ArtMotion,
  ArtParticles,
  ArtShader,
  SceneArt,
} from '../../../theme/scene/art/types';
import type { Stage } from '../../../theme/stage';
import { ArtLayerView } from './ArtStill';
import { colourVec, shaderOf } from './shaders';

/** The transform of a moving layer at time `ms`. */
export function motionAt(motion: ArtMotion, ms: number) {
  'worklet';
  const phase = ((ms / motion.periodMs + (motion.offset ?? 0)) % 1) * Math.PI * 2;
  const s = Math.sin(phase);
  if (motion.kind === 'sway') return [{ rotate: (s * motion.amount * Math.PI) / 180 }];
  if (motion.kind === 'drift') return [{ translateX: s * motion.amount }];
  if (motion.kind === 'rise') return [{ translateY: s * motion.amount }];
  if (motion.kind === 'breathe') return [{ scale: 1 + s * motion.amount }];
  return [{ scale: 1 }];
}

/** A layer's opacity at time `ms` (only `glow` moves it). */
export function glowAt(motion: ArtMotion, ms: number, base: number) {
  'worklet';
  if (motion.kind !== 'glow') return base;
  const phase = ((ms / motion.periodMs + (motion.offset ?? 0)) % 1) * Math.PI * 2;
  return base * (1 - motion.amount * (0.5 + 0.5 * Math.sin(phase)));
}

function MovingLayer({ layer, time }: { layer: ArtLayer; time: SharedValue<number> }) {
  const motion = layer.motion!;
  const base = layer.opacity ?? 1;
  const transform = useDerivedValue(() => motionAt(motion, time.get()));
  const opacity = useDerivedValue(() => glowAt(motion, time.get(), base));
  const origin = motion.origin ? { x: motion.origin[0], y: motion.origin[1] } : undefined;
  return (
    <Group transform={transform} origin={origin} opacity={opacity}>
      <ArtLayerView layer={{ ...layer, opacity: 1 }} />
    </Group>
  );
}

function Particles({
  set,
  share,
  time,
}: {
  set: ArtParticles;
  share: number;
  time: SharedValue<number>;
}) {
  const count = Math.round(set.count * share);
  const { x: ax, y: ay, width: aw, height: ah } = set.area;
  const [dx, dy] = set.drift;
  const [r0, r1] = set.size;
  const oval = set.kind === 'leaf' || set.kind === 'petal';
  // Rain falls as thin streaks, not dots.
  const streak = set.kind === 'drop';
  const { seed, twinkle, wander: reach } = set;
  const path = useDerivedValue(() => {
    const p = Skia.PathBuilder.Make();
    const t = time.get() / 1000;
    for (let i = 0; i < count; i++) {
      // Three cheap hashes give each particle its place, size and rhythm.
      const h1 = Math.sin((i + seed) * 12.9898) * 43758.5453;
      const h2 = Math.sin((i + seed) * 78.233) * 12345.6789;
      const h3 = Math.sin((i + seed) * 39.425) * 24634.6345;
      const u = h1 - Math.floor(h1);
      const v = h2 - Math.floor(h2);
      const w = h3 - Math.floor(h3);
      const wander = Math.sin(t * (0.4 + w * 0.5) + i * 1.7) * reach;
      const x = ax + ((((u * aw + dx * t + wander) % aw) + aw) % aw);
      const y = ay + ((((v * ah + dy * t) % ah) + ah) % ah);
      let r = r0 + (r1 - r0) * w;
      if (twinkle) {
        const glow = Math.sin(t * (1.4 + w * 1.6) + u * 6.28);
        if (glow < -0.2) continue;
        r *= 0.55 + 0.45 * glow;
      }
      if (oval) p.addOval({ x: x - r, y: y - r * 0.45, width: r * 2, height: r * 0.9 });
      else if (streak) p.addRect({ x: x - r * 0.5, y: y - r * 7, width: r, height: r * 14 });
      else p.addCircle(x, y, r);
    }
    return p.detach();
  });
  if (count <= 0) return null;
  return (
    <Group>
      {set.halo ? (
        <Path path={path} color={set.colour} opacity={0.45}>
          <BlurMask blur={set.halo} style="normal" />
        </Path>
      ) : null}
      <Path path={path} color={set.colour} />
    </Group>
  );
}

function ShaderRegion({
  shader,
  time,
  sun,
}: {
  shader: ArtShader;
  time: SharedValue<number>;
  sun: [number, number];
}) {
  const effect = shaderOf(shader.kind);
  const colour = useMemo(() => colourVec(shader.colour), [shader.colour]);
  const uniforms = useDerivedValue(() => ({
    origin: [shader.x, shader.y],
    size: [shader.width, shader.height],
    sun,
    time: time.get() / 1000,
    colour,
    strength: shader.strength,
  }));
  if (!effect) return null;
  return (
    <Rect x={shader.x} y={shader.y} width={shader.width} height={shader.height}>
      <Shader source={effect} uniforms={uniforms} />
    </Rect>
  );
}

export interface ArtLifeProps {
  art: SceneArt;
  /** The moving layers to draw here (the still canvas draws the rest). */
  layers: readonly ArtLayer[];
  stage: Stage;
  /** False while the screen is hidden or scrolling: the clock stops, the last frame stays. */
  active: boolean;
  /** The sun or moon's position, for the rays shader. */
  sun: [number, number];
}

export function ArtLife({ art, layers, stage, active, sun }: ArtLifeProps) {
  const time = useSharedValue(0);
  const last = useSharedValue(0);
  const frameMs = stage.fps > 0 ? 1000 / stage.fps : 1000;
  const frames = useFrameCallback((info) => {
    'worklet';
    const now = info.timeSinceFirstFrame;
    if (now - last.get() >= frameMs) {
      last.set(now);
      time.set(now);
    }
  }, false);

  const runs = active && stage.fps > 0;
  useEffect(() => {
    frames.setActive(runs);
    return () => frames.setActive(false);
  }, [runs, frames]);

  return (
    <Canvas
      style={[StyleSheet.absoluteFill, { width: art.width, height: art.height }]}
      pointerEvents="none"
    >
      {stage.shaders
        ? art.shaders.map((s, i) => (
            <ShaderRegion key={`sh${i}`} shader={s} time={time} sun={sun} />
          ))
        : null}
      {layers.map((layer) =>
        layer.motion ? (
          <MovingLayer key={layer.id} layer={layer} time={time} />
        ) : (
          <ArtLayerView key={layer.id} layer={layer} />
        ),
      )}
      {art.particles.map((set, i) => (
        <Particles key={`p${i}`} set={set} share={stage.particles} time={time} />
      ))}
    </Canvas>
  );
}
