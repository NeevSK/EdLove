/**
 * Environment Context (Orchestrator)
 * 2026 Sovereign Architecture: Decoupled Atomic State Providers.
 */

import { useStore } from '@repo/core/logic';
import { type ReactNode, useMemo } from 'react';
import { FidelityProvider, useFidelity } from './FidelityProvider';
import { LanguageProvider, useLanguage } from './LanguageProvider';
// Atomic Providers
import { RealityProvider, useReality } from './RealityProvider';
import { ThemeProvider, useThemeContext } from './ThemeProvider';
import type { EnvironmentContextValue } from './types';

/**
 * Environment Provider Component
 * The Orchestrator: Wraps the app in atomic domain-specific providers.
 */
export function EnvironmentProvider({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <RealityProvider>
        <ThemeProvider>
          <FidelityProvider>{children}</FidelityProvider>
        </ThemeProvider>
      </RealityProvider>
    </LanguageProvider>
  );
}

/**
 * useEnvironment (Legacy Orchestrator Hook)
 * Aggregates atomic contexts for backward compatibility.
 * ⚠️ DEPRECATION NOTICE: Favor useReality, useTheme, useLanguage, or useFidelity for better performance.
 */
export function useEnvironment(): EnvironmentContextValue {
  const user = useStore((state: any) => state.user);
  const authority = (user as any)?.authority;

  const { reality, refreshReality } = useReality();
  const { language, setLanguage } = useLanguage();
  const {
    themeMode,
    temporalPhase,
    isDark,
    isVeilActive,
    enableLivingTheme,
    setThemeMode,
    toggleVeil,
    setEnableLivingTheme,
  } = useThemeContext();
  const { fidelityLevel, effectiveFidelity, setFidelityLevel } = useFidelity();

  // Aggregate into a single memoized value to minimize blast radius for legacy consumers
  return useMemo(
    () => ({
      // State
      authority,
      themeMode,
      temporalPhase,
      isDark,
      fidelityLevel,
      effectiveFidelity,
      language,
      reality,
      isVeilActive,
      enableLivingTheme,

      // Actions
      setThemeMode,
      setFidelityLevel,
      setLanguage,
      toggleVeil,
      refreshReality,
      setEnableLivingTheme,
    }),
    [
      authority,
      themeMode,
      temporalPhase,
      isDark,
      fidelityLevel,
      effectiveFidelity,
      language,
      reality,
      isVeilActive,
      enableLivingTheme,
      setThemeMode,
      setFidelityLevel,
      setLanguage,
      toggleVeil,
      refreshReality,
      setEnableLivingTheme,
    ],
  );
}

// Re-export utility functions and atomic hooks
export {
  RealityProvider,
  useReality,
} from './RealityProvider';
export {
  ThemeProvider,
  useThemeContext,
} from './ThemeProvider';
export {
  LanguageProvider,
  useLanguage,
} from './LanguageProvider';
export {
  FidelityProvider,
  useFidelity,
} from './FidelityProvider';

export { getTemporalPhase, shouldUseDarkTheme } from './utils';
