'use client';

import type { FloorNode, PatternId } from '@repo/core/logic/floor';
import { type CSSProperties, type ReactNode, useState } from 'react';
import { FLOOR_SIDE_BY_SIDE } from '../../../theme/floorFit';
import { cardWidth } from '../../../tokens/sizes';
import { Button } from '../Button/Button';
import { Grid } from '../Layout/Grid';
import { Stack } from '../Layout/Layout';
import { Divider } from '../Status/Status';
import { Text } from '../Text/Text';
import { useInlineSize } from './useInlineSize';

/**
 * Web twin of the phone kit's floor patterns (components/native/Floor). Same
 * patterns, same names, same reading order; only the drawing differs. Colours,
 * gaps and scroll bars come from the kit stylesheet (`.gd-floor-*`).
 */
export interface PatternProps {
  pattern: PatternId;
  /** The group's pieces the engine put on screen, in reading order. */
  pieces: readonly FloorNode[];
  renderPiece: (piece: FloorNode) => ReactNode;
  /** Translated words for the patterns that print their own labels. */
  words?: Partial<PatternWords>;
}

export interface PatternWords {
  now: string;
  later: string;
  anytime: string;
  /** "2 of 5" under one-at-a-time. */
  place: (n: number, total: number) => string;
  previous: string;
  next: string;
}

const ENGLISH: PatternWords = {
  now: 'Now',
  later: 'Later today',
  anytime: 'Any time',
  place: (n, total) => `${n} of ${total}`,
  previous: 'Previous',
  next: 'Next',
};

const isLit = (p: FloorNode) => !!p.piece?.lit;

type Draw = (p: FloorNode) => ReactNode;

/** Draws one group in the pattern the engine chose. Patterns only decide shape. */
export function PatternBody({ pattern, pieces, renderPiece, words }: PatternProps) {
  const w = { ...ENGLISH, ...words };
  const draw: Draw = (p) => <Piece key={p.id} node={p} render={renderPiece} />;
  switch (pattern) {
    case 'hero':
      return <Stack gap="between">{pieces.map(draw)}</Stack>;
    case 'lamp':
      return <Lamp pieces={pieces} draw={draw} />;
    case 'tile-grid':
    case 'pinboard':
      return <Grid min="sm">{pieces.map(draw)}</Grid>;
    case 'mixed-tiles':
      return <Lamp pieces={pieces} draw={draw} first />;
    case 'shelf':
      return <Shelf pieces={pieces} draw={draw} itemWidth={cardWidth.md} peek />;
    case 'circle-rail':
      return <Shelf pieces={pieces} draw={draw} itemWidth={96} />;
    case 'chip-rail':
      return <Shelf pieces={pieces} draw={draw} />;
    case 'grouped-list':
      return <GroupedList pieces={pieces} draw={draw} />;
    case 'one-at-a-time':
      return <OneAtATime pieces={pieces} draw={draw} words={w} />;
    case 'path':
      return <Path pieces={pieces} draw={draw} />;
    case 'day-river':
      return <DayRiver pieces={pieces} draw={draw} words={w} />;
    case 'list-detail':
      return <ListDetail pieces={pieces} draw={draw} />;
    case 'desk':
      return <Desk pieces={pieces} draw={draw} />;
    default:
      return <Stack gap="between">{pieces.map(draw)}</Stack>;
  }
}

/** One piece, wearing the depth cues the engine kept for it (the glow is the world's). */
function Piece({ node, render }: { node: FloorNode; render: Draw }) {
  const lit = isLit(node) && node.depth.includes('light');
  return (
    <div className="gd-floor-piece" data-lit={lit || undefined}>
      {render(node)}
    </div>
  );
}

/** Lamp: the lit piece first and full width, the rest in a grid. Mixed tiles: the first piece. */
function Lamp({
  pieces,
  draw,
  first = false,
}: {
  pieces: readonly FloorNode[];
  draw: Draw;
  first?: boolean;
}) {
  const top = first ? pieces[0] : (pieces.find(isLit) ?? pieces[0]);
  const rest = pieces.filter((p) => p !== top);
  return (
    <Stack gap="between">
      {top ? draw(top) : null}
      {rest.length > 0 ? <Grid min="sm">{rest.map(draw)}</Grid> : null}
    </Stack>
  );
}

/**
 * A sideways shelf. With `peek`, items are narrower than the space so the next
 * one shows at the edge: the cue that there is more, without an arrow.
 */
