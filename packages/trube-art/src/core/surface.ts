import { clamp, mix } from '@repo/trube-art/core/color';
import { getSurfacePreset } from '@repo/trube-art/core/presets';
import type {
  ResolvedTrubeSurface,
  TrubeLightingMode,
  TrubePalette,
  TrubeSurfaceName,
  TrubeSurfaceOptions,
  TrubeSurfaceSpec,
} from '@repo/trube-art/core/types';

const COOL_LIGHT = '#7fc8de';
const WARM_LIGHT = '#f0bc7e';
const NIGHT_SHADOW = '#07101c';
const DAY_LIFT = '#f8f1e5';

const LIGHTING_TEMPERATURE: Record<TrubeLightingMode, number> = {
  predawn: -0.2,
  morning: 0.16,
  midday: 0.04,
  'golden-hour': 0.26,
  dusk: 0.08,
  night: -0.28,
};

const LIGHTING_BRIGHTNESS: Record<TrubeLightingMode, number> = {
  predawn: -0.08,
  morning: 0.1,
  midday: 0.14,
  'golden-hour': 0.08,
  dusk: -0.03,
  night: -0.12,
};

const INTENSITY_ALPHA: Record<NonNullable<TrubeSurfaceOptions['intensity']>, number> = {
  subtle: 0.78,
  balanced: 1,
  vivid: 1.18,
};

const MOTION_PERIOD_MULTIPLIER: Record<NonNullable<TrubeSurfaceOptions['motion']>, number> = {
  still: 1.4,
  gentle: 1,
  alive: 0.78,
};

const GRAIN_MULTIPLIER: Record<NonNullable<TrubeSurfaceOptions['grain']>, number> = {
  soft: 0.8,
  standard: 1,
  rich: 1.18,
};

function resolvePalette(
  name: TrubeSurfaceName,
  palette: TrubePalette,
  light: TrubeLightingMode,
): TrubePalette {
  const temperature = LIGHTING_TEMPERATURE[light];
  const brightness = LIGHTING_BRIGHTNESS[light];
  const temperatureTarget = temperature >= 0 ? WARM_LIGHT : COOL_LIGHT;
  const brightnessTarget = brightness >= 0 ? DAY_LIFT : NIGHT_SHADOW;

  const accentTemperature = Math.abs(temperature) * (name === 'aurora' ? 0.32 : 0.18);
  const secondaryTemperature = Math.abs(temperature) * (name === 'young-leaf' ? 0.28 : 0.16);
  const baseBrightness = Math.abs(brightness) * (name === 'mist' ? 0.24 : 0.14);

  return {
    base: mix(palette.base, brightnessTarget, baseBrightness),
    accent: mix(palette.accent, temperatureTarget, accentTemperature),
    secondary: mix(palette.secondary, temperatureTarget, secondaryTemperature),
    shadow: mix(palette.shadow, brightnessTarget, Math.abs(brightness) * 0.32),
    highlight: mix(palette.highlight, temperatureTarget, Math.abs(temperature) * 0.34),
    mist: mix(palette.mist, brightnessTarget, Math.abs(brightness) * 0.12),
  };
}

export function surface(
  name: TrubeSurfaceName,
  options: TrubeSurfaceOptions = {},
): TrubeSurfaceSpec {
  const preset = getSurfacePreset(name);

  return {
    kind: 'trube-surface',
    name,
    options: {
      ...preset.defaultOptions,
      ...options,
      alpha: clamp(options.alpha ?? preset.defaultOptions.alpha, 0.08, 1),
    },
  };
}

export function resolveSurfaceSpec(input: TrubeSurfaceSpec | TrubeSurfaceName): TrubeSurfaceSpec {
  if (typeof input === 'string') {
    return surface(input);
  }

  return surface(input.name, input.options);
}

export function resolveSurface(input: TrubeSurfaceSpec | TrubeSurfaceName): ResolvedTrubeSurface {
  const spec = resolveSurfaceSpec(input);
  const preset = getSurfacePreset(spec.name);
  const resolvedPalette = resolvePalette(spec.name, preset.palette, spec.options.light);

  return {
    ...spec,
    preset,
    palette: resolvedPalette,
    motionPeriodMs: Math.round(
      preset.motionPeriodMs * MOTION_PERIOD_MULTIPLIER[spec.options.motion],
    ),
    grainFrequency: preset.grainFrequency * GRAIN_MULTIPLIER[spec.options.grain],
    alpha: clamp(spec.options.alpha * INTENSITY_ALPHA[spec.options.intensity], 0.08, 1),
  };
}
