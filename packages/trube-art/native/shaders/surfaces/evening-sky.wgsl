/**
 * evening-sky.wgsl — Trübe-Art Soul Layer · Evening Sky
 *
 * Light behavior: Rayleigh scattering simulation. Warm-to-cool vertical
 * temperature gradient. Very slow color temperature decay.
 * Emotional quality: Melancholic, Warm.
 *
 * Physics:
 * — Rayleigh scattering: λ⁻⁴ — shorter wavelengths (blue) scatter most
 *   At horizon angle, path length is huge → all blue scattered away → red/orange
 * — Golden hour: sun near horizon, warm (2700K) orange/red bathes lower sky
 * — Zenith: still some scattering → deep blue (8000K-12000K)
 * — Chromatic complement: orange sun source → complementary blue-violet shadow
 */

struct TrubeUniforms {
    time: f32, entropy: f32, intensity: f32, _pad0: f32,
    resX: f32, resY: f32, _pad1: f32, _pad2: f32,
}
@group(0) @binding(0) var<uniform> u: TrubeUniforms;

@vertex
fn vs_main(@builtin(vertex_index) idx: u32) -> @builtin(position) vec4<f32> {
    var pos = array<vec2<f32>, 3>(
        vec2<f32>(-1.0,-1.0), vec2<f32>(3.0,-1.0), vec2<f32>(-1.0,3.0)
    );
    return vec4<f32>(pos[idx], 0.0, 1.0);
}

@fragment
fn fs_main(@builtin(position) fc: vec4<f32>) -> @location(0) vec4<f32> {
    let uv = fc.xy / vec2<f32>(u.resX, u.resY);
    let et = entropyTime(u.time);       // very slow drift (every 7 frames)

    // ── Rayleigh scattering model ─────────────────────────────────────────
    // cos(theta) = uv.y: horizon = 0, zenith = 1.
    // Path through atmosphere ∝ 1/cos(theta) → more scattering near horizon.
    let cosTheta  = clamp(uv.y, 0.02, 1.0);
    let pathLen   = 1.0 / cosTheta; // relative optical path length

    // Rayleigh transmittance per channel (λ⁻⁴ approx): R:0.68, G:0.54, B:0.44 µm
    // More scattering = more light removed from direct beam, added to diffuse
    let tauR = exp(-pathLen * 0.18);  // red   — least scattered
    let tauG = exp(-pathLen * 0.35);  // green
    let tauB = exp(-pathLen * 0.65);  // blue  — most scattered

    // Direct sunlight (orange-red near horizon, white at zenith)
    let sunColor = vec3<f32>(1.0, 0.52, 0.12);   // 2700K warm source
    let directLight = sunColor * vec3<f32>(tauR, tauG, tauB);

    // Scattered skylight (accumulates blue toward zenith)
    let scatterR = (1.0 - tauR) * 0.35;
    let scatterG = (1.0 - tauG) * 0.45;
    let scatterB = (1.0 - tauB) * 0.82;
    let skyScatter = vec3<f32>(scatterR, scatterG, scatterB);

    // Composite: horizon dominated by direct warm light, zenith by blue scatter
    let horInfluence = pow(1.0 - uv.y, 2.5);
    let skyColor = mix(
        skyScatter,
        directLight,
        horInfluence * 0.85
    );

    // ── Slow color decay (Golden hour → dusk → deep blue twilight) ────────
    // entropyTime drifts the color temperature over time
    let duskFactor = sin(et * 0.008) * 0.5 + 0.5; // [0,1] cycle over ~800s
    let duskViolet = vec3<f32>(0.22, 0.14, 0.45);  // deep dusk sky
    let finalSky   = mix(skyColor, duskViolet, duskFactor * 0.4 * (1.0 - uv.y));

    // ── Atmospheric micro-variation: slight haze/cloud texture ────────────
    let haze = fbm(uv * 2.5 + vec2<f32>(et * 0.004, 0.0), 4) * 0.06;
    let micro = simplex2(uv * 12.0 + et * 0.01) * 0.025;

    // ── Chromatic complement shadow (Goethe): warm sun → cool violet shadow ─
    let shadowViolet = vec3<f32>(0.18, 0.18, 0.52);
    let shadowMask = fbm(uv * 3.0 + vec2<f32>(-et * 0.003, et * 0.002), 3);
    let finalColor = mix(finalSky, shadowViolet, clamp(shadowMask * 0.25 + haze, 0.0, 0.4));

    // Luminosity: brightest near horizon, darkens toward zenith
    let lum = clamp(0.4 + horInfluence * 0.6 + micro, 0.3, 1.0);
    return vec4<f32>(finalColor * lum * u.intensity, u.intensity);
}
