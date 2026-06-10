/**
 * ClassroomDetailScreen.web.tsx
 */
import { ClassroomDetailScreenWeb } from '@repo/classroom';
import ErrorBoundary from '@repo/ui/components/ErrorBoundary';

const ClassroomDetailScreen = (props: Record<string, unknown>) => (
  <ErrorBoundary name="Classroom Details">
    <ClassroomDetailScreenWeb {...props} />
  </ErrorBoundary>
);

export default ClassroomDetailScreen;
