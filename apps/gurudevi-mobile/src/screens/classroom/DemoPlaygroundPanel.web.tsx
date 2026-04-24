/**
 * DemoPlaygroundPanel.web.tsx
 *
 * Thin wrapper for the Classroom Demo UI.
 */

import React from 'react';
import { ErrorBoundary } from '@repo/ui';
import { DemoPlaygroundPanel as PackageDemoPlaygroundPanel } from '@repo/classroom';

const DemoPlaygroundPanel = (props: any) => (
  <ErrorBoundary name="Demo Playground">
    <PackageDemoPlaygroundPanel {...props} />
  </ErrorBoundary>
);

export default DemoPlaygroundPanel;
