/**
 * TimetableScreen.web.tsx
 */
import React from 'react';
import { ErrorBoundary } from '@repo/ui';
import { TimetableScreen } from '@repo/classroom';

const TimetableWrapper = (props: any) => (
  <ErrorBoundary name="Classroom Timetable">
    <TimetableScreen {...props} />
  </ErrorBoundary>
);

export default TimetableWrapper;
