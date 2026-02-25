import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { SanctuaryChip, SanctuaryChipProps } from './SanctuaryChip';
import { Theme } from '../theme/Theme';

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
}

/**
 * HorizontalChipRow — scrollable row of SanctuaryChips backed by FlatList.
 * Safe to nest inside VirtualizedList/FlatList (different axis avoids RN warning).
 */
export const HorizontalChipRow: React.FC<HorizontalChipRowProps> = ({
    chips,
    selectedValue,
    onSelect,
    size = 'md',
    variant = 'filter',
    paddingHorizontal = Theme.spacing.md,
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
        ]}
    />
);

const styles = StyleSheet.create({
    container: {
        paddingVertical: Theme.spacing.sm,
    },
});
