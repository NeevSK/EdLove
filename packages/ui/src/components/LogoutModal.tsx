import React from 'react';
import { Text, VStack, HStack, Box } from '../gluestack';
import SanctuaryButton from './SanctuaryButton';
import SanctuaryModal from './SanctuaryModal';
import { useTheme } from '../hooks/useTheme';
import { Theme } from '../theme/Theme';
import { LogOut } from 'lucide-react-native';

interface LogoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLogout: () => void;
    isLoading?: boolean;
}

/**
 * LogoutModal  sanctuary-themed logout confirmation.
 * Uses SanctuaryModal for phase-aware glass styling (light + dark world).
 */
export default function LogoutModal({ isOpen, onClose, onLogout, isLoading = false }: LogoutModalProps) {
    const { text, accent } = useTheme();

    const footer = (
        <HStack {...({ space: "md", width: "100%" } as any)}
            <Box sx={{ flex: 1 }}
                <SanctuaryButton
                    variant="ghost"
                    action="secondary"
                    onPress={onClose}
                    isDisabled={isLoading}
                
                    Stay
                </SanctuaryButton
            </Box
            <Box sx={{ flex: 1.5 }}
                <SanctuaryButton
                    action="primary"
                    onPress={onLogout}
                    isLoading={isLoading}
                
                    {isLoading ? "Signing out&" : "Sign Out"}
                </SanctuaryButton
            </Box
        </HStack
    );

    return (
        <SanctuaryModal
            isOpen={isOpen}
            onClose={onClose}
            title="Sign Out"
            icon={<LogOut color={accent.action} size={20} />}
            footer={footer}
            size="md"
        
            <VStack {...({ space: "md", py: "$2" } as any)}
                <Text {...({ color: text.secondary, size: "md" } as any)}
                    Are you sure you want to sign out? You'll need to log in again to access your garden.
                </Text
                <Box sx={{
                    backgroundColor: `${accent.action}15`,
                    padding: Theme.spacing.md,
                    borderRadius: Theme.corners.comfortable,
                    borderWidth: 1,
                    borderColor: `${accent.action}33`,
                }}
                    <Text {...({ color: text.secondary, size: "sm" } as any)}
                        Your streak, achievements, and connections will be here when you come back.
                    </Text
                </Box
            </VStack
        </SanctuaryModal
    );
}

