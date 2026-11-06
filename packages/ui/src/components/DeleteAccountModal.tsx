import { Button } from '@repo/ui/components/native';
import SanctuaryModal from '@repo/ui/components/SanctuaryModal';
import { TriangleAlert } from '@repo/ui/icons';
import { Box, HStack, Text, VStack } from '@repo/ui/primitives';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  isLoading?: boolean;
}

/**
 * Hardened v3 implementation.
 */
export default function DeleteAccountModal({
  isOpen,
  onClose,
  onDelete,
  isLoading,
}: DeleteAccountModalProps) {
  const footer = (
    <HStack className="w-full gap-3">
      <Box className="flex-1">
        <Button
          label="Cancel"
          variant="secondary"
          onPress={onClose}
          disabled={isLoading}
          accessibilityHint="Return without submitting an account deletion request"
        />
      </Box>
      <Box className="flex-[1.5]">
        <Button
          label={isLoading ? 'Submitting...' : 'Request account deletion'}
          variant="danger"
          onPress={onDelete}
          loading={isLoading}
          accessibilityLabel={
            isLoading ? 'Submitting account deletion request' : 'Request account deletion'
          }
          accessibilityHint="Submits a protected request that may permanently remove your account"
        />
      </Box>
    </HStack>
  );

  return (
    <SanctuaryModal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Account"
      footer={footer}
    >
      <VStack className="items-center py-4 gap-4">
        <Box className="w-12 h-12 rounded-full bg-emberRed/10 items-center justify-center">
          <TriangleAlert size={24} className="text-emberRed" />
        </Box>
        <Text className="text-center text-sacredWhite/80 text-sm leading-relaxed px-2">
          Are you sure you wish to initiate the account deletion process? This protected operation
          will submit a request to the server, and full access will be revoked once the request is
          processed.
        </Text>
      </VStack>
    </SanctuaryModal>
  );
}
