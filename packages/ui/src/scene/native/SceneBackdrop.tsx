/**
 * The scene behind a screen or a header: the still layer on one canvas and the moving layer on
 * another, so the still one never redraws for a raindrop. It fills its parent. At `full` the
 * parent sees the whole landscape; at `band` (a header) it sees the sky, the hills and the shore
 * under a veil of the world's ground; at `quiet`, or when verger allows no painting, it draws
 * nothing and the world's own ground (already tinted by the hour) shows through.
 */

import {
  daylightAt,
  landscapeColours,
  landscapeOf,
  mixHex,
  SCENE_LIGHT,
  type Scene,
} from '@repo/core/scene';
import { useMemo, useState } from 'react';
import { type LayoutChangeEvent, Platform, StyleSheet, View, type ViewStyle } from 'react-native';
import { Canvas, LinearGradient, Rect, vec } from 'react-native-skia';
import { useWorld } from '../../world/native/WorldContext';
import { SceneStill } from './SceneStill';
import { SceneWeather } from './SceneWeather';

export interface SceneBackdropProps {
  scene: Scene;
  /**
   * A veil of the world's ground over the scene, so text on it keeps its contrast: `edge` at
   * the top, rising to `text` from `textFrom` (a share of the height) down. See `../wash`.
   */
  wash?: { colour: string; edge: number; text: number; textFrom: number };
  style?: ViewStyle;
}

function alphaHex(hex: string, a: number): string {
  return `${hex}${Math.round(Math.max(0, Math.min(1, a)) * 255)
    .toString(16)
    .padStart(2, '0')}`;
}

export function SceneBackdrop({ scene, wash, style }: SceneBackdropProps) {
  const glow = useWorld().tokens.glow;
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setSize((prev) =>
      prev && prev.width === width && prev.height === height ? prev : { width, height },
    );
  };
  const band = scene.presence === 'band';
  const width = size?.width ?? 0;
  const height = size?.height ?? 0;
  // A band draws the landscape short enough that the horizon, hills and shore sit inside it.
  const drawHeight = band ? height / 0.7 : height;
  const landscape = useMemo(
    () =>
      width > 0 && height > 0
        ? landscapeOf(scene.view, width, drawHeight, scene.tier === 'rich')
        : null,
    [scene.view, scene.tier, width, height, drawHeight],
  );
  const colours = useMemo(
    () => (scene.palette ? landscapeColours(scene.palette, daylightAt(scene.minute), glow) : null),
    [scene.palette, scene.minute, glow],
  );

  // The web paints its own floors; the scene comes there later, through the same resolver.
  if (scene.paint === 'none' || Platform.OS === 'web') return null;
  if (scene.paint === 'colour') {
    return (
      <View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: scene.colour ?? undefined }, style]}
      />
    );
  }
  return (
    <View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { overflow: 'hidden' }, style]}
      onLayout={onLayout}
    >
      {landscape && colours && scene.palette ? (
        <>
          <Canvas style={{ width, height }}>
            <SceneStill
              scene={scene}
              landscape={landscape}
              colours={colours}
              glow={glow}
              clipHeight={band ? height : undefined}
            />
            {wash ? (
              <Rect x={0} y={0} width={width} height={height}>
                <LinearGradient
                  start={vec(0, 0)}
                  end={vec(0, height)}
                  colors={[
                    alphaHex(wash.colour, wash.edge),
                    alphaHex(wash.colour, wash.edge),
                    alphaHex(wash.colour, wash.text),
                    alphaHex(wash.colour, wash.text),
                  ]}
                  positions={[0, Math.max(0, wash.textFrom - 0.12), wash.textFrom, 1]}
                />
              </Rect>
            ) : null}
          </Canvas>
          <SceneWeather
            scene={scene}
            width={width}
            height={height}
            rainColour={`${mixHex(scene.palette.horizon, SCENE_LIGHT.white, 0.4)}${band ? '33' : '66'}`}
          />
        </>
      ) : null}
    </View>
  );
}
