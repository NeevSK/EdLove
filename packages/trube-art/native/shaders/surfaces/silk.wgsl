/**
 * silk.wgsl — Trübe-Art Soul Layer · Silk
 *
 * Light behavior: Anisotropic reflection. High micro-variation.
 * Ripple of luminosity on movement.
 * Emotional quality: Tactile, Luxurious.
 *
 * Goethe: Warm highlights (warm silk in light) against
 * chromatic-complement cool shadows (the silk's underside).
 * psrdnoise drives the directional shimmer — the characteristic
 * quality that makes silk feel woven, not painted.
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

    // ── Anisotropic highlight — psrdnoise with slowly rotating alpha ──────
    // alpha changes over time: the highlight slides like cloth moving in light
    let alpha  = et * 0.04 + 0.5;    // gentle rotation of gradient direction
    let period = vec2<f32>(4.0, 4.0); // tile period — silk has repeating weave

    // Two layers at different scales give the micro/macro warp-weft feel
    let coarseHighlight = psrdnoise2(uv * 3.5, period, alpha);
    let fineWeave       = psrdnoise2(uv * 12.0, period * 0.5, alpha + 0.3) * 0.4;
    let highlight = coarseHighlight + fineWeave;

    // ── Micro-variation: no region feels stamped ──────────────────────────
    let micro = simplex2(uv * 28.0 + et * 0.06) * 0.06;

    // ── Temporal shimmer: luminosity ripple on gentle motion ─────────────
    let ripple = sin(uv.x * 18.0 + uv.y * 6.0 + et * 0.9) * 0.04;

    // ── Base silk color: warm cream to cool champagne ─────────────────────
    let warmCream  = vec3<f32>(0.96, 0.89, 0.72); // illuminated warp threads
    let coolSilver = vec3<f32>(0.72, 0.78, 0.88); // shadowed weft threads
    let goldEdge   = vec3<f32>(1.0,  0.88, 0.52); // thin edges catching light

    // Chromatic complement shadow under highlight (cool blue where warm cream peaks)
    let shadowComplement = vec3<f32>(0.52, 0.62, 0.88);

    // Blend driven by anisotropic highlight strength
    let h = clamp(highlight * 0.5 + 0.5, 0.0, 1.0);
    let baseColor = mix(shadowComplement, warmCream, h);
    let edgeColor = mix(baseColor, goldEdge, clamp((highlight - 0.6) * 3.0, 0.0, 1.0));

    // ── Depth pigment: cooler beneath the surface's depth center ─────────
    let depth = fbm(uv * 2.0 + et * 0.01, 3);
    let finalColor = mix(edgeColor, coolSilver * 0.85, depth * 0.2);

    // ── Luminosity: ripple + highlight ────────────────────────────────────
    let lum = clamp(0.55 + h * 0.4 + ripple + micro, 0.3, 1.0);

    return vec4<f32>(finalColor * lum * u.intensity, u.intensity);
}
