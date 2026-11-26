import { View, Text } from 'react-native';
import type { EntityDefinition } from '@repo/core/logic';
import { QRBuilder, QRCodeGenerator } from '@repo/scanner-kit';
import EntityModal from '@repo/ui/components/EntityModal';
import { Button, Dialog } from '@repo/ui/components/native';
import { CircleCheck } from '@repo/ui/icons';
import { hapticSuccess } from '@repo/ui/utils';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { buildHref } from '@repo/core/routing/internalHref';
import { useNavigator } from '@repo/ui/components/native/navigation';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (group: any) => void;
}

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const router = useNavigator();
  const { t } = useTranslation();
  const [createdGroup, setCreatedGroup] = useState<any>(null);

  const groupSchema: EntityDefinition = {
    name: 'CommunityGroup',
    label: t('community.createGroup') || 'Create Learning Circle',
    fields: [
      {
        name: 'name',
        label: t('community.groupName') || 'Circle Name',
        type: 'text',
        required: true,
        placeholder: 'e.g. Grade 10 Science Circle',
      },
      {
        name: 'description',
        label: t('community.groupDescription') || 'Description & Intention',
        type: 'textarea',
        required: false,
        placeholder: 'What is the purpose of this learning space?',
      },
      {
        name: 'category',
        label: t('community.category') || 'Domain',
        type: 'select',
        required: true,
        options: [
          { label: 'Academic Study', value: 'academic' },
          { label: 'Wellbeing & Practice', value: 'wellbeing' },
          { label: 'Arts & Creation', value: 'arts' },
          { label: 'Community Service', value: 'service' },
        ],
        defaultValue: 'academic',
      },
    ],
  };

  const handleGroupCreated = async (data: any) => {
    hapticSuccess();
    setCreatedGroup(data);
    onSuccess?.(data);
  };

  const handleEnterCircle = () => {
    onClose();
    if (createdGroup?.id) {
      router.follow(buildHref('/community/chat/[groupId]', { groupId: createdGroup.id }), 'community');
    }
  };

  if (createdGroup) {
    const groupQRValue = QRBuilder.communityGroup({
      id: createdGroup.id || 'new-group',
      name: createdGroup.name || 'New Learning Circle',
    });

    return (
      <Dialog open={isOpen} onClose={onClose} title="Circle Formed">
        <View className="items-center py-6 gap-6">
          <View className="w-16 h-16 rounded-full bg-emerald-500/10 items-center justify-center border border-emerald-500/20">
            <CircleCheck size={36} className="text-emerald-500" />
          </View>

          <View className="items-center gap-2">
            <Text className="text-xl font-bold text-ink text-center">
              {createdGroup.name}
            </Text>
            <Text className="text-sm text-ink/60 text-center px-4">
              Your learning circle is established. Share this invitation node for peers to join the
              resonance.
            </Text>
          </View>

          <View className="p-6 bg-white rounded-3xl shadow-lg border border-border">
            <QRCodeGenerator value={groupQRValue} size={180} color="#000" />
          </View>

          <Button
            label="Enter Circle Space"
            variant="primary"
            size="lg"
            fullWidth
            onPress={handleEnterCircle}
          />
        </View>
      </Dialog>
    );
  }

  return (
    <EntityModal
      isOpen={isOpen}
      onClose={onClose}
      schema={groupSchema}
      onSubmit={handleGroupCreated}
      title={t('community.createGroup') || 'Create Learning Circle'}
    />
  );
};
