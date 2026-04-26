import { tsl } from './tsl';

export const AURORA_SOUL = (() => {
  const uv = tsl.env.uv();
  const entropy = tsl.env.entropy();
  const time = tsl.mul(tsl.env.time(), tsl.add(tsl.float(1.0), tsl.mul(entropy, tsl.float(0.01))));

  // 1. Columnar vertical diffusion (Aurora characteristic)
  const stretchUV = tsl.vec2(
    tsl.mul(tsl.member(uv, 'x', 'float'), tsl.float(0.5)),
    tsl.member(uv, 'y', 'float'),
  );
  const movement = tsl.vec2(tsl.float(0), tsl.mul(time, tsl.float(0.2)));

  const noise = tsl.fbm(tsl.add(stretchUV, movement), 4);

  // 2. High luminosity variation (Goethe - Colors as deeds and sufferings of light)
  // Shift from Deep Violet (2500K) to Ethereal Green (12000K)
  const temp = tsl.mix(tsl.float(2500), tsl.float(12000), noise);
  const auroraColor = tsl.kelvin(temp);

  // 3. Vertical fade (Grows from the horizon/bottom)
  const verticalFade = tsl.smoothstep(tsl.float(0.0), tsl.float(0.8), tsl.member(uv, 'y', 'float'));

  return tsl.mul(auroraColor, tsl.mul(verticalFade, tsl.env.intensity()));
})();
