/**
 * Environment Engine Types
 * Core types for the Environment Context system
 */

import { UserRole } from '@repo/core';

/**
 * Temporal Phase - Time of day affecting theme and behavior
 */
export type TemporalPhase = 'dawn' | 'day' | 'evening' | 'night';

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
    role: UserRole | null;

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
}

/**
 * Complete Environment Context
 */
export interface EnvironmentContextValue extends EnvironmentState, EnvironmentActions { }
