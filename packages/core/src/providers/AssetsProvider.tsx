import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { LanguageUtils } from '../utils/LanguageUtils';

/**
 * AssetsProvider: Handles initialization of static assets, 
 * localization, and theme-related resources.
 */
export const AssetsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function initAssets() {
      try {
        // Initialize Language
        await LanguageUtils.init();
        setIsReady(true);
      } catch (e) {
        console.warn('AssetsProvider failed to initialize:', e);
        setIsReady(true); // Proceed anyway to avoid total block
      }
    }

    initAssets();
  }, []);

  if (!isReady) {
      return null; // Or a splash screen
  }

  return <>{children}</>;
};
