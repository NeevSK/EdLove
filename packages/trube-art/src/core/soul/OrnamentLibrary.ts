import { tsl, TSLExpression } from './tsl';

export const OrnamentLibrary = {
  /**
   * Constellation — A scattered field of points and light edges.
   */
  constellation: (uv: TSLExpression, time: TSLExpression) => {
    const noise = tsl.fbm(tsl.mul(uv, tsl.float(100.0)), 2);
    const points = tsl.smoothstep(tsl.float(0.98), tsl.float(1.0), noise);
    return tsl.mul(tsl.env.highlight(), points);
  },

  /**
   * Filigree — Delicate, vine-like connections (High-frequency noise).
   */
  filigree: (uv: TSLExpression, time: TSLExpression) => {
    const warp = tsl.warp(uv, tsl.float(0.2));
    const noise = tsl.fbm(tsl.mul(warp, tsl.float(20.0)), 5);
    const lines = tsl.smoothstep(tsl.float(0.4), tsl.float(0.42), noise);
    return tsl.mul(tsl.env.mist(), lines);
  },

  /**
   * VeinDetail — Subsurface structural lines.
   */
  vein: (uv: TSLExpression, time: TSLExpression) => {
    const noise = tsl.fbm(tsl.mul(uv, tsl.float(10.0)), 6);
    const structure = tsl.smoothstep(tsl.float(0.5), tsl.float(0.51), noise);
    return tsl.mul(tsl.env.shadow(), tsl.mul(structure, tsl.float(0.3)));
  }
};
