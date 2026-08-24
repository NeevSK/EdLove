import type React from 'react';
import { Modal, Platform } from 'react-native';

type SupportedOrientation =
  | 'portrait'
  | 'landscape-left'
  | 'landscape-right'
  | 'portrait-upside-down'
  | 'landscape';

export interface UniversalModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  transparent?: boolean;
  /** Whether to show a backdrop that closes on press */
  hasBackdrop?: boolean;
  /** Whether to trap accessibility focus within the modal (default: true) */
  trapFocus?: boolean;
}

/**
 * UniversalModal (Native)
 * Uses standard portaled Modals for mobile.
 */
export const UniversalModal = ({
  isOpen,
  onClose,
  children,
  transparent = true,
  trapFocus = true,
}: UniversalModalProps) => {
  const supportedOrientations: SupportedOrientation[] | undefined = Platform.select({
    ios: ['portrait', 'landscape-left', 'landscape-right', 'portrait-upside-down'],
    android: ['portrait', 'landscape'],
    web: undefined,
  });

  return (
    <Modal
      visible={isOpen}
      transparent={transparent}
      onRequestClose={onClose}
      animationType="fade"
      statusBarTranslucent
      accessibilityViewIsModal={trapFocus}
      accessibilityElementsHidden={!isOpen}
      supportedOrientations={supportedOrientations}
      presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : undefined}
    >
      {children}
    </Modal>
  );
};
