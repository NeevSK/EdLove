import React from 'react';
import { Box, Text, HStack, Spinner } from '../gluestack';;
import { Theme } from '../theme/Theme';
import { WifiOff, RefreshCw } from 'lucide-react-native';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { SlideInDown, SlideOutUp } from 'react-native-reanimated';
import { useNetInfo } from '@react-native-community/netinfo';
import { useStore, useMutationQueue } from '@repo/core';

/**
 * NetworkStatusBanner
 * 
 * Displays:
 * 1. Offline Mode (Red)
 * 2. Syncing Mode (Blue/Saffron)
 */
export default function NetworkStatusBanner() {
    const isOnline = useStore(state => state.isOnline);
    const { isSyncing, queue } = useMutationQueue();
    const insets = useSafeAreaInsets();

    // If online and not syncing, show nothing
    if (isOnline && !isSyncing) return null;

    // Determine content based on state
    const isOffline = !isOnline;

    const backgroundColor = isOffline
        ? Theme.colors.emberRed
        : Theme.colors.sanctuarySaffron;

    return (
        <Animated.View
            entering={SlideInDown.duration(500)}
            exiting={SlideOutUp.duration(500)}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                zIndex: Theme.zIndex.modal + 1,
                paddingTop: insets.top,
            }}
        >
            <Box sx={{
                backgroundColor: backgroundColor,
                paddingVertical: 8,
                paddingHorizontal: 16,
                alignItems: 'center',
            }}>
                <HStack space="sm" alignItems="center">
                    {isOffline ? (
                        <>
                            <WifiOff color={Theme.colors.white} size={16} />
                            <Text color={Theme.colors.white} size="xs" bold>
                                Offline Mode {queue.length > 0 ? `(${queue.length} pending actions)` : ''}
                            </Text>
                        </>
                    ) : (
                        <>
                            <Spinner color={Theme.colors.white} size="small" />
                            <Text color={Theme.colors.white} size="xs" bold>
                                Syncing {queue.length} pending actions...
                            </Text>
                        </>
                    )}
                </HStack>
            </Box>
        </Animated.View>
    );
}
