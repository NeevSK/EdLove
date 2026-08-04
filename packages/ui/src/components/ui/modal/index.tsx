import { cssInterop } from 'react-native-css-interop';
import type React from 'react';
import { createContext, useContext, useMemo } from 'react';
import { Platform, View, type ViewProps } from 'react-native';
import Animated, { ZoomIn, ZoomOut } from 'react-native-reanimated';
import { Box } from '@repo/ui/components/ui/box';
import { Overlay } from '@repo/ui/components/ui/overlay';
import { Portal } from '@repo/ui/components/ui/portal';

cssInterop(View, { className: 'style' });

/**
 * Modal Component
 *
 * A high-impact, hardened dialog primitive.
 * Enforces architectural boundaries and design system consistency.
 */

interface ModalContextType {
  onClose: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

function useModal() {
  const context = useContext(ModalContext);
  if (!context) throw new Error('useModal must be used within a Modal');
  return context;
}

export const Modal = ({
  isOpen,
  onClose,
  children,
  ...props
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
} & ViewProps) => {
  const contextValue = useMemo(() => ({ onClose }), [onClose]);
  const enteringAnimation =
    Platform.OS === 'web' ? undefined : ZoomIn.duration(300).springify().damping(20);
  const exitingAnimation = Platform.OS === 'web' ? undefined : ZoomOut.duration(200);

  if (!isOpen) return null;

  return (
    <ModalContext.Provider value={contextValue}>
      <Portal>
        <Overlay isOpen={isOpen} onPress={onClose} />
        <View
          className="absolute inset-0 items-center justify-center p-4"
          pointerEvents="box-none"
          style={{ zIndex: 1001 }}
          {...props}
        >
          <Animated.View
            entering={enteringAnimation}
            exiting={exitingAnimation}
            className="w-full max-w-[500px]"
            accessibilityRole="alert"
            accessibilityViewIsModal={true}
            accessible={true}
          >
            <Box className="bg-phase-elevated rounded-3xl overflow-hidden shadow-2xl border border-phase-interactive/10">
              {children}
            </Box>
          </Animated.View>
        </View>
      </Portal>
    </ModalContext.Provider>
  );
};

export const ModalBackdrop = Overlay;

export const ModalContent = ({ children, className }: any) => (
  <Box className={className}>{children}</Box>
);

export const ModalHeader = ({ children, className }: any) => (
  <Box
    className={`px-6 py-5 flex-row items-center justify-between border-b border-phase-interactive/5 ${className || ''}`}
  >
    {children}
  </Box>
);

export const ModalBody = ({ children, className }: any) => (
  <Box className={`px-6 py-5 ${className || ''}`}>{children}</Box>
);

export const ModalFooter = ({ children, className }: any) => (
  <Box
    className={`px-6 py-5 border-t border-phase-interactive/5 flex-row justify-end gap-4 ${className || ''}`}
  >
    {children}
  </Box>
);

export const ModalCloseButton = ({ children, onPress, ...props }: any) => {
  const { onClose } = useModal();
  return (
    <Box
      {...props}
      onPress={() => {
        onClose();
        onPress?.();
      }}
    >
      {children}
    </Box>
  );
};

Modal.displayName = 'Modal';
ModalHeader.displayName = 'ModalHeader';
ModalFooter.displayName = 'ModalFooter';

export { Modal as default };

