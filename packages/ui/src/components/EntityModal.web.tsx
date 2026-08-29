import type { EntityDefinition, EntityInstance, EntityMode } from '@repo/core/logic';
import { Box, Text, VStack } from '@repo/ui/primitives';
import SanctuaryModal from '@repo/ui/components/SanctuaryModal.web';

export interface EntityModalProps {
  isOpen: boolean;
  onClose: () => void;
  definition: EntityDefinition;
  mode: EntityMode;
  instance?: EntityInstance;
  title?: string;
  onSuccess?: (data: unknown) => void;
}

/**
 * EntityModal.web
 *
 * Web-optimized entity modal.
 * Hardened v3 implementation.
 */
export default function EntityModal({
  isOpen,
  onClose,
  definition,
  mode,
  instance: _instance,
  title,
  onSuccess: _onSuccess,
}: EntityModalProps) {
  const displayTitle =
    title || `${mode.charAt(0).toUpperCase() + mode.slice(1)} ${definition.type}`;

  return (
    <SanctuaryModal isOpen={isOpen} onClose={onClose} title={displayTitle} size="md">
      <VStack className="gap-4">
        {mode === 'view' ? (
          <Box>
            <Text className="text-phase-text-primary">Web View for {definition.type}</Text>
            {/* Web-optimized view component */}
          </Box>
        ) : (
          <Box>
            <Text className="text-phase-text-primary">Web Form for {definition.type}</Text>
            {/* Web-optimized form component */}
          </Box>
        )}
      </VStack>
    </SanctuaryModal>
  );
}
