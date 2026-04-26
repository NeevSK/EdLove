import {
  Box,
  Heading,
  HStack,
  hapticLight,
  Icon,
  Pressable,
  ScrollView,
  Text,
  VStack,
} from '@repo/ui';
import { X } from 'lucide-react-native';
import React from 'react';
import { Modal } from 'react-native';
import TeacherAdminWidget from './TeacherAdminWidget';

interface TeacherAdminPortalModalProps {
  visible: boolean;
  onClose: () => void;
  onAction?: (action: string) => void;
  title?: string;
}

/**
 * TEACHER ADMIN PORTAL MODAL
 * Sanctuary V3 standard for full-screen administrative access.
 * Features premium glassmorphism and standardized Sanctuary primitives.
 */
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
      <Box className="flex-1 bg-phase-canvas">
        <Box className="pt-8 pb-6 px-6 border-b border-phase-surface shadow-sm">
          <HStack className="justify-between items-center">
            <VStack>
              <Heading className="text-2xl font-bold text-phase-text-primary tracking-tight">
                {title}
              </Heading>
              <Text className="text-[10px] font-bold text-phase-text-tertiary uppercase tracking-widest mt-0.5">
                SOVEREIGN MANAGEMENT
              </Text>
            </VStack>
            <Pressable
              onPress={() => {
                hapticLight();
                onClose();
              }}
              className="w-10 h-10 rounded-full bg-phase-surface items-center justify-center border border-phase-surface shadow-sm active:scale-90 transition-all"
            >
              <Icon as={X} size="lg" className="text-phase-text-primary" />
            </Pressable>
          </HStack>
        </Box>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 24, paddingBottom: 60 }}
        >
          <TeacherAdminWidget onAction={onAction} />

          <Box className="mt-12 p-6 bg-phase-surface/30 rounded-[32px] border border-phase-surface/50">
            <Text className="text-xs text-phase-text-tertiary leading-5 font-medium italic text-center">
              This portal is secured by the Gurudevi Sanctuary Governance protocols. All
              administrative actions are logged in the sovereign record.
            </Text>
          </Box>
        </ScrollView>
      </Box>
    </Modal>
  );
}
