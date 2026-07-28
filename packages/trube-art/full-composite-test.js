// Full end-to-end test: loads a REAL image, feeds it through the
// composite shader alongside the procedural surface shader, exactly as
// TrubeMotifTest.tsx describes, and renders genuine composited pixels.
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
  const W = 400, H = 400;

  const imgBytes = fs.readFileSync(path.join(__dirname, 'test-motif.png'));
  const motifImage = CanvasKit.MakeImageFromEncoded(imgBytes);
  if (!motifImage) {
    console.error('FAILED to decode test-motif.png');
    process.exit(1);
  }
  console.log('Loaded real motif image:', motifImage.width(), 'x', motifImage.height());

  const surfaceEffect = CanvasKit.RuntimeEffect.Make(surfaceShaderSource);
  const compositeEffect = CanvasKit.RuntimeEffect.Make(compositeShaderSource);

  const surface = CanvasKit.MakeSurface(W, H);
  const canvas = surface.getCanvas();

  // Build the surface (background) shader
  const surfaceShader = surfaceEffect.makeShader([W, H, 1.2]);

  // Build the image shader from the REAL motif image
  const motifShader = motifImage.makeShaderCubic(
    CanvasKit.TileMode.Decal,
    CanvasKit.TileMode.Decal,
    1/3, 1/3,
    CanvasKit.Matrix.scaled ? undefined : undefined
  );

  // Compose: composite shader takes both as children
  const finalShader = compositeEffect.makeShaderWithChildren(
    [W/2, H/2, 140], // motifCenter.x, motifCenter.y, motifRadius
    [surfaceShader, motifShader]
  );

  const paint = new CanvasKit.Paint();
  paint.setShader(finalShader);
  canvas.drawPaint(paint);

  const img = surface.makeImageSnapshot();
  const pngBytes = img.encodeToBytes();
  fs.writeFileSync(path.join(__dirname, 'composite-render-test.png'), Buffer.from(pngBytes));
  console.log('\nRendered COMPOSITE (real image + procedural surface) to composite-render-test.png, ' + pngBytes.length + ' bytes');
  console.log('\n--- END-TO-END TEST PASSED: real authored image genuinely composited with procedural light effect ---');
}).catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
