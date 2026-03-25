/**
 * water-surface.wgsl — Trübe-Art Soul Layer · Water Surface
 *
 * Light behavior: Dynamic micro-facet reflection. Flow-following
 * luminosity ribbons. Depth color shifting beneath surface.
 * Emotional quality: Reflective, Fluid.
 *
 * Physics:
 * — Normal map from derivative of flow noise → micro-facet reflection angle
 * — Fresnel-like edge brightening (more reflective at glancing angles)
 * — Luminosity ribbons: specular caustic patterns that follow flow direction
 * — Sub-surface color: warm ochre/earth tones visible through clear water
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

    let eps = 0.004; // finite difference step for normal estimation

    // ── Derive surface normals from flow noise gradient ───────────────────
    // Finite differences on flow noise → approximate surface normal
    let flowDir  = vec2<f32>(0.3, 0.15);  // gentle diagonal current
    let hC  = flowNoise(uv, et, flowDir, 0.25);
    let hX  = flowNoise(uv + vec2<f32>(eps, 0.0), et, flowDir, 0.25);
    let hY  = flowNoise(uv + vec2<f32>(0.0, eps), et, flowDir, 0.25);
    let dX  = (hX - hC) / eps;
    let dY  = (hY - hC) / eps;
    // Surface normal in view space (unnormalized, small angles ok for reflection)
    let normal = normalize(vec3<f32>(-dX * 0.6, -dY * 0.6, 1.0));

    // ── Reflection direction (simplified — sky above, earth below) ────────
    let viewDir    = vec3<f32>(0.0, 0.0, 1.0); // straight up view
    let reflectDir = reflect(-viewDir, normal);

    // Sky reflection color (matches what evening-sky would render at this angle)
    let skyRefl    = mix(
        vec3<f32>(0.30, 0.58, 0.88),   // mid-blue sky
        vec3<f32>(0.95, 0.72, 0.35),   // warm golden near-horizon
        clamp(1.0 - reflectDir.y, 0.0, 1.0)
    );

    // ── Fresnel-like edge intensity ────────────────────────────────────────
    let NdotV  = clamp(dot(normal, viewDir), 0.0, 1.0);
    let fresnel = pow(1.0 - NdotV, 3.5);  // high at glancing angles

    // ── Caustic luminosity ribbons ────────────────────────────────────────
    // Constructive interference of reflected light → bright caustic ribbons
    let causticA = abs(sin(hC * 18.0 + et * 2.1)) * 0.4;
    let causticB = abs(sin(hX * 14.0 - et * 1.7 + 1.3)) * 0.25;
    let caustics  = clamp(causticA + causticB, 0.0, 0.85);

    // ── Sub-surface color (visible where water is shallow/clear) ─────────
    let subsurface = vec3<f32>(0.25, 0.58, 0.52);  // teal-green clear water over sand
    let depth      = fbm(uv * 3.0 + et * 0.008, 3) * 0.5 + 0.5;
    let seaColor   = mix(vec3<f32>(0.04, 0.20, 0.38), subsurface, depth * 0.7);

    // ── Chromatic complement: blue water → warm orange shimmer shadow ─────
    let shadowWarm = vec3<f32>(0.62, 0.44, 0.22);
    let shadowMask  = 1.0 - NdotV;
    let waterColor  = mix(seaColor, shadowWarm * 0.35, shadowMask * 0.2);

    // ── Composite: water body + sky reflection + caustics ────────────────
    var finalColor  = mix(waterColor, skyRefl, fresnel * 0.7);
    finalColor      = mix(finalColor, vec3<f32>(1.0, 0.97, 0.88), caustics * 0.6);

    // Final luminosity
    let lum = clamp(0.35 + NdotV * 0.5 + caustics * 0.3, 0.2, 1.0);
    return vec4<f32>(finalColor * lum * u.intensity, u.intensity);
}
