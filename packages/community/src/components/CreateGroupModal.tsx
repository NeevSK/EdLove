import React, { useState } from "react";
import {
  SanctuaryModal,
  hapticSuccess,
  VStack,
  Box,
  Heading,
  Text,
  Icon,
  SanctuaryButton,
  Theme
} from "@repo/ui";
import { CheckCircle } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { QRBuilder, QRCodeGenerator } from "@repo/scanner-kit";
import { EntityModal } from "@repo/ui";
import { EntityDefinition } from "@repo/core";

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (groupId: string) => void;
  onSuccess?: (group: any) => void;
  mode?: "create" | "edit";
  initialData?: any;
}

export default function CreateGroupModal({
  isOpen,
  onClose,
  onCreated,
  onSuccess,
  mode = "create",
  initialData,
}: CreateGroupModalProps) {
  useTranslation();
  const navigation = useNavigation<any>();
  const [createdGroupId, setCreatedGroupId] = useState<string | null>(null);

  const groupDefinition: EntityDefinition = {
    type: 'group',
    id: initialData?.id,
  };

  const handleSuccess = (group: any) => {
    hapticSuccess();
    setCreatedGroupId(group.id);
    onCreated?.(group.id);
    onSuccess?.(group);
  };

  if (createdGroupId) {
    const groupQRValue = QRBuilder.group(createdGroupId);
    return (
      <SanctuaryModal
        isOpen={isOpen}
        onClose={onClose}
        title="Community Founded!"
      >
        <VStack className="gap-8 items-center py-6">
          <Box className="bg-[#F6BF8C]/10 p-6 rounded-[60px]">
            <Icon as={CheckCircle} className="text-primary-500" size={64} />
          </Box>
          <VStack className="gap-2 items-center">
            <Heading size="xl" className="text-center text-foreground">
              Group Ready!
            </Heading>
            <Text className="text-center text-muted-foreground">
              Your community is ready to welcome its members.
            </Text>
          </VStack>

          <Box className="p-5 bg-white rounded-xl">
            <QRCodeGenerator
              value={groupQRValue}
              size={180}
              color="#000"
            />
          </Box>
          
          <SanctuaryButton
            onPress={() => {
              onClose();
              navigation.navigate("GroupDetails", { groupId: createdGroupId });
            }}
          >
            <Text className="text-white font-bold">Enter Group Space</Text>
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
    />
  );
}
