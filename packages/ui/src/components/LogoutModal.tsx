import React from 'react';
import { Text, VStack, HStack, Box } from '../gluestack';
import SanctuaryButton from './SanctuaryButton';
import SanctuaryModal from './SanctuaryModal';
import { LogOut } from 'lucide-react-native';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  isLoading?: boolean;
}

/**
 * LogoutModal - sanctuary-themed logout confirmation.
 * Hardened v3 implementation.
 */
export default function LogoutModal({
  isOpen,
  onClose,
  onLogout,
  isLoading = false,
}: LogoutModalProps) {
  const footer = (
    <HStack className="w-full gap-3">
      <Box className="flex-1">
        <SanctuaryButton
          variant="ghost"
          action="secondary"
          onPress={onClose}
          isDisabled={isLoading}
        >
          Stay
        </SanctuaryButton>
      </Box>
      <Box className="flex-[1.5]">
        <SanctuaryButton action="primary" onPress={onLogout} isLoading={isLoading}>
          {isLoading ? 'Signing out...' : 'Sign Out'}
        </SanctuaryButton>
      </Box>
    </HStack>
  );

  return (
    <SanctuaryModal
      isOpen={isOpen}
      onClose={onClose}
      title="Sign Out"
      icon={<LogOut className="text-phase-accent" size={20} />}
      footer={footer}
      size="md"
    >
      <VStack className="py-2 gap-4">
        <Text className="text-phase-text-secondary text-base">
          Are you sure you want to sign out? You'll need to log in again to access your garden.
        </Text>
        <Box className="bg-phase-accent/10 p-4 rounded-xl border border-phase-accent/20">
          <Text className="text-phase-text-secondary text-sm">
            Your streak, achievements, and connections will be here when you come back.
          </Text>
        </Box>
      </VStack>
    </SanctuaryModal>
  );
}
