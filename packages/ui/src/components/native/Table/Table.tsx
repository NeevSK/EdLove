import { Text as RNText, type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';
import type { TableContract } from '../../../theme/contracts';
import { typeStyle } from '../../../theme/native/style';
import { useWorldContext } from '../../../theme/native/WorldContext';

export interface TableProps<R> extends TableContract<R> {
  style?: StyleProp<ViewStyle>;
}

/**
 * A small grid of values with named columns (a week's attendance, a mark
 * sheet). For long data on a phone, use List; a table is for what fits.
 * Rows, column headers and cells carry their roles for screen readers.
 */
export function Table<R>({ caption, columns, rows, rowKey, empty, style }: TableProps<R>) {
  const { world, language } = useWorldContext();
  const t = world.tokens;
  const head = typeStyle(world.recipes.text.label, language, world);
  const body = typeStyle(world.recipes.text.body, language, world);
  const align = (a?: 'start' | 'end') => (a === 'end' ? styles.end : styles.start);

  return (
    <View role="table" aria-label={caption} style={style}>
      <RNText style={[typeStyle(world.recipes.text.caption, language, world), styles.caption]}>{caption}</RNText>
      <View role="row" style={[styles.row, { borderBottomColor: t.line, borderBottomWidth: 1.5 }]}>
        {columns.map((col) => (
          <View key={col.key} role="columnheader" style={[styles.cell, align(col.align)]}>
            <RNText style={[head, { color: t.inkSoft }]}>{col.header}</RNText>
          </View>
        ))}
      </View>
      {rows.length === 0 && empty ? (
        <RNText style={[body, styles.empty, { color: t.inkSoft }]}>{empty}</RNText>
      ) : (
        rows.map((row) => (
          <View key={rowKey(row)} role="row" style={[styles.row, { borderBottomColor: t.line }]}>
            {columns.map((col) => {
              const value = col.cell(row);
              return (
                <View key={col.key} role="cell" style={[styles.cell, align(col.align)]}>
                  {typeof value === 'string' || typeof value === 'number' ? (
                    <RNText style={[body, { color: t.ink }]}>{value}</RNText>
                  ) : (
                    value
                  )}
                </View>
              );
            })}
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  caption: { marginBottom: 6 },
  row: { flexDirection: 'row', borderBottomWidth: StyleSheet.hairlineWidth, minHeight: 44, alignItems: 'center' },
  cell: { flex: 1, paddingVertical: 8, paddingHorizontal: 6 },
  start: { alignItems: 'flex-start' },
  end: { alignItems: 'flex-end' },
  empty: { paddingVertical: 16, textAlign: 'center' },
});
