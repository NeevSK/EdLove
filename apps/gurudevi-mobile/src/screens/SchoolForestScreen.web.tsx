/**
 * SchoolForestScreen.web.tsx
 *
 * Thin wrapper for the Classroom School Forest (Vibes) UI.
 */

import React from 'react';
import { ErrorBoundary } from '@repo/ui';
import { SchoolForestScreenWeb } from '@repo/admin';

const SchoolForestWrapper = (props: any) => (
  <ErrorBoundary name="School Forest">
    <SchoolForestScreenWeb {...props} />
  </ErrorBoundary>
);

export default SchoolForestWrapper;
