import { Text } from '@repo/ui/components/ui/text';
import { TextInput } from '@repo/ui/components/ui/text-input';
import { View } from '@repo/ui/components/ui/view';
import { cn } from '@repo/ui/utils/classNames';
import React, { createContext, useContext, useMemo, useState } from 'react';
import type { PressableProps, TextInputProps, ViewProps } from 'react-native';
import { Pressable } from '@repo/ui/components/ui/pressable';

interface CommandContextValue {
  query: string;
  setQuery: (query: string) => void;
  onSelect?: (value: string) => void;
}

const CommandContext = createContext<CommandContextValue | undefined>(undefined);

function useCommand() {
  const context = useContext(CommandContext);
  if (!context) throw new Error('Command components must be used within Command');
  return context;
}

export interface CommandProps extends Omit<ViewProps, 'children'> {
  children: React.ReactNode;
  onSelect?: (value: string) => void;
}

export function Command({ children, onSelect, ...props }: CommandProps) {
  const [query, setQuery] = useState('');
  const contextValue = useMemo(() => ({ query, setQuery, onSelect }), [query, onSelect]);
  return (
    <CommandContext.Provider value={contextValue}>
      <View {...props}>{children}</View>
    </CommandContext.Provider>
  );
}

export function CommandInput({
  className,
  value,
  onChangeText,
  ...props
}: TextInputProps & { className?: string }) {
  const command = useCommand();
  return (
    <TextInput
      {...props}
      value={value ?? command.query}
      onChangeText={(nextValue) => {
        command.setQuery(nextValue);
        onChangeText?.(nextValue);
      }}
      accessibilityLabel={props.accessibilityLabel ?? props.placeholder ?? 'Search commands'}
      className={cn(
        'h-12 border-b border-phase-interactive/20 px-3 text-phase-text-primary',
        className,
      )}
    />
  );
}

export function CommandList({ className, children, ...props }: ViewProps & { className?: string }) {
  return (
    <View {...props} className={cn('p-1', className)}>
      {children}
    </View>
  );
}

export function CommandGroup({
  heading,
  className,
  children,
  ...props
}: ViewProps & { heading?: string; className?: string }) {
  return (
    <View {...props} className={cn('gap-1', className)}>
      {heading ? (
        <Text className="px-2 py-1 text-xs font-semibold uppercase text-phase-text-secondary">
          {heading}
        </Text>
      ) : null}
      {children}
    </View>
  );
}

export interface CommandItemProps extends PressableProps {
  value: string;
  keywords?: string[];
  className?: string;
  children: React.ReactNode;
}

export function CommandItem({
  value,
  keywords = [],
  className,
  children,
  onPress,
  ...props
}: CommandItemProps) {
  const command = useCommand();
  const haystack = [value, ...keywords].join(' ').toLowerCase();
  if (command.query.trim() && !haystack.includes(command.query.trim().toLowerCase())) return null;

  return (
    <Pressable
      {...props}
      onPress={(event) => {
        command.onSelect?.(value);
        onPress?.(event);
      }}
      accessibilityRole="menuitem"
      accessibilityLabel={value}
      className={cn(
        'min-h-11 justify-center rounded-lg px-3 active:bg-phase-interactive/10',
        className,
      )}
    >
      {children}
    </Pressable>
  );
}

export function CommandEmpty({
  className,
  children = 'No results found.',
  ...props
}: ViewProps & { className?: string; children?: React.ReactNode }) {
  return (
    <View {...props} className={cn('items-center p-6', className)}>
      <Text className="text-sm text-phase-text-secondary">{children}</Text>
    </View>
  );
}

Command.displayName = 'Command';
CommandInput.displayName = 'CommandInput';
CommandList.displayName = 'CommandList';
CommandGroup.displayName = 'CommandGroup';
CommandItem.displayName = 'CommandItem';
CommandEmpty.displayName = 'CommandEmpty';
