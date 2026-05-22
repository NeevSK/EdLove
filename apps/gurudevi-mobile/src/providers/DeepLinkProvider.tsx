import { coreRuntime, DeepLinkType, deepLink, useAuth } from '@repo/core/logic';
import { useQRDeepLink } from '@repo/scanner-kit';
import type React from 'react';
import { type ReactNode, useEffect } from 'react';
import { Platform } from 'react-native';
import { navigationRef } from '../navigation/navigationRef';

/**
 * DeepLinkProvider
 *
 * Future-Proof Sovereign Interceptor for Deep Links.
 * This provider listens to native 'url' events and dispatches them to the
 * sovereign DeepLinkManager in core logic.
 */
export const DeepLinkProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { session } = useAuth();

  useEffect(() => {
    if (Platform.OS === 'web') return;

    const handleURL = async (url: string) => {
      const result = await deepLink.handleURL(url);

      // If the manager didn't fully handle it (e.g. it's a navigation link)
      // we can perform shell-specific actions here.
      if (!result.isHandled) {
        if (result.type === DeepLinkType.CLASSROOM_INVITE) {
          // Example: Navigate to a specific screen
          if (navigationRef.isReady()) {
            const nav = navigationRef as unknown as {
              navigate: (name: string, params?: object) => void;
            };
            nav.navigate('ClassroomInvite', { code: result.params.inviteCode });
          }
        }
      }
    };

    const subscription = coreRuntime.linking.addEventListener('url', (event) => {
      void handleURL(event.url);
    });

    // Handle cold start
    void coreRuntime.linking.getInitialURL().then((url) => {
      if (url) void handleURL(url);
    });

    return () => subscription.remove();
  }, []);

  useQRDeepLink((payload) => {
    if (navigationRef.isReady() && session) {
      const nav = navigationRef as unknown as {
        navigate: (name: string, params?: object) => void;
      };
      nav.navigate('QRHandler', { payload });
    }
  });

  return <>{children}</>;
};
