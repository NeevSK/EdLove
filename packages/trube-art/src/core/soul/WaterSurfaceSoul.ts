import { tsl } from './tsl';

export const WATER_SURFACE_SOUL = (() => {
  const uv = tsl.env.uv();
  const entropy = tsl.env.entropy();
  const time = tsl.mul(tsl.env.time(), tsl.add(tsl.float(1.0), tsl.mul(entropy, tsl.float(0.01))));

  // 1. Wave movement (Nested FBM)
  const movement = tsl.vec2(
    tsl.fbm(tsl.add(uv, time), 5),
    tsl.fbm(tsl.sub(uv, tsl.mul(time, tsl.float(0.8))), 5),
  );
  const waves = tsl.fbm(tsl.add(tsl.mul(uv, tsl.float(4.0)), tsl.mul(movement, tsl.float(0.5))), 5);

  // 2. Micro-facet reflection logic
  const reflection = tsl.mul(tsl.pow(waves, tsl.float(4.0)), tsl.float(1.5));

  // 3. Flow-following ribbons (Secondary movement)
  const ribbons = tsl.sin(
    tsl.add(
      tsl.add(
        tsl.mul(tsl.member(uv, 'x', 'float'), tsl.float(6.0)),
        tsl.mul(waves, tsl.float(4.0)),
      ),
      time,
    ),
  );

  // 4. Color composition
  const baseColor = tsl.mix(tsl.env.base(), tsl.env.secondary(), tsl.mul(waves, tsl.float(0.6)));
  const ribbonColor = tsl.mix(baseColor, tsl.env.accent(), tsl.mul(ribbons, tsl.float(0.2)));
  const finalColor = tsl.mix(ribbonColor, tsl.env.highlight(), tsl.mul(reflection, tsl.float(0.4)));

  return tsl.mul(finalColor, tsl.env.intensity());
})();
