import type React from 'react';
import { Text } from '../gluestack';
import { Pressable } from '../primitives';

export interface SanctuaryChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  variant?: 'filter' | 'tag' | 'category';
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * SanctuaryChip - canonical chip/pill component for filters, tags, and categories.
 * Uses the phase token hierarchy so the chip always resolves against the
 * current interactive layer rather than hardcoded glass colors.
 */
export const SanctuaryChip: React.FC<SanctuaryChipProps> = ({
  label,
  selected = false,
  onPress,
  variant = 'filter',
  size = 'md',
  className,
}) => {
  const isSmall = size === 'sm';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className={`
                mr-2 border rounded-full
                ${isSmall ? 'px-3 py-0.5' : 'px-4 py-1'}
                ${
                  selected
                    ? 'bg-phase-accent border-phase-accent'
                    : 'bg-phase-surface border-white/10'
                }
                ${className || ''}
            `}
    >
      <Text
        className={`
                    ${isSmall ? 'text-xs' : 'text-sm'}
                    ${selected ? 'text-white font-bold' : 'text-phase-text-secondary font-medium'}
                `}
        numberOfLines={1}
      >
        {variant === 'tag' ? `#${label}` : label}
      </Text>
    </Pressable>
  );
};
