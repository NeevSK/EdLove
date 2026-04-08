import React from 'react';
import { Box, HStack, Text, Pressable } from '../gluestack';
import { hapticLight } from '../utils/haptics';
import { useStore } from '@repo/core';
import { useTranslation } from 'react-i18next';
import { Zap, X } from 'lucide-react-native';

interface SandboxBannerProps {
    onExit?: () => void;
}

const SandboxBanner: React.FC<SandboxBannerProps> = ({ onExit }) => {
    const { isDemoMode } = useStore();
    const { t } = useTranslation();

    if (!isDemoMode) return null;

    return (
        <Box className="bg-phase-accent py-2 px-4 flex-row justify-between items-center z-50">
            <HStack space="xs" className="items-center">
                <Zap color="white" size={16} fill="white" />
                <Text className="text-white font-bold text-xs">
                    {t('demoMode.simulationAlert') || 'Exploring Sample Sanctuary'}
                </Text>
            </HStack>

            {onExit && (
                <Pressable 
                    accessibilityRole="button"
                    onPress={async () => {
                        hapticLight();
                        onExit();
                    }}
                    className="flex-row items-center bg-black/10 px-3 py-1 rounded-lg"
                >
                    <HStack space="xs" className="items-center">
                        <Text className="text-white font-bold text-xs">{t('common.exit') || 'Exit'}</Text>
                        <X color="white" size={14} />
                    </HStack>
                </Pressable>
            )}
        </Box>
    );
};

export default SandboxBanner;
