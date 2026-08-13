import { createWorkspaceRendererConfig } from '@repo/core/logic';
import type { WorkspaceRuntimePlatform } from '@repo/core/types';
import { resolveNativeRendererWidth } from '@repo/ui/components/layout';
import { MobileWorkspaceCanvas } from '@repo/ui/components/workspace/renderers/MobileWorkspaceCanvas';
import { TabletWorkspaceCanvas } from '@repo/ui/components/workspace/renderers/TabletWorkspaceCanvas';
import { WebWorkspaceCanvas } from '@repo/ui/components/workspace/renderers/WebWorkspaceCanvas';
import type { WorkspaceCanvasProps } from '@repo/ui/components/workspace/types';
import { useResponsive } from '@repo/ui/hooks/useResponsive';
import { Platform } from 'react-native';

export function ResponsiveWorkspaceCanvas<
  TSurfaceId extends string = string,
  TCapabilityKey extends string = string,
>(props: WorkspaceCanvasProps<TSurfaceId, TCapabilityKey>) {
  const { width, height } = useResponsive();

  const runtimePlatform: WorkspaceRuntimePlatform =
    Platform.OS === 'web' ? 'web' : Platform.OS === 'ios' ? 'ios' : 'android';

  const renderer = createWorkspaceRendererConfig({
    runtimePlatform,
    // The core resolver is width-based. Feed it an explicit mobile width for
    // native landscape phones so they stay in the readable stack renderer.
    width: runtimePlatform === 'web' ? width : resolveNativeRendererWidth(width, height),
  });

  if (renderer.platform === 'mobile') {
    return <MobileWorkspaceCanvas {...props} renderer={renderer} />;
  }

  if (renderer.platform === 'tablet') {
    return <TabletWorkspaceCanvas {...props} renderer={renderer} />;
  }

  return <WebWorkspaceCanvas {...props} renderer={renderer} />;
}

export default ResponsiveWorkspaceCanvas;
