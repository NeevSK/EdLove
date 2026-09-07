import { SanctuaryButton } from '@repo/ui/components/SanctuaryButton';
import SanctuaryModal from '@repo/ui/components/SanctuaryModal';
import { TriangleAlert } from '@repo/ui/icons';
import { Box, HStack, Text, VStack } from '@repo/ui/primitives';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  isLoading: boolean;
}

/**
 * A destructive confirmation modal for account deletion.
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
        <SanctuaryButton
          action="secondary"
          onPress={onClose}
          isDisabled={isLoading}
          accessibilityHint="Return without submitting an account deletion request"
        >
          Cancel
        </SanctuaryButton>
      </Box>
      <Box className="flex-[1.5]">
        <SanctuaryButton
          action="negative"
          onPress={onDelete}
          isLoading={isLoading}
          accessibilityLabel={isLoading ? 'Submitting account deletion request' : 'Request account deletion'}
          accessibilityHint="Submits a protected request that may permanently remove your account"
        >
          {isLoading ? 'Submitting...' : 'Request account deletion'}
        </SanctuaryButton>
      </Box>
    </HStack>
  );

  return (
    <SanctuaryModal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Account"
      icon={<TriangleAlert color="#FF6347" size={22} />}
      footer={footer}
      size="md"
    >
      <VStack className="py-2 gap-4">
        <Text className="text-phase-text-secondary text-base">
          This sends a protected request to delete your account. Your account will not be deleted
          immediately; we will verify the request and apply the published retention policy.
        </Text>
        {/* Data scope clarification */}
        <Box className="bg-phase-surface p-4 rounded-xl border border-phase-surface">
          <Text className="text-phase-text-secondary text-sm">
            Some school, safeguarding, financial, or audit records may be retained when required by
            law or institutional policy. See the deletion policy for details.
          </Text>
        </Box>
        <Box className="bg-phase-danger/10 p-4 rounded-xl border border-phase-danger/20">
          <Text className="text-phase-danger font-bold text-sm">
            Need a break? You can sign out instead—your sanctuary will be waiting for you.
          </Text>
        </Box>
      </VStack>
    </SanctuaryModal>
  );
}
