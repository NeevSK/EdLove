/**
 * sksl-shaders.ts \u2014 Tr\u00FCbe-Art Soul Layer \u00B7 SkSL Shader Library
 * Tier 3 (Skia RuntimeEffect path)
 *
 * SkSL is Skia's dialect of GLSL. These shaders are compiled at startup by
 * Skia.RuntimeEffect.Make() and run on the GPU via RuntimeShader.
 *
 * Uniform convention (identical across all 8 surfaces):
 *   uniform float u_time;       // entropy-modulated time
 *   uniform float u_entropy;    // \u00B10.02 meta-noise signal
 *   uniform float u_res[2];     // [width, height] in pixels
 *   uniform float u_intensity;  // surface opacity [0,1]
 *   uniform float u_base[3];    // palette.base   (RGB)
 *   uniform float u_accent[3];  // palette.accent (RGB)
 *   uniform float u_highlight[3];
 *   uniform float u_shadow[3];
 */

// =============================================================================
// \u00A7 1 \u2014 Shared noise library (GLSL/SkSL)
//       Ported from noise.wgsl \u2014 same math, GLSL syntax.
// =============================================================================

export const SKSL_NOISE = `
// \u2500\u2500 Value noise (fast, no texture) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
float hash21(vec2 p) {
  p = fract(p * vec2(127.1, 311.7));
  p += dot(p, p + 19.19);
  return fract(p.x * p.y);
}

// \u2500\u2500 Smooth noise \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

// \u2500\u2500 Simplex-like gradient noise \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
float gnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0,0.0));
  float c = hash21(i + vec2(0.0,1.0));
  float d = hash21(i + vec2(1.0,1.0));
  vec2 u = f*f*(3.0-2.0*f);
  return mix(a, b, u.x) + (c - a)*u.y*(1.0-u.x) + (d - b)*u.x*u.y;
}

// \u2500\u2500 Fractal Brownian Motion \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
float fbm(vec2 p, int octaves) {
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  float v = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 6; i++) {
    if (i >= octaves) break;
    v += amp * gnoise(p);
    p = m * p;
    amp *= 0.5;
  }
  return v;
}

// \u2500\u2500 Domain Warp \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
float domainWarp(vec2 p, float strength) {
  vec2 q = vec2(
    fbm(p + vec2(0.0, 0.0), 4),
    fbm(p + vec2(5.2, 1.3), 4)
  );
  return fbm(p + strength * q, 4);
}

// \u2500\u2500 Meta-Noise (Kells entropy signal) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
// Min period 47s \u2014 prevents any surface from ever perfectly looping.
float metaNoise(float t) {
  float e0 = gnoise(vec2(t / 47.0,  0.371)) * 0.012;
  float e1 = gnoise(vec2(t / 53.3,  3.141)) * 0.006;
  float e2 = gnoise(vec2(t / 61.7,  7.389)) * 0.003;
  return e0 + e1 + e2;
}

float entropyTime(float t) {
  return t + metaNoise(t);
}
`;

// =============================================================================
// \u00A7 2 \u2014 Standard uniform header (prepended to every surface)
// =============================================================================

const UNIFORM_HEADER = `
uniform float u_time;
uniform float u_entropy;
uniform float u_res[2];
uniform float u_intensity;
uniform float u_base[3];
uniform float u_accent[3];
uniform float u_highlight[3];
uniform float u_shadow[3];

vec2 skRes()    { return vec2(u_res[0], u_res[1]); }
vec3 skBase()   { return vec3(u_base[0],      u_base[1],      u_base[2]); }
vec3 skAccent() { return vec3(u_accent[0],    u_accent[1],    u_accent[2]); }
vec3 skHigh()   { return vec3(u_highlight[0], u_highlight[1], u_highlight[2]); }
vec3 skShadow() { return vec3(u_shadow[0],    u_shadow[1],    u_shadow[2]); }
`;

function makeSKSL(body: string): string {
	return `${SKSL_NOISE}\n${UNIFORM_HEADER}\n${body}`.trim();
}

// =============================================================================
// \u00A7 3 \u2014 Surface SkSL shaders
// =============================================================================

