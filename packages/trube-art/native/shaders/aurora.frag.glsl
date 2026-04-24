#version 450

layout(location = 0) in vec2 v_uv;
layout(location = 0) out vec4 f_color;

layout(set = 0, binding = 0) uniform Uniforms {
    float time;
    vec2 resolution;
} ubo;

// ── Simplex Noise 2D (McEwan) ────────────────────────────────────────────────

vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                        -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
                    + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
                            dot(x12.zw,x12.zw)), 0.0);
    m = m*m;
    m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
}

// ── 4-Octave fBm ──────────────────────────────────────────────────────────────

float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
    for (int i = 0; i < 4; i++) {
        v += a * snoise(p);
        p = rot * p * 2.0 + vec2(10.0);
        a *= 0.5;
    }
    return v;
}

// ── Palette ──────────────────────────────────────────────────────────────────

vec3 palette(float t) {
    vec3 a = vec3(0.1, 0.2, 0.3); // deep
    vec3 b = vec3(0.5, 0.8, 0.6); // green
    vec3 c = vec3(0.8, 0.4, 0.9); // violet
    vec3 d = vec3(1.0, 1.0, 1.0); // white
    
    if (t < 0.3) return mix(a, b, t / 0.3);
    if (t < 0.6) return mix(b, c, (t - 0.3) / 0.3);
    return mix(c, d, (t - 0.6) / 0.4);
}

void main() {
    vec2 uv = v_uv;
    float time = ubo.time;
    
    // Entropy scale modulation
    float scaleMod = snoise(vec2(time * 0.003, 1.0)) * 0.2 + 0.8;
    vec2 p = (uv * 2.0 - 1.0) * vec2(ubo.resolution.x / ubo.resolution.y, 1.0) * scaleMod;
    
    // Vertical column bias for aurora
    p.x *= 0.5; 
    
    // Domain Warp
    float q_val = fbm(p + vec2(0.0, time * 0.05));
    vec2 q = vec2(q_val, fbm(p + vec2(5.2, 1.3)));
    
    float noise_val = fbm(p + q + time * 0.08);
    
    // Color mapping
    vec3 col = palette(clamp(noise_val * 0.8 + 0.4, 0.0, 1.0));
    
    // vertical bias again for the "curtain" feel
    float curtain = smoothstep(0.0, 0.8, noise_val + 0.2);
    col *= curtain;
    
    // Soft alpha edge dissolve
    float alpha = smoothstep(0.0, 0.2, uv.y) * smoothstep(1.0, 0.8, uv.y);
    alpha *= smoothstep(0.0, 0.1, uv.x) * smoothstep(1.0, 0.9, uv.x);
    
    f_color = vec4(col, alpha * 0.9);
}
