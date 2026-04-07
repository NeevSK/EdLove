/**
 * AttendanceScreen.web.tsx
 *
 * Thin wrapper for the Classroom Attendance UI.
 * Orchestration and logic are managed in @repo/classroom.
 */

import React from 'react';
import { ErrorBoundary } from '@repo/ui';
import { AttendanceScreenWeb } from '@repo/classroom';

const AttendanceScreen = (props: any) => {
  return (
    <ErrorBoundary name="Classroom Attendance">
      <AttendanceScreenWeb {...props} />
    </ErrorBoundary>
  );
};

export default AttendanceScreen;
