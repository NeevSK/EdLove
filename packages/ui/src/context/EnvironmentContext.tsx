/**
 * Environment Context (Orchestrator)
 * 2026 Sovereign Architecture: Decoupled Atomic State Providers.
 */

import { identity, useStore } from '@repo/core/logic';
import { FidelityProvider, useFidelity } from './FidelityProvider';
import { LanguageProvider, useLanguage } from './LanguageProvider';
// Atomic Providers
import { RealityProvider, useReality } from './RealityProvider';
import { SensoryProvider } from './SensoryProvider';
import { ThemeProvider, useThemeContext } from './ThemeProvider';
import type { EnvironmentContextValue } from './types';
import { useVisualCapabilities } from './VisualCapabilities';
import { type ReactNode, useCallback, useMemo } from 'react';

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
  const user = useStore((state: any) => state.user);
  const activeBond = (user as any)?.activeBond ?? null;

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
} from './FidelityProvider';
export {
  LanguageProvider,
  useLanguage,
} from './LanguageProvider';
// Re-export utility functions and atomic hooks
export {
  RealityProvider,
  useReality,
} from './RealityProvider';
export {
  ThemeProvider,
  useThemeContext,
} from './ThemeProvider';

export { getTemporalPhase, shouldUseDarkTheme } from './utils';
