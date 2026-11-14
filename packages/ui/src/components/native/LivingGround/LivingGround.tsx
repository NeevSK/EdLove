import { type ComponentRef, type ReactNode, type Ref, useState } from 'react';
import {
  type LayoutChangeEvent,
  type StyleProp,
  StyleSheet,
  View,
  type ViewProps,
  type ViewStyle,
} from 'react-native';
import { Canvas, Group, LinearGradient, Path, RadialGradient, Rect, vec } from 'react-native-skia';
import { alpha } from '../../../theme/color';
import type { LivingGroundContract } from '../../../theme/contracts';
import { useWorld } from '../../../theme/native/WorldContext';
import { LIVING_MOTIFS } from '../../shared/livingMotifs';

export interface LivingGroundProps extends LivingGroundContract, ViewProps {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  ref?: Ref<ComponentRef<typeof View>>;
}

export function LivingGround({
  atmosphere = 'canopy',
  dither = true,
  worldId,
  style,
  children,
  ref,
  ...rest
}: LivingGroundProps) {
  const world = useWorld();
  const tokens = world.tokens;
  const wash = world.recipes.material.wash;
  const isDark = world.mode === 'dark';

  const [size, setSize] = useState<{ width: number; height: number } | null>(null);

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setSize((prev) =>
      prev && prev.width === width && prev.height === height ? prev : { width, height },
    );
  };

  const width = size?.width ?? 0;
  const height = size?.height ?? 0;

  // Active world motif
  const activeWorldId = worldId ?? world.id;
  const motif = LIVING_MOTIFS[activeWorldId] ?? LIVING_MOTIFS.kele;

  // Illumination color from active world's wash center
  const litCentre = alpha(wash.centre, 0.28);
  const litEdge = alpha(wash.edge, 0);

  // Restrained dual-tone relief colors ("simpler silence" & nocturnal moon milk)
  const shadowColor = isDark ? alpha(tokens.sunken, 0.65) : alpha(tokens.ink, 0.14);
  const lightColor = isDark ? alpha(tokens.lamp, 0.35) : alpha(tokens.raised, 0.45);

  // Scale from 1440x900 canonical space to canvas dimensions
  const scale = width > 0 && height > 0 ? Math.max(width / 1440, height / 900) : 1;

  return (
    <View
      ref={ref}
      {...rest}
      onLayout={onLayout}
      style={[styles.container, { backgroundColor: tokens.ground }, style]}
    >
      {width > 0 && height > 0 && atmosphere !== 'none' ? (
        <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
          {/* Base chromatic ground */}
          <Rect x={0} y={0} width={width} height={height} color={tokens.ground} />

          {/* Directional Atmosphere */}
          {atmosphere === 'canopy' ? (
            <Rect x={0} y={0} width={width} height={height}>
              <RadialGradient
                c={vec(width / 2, -height * 0.1)}
                r={Math.max(width, height) * 0.8}
                colors={[litCentre, alpha(wash.centre, 0.08), litEdge]}
                positions={[0, 0.45, 1]}
              />
            </Rect>
          ) : atmosphere === 'centered' ? (
            <Rect x={0} y={0} width={width} height={height}>
              <RadialGradient
                c={vec(width / 2, height * 0.4)}
                r={Math.max(width, height) * 0.65}
                colors={[litCentre, litEdge]}
                positions={[0, 1]}
              />
            </Rect>
          ) : atmosphere === 'ambient' ? (
            <Rect x={0} y={0} width={width} height={height}>
              <LinearGradient
                start={vec(0, 0)}
                end={vec(0, height)}
                colors={[alpha(wash.centre, 0.18), tokens.ground]}
              />
            </Rect>
          ) : null}

          {/* World-wise Watermark with Dual-Tone Relief */}
          {dither ? (
            <Group transform={[{ scale }]}>
              {motif.paths.map((p, idx) => (
                <Group key={idx}>
                  <Path
                    path={p.d}
                    style="stroke"
                    strokeWidth={p.width + 1.2}
                    strokeCap="round"
                    color={shadowColor}
                  />
                  <Path
                    path={p.d}
                    style="stroke"
                    strokeWidth={p.width}
                    strokeCap="round"
                    color={lightColor}
                  />
                </Group>
              ))}
            </Group>
          ) : null}
        </Canvas>
      ) : null}

      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
  },
});
