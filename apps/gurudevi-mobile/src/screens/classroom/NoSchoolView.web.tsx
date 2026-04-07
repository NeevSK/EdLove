/**
 * NoSchoolView.web.tsx
 */
import React from 'react';
import { ErrorBoundary } from '@repo/ui';
import { NoSchoolView as PackageNoSchoolView } from '@repo/classroom';

const NoSchoolView = (props: any) => (
  <ErrorBoundary name="Onboarding Wizard">
    <PackageNoSchoolView {...props} />
  </ErrorBoundary>
);

export default NoSchoolView;
