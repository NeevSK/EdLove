import React from 'react';
import { Text, VStack, HStack, Box } from '../gluestack';
import SanctuaryButton from './SanctuaryButton';
import SanctuaryModal from './SanctuaryModal';
import { useTheme } from '../hooks/useTheme';
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
 * Uses SanctuaryModal for phase-aware glass styling (light + dark world).
 * Danger accent follows design-token danger color — never pure red on white.
 */
export default function DeleteAccountModal({ isOpen, onClose, onDelete, isLoading }: DeleteAccountModalProps) {
    const { text, accent, glass } = useTheme();
    const dangerColor = accent.danger;

    const footer = (
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
    );

    return (
        <SanctuaryModal
            isOpen={isOpen}
            onClose={onClose}
            title="Delete Account"
            icon={<AlertTriangle color={dangerColor} size={22} />}
            footer={footer}
            size="md"
        >
            <VStack {...({ space: "md", py: "$2" } as any)}>
                <Text {...({ color: text.secondary, size: "md" } as any)}>
                    This action is <Text {...({ bold: true, color: text.primary } as any)}>irreversible</Text>. Your personal profile, settings, and private data will be permanently removed from the Gurudevi sanctuary.
                </Text>
                {/* Data scope clarification */}
                <Box sx={{
                    backgroundColor: glass.interact.bg,
                    padding: Theme.spacing.md,
                    borderRadius: Theme.corners.comfortable,
                    borderWidth: 1,
                    borderColor: glass.interact.border,
                }}>
                    <Text {...({ color: text.secondary, size: "sm" } as any)}>
                        School records (attendance, grades, community posts) are retained for institutional integrity and cannot be removed by individuals.
                    </Text>
                </Box>
                <Box sx={{
                    backgroundColor: `${dangerColor}18`,
                    padding: Theme.spacing.md,
                    borderRadius: Theme.corners.comfortable,
                    borderWidth: 1,
                    borderColor: `${dangerColor}33`,
                }}>
                    <Text {...({ color: dangerColor, bold: true, size: "sm" } as any)}>
                        Just need a break? You can sign out instead — your sanctuary will be waiting for you.
                    </Text>
                </Box>
            </VStack>
        </SanctuaryModal>
    );
}

