import type { FloorFinding, FloorNode, FloorTree } from '@repo/core/logic/floor';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../Text/Text';

export interface FloorInspectorProps {
  tree: FloorTree;
  findings?: readonly FloorFinding[];
}

const PLACE: Record<FloorNode['placement'], string> = {
  'first-screen': 'first screen',
  below: 'below the fold',
  folded: 'behind See all',
};

/**
 * Why every piece is where it is: the engine's own reasons, size, weight and
 * place for each area, group and piece, with the lint findings on top. For
 * the lab and for builders; a person never sees it.
 */
export function FloorInspector({ tree, findings = [] }: FloorInspectorProps) {
  const rows: { node: FloorNode; depth: number }[] = [];
  const walk = (n: FloorNode, depth: number) => {
    rows.push({ node: n, depth });
    for (const c of n.children) walk(c, depth + 1);
  };
  walk(tree.root, 0);

  return (
    <ScrollView contentContainerStyle={styles.body} accessibilityLabel="Floor inspector">
      <Text kind="title">{tree.room}</Text>
      <Text tone="soft">
        {tree.widthClass} {tree.orientation}, {tree.tier}, {tree.arrangement}; cost{' '}
        {tree.totalCost.views} of {tree.budget}
        {tree.chrome.hidden.length > 0 ? `; gave way: ${tree.chrome.hidden.join(', ')}` : ''}
      </Text>
      {findings.length === 0 ? (
        <Text tone="soft">No findings.</Text>
      ) : (
        findings.map((f) => (
          <Text key={`${f.rule}-${f.id}`} tone={f.severity === 'error' ? 'danger' : 'lamp'}>
            {f.severity}: {f.message}
          </Text>
        ))
      )}
      {rows.map(({ node, depth }) => (
        <View
          key={`${node.level}-${node.id}`}
          style={[styles.row, { marginLeft: depth * 12 }]}
          accessible
        >
          <Text kind="label">
            {node.label}
            {node.pattern ? ` · ${node.pattern}` : ''}
          </Text>
          <Text kind="caption" tone="soft">
            {node.level} · {Math.round(node.footprint.w)}×{Math.round(node.footprint.h)} · weight{' '}
            {node.weight} · {PLACE[node.placement]} · motion {node.motion}
          </Text>
          {node.why.map((w) => (
            <Text key={w} kind="caption" tone="faint">
              {w}
            </Text>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { gap: 8, padding: 16 },
  row: { paddingVertical: 4 },
});
