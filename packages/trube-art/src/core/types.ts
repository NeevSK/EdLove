export const TRUBE_SURFACE_NAMES = [
  'aurora',
  'mist',
  'young-leaf',
  'silk',
  'waterfall',
  'evening-sky',
  'skymorphic',
  'water-surface',
] as const;
export type TrubeSurfaceName = (typeof TRUBE_SURFACE_NAMES)[number];

export const TRUBE_LIGHTING_MODES = [
  'predawn',
  'morning',
  'midday',
  'golden-hour',
  'dusk',
  'night',
] as const;
export type TrubeLightingMode = (typeof TRUBE_LIGHTING_MODES)[number];

export const TRUBE_INTENSITY_LEVELS = ['subtle', 'balanced', 'vivid'] as const;
export type TrubeIntensity = (typeof TRUBE_INTENSITY_LEVELS)[number];

export const TRUBE_MOTION_LEVELS = ['still', 'gentle', 'alive'] as const;
export type TrubeMotion = (typeof TRUBE_MOTION_LEVELS)[number];

export const TRUBE_GRAIN_LEVELS = ['soft', 'standard', 'rich'] as const;
export type TrubeGrain = (typeof TRUBE_GRAIN_LEVELS)[number];

export const TRUBE_EXPERIENCE_MODES = ['quiet', 'ambient', 'ceremonial'] as const;
export type TrubeExperienceMode = (typeof TRUBE_EXPERIENCE_MODES)[number];

export const TRUBE_SCORE_PLACEMENT_ZONES = [
  'full-bleed',
  'upper-third',
  'centered',
  'lower-third',
  'edge-weighted',
] as const;
export type TrubeScorePlacementZone = (typeof TRUBE_SCORE_PLACEMENT_ZONES)[number];

export const TRUBE_SCORE_TEXT_DENSITIES = ['minimal', 'light', 'moderate'] as const;
export type TrubeScoreTextDensity = (typeof TRUBE_SCORE_TEXT_DENSITIES)[number];

export const TRUBE_SCORE_REVIEW_STATES = ['approved', 'in-review', 'experimental'] as const;
export type TrubeScoreReviewState = (typeof TRUBE_SCORE_REVIEW_STATES)[number];

export type TrubeMotif = 'lotus' | 'branch' | 'tide' | 'none';
export type TrubeOrnament = 'filigree' | 'constellation' | 'vein' | 'none';

export type TrubeQuality = 'auto' | 'cinematic' | 'balanced' | 'efficient' | 'static';
export type TrubeResolvedQuality = Exclude<TrubeQuality, 'auto'>;
export type TrubeCapabilityTier = 'tier-1' | 'tier-2' | 'tier-3' | 'compatibility';
export type TrubeThermalState = 'nominal' | 'warm' | 'hot';
export type TrubeBackend =
  | 'native-vulkan'
  | 'native-metal'
  | 'webgpu'
  | 'skia-runtime-effect'
  | 'compatibility-static';
export type TrubeTimeDriver = 'reanimated' | 'animated-legacy' | 'static';
export type TrubeArchitectureVersion = 'v1' | 'v2';

export interface TrubeSurfaceOptions {
  light?: TrubeLightingMode;
  intensity?: TrubeIntensity;
  motion?: TrubeMotion;
  grain?: TrubeGrain;
  alpha?: number;
  motif?: TrubeMotif;
  ornament?: TrubeOrnament;
}

export interface TrubeSurfaceSpec {
  kind: 'trube-surface';
  name: TrubeSurfaceName;
  options: Required<TrubeSurfaceOptions>;
}

export interface TrubePalette {
  base: string;
  accent: string;
  secondary: string;
  shadow: string;
  highlight: string;
  mist: string;
}

export interface TrubeSurfacePreset {
  name: TrubeSurfaceName;
  label: string;
  description: string;
  defaultOptions: Required<TrubeSurfaceOptions>;
  palette: TrubePalette;
  motionPeriodMs: number;
  grainFrequency: number;
  recommendedQuality: TrubeResolvedQuality;
}

export interface ResolvedTrubeSurface extends TrubeSurfaceSpec {
  preset: TrubeSurfacePreset;
  palette: TrubePalette;
  motionPeriodMs: number;
  grainFrequency: number;
  alpha: number;
}

export interface TrubeEnvironment {
  apiLevel?: number | null;
  capabilityTier?: TrubeCapabilityTier;
  thermalState?: TrubeThermalState;
  lowPowerMode?: boolean;
  prefersReducedMotion?: boolean;
  pixelRatio?: number | null;
}

export interface TrubeRenderPlan {
  capabilityTier: TrubeCapabilityTier;
  backend: TrubeBackend;
  timeDriver: TrubeTimeDriver;
  quality: TrubeResolvedQuality;
  architectureVersion: TrubeArchitectureVersion;
  animationEnabled: boolean;
  resolutionScale: number;
  updateIntervalMs: number;
  detail: number;
  grainOpacity: number;
  layerOpacity: number;
  motif?: TrubeMotif;
  ornament?: TrubeOrnament;
}

export type TrubeLayerRole = 'body' | 'air' | 'shimmer';
export type TrubeBlendMode = 'normal' | 'screen' | 'soft-light';

export interface TrubeStageLayer {
  id?: string;
  surface: TrubeSurfaceSpec | TrubeSurfaceName;
  opacity?: number;
  quality?: TrubeQuality;
  role?: TrubeLayerRole;
  blend?: TrubeBlendMode;
}

export interface TrubeStageSpec {
  kind: 'trube-stage';
  background?: string;
  layers: TrubeStageLayer[];
}
