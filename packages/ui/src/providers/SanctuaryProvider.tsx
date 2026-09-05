import { CircadianProvider } from '@repo/ui/context/CircadianProvider';
import { EnvironmentProvider } from '@repo/ui/context/EnvironmentContext';
import { ExternalLinkProvider } from '@repo/ui/context/ExternalLinkContext';
import { FABProvider } from '@repo/ui/context/FABContext';
import { ErrorResolutionProvider } from '@repo/ui/providers/ErrorResolutionProvider';
import { ToastProvider } from '@repo/ui/providers/ToastProvider';
import type React from 'react';
import type { ReactNode } from 'react';

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
