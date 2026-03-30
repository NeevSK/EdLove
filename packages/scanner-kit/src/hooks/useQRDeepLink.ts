/**
 * useQRDeepLink  Global listener for incoming gurudevi://qr deep links
 *
 * Relocated from @repo/ui to @repo/scanner-kit to keep design system pure.
 */

import { useEffect, useCallback, useRef } from 'react';
import { Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { resolveQR } from '@repo/ui';
import { type QRPayload } from '@repo/core';

export const PENDING_QR_KEY = 'pending_qr_action';

export type QRDeepLinkHandler = (payload: QRPayload) => void;

/**
 * Listen for QR deep links and dispatch them to the provided handler.
 * Safe to call before handler is ready  pending payloads are stored in AsyncStorage.
 */
export function useQRDeepLink(onQRAction?: QRDeepLinkHandler) {
  const handlerRef = useRef<QRDeepLinkHandler | undefined>(onQRAction);
  handlerRef.current = onQRAction;

  const dispatchOrStore = useCallback(async (url: string) => {
    if (!url.startsWith('gurudevi://qr')) return;
    const result = resolveQR(url);
    if (!result.ok) return;

    const handler = handlerRef.current;
    if (handler) {
      handler(result.payload);
    } else {
      // No handler yet (user not authenticated)  store for later
      await AsyncStorage.setItem(PENDING_QR_KEY, JSON.stringify(result.payload));
    }
  }, []);

  useEffect(() => {
    // Handle cold-start URL (app opened from outside via QR link).
    Linking.getInitialURL()
      .then((url) => {
        if (url) dispatchOrStore(url);
      })
      .catch(() => {
        // Safe to ignore
      });

    // Handle warm-resume URL (app already running, incoming deep link).
    const subscription = Linking.addEventListener('url', ({ url }) => {
      dispatchOrStore(url);
    });

    return () => subscription.remove();
  }, [dispatchOrStore]);
}

/**
 * Redeem any pending QR action stored in AsyncStorage.
 */
export async function redeemPendingQRAction(): Promise<QRPayload | null> {
  try {
    const raw = await AsyncStorage.getItem(PENDING_QR_KEY);
    if (!raw) return null;
    await AsyncStorage.removeItem(PENDING_QR_KEY);
    return JSON.parse(raw) as QRPayload;
  } catch {
    return null;
  }
}
