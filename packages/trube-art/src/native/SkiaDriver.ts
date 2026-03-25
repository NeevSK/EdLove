import { Skia, SkRuntimeEffect } from '@shopify/react-native-skia';
import { soulLibrary } from '../core/soul/SoulLibrary';

/**
 * SkiaDriver: Tier 3 rendering path (Last Resort).
 * Reliable, high-fidelity fallback for absolute compatibility.
 */
export class SkiaDriver {
  private cache: Map<string, SkRuntimeEffect> = new Map();

  constructor() {
    console.log('[Trübe-Art] SkiaDriver Initialized (Tier 3)');
  }

  /**
   * Pre-warms all Skia effects.
   */
  public prewarm() {
    for (const name of soulLibrary.getSurfaceNames()) {
      const effect = soulLibrary.getSkiaEffect(name);
      if (effect) this.cache.set(name, effect);
    }
    console.log(`[Trübe-Art] [Tier 3] Skia Pre-warmed ${this.cache.size} surfaces.`);
  }

  /**
   * Gets a pre-warmed Skia effect.
   */
  getEffect(name: string): SkRuntimeEffect | null {
    return soulLibrary.getSkiaEffect(name);
  }

  /**
   * Renders the soul via Skia RuntimeEffect.
   * @deprecated Use building uniforms in the component
   */
  render(name: string, uniforms: Record<string, any>) {
    const effect = this.getEffect(name);
    if (!effect) return null;
    return { effect, uniforms };
  }

  /**
   * Helper to build the standard uniform record for Skia.
   */
  buildUniforms(
    surface: any,
    time: number,
    entropy: number,
    width: number,
    height: number
  ) {
    const toRGB = (hex: string) => {
      const color = Skia.Color(hex) as unknown as number;
      return [
        ((color >> 16) & 255) / 255,
        ((color >> 8) & 255) / 255,
        (color & 255) / 255,
      ];
    };

    return {
      u_time: time,
      u_entropy: entropy,
      u_res: [width, height],
      u_intensity: surface.alpha ?? 1.0,
      u_base: toRGB(surface.palette.base),
      u_accent: toRGB(surface.palette.accent),
      u_highlight: toRGB(surface.palette.highlight),
      u_shadow: toRGB(surface.palette.shadow),
    };
  }
}
