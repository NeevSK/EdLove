import { type TSLExpression, tsl } from './tsl';

export const MotifLibrary = {
  /**
   * LotusSketch  A central focal geometry for spiritual clarity.
   * Implementation: Procedural petals using polar coordinates and jittered SDF.
   */
  lotus: (uv: TSLExpression, time: TSLExpression, _style: 'draft' | 'ink' | 'luminous') => {
    const centered = tsl.sub(uv, tsl.vec2(tsl.float(0.5), tsl.float(0.5)));
    const dist = tsl.length(centered);
    const _angle = tsl.sin(tsl.mul(dist, tsl.float(10.0))); // Rough petal base

    // Petal shape based on distance and angle
    const petal = tsl.smoothstep(tsl.float(0.35), tsl.float(0.3), dist);
    const modulation = tsl.add(
      tsl.float(0.8),
      tsl.mul(tsl.sin(tsl.add(tsl.mul(dist, tsl.float(20.0)), time)), tsl.float(0.2)),
    );

    const baseColor = tsl.mix(tsl.env.accent(), tsl.env.highlight(), modulation);
    return tsl.mul(baseColor, petal);
  },

  /**
   * TideLines  Meditative, horizontal flow representing memory and transition.
   * Implementation: Domain-warped sine waves with additive noise.
   */
  tide: (uv: TSLExpression, time: TSLExpression) => {
    const y = tsl.member(uv, 'y', 'float');
    const wave = tsl.sin(tsl.add(tsl.mul(y, tsl.float(50.0)), time));
    const noise = tsl.fbm(uv, 3);
    const line = tsl.smoothstep(tsl.float(0.1), tsl.float(0.0), tsl.abs(tsl.add(wave, noise)));

    return tsl.mul(tsl.env.secondary(), line);
  },

  /**
   * BranchFlow  Directional, organic structure for peripheral air.
   */
  branch: (uv: TSLExpression, _time: TSLExpression) => {
    const noise = tsl.fbm(tsl.mul(uv, tsl.float(5.0)), 4);
    const structure = tsl.smoothstep(tsl.float(0.45), tsl.float(0.5), noise);
    return tsl.mul(tsl.env.shadow(), structure);
  },
};