const AURORA_SKSL = makeSKSL(`
half4 main(vec2 fragCoord) {
  vec2 uv = fragCoord / skRes();
  float et = entropyTime(u_time);

  float col0 = domainWarp(vec2(uv.x * 1.8, uv.y * 0.4 + et * 0.035), 3.2);
  float col1 = fbm(vec2(uv.x * 2.4 + 1.7, uv.y * 0.6 + et * 0.018), 5);
  float shimmer = gnoise(vec2(uv.x * 8.0 + et * 0.12, uv.y * 3.0)) * 0.08;

  vec3 cool    = vec3(0.08, 0.82, 0.72);
  vec3 warm    = vec3(0.65, 0.18, 0.88);
  vec3 neutral = vec3(0.25, 0.55, 0.95);
  vec3 chromatic = mix(mix(cool, neutral, col1 * 0.5 + 0.5), warm, col0 * 0.45 + 0.3);
  vec3 shadowHue = (1.0 - chromatic) * vec3(0.6, 0.7, 0.5);
  float vFade = 1.0 - pow(uv.y, 1.5);
  vec3 baseColor = mix(chromatic, shadowHue * 0.3, vFade * 0.5);

  float warmth = clamp(col0 * 1.2 - 0.2, 0.0, 1.0);
  vec3 final = mix(baseColor, baseColor * vec3(1.3, 1.1, 0.9), warmth * 0.25);
  float lum = clamp(col0 * 0.6 + col1 * 0.4 + shimmer + 0.3, 0.1, 1.0);

  // Blend with palette base for Goethe compliance
  final = mix(skShadow(), mix(final, skAccent(), shimmer * 2.0), lum);
  return half4(half3(final * lum * u_intensity), half(u_intensity));
}
`);

const SILK_SKSL = makeSKSL(`
half4 main(vec2 fragCoord) {
  vec2 uv = fragCoord / skRes();
  float et = entropyTime(u_time);

  float alpha = et * 0.04 + 0.5;
  float coarse = gnoise(uv * 3.5 + vec2(cos(alpha), sin(alpha)) * 0.3);
  float fine   = gnoise(uv * 12.0 + vec2(sin(alpha+0.3), cos(alpha+0.3)) * 0.2) * 0.4;
  float highlight = coarse + fine;
  float micro  = gnoise(uv * 28.0 + et * 0.06) * 0.06;
  float ripple = sin(uv.x * 18.0 + uv.y * 6.0 + et * 0.9) * 0.04;

  float h = clamp(highlight * 0.5 + 0.5, 0.0, 1.0);
  vec3 shadowC = vec3(0.52, 0.62, 0.88); // complement shadow
  vec3 baseColor = mix(shadowC, skBase(), h);
  vec3 edgeColor = mix(baseColor, skHighlight(), clamp((highlight - 0.6) * 3.0, 0.0, 1.0));
  float depth = fbm(uv * 2.0 + et * 0.01, 3);
  vec3 final = mix(edgeColor, skAccent() * 0.85, depth * 0.2);

  float lum = clamp(0.55 + h * 0.4 + ripple + micro, 0.3, 1.0);
  return half4(half3(final * lum * u_intensity), half(u_intensity));
}
`);

const YOUNG_LEAF_SKSL = makeSKSL(`
half4 main(vec2 fragCoord) {
  vec2 uv = fragCoord / skRes();
  float et = entropyTime(u_time);

  float edgeDist  = 2.0 * length(uv - vec2(0.5));
  float thickness = 1.0 - clamp(pow(edgeDist, 1.4), 0.0, 1.0);
  float veinBase  = fbm(uv * 6.0 + et * 0.006, 4);
  float veinFine  = gnoise(uv * 22.0 + vec2(et * 0.02, 0.0)) * 0.3;
  float veinShadow = clamp(1.0 - abs(veinBase + veinFine) * 2.5, 0.0, 1.0);

  float transmission = (1.0 - thickness) * veinShadow;
  vec3 transmitWarm  = vec3(0.75, 0.95, 0.25);
  vec3 baseColor = mix(skBase(), skShadow(), 1.0 - veinShadow);
  baseColor = mix(baseColor, transmitWarm, clamp(transmission * 0.8, 0.0, 1.0));
  float edgeLum = pow(clamp(edgeDist - 0.4, 0.0, 1.0), 2.0) * 0.9;
  baseColor = mix(baseColor, skAccent(), edgeLum * 0.6);

  float breath = 0.92 + 0.08 * sin(et * 0.38 + veinBase * 2.0);
  float lum = clamp(veinShadow * 0.6 + thickness * 0.4, 0.15, 1.0) * breath;
  return half4(half3(baseColor * lum * u_intensity), half(u_intensity));
}
`);

