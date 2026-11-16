import { useId } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, Path, RadialGradient, Stop } from 'react-native-svg';
import { useWorld } from '../../../theme/native/WorldContext';
import type { FeedbackSceneContract } from '../../../theme/contracts';
import { feedbackScene, feedbackSceneColors, FEEDBACK_SCENE_GEOMETRY } from '../../shared/feedbackScene';
import { Perch } from '../Perch/Perch';

export interface FeedbackSceneProps extends FeedbackSceneContract {}

/** Static world-colored feedback scene using the perch and existing firefly SVG fallback. */
export function FeedbackScene({ state, size = FEEDBACK_SCENE_GEOMETRY.defaultSize }: FeedbackSceneProps) {
  const world = useWorld();
  const colors = feedbackSceneColors(state, world.tokens);
  const presentation = feedbackScene(state);
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const haloId = `firefly-halo-${id}`;
  const coreId = `firefly-core-${id}`;
  const height = size * (164 / 220);
  const fireflySize = size * 0.42;
  const fireflyHeight = fireflySize * (260 / 240);

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.scene, { width: size, height }]}
      testID={`feedback-scene-${state}`}
    >
      <Perch width={size} height={height} />
      <Svg
        height={height}
        style={StyleSheet.absoluteFill}
        viewBox="0 0 220 164"
        width={size}
        pointerEvents="none"
      >
        <Path
          d="M 20 119 C 56 95, 80 147, 115 112 S 166 87, 202 113"
          fill="none"
          stroke={colors.path}
          strokeDasharray="2 12"
          strokeLinecap="round"
          strokeOpacity={presentation.outerOpacity}
          strokeWidth={5}
        />
        <Circle cx="194" cy="111" fill={colors.path} opacity={presentation.outerOpacity} r="5" />
      </Svg>
      <View pointerEvents="none" style={[styles.firefly, { top: size * 0.02 }]}>
        <Svg height={fireflyHeight} viewBox={FEEDBACK_SCENE_GEOMETRY.viewBox} width={fireflySize}>
          <Defs>
            <RadialGradient cx="50%" cy="50%" id={haloId} r="50%">
              {FEEDBACK_SCENE_GEOMETRY.haloStops.map((stop) => (
                <Stop key={stop.offset} offset={stop.offset} stopColor={colors.mascot} stopOpacity={stop.opacity} />
              ))}
            </RadialGradient>
            <RadialGradient cx="50%" cy="50%" id={coreId} r="50%">
              {FEEDBACK_SCENE_GEOMETRY.coreStops.map((stop) => (
                <Stop key={stop.offset} offset={stop.offset} stopColor={stop.offset === 0 ? colors.center : colors.mascot} stopOpacity={stop.opacity} />
              ))}
            </RadialGradient>
          </Defs>
          <Circle
            cx={FEEDBACK_SCENE_GEOMETRY.center.x}
            cy={FEEDBACK_SCENE_GEOMETRY.center.y}
            fill={`url(#${haloId})`}
            r={FEEDBACK_SCENE_GEOMETRY.haloRadius}
          />
          <Circle
            cx={FEEDBACK_SCENE_GEOMETRY.center.x}
            cy={FEEDBACK_SCENE_GEOMETRY.center.y}
            fill={`url(#${coreId})`}
            r={FEEDBACK_SCENE_GEOMETRY.coreRadius}
          />
          <Circle
            cx={FEEDBACK_SCENE_GEOMETRY.center.x}
            cy={FEEDBACK_SCENE_GEOMETRY.center.y}
            fill={colors.mascot}
            opacity={presentation.outerOpacity}
            r={FEEDBACK_SCENE_GEOMETRY.outerRadius}
          />
          <Circle
            cx={FEEDBACK_SCENE_GEOMETRY.center.x}
            cy={FEEDBACK_SCENE_GEOMETRY.center.y}
            fill={colors.center}
            opacity={FEEDBACK_SCENE_GEOMETRY.innerOpacity}
            r={FEEDBACK_SCENE_GEOMETRY.innerRadius}
          />
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'relative', alignSelf: 'center' },
  firefly: { position: 'absolute', alignSelf: 'center' },
});
