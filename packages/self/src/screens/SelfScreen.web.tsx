import { useFeatureStore } from '@repo/core/store/useFeatureStore';
import { useResponsiveRenderer } from '@repo/core/platform/useResponsiveRenderer';
import { WorkspaceRenderer } from '@repo/ui/components/workspace/WorkspaceRenderer';
import SelfScreen from '@repo/self/screens/SelfScreen';
import SelfScreenUnified from '@repo/self/screens/SelfScreen.unified';

/**
 * Web entry — thin wrapper. Same logic as native, platform-aware.
 * Behind flag `canvas.self.unified` renders unified canvas; else legacy role views via SelfScreen.
 */
export default function SelfScreenWeb() {
  const flags = useFeatureStore((s) => s.flags as unknown as Record<string, unknown>);
  const unifiedEnabled = flags['canvas.self.unified'] === true;
  const { platform, isNative, isResizing } = useResponsiveRenderer();

  const content = unifiedEnabled ? <SelfScreenUnified /> : <SelfScreen />;

  return (
    <WorkspaceRenderer platform={platform} isNative={isNative} isResizing={isResizing}>
      <div className="sanctuary-screen">
        <div className="sanctuary-container">{content}</div>
      </div>
    </WorkspaceRenderer>
  );
}
