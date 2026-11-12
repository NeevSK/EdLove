import type { FloorNode, FloorTree, PatternId } from '@repo/core/logic/floor';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button } from '../Button/Button';
import { Grid } from '../Layout/Grid';
import { Stack } from '../Layout/Layout';
import { Text } from '../Text/Text';

export interface FloorViewProps {
  tree: FloorTree;
  /** Draws one piece (a feature) with the kit component its plan names. */
  renderPiece: (piece: FloorNode) => ReactNode;
  /** Opens the rest of a group whose pieces did not all fit. */
  onSeeAll?: (groupId: string) => void;
  /** Translated "See all" words; default English. */
  seeAllLabel?: (group: string, count: number) => string;
  /** Show the floor's own scroll; off when a screen already scrolls. */
  scroll?: boolean;
}

const ROW: ReadonlySet<PatternId> = new Set(['shelf', 'circle-rail', 'chip-rail']);
const GRID: ReadonlySet<PatternId> = new Set(['tile-grid', 'mixed-tiles', 'pinboard']);

const defaultSeeAll = (group: string, count: number) => `See all ${count} in ${group}`;

/**
 * Draws a laid-out floor: areas stacked or side by side, each group in the
 * pattern the engine chose, pieces in the engine's reading order. It decides
 * nothing itself; what goes where, and why, is in the tree (see the
 * inspector). Groups announce their name as a heading.
 */
export function FloorView({
  tree,
  renderPiece,
  onSeeAll,
  seeAllLabel = defaultSeeAll,
  scroll = true,
}: FloorViewProps) {
  const group = (g: FloorNode) => {
    const shown = g.children.filter((c) => c.placement !== 'folded');
    const folded = g.children.length - shown.length;
    const pattern = g.pattern ?? 'stream';
    const pieces = shown.map((p) => (
      <View key={p.id} style={GRID.has(pattern) || ROW.has(pattern) ? null : styles.full}>
        {renderPiece(p)}
      </View>
    ));
    return (
      <Stack key={g.id} gap="inside" accessibilityLabel={g.label}>
        <Text kind="label" tone="soft" accessibilityRole="header">
          {g.label}
        </Text>
        {ROW.has(pattern) ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.row}
          >
            {pieces}
          </ScrollView>
        ) : GRID.has(pattern) ? (
          <Grid min="sm">{pieces}</Grid>
        ) : (
          <Stack gap="between">{pieces}</Stack>
        )}
        {folded > 0 ? (
          <Button
            variant="quiet"
            size="sm"
            label={seeAllLabel(g.label, g.children.length)}
            onPress={() => onSeeAll?.(g.id)}
          />
        ) : null}
      </Stack>
    );
  };

  const area = (a: FloorNode) => (
    <Stack key={a.id} gap="group" accessibilityLabel={a.label}>
      {a.children.map(group)}
    </Stack>
  );

  const body =
    tree.arrangement === 'board' ? (
      <View style={styles.board}>
        {tree.root.children.map((a) => (
          <ScrollView key={a.id} style={styles.column} contentContainerStyle={styles.columnBody}>
            {area(a)}
          </ScrollView>
        ))}
      </View>
    ) : (
      <Stack gap="section">{tree.root.children.map(area)}</Stack>
    );

  if (!scroll || tree.arrangement === 'board') return body;
  return <ScrollView contentContainerStyle={styles.stackBody}>{body}</ScrollView>;
}

const styles = StyleSheet.create({
  full: { alignSelf: 'stretch' },
  row: { gap: 12, paddingRight: 16 },
  board: { flex: 1, flexDirection: 'row', gap: 16 },
  column: { flex: 1 },
  columnBody: { paddingBottom: 24 },
  stackBody: { paddingBottom: 32 },
});
