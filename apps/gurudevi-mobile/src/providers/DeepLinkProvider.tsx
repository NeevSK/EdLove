import { coreRuntime, deepLink, useAuth } from '@repo/core/logic';
import { dispatchQRDeepLink } from '@repo/scanner-kit';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { useCallback, useEffect } from 'react';
import { Platform } from 'react-native';

import { dispatchDeepLink } from '@/lib/deepLinks/dispatchDeepLink';
import { trackDeepLink } from '@/lib/deepLinks/trackDeepLink';
import { isQRDeepLink } from '@/lib/deepLinks/urlPolicy';

export function DeepLinkProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();

  const handleURL = useCallback(
    async (url: string): Promise<boolean> => {
      try {
        if (isQRDeepLink(url)) {
          return dispatchQRDeepLink(
            url,
            session
              ? (payload) =>
                  router.push({ pathname: '/qr', params: { payload: JSON.stringify(payload) } })
              : undefined,
          );
        }

        return await dispatchDeepLink(url, {
          handleURL: deepLink.handleURL.bind(deepLink),
          navigateToClassroomInvite: (inviteCode) => {
            router.push({ pathname: '/community', params: { inviteCode } });
          },
          track: trackDeepLink,
        });
      } catch {
        return false;
      }
    },
    [session],
  );

  useEffect(() => {
    if (Platform.OS === 'web') return;

    const subscription = coreRuntime.linking.addEventListener('url', ({ url }) => {
      void handleURL(url);
    });

    void coreRuntime.linking.getInitialURL().then((url) => {
      if (url) return handleURL(url);
      return false;
    });

    void coreRuntime.storage.getItem('deferred_deep_link').then(async (url) => {
      if (!url) return;
      if (await handleURL(url)) await coreRuntime.storage.removeItem('deferred_deep_link');
    });

    return () => subscription.remove();
  }, [handleURL]);

  return <>{children}</>;
}
