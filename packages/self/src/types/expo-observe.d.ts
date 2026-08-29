declare module 'expo-observe' {
  import * as React from 'react';
  export const Observe: {
    configure: (config: {
      environment?: string;
      sampleRate?: number;
      dispatchInDebug?: boolean;
      dispatchingEnabled?: boolean;
      integrations?: { expoRouter?: boolean };
    }) => void;
    logEvent: (name: string, options?: unknown) => void;
    reportError: (error: Error, context?: Record<string, unknown>) => void;
    dispatchEvents: () => void;
    markInteractive: (attributes?: Record<string, unknown>) => void;
  };
  export const ObserveRoot: React.ComponentType<{ children: React.ReactNode }>;
  export const ObserveErrorBoundary: React.ComponentType<{ children: React.ReactNode }>;
  export const ObserveInteractiveMarker: React.ComponentType<Record<string, unknown>>;
  export function useObserve(): {
    markInteractive: (attributes?: Record<string, unknown>) => void;
  };
}
