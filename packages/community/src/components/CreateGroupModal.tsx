import React, { useState } from "react";
import {
  SanctuaryModal,
  useThemedColors,
  hapticSuccess,
  VStack,
  Box,
  Heading,
  Text,
  Theme,
  Icon,
  SanctuaryButton
} from "@repo/ui";
import { CheckCircle, QrCode } from "lucide-react-native";
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
  const colors = useThemedColors();
  const navigation = useNavigation<any>();
  const [createdGroupId, setCreatedGroupId] = useState<string | null>(null);

  const groupDefinition: EntityDefinition = {
    type: 'group',
    id: initialData?.id,
    // Form config will eventually come from the protocol
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
      <SanctuaryModal>
        isOpen={isOpen}
        onClose={onClose}
        title="Community Founded!"
              <VStack sx={{ gap: Theme.spacing.xl, alignItems: 'center', paddingVertical: Theme.spacing.lg }}>
          <Box sx={{ backgroundColor: 'rgba(246,191,140,0.1)', padding: 24, borderRadius: 60 }}>
            <Icon as={CheckCircle} color={Theme.colors.sanctuarySaffron} size={64} />
          </Box>
          <VStack sx={{ gap: Theme.spacing.sm, alignItems: 'center' }}>
            <Heading color={colors.text} size="xl" sx={{ textAlign: 'center' }}>
              Group Ready!
            </Heading>
            <Text sx={{ textAlign: 'center', color: colors.textSecondary }}>
              Your community is ready to welcome its members.
            </Text>
          </VStack>

          <Box sx={{ padding: 20, backgroundColor: 'white', borderRadius: 12 }}>
            <QRCodeGenerator>
              value={groupQRValue}
              size={180}
              color="#000"
            /
          </Box>
          
          <SanctuaryButton >
            onPress={() => {
              onClose();
              navigation.navigate("GroupDetails", { groupId: createdGroupId });
            }}
          
            <Text color="white" bold>Enter Group Space</Text          ></SanctuaryButton        </VStack      </SanctuaryModal    );
  }

  return (
    <EntityModal>
      isOpen={isOpen}
      onClose={onClose}
      definition={groupDefinition}
      mode={mode as any}
      instance={initialData}
    /
  );
}
