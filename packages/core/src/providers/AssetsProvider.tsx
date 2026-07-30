import type React from 'react';
import { type ReactNode, useEffect, useState } from 'react';
import { storage } from '@repo/core/lib/storage';
import { LanguageUtils } from '@repo/core/logic/utils/LanguageUtils';

/**
 * AssetsProvider: Handles initialization of static assets,
 * localization, and theme-related resources.
 */
export const AssetsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isReady, setIsReady] = useState(false);

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
        setIsReady(true);
      } catch (e) {
        console.warn('AssetsProvider failed to initialize:', e);
        setIsReady(true); // Proceed anyway to avoid total block
      }
    }

    initAssets().catch((e) => {
      console.error('AssetsProvider: Failed to initialize on mount', e);
    });
  }, []);

  if (!isReady) {
    return null; // Or a splash screen
  }

  return <>{children}</>;
};
