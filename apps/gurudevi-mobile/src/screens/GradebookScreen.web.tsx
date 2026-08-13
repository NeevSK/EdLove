/**
 * GradebookScreen.web.tsx
 */
import { GradebookScreenWeb } from '@repo/classroom/gradebook';
import ErrorBoundary from '@repo/ui/components/ErrorBoundary';

const GradebookScreen = (props: Record<string, unknown>) => (
  <ErrorBoundary name="Classroom Gradebook">
    <GradebookScreenWeb {...props} />
  </ErrorBoundary>
);

export default GradebookScreen;
