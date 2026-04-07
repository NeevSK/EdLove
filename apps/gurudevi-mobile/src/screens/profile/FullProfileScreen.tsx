/**
 * FullProfileScreen.tsx
 *
 * Thin wrapper for the detailed Profile View.
 */

import React from 'react';
import { ErrorBoundary } from '@repo/ui';
import { FullProfileScreen as PackageFullProfileScreen } from '@repo/profile';

const FullProfileWrapper = (props: any) => (
  <ErrorBoundary name="Detailed Profile">
    <PackageFullProfileScreen {...props} />
  </ErrorBoundary>
);

export default FullProfileWrapper;
