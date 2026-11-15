/**
 * Scene art drawn still, as a Skia element tree: every layer the tier allows, in order, with no
 * animated values, so its canvas records once and redraws only when the art changes (about once a
 * minute). Pure Skia elements, so it also renders headless (`pnpm scene:shots`).
 */

import { memo } from 'react';
import { BlurMask, Group, LinearGradient, Path, RadialGradient, vec } from 'react-native-skia';
import type { ArtFill, ArtLayer, ArtShape } from '../../../theme/scene/art/types';
import { atLeast, type StageTier } from '../../../theme/stage';

function Fill({ fill }: { fill: ArtFill }) {
  if (fill.kind === 'linear') {
    return (
      <LinearGradient
        start={vec(fill.from[0], fill.from[1])}
        end={vec(fill.to[0], fill.to[1])}
        colors={fill.stops.map((s) => s[0])}
        positions={fill.stops.map((s) => s[1])}
      />
    );
  }
  if (fill.kind === 'radial') {
    return (
      <RadialGradient
        c={vec(fill.centre[0], fill.centre[1])}
        r={Math.max(1, fill.radius)}
        colors={fill.stops.map((s) => s[0])}
        positions={fill.stops.map((s) => s[1])}
      />
    );
  }
  return null;
}

export function ArtShapeView({ shape }: { shape: ArtShape }) {
  const blur = shape.blur ? <BlurMask blur={shape.blur} style="normal" /> : null;
  return (
    <>
      {shape.fill ? (
        <Path path={shape.d} color={shape.fill.kind === 'solid' ? shape.fill.colour : undefined}>
          {shape.fill.kind === 'solid' ? null : <Fill fill={shape.fill} />}
          {blur}
        </Path>
      ) : null}
      {shape.stroke ? (
        <Path
          path={shape.d}
          style="stroke"
          strokeWidth={shape.stroke.width}
          strokeCap={shape.stroke.cap ?? 'round'}
          strokeJoin="round"
          color={shape.stroke.colour}
        >
          {blur}
        </Path>
      ) : null}
    </>
  );
}

export function ArtLayerView({ layer }: { layer: ArtLayer }) {
  return (
    <Group opacity={layer.opacity ?? 1}>
      {layer.shapes.map((shape, i) => (
        <ArtShapeView key={`${layer.id}-${i}`} shape={shape} />
      ))}
    </Group>
  );
}

/** Whether a layer is drawn at this tier. */
export function layerShows(layer: ArtLayer, tier: StageTier): boolean {
  return atLeast(tier, layer.from ?? 'floor');
}

export interface ArtStillProps {
  layers: readonly ArtLayer[];
  tier: StageTier;
}

export const ArtStill = memo(function ArtStill({ layers, tier }: ArtStillProps) {
  return (
    <Group>
      {layers.map((layer) =>
        layerShows(layer, tier) ? <ArtLayerView key={layer.id} layer={layer} /> : null,
      )}
    </Group>
  );
});
