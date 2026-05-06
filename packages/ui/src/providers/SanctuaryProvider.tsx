import type React from 'react';
import type { ReactNode } from 'react';
import { CircadianProvider } from '../context/CircadianProvider';
import { EnvironmentProvider } from '../context/EnvironmentContext';
import { ExternalLinkProvider } from '../context/ExternalLinkContext';
import { FABProvider } from '../context/FABContext';
import { ErrorResolutionProvider } from './ErrorResolutionProvider';
import { ToastProvider } from './ToastProvider';

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
          <ErrorResolutionProvider>
            <ExternalLinkProvider>
              <FABProvider>{children}</FABProvider>
            </ExternalLinkProvider>
          </ErrorResolutionProvider>
        </ToastProvider>
      </CircadianProvider>
    </EnvironmentProvider>
  );
};
