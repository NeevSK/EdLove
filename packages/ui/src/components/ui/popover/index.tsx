import { Pressable } from '@repo/ui/components/ui/pressable';
import { View } from '@repo/ui/components/ui/view';
import { cn } from '@repo/ui/utils/classNames';
import React, { createContext, useContext } from 'react';
import type { PressableProps, ViewProps } from 'react-native';

interface PopoverContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PopoverContext = createContext<PopoverContextValue | undefined>(undefined);

function usePopover() {
  const context = useContext(PopoverContext);
  if (!context) throw new Error('Popover components must be used within Popover');
  return context;
}

export interface PopoverProps extends Omit<ViewProps, 'children'> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function Popover({ open, onOpenChange, children, className, ...props }: PopoverProps) {
  return (
    <PopoverContext.Provider value={{ open, onOpenChange }}>
      <View {...props} className={cn('relative', className)}>
        {children}
      </View>
    </PopoverContext.Provider>
  );
}

export function PopoverTrigger({ onPress, ...props }: PressableProps) {
  const { open, onOpenChange } = usePopover();
  return (
    <Pressable
      {...props}
      onPress={(event) => {
        onOpenChange(!open);
        onPress?.(event);
      }}
      accessibilityRole="button"
      accessibilityState={{ expanded: open }}
    />
  );
}

export interface PopoverContentProps extends ViewProps {
  side?: 'top' | 'bottom';
  align?: 'start' | 'center' | 'end';
  children: React.ReactNode;
}

export function PopoverContent({
  side = 'bottom',
  align = 'start',
  className,
  children,
  ...props
}: PopoverContentProps) {
  const { open } = usePopover();
  if (!open) return null;
  return (
    <View
      {...props}
      accessibilityRole="menu"
      className={cn(
        'absolute z-50 min-w-48 rounded-xl border border-phase-interactive/20 bg-phase-surface p-2 shadow-xl',
        side === 'bottom' ? 'top-full mt-2' : 'bottom-full mb-2',
        align === 'start' ? 'left-0' : align === 'end' ? 'right-0' : 'left-1/2 -translate-x-1/2',
        className,
      )}
    >
      {children}
    </View>
  );
}

export function PopoverClose({ onPress, ...props }: PressableProps) {
  const { onOpenChange } = usePopover();
  return (
    <Pressable
      {...props}
      onPress={(event) => {
        onOpenChange(false);
        onPress?.(event);
      }}
      accessibilityRole="button"
    />
  );
}

Popover.displayName = 'Popover';
PopoverTrigger.displayName = 'PopoverTrigger';
PopoverContent.displayName = 'PopoverContent';
PopoverClose.displayName = 'PopoverClose';
