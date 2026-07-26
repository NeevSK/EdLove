import { tsl } from '@/core/soul/tsl';

export const WATERFALL_SOUL = (() => {
  const uv = tsl.env.uv();
  const entropy = tsl.env.entropy();
  const time = tsl.mul(tsl.env.time(), tsl.add(tsl.float(1.0), tsl.mul(entropy, tsl.float(0.015))));

  // 1. Vertical flow noise (Living dynamics)
  const flowUV = tsl.add(
    tsl.mul(uv, tsl.vec2(tsl.float(2.0), tsl.float(8.0))),
    tsl.vec2(tsl.float(0), tsl.sub(tsl.float(0), time)),
  );
  const flowNoise = tsl.fbm(flowUV, 4);

  // 2. Aeration (whitening/foam)
  const foam = tsl.smoothstep(tsl.float(0.4), tsl.float(0.9), flowNoise);

  // 3. Goethe Color Logic: Shift to cool splash
  const baseColor = tsl.mix(
    tsl.env.base(),
    tsl.env.secondary(),
    tsl.mul(flowNoise, tsl.float(0.5)),
  );
  const foamingColor = tsl.mix(baseColor, tsl.env.accent(), tsl.mul(foam, tsl.float(0.8)));

  return tsl.mul(foamingColor, tsl.env.intensity());
})();
