import { useAuth } from '@repo/core/logic';
import { supabase } from '@repo/core/native';

import { useQRDeepLink } from '@repo/scanner-kit';
import * as Linking from 'expo-linking';
import type React from 'react';
import { type ReactNode, useEffect } from 'react';
import { navigationRef } from '../navigation/navigationRef';

export const DeepLinkProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { session } = useAuth();

  useEffect(() => {
    // Sovereign Web Guard: Early return using web-native check
    if (typeof window !== 'undefined') return;

    const handleDeepLink = async (url: string) => {
      if (url.includes('auth/callback')) {
        const getParam = (name: string) => {
          const match = url.match(new RegExp(`[#?&]${name}=([^&]*)`));
          return match ? match[1] : null;
        };

        const access_token = getParam('access_token');
        const refresh_token = getParam('refresh_token');

        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          if (
            error &&
            (error.message?.includes('Refresh Token') ||
              (error as { status?: number }).status === 400)
          ) {
            await supabase.auth.signOut({ scope: 'local' });
          }
        }
      }
    };

    const subscription = Linking.addEventListener('url', (event) => handleDeepLink(event.url));
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink(url);
    });

    return () => subscription.remove();
  }, []);

  useQRDeepLink((payload) => {
    if (navigationRef.isReady() && session) {
      // Cast to a simpler interface to satisfy TSC while avoiding broad 'any'
      const nav = navigationRef as unknown as { navigate: (name: string, params?: object) => void };
      nav.navigate('QRHandler', { payload });
    }
  });

  return <>{children}</>;
};
