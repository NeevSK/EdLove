import type { FloorNode, PatternId } from '@repo/core/logic/floor';
import { type ReactNode, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { glowStyle } from '../../../theme/native/style';
import { useWorld } from '../../../theme/native/WorldContext';
import { FLOOR_SIDE_BY_SIDE } from '../../../theme/floorFit';
import { cardWidth } from '../../../tokens/sizes';
import { Button } from '../Button/Button';
import { Grid } from '../Layout/Grid';
import { Stack } from '../Layout/Layout';
import { useContainerWidth } from '../Layout/useContainerWidth';
import { Divider } from '../Status/Status';
import { Text } from '../Text/Text';
import { TOUCH_MIN } from '../touch';

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

/** Wide enough to put two things side by side (list beside detail, desk). */
const SIDE_BY_SIDE = FLOOR_SIDE_BY_SIDE;

const isLit = (p: FloorNode) => !!p.piece?.lit;

/**
 * Draws one group in the pattern the engine chose. Every pattern keeps the
 * engine's reading order, so what a screen reader says matches what is seen;
 * patterns only decide shape. Depth cues come from the node (the world asks,
 * the verger tier trims), never from the pattern itself.
 */
export function PatternBody({ pattern, pieces, renderPiece, words }: PatternProps) {
  const w = { ...ENGLISH, ...words };
  const draw = (p: FloorNode) => <Piece key={p.id} node={p} render={renderPiece} />;
  switch (pattern) {
    case 'hero':
      return <Stack gap="between">{pieces.map(draw)}</Stack>;
    case 'lamp':
      return <Lamp pieces={pieces} draw={draw} />;
    case 'tile-grid':
    case 'pinboard':
      return <Grid min="sm">{pieces.map(draw)}</Grid>;
    case 'mixed-tiles':
      return <MixedTiles pieces={pieces} draw={draw} />;
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

type Draw = (p: FloorNode) => ReactNode;

/** One piece, wearing the depth cues the engine kept for it. */
function Piece({ node, render }: { node: FloorNode; render: Draw }) {
  const world = useWorld();
  const lit = isLit(node) && node.depth.includes('light');
  return (
    <View
      style={lit ? glowStyle({ color: world.tokens.glow, radius: 24, opacity: 0.35 }) : undefined}
    >
      {render(node)}
    </View>
  );
}

/** The lit piece first and full width; the rest follow quietly beneath it. */
function Lamp({ pieces, draw }: { pieces: readonly FloorNode[]; draw: Draw }) {
  const lit = pieces.find(isLit) ?? pieces[0];
  const rest = pieces.filter((p) => p !== lit);
  return (
    <Stack gap="between">
      {lit ? draw(lit) : null}
      {rest.length > 0 ? <Grid min="sm">{rest.map(draw)}</Grid> : null}
    </Stack>
  );
}

/** One big fact across the top, small ones in a grid under it. */
function MixedTiles({ pieces, draw }: { pieces: readonly FloorNode[]; draw: Draw }) {
  const [first, ...rest] = pieces;
  return (
    <Stack gap="between">
      {first ? draw(first) : null}
      {rest.length > 0 ? <Grid min="sm">{rest.map(draw)}</Grid> : null}
    </Stack>
  );
}

/**
 * A sideways shelf. With `peek`, each item is narrower than the space so the
 * next one shows at the edge: the cue that there is more, without an arrow.
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
  const { width, onLayout } = useContainerWidth();
  const gap = 12;
  const w = itemWidth
    ? peek
      ? Math.min(itemWidth, Math.max(120, width * 0.72))
      : itemWidth
    : undefined;
  return (
    <View onLayout={onLayout}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={w ? w + gap : undefined}
        decelerationRate={w ? 'fast' : 'normal'}
        contentContainerStyle={[styles.shelf, { gap }]}
      >
        {pieces.map((p) => (
          <View key={p.id} style={w ? { width: w } : null}>
            {draw(p)}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

/** Rows on hairlines, for finding one thing among many. */
function GroupedList({ pieces, draw }: { pieces: readonly FloorNode[]; draw: Draw }) {
  return (
    <View>
      {pieces.map((p, i) => (
        <View key={p.id}>
          {i > 0 ? <Divider /> : null}
          {draw(p)}
        </View>
      ))}
    </View>
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
      <View style={styles.stepper}>
        <Button
          variant="quiet"
          size="sm"
          label={words.previous}
          disabled={i === 0}
          onPress={() => setAt(i - 1)}
        />
        <Text kind="caption" tone="soft" accessibilityLiveRegion="polite">
          {words.place(i + 1, pieces.length)}
        </Text>
        <Button
          variant="quiet"
          size="sm"
          label={words.next}
          disabled={i === pieces.length - 1}
          onPress={() => setAt(i + 1)}
        />
      </View>
    </Stack>
  );
}

/** Steps on a line: a dot for each, the first one lit. */
function Path({ pieces, draw }: { pieces: readonly FloorNode[]; draw: Draw }) {
  const t = useWorld().tokens;
  return (
    <View>
      {pieces.map((p, i) => (
        <View key={p.id} style={styles.pathRow}>
          <View style={styles.pathRail} importantForAccessibility="no" accessibilityElementsHidden>
            <View style={[styles.pathDot, { backgroundColor: i === 0 ? t.lamp : t.line }]} />
            {i < pieces.length - 1 ? (
              <View style={[styles.pathLine, { backgroundColor: t.line }]} />
            ) : null}
          </View>
          <View style={styles.pathBody}>{draw(p)}</View>
        </View>
      ))}
    </View>
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
          <Text kind="caption" tone="soft" accessibilityRole="header">
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
  const { width, onLayout } = useContainerWidth();
  const [open, setOpen] = useState(pieces[0]?.id);
  const selected = pieces.find((p) => p.id === open) ?? pieces[0];
  if (width < SIDE_BY_SIDE || !selected) {
    return (
      <View onLayout={onLayout}>
        <GroupedList pieces={pieces} draw={draw} />
      </View>
    );
  }
  return (
    <View onLayout={onLayout} style={styles.side}>
      <View style={styles.list}>
        {pieces.map((p) => (
          <Pressable
            key={p.id}
            accessibilityRole="tab"
            accessibilityState={{ selected: p.id === selected.id }}
            accessibilityLabel={p.label}
            onPress={() => setOpen(p.id)}
            style={styles.listItem}
          >
            <Text kind="label" tone={p.id === selected.id ? 'ink' : 'soft'}>
              {p.label}
            </Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.detail}>{draw(selected)}</View>
    </View>
  );
}

/** Wide: the main piece on the desk, the rest at hand beside it. Narrow: a stream. */
function Desk({ pieces, draw }: { pieces: readonly FloorNode[]; draw: Draw }) {
  const { width, onLayout } = useContainerWidth();
  const [main, ...rest] = pieces;
  if (!main) return null;
  if (width < SIDE_BY_SIDE) {
    return (
      <View onLayout={onLayout}>
        <Stack gap="between">{pieces.map(draw)}</Stack>
      </View>
    );
  }
  return (
    <View onLayout={onLayout} style={styles.side}>
      <View style={styles.deskMain}>{draw(main)}</View>
      <Stack gap="between" style={styles.deskSide}>
        {rest.map(draw)}
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  shelf: { paddingRight: 16 },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pathRow: { flexDirection: 'row', gap: 12 },
  pathRail: { width: 16, alignItems: 'center' },
  pathDot: { width: 12, height: 12, borderRadius: 6, marginTop: 16 },
  pathLine: { width: 2, flex: 1, marginTop: 4 },
  pathBody: { flex: 1, paddingBottom: 12 },
  side: { flexDirection: 'row', gap: 16 },
  list: { flex: 2, gap: 4 },
  listItem: { minHeight: TOUCH_MIN, justifyContent: 'center' },
  detail: { flex: 3 },
  deskMain: { flex: 2 },
  deskSide: { flex: 1 },
});