function Shelf({
  pieces,
  draw,
  itemWidth,
  peek = false,
}: {
  pieces: readonly FloorNode[];
  draw: Draw;
  itemWidth?: number;
  peek?: boolean;
}) {
  const style = itemWidth
    ? ({
        '--gd-floor-item': peek ? `min(${itemWidth}px, 72%)` : `${itemWidth}px`,
      } as CSSProperties)
    : undefined;
  return (
    <ul className="gd-floor-shelf gd-strip" data-sized={itemWidth ? '' : undefined} style={style}>
      {pieces.map((p) => (
        <li key={p.id} className="gd-floor-shelf-item">
          {draw(p)}
        </li>
      ))}
    </ul>
  );
}

/** Rows on hairlines, for finding one thing among many. */
function GroupedList({ pieces, draw }: { pieces: readonly FloorNode[]; draw: Draw }) {
  return (
    <div className="gd-floor-list">
      {pieces.map((p, i) => (
        <div key={p.id}>
          {i > 0 ? <Divider /> : null}
          {draw(p)}
        </div>
      ))}
    </div>
  );
}

/** One step shown, with its place and a way to the step before and after. */
function OneAtATime({
  pieces,
  draw,
  words,
}: {
  pieces: readonly FloorNode[];
  draw: Draw;
  words: PatternWords;
}) {
  const [at, setAt] = useState(0);
  const i = Math.min(at, pieces.length - 1);
  const current = pieces[i];
  if (!current) return null;
  return (
    <Stack gap="inside">
      {draw(current)}
      <div className="gd-floor-stepper">
        <Button
          variant="quiet"
          size="sm"
          label={words.previous}
          disabled={i === 0}
          onClick={() => setAt(i - 1)}
        />
        <Text kind="caption" tone="soft" as="span" aria-live="polite">
          {words.place(i + 1, pieces.length)}
        </Text>
        <Button
          variant="quiet"
          size="sm"
          label={words.next}
          disabled={i === pieces.length - 1}
          onClick={() => setAt(i + 1)}
        />
      </div>
    </Stack>
  );
}

/** Steps on a line: a dot for each, the first one lit. */
function Path({ pieces, draw }: { pieces: readonly FloorNode[]; draw: Draw }) {
  return (
    <ol className="gd-floor-path">
      {pieces.map((p, i) => (
        <li key={p.id} className="gd-floor-path-step" data-first={i === 0 || undefined}>
          {draw(p)}
        </li>
      ))}
    </ol>
  );
}

/** The day as it flows: now, later today, any time. Empty bands are left out. */
function DayRiver({
  pieces,
  draw,
  words,
}: {
  pieces: readonly FloorNode[];
  draw: Draw;
  words: PatternWords;
}) {
  const bands = (['now', 'later', 'anytime'] as const)
    .map((band) => ({
      band,
      items: pieces.filter((p) => (p.piece?.time ?? 'anytime') === band),
    }))
    .filter((b) => b.items.length > 0);
  return (
    <Stack gap="group">
      {bands.map((b) => (
        <Stack key={b.band} gap="inside">
          <Text kind="caption" tone="soft" as="h4">
            {words[b.band]}
          </Text>
          <Stack gap="between">{b.items.map(draw)}</Stack>
        </Stack>
      ))}
    </Stack>
  );
}

/** Wide: the list beside the open piece. Narrow: just the list. */
function ListDetail({ pieces, draw }: { pieces: readonly FloorNode[]; draw: Draw }) {
  const [ref, width] = useInlineSize<HTMLDivElement>();
  const [open, setOpen] = useState(pieces[0]?.id);
  const selected = pieces.find((p) => p.id === open) ?? pieces[0];
  if (width < FLOOR_SIDE_BY_SIDE || !selected) {
    return (
      <div ref={ref}>
        <GroupedList pieces={pieces} draw={draw} />
      </div>
    );
  }
  return (
    <div ref={ref} className="gd-floor-side" data-shape="list-detail">
      <ul className="gd-floor-picks">
        {pieces.map((p) => (
          <li key={p.id}>
            <button
              type="button"
              className="gd-floor-pick"
              aria-current={p.id === selected.id || undefined}
              onClick={() => setOpen(p.id)}
            >
              {p.label}
            </button>
          </li>
        ))}
      </ul>
      <div className="gd-floor-main">{draw(selected)}</div>
    </div>
  );
}

/** Wide: the main piece on the desk, the rest at hand beside it. Narrow: a stream. */
function Desk({ pieces, draw }: { pieces: readonly FloorNode[]; draw: Draw }) {
  const [ref, width] = useInlineSize<HTMLDivElement>();
  const [main, ...rest] = pieces;
  if (!main) return null;
  if (width < FLOOR_SIDE_BY_SIDE) {
    return (
      <div ref={ref}>
        <Stack gap="between">{pieces.map(draw)}</Stack>
      </div>
    );
  }
  return (
    <div ref={ref} className="gd-floor-side" data-shape="desk">
      <div className="gd-floor-main">{draw(main)}</div>
      <Stack gap="between">{rest.map(draw)}</Stack>
    </div>
  );
}
