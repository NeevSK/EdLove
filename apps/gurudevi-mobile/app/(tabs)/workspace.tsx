import { ClassroomScreen } from '@repo/classroom';
import ErrorBoundary from '@repo/ui/components/ErrorBoundary';

export default function WorkspaceRoute() {
  return (
    <ErrorBoundary name="Workspace Route">
      <ClassroomScreen />
    </ErrorBoundary>
  );
}
