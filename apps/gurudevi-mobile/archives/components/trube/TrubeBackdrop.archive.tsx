import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '@repo/ui';
import type { TemporalPhase } from '@repo/ui';
import { getScoreExtras, getScorePreset } from '@repo/trube-art';
import type { TrubeScoreName } from '@repo/trube-art';
import { TrubeMotif, TrubeOrnament, TrubeStage } from '@repo/trube-art/native';

function mapPhaseToScore(phase: TemporalPhase): TrubeScoreName {
  switch (phase) {
    case 'predawn':
      return 'lotus-vigil';
    case 'dawn':
      return 'beethoven-dawn';
    case 'morning':
      return 'lotus-dawn';
    case 'afternoon':
      return 'shoreline-reverie';
    case 'dusk':
      return 'branch-wind';
    case 'night':
    default:
      return 'goethe-night-study';
  }
}

export function TrubeBackdrop() {
  const { phase, animationsEnabled, isDark, accent, text } = useTheme();
  const scoreName = React.useMemo(() => mapPhaseToScore(phase), [phase]);
  const score = React.useMemo(() => getScorePreset(scoreName), [scoreName]);
  const extras = React.useMemo(() => getScoreExtras(scoreName), [scoreName]);

  return (
    <View pointerEvents="none" style={styles.canvas}      <TrubeStage paused={!animationsEnabled} stage={score.stage} style={StyleSheet.absoluteFill} /      <TrubeOrnament
        color={accent.action}
        cornerRadius={0}
        ornament={extras.ornament}
        style={[StyleSheet.absoluteFill, { opacity: isDark ? 0.5 : 0.32 }]}
      /      <TrubeMotif
        color={text.onCanvas}
        cornerRadius={0}
        motif={extras.motif}
        style={[StyleSheet.absoluteFill, { opacity: isDark ? 0.4 : 0.22 }]}
      /    </View  );
}

const styles = StyleSheet.create({
  canvas: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.38,
  },
});
