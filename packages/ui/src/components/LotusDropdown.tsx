import { ChevronDown, CircleAlert } from '@repo/ui/icons';
import { useState } from 'react';
import {
  Actionsheet,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetItem,
  ActionsheetItemText,
  HStack,
  Text,
  VStack,
} from '@repo/ui/gluestack';
import { Pressable } from '@repo/ui/primitives';

interface LotusDropdownProps {
  label?: string;
  value: string;
  options: Array<{ label: string; value: string }>;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  isDisabled?: boolean;
}

/**
 * LotusDropdown
 *
 * A hardened, phase-aware dropdown component.
 * Uses Actionsheet for a premium mobile experience.
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
  const [showActionsheet, setShowActionsheet] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);
  const hasError = !!error;

  const handleClose = () => setShowActionsheet(false);

  return (
    <VStack className="w-full gap-2">
      {label && <Text className="text-phase-text-primary font-medium tracking-wide">{label}</Text>}

      <Pressable
        accessibilityRole="button"
        onPress={() => !isDisabled && setShowActionsheet(true)}
        className={`
                    flex-row items-center justify-between h-12 px-4 rounded-xl border
                    ${isDisabled ? 'opacity-50' : 'active:opacity-70'}
                    ${hasError ? 'border-phase-danger bg-phase-danger/5' : 'border-phase-surface bg-phase-surface'}
                `}
      >
        <Text
          className={`text-base ${selectedOption ? 'text-phase-text-primary' : 'text-phase-text-secondary'}`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <ChevronDown size={20} className="text-phase-text-secondary" />
      </Pressable>

      {hasError && (
        <HStack className="items-center gap-1.5 px-1">
          <CircleAlert size={14} className="text-phase-danger" />
          <Text className="text-phase-danger text-xs font-medium">{error}</Text>
        </HStack>
      )}

      <Actionsheet isOpen={showActionsheet} onClose={handleClose}>
        <ActionsheetContent className="bg-phase-elevated border-t border-phase-surface pb-8">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>

          <VStack className="w-full p-2">
            {options.map((option) => (
              <ActionsheetItem
                key={option.value}
                onPress={() => {
                  onChange(option.value);
                  handleClose();
                }}
                className={`rounded-xl mb-1 ${value === option.value ? 'bg-phase-accent/10 border border-phase-accent/20' : 'active:bg-phase-surface'}`}
              >
                <ActionsheetItemText
                  className={`text-base ${value === option.value ? 'text-phase-accent font-bold' : 'text-phase-text-primary'}`}
                >
                  {option.label}
                </ActionsheetItemText>
              </ActionsheetItem>
            ))}
          </VStack>
        </ActionsheetContent>
      </Actionsheet>
    </VStack>
  );
}
