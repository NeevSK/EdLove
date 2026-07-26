import type React from 'react';
import { StyleSheet } from 'react-native';
import { FlatList } from '@/primitives';
import { Theme } from '@/theme/Theme';
import { SanctuaryChip, type SanctuaryChipProps } from '@/components/SanctuaryChip';

export interface ChipItem {
  label: string;
  value: string;
}

export interface HorizontalChipRowProps {
  chips: ChipItem[];
  selectedValue?: string;
  onSelect: (value: string) => void;
  size?: SanctuaryChipProps['size'];
  variant?: SanctuaryChipProps['variant'];
  /** Override the horizontal padding of the list container */
  paddingHorizontal?: number;
  /** Whether to center the items if they don't overflow */
  center?: boolean;
}

/**
 * HorizontalChipRow - scrollable row of SanctuaryChips backed by FlatList.
 * Safe to nest inside VirtualizedList/FlatList (different axis avoids RN warning).
 */
export const HorizontalChipRow: React.FC<HorizontalChipRowProps> = ({
  chips,
  selectedValue,
  onSelect,
  size = 'md',
  variant = 'filter',
  paddingHorizontal = Theme.spacing.md,
  center,
}) => (
  <FlatList
    horizontal
    data={chips}
    keyExtractor={(item) => item.value}
    renderItem={({ item }) => (
      <SanctuaryChip
        label={item.label}
        selected={item.value === selectedValue}
        onPress={() => onSelect(item.value)}
        size={size}
        variant={variant}
      />
    )}
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={[
      styles.container,
      { paddingHorizontal },
      center && styles.centeredContent,
    ]}
  />
);

const styles = StyleSheet.create({
  container: {
    paddingVertical: Theme.spacing.sm,
  },
  centeredContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
});
