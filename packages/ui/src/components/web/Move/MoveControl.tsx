import { useEffect, useRef, useState } from 'react';
import type { KitIconProps, MoveBy, MoveControlContract } from '../../../theme/contracts';
import { IconButton } from '../IconButton/IconButton';

export type MoveControlProps = MoveControlContract;

const upWord = (label: string) => `Move ${label} up`;
const downWord = (label: string) => `Move ${label} down`;
const placeWord = (label: string, place: number, total: number) => `${label}, ${place} of ${total}`;

function Chevron({ size = 20, up }: KitIconProps & { up: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true">
      <path
        d={up ? 'M5 12.5 L10 7.5 L15 12.5' : 'M5 7.5 L10 12.5 L15 7.5'}
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
const Up = (p: KitIconProps) => <Chevron {...p} up />;
const Down = (p: KitIconProps) => <Chevron {...p} up={false} />;

/**
 * Up and down beside a piece being arranged. Alt+Arrow moves by one,
 * Alt+Home/End to the ends; the new place is read out from a polite live
 * region after the floor redraws. A button that would do nothing is disabled.
 */
export function MoveControl({ label, place, total, onMove, words }: MoveControlProps) {
  const say = words?.place ?? placeWord;
  const moved = useRef(false);
  const [spoken, setSpoken] = useState('');
  useEffect(() => {
    if (!moved.current) return;
    moved.current = false;
    setSpoken(say(label, place, total));
  }, [label, place, total, say]);
  const canUp = place > 1;
  const canDown = place < total;
  const move = (by: MoveBy) => {
    if ((by === -1 || by === 'first') && !canUp) return;
    if ((by === 1 || by === 'last') && !canDown) return;
    moved.current = true;
    onMove(by);
  };

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: keys reach the buttons inside
    <div
      role="group"
      aria-label={say(label, place, total)}
      className="gd-move"
      onKeyDown={(event) => {
        if (!event.altKey) return;
        const by = ({ ArrowUp: -1, ArrowDown: 1, Home: 'first', End: 'last' } as const)[
          event.key as 'ArrowUp'
        ];
        if (by === undefined) return;
        event.preventDefault();
        move(by);
      }}
    >
      <IconButton
        icon={Up}
        label={(words?.up ?? upWord)(label)}
        size="sm"
        disabled={!canUp}
        onClick={() => move(-1)}
      />
      <IconButton
        icon={Down}
        label={(words?.down ?? downWord)(label)}
        size="sm"
        disabled={!canDown}
        onClick={() => move(1)}
      />
      <span className="gd-visually-hidden" aria-live="polite">
        {spoken}
      </span>
    </div>
  );
}
