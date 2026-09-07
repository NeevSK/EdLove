import { Box } from '@repo/ui/components/ui/box';
import { Overlay } from '@repo/ui/components/ui/overlay';
import { Portal } from '@repo/ui/components/ui/portal';
import { Pressable } from '@repo/ui/components/ui/pressable';
import { AnimatedView, View } from '@repo/ui/components/ui/view';
import { cn } from '@repo/ui/utils/classNames';
import type React from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  Platform,
  type AccessibilityRole,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from 'react-native';
import { ZoomIn, ZoomOut } from 'react-native-reanimated';

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
  accessibilityLabel,
  closeOnBackdropPress = true,
  trapFocus = true,
  ...props
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  accessibilityLabel?: string;
  closeOnBackdropPress?: boolean;
  trapFocus?: boolean;
} & ViewProps) => {
  const contextValue = useMemo(() => ({ onClose }), [onClose]);
  const [isPresent, setIsPresent] = useState(isOpen);
  const enteringAnimation =
    Platform.OS === 'web' ? undefined : ZoomIn.duration(300).springify().damping(20);
  const exitingAnimation = Platform.OS === 'web' ? undefined : ZoomOut.duration(200);

  useEffect(() => {
    if (isOpen) {
      setIsPresent(true);
      return;
    }

    const timeout = setTimeout(() => setIsPresent(false), 220);
    return () => clearTimeout(timeout);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || Platform.OS !== 'web') return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isPresent) return null;

  return (
    <ModalContext.Provider value={contextValue}>
      <Portal>
        <Overlay isOpen={isOpen} onPress={closeOnBackdropPress ? onClose : undefined} />
        {Platform.OS === 'web' ? (
          <View
            role="dialog"
            aria-modal={true}
            accessibilityLabel={accessibilityLabel}
            style={{
              position: 'fixed' as any,
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1001,
              alignItems: 'center',
              justifyContent: 'center',
              padding: 16,
              pointerEvents: 'box-none',
            }}
          >
            <View
              style={{
                width: '100%',
                maxWidth: 500,
                pointerEvents: 'auto',
              }}
            >
              {children}
            </View>
          </View>
        ) : (
          <View
            className="absolute inset-0 items-center justify-center p-4"
            style={{ zIndex: 1001, pointerEvents: 'box-none' }}
            {...props}
          >
            {isOpen ? (
              <AnimatedView
                entering={enteringAnimation}
                exiting={exitingAnimation}
                className="w-full max-w-[500px]"
                accessibilityRole="dialog"
                accessibilityLabel={accessibilityLabel}
                accessibilityViewIsModal={trapFocus}
                accessible={true}
              >
                {children}
              </AnimatedView>
            ) : null}
          </View>
        )}
      </Portal>
    </ModalContext.Provider>
  );
};

export const ModalBackdrop = Overlay;

export interface ModalSectionProps {
  children?: React.ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
  accessibilityRole?: AccessibilityRole;
  accessibilityLabel?: string;
}

export const ModalContent = ({
  children,
  className,
  style,
  accessibilityRole,
  accessibilityLabel,
}: ModalSectionProps) => {
  const contentStyle = [
    Platform.OS === 'web' &&
      ({
        backdropFilter: 'blur(24px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
        animation: 'sanctuary-modal-in 280ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
      } as any),
    style,
  ];

  return (
    <Box
      className={cn(
        'bg-phase-modal-card rounded-3xl overflow-hidden shadow-2xl border border-phase-modal-border',
        className,
      )}
      style={contentStyle}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
    >
      {children}
    </Box>
  );
};

export const ModalHeader = ({ children, className }: ModalSectionProps) => (
  <Box
    className={cn(
      'px-6 py-5 flex-row items-center justify-between border-b border-phase-interactive/5',
      className,
    )}
  >
    {children}
  </Box>
);

export const ModalBody = ({ children, className }: ModalSectionProps) => (
  <Box className={cn('px-6 py-5', className)}>{children}</Box>
);

export const ModalFooter = ({ children, className }: ModalSectionProps) => (
  <Box
    className={cn(
      'px-6 py-5 border-t border-phase-interactive/5 flex-row justify-end gap-4',
      className,
    )}
  >
    {children}
  </Box>
);

export interface ModalCloseButtonProps extends Omit<React.ComponentProps<typeof Pressable>, 'onPress'> {
  children?: React.ReactNode;
  onPress?: () => void;
}

export const ModalCloseButton = ({ children, onPress, ...props }: ModalCloseButtonProps) => {
  const { onClose } = useModal();
  return (
    <Pressable
      {...props}
      accessibilityRole="button"
      accessibilityLabel={props.accessibilityLabel ?? 'Close'}
      onPress={() => {
        onClose();
        onPress?.();
      }}
    >
      {children}
    </Pressable>
  );
};

Modal.displayName = 'Modal';
ModalHeader.displayName = 'ModalHeader';
ModalFooter.displayName = 'ModalFooter';

export { Modal as default };
