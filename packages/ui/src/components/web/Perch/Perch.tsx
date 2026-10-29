import { createElement } from 'react';
import { PERCH_VIEWBOX, PERCHES, type PerchInk } from '../../../theme/perches';
import type { WorldId } from '../../../theme/types';
import { WORLD_IDS } from '../../../theme/worlds';

function paint(ink: PerchInk | undefined): string | undefined {
  if (ink === undefined) return undefined;
  return ink === 'none' ? 'none' : `var(--w-${ink})`;
}

function PerchGroup({ id }: { id: WorldId }) {
  const group = PERCHES[id];
  return (
    <g
      data-perch={id}
      fill={paint(group.fill)}
      stroke={paint(group.stroke)}
      strokeWidth={group.strokeWidth}
    >
      {group.shapes.map((shape, i) =>
        createElement(shape.el, {
          // biome-ignore lint/suspicious/noArrayIndexKey: a fixed drawing; shapes never reorder.
          key: i,
          ...shape.attrs,
          fill: paint(shape.fill),
          stroke: paint(shape.stroke),
        }),
      )}
    </g>
  );
}

export interface PerchProps {
  /** Draw this world's perch (previews); defaults to the active world's. */
  world?: WorldId;
  className?: string;
}

/**
 * Where Tutii rests, filling the scene box it is placed in. Without `world`
 * every perch is in the markup and the stylesheet shows the active world's.
 */
export function Perch({ world, className }: PerchProps) {
  const ids = world ? [world] : WORLD_IDS;
  return (
    <svg
      className={className ? `gd-perch ${className}` : 'gd-perch'}
      viewBox={PERCH_VIEWBOX}
      preserveAspectRatio="xMidYMax meet"
      aria-hidden="true"
      focusable="false"
      data-auto={world ? undefined : ''}
    >
      {ids.map((id) => (
        <PerchGroup key={id} id={id} />
      ))}
    </svg>
  );
}
