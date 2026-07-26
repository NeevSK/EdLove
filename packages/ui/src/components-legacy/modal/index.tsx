import type React from 'react';
import Animated, { ZoomIn, ZoomOut } from 'react-native-reanimated';
import { View } from '@/primitives';
import { Box } from '@/components-legacy/box';
import { Overlay } from '@/components-legacy/overlay';
import { Portal } from '@/components-legacy/portal';

/**
 * Modal Component
 *
 * Hardened primitive for modal dialogs.
 * Composes Portal and Overlay for a stable UX.
 */
export const Modal = ({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) => {
  if (!isOpen) return null;

  return (
    <Portal>
      <Overlay isOpen={isOpen} onPress={onClose} />
      <View
        className="absolute inset-0 items-center justify-center p-4"
        pointerEvents="box-none"
        style={{ zIndex: 1001 }}
      >
        <Animated.View
          entering={ZoomIn.duration(300).springify()}
          exiting={ZoomOut.duration(200)}
          className="w-full max-w-[500px]"
        >
          <Box className="bg-backgroundLight rounded-2xl overflow-hidden shadow-2xl border border-border">
            {children}
          </Box>
        </Animated.View>
      </View>
    </Portal>
  );
};

export const ModalBackdrop = Overlay;

export const ModalContent = ({ children, className }: any) => (
  <Box className={className}>{children}</Box>
);

export const ModalHeader = ({ children, className }: any) => (
  <Box
    className={`px-5 py-4 flex-row items-center justify-between border-b border-border ${className || ''}`}
  >
    {children}
  </Box>
);

export const ModalBody = ({ children, className }: any) => (
  <Box className={`px-5 py-4 ${className || ''}`}>{children}</Box>
);

export const ModalFooter = ({ children, className }: any) => (
  <Box className={`px-5 py-4 border-t border-border flex-row justify-end gap-3 ${className || ''}`}>
    {children}
  </Box>
);

export const ModalCloseButton = ({ children, ...props }: any) => <Box {...props}>{children}</Box>;
