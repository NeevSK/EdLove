import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@repo/ui/components/ui/modal';
import type React from 'react';
import type { ViewProps } from 'react-native';

export interface DialogProps extends Omit<ViewProps, 'children'> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  closeOnBackdropPress?: boolean;
  trapFocus?: boolean;
  accessibilityLabel?: string;
}

export function Dialog({
  open,
  onOpenChange,
  children,
  closeOnBackdropPress,
  trapFocus,
  ...props
}: DialogProps) {
  return (
    <Modal
      isOpen={open}
      onClose={() => onOpenChange(false)}
      closeOnBackdropPress={closeOnBackdropPress}
      trapFocus={trapFocus}
      {...props}
    >
      {children}
    </Modal>
  );
}

export const DialogBackdrop = ModalBackdrop;
export const DialogContent = ModalContent;
export const DialogHeader = ModalHeader;
export const DialogBody = ModalBody;
export const DialogFooter = ModalFooter;
export const DialogClose = ModalCloseButton;

Dialog.displayName = 'Dialog';
