import { createWorkspaceRendererConfig } from '@repo/core/logic';
import type { WorkspaceRuntimePlatform } from '@repo/core/types';
import { Platform, useWindowDimensions } from 'react-native';
import { MobileWorkspaceCanvas } from '@/components/workspace/renderers/MobileWorkspaceCanvas';
import { TabletWorkspaceCanvas } from '@/components/workspace/renderers/TabletWorkspaceCanvas';
import { WebWorkspaceCanvas } from '@/components/workspace/renderers/WebWorkspaceCanvas';
import type { WorkspaceCanvasProps } from '@/components/workspace/types';

export function ResponsiveWorkspaceCanvas<
  TSurfaceId extends string = string,
  TCapabilityKey extends string = string,
>(props: WorkspaceCanvasProps<TSurfaceId, TCapabilityKey>) {
  const { width } = useWindowDimensions();

  const runtimePlatform: WorkspaceRuntimePlatform =
    Platform.OS === 'web' ? 'web' : Platform.OS === 'ios' ? 'ios' : 'android';

  const renderer = createWorkspaceRendererConfig({
    runtimePlatform,
    width,
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
