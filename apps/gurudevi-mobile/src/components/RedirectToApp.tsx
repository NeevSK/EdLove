import { identityAPI } from '@repo/core';
import { Box, Button, ButtonText, hapticLight, Text, VStack } from '@repo/ui';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, Platform } from 'react-native';

/**
 * RedirectToApp component
 * Shown on mobile web to suggest opening the native app.
 * Also handles "Session Handoff" by passing the access token via deep link.
 */
export const RedirectToApp = () => {
  const { t } = useTranslation();
  const [session, setSession] = useState<{ user: { id: string } } | null>(null);

  useEffect(() => {
    if (Platform.OS === 'web') {
      identityAPI.getMyInternalId().then((id) => {
        setSession(id ? { user: { id } } : null);
      });
    }
  }, []);

  if (Platform.OS !== 'web') return null;

  // Very basic check for mobile browser
  const isMobileWeb = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    window.navigator.userAgent,
  );

  if (!isMobileWeb) return null;

  const handleOpenApp = () => {
    hapticLight();

    let url = 'gurudevi://';

    // If we have a session, signal that a web session exists without
    // exposing raw tokens in the URL (to prevent leakage via history/logs).
    if (session) {
      url += 'auth/callback?hasSession=true';
    }

    console.log('= Harmonizer: Opening native app...', { hasSession: !!session });

    Linking.openURL(url).catch(() => {
      alert('Ensure the Gurudevi app is installed on your device.');
    });
  };

  return (
    <Box className="p-4 rounded-2xl border border-warning-500/30 bg-warning-500/10 mb-4 w-full max-w-[400px]">
      <VStack space="sm">
        <Text className="font-bold text-ink-truth text-lg">
          {session
            ? t('auth.continueInApp') || 'Continue your journey in the App'
            : t('auth.betterOnApp') || 'Better on the App'}
        </Text>
        <Text className="text-ink-truth text-sm">
          {session
            ? t('auth.handoffDesc') ||
              "You're logged in here. Tap below to securely transfer your sanctuary soul to the native app."
            : t('auth.openInAppDesc') ||
              'Experience the full Sanctuary features by opening our native mobile app.'}
        </Text>
        <Button
          size="sm"
          onPress={handleOpenApp}
          className="bg-warning-500 rounded-full mt-2 self-start"
        >
          <ButtonText className="font-bold">
            {session
              ? t('auth.openAppAndSync') || 'Open App & Sync'
              : t('auth.openApp') || 'Open App'}
          </ButtonText>
        </Button>
      </VStack>
    </Box>
  );
};
