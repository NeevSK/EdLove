import { useTemporalStore } from '@repo/core/logic';
import type React from 'react';
import { createContext, useContext, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { View } from '../primitives';

interface TemporalContextType {
  blurAmount: number;
  colorShift: string;
  intensity: number;
}

const TemporalContext = createContext<TemporalContextType | undefined>(undefined);

/**
 * TemporalProvider (native)
 *
 * React Native compatible version: uses a <View> overlay to apply temporal
 * color-shift effects. Blur is approximated via opacity on the overlay since
 * CSS `filter: blur` is web-only; for true blur on native use @react-native-community/blur.
 */
export const TemporalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { viewDate, viewMode } = useTemporalStore();

  const value = useMemo(() => {
    const now = new Date();
    const targetDate = new Date(viewDate);
    const diffDays = Math.abs(now.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24);

    let blurAmount = 0;
    let colorShift = 'transparent';
    let intensity = 0;

    if (viewMode === 'timeline') {
      blurAmount = Math.min(diffDays * 0.5, 8); // Max 8px blur
      intensity = Math.min(diffDays / 30, 1); // Scale intensity over a month

      if (targetDate < now) {
        colorShift = `rgba(15, 23, 42, ${intensity * 0.1})`; // Twilight/Past shift
      } else {
        colorShift = `rgba(251, 191, 36, ${intensity * 0.1})`; // Saffron/Future shift
      }
    }

    return { blurAmount, colorShift, intensity };
  }, [viewDate, viewMode]);

  return (
    <TemporalContext.Provider value={value}>
      <View style={styles.container}>
        {children}
        {value.intensity > 0 && (
          <View
            pointerEvents="none"
            style={[StyleSheet.absoluteFillObject, { backgroundColor: value.colorShift }]}
          />
        )}
      </View>
    </TemporalContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export const useTemporalAesthetics = () => {
  const context = useContext(TemporalContext);
  if (!context) {
    throw new Error('useTemporalAesthetics must be used within a TemporalProvider');
  }
  return context;
};
