import { Pressable } from '@repo/ui/components/ui/pressable';
import { Text } from '@repo/ui/components/ui/text';
import { View } from '@repo/ui/components/ui/view';
import { cn } from '@repo/ui/utils/classNames';
import React, { createContext, useContext } from 'react';
import type { PressableProps, TextProps, ViewProps } from 'react-native';

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

function useTabs() {
  const context = useContext(TabsContext);
  if (!context) throw new Error('Tabs components must be used within Tabs');
  return context;
}

export interface TabsProps extends Omit<ViewProps, 'children'> {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}

export function Tabs({ value, onValueChange, children, ...props }: TabsProps) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <View {...props}>{children}</View>
    </TabsContext.Provider>
  );
}

export function TabsList({ className, children, ...props }: ViewProps & { className?: string }) {
  return (
    <View {...props} className={cn('flex-row items-center gap-1', className)}>
      {children}
    </View>
  );
}

export interface TabsTriggerProps extends PressableProps {
  value: string;
  className?: string;
  textClassName?: string;
  children: React.ReactNode;
}

export function TabsTrigger({
  value,
  className,
  textClassName,
  children,
  onPress,
  ...props
}: TabsTriggerProps) {
  const tabs = useTabs();
  const selected = tabs.value === value;

  return (
    <Pressable
      {...props}
      onPress={(event) => {
        tabs.onValueChange(value);
        onPress?.(event);
      }}
      accessibilityRole="tab"
      accessibilityState={{ selected, disabled: props.disabled ?? undefined }}
      className={cn(
        'min-h-10 justify-center rounded-lg px-3 active:opacity-70',
        selected ? 'bg-phase-surface' : undefined,
        className,
      )}
    >
      {typeof children === 'string' ? (
        <Text
          className={cn(
            'text-sm font-semibold',
            selected ? 'text-phase-text-primary' : 'text-phase-text-secondary',
            textClassName,
          )}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

export interface TabsContentProps extends ViewProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

export function TabsContent({ value, className, children, ...props }: TabsContentProps) {
  const tabs = useTabs();
  if (tabs.value !== value) return null;
  return (
    <View {...props} className={cn('mt-3', className)}>
      {children}
    </View>
  );
}

export function TabsIndicator({ className, ...props }: ViewProps & { className?: string }) {
  return <View {...props} className={cn('h-0.5 bg-phase-accent', className)} />;
}

Tabs.displayName = 'Tabs';
TabsList.displayName = 'TabsList';
TabsTrigger.displayName = 'TabsTrigger';
TabsContent.displayName = 'TabsContent';
TabsIndicator.displayName = 'TabsIndicator';
