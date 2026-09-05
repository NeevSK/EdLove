import { X } from '@repo/ui/icons';
import {
  HStack,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Pressable,
  Text,
  VStack,
} from '@repo/ui/primitives';
import { cn } from '@repo/ui/utils/classNames';
import type React from 'react';

const Heading = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <Text className={cn('text-xl font-bold', className)}>{children}</Text>
);

export interface SanctuaryModalProps {
  /** Controls visibility */
  isOpen: boolean;
  /** Called when the modal requests to close */
  onClose: () => void;
  /** Modal title - shown in header */
  title: string;
  /** Optional subtitle below the title */
  subtitle?: string;
  /** Optional leading icon element in the header */
  icon?: React.ReactNode;
  /** Modal body content */
  children: React.ReactNode;
  /** Optional footer content (action buttons live here) */
  footer?: React.ReactNode;
  /** Whether to show the top-right close button (default: true) */
  showCloseButton?: boolean;
  /** Gluestack size token */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'full';
  /** Custom class name for modal content */
  className?: string;
  /** Whether to trap accessibility focus within the modal (default: true) */
  trapFocus?: boolean;
}

/**
 * SanctuaryModal
 *
 * A premium, phase-aware modal for mobile.
 * Hardened v3 implementation with NativeWind.
 */
export default function SanctuaryModal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  footer,
  showCloseButton = true,
  className = '',
  trapFocus = true,
}: SanctuaryModalProps) {
  const modalProps = {
    // Accessibility props - pass through to underlying Modal
    ...(trapFocus && {
      accessibilityViewIsModal: true,
      accessibilityElementsHidden: !isOpen,
    }),
    // Native Modal specific props
    supportedOrientations: [
      'portrait',
      'landscape-left',
      'landscape-right',
      'portrait-upside-down',
    ] as const,
    presentationStyle: 'pageSheet' as const,
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} {...modalProps}>
      <ModalContent
        className={`rounded-3xl overflow-hidden shadow-2xl ${className}`}
        style={
          {
            backgroundColor: '#FDFAF3',
            borderWidth: 1,
            borderColor: 'rgba(42, 35, 24, 0.18)',
            boxShadow:
              '0 25px 50px -12px rgba(20, 16, 11, 0.5), 0 0 0 1px rgba(42, 35, 24, 0.12), 0 10px 20px -5px rgba(0, 0, 0, 0.2)',
          } as any
        }
        accessibilityRole="dialog"
        accessibilityLabel={title}
      >
        <ModalHeader
          className="border-b"
          style={{
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(42, 35, 24, 0.10)',
            backgroundColor: '#F7F2E7',
          }}
        >
          <HStack className="items-center flex-1 gap-3">
            {icon && icon}
            <VStack className="flex-1">
              <Heading className="text-phase-text-primary">{title}</Heading>
              {subtitle ? (
                <Text className="text-phase-text-secondary text-xs">{subtitle}</Text>
              ) : null}
            </VStack>
          </HStack>

          {showCloseButton && (
            <Pressable
              onPress={onClose}
              className="p-2 active:opacity-60"
              accessibilityRole="button"
              accessibilityLabel="Close modal"
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <X size={20} className="text-phase-text-primary" />
            </Pressable>
          )}
        </ModalHeader>

        <ModalBody className="p-6" style={{ backgroundColor: '#FDFAF3' }}>
          {children}
        </ModalBody>

        {footer ? (
          <ModalFooter
            className="border-t"
            style={{
              borderTopWidth: 1,
              borderTopColor: 'rgba(42, 35, 24, 0.10)',
              backgroundColor: '#F7F2E7',
            }}
          >
            {footer}
          </ModalFooter>
        ) : null}
      </ModalContent>
    </Modal>
  );
}
