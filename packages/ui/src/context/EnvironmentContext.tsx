/**
 * Environment Context (Orchestrator)
 * 2026 Sovereign Architecture: Decoupled Atomic State Providers.
 */

import { identity, useAuthStore } from '@repo/core/logic';
import { type ReactNode, useCallback, useMemo } from 'react';
import { FidelityProvider, useFidelity, useFidelityOptional } from './FidelityProvider';
import { LanguageProvider, useLanguage, useLanguageOptional } from './LanguageProvider';
// Atomic Providers
import { RealityProvider, useReality, useRealityOptional } from './RealityProvider';
import { SensoryProvider } from './SensoryProvider';
import { ThemeProvider, useThemeContext, useThemeContextOptional } from './ThemeProvider';
import type { EnvironmentContextValue } from './types';
import { useVisualCapabilities } from './VisualCapabilities';

/**
 * Environment Provider Component
 * The Orchestrator: Wraps the app in atomic domain-specific providers.
 */
export function EnvironmentProvider({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <RealityProvider>
        <SensoryProvider>
          <ThemeProvider>
            <FidelityProvider>{children}</FidelityProvider>
          </ThemeProvider>
        </SensoryProvider>
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
  const user = useAuthStore((state: any) => state.user);
  const activeBond = (user as any)?.activeBond ?? null;

  const { reality, refreshReality } = useRealityOptional();
  const { language, setLanguage } = useLanguageOptional();
  const {
    themeMode,
    temporalPhase,
    isDark,
    isVeilActive,
    enableLivingTheme,
    setThemeMode,
    toggleVeil,
    setEnableLivingTheme,
  } = useThemeContextOptional();
  const { fidelityLevel, effectiveFidelity, setFidelityLevel } = useFidelityOptional();
  const visualCapabilities = useVisualCapabilities();

  // ReBAC actions
  const switchPerspective = useCallback(async (entityId: string, capacity: string) => {
    await identity.switchPerspective(entityId, capacity as any);
  }, []);

  // Aggregate into a single memoized value to minimize blast radius for legacy consumers
  return useMemo(
    () => ({
      // State
      activeBond,
      themeMode,
      temporalPhase,
      isDark,
      fidelityLevel,
      effectiveFidelity,
      language,
      reality,
      isVeilActive,
      enableLivingTheme,
      visualCapabilities,

      // Actions
      setThemeMode,
      setFidelityLevel,
      setLanguage,
      toggleVeil,
      refreshReality,
      setEnableLivingTheme,
      switchPerspective,
    }),
    [
      activeBond,
      themeMode,
      temporalPhase,
      isDark,
      fidelityLevel,
      effectiveFidelity,
      language,
      reality,
      isVeilActive,
      enableLivingTheme,
      visualCapabilities,
      setThemeMode,
      setFidelityLevel,
      setLanguage,
      toggleVeil,
      refreshReality,
      setEnableLivingTheme,
      switchPerspective,
    ],
  );
}

export {
  FidelityProvider,
  useFidelity,
  useFidelityOptional,
} from './FidelityProvider';
export {
  LanguageProvider,
  useLanguage,
  useLanguageOptional,
} from './LanguageProvider';
// Re-export utility functions and atomic hooks
export {
  RealityProvider,
  useReality,
  useRealityOptional,
} from './RealityProvider';
export {
  ThemeProvider,
  useThemeContext,
  useThemeContextOptional,
} from './ThemeProvider';

export { getTemporalPhase, shouldUseDarkTheme } from './utils';
