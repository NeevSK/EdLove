import { Select, SelectBackdrop, SelectContent, SelectDragIndicator, SelectDragIndicatorWrapper, SelectIcon, SelectInput, SelectItem, SelectPortal, SelectTrigger, Text } from '@repo/ui/primitives';
import { View } from '@repo/ui/primitives';

import { ChevronDown } from 'lucide-react-native';

interface FormSelectProps {
  label: string;
  value: string;
  placeholder?: string;
  options: { label: string; value: string }[];
  onChange: (val: string) => void;
  error?: string;
}

export const FormSelect = ({
  label,
  value,
  placeholder = 'Select an option',
  options,
  onChange,
  error,
}: FormSelectProps) => {
  // Find label for the current value to display in trigger
  const initialLabel = options.find((opt) => opt.value === value)?.label || '';

  return (
    <View className="mb-4">
      <Text className="text-phaseText-primary font-semibold text-base mb-2">{label}</Text>

      <Select selectedValue={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectInput placeholder={placeholder} value={initialLabel} />
          <SelectIcon as={ChevronDown} />
        </SelectTrigger>

        <SelectPortal>
          <SelectBackdrop />
          <SelectContent>
            <SelectDragIndicatorWrapper>
              <SelectDragIndicator />
            </SelectDragIndicatorWrapper>
            {options.map((option) => (
              <SelectItem key={option.value} label={option.label} value={option.value} />
            ))}
          </SelectContent>
        </SelectPortal>
      </Select>

      {error && <Text className="text-phase-error text-xs mt-1">{error}</Text>}
    </View>
  );
};
