/**
 * Environment Context
 * The Universal Parameters Engine - unifies theme, role, language, and reality
 * 
 * Philosophy: The app is a "Living Organism" that adapts to its environment
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, AppStateStatus, useColorScheme } from 'react-native';
// @ts-ignore - Dependency exists in package.json and works at runtime, but IDE cannot resolve types in this environment
import NetInfo from '@react-native-community/netinfo';
import { useStore } from '../store/useStore';
import i18n from '../i18n/config';
import {
  EnvironmentContextValue,
  ThemeMode,
  FidelityLevel,
  Language,
  TemporalPhase,
  RealityState,
  NetworkQuality,
  DeviceTier,
} from './types';
import {
  getTemporalPhase,
  shouldUseDarkTheme,
  detectDeviceTier,
  detectNetworkQuality,
  shouldUseDataSaver,
  computeEffectiveFidelity,
} from './utils';

// Storage keys
const STORAGE_KEYS = {
  FIDELITY_LEVEL: '@gurudevi/fidelity_level',
  LANGUAGE: '@gurudevi/language',
  IS_VEIL_ACTIVE: '@gurudevi/is_veil_active',
};

// Create the context
const EnvironmentContext = createContext<EnvironmentContextValue | undefined>(undefined);

/**
 * Environment Provider Props
 */
interface EnvironmentProviderProps {
  children: ReactNode;
}

/**
 * Environment Provider Component
 * Wraps the app and provides environment state to all components
 */
export function EnvironmentProvider({ children }: EnvironmentProviderProps) {
  // Get role and theme from global store
  const role = useStore((state: any) => state.userRole);
  const themeMode = useStore((state: any) => state.themeMode);
  const setStoredThemeMode = useStore((state: any) => state.setThemeMode);

  // Local state for environment-specific settings
  const [fidelityLevel, setFidelityLevelState] = useState<FidelityLevel>('auto');
  const [language, setLanguageState] = useState<Language>('en');
  const [isVeilActive, setIsVeilActive] = useState(false);
  const [temporalPhase, setTemporalPhase] = useState<TemporalPhase>(() => getTemporalPhase());
  const systemColorScheme = useColorScheme();
  const [reality, setReality] = useState<RealityState>({
    deviceTier: 'medium',
    totalMemoryGB: 4,
    networkQuality: 'good',
    isDataSaverMode: false,
    isBatterySaverMode: false,
  });

  // Compute derived state
  const isDark =
    themeMode === 'dark' ||
    (themeMode === 'system' && systemColorScheme === 'dark') ||
    (themeMode === 'auto' && shouldUseDarkTheme(temporalPhase));
  const effectiveFidelity = computeEffectiveFidelity(fidelityLevel, reality.deviceTier);

  /**
   * Load persisted settings from AsyncStorage
   */
  useEffect(() => {
    async function loadSettings() {
      try {
        const [fidelity, lang, veil] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.FIDELITY_LEVEL),
          AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE),
          AsyncStorage.getItem(STORAGE_KEYS.IS_VEIL_ACTIVE),
        ]);

        if (fidelity) setFidelityLevelState(fidelity as FidelityLevel);
        if (lang) {
          setLanguageState(lang as Language);
          i18n.changeLanguage(lang);
        }
        if (veil) setIsVeilActive(veil === 'true');
      } catch (error) {
        console.warn('Failed to load environment settings:', error);
      }
    }

    loadSettings();
  }, []);

  /**
   * Detect device capabilities and network quality on mount
   */
  const refreshReality = useCallback(async () => {
    try {
      const [deviceInfo, networkQuality] = await Promise.all([
        detectDeviceTier(),
        detectNetworkQuality(),
      ]);

      setReality(prev => ({
        ...prev,
        deviceTier: deviceInfo.tier,
        totalMemoryGB: deviceInfo.memoryGB,
        networkQuality,
        isDataSaverMode: shouldUseDataSaver(networkQuality),
      }));
    } catch (error) {
      console.warn('Failed to refresh reality:', error);
    }
  }, []);

  /**
   * Initialize reality detection
   */
  useEffect(() => {
    refreshReality();
  }, [refreshReality]);

  /**
   * Monitor network changes
   */
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: any) => {
      let quality: NetworkQuality = 'offline';

      if (state.isConnected) {
        const type = state.type;
        const details = state.details as any;

        if (type === 'cellular') {
          const gen = details?.cellularGeneration;
          if (gen === '5g') quality = 'excellent';
          else if (gen === '4g') quality = 'good';
          else if (gen === '3g') quality = 'fair';
          else quality = 'poor';
        } else if (type === 'wifi') {
          quality = 'good';
        } else {
          quality = 'fair';
        }
      }

      setReality(prev => ({
        ...prev,
        networkQuality: quality,
        isDataSaverMode: shouldUseDataSaver(quality),
      }));
    });

    return unsubscribe;
  }, []);

  /**
   * Update temporal phase every minute when in auto theme mode
   */
  useEffect(() => {
    const updatePhase = () => {
      const newPhase = getTemporalPhase();
      if (newPhase !== temporalPhase) {
        setTemporalPhase(newPhase);
      }
    };

    // Check immediately
    updatePhase();

    // Then check every minute
    const interval = setInterval(updatePhase, 60000);

    return () => clearInterval(interval);
  }, [themeMode, temporalPhase]);

  /**
   * Monitor app state changes to refresh reality
   */
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        refreshReality();
      }
    });

    return () => subscription.remove();
  }, [refreshReality]);

  /**
   * Actions
   */
  const setThemeMode = useCallback((mode: ThemeMode) => {
    setStoredThemeMode(mode);
    // Update temporal phase immediately if switching to auto
    if (mode === 'auto') {
      setTemporalPhase(getTemporalPhase());
    }
  }, [setStoredThemeMode]);

  const setFidelityLevel = useCallback(async (level: FidelityLevel) => {
    setFidelityLevelState(level);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.FIDELITY_LEVEL, level);
    } catch (error) {
      console.warn('Failed to save fidelity level:', error);
    }
  }, []);

  const setLanguage = useCallback(async (lang: Language) => {
    setLanguageState(lang);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
      await i18n.changeLanguage(lang);
    } catch (error) {
      console.warn('Failed to save language:', error);
    }
  }, []);

  const toggleVeil = useCallback(async () => {
    const newValue = !isVeilActive;
    setIsVeilActive(newValue);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.IS_VEIL_ACTIVE, String(newValue));
    } catch (error) {
      console.warn('Failed to save veil state:', error);
    }
  }, [isVeilActive]);

  // Construct the context value
  const value: EnvironmentContextValue = {
    // State
    role,
    themeMode,
    temporalPhase,
    isDark,
    fidelityLevel,
    effectiveFidelity,
    language,
    reality,
    isVeilActive,

    // Actions
    setThemeMode,
    setFidelityLevel,
    setLanguage,
    toggleVeil,
    refreshReality,
  };

  return (
    <EnvironmentContext.Provider value={value}>
      {children}
    </EnvironmentContext.Provider>
  );
}

/**
 * Hook to access the Environment Context
 * Must be used within an EnvironmentProvider
 */
export function useEnvironment(): EnvironmentContextValue {
  const context = useContext(EnvironmentContext);

  if (context === undefined) {
    throw new Error('useEnvironment must be used within an EnvironmentProvider');
  }

  return context;
}

// Export utility functions for convenience
export { getTemporalPhase, shouldUseDarkTheme };
