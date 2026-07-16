import { TriangleAlert } from '@repo/ui/icons';
import { Box, HStack, Text, VStack } from '../gluestack';
import { SanctuaryButton } from './SanctuaryButton';
import SanctuaryModal from './SanctuaryModal';

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
        <SanctuaryButton action="secondary" onPress={onClose} isDisabled={isLoading}>
          Cancel
        </SanctuaryButton>
      </Box>
      <Box className="flex-[1.5]">
        <SanctuaryButton action="negative" onPress={onDelete} isLoading={isLoading}>
          {isLoading ? 'Processing...' : 'Delete Permanently'}
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
          This action is <Text className="font-bold text-phase-text-primary">irreversible</Text>.
          Your personal profile, settings, and private data will be permanently removed from the
          Gurudevi sanctuary.
        </Text>
        {/* Data scope clarification */}
        <Box className="bg-phase-surface p-4 rounded-xl border border-phase-surface">
          <Text className="text-phase-text-secondary text-sm">
            School records (attendance, grades, community posts) are retained for institutional
            integrity and cannot be removed by individuals.
          </Text>
        </Box>
        <Box className="bg-phase-danger/10 p-4 rounded-xl border border-phase-danger/20">
          <Text className="text-phase-danger font-bold text-sm">
            Just need a break? You can sign out instead - your sanctuary will be waiting for you.
          </Text>
        </Box>
      </VStack>
    </SanctuaryModal>
  );
}
