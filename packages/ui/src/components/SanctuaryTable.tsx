import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { flexRender, type Table } from '@tanstack/react-table';
import SanctuaryFlashList from './SanctuaryFlashList';
import { useThemedColors } from '../hooks/useThemedColors';
import { Theme } from '../theme/Theme';

export interface SanctuaryTableProps<TData> {
  table: Table<TData>;
  estimatedItemSize?: number;
}

/**
 * SanctuaryTable - Decoupled React Native Table renderer.
 * Consumes a TanStack Table instance and renders items using SanctuaryFlashList.
 */
export function SanctuaryTable<TData>({
  table,
  estimatedItemSize = 60,
}: SanctuaryTableProps<TData>) {
  const colors = useThemedColors();
  const headers = table.getFlatHeaders();
  const rows = table.getRowModel().rows;

  return (
    <View style={[styles.container, { borderColor: colors.border }]}>
      {/* Header Row */}
      <View style={[styles.headerRow, { backgroundColor: (colors as any).surfaceVariant || colors.surface || '#f5f5f5', borderBottomColor: colors.border }]}>
        {headers.map((header) => (
          <View
            key={header.id}
            style={[
              styles.cell,
              { flex: header.column.columnDef.size !== 150 ? undefined : 1 },
              header.column.columnDef.size !== 150 ? { width: header.column.columnDef.size } : {},
            ]}
          >
            {header.isPlaceholder ? null : (
              <Text style={[styles.headerText, { color: colors.textSecondary || '#666' }]}>
                {flexRender(header.column.columnDef.header, header.getContext()) as string}
              </Text>
            )}
          </View>
        ))}
      </View>

      {/* Recycler Body */}
      <SanctuaryFlashList
        data={rows}
        estimatedItemSize={estimatedItemSize}
        keyExtractor={(row) => row.id}
        renderItem={({ item: row }) => (
          <View style={[styles.row, { borderBottomColor: colors.border }]}>
            {row.getVisibleCells().map((cell) => (
              <View
                key={cell.id}
                style={[
                  styles.cell,
                  { flex: cell.column.columnDef.size !== 150 ? undefined : 1 },
                  cell.column.columnDef.size !== 150 ? { width: cell.column.columnDef.size } : {},
                ]}
              >
                <Text style={{ color: colors.text }}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext()) as React.ReactNode}
                </Text>
              </View>
            ))}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: Theme.corners.medium || 8,
    overflow: 'hidden',
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  cell: {
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default SanctuaryTable;
