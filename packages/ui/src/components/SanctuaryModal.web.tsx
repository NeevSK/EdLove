import { UniversalModal } from '@repo/ui/components/UniversalModal';
import { X } from '@repo/ui/icons';
import { Box, HStack, Pressable, ScrollView, Text, VStack } from '@repo/ui/primitives';
import type React from 'react';
import { Dimensions } from 'react-native';

export interface SanctuaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  showCloseButton?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'full';
  className?: string;
}

/**
 * SanctuaryModal.web - Optimized overlay for Desktop/Web.
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
  size = 'md',
  className = '',
}: SanctuaryModalProps) {
  // Responsive width classes
  const sizeClasses = {
    xs: 'w-[400px]',
    sm: 'w-[500px]',
    md: 'w-[650px]',
    lg: 'w-[800px]',
    full: 'w-[90%]',
  };

  return (
    <UniversalModal isOpen={isOpen} onClose={onClose}>
      <Box
        className={`rounded-2xl overflow-hidden max-w-[95vw] ${sizeClasses[size]} ${className}`}
        style={{
          backgroundColor: '#FDFAF3',
          borderWidth: 1,
          borderColor: 'rgba(42, 35, 24, 0.18)',
          boxShadow:
            '0 25px 50px -12px rgba(20, 16, 11, 0.5), 0 0 0 1px rgba(42, 35, 24, 0.12), 0 10px 20px -5px rgba(0, 0, 0, 0.2)',
        }}
      >
        {/* Header */}
        <HStack
          className="p-6 items-center justify-between"
          style={{
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(42, 35, 24, 0.10)',
            backgroundColor: '#F7F2E7',
          }}
        >
          <HStack className="gap-3 items-center flex-1">
            {icon && icon}
            <VStack className="flex-1">
              <Text className="text-xl font-bold text-phase-text-primary">{title}</Text>
              {subtitle && <Text className="text-xs text-phase-text-secondary">{subtitle}</Text>}
            </VStack>
          </HStack>

          {showCloseButton && (
            <Pressable
              accessibilityRole="button"
              onPress={onClose}
              className="p-2 bg-phase-interactive/10 border border-phase-interactive/20 rounded-xl active:opacity-60"
            >
              <X size={20} className="text-phase-text-primary" />
            </Pressable>
          )}
        </HStack>

        {/* Body */}
        <ScrollView
          className="p-6"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
          style={{
            backgroundColor: '#FDFAF3',
            maxHeight: Dimensions.get('window').height * 0.7,
          }}
        >
          {children}
        </ScrollView>

        {/* Footer */}
        {footer && (
          <Box
            className="p-6"
            style={{
              backgroundColor: '#F7F2E7',
              borderTopWidth: 1,
              borderTopColor: 'rgba(42, 35, 24, 0.10)',
            }}
          >
            {footer}
          </Box>
        )}
      </Box>
    </UniversalModal>
  );
}