const MIST_SKSL = makeSKSL(`
half4 main(vec2 fragCoord) {
  vec2 uv = fragCoord / skRes();
  float et = entropyTime(u_time);

  float mass0 = domainWarp(vec2(uv.x * 1.2 + et*0.015, uv.y * 1.2 + et*0.008), 2.8);
  float wisp0 = fbm(vec2(uv.x*3.5 - et*0.022, uv.y*3.5 + et*0.011), 5);
  float wisp1 = fbm(vec2(uv.x*3.5 + 7.3, uv.y*3.5 + 2.1 + et*0.013), 4);
  float micro = gnoise(uv * 14.0 + et * 0.04) * 0.07;
  float density = clamp(mass0*0.5 + wisp0*0.35 + wisp1*0.25 + micro + 0.2, 0.0, 1.0);

  float groundInfluence = pow(1.0 - uv.y, 2.5) * 0.6;
  vec3 clearColor = skBase();
  vec3 denseColor = skHighlight();
  vec3 baseColor = mix(mix(clearColor, denseColor, density), skShadow(), groundInfluence);
  vec3 mistColor = mix(baseColor, skAccent(), (1.0 - density) * 0.3);

  float edgeSoft = smoothstep(0.0, 0.35, density) * smoothstep(1.0, 0.7, density);
  float scatter = 0.5 + density * 0.5;
  float alpha = edgeSoft * u_intensity;
  return half4(half3(mistColor * scatter), half(alpha));
}
`);

const WATERFALL_SKSL = makeSKSL(`
half4 main(vec2 fragCoord) {
  vec2 uv = fragCoord / skRes();
  float et = entropyTime(u_time);

  // Flow noise approximation: fbm displaced by time in downward direction
  float flow0 = fbm(uv * 2.5 + vec2(et * 0.24, et * 1.8), 5);
  float flow1 = fbm(uv * 5.0 + vec2(et * 0.32 + 1.7, et * 2.4), 4);
  float turb  = gnoise(vec2(uv.x * 18.0 + et * 0.8, uv.y * 12.0)) * 0.12;
  float aeration = clamp((pow(1.0-uv.y,3.0) + (1.0 - abs(uv.x-0.5)*2.2))*0.5 + turb*1.5, 0.0,1.0);
  float foam = clamp(aeration - 0.4, 0.0, 1.0);

  vec3 waterColor = mix(skBase(), skShadow(), uv.y * 0.7);
  float spec0 = pow(clamp(flow0*0.5+0.5, 0.0,1.0), 12.0);
  float spec1 = pow(clamp(flow1*0.5+0.5, 0.0,1.0),  8.0);
  float specular = (spec0 + spec1) * 0.4 + turb * 0.5;
  vec3 final = mix(waterColor, skHighlight(), clamp(specular, 0.0, 0.8));
  final = mix(final, vec3(0.92, 0.95, 0.98), clamp(foam*foam, 0.0, 1.0));

  float lum = clamp(0.4 + flow0 * 0.4 + specular * 0.3, 0.2, 1.0);
  return half4(half3(final * lum * u_intensity), half(u_intensity));
}
`);

const EVENING_SKY_SKSL = makeSKSL(`
half4 main(vec2 fragCoord) {
  vec2 uv = fragCoord / skRes();
  float et = entropyTime(u_time);

  // Rayleigh per-channel transmittance (\u03BB^-4 approximation)
  float cosTheta = clamp(uv.y, 0.02, 1.0);
  float pathLen = 1.0 / cosTheta;
  float tauR = exp(-pathLen * 0.18);
  float tauG = exp(-pathLen * 0.35);
  float tauB = exp(-pathLen * 0.65);

  vec3 sunColor = vec3(1.0, 0.52, 0.12);
  vec3 directLight = sunColor * vec3(tauR, tauG, tauB);
  float scatterR = (1.0 - tauR) * 0.35;
  float scatterG = (1.0 - tauG) * 0.45;
  float scatterB = (1.0 - tauB) * 0.82;
  vec3 skyScatter = vec3(scatterR, scatterG, scatterB);

  float horInfluence = pow(1.0 - uv.y, 2.5);
  vec3 skyColor = mix(skyScatter, directLight, horInfluence * 0.85);
  float duskFactor = sin(et * 0.008) * 0.5 + 0.5;
  vec3 finalSky = mix(skyColor, skShadow(), duskFactor * 0.4 * (1.0 - uv.y));

  float haze = fbm(uv * 2.5 + vec2(et*0.004, 0.0), 4) * 0.06;
  vec3 finalColor = mix(finalSky, skAccent(), clamp(haze, 0.0, 0.4));

  float lum = clamp(0.4 + horInfluence * 0.6 + haze, 0.3, 1.0);
  return half4(half3(finalColor * lum * u_intensity), half(u_intensity));
}
`);

