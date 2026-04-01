import React from 'react';
import { Modal, TouchableOpacity, ScrollView } from 'react-native';
import { X } from 'lucide-react-native';
import { Box, HStack, Heading, Theme, hapticLight, useThemedColors } from '@repo/ui';
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
  const colors = useThemedColors();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <Box flex={1} sx={{ backgroundColor: colors.primary }}>
        <Box
          sx={{
            paddingTop: 50,
            paddingBottom: Theme.spacing.md,
            paddingHorizontal: Theme.spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <HStack justifyContent="space-between" alignItems="center">
            <Heading size="lg" color={colors.text}>
              {title}
            </Heading>
            <TouchableOpacity
              onPress={() => {
                hapticLight();
                onClose();
              }}
              style={{
                padding: 8,
                borderRadius: Theme.corners.full,
                backgroundColor: colors.tertiary,
                borderColor: colors.border,
                borderWidth: 1,
              }}
            >
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </HStack>
        </Box>
        <ScrollView contentContainerStyle={{ padding: Theme.spacing.lg }}>
          <TeacherAdminWidget onAction={onAction} />
        </ScrollView>
      </Box>
    </Modal>
  );
}
