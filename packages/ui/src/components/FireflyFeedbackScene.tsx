import { useVisualCapabilities } from '@repo/ui/context/VisualCapabilities';
import { tokens } from '@repo/ui/tokens';
import { Platform, StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { type FireflyFeedbackState, getFireflyFeedbackPresentation } from './fireflyFeedback';
import { Mascot, type MascotArtworkSource, useMascot } from './Mascot';
import { mascotStateForFeedback } from './mascotStateMachine';

export type FireflyFeedbackSceneProps = {
  state: FireflyFeedbackState;
  size?: number;
  animate?: boolean;
  accessibilityLabel?: string;
  artwork?: MascotArtworkSource;
};

const glowForState = {
  active: tokens.colors.loading,
  quiet: tokens.colors.primary,
  interrupted: tokens.colors.warning,
  complete: tokens.colors.accentLiving,
} as const;

/** A compact field scene that points toward the next action without replacing copy. */
export function FireflyFeedbackScene({
  state,
  size = 156,
  animate = false,
  accessibilityLabel,
  artwork,
}: FireflyFeedbackSceneProps) {
  const mascot = useMascot();
  const visualCapabilities = useVisualCapabilities();
  const presentation = getFireflyFeedbackPresentation(state);
  const glow = glowForState[presentation.pathState];
  const isInterrupted = presentation.pathState === 'interrupted';
  const isComplete = presentation.pathState === 'complete';
  const resolvedState = mascotStateForFeedback(state);
  const hasApprovedArtwork = Boolean(
    mascot.artworkByState?.[resolvedState] ??
      mascot.artworkByRoleAndState?.[mascot.role ?? 'guide']?.[resolvedState] ??
      mascot.artwork,
  );
  const shouldAnimate = animate && visualCapabilities.allowSubtleAnimation;
  const scene = (
    <View
      accessible
      accessibilityLabel={accessibilityLabel ?? presentation.accessibilityLabel}
      style={[styles.scene, { width: size, height: size * 0.74 }]}
      testID={`firefly-feedback-${mascot.id}-${state}`}
    >
      {!hasApprovedArtwork ? (
        <Svg
          height={size * 0.74}
          style={StyleSheet.absoluteFill}
          viewBox="0 0 220 164"
          width={size}
        >
          <Path
            d="M 17 128 C 50 111, 71 143, 104 125 S 152 105, 201 128"
            fill="none"
            stroke={tokens.colors.accentLiving}
            strokeLinecap="round"
            strokeOpacity={0.46}
            strokeWidth={3}
          />
          <Path
            d="M 20 119 C 56 95, 80 147, 115 112 S 166 87, 202 113"
            fill="none"
            stroke={glow}
            strokeDasharray="2 12"
            strokeLinecap="round"
            strokeOpacity={isInterrupted ? 0.36 : 0.82}
            strokeWidth={5}
          />
          {isInterrupted ? (
            <Line
              x1="112"
              x2="128"
              y1="103"
              y2="120"
              stroke={tokens.colors.error}
              strokeWidth={3}
            />
          ) : null}
          <Circle cx="194" cy="111" fill={glow} opacity={isComplete ? 0.9 : 0.45} r="5" />
        </Svg>
      ) : null}
      <View style={styles.mascot}>
        <Mascot
          mode={presentation.mascotMode}
          podVariant="halo"
          role={mascot.role}
          size={size * 0.62}
          state={resolvedState}
          theme={mascot.theme}
          artwork={artwork}
        />
      </View>
    </View>
  );

  if (Platform.OS !== 'web') return scene;

  return (
    <div
      className={`firefly-feedback-scene firefly-feedback-scene--${state}${shouldAnimate ? ' firefly-feedback-scene--animated' : ''}`}
    >
      <style>{`
        @keyframes firefly-guidance-arrival { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes firefly-guidance-glow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
        .firefly-feedback-scene { animation: firefly-guidance-arrival 240ms cubic-bezier(0.33, 1, 0.42, 1) both; }
        .firefly-feedback-scene--loading, .firefly-feedback-scene--animated { animation: firefly-guidance-glow 3000ms ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .firefly-feedback-scene, .firefly-feedback-scene--loading { animation: none; } }
      `}</style>
      {scene}
    </div>
  );
}

const styles = StyleSheet.create({
  scene: { alignItems: 'center', justifyContent: 'center', position: 'relative' },
  mascot: { alignItems: 'center', justifyContent: 'center', zIndex: 1 },
});
