import { useResponsiveRenderer } from '@repo/core/platform/useResponsiveRenderer';
import SelfScreenUnified from '@repo/self/screens/SelfScreen.unified';
import ErrorBoundary from '@repo/ui/components/ErrorBoundary';
import { WorkspaceRenderer } from '@repo/ui/components/workspace/WorkspaceRenderer';

/**
 * Web entry — platform-aware responsive wrapper.
 * Canonical polymorphic workspace canvas for web surfaces.
 */
export default function SelfScreenWeb() {
  return (
    <ErrorBoundary name="SelfScreenWeb">
      <SelfScreenWebContent />
    </ErrorBoundary>
  );
}

function SelfScreenWebContent() {
  const { platform, isNative, isResizing } = useResponsiveRenderer();

  return (
    <WorkspaceRenderer platform={platform} isNative={isNative} isResizing={isResizing}>
      <div className="sanctuary-screen">
        <div className="sanctuary-container">
          <SelfScreenUnified />
        </div>
      </div>
    </WorkspaceRenderer>
  );
}
