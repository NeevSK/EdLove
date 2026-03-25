/**
 * waterfall.wgsl — Trübe-Art Soul Layer · Waterfall
 *
 * Light behavior: Multi-directional specular. Aeration whitening.
 * High temporal frequency (every frame — motion requires frequency).
 * Emotional quality: Energetic, Pure.
 *
 * Key physics:
 * — Flow noise drives directional motion (downward + slight sideways turbulence)
 * — Aeration whitening: where water churns most, air bubbles → white
 * — Specular highlights: multi-directional micro-facet reflection (Beckmann-like)
 * — Deep pool at bottom: slower, darker, more domain-warped
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
    let et = entropyTime(u.time);

    // ── Primary flow (downward) ─────────────────────────────────────────
    let flowDir = vec2<f32>(0.08, 1.0);   // mostly down, slight horizontal drift
    let flow0   = flowNoise(uv * 2.5, et, flowDir, 0.6);
    let flow1   = flowNoise(uv * 5.0 + vec2<f32>(1.7, 0.0), et, flowDir, 0.8);

    // ── Turbulence (lateral oscillation — water hitting rock, spreading out) ─
    let turb = simplex2(vec2<f32>(uv.x * 18.0 + et * 0.8, uv.y * 12.0)) * 0.12;
    let turbStrip = abs(sin(uv.x * 22.0 + flow0 * 4.0 + et)) * 0.08;

    // ── Aeration whitening (churning creates air bubbles → white foam) ───
    // Strongest at top (impact zone) and sides
    let aerationY   = pow(1.0 - uv.y, 3.0);    // top of fall = most aeration
    let aerationX   = 1.0 - abs(uv.x - 0.5) * 2.2; // center column
    let aeration    = clamp((aerationY + aerationX) * 0.5 + turb * 1.5, 0.0, 1.0);
    let foam        = clamp(aeration - 0.4, 0.0, 1.0);

    // ── Water color: deep blue-green darkening with depth ─────────────────
    let deepBlue   = vec3<f32>(0.06, 0.18, 0.35);  // deep water color
    let shallowAqua = vec3<f32>(0.18, 0.62, 0.72); // shallow lit water
    let foamWhite  = vec3<f32>(0.92, 0.95, 0.98);  // aerated foam
    let depth      = uv.y; // top=0, bottom=1  
    let waterColor = mix(shallowAqua, deepBlue, depth * 0.7);

    // ── Multi-directional specular micro-facet (Beckmann-like) ────────────
    let spec0 = pow(clamp(flow0 * 0.5 + 0.5, 0.0, 1.0), 12.0);
    let spec1 = pow(clamp(flow1 * 0.5 + 0.5, 0.0, 1.0),  8.0);
    let specular = (spec0 + spec1) * 0.4 + turbStrip;
    let specColor = vec3<f32>(0.85, 0.92, 1.0); // cool sky reflection in water

    // ── Chromatic complement: warm source → cool water shadow ─────────────
    let shadowCool = vec3<f32>(0.10, 0.22, 0.42);
    let shadowMask  = clamp(1.0 - flow0 * 1.5, 0.0, 1.0);
    var finalColor  = mix(waterColor, shadowCool, shadowMask * 0.3);
    finalColor      = mix(finalColor, specColor, clamp(specular, 0.0, 0.8));
    finalColor      = mix(finalColor, foamWhite, clamp(foam * foam, 0.0, 1.0));

    let lum = clamp(0.4 + flow0 * 0.4 + specular * 0.3, 0.2, 1.0);
    return vec4<f32>(finalColor * lum * u.intensity, u.intensity);
}
