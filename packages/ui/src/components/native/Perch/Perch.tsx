/**
 * Where Tutii rests in each world, drawn from the shared shapes in
 * `theme/perches.ts` (the web draws the same shapes as DOM SVG).
 */

import { StyleSheet } from 'react-native';
import Svg, { Circle, Ellipse, G, Line, Path, Rect } from 'react-native-svg';
import { useWorld } from '../../../theme/native/WorldContext';
import { PERCH_VIEWBOX, PERCHES, type PerchElement, type PerchInk } from '../../../theme/perches';
import type { WorldTokens } from '../../../theme/types';

const ELEMENTS = {
  path: Path,
  circle: Circle,
  ellipse: Ellipse,
  rect: Rect,
  line: Line,
} as const satisfies Record<PerchElement, unknown>;

function paint(ink: PerchInk | undefined, t: WorldTokens): string | undefined {
  if (ink === undefined) return undefined;
  return ink === 'none' ? 'none' : t[ink];
}

/** The active world's perch, filling the scene box it is placed in. */
export function Perch({ width, height }: { width: number; height: number }) {
  const world = useWorld();
  const group = PERCHES[world.id];
  const t = world.tokens;
  return (
    <Svg
      width={width}
      height={height}
      viewBox={PERCH_VIEWBOX}
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
    >
      <G
        fill={paint(group.fill, t)}
        stroke={paint(group.stroke, t)}
        strokeWidth={group.strokeWidth}
      >
        {group.shapes.map((shape, i) => {
          const El = ELEMENTS[shape.el] as typeof Path;
          return (
            <El
              // biome-ignore lint/suspicious/noArrayIndexKey: a fixed drawing; shapes never reorder.
              key={i}
              {...(shape.attrs as object)}
              fill={paint(shape.fill, t)}
              stroke={paint(shape.stroke, t)}
            />
          );
        })}
      </G>
    </Svg>
  );
}
