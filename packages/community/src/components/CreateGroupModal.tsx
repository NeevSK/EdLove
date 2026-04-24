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
        title="Circle Founded"
      >
        <VStack className="gap-8 items-center py-8">
            <Box className="w-24 h-24 rounded-full bg-phase-interactive/10 items-center justify-center border border-phase-interactive/20">
                <Icon as={CheckCircle} className="text-phase-interactive" size="xl" />
            </Box>
          
          <VStack className="gap-2 items-center px-4">
            <Heading className="text-center text-ink text-2xl font-black">
                Resonance Established
            </Heading>
            <Text className="text-center text-ink/60 text-sm leading-relaxed px-5">
              Your new circle is ready to welcome its members. Share this portal to begin the resonance.
            </Text>
          </VStack>

          <Box className="p-6 bg-white rounded-3xl shadow-lg border border-border">
            <QRCodeGenerator
              value={groupQRValue}
              size={180}
              color="#000"
            />
          </Box>
          
          <SanctuaryButton
            action="primary"
            className="w-full h-14 rounded-2xl"
            onPress={() => {
              onClose();
              navigation.navigate("GroupDetails", { groupId: createdGroupId });
            }}
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
