/**
 * PWAInstallBanner — Web-exclusive component
 *
 * Shows an on-brand "Install Gurudevi" banner at the bottom of the screen when
 * the browser's PWA install criteria are met.  Tapping "Install" triggers the
 * native browser install dialog; tapping "Maybe later" dismisses for 30 days.
 *
 * Only renders on web (Sovereign Web guard + hook internals).
 */

import { Download, Share, X } from '@repo/ui/icons';
import {
  AnimatedView,
  Box,
  HStack,
  Icon,
  Pressable,
  Text,
  useTheme,
  VStack,
} from '@repo/ui/primitives';
import { SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { usePWAInstallPrompt } from '@/utils/usePWAInstallPrompt';

export function PWAInstallBanner() {
  const { canInstall, promptInstall, isDismissed, dismiss, isIOS, isInstalled } =
    usePWAInstallPrompt();
  const theme = useTheme();

  const handleInstall = () => {
    (async () => {
      try {
        await promptInstall();
      } catch {
        dismiss();
      }
    })();
  };

  if (isInstalled) {
    return null;
  }
  if (isDismissed) {
    return null;
  }
  if (!canInstall && !isIOS) {
    return null;
  }

  return (
    <AnimatedView
      entering={SlideInDown.springify().damping(18)}
      exiting={SlideOutDown.duration(220)}
      className="absolute bottom-0 left-0 right-0 p-lg border-t z-[999] flex-row items-center justify-between"
      style={{
        backgroundColor: theme.scene.surface.bg,
        borderTopColor: theme.scene.surface.border,
      }}
    >
      <HStack className="items-center flex-1 gap-3">
        <Box>
          <Icon as={isIOS ? Share : Download} size={20} className="text-sanctuarySaffron" />
        </Box>
        <VStack className="flex-1">
          <Text className="text-sm font-bold text-phaseText-primary">
            {isIOS ? 'Add to Home Screen' : 'Install Gurudevi'}
          </Text>
          <Text className="text-xs text-phaseText-secondary mt-0.5">
            {isIOS
              ? 'Tap the Share icon, then "Add to Home Screen"'
              : 'Your Sanctuary, one tap away'}
          </Text>
        </VStack>
      </HStack>

      <HStack className="items-center gap-3">
        {!isIOS && (
          <Pressable
            onPress={handleInstall}
            className="px-4 py-2 rounded-xl bg-sanctuarySaffron"
            accessibilityLabel="Install Gurudevi as an app"
            accessibilityHint="Triggers the browser install prompt for Gurudevi"
          >
            <Text className="text-ink text-[13px] font-bold">Install</Text>
          </Pressable>
        )}
        <Pressable
          onPress={dismiss}
          className="p-1.5"
          accessibilityLabel="Dismiss install prompt"
          accessibilityHint="Closes this banner for 30 days"
        >
          <Icon as={X} size={18} className="text-phaseText-secondary" />
        </Pressable>
      </HStack>
    </AnimatedView>
  );
}
