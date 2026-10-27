import { usePermissions } from '@repo/core/logic';
import { useFeatureStore } from '@repo/core/store';
import type React from 'react';
import { useEffect } from 'react';

export interface FeatureProviderProps {
  children: React.ReactNode;
}

export const FeatureProvider: React.FC<FeatureProviderProps> = ({ children }) => {
  const { context } = usePermissions();
  const bindContext = useFeatureStore((state) => state.bindContext);

  useEffect(() => {
    if (!context) return undefined;
    return bindContext(context);
  }, [context, bindContext]);

  return <>{children}</>;
};
