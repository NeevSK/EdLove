import { ChevronRight, Folder, Lock, X } from '@repo/ui/icons';
import { SanctuaryFlashList } from '@repo/ui/components/SanctuaryFlashList';
import {
  Box,
  Center,
  HStack,
  Icon,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Pressable,
  Text,
  VStack,
} from '@repo/ui/primitives';
import type React from 'react';
import type { LibraryCollection } from '@repo/library/types';

interface CollectionPickerModalProps {
  visible: boolean;
  onClose: () => void;
  collections: LibraryCollection[];
  onSelect: (collectionId: string) => void;
  isAdding: boolean;
}

export const CollectionPickerModal: React.FC<CollectionPickerModalProps> = ({
  visible,
  onClose,
  collections,
  onSelect,
  isAdding,
}) => (
  <Modal isOpen={visible} onClose={onClose}>
    <ModalContent className="bg-phase-surface rounded-[24px]">
      <ModalHeader className="p-5 border-b border-phase-border">
        <HStack className="justify-between items-center w-full">
          <Text className="text-lg font-extrabold text-phaseText-primary">Add to Collection</Text>
          <Pressable onPress={onClose} className="p-2 rounded-full hover:bg-phase-surface-light">
            <Icon as={X} size="xl" className="text-phaseText-secondary" />
          </Pressable>
        </HStack>
      </ModalHeader>

      <ModalBody className="p-0">
        <SanctuaryFlashList
          data={collections}
          keyExtractor={(item: any) => item.id}
          renderItem={({ item }: { item: any }) => (
            <Pressable
              className="flex-row items-center p-5 border-b border-phase-border active:opacity-70"
              onPress={() => onSelect(item.id)}
              disabled={isAdding}
            >
              <Box className="w-12 h-12 items-center justify-center rounded-2xl bg-phase-accent/10 mr-4">
                {item.visibility === 'private' ? (
                  <Icon as={Lock} size="lg" className="text-phase-accent" />
                ) : (
                  <Icon as={Folder} size="lg" className="text-phase-accent" />
                )}
              </Box>
              <VStack className="flex-1 gap-1">
                <Text className="text-base font-extrabold text-phaseText-primary">{item.name}</Text>
                <Box className="bg-phase-accent/10 px-2.5 py-1 rounded-full self-start">
                  <Text className="text-[10px] font-black text-phase-accent uppercase tracking-widest">
                    {item.visibility}
                  </Text>
                </Box>
              </VStack>
              <Icon as={ChevronRight} size="sm" className="text-phaseText-tertiary" />
            </Pressable>
          )}
          ListEmptyComponent={
            <Center className="p-10">
              <Text className="text-sm font-medium text-phaseText-tertiary">
                No collections found.
              </Text>
            </Center>
          }
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </ModalBody>
    </ModalContent>
  </Modal>
);

export default CollectionPickerModal;
