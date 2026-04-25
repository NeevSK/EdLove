/**
 * PWAInstallBanner — Web-exclusive component
 *
 * Shows an on-brand "Install Gurudevi" banner at the bottom of the screen when
 * the browser's PWA install criteria are met.  Tapping "Install" triggers the
 * native browser install dialog; tapping "Maybe later" dismisses for 30 days.
 *
 * Only renders on web (Sovereign Web guard + hook internals).
 */

import { AnimatedView, Box, HStack, Icon, Pressable, Text, useTheme, VStack } from '@repo/ui';
import { Download, Share, X } from 'lucide-react-native';
import { SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { usePWAInstallPrompt } from '@/utils/usePWAInstallPrompt';

export function PWAInstallBanner() {
  const { canInstall, promptInstall, isDismissed, dismiss, isIOS, isInstalled } =
    usePWAInstallPrompt();
  const theme = useTheme();

  if (isInstalled) return null;
  if (isDismissed) return null;
  if (!canInstall && !isIOS) return null;

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
          <Icon
            as={isIOS ? Share : Download}
            size={20}
            className="text-sanctuarySaffron"
          />
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
            onPress={async () => {
              try {
                await promptInstall();
              } catch {
                dismiss();
              }
            }}
            className="px-4 py-2 rounded-xl bg-sanctuarySaffron"
            accessibilityLabel="Install Gurudevi as an app"
          >
            <Text className="text-ink text-[13px] font-bold">Install</Text>
          </Pressable>
        )}
        <Pressable
          onPress={dismiss}
          className="p-1.5"
          accessibilityLabel="Dismiss install prompt"
        >
          <Icon as={X} size={18} className="text-phaseText-secondary" />
        </Pressable>
      </HStack>
    </AnimatedView>
  );
}
