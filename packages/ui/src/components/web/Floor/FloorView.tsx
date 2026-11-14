'use client';

import type { FloorNode, FloorTree } from '@repo/core/logic/floor';
import { type ReactNode, useId } from 'react';
import { Button } from '../Button/Button';
import { Stack } from '../Layout/Layout';
import { Text } from '../Text/Text';
import { PatternBody, type PatternWords } from './patterns';

export interface FloorViewProps {
  tree: FloorTree;
  /** Draws one piece (a feature) with the kit component its plan names. */
  renderPiece: (piece: FloorNode) => ReactNode;
  /** Opens the rest of a group whose pieces did not all fit. */
  onSeeAll?: (groupId: string) => void;
  /** Translated "See all" words; default English. */
  seeAllLabel?: (group: string, count: number) => string;
  /** Translated words patterns print (day bands, step place). */
  words?: Partial<PatternWords>;
  /**
   * The room's ground, drawn behind the floor and hidden from screen readers.
   * The room frame resolves it from the world; the floor never picks a look.
   */
  ground?: ReactNode;
  className?: string;
}

const defaultSeeAll = (group: string, count: number) => `See all ${count} in ${group}`;

/**
 * Web twin of the phone kit's FloorView: draws a laid-out floor, areas one
 * under another or side by side, each group in the pattern the engine chose,
 * pieces in the engine's reading order. It decides nothing itself. Each group
 * is a labelled region with its name as a heading. The page scrolls; a board's
 * columns each scroll on their own.
 */
export function FloorView({
  tree,
  renderPiece,
  onSeeAll,
  seeAllLabel = defaultSeeAll,
  words,
  ground,
  className,
}: FloorViewProps) {
  const floor = (
    <div className="gd-floor-areas" data-arrangement={tree.arrangement} data-tier={tree.tier}>
      {tree.root.children.map((a) => (
        <section key={a.id} className="gd-floor-area" aria-label={a.label}>
          <Stack gap="group">
            {a.children.map((g) => (
              <FloorGroup
                key={g.id}
                group={g}
                renderPiece={renderPiece}
                onSeeAll={onSeeAll}
                seeAllLabel={seeAllLabel}
                words={words}
              />
            ))}
          </Stack>
        </section>
      ))}
    </div>
  );
  return (
    <div className={['gd-floor', className].filter(Boolean).join(' ')} data-room={tree.room}>
      {ground ? (
        <div className="gd-floor-ground" aria-hidden="true">
          {ground}
        </div>
      ) : null}
      {floor}
    </div>
  );
}

function FloorGroup({
  group: g,
  renderPiece,
  onSeeAll,
  seeAllLabel,
  words,
}: {
  group: FloorNode;
  renderPiece: FloorViewProps['renderPiece'];
  onSeeAll?: FloorViewProps['onSeeAll'];
  seeAllLabel: NonNullable<FloorViewProps['seeAllLabel']>;
  words?: Partial<PatternWords>;
}) {
  const id = useId();
  const shown = g.children.filter((c) => c.placement !== 'folded');
  const folded = g.children.length - shown.length;
  return (
    <section className="gd-floor-group" aria-labelledby={id} data-pattern={g.pattern ?? 'stream'}>
      <Stack gap="inside">
        <Text id={id} kind="label" tone="soft" as="h3">
          {g.label}
        </Text>
        <PatternBody
          pattern={g.pattern ?? 'stream'}
          pieces={shown}
          renderPiece={renderPiece}
          words={words}
        />
        {folded > 0 ? (
          <Button
            variant="quiet"
            size="sm"
            label={seeAllLabel(g.label, g.children.length)}
            onClick={() => onSeeAll?.(g.id)}
          />
        ) : null}
      </Stack>
    </section>
  );
}
