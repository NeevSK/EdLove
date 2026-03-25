/**
 * noise.wgsl — Trübe-Art Soul Layer · Noise Vocabulary
 * 
 * Pure GPU math — zero texture lookups.
 * All functions are deterministic and portable across Vulkan/Metal/WebGPU.
 * 
 * Vocabulary:
 *   simplex2()    — Base turbidity · faster than Perlin, no directional artifacts
 *   fbm()         — Fractal Brownian Motion · self-similar complexity (clouds, water)
 *   domainWarp()  — Input coords displaced by noise · folding, fluid quality
 *   psrdnoise2()  — Periodic smoothly-rotatable noise · Silk anisotropy, normals
 *   flowNoise()   — Noise evolved along a vector field · Waterfall, flowing Silk
 *   metaNoise()   — 47s period entropy · prevents any surface from ever looping
 */

// =============================================================================
// § 1 — Simplex 2D Noise (Stefan Gustavson / Ian McEwan)
//       No gradient table lookup — fully analytical
// =============================================================================

fn _mod289v2(x: vec2<f32>) -> vec2<f32> {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

fn _mod289v3(x: vec3<f32>) -> vec3<f32> {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

fn _permute(x: vec3<f32>) -> vec3<f32> {
    return _mod289v3(((x * 34.0) + 10.0) * x);
}

fn simplex2(v: vec2<f32>) -> f32 {
    let C = vec4<f32>(
         0.211324865405187,   //  (3.0-sqrt(3.0))/6.0
         0.366025403784439,   //  0.5*(sqrt(3.0)-1.0)
        -0.577350269189626,   // -1.0+2.0*C.x
         0.024390243902439    //  1.0/41.0
    );

    // First corner
    var i  = floor(v + dot(v, C.yy));
    let x0 = v - i + dot(i, C.xx);

    // Other corners
    let i1 = select(vec2<f32>(0.0, 1.0), vec2<f32>(1.0, 0.0), x0.x > x0.y);
    var x12 = x0.xyxy + C.xxzz;
    x12 = vec4<f32>(x12.xy - i1, x12.zw);

    // Permutations
    i = _mod289v2(i);
    let p = _permute(
        _permute(i.y + vec3<f32>(0.0, i1.y, 1.0))
              + i.x + vec3<f32>(0.0, i1.x, 1.0)
    );

    var m = max(vec3<f32>(0.5) - vec3<f32>(
        dot(x0, x0),
        dot(x12.xy, x12.xy),
        dot(x12.zw, x12.zw)
    ), vec3<f32>(0.0));
    m = m * m;
    m = m * m;

    // Gradients — 41 evenly-spaced points on a line, mapped to a diamond
    let x_  = 2.0 * fract(p * C.www) - 1.0;
    let h   = abs(x_) - 0.5;
    let ox  = floor(x_ + 0.5);
    let a0  = x_ - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);

    let g = vec3<f32>(
        a0.x * x0.x    + h.x * x0.y,
        a0.y * x12.x   + h.y * x12.y,
        a0.z * x12.z   + h.z * x12.w
    );
    return 130.0 * dot(m, g);
}


// =============================================================================
// § 2 — Fractal Brownian Motion (fBm)
//       Self-similar complexity — use for aurora body, cloud, water
// =============================================================================

fn fbm(p: vec2<f32>, octaves: i32) -> f32 {
    var value    = 0.0;
    var amplitude = 0.5;
    var frequency = 1.0;
    var pp = p;
    for (var i = 0; i < octaves; i++) {
        value     += simplex2(pp * frequency) * amplitude;
        frequency *= 2.07;   // Slightly irrational — avoids harmonic aliases
        amplitude *= 0.48;
    }
    return value;
}


// =============================================================================
// § 3 — Domain Warp
//       Displaces input coords by fBm, then samples fBm again.
//       Creates the folding, fluid character of Mist and water edges.
// =============================================================================

fn domainWarp(p: vec2<f32>, strength: f32) -> f32 {
    let q = vec2<f32>(
        fbm(p + vec2<f32>(0.000, 0.000), 4),
        fbm(p + vec2<f32>(5.201, 1.302), 4)
    );
    return fbm(p + strength * q, 4);
}


// =============================================================================
// § 4 — psrdnoise2 — Periodic, Smoothly Rotatable 2D Noise
//       Used for Silk anisotropy (the shimmering directional highlight).
//       Based on Stefan Gustavson's GLSL implementation.
//       alpha: rotation angle of the gradients (radians)
//       period: tiling period (vec2)
// =============================================================================

fn psrdnoise2(x: vec2<f32>, period: vec2<f32>, alpha: f32) -> f32 {
    let M  = mat2x2<f32>(vec2<f32>(1.0, -0.5), vec2<f32>(0.0, 0.866025404));
    let Mi = mat2x2<f32>(vec2<f32>(1.0,  0.577350269), vec2<f32>(0.0, 1.154700538));

    var uvx = M * x;
    var i0  = floor(uvx);
    var f0  = fract(uvx);

    // Skewed triangular grid
    let i1 = i0 + vec2<f32>(1.0, 0.0);
    let i2 = i0 + vec2<f32>(0.0, 1.0);
    let i3 = i0 + vec2<f32>(1.0, 1.0);

    var j0 = _mod289v2(i0 % period);
    var j1 = _mod289v2(i1 % period);
    var j2 = _mod289v2(i2 % period);
    var j3 = _mod289v2(i3 % period);

    let ca = cos(alpha); let sa = sin(alpha);
    let rot = mat2x2<f32>(vec2<f32>(ca, sa), vec2<f32>(-sa, ca));

    // Gradient hash — simplified version without the full psrdnoise table
    let h0 = fract(sin(dot(j0, vec2<f32>(127.1, 311.7))) * 43758.5453);
    let h1 = fract(sin(dot(j1, vec2<f32>(127.1, 311.7))) * 43758.5453);
    let h2 = fract(sin(dot(j2, vec2<f32>(127.1, 311.7))) * 43758.5453);
    let h3 = fract(sin(dot(j3, vec2<f32>(127.1, 311.7))) * 43758.5453);

    let g0 = rot * (normalize(vec2<f32>(cos(h0 * 6.2831), sin(h0 * 6.2831))));
    let g1 = rot * (normalize(vec2<f32>(cos(h1 * 6.2831), sin(h1 * 6.2831))));
    let g2 = rot * (normalize(vec2<f32>(cos(h2 * 6.2831), sin(h2 * 6.2831))));
    let g3 = rot * (normalize(vec2<f32>(cos(h3 * 6.2831), sin(h3 * 6.2831))));

    let x0 = Mi * (vec2<f32>(f0.x,      f0.y));
    let x1 = Mi * (vec2<f32>(f0.x-1.0,  f0.y));
    let x2 = Mi * (vec2<f32>(f0.x,      f0.y-1.0));
    let x3 = Mi * (vec2<f32>(f0.x-1.0,  f0.y-1.0));

    var w  = vec4<f32>(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3));
    w = max(0.5 - w, vec4<f32>(0.0));
    w = w * w * w * w;

    let v = vec4<f32>(
        dot(g0, x0), dot(g1, x1), dot(g2, x2), dot(g3, x3)
    );
    return dot(w, v) * 11.0;
}


