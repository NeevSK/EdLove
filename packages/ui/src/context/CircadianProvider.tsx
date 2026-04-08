import React, { createContext, useContext, useMemo } from 'react';
import { View } from 'react-native';
import { vars } from 'nativewind';
import { useEnvironment } from './EnvironmentContext';
import { phaseMatrix, colors } from '../theme/Theme';
import { getTextOnBackground } from '../utils/colorUtils';

/**
 * Circadian Context
 * 
 * Manages the dynamic injection of CSS variables based on 
 * the current temporal phase.
 */

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
      '--phase-interactive': tokens.glass.interact.bg,
      '--phase-accent': tokens.accent.action,
      '--phase-reward': tokens.accent.reward,
      '--phase-danger': tokens.accent.danger,
      
      '--phase-text-primary': tokens.text.primary,
      '--phase-text-secondary': tokens.text.secondary,
      '--phase-text-inverse': tokens.text.inverse,
      '--phase-text-on-accent': getTextOnBackground(tokens.accent.action, colors.inkTruth, colors.sacredWhite),
      '--phase-text-on-surface': getTextOnBackground(tokens.glass.surface.bg, colors.inkTruth, colors.sacredWhite),
    });
  }, [temporalPhase, isDark]);

  return (
    <CircadianContext.Provider value={{ phase: temporalPhase }}>
      <View style={[circadianVars, { flex: 1 }]}>
        {children}
      </View>
    </CircadianContext.Provider>
  );
};

export const useCircadian = () => {
  const context = useContext(CircadianContext);
  if (!context) {
    throw new Error('useCircadian must be used within a CircadianProvider');
  }
  return context;
};
