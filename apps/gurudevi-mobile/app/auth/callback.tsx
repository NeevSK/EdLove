import { deepLink } from '@repo/core/logic';
import { BrandPulse } from '@repo/ui';
import { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { Button, ButtonText, Center, Text, VStack } from '@repo/ui/primitives';
import { router, useGlobalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { createNativeAuthCallbackUrl } from '@/entry/authCallbackUrl';

export { RouteErrorBoundary as ErrorBoundary };

export default function AuthCallbackRoute() {
  const startedRef = useRef(false);
  const params = useGlobalSearchParams<Record<string, string | string[]>>();
  const [failureMessage, setFailureMessage] = useState<string | null>(null);

  useEffect(() => {
    if (startedRef.current) return;

    startedRef.current = true;
    const callbackUrl =
      Platform.OS === 'web' ? window.location.href : createNativeAuthCallbackUrl(params);

    let active = true;
    void deepLink
      .handleURL(callbackUrl)
      .then((result) => {
        if (active && !result.isHandled) {
          setFailureMessage(result.message ?? 'Unable to complete sign-in.');
        }
      })
      .catch(() => {
        if (active) {
          setFailureMessage('Sign-in could not be completed. Please try again.');
        }
      });

    return () => {
      active = false;
    };
  }, [params]);

  if (failureMessage) {
    return (
      <Center className="flex-1 bg-obsidian px-6">
        <VStack space="md" className="items-center">
          <Text className="text-center text-sacred-white">{failureMessage}</Text>
          <Button onPress={() => router.replace('/auth')}>
            <ButtonText>Try again</ButtonText>
          </Button>
        </VStack>
      </Center>
    );
  }

  return (
    <Center className="flex-1 bg-obsidian">
      <BrandPulse accessibilityLabel="Completing sign-in" />
    </Center>
  );
}
