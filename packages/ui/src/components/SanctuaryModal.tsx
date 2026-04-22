import React from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Text,
  HStack,
  VStack,
} from '../gluestack';
import { X } from 'lucide-react-native';
import { Pressable } from 'react-native';

const Heading = ({ children, className }: any) => (
  <Text className={`text-xl font-bold ${className || ''}`}>{children}</Text>
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
}: SanctuaryModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent className={`bg-phase-elevated border-phase-surface shadow-2xl ${className}`}>
        <ModalHeader className="border-b-0">
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
            >
              <X size={20} className="text-phase-text-primary" />
            </Pressable>
          )}
        </ModalHeader>

        <ModalBody className="py-2">{children}</ModalBody>

        {footer ? <ModalFooter className="border-t-0">{footer}</ModalFooter> : null}
      </ModalContent>
    </Modal>
  );
}
