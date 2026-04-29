import { useNavigation } from '@react-navigation/native';
import type { EntityDefinition } from '@repo/core/logic';
import { QRBuilder, QRCodeGenerator } from '@repo/scanner-kit';
import { EntityModal, SanctuaryButton, SanctuaryModal } from '@repo/ui/components';
import { CheckCircle } from '@repo/ui/icons';
import { Box, Heading, Icon, Text, VStack } from '@repo/ui/primitives';
import { hapticSuccess } from '@repo/ui/utils';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (groupId: string) => void;
  onSuccess?: (group: any) => void;
  mode?: 'create' | 'edit';
  initialData?: any;
}

export default function CreateGroupModal({
  isOpen,
  onClose,
  onCreated,
  onSuccess,
  mode = 'create',
  initialData,
}: CreateGroupModalProps) {
  useTranslation();
  const navigation = useNavigation<any>();
  const [createdGroupId, setCreatedGroupId] = useState<string | null>(null);

  const groupDefinition: EntityDefinition = {
    type: 'group',
    id: initialData?.id,
  };

  const handleSuccess = React.useCallback(
    (group: any) => {
      hapticSuccess();
      setCreatedGroupId(group.id);
      onCreated?.(group.id);
      onSuccess?.(group);
    },
    [onCreated, onSuccess],
  );

  const handleEnterCircle = React.useCallback(() => {
    if (createdGroupId) {
      onClose();
      navigation.navigate('GroupDetails', { groupId: createdGroupId });
    }
  }, [createdGroupId, navigation, onClose]);

  if (createdGroupId) {
    const groupQRValue = QRBuilder.group(createdGroupId);
    return (
      <SanctuaryModal isOpen={isOpen} onClose={onClose} title="Circle Founded">
        <VStack className="gap-8 items-center py-8">
          <Box className="w-24 h-24 rounded-full bg-phase-interactive/10 items-center justify-center border border-phase-interactive/20">
            <Icon as={CheckCircle} className="text-phase-interactive" size="xl" />
          </Box>

          <VStack className="gap-2 items-center px-4">
            <Heading className="text-center text-ink text-2xl font-black">
              Resonance Established
            </Heading>
            <Text className="text-center text-ink/60 text-sm leading-relaxed px-5">
              Your new circle is ready to welcome its members. Share this portal to begin the
              resonance.
            </Text>
          </VStack>

          <Box className="p-6 bg-white rounded-3xl shadow-lg border border-border">
            <QRCodeGenerator value={groupQRValue} size={180} color="#000" />
          </Box>

          <SanctuaryButton
            action="primary"
            className="w-full h-14 rounded-2xl"
            onPress={handleEnterCircle}
          >
            <Text className="text-white font-bold text-lg">Enter Circle Space</Text>
          </SanctuaryButton>
        </VStack>
      </SanctuaryModal>
    );
  }

  return (
    <EntityModal
      isOpen={isOpen}
      onClose={onClose}
      definition={groupDefinition}
      mode={mode as any}
      instance={initialData}
      onSuccess={handleSuccess}
    />
  );
}
