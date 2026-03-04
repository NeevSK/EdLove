import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
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
import { UniversalModal, UniversalModalProps } from './UniversalModal';
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
 * SanctuaryModal.web â€” Optimized overlay for Desktop/Web.
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
    const { glass, text, isDark } = useTheme();

    // Responsive width based on size token
    const getWidth = () => {
        switch (size) {
            case 'xs': return 400;
            case 'sm': return 500;
            case 'md': return 650;
            case 'lg': return 800;
            case 'full': return '90% text';
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
                    backgroundColor: glass.modal.bg,
                    borderColor: glass.modal.border,
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
                        borderColor: 'rgba(255,255,255,0.05)',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <HStack sx={{ space: 'sm', alignItems: 'center', flex: 1 } as any}>
                        {icon && icon}
                        <VStack sx={{ flex: 1 } as any}>
                            <Heading size="md" sx={{ color: text.primary } as any}>
                                {title}
                            </Heading>
                            {subtitle && (
                                <Text sx={{ size: 'xs', color: text.secondary } as any}>
                                    {subtitle}
                                </Text>
                            )}
                        </VStack>
                    </HStack>

                    {showCloseButton && (
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Icon as={CloseIcon} sx={{ color: text.muted, size: 'xl' } as any} />
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
                            backgroundColor: 'rgba(0,0,0,0.1)',
                            borderTopWidth: 1,
                            borderColor: 'rgba(255,255,255,0.05)',
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
        backgroundColor: 'rgba(255,255,255,0.03)',
    }
});

