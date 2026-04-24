/**
 * GradebookScreen.web.tsx
 */
import React from 'react';
import { ErrorBoundary } from '@repo/ui';
import { GradebookScreenWeb } from '@repo/classroom';

const GradebookScreen = (props: any) => (
  <ErrorBoundary name="Classroom Gradebook">
    <GradebookScreenWeb {...props} />
  </ErrorBoundary>
);

export default GradebookScreen;
