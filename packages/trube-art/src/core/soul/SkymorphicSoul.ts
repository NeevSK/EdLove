import { tsl } from '@/core/soul/tsl';

export const SKYMORPHIC_SOUL = (() => {
  const uv = tsl.env.uv();
  const entropy = tsl.env.entropy();
  const time = tsl.mul(tsl.env.time(), tsl.add(tsl.float(1.0), tsl.mul(entropy, tsl.float(0.01))));

  // 1. Layered translucency
  const layer1 = tsl.fbm(tsl.add(tsl.mul(uv, tsl.float(2.0)), tsl.mul(time, tsl.float(0.2))), 5);
  const layer2 = tsl.fbm(tsl.sub(tsl.mul(uv, tsl.float(4.0)), tsl.mul(time, tsl.float(0.3))), 5);

  // 2. Background light bleed
  const bleed = tsl.smoothstep(tsl.float(0.3), tsl.float(0.7), tsl.mul(layer1, layer2));

  const baseColor = tsl.mix(tsl.env.base(), tsl.env.secondary(), tsl.mul(layer1, tsl.float(0.4)));
  const layeredColor = tsl.mix(baseColor, tsl.env.accent(), tsl.mul(layer2, tsl.float(0.3)));
  const finalColor = tsl.mix(layeredColor, tsl.env.highlight(), tsl.mul(bleed, tsl.float(0.5)));

  return tsl.mul(finalColor, tsl.env.intensity());
})();
