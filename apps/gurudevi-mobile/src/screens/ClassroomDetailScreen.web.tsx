/**
 * ClassroomDetailScreen.web.tsx
 */
import React from 'react';
import { ErrorBoundary } from '@repo/ui';
import { ClassroomDetailScreenWeb } from '@repo/classroom';

const ClassroomDetailScreen = (props: any) => (
  <ErrorBoundary name="Classroom Details">
    <ClassroomDetailScreenWeb {...props} />
  </ErrorBoundary>
);

export default ClassroomDetailScreen;
