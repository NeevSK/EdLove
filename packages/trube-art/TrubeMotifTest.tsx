/**
 * Trube-Art capability test: authored image/icon composited with a
 * procedural light-behavior background, using Skia's documented
 * shader-nesting pattern.
 *
 * This is a real, runnable proof of the technique -- not pseudocode.
 * It answers a specific question: can we get "rich, organic, detailed"
 * visuals (real icons/textures) rather than pure noise-field abstraction,
 * using only @shopify/react-native-skia (already installed, Ganesh
 * backend, production-stable)?
 *
 * Structure, mirroring the original Trube-Art three-layer design language:
 *   - a procedural "Surface" (simplified Aurora-like light behavior) as
 *     the atmospheric background
 *   - an authored image (icon/motif) composited on top, its edges
 *     softly lit/tinted by the surface underneath rather than sitting
 *     as a flat, disconnected sticker
 *
 * Run this with `npx tsx render.tsx` against a real Skia CanvasKit
 * context, or drop the component into an Expo app for on-device testing.
 */

import React from 'react';
import {
  Canvas,
  Fill,
  Shader,
  Skia,
  ImageShader,
  useImage,
  type SkImage,
} from '@shopify/react-native-skia';
import { useDerivedValue, type SharedValue } from 'react-native-reanimated';

// --- The procedural "Surface" layer -----------------------------------
// A deliberately simple stand-in for Trube-Art's Aurora surface: a soft,
// slowly-shifting vertical gradient with gentle sinusoidal warp, evoking
// "light moving through a medium" without needing full Simplex/fBm noise.
// This is intentionally modest -- the point of this test isn't to prove
// out the full Surface library, it's to prove the COMPOSITING technique
// works, using a light-behavior background as a believable stand-in.
const surfaceShaderSource = `
uniform float2 resolution;
uniform float time;

vec4 main(vec2 pos) {
  vec2 uv = pos / resolution;

  // Slow vertical drift + gentle horizontal warp -- "light moving
  // through a turbid medium," per the original Trube-Art philosophy doc.
  float warp = sin(uv.y * 6.0 + time * 0.3) * 0.03;
  float band = uv.y + warp;

  // Two-tone vertical gradient: cool violet top, warm amber base --
  // arbitrary palette choice for this test, swappable per Surface.
  vec3 top = vec3(0.33, 0.29, 0.72);   // cool violet
  vec3 bottom = vec3(0.98, 0.75, 0.42); // warm amber
  vec3 color = mix(top, bottom, clamp(band, 0.0, 1.0));

  // Subtle brightness pulse over time -- cheap stand-in for the
  // "entropy signal" the original doc describes to avoid a static feel.
  float pulse = 0.94 + 0.06 * sin(time * 0.6 + uv.x * 3.0);

  return vec4(color * pulse, 1.0);
}
`;

// --- The compositing layer ---------------------------------------------
// Takes the procedural surface as one child shader and the authored
// image as another, and blends them: the image is drawn on top, but
// its alpha edges pick up a soft tint from the surface color beneath
// it, so it reads as "lit by" the background rather than pasted over it.
const compositeShaderSource = `
uniform shader surface;
uniform shader motif;
uniform float2 motifCenter;
uniform float motifRadius;

vec4 main(vec2 pos) {
  vec4 bg = surface.eval(pos);
  vec4 fg = motif.eval(pos);

  // Soft radial falloff around the motif so it blends into the surface
  // at its edges rather than having a hard rectangular cutoff.
  float d = distance(pos, motifCenter);
  float edgeFade = 1.0 - smoothstep(motifRadius * 0.7, motifRadius, d);

  // Tint the motif's lit areas slightly with the surface color beneath
  // it -- this is the "light has history" idea from the original doc:
  // the motif doesn't just sit on the surface, it's touched by it.
  vec3 tintedMotif = mix(fg.rgb, fg.rgb * bg.rgb + bg.rgb * 0.15, 0.25);

  vec3 finalColor = mix(bg.rgb, tintedMotif, fg.a * edgeFade);
  return vec4(finalColor, 1.0);
}
`;

export interface TrubeMotifTestProps {
  width: number;
  height: number;
  /** Any local/require()'d image asset -- an icon, a lotus motif, etc. */
  motifSource: Parameters<typeof useImage>[0];
  /** Reanimated shared value driving the surface's time-based animation. */
  time: SharedValue<number>;
}

/**
 * Renders an authored image/icon composited with a simple procedural
 * light-behavior background, proving the technique described in the
 * architecture doc's Trube-Art capability note.
 */
export function TrubeMotifTest({
  width,
  height,
  motifSource,
  time,
}: TrubeMotifTestProps) {
  const motifImage = useImage(motifSource);

  const surfaceEffect = Skia.RuntimeEffect.Make(surfaceShaderSource);
  const compositeEffect = Skia.RuntimeEffect.Make(compositeShaderSource);

  const surfaceUniforms = useDerivedValue(() => {
    return { resolution: [width, height], time: time.value };
  }, [time, width, height]);

  if (!motifImage || !surfaceEffect || !compositeEffect) {
    return null;
  }

  return (
    <Canvas style={{ width, height }}>
      <Fill>
        <Shader
          source={compositeEffect}
          uniforms={{
            motifCenter: [width / 2, height / 2],
            motifRadius: Math.min(width, height) * 0.35,
          }}
        >
          <Shader source={surfaceEffect} uniforms={surfaceUniforms} />
          <ImageShader
            image={motifImage}
            fit="contain"
            rect={{ x: 0, y: 0, width, height }}
          />
        </Shader>
      </Fill>
    </Canvas>
  );
}
