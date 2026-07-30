import { ChevronRight, Folder, Lock, X } from '@repo/ui/icons';
import type React from 'react';
import {
  Box,
  FlatList,
  HStack,
  Icon,
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
  ModalHeader,
  Pressable,
  Text,
  VStack,
} from '@repo/ui/gluestack';

export interface PickerItem {
  id: string;
  name: string;
  visibility?: 'private' | 'public' | 'shared';
  metadata?: any;
}

export interface AssetCollectionPickerProps {
  visible: boolean;
  onClose: () => void;
  items: PickerItem[];
  onSelect: (id: string) => void;
  isLoading?: boolean;
  title?: string;
  emptyLabel?: string;
}

/**
 * AssetCollectionPicker - Platform-wide entity organizer.
 * Promoted from library to UI to support organizing resources, posts, or assignments.
 */
export const AssetCollectionPicker: React.FC<AssetCollectionPickerProps> = ({
  visible,
  onClose,
  items,
  onSelect,
  isLoading = false,
  title = 'Add to Collection',
  emptyLabel = 'No collections found.',
}) => {
  return (
    <Modal isOpen={visible} onClose={onClose}>
      <ModalBackdrop />
      <ModalContent className="bg-phase-surface rounded-[32px] overflow-hidden border border-phase-border shadow-2xl">
        <ModalHeader className="p-6 border-b border-phase-border">
          <HStack className="justify-between items-center w-full">
            <VStack className="gap-1">
              <Text className="text-xl font-black text-phaseText-primary tracking-tight">
                {title}
              </Text>
              <Text className="text-[10px] uppercase font-extrabold text-phaseText-tertiary tracking-widest">
                Platform Organizer V3
              </Text>
            </VStack>
            <Pressable
              accessibilityRole="button"
              onPress={onClose}
              className="p-3 rounded-full bg-phase-surface-light active:bg-phase-surface-dark"
            >
              <Icon as={X} size="xl" className="text-phaseText-secondary" />
            </Pressable>
          </HStack>
        </ModalHeader>

        <ModalBody className="p-0">
          <FlatList
            data={items}
            keyExtractor={(item: any) => item.id}
            renderItem={({ item }: { item: any }) => (
              <Pressable
                accessibilityRole="button"
                className="flex-row items-center p-6 border-b border-phase-border active:bg-phase-accent/5"
                onPress={() => onSelect(item.id)}
                disabled={isLoading}
              >
                <Box className="w-14 h-14 items-center justify-center rounded-[20px] bg-phase-accent/10 mr-4 shadow-sm">
                  {item.visibility === 'private' ? (
                    <Icon as={Lock} size="lg" className="text-phase-accent" />
                  ) : (
                    <Icon as={Folder} size="lg" className="text-phase-accent" />
                  )}
                </Box>

                <VStack className="flex-1 gap-1">
                  <Text className="text-base font-bold text-phaseText-primary" numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Box className="bg-phase-accent/15 px-3 py-1 rounded-lg self-start">
                    <Text className="text-[9px] font-black text-phase-accent uppercase tracking-wider">
                      {item.visibility || 'Public'}
                    </Text>
                  </Box>
                </VStack>

                <Icon as={ChevronRight} size="sm" className="text-phaseText-tertiary" />
              </Pressable>
            )}
            ListEmptyComponent={
              <Box className="p-12 items-center justify-center">
                <Text className="text-sm font-medium text-phaseText-tertiary italic">
                  {emptyLabel}
                </Text>
              </Box>
            }
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default AssetCollectionPicker;
