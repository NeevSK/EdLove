/**
 * Environment Engine Types
 * Core types for the Environment Context system
 */

import type { GurudeviExperience } from '@repo/core/verger';
import type { Bond } from '@repo/core/types';

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
 * What components may spend, as verger decides it through Gurudevi's view
 * (`@repo/core/verger` `experienceOf`). One definition, owned by the view.
 */
export type {
  DeviceTier,
  ExperienceLevel,
  ExperienceProfile,
  VisualQuality,
} from '@repo/core/verger';
export type VisualCapabilities = GurudeviExperience;
export type VisualImageCachePolicy = GurudeviExperience['imageCachePolicy'];
export type VisualImageDecodeFormat = GurudeviExperience['imageDecodeFormat'];

export interface EnvironmentState {
  // ReBAC Identity
  activeBond: Bond | null;

  // Theme & Visual
  themeMode: ThemeMode;
  temporalPhase: TemporalPhase;
  isDark: boolean;
  fidelityLevel: FidelityLevel;
  /** The fidelity in force: the user's choice, or for `auto` the phone's class (from verger). */
  effectiveFidelity: 'low' | 'high';

  // Language
  language: Language;

  // Privacy
  isVeilActive: boolean; // "The Veil" - privacy toggle

  /** Whether the Living Theme System is active (phase-aware tokens) or classic (static) */
  enableLivingTheme: boolean;
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
  setEnableLivingTheme: (enabled: boolean) => Promise<void>;
  switchPerspective: (entityId: string, capacity: string) => Promise<void>;
}

/**
 * Complete Environment Context
 */
export interface EnvironmentContextValue extends EnvironmentState, EnvironmentActions {}
