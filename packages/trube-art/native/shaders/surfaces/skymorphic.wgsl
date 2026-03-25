/**
 * skymorphic.wgsl — Trübe-Art Soul Layer · Skymorphic
 *
 * Light behavior: Layered translucency compositing. Depth blur.
 * Background light bleeding forward through layers.
 * Emotional quality: Deep, Infinite.
 *
 * The "window into the earth / sky" effect. Multiple semi-transparent
 * depth layers, each carrying different color temperatures:
 * — Foreground: near-transparent, atmospheric haze
 * — Mid layers: color shifting, slightly warmer
 * — Background: deepest, darkest, coolest
 * Light bleeds from behind — no flat compositing.
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

// Composite one translucent layer over a background (Porter-Duff OVER)
fn layerOver(bg: vec4<f32>, fg: vec4<f32>) -> vec4<f32> {
    let a = fg.a + bg.a * (1.0 - fg.a);
    if (a < 0.001) { return vec4<f32>(0.0); }
    let rgb = (fg.rgb * fg.a + bg.rgb * bg.a * (1.0 - fg.a)) / a;
    return vec4<f32>(rgb, a);
}

@fragment
fn fs_main(@builtin(position) fc: vec4<f32>) -> @location(0) vec4<f32> {
    let uv = fc.xy / vec2<f32>(u.resX, u.resY);
    let et = entropyTime(u.time);

    // ── Layer 0 — Background (deepest, darkest, barely moving) ──────────
    let bg_n = fbm(uv * 1.1 + vec2<f32>(et * 0.004, et * 0.002), 5);
    let bgColor = vec3<f32>(0.04, 0.07, 0.18); // deep night blue
    let bgAlpha = 0.92;
    var result  = vec4<f32>(bgColor * (bg_n * 0.3 + 0.7), bgAlpha);

    // ── Layer 1 — Mid depth (slow horizontal drift) ───────────────────────
    let l1_n    = domainWarp(uv * 2.0 + vec2<f32>(et * 0.012, -et * 0.007), 2.0);
    let l1Color = vec3<f32>(0.12, 0.22, 0.52); // deep-sea indigo
    let l1Alpha = clamp(l1_n * 0.5 + 0.35, 0.0, 0.65);
    result = layerOver(result, vec4<f32>(l1Color, l1Alpha));

    // ── Layer 2 — Mid-foreground (warmer, slightly faster) ────────────────
    let l2_n    = fbm(uv * 3.5 + vec2<f32>(-et * 0.018, et * 0.011), 4);
    let l2warm  = vec3<f32>(0.28, 0.38, 0.72); // warmer, closer blue-violet
    let l2Alpha = clamp(l2_n * 0.4 + 0.2, 0.0, 0.50);
    result = layerOver(result, vec4<f32>(l2warm, l2Alpha));

    // ── Layer 3 — Foreground haze (near-transparent atmospheric) ─────────
    let l3_n    = simplex2(uv * 6.0 + et * 0.04) * 0.5 + 0.5;
    let l3Color = vec3<f32>(0.55, 0.68, 0.92); // sky-lit haze
    let l3Alpha = l3_n * 0.25;
    result = layerOver(result, vec4<f32>(l3Color, l3Alpha));

    // ── Light bleed from background (depth glow) ──────────────────────────
    // Where all layers are thin, background light bleeds forward visibly
    let bleedMask = 1.0 - result.a;
    let bleedLight = vec3<f32>(0.08, 0.14, 0.38);
    result.rgb = mix(result.rgb, result.rgb + bleedLight, clamp(bleedMask, 0.0, 0.4));

    // ── Chromatic complement: cool depth → warm surface ───────────────────
    let depthWarm = vec3<f32>(0.35, 0.28, 0.62); // violet warmth at surface
    let complement = fbm(uv * 4.0 + et * 0.005, 3);
    result.rgb = mix(result.rgb, depthWarm, clamp(complement * 0.15, 0.0, 0.15));

    return vec4<f32>(result.rgb * u.intensity, clamp(result.a * u.intensity, 0.0, 1.0));
}
