import { tsl } from './tsl';

export const SILK_SOUL = (() => {
  const uv = tsl.env.uv();
  const entropy = tsl.env.entropy();
  const time = tsl.mul(tsl.env.time(), tsl.add(tsl.float(1.0), tsl.mul(entropy, tsl.float(0.005))));

  // 1. Silk "weave" pattern (anisotropic stretch)
  const stretchUV = tsl.vec2(
    tsl.member(uv, 'x', 'float'),
    tsl.mul(tsl.member(uv, 'y', 'float'), tsl.float(15.0)),
  );
  const weaveNoise = tsl.fbm(tsl.add(stretchUV, tsl.mul(time, tsl.float(0.5))), 6);

  // 2. Ripple of luminosity
  const ripple = tsl.add(
    tsl.mul(
      tsl.sin(
        tsl.add(
          tsl.add(tsl.mul(tsl.member(uv, 'x', 'float'), tsl.float(10.0)), time),
          tsl.mul(weaveNoise, tsl.float(2.0)),
        ),
      ),
      tsl.float(0.5),
    ),
    tsl.float(0.5),
  );

  // 3. Base color blending
  const baseColor = tsl.mix(
    tsl.env.base(),
    tsl.env.secondary(),
    tsl.mul(weaveNoise, tsl.float(0.4)),
  );
  const rippleColor = tsl.mix(baseColor, tsl.env.accent(), tsl.mul(ripple, tsl.float(0.3)));

  // 4. Highlight "shimmer" (Anisotropic highlight)
  const shimmer = tsl.mul(tsl.pow(ripple, tsl.float(8.0)), tsl.float(0.4));
  const finalColor = tsl.mix(rippleColor, tsl.env.highlight(), shimmer);

  return tsl.mul(finalColor, tsl.env.intensity());
})();
