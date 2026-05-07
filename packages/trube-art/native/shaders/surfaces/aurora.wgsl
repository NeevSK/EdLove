/**
 * aurora.wgsl — Trübe-Art Soul Layer · Aurora Borealis
 *
 * Light behavior: Columnar vertical diffusion.
 * High luminosity variation. Slow atmospheric temporal drift.
 * Emotional quality: Ethereal, Unpredictable.
 *
 * Goethe implementation: Cool teal ↔ warm violet temperature swing.
 * Chromatic complement shadows. Sub-luminance warmth beneath columns.
 *
 * Uniform binding: group(0), binding(0) → TrubeUniforms (32 bytes, std140)
 */

// ── Shared noise library included at WGSL bundle time by SoulLibrary ──────────
// (noise.wgsl functions available: simplex2, fbm, domainWarp, metaNoise, entropyTime)
// ─────────────────────────────────────────────────────────────────────────────

struct TrubeUniforms {
    time      : f32,
    entropy   : f32,
    intensity : f32,
    _pad0     : f32,
    resX      : f32,
    resY      : f32,
    _pad1     : f32,
    _pad2     : f32,
}
@group(0) @binding(0) var<uniform> u: TrubeUniforms;

// ── Vertex shader — fullscreen triangle (no vertex buffer required) ───────────
@vertex
fn vs_main(@builtin(vertex_index) idx: u32) -> @builtin(position) vec4<f32> {
    // Three vertices that overshoot the clip space — forms fullscreen triangle
    var pos = array<vec2<f32>, 3>(
        vec2<f32>(-1.0, -1.0),
        vec2<f32>( 3.0, -1.0),
        vec2<f32>(-1.0,  3.0)
    );
    return vec4<f32>(pos[idx], 0.0, 1.0);
}

// ── Fragment shader — Aurora light behavior ───────────────────────────────────
@fragment
fn fs_main(@builtin(position) fragCoord: vec4<f32>) -> @location(0) vec4<f32> {
    let uv = fragCoord.xy / vec2<f32>(u.resX, u.resY);
    let et = entropyTime(u.time);   // Kells: never loops

    // ── Columnar diffusion (the aurora's core character) ──────────────────
    // Vertical columns: slow horizontal drift, high vertical frequency
    let col_uv = vec2<f32>(uv.x * 1.8, uv.y * 0.4 + et * 0.035);
    let col0   = domainWarp(col_uv, 3.2);
    let col1   = fbm(vec2<f32>(uv.x * 2.4 + 1.7, uv.y * 0.6 + et * 0.018), 5);

    // ── Secondary shimmer layer ───────────────────────────────────────────
    let shimmer = simplex2(vec2<f32>(uv.x * 8.0 + et * 0.12, uv.y * 3.0)) * 0.08;

    // ── Goethe temperature: cool teal (6500K) → warm violet (3200K) ──────
    let cool   = vec3<f32>(0.08, 0.82, 0.72);   // cyan-teal: like arctic sky
    let warm   = vec3<f32>(0.65, 0.18, 0.88);   // violet: warm aurora crown
    let neutral = vec3<f32>(0.25, 0.55, 0.95);  // mid-sky blue
    let chromatic = mix(
        mix(cool, neutral, col1 * 0.5 + 0.5),
        warm,
        col0 * 0.45 + 0.3
    );

    // ── Chromatic complement shadows (Goethe's Law) ───────────────────────
    // Where the aurora dims, the sky behind it carries the complement hue
    let shadowHue   = vec3<f32>(1.0) - chromatic;
    let shadowCool  = shadowHue * vec3<f32>(0.6, 0.7, 0.5); // desaturate shadow
    let verticalFade = 1.0 - pow(uv.y, 1.5);               // stronger at top
    let baseColor   = mix(chromatic, shadowCool * 0.3, verticalFade * 0.5);

    // ── Luminosity: high variation, driven by column structure ────────────
    let lum = clamp(col0 * 0.6 + col1 * 0.4 + shimmer + 0.3, 0.1, 1.0);

    // ── Subsurface warmth: where columns are brightest, a warm underglow ─
    let warmth = clamp(col0 * 1.2 - 0.2, 0.0, 1.0);
    let finalColor = mix(baseColor, baseColor * vec3<f32>(1.3, 1.1, 0.9), warmth * 0.25);

    return vec4<f32>(finalColor * lum * u.intensity, u.intensity);
}
