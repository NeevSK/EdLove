/**
 * TimetableScreen.web.tsx
 */
import { TimetableScreen } from '@repo/classroom';
import ErrorBoundary from '@repo/ui/components/ErrorBoundary';

const TimetableWrapper = (props: Record<string, unknown>) => (
  <ErrorBoundary name="Classroom Timetable">
    <TimetableScreen {...props} />
  </ErrorBoundary>
);

export default TimetableWrapper;
