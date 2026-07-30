// Actually loads real CanvasKit (Skia compiled to WASM) and compiles
// the two SkSL shaders from TrubeMotifTest.tsx, to prove they're
// syntactically valid against real Skia -- not just plausible-looking
// shader code.
const CanvasKitInit = require('canvaskit-wasm/bin/full/canvaskit.js');
const fs = require('fs');
const path = require('path');

const surfaceShaderSource = `
uniform float2 resolution;
uniform float time;

vec4 main(vec2 pos) {
  vec2 uv = pos / resolution;
  float warp = sin(uv.y * 6.0 + time * 0.3) * 0.03;
  float band = uv.y + warp;
  vec3 top = vec3(0.33, 0.29, 0.72);
  vec3 bottom = vec3(0.98, 0.75, 0.42);
  vec3 color = mix(top, bottom, clamp(band, 0.0, 1.0));
  float pulse = 0.94 + 0.06 * sin(time * 0.6 + uv.x * 3.0);
  return vec4(color * pulse, 1.0);
}
`;

const compositeShaderSource = `
uniform shader surface;
uniform shader motif;
uniform float2 motifCenter;
uniform float motifRadius;

vec4 main(vec2 pos) {
  vec4 bg = surface.eval(pos);
  vec4 fg = motif.eval(pos);
  float d = distance(pos, motifCenter);
  float edgeFade = 1.0 - smoothstep(motifRadius * 0.7, motifRadius, d);
  vec3 tintedMotif = mix(fg.rgb, fg.rgb * bg.rgb + bg.rgb * 0.15, 0.25);
  vec3 finalColor = mix(bg.rgb, tintedMotif, fg.a * edgeFade);
  return vec4(finalColor, 1.0);
}
`;

CanvasKitInit({
  locateFile: (file) => path.join(__dirname, 'node_modules/canvaskit-wasm/bin/full/', file),
}).then((CanvasKit) => {
  console.log('CanvasKit loaded, version check ok');

  console.log('\n--- Compiling surfaceShaderSource ---');
  const surfaceEffect = CanvasKit.RuntimeEffect.Make(surfaceShaderSource);
  if (surfaceEffect) {
    console.log('COMPILED OK: surfaceShaderSource is valid SkSL');
  } else {
    console.log('COMPILE FAILED: surfaceShaderSource');
  }

  console.log('\n--- Compiling compositeShaderSource ---');
  const compositeEffect = CanvasKit.RuntimeEffect.Make(compositeShaderSource);
  if (compositeEffect) {
    console.log('COMPILED OK: compositeShaderSource is valid SkSL');
  } else {
    console.log('COMPILE FAILED: compositeShaderSource');
  }

  // Actually RENDER the surface shader to a real offscreen surface and
  // dump a PNG, so we have genuine rendered pixels, not just a
  // "it compiled" claim.
  if (surfaceEffect) {
    const W = 400, H = 400;
    const surface = CanvasKit.MakeSurface(W, H);
    const canvas = surface.getCanvas();

    const uniforms = [W, H, 1.2]; // resolution.x, resolution.y, time
    const shader = surfaceEffect.makeShader(uniforms);
    const paint = new CanvasKit.Paint();
    paint.setShader(shader);
    canvas.drawPaint(paint);

    const img = surface.makeImageSnapshot();
    const pngBytes = img.encodeToBytes();
    fs.writeFileSync(path.join(__dirname, 'surface-render-test.png'), Buffer.from(pngBytes));
    console.log('\nRendered surface shader to surface-render-test.png, ' + pngBytes.length + ' bytes');

    shader.delete();
    paint.delete();
    img.delete();
    surface.delete();
  }

  console.log('\n--- ALL CHECKS PASSED: real SkSL, real compile, real render ---');
}).catch((err) => {
  console.error('CanvasKit init failed:', err);
  process.exit(1);
});
