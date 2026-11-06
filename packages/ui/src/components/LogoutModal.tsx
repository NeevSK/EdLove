import { Button } from '@repo/ui/components/native';
import SanctuaryModal from '@repo/ui/components/SanctuaryModal';
import { LogOut } from '@repo/ui/icons';
import { Box, HStack, Text, VStack } from '@repo/ui/primitives';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  isLoading?: boolean;
}

/**
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
        <Button
          label="Stay"
          variant="quiet"
          onPress={onClose}
          disabled={isLoading}
          accessibilityLabel="Stay signed in"
          accessibilityHint="Closes this confirmation without signing out"
        />
      </Box>
      <Box className="flex-[1.5]">
        <Button
          label={isLoading ? 'Signing out...' : 'Sign Out'}
          variant="primary"
          onPress={onLogout}
          loading={isLoading}
          accessibilityLabel="Sign out"
          accessibilityHint="Signs out of this device"
        />
      </Box>
    </HStack>
  );

  return (
    <SanctuaryModal isOpen={isOpen} onClose={onClose} title="Sign Out" footer={footer}>
      <VStack className="items-center py-4 gap-4">
        <Box className="w-12 h-12 rounded-full bg-sanctuarySaffron/10 items-center justify-center">
          <LogOut size={24} className="text-sanctuarySaffron" />
        </Box>
        <Text className="text-center text-sacredWhite/80 text-sm leading-relaxed px-2">
          Are you sure you wish to sign out of this device? Unsynced changes will remain safely
          stored locally until you sign back in.
        </Text>
      </VStack>
    </SanctuaryModal>
  );
}
