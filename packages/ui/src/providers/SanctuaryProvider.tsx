import React, { ReactNode } from 'react';
import { EnvironmentProvider } from '../context/EnvironmentContext';
import { ToastProvider } from './ToastProvider';
import { ExternalLinkProvider } from '../context/ExternalLinkContext';
import { FABProvider } from '../context/FABContext';

interface SanctuaryProviderProps {
  children: ReactNode;
}

/**
 * SanctuaryProvider
 * 
 * The primary UI-layer provider for the Sanctuary Design System.
 * It orchestrates all necessary contexts for theme, environment, 
 * notifications, and interaction patterns.
 * 
 * Hierarchy:
 * 1. EnvironmentProvider: Fundamental reality & theme state.
 * 2. ToastProvider: UI-level notifications (depends on theme).
 * 3. ExternalLinkProvider: Shared link handling logic (depends on environment/toast/theme).
 * 4. FABProvider: Floating Action Button coordination (depends on theme).
 */
export const SanctuaryProvider: React.FC<SanctuaryProviderProps> = ({ children }) => {
  return (
    <EnvironmentProvider      <ToastProvider        <ExternalLinkProvider          <FABProvider            >{children}>
          </FABProvider        </ExternalLinkProvider      </ToastProvider    </EnvironmentProvider  );
};
