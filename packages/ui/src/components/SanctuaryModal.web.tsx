import { X } from '@repo/ui/icons';
import type React from 'react';
import { Dimensions } from 'react-native';
import { Box, HStack, Text, VStack } from '@repo/ui/gluestack';
import { Pressable } from '@repo/ui/primitives';
import { UniversalModal } from '@repo/ui/components/UniversalModal';

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
        className={`bg-phase-elevated border border-phase-surface rounded-generous shadow-2xl overflow-hidden max-w-[95vw] ${sizeClasses[size]} ${className}`}
        style={{
          boxShadow: '0 10px 20px rgba(107, 100, 128, 0.3)',
        }}
      >
        {/* Header */}
        <HStack className="p-6 border-b border-phase-surface items-center justify-between">
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
        <Box className="p-6" style={{ maxHeight: Dimensions.get('window').height * 0.7 }}>
          {children}
        </Box>

        {/* Footer */}
        {footer && (
          <Box className="p-6 bg-phase-interactive/5 border-t border-phase-surface">{footer}</Box>
        )}
      </Box>
    </UniversalModal>
  );
}
