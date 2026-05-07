/**
 * mist.wgsl — Trübe-Art Soul Layer · Mist
 *
 * Light behavior: Volumetric forward scattering. Depth-based desaturation.
 * Edge dissolution — no hard boundaries anywhere.
 * Emotional quality: Calm, Uncertain.
 *
 * The mist is the truest expression of the turbid medium — it IS the medium.
 * Light enters it and loses direction. The observer sees not a surface
 * but a depth of scattered atmosphere.
 *
 * Implementation: Multi-layer domain warp for volumetric feel.
 * Temperature cools with density. Edges always uncertain via smooth erode.
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

    // ── Layer 1: coarse volumetric mass (slow-moving fog banks) ──────────
    let mass0 = domainWarp(uv * 1.2 + vec2<f32>(et * 0.015, et * 0.008), 2.8);

    // ── Layer 2: mid-scale detail (wisps, tendrils) ───────────────────────
    let wisp0 = fbm(uv * 3.5 + vec2<f32>(-et * 0.022, et * 0.011), 5);
    let wisp1 = fbm(uv * 3.5 + vec2<f32>(7.3, 2.1) + et * 0.013, 4);

    // ── Layer 3: fine micro-structure (Kells principle — no stamp) ────────
    let micro = simplex2(uv * 14.0 + et * 0.04) * 0.07;

    // ── Density composite ─────────────────────────────────────────────────
    let density = clamp(mass0 * 0.5 + wisp0 * 0.35 + wisp1 * 0.25 + micro + 0.2, 0.0, 1.0);

    // ── Depth desaturation: denser mist washes out color (forward scatter) ─
    // In natural mist: deep → gray/white · shallow → slightly colored
    let clearColor  = vec3<f32>(0.68, 0.80, 0.92); // distant sky haze (cool blue)
    let denseColor  = vec3<f32>(0.88, 0.90, 0.92); // thick fog (near-white, slightly warm)
    let groundColor = vec3<f32>(0.78, 0.82, 0.80); // ground mist (slightly green-gray)

    // Vertical gradient: mist pools at the bottom
    let groundInfluence = pow(1.0 - uv.y, 2.5) * 0.6;
    let baseColor = mix(
        mix(clearColor, denseColor, density),
        groundColor,
        groundInfluence
    );

    // ── Chromatic complement: warm source light casts cool mist shadow ────
    let shadowComplement = vec3<f32>(0.55, 0.65, 0.82); // complementary to warm source
    let mistColor = mix(baseColor, shadowComplement, (1.0 - density) * 0.3);

    // ── Edge dissolution — soft, uncertain boundary (never a hard edge) ───
    // Smooth erode the edges of the mist volume
    let edgeSoft = smoothstep(0.0, 0.35, density) * smoothstep(1.0, 0.7, density);
    let alpha    = edgeSoft * u.intensity;

    // ── Luminosity from forward scatter: mist glows brighter when thick ──
    let scatter = 0.5 + density * 0.5;
    return vec4<f32>(mistColor * scatter, alpha);
}
