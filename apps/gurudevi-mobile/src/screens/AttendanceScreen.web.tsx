/**
 * AttendanceScreen.web.tsx
 *
 * Thin wrapper for the Classroom Attendance UI.
 * Orchestration and logic are managed in @repo/classroom.
 */

import { AttendanceScreenWeb } from '@repo/classroom';
import ErrorBoundary from '@repo/ui/components/ErrorBoundary';

const AttendanceScreen = (props: Record<string, unknown>) => {
  return (
    <ErrorBoundary name="Classroom Attendance">
      <AttendanceScreenWeb {...props} />
    </ErrorBoundary>
  );
};

export default AttendanceScreen;
