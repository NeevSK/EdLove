import React from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import {
    VStack,
    HStack,
    Text,
    Heading,
    Icon,
    CloseIcon,
    Box,
} from '../gluestack';
import { useTheme } from '../hooks/useTheme';
import { Theme } from '../theme/Theme';
import { UniversalModal } from './UniversalModal';
import { TouchableOpacity } from 'react-native';

export interface SanctuaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
    footer?: React.ReactNode;
    showCloseButton?: boolean;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'full';
}

/**
 * SanctuaryModal.web  Optimized overlay for Desktop/Web.
 */
export default function SanctuaryModal({
    isOpen,
    onClose,
    title,
    subtitle,
    icon,
    children,
    footer,
    showCloseButton = true,
    size = 'md',
}: SanctuaryModalProps) {
    const { scene, text } = useTheme();

    // Responsive width based on size token
    const getWidth = () => {
        switch (size) {
            case 'xs': return 400;
            case 'sm': return 500;
            case 'md': return 650;
            case 'lg': return 800;
            case 'full': return '90%' as any;
            default: return 650;
        }
    };

    return (
        <UniversalModal isOpen={isOpen} onClose={onClose}>
            {/* Backdrop styling handled by UniversalModal, but we can wrap content here */}
            <Box
                sx={{
                    width: getWidth(),
                    maxWidth: '95vw' as any,
                    backgroundColor: scene.elevated.bg,
                    borderColor: scene.elevated.border,
                    borderWidth: 1,
                    borderRadius: Theme.corners.generous,
                    shadowColor: Theme.colors.shadowViolet,
                    shadowOffset: { width: 0, height: 10 },
                    shadowOpacity: 0.3,
                    shadowRadius: 20,
                    elevation: 10,
                    overflow: 'hidden',
                }}
            >
                {/* Header */}
                <HStack
                    sx={{
                        p: 24,
                        borderBottomWidth: 1,
                        borderColor: scene.elevated.border,
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <HStack sx={{ gap: '$sm', alignItems: 'center', flex: 1 } as any}>
                        {icon && icon}
                        <VStack sx={{ flex: 1 } as any}>
                            <Heading size="md" sx={{ color: text.onElevated } as any}>
                                {title}
                            </Heading>
                            {subtitle && (
                                <Text sx={{ fontSize: '$xs', color: text.secondary } as any}>
                                    {subtitle}
                                </Text>
                            )}
                        </VStack>
                    </HStack>

                    {showCloseButton && (
                        <TouchableOpacity
                            accessibilityRole="button"
                            onPress={onClose}
                            style={[
                                styles.closeBtn,
                                {
                                    backgroundColor: scene.interactive.bg,
                                    borderColor: scene.interactive.border,
                                },
                            ]}
                        >
                            <Icon as={CloseIcon} sx={{ color: text.onElevated, size: 'xl' } as any} />
                        </TouchableOpacity>
                    )}
                </HStack>

                {/* Body */}
                <Box sx={{ p: 24, maxHeight: Dimensions.get('window').height * 0.7 }}>
                    {children}
                </Box>

                {/* Footer */}
                {footer && (
                    <Box
                        sx={{
                            p: 24,
                            backgroundColor: scene.interactive.bg,
                            borderTopWidth: 1,
                            borderColor: scene.interactive.border,
                        }}
                    >
                        {footer}
                    </Box>
                )}
            </Box>
        </UniversalModal>
    );
}

const styles = StyleSheet.create({
    closeBtn: {
        padding: 8,
        borderRadius: 12,
        borderWidth: 1,
    }
});
