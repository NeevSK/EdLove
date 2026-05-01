import { resolveSurface } from './surface';
import type {
  TrubeEnvironment,
  TrubeQuality,
  TrubeRenderPlan,
  TrubeResolvedQuality,
  TrubeSurfaceName,
  TrubeSurfaceSpec,
} from './types';

const QUALITY_PRESETS: Record<
  TrubeResolvedQuality,
  Omit<TrubeRenderPlan, 'capabilityTier' | 'quality' | 'backend' | 'timeDriver'>
> = {
    cinematic: {
      architectureVersion: 'v1',
      animationEnabled: true,
      resolutionScale: 0.66,
      updateIntervalMs: 34,
      detail: 3,
      grainOpacity: 0.05,
      layerOpacity: 0.42,
    },
    balanced: {
      architectureVersion: 'v1',
      animationEnabled: true,
      resolutionScale: 0.56,
      updateIntervalMs: 48,
      detail: 2,
      grainOpacity: 0.04,
      layerOpacity: 0.34,
    },
    efficient: {
      architectureVersion: 'v1',
      animationEnabled: true,
      resolutionScale: 0.42,
      updateIntervalMs: 72,
      detail: 1,
      grainOpacity: 0.03,
      layerOpacity: 0.26,
    },
    static: {
      architectureVersion: 'v1',
      animationEnabled: false,
      resolutionScale: 0.32,
      updateIntervalMs: 0,
      detail: 0,
      grainOpacity: 0.025,
      layerOpacity: 0.18,
  },
};

function resolveCapabilityTier(
  environment: TrubeEnvironment = {},
): TrubeRenderPlan['capabilityTier'] {
  if (environment.capabilityTier) {
    return environment.capabilityTier;
  }

  if (typeof environment.apiLevel === 'number' && environment.apiLevel < 29) {
    return 'compatibility';
  }

  if (typeof environment.apiLevel === 'number' && environment.apiLevel <= 30) {
    return 'tier-2';
  }

  if (environment.lowPowerMode || environment.thermalState === 'hot') {
    return 'compatibility';
  }

  if (environment.pixelRatio && environment.pixelRatio < 2) {
    return 'tier-2';
  }

  return 'tier-1';
}

function resolveQuality(
  inputQuality: TrubeQuality,
  environment: TrubeEnvironment = {},
  recommended: TrubeResolvedQuality,
): TrubeResolvedQuality {
  if (inputQuality !== 'auto') {
    return inputQuality;
  }

  if (
    environment.prefersReducedMotion ||
    environment.lowPowerMode ||
    environment.thermalState === 'hot'
  ) {
    return 'static';
  }

  const tier = resolveCapabilityTier(environment);
  if (tier === 'compatibility') {
    return 'static';
  }

  if (tier === 'tier-2' || environment.thermalState === 'warm') {
    return recommended === 'cinematic' ? 'balanced' : 'efficient';
  }

  return recommended;
}

export function createRenderPlan(
  input: TrubeSurfaceSpec | TrubeSurfaceName,
  quality: TrubeQuality = 'auto',
  environment: TrubeEnvironment = {},
): TrubeRenderPlan {
  const resolvedSurface = resolveSurface(input);
  const capabilityTier = resolveCapabilityTier(environment);
  const resolvedQuality = resolveQuality(
    quality,
    environment,
    resolvedSurface.preset.recommendedQuality,
  );
  const basePlan = QUALITY_PRESETS[resolvedQuality];

  if (capabilityTier === 'compatibility') {
    return {
      capabilityTier,
      quality: 'static',
      backend: 'compatibility-static',
      timeDriver: 'static',
      ...QUALITY_PRESETS.static,
    };
  }

  const architectureVersion = capabilityTier === 'tier-1' ? 'v2' : 'v1';

  // Use DriverManager to pick the actual functional backend at runtime
  // but we default the plan to the capability tier's preferred backend.
  const backend =
    capabilityTier === 'tier-1'
      ? environment.pixelRatio && environment.pixelRatio > 2
        ? 'native-vulkan'
        : 'native-metal'
      : capabilityTier === 'tier-2'
        ? 'webgpu'
        : 'skia-runtime-effect';

  const timeDriver =
    resolvedQuality === 'static'
      ? 'static'
      : architectureVersion === 'v2'
        ? 'reanimated'
        : 'animated-legacy';

  const thermalScale =
    environment.thermalState === 'hot' ? 0.5 : environment.thermalState === 'warm' ? 0.8 : 1.0;

  return {
    capabilityTier,
    backend,
    timeDriver,
    quality: resolvedQuality,
    ...basePlan,
    resolutionScale: basePlan.resolutionScale * thermalScale,
    architectureVersion,
    motif: resolvedSurface.options.motif,
    ornament: resolvedSurface.options.ornament,
  };
}
