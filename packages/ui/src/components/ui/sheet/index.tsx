import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetIcon,
  ActionsheetItem,
  ActionsheetItemText,
} from '@repo/ui/components/ui/actionsheet';
import type React from 'react';
import type { ViewProps } from 'react-native';

export interface SheetProps extends Omit<ViewProps, 'children'> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function Sheet({ open, onOpenChange, children, ...props }: SheetProps) {
  return (
    <Actionsheet isOpen={open} onClose={() => onOpenChange(false)} {...props}>
      {children}
    </Actionsheet>
  );
}

export const SheetContent = ActionsheetContent;
export const SheetBackdrop = ActionsheetBackdrop;
export const SheetItem = ActionsheetItem;
export const SheetItemText = ActionsheetItemText;
export const SheetIcon = ActionsheetIcon;
export const SheetDragIndicator = ActionsheetDragIndicator;
export const SheetDragIndicatorWrapper = ActionsheetDragIndicatorWrapper;

Sheet.displayName = 'Sheet';
