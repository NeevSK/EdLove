import { ChevronDown, CircleAlert } from '@repo/ui/icons';
import { useState } from 'react';
import { Platform } from 'react-native';
import {
  Sheet,
  SheetContent,
  SheetDragIndicator,
  SheetDragIndicatorWrapper,
  SheetItem,
  SheetItemText,
  Box,
  HStack,
  Text,
  VStack,
} from '@repo/ui/primitives';
import { PressableScale } from '@repo/ui/components/PressableScale';
import { NativeDropdownMenu } from '@repo/ui/native-menu';

interface LotusDropdownProps {
  label?: string;
  value: string;
  options: Array<{ label: string; value: string }>;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  isDisabled?: boolean;
  useNativeMenu?: boolean;
}

/**
 * LotusDropdown
 *
 * A hardened, phase-aware dropdown component.
 * Supports true native OS dropdown menus (via Zeego native primitives)
 * with graceful fallback to Actionsheet on non-supporting platforms.
 */
export default function LotusDropdown({
  label,
  value,
  options,
  onChange,
  error,
  placeholder = 'Select an option',
  isDisabled = false,
  useNativeMenu = true,
}: LotusDropdownProps) {
  const [showActionsheet, setShowActionsheet] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);
  const hasError = !!error;

  const handleClose = () => setShowActionsheet(false);

  const zeegoItems = options.map((opt) => ({
    id: opt.value,
    label: opt.label,
    onSelect: () => onChange(opt.value),
  }));

  const renderTrigger = () => (
    <PressableScale
      onPress={() => {
        if (!isDisabled && (!useNativeMenu || Platform.OS === 'web')) {
          setShowActionsheet(true);
        }
      }}
      disabled={isDisabled}
      accessibilityLabel={label || placeholder}
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
  );

  return (
    <VStack className="w-full gap-2">
      {label && <Text className="text-phase-text-primary font-medium tracking-wide">{label}</Text>}

      {useNativeMenu && Platform.OS !== 'web' ? (
        <NativeDropdownMenu title={label || placeholder} items={zeegoItems}>
          {renderTrigger()}
        </NativeDropdownMenu>
      ) : (
        renderTrigger()
      )}

      {hasError && (
        <HStack className="items-center gap-1.5 px-1">
          <CircleAlert size={14} className="text-phase-danger" />
          <Text className="text-phase-danger text-xs font-medium">{error}</Text>
        </HStack>
      )}

      {(!useNativeMenu || Platform.OS === 'web') && (
        <Sheet open={showActionsheet} onOpenChange={setShowActionsheet}>
          <SheetContent className="bg-phase-elevated border-t border-phase-surface pb-8">
            <SheetDragIndicatorWrapper>
              <SheetDragIndicator />
            </SheetDragIndicatorWrapper>

            <VStack className="w-full p-2">
              {options.map((option) => (
                <SheetItem
                  key={option.value}
                  onPress={() => {
                    onChange(option.value);
                    handleClose();
                  }}
                  className={`rounded-xl mb-1 ${value === option.value ? 'bg-phase-accent/10 border border-phase-accent/20' : 'active:bg-phase-surface'}`}
                >
                  <SheetItemText
                    className={`text-base ${value === option.value ? 'text-phase-accent font-bold' : 'text-phase-text-primary'}`}
                  >
                    {option.label}
                  </SheetItemText>
                </SheetItem>
              ))}
            </VStack>
          </SheetContent>
        </Sheet>
      )}
    </VStack>
  );
}
