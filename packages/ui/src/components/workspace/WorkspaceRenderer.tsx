import { WorkspaceRendererContext } from '@repo/ui/components/workspace/shared';
import { ReactNode, useContext } from 'react';
import { Platform } from 'react-native';

export interface WorkspaceRendererProps {
  platform?: 'mobile' | 'tablet' | 'web';
  isNative?: boolean;
  isResizing?: boolean;
  children: ReactNode;
}

export function WorkspaceRenderer({
  platform,
  isNative,
  isResizing,
  children,
}: WorkspaceRendererProps) {
  const context = useContext(WorkspaceRendererContext);

  // Use context values if provided, otherwise use props (for backwards compatibility)
  const runtimePlatform =
    platform ||
    context?.runtimePlatform ||
    (Platform.OS === 'web' ? 'web' : Platform.OS === 'ios' ? 'mobile' : 'mobile');
  const width = context?.width || 0;
  const height = context?.height || 0;
  const isNativeValue =
    isNative !== undefined ? isNative : (context?.isNative ?? Platform.OS !== 'web');
  const isResizingValue = isResizing !== undefined ? isResizing : context?.isResizing;

  const contextValue = {
    runtimePlatform,
    width,
    height,
    isNative: isNativeValue,
    isResizing: isResizingValue || false,
  };

  return (
    <WorkspaceRendererContext.Provider value={contextValue}>
      {children}
    </WorkspaceRendererContext.Provider>
  );
}
