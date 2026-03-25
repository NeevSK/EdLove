/**
 * Environment Engine Types
 * Core types for the Environment Context system
 */

import { AuthorityTier } from '@repo/core';

/**
 * Temporal Phase - Time of day affecting theme and behavior
 */
export type TemporalPhase = 'predawn' | 'dawn' | 'morning' | 'afternoon' | 'dusk' | 'night';

/** Maps 6-phase to 4-phase for legacy consumers */
export const PHASE_FALLBACK: Record<TemporalPhase, 'dawn' | 'day' | 'evening' | 'night'> = {
    predawn:   'dawn',
    dawn:      'dawn',
    morning:   'day',
    afternoon: 'day',
    dusk:      'evening',
    night:     'night',
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

/**
 * Reality State - Hardware and network constraints
 */
export interface RealityState {
    deviceTier: DeviceTier;
    totalMemoryGB: number;
    networkQuality: NetworkQuality;
    isDataSaverMode: boolean;
    isBatterySaverMode: boolean;
}

/**
 * Environment State - The complete context
 */
export interface EnvironmentState {
    // Role & Identity
    authority: AuthorityTier | null;

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
}

/**
 * Environment Actions
 */
export interface EnvironmentActions {
    setThemeMode: (mode: ThemeMode) => void;
    setFidelityLevel: (level: FidelityLevel) => Promise<void>;
    setLanguage: (language: Language) => Promise<void>;
    toggleVeil: () => Promise<void>;
    refreshReality: () => Promise<void>;
    setEnableLivingTheme: (enabled: boolean) => Promise<void>;
}

/**
 * Complete Environment Context
 */
export interface EnvironmentContextValue extends EnvironmentState, EnvironmentActions { }
