import { tsl } from './tsl';

export const EVENING_SKY_SOUL = (() => {
  const uv = tsl.env.uv();
  const entropy = tsl.env.entropy();
  const time = tsl.mul(tsl.env.time(), tsl.add(tsl.float(1.0), tsl.mul(entropy, tsl.float(0.002))));
  
  const y = tsl.member(uv, 'y', 'float');
  const x = tsl.member(uv, 'x', 'float');
  
  // 1. Rayleigh scattering approximation (vertical gradient)
  const atmosphere = tsl.pow(tsl.sub(tsl.float(1.0), y), tsl.float(2.0));
  const skyColor = tsl.mix(tsl.env.base(), tsl.env.secondary(), atmosphere);
  
  // 2. Sunset glow
  const sunset = tsl.smoothstep(tsl.float(0.8), tsl.float(0.2), tsl.add(x, tsl.mul(tsl.sin(time), tsl.float(0.1))));
  const coloredSky = tsl.mix(skyColor, tsl.env.accent(), tsl.mul(sunset, atmosphere));
  
  // 3. Cloud-like turbidity
  const clouds = tsl.fbm(tsl.add(tsl.mul(uv, tsl.float(3.0)), tsl.vec2(time, tsl.float(0))), 3);
  const finalSky = tsl.mix(coloredSky, tsl.env.highlight(), tsl.mul(tsl.mul(clouds, tsl.float(0.15)), atmosphere));
  
  return tsl.mul(finalSky, tsl.env.intensity());
})();
