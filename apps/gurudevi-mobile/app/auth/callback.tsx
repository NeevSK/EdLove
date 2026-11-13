import { handleDeepLink } from '@repo/core/logic/deeplink/handleDeepLink.adapter';
import { ErrorState, WorldLoading } from '@repo/ui/components/native';
import { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { useGlobalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { createNativeAuthCallbackUrl } from '@/entry/authCallbackUrl';
import { useNavigator } from '@/navigation/navigator';

export { RouteErrorBoundary as ErrorBoundary };

export default function AuthCallbackRoute() {
  const router = useNavigator();
  const startedRef = useRef(false);
  const params = useGlobalSearchParams<Record<string, string | string[]>>();
  const [failureMessage, setFailureMessage] = useState<string | null>(null);

  useEffect(() => {
    if (startedRef.current) return;

    startedRef.current = true;
    const callbackUrl =
      Platform.OS === 'web' ? window.location.href : createNativeAuthCallbackUrl(params);

    let active = true;
    void handleDeepLink(callbackUrl)
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
      <ErrorState
        title="Sign-in did not finish"
        message={failureMessage}
        retry={{ label: 'Try again', onPress: () => router.replace('/auth') }}
        style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 24 }}
      />
    );
  }

  return <WorldLoading label="Completing sign-in" fullscreen />;
}
