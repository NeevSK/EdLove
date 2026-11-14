import { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { UnbuiltPlace } from '@/components/navigation/UnbuiltPlace';

export { RouteErrorBoundary as ErrorBoundary };

/** The route stays so links keep working. The assistant comes back with the agents domain. */
export default function AIAssistantRoute() {
  return (
    <UnbuiltPlace
      title="The assistant is being rebuilt"
      message="Your companion will come back here."
    />
  );
}
