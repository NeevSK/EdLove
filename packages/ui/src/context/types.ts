/**
 * Environment Engine Types
 * Core types for the Environment Context system
 */

import type { Bond } from '@repo/core/types';
import type { WorldId } from '../world/types';

/**
 * Temporal Phase - Time of day affecting theme and behavior
 */
export type TemporalPhase = 'predawn' | 'dawn' | 'morning' | 'afternoon' | 'dusk' | 'night';

/** Maps 6-phase to 4-phase for legacy consumers */
export const PHASE_FALLBACK: Record<TemporalPhase, 'dawn' | 'day' | 'evening' | 'night'> = {
  predawn: 'dawn',
  dawn: 'dawn',
  morning: 'day',
  afternoon: 'day',
  dusk: 'evening',
  night: 'night',
};

export type ThemeMode = 'light' | 'dark' | 'auto' | 'system';

/**
 * Visual Fidelity Level - Performance/visual quality tradeoff
 */
export type FidelityLevel = 'auto' | 'low' | 'high';

/**
 * Language Support
 */
export type Language = 'en' | 'si' | 'ta';

/**
 * Network Quality
 */
export type NetworkQuality = 'excellent' | 'good' | 'fair' | 'poor' | 'offline';

/**
 * Device Performance Tier
 */
export type DeviceTier = 'high' | 'medium' | 'low';

/** Three usable expression tiers plus an explicit disabled state. */
export type ExperienceLevel = 'off' | 'essential' | 'refined' | 'rich';

export interface ExperienceProfile {
  motion: ExperienceLevel;
  visualEffects: ExperienceLevel;
  haptics: ExperienceLevel;
  sound: ExperienceLevel;
  celebration: ExperienceLevel;
  maxParticles: number;
  maxConcurrentSounds: number;
  allowAssetPrefetch: boolean;
}

export type VisualImageCachePolicy = 'disk' | 'memory-disk';
export type VisualImageDecodeFormat = 'argb' | 'rgb';
export type VisualQuality = 'full' | 'reduced' | 'essential';

export interface VisualCapabilities {
  deviceTier: DeviceTier;
  effectiveFidelity: 'low' | 'high';
  quality: VisualQuality;
  allowAmbientEffects: boolean;
  allowBlur: boolean;
  allowRichAnimation: boolean;
  allowSubtleAnimation: boolean;
  imageCachePolicy: VisualImageCachePolicy;
  imageDecodeFormat: VisualImageDecodeFormat;
  shouldPrefetchAssets: boolean;
  maxCelebrationParticles: number;
  experience: ExperienceProfile;
}

export type RealityPressure = 'unknown' | 'normal' | 'constrained' | 'severe';

/**
 * Reality State - Hardware and network constraints
 */
export interface RealityState {
  deviceTier: DeviceTier;
  totalMemoryGB: number;
  networkQuality: NetworkQuality;
  isDataSaverMode: boolean;
  isBatterySaverMode: boolean;
  isReducedMotionEnabled: boolean;
  pressure?: RealityPressure;
}

export interface EnvironmentState {
  // ReBAC Identity
  activeBond: Bond | null;

  // Theme & Visual
  themeMode: ThemeMode;
  temporalPhase: TemporalPhase;
  isDark: boolean;
  fidelityLevel: FidelityLevel;
  effectiveFidelity: 'low' | 'high'; // Computed based on fidelityLevel and reality

  // Language
  language: Language;

  // Reality (Hardware/Network)
  reality: RealityState;

  // Privacy
  isVeilActive: boolean; // "The Veil" - privacy toggle

  /** Whether the Living Theme System is active (phase-aware tokens) or classic (static) */
  enableLivingTheme: boolean;
  /** The world that dresses every component. */
  worldId: WorldId;
  visualCapabilities: VisualCapabilities;
}

/**
 * Environment Actions
 */
export interface EnvironmentActions {
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  setFidelityLevel: (level: FidelityLevel) => Promise<void>;
  setLanguage: (language: Language) => Promise<void>;
  toggleVeil: () => Promise<void>;
  refreshReality: () => Promise<void>;
  setEnableLivingTheme: (enabled: boolean) => Promise<void>;
  setWorld: (world: WorldId) => Promise<void>;
  switchPerspective: (entityId: string, capacity: string) => Promise<void>;
}

/**
 * Complete Environment Context
 */
export interface EnvironmentContextValue extends EnvironmentState, EnvironmentActions {}
