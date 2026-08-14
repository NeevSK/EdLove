import { storage } from '@repo/core/lib/storage';
import { LanguageUtils } from '@repo/core/logic/utils/LanguageUtils';
import type React from 'react';
import { type ReactNode, useEffect } from 'react';

/**
 * AssetsProvider: Handles initialization of static assets,
 * localization, and theme-related resources.
 */
export const AssetsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  useEffect(() => {
    async function initAssets() {
      try {
        LanguageUtils.setStorage({
          getItem: async (key: string) => {
            const value = storage.getString(key);
            if (value !== undefined) return value;

            return (await storage.getStringAsync(key)) ?? null;
          },
          setItem: async (key: string, value: string) => {
            storage.set(key, value);
          },
          removeItem: async (key: string) => {
            storage.delete(key);
          },
        });

        // Initialize Language
        await LanguageUtils.init();
      } catch (e) {
        console.warn('AssetsProvider failed to initialize:', e);
      }
    }

    initAssets().catch((e) => {
      console.error('AssetsProvider: Failed to initialize on mount', e);
    });
  }, []);

  // Language and asset hydration is non-critical for first paint. Keep the
  // app tree mounted so the shell can show its branded loading/fallback state
  // instead of leaving a blank root during slow or offline web startup.
  return <>{children}</>;
};