// =============================================================================
// § 5 — Flow Noise
//       Noise evolved along a directional vector field.
//       Creates the directional motion of Waterfall and flowing Silk.
//       dir: normalized flow direction · speed: flow rate
// =============================================================================

fn flowNoise(p: vec2<f32>, t: f32, dir: vec2<f32>, speed: f32) -> f32 {
    let offset = dir * t * speed;
    let n0 = fbm(p + offset, 5);
    let n1 = fbm(p + offset * 0.7 + vec2<f32>(1.7, 9.2), 4);
    return mix(n0, n1, 0.3);
}


// =============================================================================
// § 6 — Meta-Noise (Kells Entropy Signal)
//       Minimum period: 47 seconds — guarantees zero visible loops.
//       Low frequency · high period · applied to seed/time values only.
//       Returns a ±0.02 modulator — barely perceptible individually,
//       profound in its prevention of perfect periodicity.
// =============================================================================

fn metaNoise(t: f32) -> f32 {
    // Three co-prime periods: 47s, 53.3s, 61.7s
    // Their LCM exceeds 3 hours — effectively aperiodic on any screen session
    let e0 = simplex2(vec2<f32>(t / 47.0,  0.371)) * 0.012;
    let e1 = simplex2(vec2<f32>(t / 53.3,  3.141)) * 0.006;
    let e2 = simplex2(vec2<f32>(t / 61.7,  7.389)) * 0.003;
    return e0 + e1 + e2;
}

// Convenience: entropy-modulated time
fn entropyTime(t: f32) -> f32 {
    return t + metaNoise(t);
}
