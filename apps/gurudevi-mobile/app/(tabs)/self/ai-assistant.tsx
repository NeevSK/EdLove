import ErrorBoundary, { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';

import { AIAssistantRouteContent } from '@/routes/AIAssistantRouteContent';

export { RouteErrorBoundary as ErrorBoundary };

export default function SelfAIAssistantRoute() {
  return (
    <ErrorBoundary name="SelfAIAssistantRoute">
      <AIAssistantRouteContent />
    </ErrorBoundary>
  );
}
