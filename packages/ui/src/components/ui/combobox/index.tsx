import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '@repo/ui/components/ui/command';
import {
  Select,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectInput,
  SelectPortal,
  SelectTrigger,
  useSelect,
} from '@repo/ui/components/ui/select';
import { Text } from '@repo/ui/components/ui/text';
import React from 'react';
import type { ViewProps } from 'react-native';

export interface ComboboxOption {
  label: string;
  value: string;
  keywords?: string[];
}

export interface ComboboxProps extends Omit<ViewProps, 'children'> {
  value?: string;
  onValueChange: (value: string) => void;
  options: ComboboxOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  isDisabled?: boolean;
}

function ComboboxOptionItem({ option }: { option: ComboboxOption }) {
  const { setIsOpen } = useSelect();
  return (
    <CommandItem
      value={option.value}
      keywords={[option.label, ...(option.keywords ?? [])]}
      onPress={() => setIsOpen(false)}
    >
      <Text className="text-phase-text-primary text-base font-medium">{option.label}</Text>
    </CommandItem>
  );
}

export function Combobox({
  value = '',
  onValueChange,
  options,
  placeholder = 'Select an option',
  searchPlaceholder = 'Search options',
  emptyMessage = 'No options found.',
  isDisabled = false,
  ...props
}: ComboboxProps) {
  return (
    <Select selectedValue={value} onValueChange={onValueChange} isDisabled={isDisabled} {...props}>
      <SelectTrigger>
        <SelectInput
          placeholder={placeholder}
          value={options.find((option) => option.value === value)?.label}
        />
      </SelectTrigger>
      <SelectPortal>
        <SelectContent>
          <SelectDragIndicatorWrapper>
            <SelectDragIndicator />
          </SelectDragIndicatorWrapper>
          <Command onSelect={onValueChange}>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              {options.map((option) => (
                <ComboboxOptionItem key={option.value} option={option} />
              ))}
              <CommandEmpty>{emptyMessage}</CommandEmpty>
            </CommandList>
          </Command>
        </SelectContent>
      </SelectPortal>
    </Select>
  );
}

Combobox.displayName = 'Combobox';
