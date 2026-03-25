/**
 * young-leaf.wgsl — Trübe-Art Soul Layer · Young Leaf
 *
 * Light behavior: Subsurface transmission. Edge luminosity enhancement.
 * Vein shadowing. Light passes THROUGH the leaf, not just reflecting off.
 * Emotional quality: Organic, Vital.
 *
 * This is the most biologically faithful shader:
 * — Chlorophyll absorption: red and blue absorbed, green released
 * — Translucent edge: where thickness is minimal, subsurface leaks out warm
 * — Vein structure: domain-warped lines of shadow (denser, absorbing tissue)
 * — Breathing: slow amplitude oscillation (the plant equivalent of Silk shimmer)
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

    // ── Thickness model (proxy for subsurface depth) ──────────────────────
    // Leaf is thinner at edges — more light passes through there
    let edgeDist  = 2.0 * length(uv - vec2<f32>(0.5));  // 0 at center, ~1.4 at corners
    let thickness = 1.0 - clamp(pow(edgeDist, 1.4), 0.0, 1.0);

    // ── Vein structure — domain-warped linear field ───────────────────────
    // Veins are denser (thicker tissue), darker, more absorbing
    let veinBase = fbm(uv * 6.0 + et * 0.006, 4);  // slow breathing
    let veinFine = simplex2(uv * 22.0 + vec2<f32>(et * 0.02, 0.0)) * 0.3;
    // Sharp vein shadows via abs + bias
    let veinShadow = clamp(1.0 - abs(veinBase + veinFine) * 2.5, 0.0, 1.0);

    // ── Subsurface transmission ────────────────────────────────────────────
    // Where the leaf is thin AND veins are absent → light pours through warm
    let transmission  = (1.0 - thickness) * veinShadow;
    let transmitWarm  = vec3<f32>(0.75, 0.95, 0.25);  // warm yellow-green (sunlight through leaf)
    let surfaceGreen  = vec3<f32>(0.22, 0.72, 0.18);  // pure chlorophyll green
    let shadowGreen   = vec3<f32>(0.10, 0.35, 0.08);  // deep shadow beneath vein

    // ── Edge luminosity enhancement ───────────────────────────────────────
    // The luminous rim where direct light catches the translucent edge
    let edgeLum    = pow(clamp(edgeDist - 0.4, 0.0, 1.0), 2.0) * 0.9;
    let edgeColor  = vec3<f32>(0.85, 0.98, 0.42); // warm liminal yellow

    // ── Compose ───────────────────────────────────────────────────────────
    var color  = mix(surfaceGreen, shadowGreen, 1.0 - veinShadow);
    color      = mix(color, transmitWarm, clamp(transmission * 0.8, 0.0, 1.0));
    color      = mix(color, edgeColor, edgeLum * 0.6);

    // ── Breathing: slow amplitude oscillation ─────────────────────────────
    let breath = 0.92 + 0.08 * sin(et * 0.38 + veinBase * 2.0);
    let lum    = clamp(veinShadow * 0.6 + thickness * 0.4, 0.15, 1.0) * breath;

    return vec4<f32>(color * lum * u.intensity, u.intensity);
}
