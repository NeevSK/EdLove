/**
 * SchoolCreationScreen.tsx
 *
 * Thin wrapper for the Admin School Creation UI.
 */

import React from 'react';
import { ErrorBoundary } from '@repo/ui';
import { SchoolCreationScreen } from '@repo/admin';

const SchoolCreationWrapper = (props: any) => (
  <ErrorBoundary name="School Creation">
    <SchoolCreationScreen {...props} />
  </ErrorBoundary>
);

export default SchoolCreationWrapper;
