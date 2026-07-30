import type { TSLExpression } from '@repo/trube-art/core/soul/tsl';

export const CORE_SKS_L_FUNCTIONS = `
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p, float octaves) {
  float v = 0.0;
  float a = 0.5;
  vec2 shift = vec2(100.0);
  mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
  for (int i = 0; i < int(octaves); ++i) {
    v += a * noise(p);
    p = rot * p * 2.0 + shift;
    a *= 0.5;
  }
  return v;
}

vec3 kelvinToRGB(float k) {
  float temp = k / 100.0;
  if (temp <= 66.0) {
    return vec3(1.0, clamp(0.39 * log(temp) - 0.63, 0.0, 1.0), temp <= 19.0 ? 0.0 : clamp(0.54 * log(temp - 10.0) - 1.19, 0.0, 1.0));
  }
  return vec3(clamp(1.29 * pow(temp - 60.0, -0.13), 0.0, 1.0), clamp(1.12 * pow(temp - 60.0, -0.07), 0.0, 1.0), 1.0);
}
`;

export const CORE_WGSL_FUNCTIONS = `
fn hash(p: vec2<f32>) -> f32 {
  return fract(sin(dot(p, vec2<f32>(127.1, 311.7))) * 43758.5453123);
}

fn noise(p: vec2<f32>) -> f32 {
  let i = floor(p);
  let f = fract(p);
  let u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i + vec2<f32>(0.0, 0.0)), hash(i + vec2<f32>(1.0, 0.0)), u.x),
             mix(hash(i + vec2<f32>(0.0, 1.0)), hash(i + vec2<f32>(1.0, 1.0)), u.y), u.y);
}

fn fbm(p: vec2<f32>, octaves: f32) -> f32 {
  var v = 0.0;
  var a = 0.5;
  let shift = vec2<f32>(100.0, 100.0);
  let rot = mat2x2<f32>(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
  var p_mut = p;
  for (var i = 0u; i < u32(octaves); i++) {
    v += a * noise(p_mut);
    p_mut = rot * p_mut * 2.0 + shift;
    a *= 0.5;
  }
  return v;
}

fn kelvinToRGB(k: f32) -> vec3<f32> {
  let temp = k / 100.0;
  var r = 0.0; var g = 0.0; var b = 0.0;
  if (temp <= 66.0) {
    r = 1.0;
    g = clamp(0.39 * log(temp) - 0.63, 0.0, 1.0);
    b = temp <= 19.0 ? 0.0 : clamp(0.54 * log(temp - 10.0) - 1.19, 0.0, 1.0);
  } else {
    r = clamp(1.29 * pow(temp - 60.0, -0.13), 0.0, 1.0);
    g = clamp(1.12 * pow(temp - 60.0, -0.07), 0.0, 1.0);
    b = 1.0;
  }
  return vec3<f32>(r, g, b);
}
`;

export function compileSurfaceShader(body: TSLExpression, backend: 'sksl' | 'native'): string {
  if (backend === 'sksl') {
    return `
${CORE_SKS_L_FUNCTIONS}

uniform float u_time;
uniform float u_entropy;
uniform vec2 u_res;
uniform vec3 u_base;
uniform vec3 u_mist;
uniform vec3 u_highlight;
uniform vec3 u_shadow;
uniform float u_intensity;

vec4 main(vec2 pos) {
  vec2 uv = pos / u_res;
  return vec4(${body.render(backend)}, 1.0);
}
    `.trim();
  }

  return `
${CORE_WGSL_FUNCTIONS}

struct Uniforms {
  time: f32,
  entropy: f32,
  res: vec2<f32>,
  base: vec3<f32>,
  mist: vec3<f32>,
  highlight: vec3<f32>,
  shadow: vec3<f32>,
  intensity: f32,
};

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

@fragment
fn main(@location(0) pos: vec2<f32>) -> @location(0) vec4<f32> {
  let uv = pos / uniforms.res;
  return vec4<f32>(${body.render(backend)}, 1.0);
}
  `.trim();
}
