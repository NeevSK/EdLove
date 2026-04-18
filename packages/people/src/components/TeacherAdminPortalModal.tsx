import React from 'react';
import { Modal } from 'react-native';
import { X } from 'lucide-react-native';
import { Box, HStack, Text, hapticLight, ScrollView, Pressable, Icon } from '@repo/ui';
import TeacherAdminWidget from './TeacherAdminWidget';

interface TeacherAdminPortalModalProps {
  visible: boolean;
  onClose: () => void;
  onAction?: (action: string) => void;
  title?: string;
}

export default function TeacherAdminPortalModal({
  visible,
  onClose,
  onAction,
  title = 'Administrative Portal',
}: TeacherAdminPortalModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <Box className="flex-1 bg-background">
        <Box className="pt-12 pb-4 px-4 border-b border-border">
          <HStack className="justify-between items-center">
            <Text className="text-xl font-bold text-textPrimary">
              {title}
            </Text>
            <Pressable
              onPress={() => {
                hapticLight();
                onClose();
              }}
              className="p-2 rounded-full bg-silk border border-border"
            >
              <Icon as={X} size="lg" className="text-textPrimary" />
            </Pressable>
          </HStack>
        </Box>
        <ScrollView contentContainerStyle={{ padding: 24 }}>
          <TeacherAdminWidget onAction={onAction} />
        </ScrollView>
      </Box>
    </Modal>
  );
}
