import React from 'react';
import { Box, HStack, Text, Pressable } from '@repo/ui';
import { Zap, X } from 'lucide-react-native';
import { Theme } from '@repo/ui';
import { useTranslation } from 'react-i18next';
import { hapticLight } from '@repo/ui';
import { useDemoBridge } from '../../hooks/useDemoBridge';

/**
 * A sticky banner shown at the top of screens when in Demo Mode.
 * Provides clear context and a way to exit/bridge to reality.
 */
export default function SandboxBanner() {
    const { t } = useTranslation();
    const { exitDemoWithBridge } = useDemoBridge();

    return (
        <Box
            sx={{
                backgroundColor: Theme.colors.sanctuarySaffron,
                padding: Theme.spacing.sm,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: Theme.zIndex.sticky + 1, // Ensure it's above other elements
            }}
        >
            <HStack space="xs" alignItems="center">
                <Zap color="white" size={16} fill="white" />
                <Text color="white" bold size="xs">
                    {t('demoMode.simulationAlert')}: Exploring Sample Sanctuary
                </Text>
            </HStack>
            <Pressable
                onPress={async () => {
                    hapticLight();
                    await exitDemoWithBridge();
                }}
                sx={{
                    padding: 4,
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0,0,0,0.1)',
                    borderRadius: Theme.corners.comfortable,
                    px: "$2"
                }}
            >
                <HStack space="xs" alignItems="center">
                    <Text color="white" bold size="xs">Exit</Text>
                    <X color="white" size={14} />
                </HStack>
            </Pressable>
        </Box>
    );
}
