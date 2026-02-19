import React from 'react';
import { Modal, ModalBackdrop, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Heading, Text, CloseIcon, Icon, VStack, HStack, Box } from '../gluestack';
import SanctuaryButton from './SanctuaryButton';
import { Theme } from '../theme/Theme';
import { AlertTriangle } from 'lucide-react-native';

interface DeleteAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDelete: () => void;
    isLoading: boolean;
}

/**
 * A destructive confirmation modal for account deletion.
 * Follows the Sanctuary design system with high-contrast warnings.
 */
export default function DeleteAccountModal({ isOpen, onClose, onDelete, isLoading }: DeleteAccountModalProps) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            {...({ size: "md" } as any)}
        >
            <ModalBackdrop />
            <ModalContent sx={{
                backgroundColor: Theme.colors.deepIndigo,
                borderColor: Theme.colors.emberRed,
                borderWidth: 1
            }}>
                <ModalHeader>
                    <HStack {...({ space: "sm", alignItems: "center" } as any)}>
                        <AlertTriangle color={Theme.colors.emberRed} size={22} />
                        <Heading size="lg" color={Theme.colors.sacredWhite}>Delete Account</Heading>
                    </HStack>
                    <ModalCloseButton>
                        <Icon as={CloseIcon} color={Theme.colors.mistGray} />
                    </ModalCloseButton>
                </ModalHeader>
                <ModalBody>
                    <VStack {...({ space: "md", py: "$2" } as any)}>
                        <Text {...({ color: Theme.colors.pearlGray, size: "md" } as any)}>
                            This action is <Text {...({ bold: true, color: Theme.colors.sacredWhite } as any)}>irreversible</Text>. All your data, including classrooms, community posts, library contributions, and personal growth history, will be permanently removed from the Gurudevi sanctuary.
                        </Text>
                        <Box sx={{
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            padding: 12,
                            borderRadius: Theme.corners.comfortable,
                            borderWidth: 1,
                            borderColor: 'rgba(239, 68, 68, 0.2)'
                        }}>
                            <Text {...({ color: Theme.colors.emberRed, bold: true, size: "sm" } as any)}>
                                Wait! If you just want to take a break, you can simply sign out. Deleting your account will erase everything forever.
                            </Text>
                        </Box>
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <HStack {...({ space: "md", width: "100%" } as any)}>
                        <Box sx={{ flex: 1 }}>
                            <SanctuaryButton
                                action="secondary"
                                onPress={onClose}
                                isDisabled={isLoading}
                            >
                                Cancel
                            </SanctuaryButton>
                        </Box>
                        <Box sx={{ flex: 1.5 }}>
                            <SanctuaryButton
                                action="negative"
                                onPress={onDelete}
                                isLoading={isLoading}
                            >
                                {isLoading ? "Processing..." : "Delete Permanently"}
                            </SanctuaryButton>
                        </Box>
                    </HStack>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

