import { useEnvironment } from './EnvironmentContext';
import { View } from '@repo/ui/primitives';
import { colors, phaseMatrix } from '@repo/ui/theme/Theme';
import { getTextOnBackground } from '@repo/ui/utils/colorUtils';
import { vars } from 'nativewind';
import type React from 'react';
import { createContext, useContext, useMemo } from 'react';

type CircadianContextType = {
  phase: string;
};

const CircadianContext = createContext<CircadianContextType | null>(null);

export const CircadianProvider = ({ children }: { children: React.ReactNode }) => {
  const { temporalPhase, isDark } = useEnvironment();

  const circadianVars = useMemo(() => {
    const tokens = phaseMatrix[temporalPhase][isDark ? 'dark' : 'light'];

    // Semantic mappings
    return vars({
      '--phase-world': tokens.gradientNodes[0],
      '--phase-canvas': tokens.gradientNodes[1],
      '--phase-surface': tokens.glass.surface.bg,
      '--phase-elevated': tokens.glass.modal.bg,
      '--phase-modal-card': isDark ? '#302920' : '#FDFAF3',
      '--phase-scrim': isDark ? 'rgba(17, 20, 27, 0.88)' : 'rgba(26, 22, 16, 0.82)',
      '--phase-modal-border': isDark ? 'rgba(232, 235, 255, 0.12)' : 'rgba(42, 35, 24, 0.12)',
      '--phase-interactive': tokens.glass.interact.bg,
      '--phase-accent': tokens.accent.action,
      '--phase-reward': tokens.accent.reward,
      '--phase-danger': tokens.accent.danger,

      '--phase-text-primary': tokens.text.primary,
      '--phase-text-secondary': tokens.text.secondary,
      '--phase-text-inverse': tokens.text.inverse,
      '--phase-text-on-accent': getTextOnBackground(
        tokens.accent.action,
        colors.inkTruth,
        colors.sacredWhite,
      ),
      '--phase-text-on-surface': getTextOnBackground(
        tokens.glass.surface.bg,
        colors.inkTruth,
        colors.sacredWhite,
      ),
    });
  }, [temporalPhase, isDark]);

  const contextValue = useMemo(() => ({ phase: temporalPhase }), [temporalPhase]);

  return (
    <CircadianContext value={contextValue}>
      <View style={[circadianVars, { flex: 1 }]}>{children}</View>
    </CircadianContext>
  );
};

export const useCircadian = () => {
  const context = useContext(CircadianContext);
  if (!context) {
    throw new Error('useCircadian must be used within a CircadianProvider');
  }
  return context;
};
