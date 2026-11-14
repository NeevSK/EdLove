/**
 * The floor's shaders as SkSL source (no Skia import, so tests and the headless check can read
 * them): light rays from the sun, drifting mist, shimmering water and rising heat. Each returns
 * premultiplied colour and stays cheap: a few sines and two octaves of value noise.
 */

import type { ArtShader } from '../../../theme/scene/art/types';

const NOISE = `
float hash(float2 p) { return fract(sin(dot(p, float2(127.1, 311.7))) * 43758.5453); }
float noise(float2 p) {
  float2 i = floor(p);
  float2 f = fract(p);
  float2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + float2(1.0, 0.0)), u.x),
             mix(hash(i + float2(0.0, 1.0)), hash(i + float2(1.0, 1.0)), u.x), u.y);
}
`;

/** Every shader takes the same uniforms, so one painter feeds them all. */
const HEAD = `
uniform float2 origin;
uniform float2 size;
uniform float2 sun;
uniform float time;
uniform float4 colour;
uniform float strength;
`;

export const SHADER_SOURCE: Readonly<Record<ArtShader['kind'], string>> = {
  rays: `${HEAD}
half4 main(float2 p) {
  float2 d = p - sun;
  float ang = atan(d.y, d.x);
  float r = length(d) / max(size.x, size.y);
  float beams = 0.5 + 0.5 * sin(ang * 13.0 + time * 0.21) * sin(ang * 5.0 - time * 0.13);
  float fall = clamp(1.0 - r * 1.1, 0.0, 1.0);
  float a = beams * fall * fall * strength;
  return half4(colour.rgb * a, a);
}`,
  mist: `${HEAD}${NOISE}
half4 main(float2 p) {
  float2 q = (p - origin) / size;
  float n = noise(q * float2(5.0, 2.5) + float2(time * 0.04, 0.0)) * 0.65
          + noise(q * float2(11.0, 5.0) - float2(time * 0.07, 0.0)) * 0.35;
  float band = smoothstep(0.0, 0.45, q.y) * smoothstep(1.0, 0.55, q.y);
  float a = n * band * strength;
  return half4(colour.rgb * a, a);
}`,
  water: `${HEAD}${NOISE}
half4 main(float2 p) {
  float2 q = (p - origin) / size;
  float ripple = sin(q.y * 140.0 + noise(q * float2(8.0, 30.0) + time * 0.3) * 6.0 - time * 1.2);
  float glints = smoothstep(0.82, 1.0, ripple) * (0.4 + 0.6 * noise(q * float2(20.0, 4.0) + time * 0.2));
  float a = glints * strength * smoothstep(0.0, 0.2, q.y);
  return half4(colour.rgb * a, a);
}`,
  heat: `${HEAD}${NOISE}
half4 main(float2 p) {
  float2 q = (p - origin) / size;
  float n = noise(q * float2(9.0, 4.0) + float2(0.0, -time * 0.25));
  float a = n * (1.0 - q.y) * strength * 0.6;
  return half4(colour.rgb * a, a);
}`,
};
