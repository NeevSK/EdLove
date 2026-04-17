import React, { useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import { useAuth } from '@repo/core';
import { supabase } from '@repo/core';
import { useQRDeepLink } from '@repo/scanner-kit';
import { navigationRef } from '../navigation/navigationRef';

export const DeepLinkProvider: React.FC<{ children: ReactNode }> => { children }) => {
  const { session } = useAuth();

  useEffect(() => {
    if (Platform.OS === 'web') return;

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
            refresh_token});
          if (error && (error.message?.includes('Refresh Token') || (error as { status?: number }).status === 400)) {
            await supabase.auth.signOut({ scope: 'local' });
          }
        }
      }
    };

    const subscription = Linking.addEventListener('url', (event) => handleDeepLink(event.url));
    Linking.getInitialURL().then((url) => { if (url) handleDeepLink(url); });
    
    return () => subscription.remove();
  }, []);

  useQRDeepLink((payload) => {
    if (navigationRef.isReady() && session) {
      navigationRef.navigate('QRHandler' as any, { payload } as any);
    }
  });

  return <>{children}</>;
};
