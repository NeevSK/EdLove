import React from 'react';
import {
    Modal,
    ModalBackdrop,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    Heading,
    Text,
    CloseIcon,
    Icon,
    VStack,
    HStack,
    Box,
} from '../gluestack';
import SanctuaryButton from './SanctuaryButton';
import { Theme } from '../theme/Theme';
import { LogOut } from 'lucide-react-native';

interface LogoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLogout: () => void;
    isLoading?: boolean;
}

/**
 * LogoutModal — sanctuary-themed logout confirmation.
 * Matches the tone and structure of DeleteAccountModal but uses
 * a softer, non-destructive visual language.
 */
export default function LogoutModal({ isOpen, onClose, onLogout, isLoading = false }: LogoutModalProps) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            {...({ size: "md" } as any)}
        >
            <ModalBackdrop />
            <ModalContent sx={{
                width: '90%',
                backgroundColor: Theme.colors.ink,
                borderColor: Theme.colors.glass.dark.border,
                borderRadius: Theme.corners.generous,
            }}>
                <ModalHeader>
                    <HStack {...({ space: "sm", alignItems: "center" } as any)}>
                        <LogOut color={Theme.colors.sanctuarySaffron} size={20} />
                        <Heading size="lg" color={Theme.colors.sacredWhite}>Sign Out</Heading>
                    </HStack>
                    <ModalCloseButton>
                        <Icon as={CloseIcon} color={Theme.colors.mistGray} />
                    </ModalCloseButton>
                </ModalHeader>

                <ModalBody>
                    <VStack {...({ space: "md", py: "$2" } as any)}>
                        <Text {...({ color: Theme.colors.starlightGray, size: "md" } as any)}>
                            Are you sure you want to sign out? You'll need to log in again to access your garden.
                        </Text>
                        <Box sx={{
                            backgroundColor: `${Theme.colors.sanctuarySaffron}15`,
                            padding: Theme.spacing.md,
                            borderRadius: Theme.corners.comfortable,
                            borderWidth: 1,
                            borderColor: `${Theme.colors.sanctuarySaffron}33`,
                        }}>
                            <Text {...({ color: Theme.colors.starlightGray, size: "sm" } as any)}>
                                Your streak, achievements, and connections will be here when you come back.
                            </Text>
                        </Box>
                    </VStack>
                </ModalBody>

                <ModalFooter>
                    <HStack {...({ space: "md", width: "100%" } as any)}>
                        <Box sx={{ flex: 1 }}>
                            <SanctuaryButton
                                variant="ghost"
                                action="secondary"
                                onPress={onClose}
                                isDisabled={isLoading}
                            >
                                Stay
                            </SanctuaryButton>
                        </Box>
                        <Box sx={{ flex: 1.5 }}>
                            <SanctuaryButton
                                action="primary"
                                onPress={onLogout}
                                isLoading={isLoading}
                            >
                                {isLoading ? "Signing out…" : "Sign Out"}
                            </SanctuaryButton>
                        </Box>
                    </HStack>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
