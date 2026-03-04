import React from 'react';
import { Box, HStack, Text, Pressable } from '../gluestack';
import { Theme } from '../theme/Theme';
import { useThemedColors } from '../hooks/useThemedColors';
import { hapticLight } from '../utils/haptics';
import { useStore } from '@repo/core';
import { useTranslation } from 'react-i18next';
import { Zap, X } from 'lucide-react-native';

interface SandboxBannerProps {
    onExit?: () => void;
}

const SandboxBanner: React.FC<SandboxBannerProps> = ({ onExit }) => {
    const { isDemoMode } = useStore();
    const colors = useThemedColors();
    const { t } = useTranslation();

    if (!isDemoMode) return null;

    return (
        <Box
            sx={{
                backgroundColor: Theme.colors.sanctuarySaffron,
                padding: Theme.spacing.sm,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: Theme.zIndex.sticky + 1,
            }}
        >
            <HStack space="xs" alignItems="center">
                <Zap color="white" size={16} fill="white" />
                <Text color="white" bold size="xs">
                    {t('demoMode.simulationAlert') || 'Exploring Sample Sanctuary'}
                </Text>
            </HStack>

            {onExit && (
                <Pressable
                    onPress={async () => {
                        hapticLight();
                        onExit();
                    }}
                    sx={{
                        padding: 4,
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: 'rgba(0,0,0,0.1)',
                        borderRadius: Theme.corners.comfortable,
                        paddingHorizontal: Theme.spacing.sm
                    }}
                >
                    <HStack space="xs" alignItems="center">
                        <Text color="white" bold size="xs">{t('common.exit') || 'Exit'}</Text>
                        <X color="white" size={14} />
                    </HStack>
                </Pressable>
            )}
        </Box>
    );
};

export default SandboxBanner;

