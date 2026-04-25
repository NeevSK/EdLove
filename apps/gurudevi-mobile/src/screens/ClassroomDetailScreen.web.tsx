/**
 * ClassroomDetailScreen.web.tsx
 */
import { ClassroomDetailScreenWeb } from '@repo/classroom';
import { ErrorBoundary } from '@repo/ui';

const ClassroomDetailScreen = (props: Record<string, unknown>) => (
  <ErrorBoundary name="Classroom Details">
    <ClassroomDetailScreenWeb {...props} />
  </ErrorBoundary>
);

export default ClassroomDetailScreen;
