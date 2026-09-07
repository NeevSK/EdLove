import ErrorBoundary, { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { AIAssistantRouteContent } from '@/routes/AIAssistantRouteContent';

export { RouteErrorBoundary as ErrorBoundary };

export default function AIAssistantRoute() {
  return (
    <ErrorBoundary name="AIAssistantRoute">
      <AIAssistantRouteContent />
    </ErrorBoundary>
  );
}
