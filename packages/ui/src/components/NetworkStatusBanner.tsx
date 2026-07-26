import { useMutationQueue, useStore } from '@repo/core/logic';
import { WifiOff } from '@repo/ui/icons';
import { Platform } from 'react-native';
import Animated, { SlideInUp, SlideOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Box, HStack, Spinner, Text } from '@/gluestack';

/**
 * NetworkStatusBanner
 * Hardened v3 implementation.
 */
export default function NetworkStatusBanner() {
  const isOnline = useStore((state) => state.isOnline);
  const { isSyncing, queue } = useMutationQueue();
  const insets = useSafeAreaInsets();

  // If online and not syncing, show nothing
  if (isOnline && !isSyncing) return null;

  const isOffline = !isOnline;

  return (
    <Animated.View
      entering={SlideInUp.duration(500)}
      exiting={SlideOutUp.duration(500)}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        paddingTop: Platform.OS !== 'web' ? insets.top : 0,
      }}
    >
      <Box
        className={`${isOffline ? 'bg-phase-danger' : 'bg-phase-accent'} py-2 px-4 items-center`}
      >
        <HStack space="sm" className="items-center">
          {isOffline ? (
            <>
              <WifiOff color="white" size={16} />
              <Text className="text-white text-xs font-bold">
                Offline Mode {queue.length > 0 ? `(${queue.length} pending actions)` : ''}
              </Text>
            </>
          ) : (
            <>
              <Spinner className="text-white" size="small" />
              <Text className="text-white text-xs font-bold">
                Syncing {queue.length} pending actions...
              </Text>
            </>
          )}
        </HStack>
      </Box>
    </Animated.View>
  );
}
