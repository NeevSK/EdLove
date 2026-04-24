import React, { ReactNode } from 'react';
import { EnvironmentProvider } from '../context/EnvironmentContext';
import { ToastProvider } from './ToastProvider';
import { ExternalLinkProvider } from '../context/ExternalLinkContext';
import { FABProvider } from '../context/FABContext';
import { CircadianProvider } from '../context/CircadianProvider';

interface SanctuaryProviderProps {
  children: ReactNode;
}

/**
 * SanctuaryProvider
 *
 * The primary UI-layer provider for the Sanctuary Design System.
 * It orchestrates all necessary contexts for theme, environment,
 * notifications, and interaction patterns.
 */
export const SanctuaryProvider: React.FC<SanctuaryProviderProps> = ({ children }) => {
  return (
    <EnvironmentProvider>
      <CircadianProvider>
        <ToastProvider>
          <ExternalLinkProvider>
            <FABProvider>{children}</FABProvider>
          </ExternalLinkProvider>
        </ToastProvider>
      </CircadianProvider>
    </EnvironmentProvider>
  );
};