const SKYMORPHIC_SKSL = makeSKSL(`
// Porter-Duff OVER in GLSL for Skia
vec4 skOver(vec4 bg, vec4 fg) {
  float a = fg.a + bg.a * (1.0 - fg.a);
  if (a < 0.001) return vec4(0.0);
  vec3 rgb = (fg.rgb * fg.a + bg.rgb * bg.a * (1.0 - fg.a)) / a;
  return vec4(rgb, a);
}

half4 main(vec2 fragCoord) {
  vec2 uv = fragCoord / skRes();
  float et = entropyTime(u_time);

  vec3 bgColor = skShadow() * vec3(0.04, 0.07, 0.18) + (fbm(uv*1.1+vec2(et*0.004,et*0.002),5)*0.3+0.7) * vec3(0.04,0.07,0.18);
  vec4 result = vec4(bgColor, 0.92);

  float l1n = domainWarp(uv*2.0 + vec2(et*0.012, -et*0.007), 2.0);
  result = skOver(result, vec4(skBase() * 0.8, clamp(l1n*0.5+0.35, 0.0, 0.65)));

  float l2n = fbm(uv*3.5 + vec2(-et*0.018, et*0.011), 4);
  result = skOver(result, vec4(skAccent() * 0.9, clamp(l2n*0.4+0.2, 0.0, 0.50)));

  float l3n = gnoise(uv*6.0 + et*0.04) * 0.5 + 0.5;
  result = skOver(result, vec4(skHighlight(), l3n * 0.25));

  float bleedMask = 1.0 - result.a;
  result.rgb = mix(result.rgb, result.rgb + skBase()*0.08, clamp(bleedMask, 0.0, 0.4));

  return half4(half3(result.rgb * u_intensity), half(clamp(result.a * u_intensity, 0.0, 1.0)));
}
`);

const WATER_SURFACE_SKSL = makeSKSL(`
half4 main(vec2 fragCoord) {
  vec2 uv = fragCoord / skRes();
  float et = entropyTime(u_time);

  float eps = 0.004;
  float hC = fbm(uv + vec2(et*0.075, et*0.0375), 5);
  float hX = fbm(uv + vec2(eps, 0.0) + vec2(et*0.075, et*0.0375), 5);
  float hY = fbm(uv + vec2(0.0, eps) + vec2(et*0.075, et*0.0375), 5);
  vec3 normal = normalize(vec3(-(hX-hC)/eps*0.6, -(hY-hC)/eps*0.6, 1.0));
  vec3 viewDir = vec3(0.0, 0.0, 1.0);
  float NdotV = clamp(dot(normal, viewDir), 0.0, 1.0);
  float fresnel = pow(1.0 - NdotV, 3.5);

  vec3 skyRefl = mix(skHighlight(), skBase(), clamp(1.0 - normal.y, 0.0, 1.0));
  float causticA = abs(sin(hC * 18.0 + et * 2.1)) * 0.4;
  float causticB = abs(sin(hX * 14.0 - et * 1.7 + 1.3)) * 0.25;
  float caustics = clamp(causticA + causticB, 0.0, 0.85);

  float depth = fbm(uv*3.0 + et*0.008, 3) * 0.5 + 0.5;
  vec3 seaColor = mix(skShadow(), skBase(), depth * 0.7);
  vec3 waterColor = mix(seaColor, skAccent()*0.35, (1.0-NdotV)*0.2);

  vec3 finalColor = mix(waterColor, skyRefl, fresnel * 0.7);
  finalColor = mix(finalColor, skHighlight(), caustics * 0.6);
  float lum = clamp(0.35 + NdotV*0.5 + caustics*0.3, 0.2, 1.0);
  return half4(half3(finalColor * lum * u_intensity), half(u_intensity));
}
`);

// =============================================================================
// \u00A7 4 \u2014 Surface map and public API
// =============================================================================

export const SKSL_SURFACES: Record<string, string> = {
	aurora: AURORA_SKSL,
	silk: SILK_SKSL,
	"young-leaf": YOUNG_LEAF_SKSL,
	mist: MIST_SKSL,
	waterfall: WATERFALL_SKSL,
	"evening-sky": EVENING_SKY_SKSL,
	skymorphic: SKYMORPHIC_SKSL,
	"water-surface": WATER_SURFACE_SKSL,
};

export function getSKSLSurface(name: string): string | null {
	return SKSL_SURFACES[name] ?? null;
}

export function getSKSLSurfaceNames(): string[] {
	return Object.keys(SKSL_SURFACES);
}
