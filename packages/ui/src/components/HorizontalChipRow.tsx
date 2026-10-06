import { SanctuaryChip, type SanctuaryChipProps } from '@repo/ui/components/SanctuaryChip';
import { ScrollView } from '@repo/ui/primitives';
import { Theme } from '@repo/ui/theme/Theme';
import type React from 'react';
import { StyleSheet } from 'react-native';

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
 * HorizontalChipRow - scrollable row of SanctuaryChips backed by a lightweight horizontal ScrollView.
 * Safe to nest inside VirtualizedList / SanctuaryFlashList without virtualization overhead.
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
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={[
      styles.container,
      { paddingHorizontal },
      center && styles.centeredContent,
    ]}
  >
    {chips.map((item) => (
      <SanctuaryChip
        key={item.value}
        label={item.label}
        selected={item.value === selectedValue}
        onPress={() => onSelect(item.value)}
        size={size}
        variant={variant}
      />
    ))}
  </ScrollView>
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
