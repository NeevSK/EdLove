import { Box, HStack, ScrollView, Text, VStack } from '@repo/ui/primitives';
import type { GridData } from '@repo/library/api/spreadsheet';

interface SpreadsheetGridProps {
  grid: GridData;
}

const CELL_PAD = 8;
const GUTTER_WIDTH = 34;

function columnLetters(index: number): string {
  let n = index;
  let label = '';
  while (n >= 0) {
    label = String.fromCharCode((n % 26) + 65) + label;
    n = Math.floor(n / 26) - 1;
  }
  return label;
}

function computeColumnWidths(grid: GridData): number[] {
  return grid.headers.map((header, col) => {
    const longestRow = Math.max(
      header.length,
      ...grid.rows.map((row) => (row[col] == null ? 0 : String(row[col]).length)),
    );
    return Math.min(Math.max(longestRow * 8 + CELL_PAD * 2 + 8, 56), 180);
  });
}

function cellIsNumeric(cell: string | number | boolean | null | undefined): boolean {
  return (
    typeof cell === 'number' ||
    (typeof cell === 'string' && cell.trim() !== '' && !Number.isNaN(Number(cell)))
  );
}

/**
 * Read-only spreadsheet grid renderer: column-letter headers, zebra rows and a
 * frozen row-number gutter, inside nested scroll views (horizontal pan + vertical scroll).
 */
export function SpreadsheetGrid({ grid }: SpreadsheetGridProps) {
  const widths = computeColumnWidths(grid);
  const tableWidth = widths.reduce((sum, w) => sum + w, 0) + GUTTER_WIDTH;

  return (
    <ScrollView style={{ maxHeight: 480 }}>
      <ScrollView horizontal>
        <VStack space="0" style={{ width: tableWidth }}>
          <HStack
            space="0"
            className="border-b border-phase-border bg-phase-canvas"
            style={{ width: tableWidth }}
          >
            <Box
              style={{ width: GUTTER_WIDTH }}
              className="items-center justify-center border-r border-phase-border"
            >
              <Text className="text-xs font-bold text-phase-text-secondary">#</Text>
            </Box>
            {grid.headers.map((header, col) => (
              <Box
                key={`h-${col}`}
                style={{ width: widths[col], paddingHorizontal: CELL_PAD, paddingVertical: 6 }}
                className="border-r border-phase-border"
              >
                <Text className="text-xs font-bold text-phase-text-secondary">
                  {columnLetters(col)}
                </Text>
                <Text className="text-sm font-bold text-phase-text-primary" numberOfLines={1}>
                  {header}
                </Text>
              </Box>
            ))}
          </HStack>
          {grid.rows.map((row, rowIndex) => (
            <HStack
              key={`r-${rowIndex}`}
              space="0"
              style={{ width: tableWidth }}
              className={rowIndex % 2 === 0 ? 'bg-white dark:bg-obsidian' : 'bg-phase-canvas'}
            >
              <Box
                style={{ width: GUTTER_WIDTH }}
                className="items-center justify-center border-r border-phase-border"
              >
                <Text className="text-xs text-phase-text-secondary">{rowIndex + 1}</Text>
              </Box>
              {widths.map((width, col) => {
                const cell = row[col];
                return (
                  <Box
                    key={`c-${rowIndex}-${col}`}
                    style={{ width: width, paddingHorizontal: CELL_PAD, paddingVertical: 5 }}
                    className="border-b border-r border-phase-border/60"
                  >
                    <Text
                      numberOfLines={1}
                      className="text-sm text-phase-text-primary"
                      style={{ textAlign: cellIsNumeric(cell) ? 'right' : 'left' }}
                    >
                      {cell == null || cell === '' ? '' : String(cell)}
                    </Text>
                  </Box>
                );
              })}
            </HStack>
          ))}
        </VStack>
      </ScrollView>
    </ScrollView>
  );
}

export default SpreadsheetGrid;