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
                backgroundColor: Theme.colors.ink,
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
                        <Text {...({ color: Theme.colors.starlightGray, size: "md" } as any)}>
                            This action is <Text {...({ bold: true, color: Theme.colors.sacredWhite } as any)}>irreversible</Text>. Your personal profile, settings, and private data will be permanently removed from the Gurudevi sanctuary.
                        </Text>
                        {/* Data scope clarification — task 2.6.1 */}
                        <Box sx={{
                            backgroundColor: `${Theme.colors.glassBorder}`,
                            padding: Theme.spacing.md,
                            borderRadius: Theme.corners.comfortable,
                            borderWidth: 1,
                            borderColor: `${Theme.colors.glassBorder}`,
                        }}>
                            <Text {...({ color: Theme.colors.starlightGray, size: "sm" } as any)}>
                                School records (attendance, grades, community posts) are retained for institutional integrity and cannot be removed by individuals.
                            </Text>
                        </Box>
                        <Box sx={{
                            backgroundColor: `${Theme.colors.emberRed}18`,
                            padding: Theme.spacing.md,
                            borderRadius: Theme.corners.comfortable,
                            borderWidth: 1,
                            borderColor: `${Theme.colors.emberRed}33`,
                        }}>
                            <Text {...({ color: Theme.colors.emberRed, bold: true, size: "sm" } as any)}>
                                Just need a break? You can sign out instead — your sanctuary will be waiting for you.
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

