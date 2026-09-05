import { PressableScale } from '@repo/ui/components/PressableScale';
import { ChevronDown, CircleAlert } from '@repo/ui/icons';
import {
  Box,
  HStack,
  Sheet,
  SheetContent,
  SheetDragIndicator,
  SheetDragIndicatorWrapper,
  SheetItem,
  SheetItemText,
  Text,
  VStack,
} from '@repo/ui/primitives';
import { useState } from 'react';

export interface LotusDropdownOption {
  label: string;
  value: string;
}

export interface LotusDropdownProps {
  label?: string;
  value: string;
  options: LotusDropdownOption[];
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  isDisabled?: boolean;
}

/**
 * LotusDropdown
 *
 * A modern, phase-aware dropdown component built on top of accessible
 * bottom-sheet modal interaction primitives.
 */
export default function LotusDropdown({
  label,
  value,
  options,
  onChange,
  error,
  placeholder = 'Select an option',
  isDisabled = false,
}: LotusDropdownProps) {
  const [showSheet, setShowSheet] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);
  const hasError = !!error;

  return (
    <VStack className="w-full gap-2">
      {label && <Text className="text-phase-text-primary font-medium tracking-wide">{label}</Text>}

      <PressableScale
        onPress={() => {
          if (!isDisabled) {
            setShowSheet(true);
          }
        }}
        disabled={isDisabled}
        accessibilityLabel={
          label ? `${label}: ${selectedOption ? selectedOption.label : placeholder}` : placeholder
        }
        accessibilityHint="Double tap to open option selection menu"
        accessibilityRole="combobox"
        accessibilityState={{
          disabled: isDisabled,
          expanded: showSheet,
        }}
      >
        <Box
          className={`
            flex-row items-center justify-between h-12 px-4 rounded-xl border
            ${isDisabled ? 'opacity-50' : ''}
            ${hasError ? 'border-phase-danger bg-phase-danger/5' : 'border-phase-surface bg-phase-surface'}
          `}
        >
          <Text
            className={`text-base ${selectedOption ? 'text-phase-text-primary' : 'text-phase-text-secondary'}`}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </Text>
          <ChevronDown size={20} className="text-phase-text-secondary" />
        </Box>
      </PressableScale>

      {hasError && (
        <HStack className="items-center gap-1.5 px-1" accessibilityRole="alert">
          <CircleAlert size={14} className="text-phase-danger" />
          <Text className="text-phase-danger text-xs font-medium">{error}</Text>
        </HStack>
      )}

      <Sheet open={showSheet} onOpenChange={setShowSheet}>
        <SheetContent className="bg-phase-elevated border-t border-phase-surface pb-8">
          <SheetDragIndicatorWrapper>
            <SheetDragIndicator />
          </SheetDragIndicatorWrapper>

          <VStack className="w-full p-2" accessibilityRole="radiogroup">
            {options.map((option) => {
              const isSelected = value === option.value;
              return (
                <SheetItem
                  key={option.value}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={option.label}
                  onPress={() => {
                    onChange(option.value);
                    setShowSheet(false);
                  }}
                  className={`rounded-xl mb-1 ${isSelected ? 'bg-phase-accent/10 border border-phase-accent/20' : 'active:bg-phase-surface'}`}
                >
                  <SheetItemText
                    className={`text-base ${isSelected ? 'text-phase-accent font-bold' : 'text-phase-text-primary'}`}
                  >
                    {option.label}
                  </SheetItemText>
                </SheetItem>
              );
            })}
          </VStack>
        </SheetContent>
      </Sheet>
    </VStack>
  );
}
