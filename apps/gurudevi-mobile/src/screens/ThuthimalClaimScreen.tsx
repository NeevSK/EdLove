/**
 * ThuthimalClaimScreen.tsx
 */
import React from 'react';
import { ErrorBoundary } from '@repo/ui';
import { ThuthimalClaimScreen as PackageThuthimalClaimScreen } from '@repo/profile';

const ThuthimalWrapper = (props: any) => (
  <ErrorBoundary name="Thuthimal Claim">
    <PackageThuthimalClaimScreen {...props} />
  </ErrorBoundary>
);

export default ThuthimalWrapper;
